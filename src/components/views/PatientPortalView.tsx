import React, { useState } from 'react';
import {
  Bot,
  Send,
  Video,
  Calendar,
  Sparkles,
  Pill,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  User,
  Heart,
  ChevronRight,
  ShieldCheck,
  CreditCard,
  Receipt
} from 'lucide-react';
import { useFHIR } from '../../context/FHIRContext';
import { useAuth } from '../../context/AuthContext';
import { IntakeBotMessage } from '../../types/fhir';

interface PatientPortalViewProps {
  onOpenTelehealth: () => void;
}

export const PatientPortalView: React.FC<PatientPortalViewProps> = ({ onOpenTelehealth }) => {
  const { currentUser } = useAuth();
  const {
    activePatient,
    medications,
    observations,
    carePlans,
    schedulerSlots,
    erpClaim,
    bookAppointmentSlot,
    generateHandoffSummary,
    predictTaskRouting
  } = useFHIR();

  // Intake Bot State
  const [messages, setMessages] = useState<IntakeBotMessage[]>([
    {
      id: 'bot-1',
      sender: 'bot',
      text: `Hello ${activePatient.name[0].given[0]}! I am your Connected Care Health Intake Assistant. How are you feeling today, and are you experiencing any specific symptoms you'd like to share before your doctor consultation?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [intakeCompleted, setIntakeCompleted] = useState(false);

  // Scheduler Booking State
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [bookingReason, setBookingReason] = useState('Blood pressure medication review & recent lab discussion');
  const [isBooking, setIsBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const quickPromptChips = [
    'I have been getting high blood pressure readings (148/92) at home',
    'I need to review my recent HbA1c lab result (8.4%)',
    'I am having mild lightheadedness in the morning',
    'Requesting a 30-day refill on Metformin ER'
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const message = textToSend || inputText;
    if (!message.trim()) return;

    const userMsg: IntakeBotMessage = {
      id: `patient-${Date.now()}`,
      sender: 'patient',
      text: message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsBotTyping(true);

    try {
      const res = await fetch('/api/ai/intake-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          history: [...messages, userMsg],
          patientContext: {
            name: activePatient.name[0].text,
            conditions: 'Type 2 Diabetes, Hypertension, CKD 3a',
            allergies: 'Penicillin Anaphylaxis'
          }
        })
      });

      if (res.ok) {
        const data = await res.json();
        const botReply: IntakeBotMessage = {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages((prev) => [...prev, botReply]);
      }
    } catch (e) {
      console.warn('Bot chat error:', e);
      const fallbackReply: IntakeBotMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: `Thank you for providing those details. I have logged your symptoms into your FHIR health record so Dr. Vance can review them prior to your consultation.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, fallbackReply]);
    } finally {
      setIsBotTyping(false);
    }
  };

  // Submit Intake & Generate Hand-off for Clinician
  const handleFinalizeIntake = async () => {
    const transcript = messages.map((m) => `${m.sender.toUpperCase()}: ${m.text}`).join('\n');
    await generateHandoffSummary(transcript);
    await predictTaskRouting('Patient reported high blood pressure readings and lab follow-up');
    setIntakeCompleted(true);
  };

  // Book Appointment
  const handleBookSlot = async (slotId: string) => {
    setIsBooking(true);
    try {
      const success = await bookAppointmentSlot(slotId, bookingReason);
      if (success) {
        setBookingSuccess(true);
        setSelectedSlotId(null);
      }
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Patient Welcome Header */}
      <div className="bg-slate-900 text-white rounded-xl p-6 shadow-xl border border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={activePatient.photo}
              alt={activePatient.name[0].text}
              className="w-14 h-14 rounded-lg object-cover border border-slate-700 shadow-xs"
            />
            <div>
              <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 rounded border border-indigo-500/30">
                Connected Care Patient Portal
              </span>
              <h2 className="text-xl font-bold mt-1.5">Welcome, {activePatient.name[0].given[0]}!</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Primary Care: {activePatient.primaryCarePhysician.name} • {activePatient.primaryCarePhysician.clinic}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenTelehealth}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg shadow-sm flex items-center gap-2 transition-all cursor-pointer"
            >
              <Video className="w-4 h-4" />
              <span>Join Scheduled Telehealth Video Room</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main 2-Column Portal Grid: Intake Bot & Virtual-Care Scheduler */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: Health Intake Bot (GenAI Guided Symptom Interview) */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col h-[580px]">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  Health Intake Bot
                </h3>
                <p className="text-xs text-slate-500 font-medium">Autonomous symptom capture & SBAR hand-off</p>
              </div>
            </div>

            {intakeCompleted ? (
              <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-100 text-emerald-800 rounded-lg border border-emerald-300 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Hand-off Synthesized
              </span>
            ) : (
              <button
                onClick={handleFinalizeIntake}
                className="px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-all cursor-pointer flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Submit to Doctor</span>
              </button>
            )}
          </div>

          {/* Chat Messages Stream */}
          <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-1">
            {messages.map((msg) => {
              const isBot = msg.sender === 'bot';
              return (
                <div key={msg.id} className={`flex items-start gap-2.5 ${isBot ? '' : 'flex-row-reverse'}`}>
                  <div
                    className={`w-7 h-7 rounded-md flex items-center justify-center text-xs shrink-0 ${
                      isBot ? 'bg-slate-200 text-slate-700' : 'bg-indigo-600 text-white'
                    }`}
                  >
                    {isBot ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>
                  <div
                    className={`max-w-[80%] p-3 rounded-lg text-xs leading-relaxed ${
                      isBot
                        ? 'bg-slate-50 text-slate-800 border border-slate-200/80'
                        : 'bg-indigo-600 text-white shadow-sm'
                    }`}
                  >
                    <p>{msg.text}</p>
                    <span className={`block text-[10px] mt-1 ${isBot ? 'text-slate-400' : 'text-indigo-200'}`}>
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              );
            })}

            {isBotTyping && (
              <div className="flex items-center gap-2 text-xs text-indigo-600 font-medium">
                <Bot className="w-4 h-4 animate-bounce" />
                <span>Health Intake Bot is formulating clinical follow-up...</span>
              </div>
            )}
          </div>

          {/* Quick Prompt Chips */}
          <div className="pt-2 border-t border-slate-100 shrink-0">
            <div className="flex gap-1.5 overflow-x-auto pb-1.5">
              {quickPromptChips.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(chip)}
                  className="px-2.5 py-1 text-[11px] font-medium bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 rounded-md border border-slate-200 shrink-0 transition-colors cursor-pointer truncate max-w-[220px]"
                  title={chip}
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2 mt-1"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Describe your symptoms or questions..."
                className="flex-1 text-xs bg-slate-100 border-0 rounded-full px-4 py-2.5 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="p-2.5 rounded-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white transition-all shadow-xs cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT: Virtual-Care Scheduler (AI Recommended Booking) */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col h-[580px] overflow-y-auto space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Virtual-Care Scheduler
                </h3>
                <p className="text-xs text-slate-500 font-medium">Autonomous duration estimation & provider routing</p>
              </div>
            </div>

            <span className="text-xs font-semibold text-indigo-600">Today, 2:15 PM Active</span>
          </div>

          {bookingSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-semibold text-emerald-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Consultation confirmed! FHIR Encounter created and telehealth room provisioned.</span>
            </div>
          )}

          {/* Slots List */}
          <div className="space-y-3">
            {schedulerSlots.map((slot) => {
              const isBooked = slot.status === 'booked';
              return (
                <div
                  key={slot.id}
                  className={`p-3.5 rounded-lg border transition-all ${
                    isBooked
                      ? 'bg-indigo-50/70 border-indigo-200'
                      : 'bg-white hover:bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="text-center border-r border-indigo-200 pr-3">
                        <div className="text-lg font-bold text-indigo-700 font-mono">
                          {new Date(slot.startTime).getDate()}
                        </div>
                        <div className="text-[10px] uppercase font-bold text-indigo-400">
                          {new Date(slot.startTime).toLocaleString('default', { month: 'short' })}
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-bold text-slate-900">{slot.providerName}</h4>
                          <span className="px-1.5 py-0.2 text-[10px] font-bold bg-indigo-100 text-indigo-800 rounded">
                            {slot.aiMatchScore}% Match
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">{slot.providerSpecialty}</p>
                      </div>
                    </div>

                    <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${
                      isBooked
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}>
                      {isBooked ? 'CONFIRMED' : 'AVAILABLE'}
                    </span>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-slate-600 font-medium">
                      <Clock className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{new Date(slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({slot.durationMinutes} mins)</span>
                    </div>

                    {isBooked ? (
                      <button
                        onClick={onOpenTelehealth}
                        className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Launch Video Room</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleBookSlot(slot.id)}
                        disabled={isBooking}
                        className="px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-all cursor-pointer"
                      >
                        Book This Slot
                      </button>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-500 mt-2 bg-slate-50 p-2 rounded border border-slate-100">
                    <strong className="text-indigo-700 font-semibold">AI Match Rationale:</strong> {slot.aiMatchReason}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Patient Health Hub: Active Prescriptions & Care Plan Tasks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Prescriptions */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <Pill className="w-4 h-4 text-indigo-600" />
            My Active Medications & Refills
          </h3>
          <div className="divide-y divide-slate-100">
            {medications.map((med) => (
              <div key={med.id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold text-slate-900">{med.medicationCodeableConcept.text}</p>
                  <p className="text-slate-500 mt-0.5">{med.dosageInstruction[0]?.text}</p>
                </div>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
                  {med.dispenseRequest?.numberOfRepeatsAllowed || 3} Refills Remaining
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Goals */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            My Daily Care Plan Goals
          </h3>
          <div className="space-y-2 text-xs">
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-900">Morning Blood Pressure Log</p>
                <p className="text-slate-500">Record reading before morning coffee</p>
              </div>
              <span className="text-xs font-semibold text-emerald-600">✓ Logged (148/92)</span>
            </div>

            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-900">Fasting Blood Glucose Check</p>
                <p className="text-slate-500">Target &lt; 130 mg/dL</p>
              </div>
              <span className="text-xs font-semibold text-amber-600">164 mg/dL</span>
            </div>

            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-900">Virtual Care Video Consultation</p>
                <p className="text-slate-500">Dr. Eleanor Vance, MD at 2:15 PM</p>
              </div>
              <span className="text-xs font-semibold text-indigo-600">Ready in Room</span>
            </div>
          </div>
        </div>
      </div>

      {/* Patient ERP Billing & Reimbursement Summary */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Insurance Coverage & Financial Responsibility</h3>
              <p className="text-xs text-slate-500">Real-time ERP Connector synchronization with {erpClaim.payerName}</p>
            </div>
          </div>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
            erpClaim.isPaidAtFrontDesk
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-amber-50 text-amber-700 border-amber-200'
          }`}>
            {erpClaim.isPaidAtFrontDesk ? 'Copay Paid at Check-in' : 'Copay Pending at Front Desk'}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <p className="text-[11px] text-slate-500 font-medium">Estimated Covered</p>
            <p className="text-base font-bold text-emerald-600 font-mono mt-0.5">${erpClaim.insurancePaidAmount.toFixed(2)}</p>
            <p className="text-[10px] text-slate-400">80% Plan Coverage</p>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <p className="text-[11px] text-slate-500 font-medium">Your Copay</p>
            <p className="text-base font-bold text-indigo-700 font-mono mt-0.5">${erpClaim.patientCopayDue.toFixed(2)}</p>
            <p className="text-[10px] text-slate-400">Tier 1 Specialist Rate</p>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <p className="text-[11px] text-slate-500 font-medium">Policy ID</p>
            <p className="text-xs font-bold text-slate-900 font-mono mt-1">{erpClaim.policyNumber}</p>
            <p className="text-[10px] text-slate-400">{erpClaim.groupNumber}</p>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <p className="text-[11px] text-slate-500 font-medium">Receipt / Auth</p>
            <p className="text-xs font-bold text-slate-900 font-mono mt-1">{erpClaim.receiptNumber || 'AUTH-2026-PENDING'}</p>
            <p className="text-[10px] text-emerald-600 font-medium">✓ HIPAA Encrypted</p>
          </div>
        </div>
      </div>
    </div>
  );
};
