import React, { useState } from 'react';
import {
  Activity,
  Heart,
  Pill,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Plus,
  ShieldCheck,
  Stethoscope,
  ListTodo,
  TrendingUp,
  RotateCcw,
  Zap,
  Sparkles
} from 'lucide-react';
import { useFHIR } from '../../context/FHIRContext';
import { useAuth } from '../../context/AuthContext';

export const NurseView: React.FC = () => {
  const { currentUser } = useAuth();
  const {
    activePatient,
    observations,
    medications,
    carePlans,
    handoffSummary,
    predictiveRouting,
    updateMARStatus,
    updateCarePlanActivity,
    recordObservation
  } = useFHIR();

  // Vitals capture state
  const [showVitalsModal, setShowVitalsModal] = useState(false);
  const [systolic, setSystolic] = useState('146');
  const [diastolic, setDiastolic] = useState('90');
  const [heartRate, setHeartRate] = useState('82');
  const [spo2, setSpo2] = useState('98');
  const [respRate, setRespRate] = useState('16');
  const [temp, setTemp] = useState('98.6');

  // MEWS Calculator State
  const [mewsResp, setMewsResp] = useState<number>(16);
  const [mewsHR, setMewsHR] = useState<number>(82);
  const [mewsSys, setMewsSys] = useState<number>(146);
  const [mewsTemp, setMewsTemp] = useState<number>(98.6);
  const [mewsAvpu, setMewsAvpu] = useState<'A' | 'V' | 'P' | 'U'>('A');

  // Calculate MEWS Score
  const calculateMEWS = () => {
    let score = 0;
    // Resp Rate: <9: 2, 9-14: 0, 15-20: 1, 21-29: 2, >=30: 3
    if (mewsResp < 9) score += 2;
    else if (mewsResp >= 15 && mewsResp <= 20) score += 1;
    else if (mewsResp >= 21 && mewsResp <= 29) score += 2;
    else if (mewsResp >= 30) score += 3;

    // Heart Rate: <40: 2, 41-50: 1, 51-100: 0, 101-110: 1, 111-129: 2, >=130: 3
    if (mewsHR < 40) score += 2;
    else if (mewsHR >= 41 && mewsHR <= 50) score += 1;
    else if (mewsHR >= 101 && mewsHR <= 110) score += 1;
    else if (mewsHR >= 111 && mewsHR <= 129) score += 2;
    else if (mewsHR >= 130) score += 3;

    // Systolic BP: <70: 3, 71-80: 2, 81-100: 1, 101-199: 0, >=200: 2
    if (mewsSys < 70) score += 3;
    else if (mewsSys >= 71 && mewsSys <= 80) score += 2;
    else if (mewsSys >= 81 && mewsSys <= 100) score += 1;
    else if (mewsSys >= 200) score += 2;

    // Consciousness AVPU
    if (mewsAvpu === 'V') score += 1;
    if (mewsAvpu === 'P') score += 2;
    if (mewsAvpu === 'U') score += 3;

    return score;
  };

  const mewsScore = calculateMEWS();

  const getMEWSRisk = (score: number) => {
    if (score >= 5) return { label: 'HIGH RISK (Immediate Escalation Required)', color: 'bg-rose-100 text-rose-800 border-rose-300' };
    if (score >= 3) return { label: 'MODERATE RISK (Increase Monitoring Frequency)', color: 'bg-amber-100 text-amber-800 border-amber-300' };
    return { label: 'LOW RISK (Stable Routine Monitoring)', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
  };

  const handleSaveVitals = async (e: React.FormEvent) => {
    e.preventDefault();
    // Record Blood Pressure Observation
    await recordObservation({
      category: 'vital-signs',
      code: { coding: [{ system: 'http://loinc.org', code: '85354-9', display: 'Blood pressure panel' }], text: 'Blood Pressure' },
      component: [
        { code: { text: 'Systolic BP' }, valueQuantity: { value: Number(systolic), unit: 'mmHg' } },
        { code: { text: 'Diastolic BP' }, valueQuantity: { value: Number(diastolic), unit: 'mmHg' } }
      ],
      interpretation: { coding: [{ system: 'http://terminology.hl7.org', code: Number(systolic) > 140 ? 'H' : 'N', display: Number(systolic) > 140 ? 'High' : 'Normal' }] }
    });

    // Record Heart Rate Observation
    await recordObservation({
      category: 'vital-signs',
      code: { coding: [{ system: 'http://loinc.org', code: '8867-4', display: 'Heart rate' }], text: 'Heart Rate' },
      valueQuantity: { value: Number(heartRate), unit: 'beats/min' }
    });

    setShowVitalsModal(false);
  };

  const currentCarePlan = carePlans[0];

  return (
    <div className="space-y-6">
      {/* Nurse Shift Handover & Bedside Triage Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <h2 className="text-lg font-bold text-slate-900">Nurse Triage & Shift Coordination Console</h2>
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
              Coordinator: {currentUser.name}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Active Patient: <strong className="text-slate-700">{activePatient.name[0].text}</strong> ({activePatient.identifier[0].value}) • Location: Ambulatory Care Bay 2
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowVitalsModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Record New Vitals (FHIR)</span>
          </button>
        </div>
      </div>

      {/* Grid: MEWS Triage Score + Hand-off Acuity Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive MEWS Calculator Widget */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              MEWS Triage Risk Engine
            </h3>
            <span className="text-[10px] font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600">
              Protocol v4.2
            </span>
          </div>

          <div className={`p-3.5 rounded-xl border ${getMEWSRisk(mewsScore).color} flex items-center justify-between`}>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider">Early Warning Score:</p>
              <p className="text-xs font-semibold mt-0.5">{getMEWSRisk(mewsScore).label}</p>
            </div>
            <div className="text-3xl font-black">{mewsScore}</div>
          </div>

          {/* Quick parameter sliders */}
          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>Systolic BP:</span>
                <span className="font-mono">{mewsSys} mmHg</span>
              </div>
              <input
                type="range"
                min="60"
                max="220"
                value={mewsSys}
                onChange={(e) => setMewsSys(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>Heart Rate:</span>
                <span className="font-mono">{mewsHR} bpm</span>
              </div>
              <input
                type="range"
                min="35"
                max="160"
                value={mewsHR}
                onChange={(e) => setMewsHR(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>Respiratory Rate:</span>
                <span className="font-mono">{mewsResp} /min</span>
              </div>
              <input
                type="range"
                min="6"
                max="40"
                value={mewsResp}
                onChange={(e) => setMewsResp(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            <div>
              <span className="block font-semibold text-slate-700 mb-1">Consciousness (AVPU):</span>
              <div className="grid grid-cols-4 gap-1">
                {(['A', 'V', 'P', 'U'] as const).map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setMewsAvpu(level)}
                    className={`py-1.5 text-xs font-bold rounded-lg border transition-colors ${
                      mewsAvpu === level
                        ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200'
                    }`}
                  >
                    {level === 'A' ? 'Alert' : level === 'V' ? 'Voice' : level === 'P' ? 'Pain' : 'Unresp'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Medication Administration Record (MAR) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Pill className="w-4 h-4 text-emerald-600" />
                Medication Administration Record (MAR)
              </h3>
              <p className="text-xs text-slate-500">Live bedside medication verification & administration log</p>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              Shift: 07:00 - 19:00
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {medications.map((med) => (
              <div key={med.id} className="py-3.5 flex items-start justify-between flex-wrap gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{med.medicationCodeableConcept.text}</span>
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase ${
                      med.marStatus === 'given'
                        ? 'bg-emerald-100 text-emerald-800'
                        : med.marStatus === 'held'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {med.marStatus || 'Due'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">{med.dosageInstruction[0]?.text}</p>
                  {med.lastAdministeredTime && (
                    <p className="text-[11px] text-slate-400 font-mono">
                      Last administered: {new Date(med.lastAdministeredTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateMARStatus(med.id, 'given')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1 cursor-pointer ${
                      med.marStatus === 'given'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{med.marStatus === 'given' ? 'Given ✓' : 'Administer'}</span>
                  </button>

                  <button
                    onClick={() => updateMARStatus(med.id, 'held')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                      med.marStatus === 'held'
                        ? 'bg-rose-600 text-white'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    Hold
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Care Plan Action Checklist & Task Tracker */}
      {currentCarePlan && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <ListTodo className="w-4 h-4 text-indigo-600" />
                Active Care Plan Tasks ({currentCarePlan.title})
              </h3>
              <p className="text-xs text-slate-500">Structured FHIR CarePlan multidisciplinary activities</p>
            </div>
            <span className="text-xs font-semibold text-slate-600">
              {currentCarePlan.activity.filter((a) => a.detail.status === 'completed').length} of {currentCarePlan.activity.length} Completed
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {currentCarePlan.activity.map((act) => {
              const isCompleted = act.detail.status === 'completed';
              return (
                <div
                  key={act.id}
                  className={`p-3.5 rounded-lg border transition-all flex items-start justify-between gap-3 ${
                    isCompleted ? 'bg-emerald-50/50 border-emerald-200' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-semibold ${isCompleted ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                        {act.detail.code.text}
                      </span>
                      <span className="px-2 py-0.5 text-[10px] font-semibold bg-white rounded border border-slate-200 text-slate-600">
                        {act.detail.assignedRole}
                      </span>
                    </div>
                    {act.detail.description && (
                      <p className="text-xs text-slate-600">{act.detail.description}</p>
                    )}
                    {act.detail.scheduledTiming && (
                      <p className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {act.detail.scheduledTiming}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() =>
                      updateCarePlanActivity(
                        currentCarePlan.id,
                        act.id,
                        isCompleted ? 'in-progress' : 'completed'
                      )
                    }
                    className={`w-6 h-6 rounded-md border flex items-center justify-center transition-colors cursor-pointer shrink-0 mt-0.5 ${
                      isCompleted
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'bg-white border-slate-300 hover:border-indigo-500'
                    }`}
                  >
                    {isCompleted && <CheckCircle2 className="w-4 h-4" />}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ERP Nursing Charge Capture & Supply Reconciliation */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs">
              ERP
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Bedside Nursing Charge Capture & ERP Supply Audit</h3>
              <p className="text-xs text-slate-500">Automated CPT & HCPCS service reconciliation for billing</p>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            Real-time HL7/X12 Sync
          </span>
        </div>

        <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
            <div>
              <p className="font-semibold text-slate-900">CPT 96372</p>
              <p className="text-slate-500 text-[11px]">Therapeutic/Diag Injection</p>
            </div>
            <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-100 text-emerald-800 rounded">
              Logged ($45.00)
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
            <div>
              <p className="font-semibold text-slate-900">CPT 36415</p>
              <p className="text-slate-500 text-[11px]">Routine Venipuncture</p>
            </div>
            <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-100 text-emerald-800 rounded">
              Logged ($20.00)
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
            <div>
              <p className="font-semibold text-slate-900">A4253</p>
              <p className="text-slate-500 text-[11px]">Blood Glucose Test Strips</p>
            </div>
            <span className="px-2 py-0.5 text-[10px] font-semibold bg-indigo-100 text-indigo-800 rounded">
              Dispensed
            </span>
          </div>
        </div>
      </div>

      {/* RECORD VITALS MODAL */}
      {showVitalsModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-600" />
                Capture Bedside Vitals (FHIR Observation)
              </h3>
              <button onClick={() => setShowVitalsModal(false)} className="text-slate-400 hover:text-slate-600 text-lg leading-none cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveVitals} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Systolic BP (mmHg)</label>
                  <input
                    type="number"
                    value={systolic}
                    onChange={(e) => setSystolic(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Diastolic BP (mmHg)</label>
                  <input
                    type="number"
                    value={diastolic}
                    onChange={(e) => setDiastolic(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Heart Rate (bpm)</label>
                  <input
                    type="number"
                    value={heartRate}
                    onChange={(e) => setHeartRate(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">SpO2 (%)</label>
                  <input
                    type="number"
                    value={spo2}
                    onChange={(e) => setSpo2(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Resp Rate (/min)</label>
                  <input
                    type="number"
                    value={respRate}
                    onChange={(e) => setRespRate(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Temperature (°F)</label>
                  <input
                    type="text"
                    value={temp}
                    onChange={(e) => setTemp(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowVitalsModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-xs cursor-pointer"
                >
                  Log to FHIR Vitals Store
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
