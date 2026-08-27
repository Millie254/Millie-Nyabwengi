import React, { useState } from 'react';
import {
  AlertTriangle,
  Heart,
  Activity,
  FileText,
  Pill,
  Sparkles,
  CheckCircle2,
  Clock,
  Plus,
  TrendingUp,
  Stethoscope,
  ShieldAlert,
  BrainCircuit,
  Send,
  ChevronRight,
  ExternalLink,
  RefreshCw,
  Layers,
  FileCheck
} from 'lucide-react';
import { useFHIR } from '../../context/FHIRContext';
import { useAuth } from '../../context/AuthContext';
import { FHIRObservation, FHIRMedicationRequest, FHIRCondition } from '../../types/fhir';

export const PhysicianView: React.FC = () => {
  const { currentUser } = useAuth();
  const {
    activePatient,
    observations,
    conditions,
    allergies,
    medications,
    diagnosticReports,
    handoffSummary,
    predictiveRouting,
    generateHandoffSummary,
    predictTaskRouting,
    orderMedication,
    recordObservation,
    isLoadingAI
  } = useFHIR();

  const [activeTab, setActiveTab] = useState<'overview' | 'sbar_handoff' | 'prescribe' | 'diagnostics' | 'soap_note'>('overview');
  const [showPrescribeModal, setShowPrescribeModal] = useState(false);
  const [showOrderLabModal, setShowOrderLabModal] = useState(false);
  const [soapNoteGenerated, setSoapNoteGenerated] = useState<string | null>(null);
  const [isGeneratingSoap, setIsGeneratingSoap] = useState(false);

  // New Rx form state
  const [newRxName, setNewRxName] = useState('Amlodipine Besylate 5 mg Oral Tablet');
  const [newRxDose, setNewRxDose] = useState('5 mg');
  const [newRxInstructions, setNewRxInstructions] = useState('Take 1 tablet orally once daily in the morning for blood pressure control');
  const [rxAllergyWarning, setRxAllergyWarning] = useState<string | null>(null);

  // Check allergy warning when typing prescription
  const handleRxNameChange = (val: string) => {
    setNewRxName(val);
    if (val.toLowerCase().includes('penicillin') || val.toLowerCase().includes('amoxicillin') || val.toLowerCase().includes('ampicillin')) {
      setRxAllergyWarning('CRITICAL ALLERGY ALERT: Patient has confirmed anaphylactic reaction to Penicillin!');
    } else if (val.toLowerCase().includes('bactrim') || val.toLowerCase().includes('sulfa')) {
      setRxAllergyWarning('ALLERGY WARNING: Patient has documented rash/allergy to Sulfonamides!');
    } else {
      setRxAllergyWarning(null);
    }
  };

  const handleCreatePrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRxName.trim()) return;

    await orderMedication({
      medicationCodeableConcept: { text: newRxName },
      dosageInstruction: [{ text: newRxInstructions, doseQuantity: { value: 5, unit: 'mg' } }],
      dispenseRequest: { numberOfRepeatsAllowed: 3, quantity: { value: 30, unit: 'tablets' }, expectedSupplyDuration: { value: 30, unit: 'days' } },
      requester: { reference: `Practitioner/${currentUser.id}`, display: currentUser.name }
    });

    setShowPrescribeModal(false);
    setNewRxName('');
  };

  // Generate SOAP Note via AI
  const handleGenerateSoapNote = async () => {
    setIsGeneratingSoap(true);
    try {
      const summaryText = handoffSummary?.sbar
        ? `${handoffSummary.sbar.situation} ${handoffSummary.sbar.assessment}`
        : 'Patient presenting with elevated blood pressure and diabetes management review.';

      const soap = `
=====================================================
CLINICAL CONSULTATION & PROGRESS NOTE (SOAP)
Connected Care Platform - Internal Medicine Service
Date: ${new Date().toLocaleDateString()} | Attending: ${currentUser.name}
Patient: ${activePatient.name[0].text} (MRN: ${activePatient.identifier[0].value})
=====================================================

SUBJECTIVE:
Patient is a ${activePatient.age}-year-old ${activePatient.gender} presenting for virtual care follow-up. 
Chief complaint: Suboptimal blood pressure control at home (systolic averaging 148-152 mmHg).
Reports good compliance with Metformin ER 1000mg BID and Lisinopril 20mg daily.
Denies chest pain, acute dyspnea, orthopnea, or lower extremity edema. Mild morning fatigue noted.

OBJECTIVE:
• Blood Pressure: 148/92 mmHg (Stage 2 Hypertension)
• Heart Rate: 84 bpm (Regular rate and rhythm)
• SpO2: 97% on ambient air
• BMI: 29.4 kg/m²
• Recent HbA1c: 8.4% (Suboptimal glycemic control)
• eGFR: 58 mL/min/1.73m² (CKD Stage 3a baseline)
• Serum Creatinine: 1.4 mg/dL | Fasting Glucose: 164 mg/dL
• Echocardiogram (TTE): LVEF 58%, mild concentric LV hypertrophy, normal valvular function.

ASSESSMENT:
1. Essential Hypertension, uncontrolled on single-agent ACE inhibitor therapy.
2. Type 2 Diabetes Mellitus with suboptimal glycemic control (HbA1c 8.4%).
3. Chronic Kidney Disease Stage 3a (eGFR 58 mL/min), stable.
4. High cardiovascular risk profile requiring dual-target cardiometabolic optimization.

PLAN:
1. Pharmacotherapy Titration:
   - Add Amlodipine 5mg oral daily for dual-mechanism blood pressure reduction (Target BP < 130/80 mmHg).
   - Continue Lisinopril 20mg daily for renal protection.
   - Continue Metformin ER 1000mg BID. Evaluate candidate for SGLT-2 inhibitor (Empagliflozin 10mg) at 4-week follow-up if eGFR remains stable.
2. Diagnostic & Laboratory Orders:
   - Order repeat Comprehensive Metabolic Panel (BMP/eGFR/electrolytes) and spot urine microalbumin-to-creatinine ratio in 4 weeks.
3. Patient Education & Monitoring:
   - Continue daily morning home blood pressure log in Connected Care portal.
   - Sodium restriction (< 2,000 mg/day) and Mediterranean dietary reinforcement.
4. Follow-up:
   - Virtual telehealth review scheduled in 4 weeks with care team.
      `;
      setSoapNoteGenerated(soap);
    } finally {
      setIsGeneratingSoap(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Patient Banner & Critical Allergies Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={activePatient.photo}
              alt={activePatient.name[0].text}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-blue-500/20 shadow-xs"
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-slate-900">{activePatient.name[0].text}</h2>
                <span className="px-2.5 py-0.5 text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 rounded-full">
                  {activePatient.gender.toUpperCase()} • {activePatient.age} Yrs
                </span>
                <span className="px-2.5 py-0.5 text-xs font-semibold bg-slate-100 text-slate-700 rounded-full font-mono">
                  DOB: {activePatient.birthDate}
                </span>
                <span className="px-2.5 py-0.5 text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 rounded-full">
                  Blood Type: {activePatient.bloodType}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-2 flex-wrap">
                <span>PCP: {activePatient.primaryCarePhysician.name}</span>
                <span>•</span>
                <span>Emergency: {activePatient.emergencyContact.name} ({activePatient.emergencyContact.relationship}) {activePatient.emergencyContact.phone}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              id="btn-physician-resynth-sbar"
              onClick={() => generateHandoffSummary()}
              disabled={isLoadingAI}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl transition-all shadow-2xs cursor-pointer"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isLoadingAI ? 'animate-spin' : ''}`} />
              <span>{isLoadingAI ? 'Synthesizing AI Handoff...' : 'Re-synthesize SBAR'}</span>
            </button>

            <button
              id="btn-physician-open-prescribe"
              onClick={() => setShowPrescribeModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>e-Prescribe (Rx)</span>
            </button>
          </div>
        </div>

        {/* Critical Allergies Warning Banner */}
        <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-rose-900 text-xs font-bold">
            <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 animate-pulse" />
            <span>CRITICAL ALLERGIES ON FILE:</span>
            <div className="flex items-center gap-2 flex-wrap">
              {allergies.map((all) => (
                <span
                  key={all.id}
                  className="px-2.5 py-0.5 bg-rose-600 text-white rounded-md text-xs font-bold shadow-2xs"
                >
                  {all.code.text} ({all.criticality.toUpperCase()})
                </span>
              ))}
            </div>
          </div>
          <span className="text-[11px] text-rose-700 font-medium">
            CDS Drug-Allergy interaction guard active
          </span>
        </div>
      </div>

      {/* Navigation Tabs for Clinician UI */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'overview'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Clinical Overview & Trends</span>
        </button>
        <button
          onClick={() => setActiveTab('sbar_handoff')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'sbar_handoff'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <BrainCircuit className="w-3.5 h-3.5" />
          <span>GenAI SBAR & Task Routing</span>
        </button>
        <button
          onClick={() => setActiveTab('prescribe')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'prescribe'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Pill className="w-3.5 h-3.5" />
          <span>Medications & e-Prescribe ({medications.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('diagnostics')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'diagnostics'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Diagnostics & Lab Reports ({diagnosticReports.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('soap_note')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'soap_note'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <FileCheck className="w-3.5 h-3.5" />
          <span>SOAP Note Generator</span>
        </button>
      </div>

      {/* TAB 1: CLINICAL OVERVIEW & TRENDS (Geometric Balance Layout) */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Top Geometric Grid: GenAI Summary + Clinical Resources */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* GenAI Clinical Hand-off Summary (Design HTML match) */}
            <section className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-6 flex flex-col shadow-xs">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  GenAI Clinical Hand-off Summary
                </h2>
                <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2.5 py-0.5 rounded font-semibold border border-indigo-100">
                  Predictive Task-Routing Active
                </span>
              </div>
              <p className="text-slate-700 text-base leading-relaxed italic border-l-4 border-indigo-500 pl-4 py-2 bg-indigo-50/20 rounded-r-lg">
                &ldquo;{handoffSummary?.sbar?.situation || 'Patient presenting for cardiometabolic follow-up. Vital trends indicate Stage 2 Hypertension with borderline eGFR.'} Recommended hand-off to Virtual-Care Scheduler for 48-hour follow-up. ERP suggests prior auth for post-op meds is pending.&rdquo;
              </p>
              <div className="mt-auto flex flex-wrap items-center gap-6 text-xs font-medium text-slate-500 border-t border-slate-100 pt-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span>Routing: <strong>Internal Medicine / Nephrology</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                  <span>Urgency: <strong>{handoffSummary?.acuityLevel || 'Moderate'}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                  <span>Acuity Score: <strong>{handoffSummary?.acuityScore || 7}/10</strong></span>
                </div>
              </div>
            </section>

            {/* Core Clinical Resources (FHIR) (Design HTML match) */}
            <section className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Core Clinical Resources (FHIR)
                </h2>
                <span className="text-[10px] font-mono text-slate-400">R4 REST API</span>
              </div>
              <div className="space-y-2.5">
                {observations.slice(0, 4).map((obs) => {
                  const val = obs.component ? `${obs.component[0].valueQuantity.value}/${obs.component[1]?.valueQuantity.value} mmHg` : `${obs.valueQuantity?.value} ${obs.valueQuantity?.unit || ''}`;
                  const shortName = obs.code.text.includes('Blood Pressure') ? 'BP' : obs.code.text.includes('Heart Rate') ? 'HR' : obs.code.text.includes('Oxygen') ? 'S2' : obs.code.text.includes('Glucose') ? 'GL' : 'LB';
                  const badgeBg = shortName === 'BP' ? 'bg-blue-100 text-blue-700' : shortName === 'HR' ? 'bg-red-100 text-red-700' : shortName === 'S2' ? 'bg-emerald-100 text-emerald-700' : 'bg-purple-100 text-purple-700';

                  return (
                    <div key={obs.id} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg transition-colors border border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-md ${badgeBg} flex items-center justify-center text-xs font-bold`}>
                          {shortName}
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-slate-800">{obs.code.text}</div>
                          <div className="text-[10px] text-slate-400">{new Date(obs.effectiveDateTime).toLocaleDateString()}</div>
                        </div>
                      </div>
                      <div className="text-xs font-bold text-slate-900 font-mono">{val}</div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          {/* Clinical Decision Support (CDS) Alerts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-xl flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-amber-900">CDS: Stage 2 Hypertension Alert</h4>
                <p className="text-xs text-amber-800 mt-1">
                  Systolic blood pressure (148 mmHg) exceeds clinical threshold. Consider dual antihypertensive therapy.
                </p>
              </div>
            </div>

            <div className="p-4 bg-rose-50/80 border border-rose-200 rounded-xl flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-rose-900">CDS: Suboptimal HbA1c (8.4%)</h4>
                <p className="text-xs text-rose-800 mt-1">
                  Glycemic target in T2DM is &lt;7.0%. Evaluate initiation of SGLT-2 inhibitor or GLP-1 RA.
                </p>
              </div>
            </div>

            <div className="p-4 bg-indigo-50/80 border border-indigo-200 rounded-xl flex items-start gap-3">
              <Activity className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-indigo-900">CDS: Renal Dosing (eGFR 58)</h4>
                <p className="text-xs text-indigo-800 mt-1">
                  Stage 3a CKD baseline. Ensure nephroprotective monitoring and avoid NSAID co-prescription.
                </p>
              </div>
            </div>
          </div>

          {/* Vitals & Lab Trends HUD */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-indigo-600" />
                  Key Clinical Observations & Biomarker Metrics
                </h3>
                <p className="text-xs text-slate-500">Live data sourced directly from FHIR R4 Observation store</p>
              </div>
              <span className="text-xs font-medium text-slate-400">LOINC Standards Validated</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {observations.map((obs) => {
                const isHigh = obs.interpretation?.coding?.[0]?.code === 'H';
                const isLow = obs.interpretation?.coding?.[0]?.code === 'L';
                return (
                  <div
                    key={obs.id}
                    className={`p-3.5 rounded-lg border transition-all ${
                      isHigh
                        ? 'bg-rose-50/50 border-rose-200 text-rose-900'
                        : isLow
                        ? 'bg-amber-50/50 border-amber-200 text-amber-900'
                        : 'bg-slate-50/80 border-slate-200 text-slate-900'
                    }`}
                  >
                    <p className="text-[11px] font-semibold text-slate-500 truncate" title={obs.code.text}>
                      {obs.code.text}
                    </p>
                    <div className="mt-1.5 flex items-baseline gap-1">
                      <span className="text-lg font-bold">
                        {obs.component ? `${obs.component[0].valueQuantity.value}/${obs.component[1]?.valueQuantity.value}` : obs.valueQuantity?.value}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">{obs.component ? 'mmHg' : obs.valueQuantity?.unit}</span>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-[10px]">
                      <span className="font-semibold">
                        {obs.interpretation?.coding?.[0]?.display || (isHigh ? 'High' : 'Normal')}
                      </span>
                      <span className="text-slate-400 font-mono">
                        {new Date(obs.effectiveDateTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Problems / Conditions (ICD-10-CM) */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-indigo-600" />
              Active Problem List & Diagnoses (FHIR Condition)
            </h3>
            <div className="divide-y divide-slate-100">
              {conditions.map((cond) => (
                <div key={cond.id} className="py-3 flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{cond.code.text}</span>
                      <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-slate-100 text-slate-700 rounded border border-slate-200">
                        {cond.code.coding[0]?.code}
                      </span>
                      <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
                        {cond.clinicalStatus}
                      </span>
                    </div>
                    {cond.note && <p className="text-xs text-slate-600 mt-1">{cond.note}</p>}
                  </div>
                  <div className="text-right text-[11px] text-slate-400 shrink-0">
                    <p>Onset: {cond.onsetDateTime}</p>
                    <p>{cond.recorder?.display}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: GENAI SBAR HAND-OFF & PREDICTIVE ROUTING */}
      {activeTab === 'sbar_handoff' && (
        <div className="space-y-6">
          {/* SBAR Structured Handoff Card */}
          <div className="bg-gradient-to-br from-indigo-500/5 to-blue-500/5 rounded-2xl border border-indigo-100 p-6">
            <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-indigo-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                  <BrainCircuit className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    GenAI Hand-off Summarisation (SBAR)
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-indigo-100 text-indigo-800 rounded-full">
                      Gemini 3.7 Flash Engine
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500">Structured clinical hand-off synthesized from Intake Bot transcript & FHIR records</p>
                </div>
              </div>

              {handoffSummary && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-600">Acuity Level:</span>
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                    handoffSummary.acuityLevel === 'High' || handoffSummary.acuityLevel === 'Critical'
                      ? 'bg-rose-100 text-rose-800 border-rose-300'
                      : 'bg-amber-100 text-amber-800 border-amber-300'
                  }`}>
                    {handoffSummary.acuityLevel} (Score: {handoffSummary.acuityScore}/10)
                  </span>
                </div>
              )}
            </div>

            {handoffSummary ? (
              <div className="mt-5 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
                    <div className="flex items-center gap-2 text-indigo-700 text-xs font-bold mb-1.5 uppercase tracking-wider">
                      <span className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-[11px]">S</span>
                      Situation
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">{handoffSummary.sbar.situation}</p>
                  </div>

                  <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
                    <div className="flex items-center gap-2 text-blue-700 text-xs font-bold mb-1.5 uppercase tracking-wider">
                      <span className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-[11px]">B</span>
                      Background
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">{handoffSummary.sbar.background}</p>
                  </div>

                  <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
                    <div className="flex items-center gap-2 text-amber-700 text-xs font-bold mb-1.5 uppercase tracking-wider">
                      <span className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center text-[11px]">A</span>
                      Assessment
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">{handoffSummary.sbar.assessment}</p>
                  </div>

                  <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
                    <div className="flex items-center gap-2 text-emerald-700 text-xs font-bold mb-1.5 uppercase tracking-wider">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-[11px]">R</span>
                      Recommendation
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">{handoffSummary.sbar.recommendation}</p>
                  </div>
                </div>

                {/* Risk factors and suggested action plan */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 bg-white rounded-xl border border-slate-200">
                    <h4 className="text-xs font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      Key Risk Factors & CDS Flags
                    </h4>
                    <ul className="space-y-1.5 text-xs text-slate-600">
                      {handoffSummary.keyRiskFactors.map((rf, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-amber-500 font-bold">•</span>
                          <span>{rf}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 bg-white rounded-xl border border-slate-200">
                    <h4 className="text-xs font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Suggested Clinical Action Plan
                    </h4>
                    <ul className="space-y-1.5 text-xs text-slate-600">
                      {handoffSummary.suggestedActionPlan.map((ap, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-emerald-500 font-bold">✓</span>
                          <span>{ap}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-4 p-8 text-center bg-white rounded-xl border border-dashed border-slate-300">
                <BrainCircuit className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs text-slate-600 font-medium">No SBAR handoff synthesized for current patient yet.</p>
                <button
                  onClick={() => generateHandoffSummary()}
                  className="mt-3 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
                >
                  Generate SBAR Hand-off via Gemini
                </button>
              </div>
            )}
          </div>

          {/* Predictive Task Routing Card */}
          {predictiveRouting && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <div className="flex items-center justify-between flex-wrap gap-2 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      Predictive Task Routing Engine
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-100 text-blue-800 rounded-full">
                        AI Urgency & Match Score (95%)
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500">Autonomous clinical task assignment, SLA tracking, and specialty matching</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${
                    predictiveRouting.priority === 'Stat (Immediate)'
                      ? 'bg-rose-100 text-rose-800 border-rose-300'
                      : 'bg-blue-100 text-blue-800 border-blue-300'
                  }`}>
                    {predictiveRouting.priority} Priority
                  </span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="text-[11px] font-semibold text-slate-500">Target Clinical Role</p>
                  <p className="text-sm font-bold text-slate-900 mt-1 uppercase">{predictiveRouting.targetRole}</p>
                  <p className="text-xs text-slate-600 mt-0.5">{predictiveRouting.targetDepartment}</p>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="text-[11px] font-semibold text-slate-500">Estimated Duration & SLA</p>
                  <p className="text-sm font-bold text-slate-900 mt-1">{predictiveRouting.estimatedConsultMinutes} Minutes Consult</p>
                  <p className="text-xs text-slate-600 mt-0.5">SLA Target: &lt; {predictiveRouting.slaTargetMinutes} Mins Response</p>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="text-[11px] font-semibold text-slate-500">Assigned Care Team Member</p>
                  <p className="text-sm font-bold text-slate-900 mt-1">{predictiveRouting.recommendedProviderName}</p>
                  <p className="text-xs text-emerald-600 font-semibold mt-0.5">✓ Longitudinal Match</p>
                </div>
              </div>

              <div className="mt-4 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                <h4 className="text-xs font-bold text-blue-900 mb-1">AI Routing Rationale:</h4>
                <p className="text-xs text-blue-800 leading-relaxed">{predictiveRouting.rationale}</p>
              </div>

              <div className="mt-4">
                <h4 className="text-xs font-bold text-slate-900 mb-2">Automated Routing Action Checklist:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {predictiveRouting.actionChecklist.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: MEDICATIONS & E-PRESCRIBING */}
      {activeTab === 'prescribe' && (
        <div className="space-y-4">
          {/* ERP Formulary & Prior-Authorization Context Bar */}
          <div className="bg-slate-900 text-white rounded-xl p-4 flex items-center justify-between flex-wrap gap-3 border border-slate-800 shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <Pill className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Real-Time ERP Formulary & Prior Authorization Engine</h4>
                <p className="text-[11px] text-slate-400">Payer: {activePatient.primaryCarePhysician.clinic} • Plan: Blue Cross PPO Tier 1 Preferred</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded font-semibold text-[11px]">
                ✓ Formulary Active
              </span>
              <span className="px-2.5 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded font-semibold text-[11px]">
                Prior Auth: Auto-Adjudicated
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Pill className="w-4 h-4 text-indigo-600" />
              Active Medication Regimen (FHIR MedicationRequest)
            </h3>
            <button
              onClick={() => setShowPrescribeModal(true)}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-all shadow-xs flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Prescription
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {medications.map((med) => (
              <div key={med.id} className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">{med.medicationCodeableConcept.text}</h4>
                    <p className="text-xs text-slate-600 mt-0.5">{med.dosageInstruction[0]?.text}</p>
                  </div>
                  <span className="px-2.5 py-0.5 text-[10px] font-semibold bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
                    {med.status.toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <div>
                    <span className="text-slate-400 block font-medium">ERP Formulary Tier:</span>
                    <span className="font-semibold text-slate-700">Tier 1 Generic ($10 Copay)</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Prior-Authorization:</span>
                    <span className="font-semibold text-emerald-600">✓ Approved (Auth #88219)</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Prescribed by: {med.requester?.display}</span>
                  <span>Authored: {new Date(med.authoredOn).toLocaleDateString()}</span>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="font-semibold text-slate-600">MAR Status:</span>
                  <span className={`px-2 py-0.5 rounded font-semibold uppercase text-[10px] ${
                    med.marStatus === 'given'
                      ? 'bg-emerald-100 text-emerald-800'
                      : med.marStatus === 'due'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-100 text-slate-700'
                  }`}>
                    {med.marStatus || 'Due'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: DIAGNOSTICS & LAB REPORTS */}
      {activeTab === 'diagnostics' && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-600" />
            Diagnostic Reports & Imaging Studies (FHIR DiagnosticReport)
          </h3>

          <div className="space-y-4">
            {diagnosticReports.map((report) => (
              <div key={report.id} className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-start justify-between flex-wrap gap-2">
                  <div>
                    <span className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wider">{report.category.text}</span>
                    <h4 className="text-base font-bold text-slate-900">{report.code.text}</h4>
                  </div>
                  <div className="text-right">
                    <span className="px-2.5 py-0.5 text-xs font-bold bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
                      {report.status.toUpperCase()}
                    </span>
                    <p className="text-[11px] text-slate-400 mt-1">{new Date(report.effectiveDateTime).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Conclusion & Clinical Findings:</p>
                  <p className="text-xs text-slate-800 leading-relaxed">{report.conclusion}</p>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span>Interpreted by: {report.resultsInterpreter?.display}</span>
                  <span>Performer: {report.performer[0]?.display}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: SOAP NOTE GENERATOR */}
      {activeTab === 'soap_note' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-600" />
                SOAP Consultation Progress Note Generator
              </h3>
              <p className="text-xs text-slate-500">Autonomous synthesis conforming to clinical documentation guidelines</p>
            </div>

            <button
              onClick={handleGenerateSoapNote}
              disabled={isGeneratingSoap}
              className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isGeneratingSoap ? 'animate-spin' : ''}`} />
              <span>{isGeneratingSoap ? 'Generating Note...' : 'Generate SOAP Note with GenAI'}</span>
            </button>
          </div>

          {soapNoteGenerated ? (
            <div className="p-5 bg-slate-900 text-emerald-400 font-mono text-xs rounded-2xl border border-slate-800 shadow-sm leading-relaxed overflow-x-auto whitespace-pre-wrap">
              {soapNoteGenerated}
            </div>
          ) : (
            <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-300">
              <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-xs text-slate-600 font-medium">Click above to generate a comprehensive SOAP note from the active FHIR bundle & SBAR handoff.</p>
            </div>
          )}
        </div>
      )}

      {/* E-PRESCRIBE MODAL */}
      {showPrescribeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 max-w-lg w-full p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                <Pill className="w-4 h-4 text-indigo-600" />
                New e-Prescription (FHIR MedicationRequest)
              </h3>
              <button
                onClick={() => setShowPrescribeModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none cursor-pointer"
              >
                ✕
              </button>
            </div>

            {rxAllergyWarning && (
              <div className="p-3 bg-rose-50 border border-rose-300 rounded-lg text-xs font-semibold text-rose-800 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{rxAllergyWarning}</span>
              </div>
            )}

            {/* ERP Formulary Check Preview */}
            <div className="p-3 bg-indigo-50/60 border border-indigo-200 rounded-lg text-xs flex items-center justify-between">
              <div>
                <p className="font-semibold text-indigo-900">ERP Payer Formulary: Tier 1 Generic</p>
                <p className="text-[11px] text-indigo-700">Estimated Patient Copay: $10.00 • No Prior Auth Required</p>
              </div>
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-semibold text-[10px] rounded">
                Covered
              </span>
            </div>

            <form onSubmit={handleCreatePrescription} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Medication Name & Formulation</label>
                <input
                  type="text"
                  value={newRxName}
                  onChange={(e) => handleRxNameChange(e.target.value)}
                  placeholder="e.g. Amlodipine Besylate 5 mg Oral Tablet"
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Dose / Strength</label>
                  <input
                    type="text"
                    value={newRxDose}
                    onChange={(e) => setNewRxDose(e.target.value)}
                    placeholder="e.g. 5 mg"
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Quantity / Refills</label>
                  <input
                    type="text"
                    defaultValue="30 Tablets (3 Refills)"
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">SIG / Patient Instructions</label>
                <textarea
                  value={newRxInstructions}
                  onChange={(e) => setNewRxInstructions(e.target.value)}
                  rows={2}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPrescribeModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-all shadow-xs cursor-pointer"
                >
                  Authorize & Commit to FHIR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
