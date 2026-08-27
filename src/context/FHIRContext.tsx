import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  FHIRPatient,
  FHIRObservation,
  FHIRCondition,
  FHIRAllergyIntolerance,
  FHIRMedicationRequest,
  FHIREncounter,
  FHIRCarePlan,
  FHIRDiagnosticReport,
  FHIRDocumentReference,
  ERPClaimSummary,
  MessageThread,
  SecureMessage,
  VirtualAppointmentSlot,
  GenAIHandoffSummary,
  PredictiveTaskRouting
} from '../types/fhir';
import {
  INITIAL_PATIENTS,
  INITIAL_OBSERVATIONS,
  INITIAL_CONDITIONS,
  INITIAL_ALLERGIES,
  INITIAL_MEDICATIONS,
  INITIAL_ENCOUNTERS,
  INITIAL_CARE_PLANS,
  INITIAL_DIAGNOSTIC_REPORTS,
  INITIAL_DOCUMENTS,
  INITIAL_ERP_CLAIMS,
  INITIAL_MESSAGE_THREADS,
  INITIAL_SCHEDULER_SLOTS,
  INITIAL_PREDICTIVE_ROUTINGS
} from '../data/fhirMockDatabase';

interface FHIRContextType {
  patients: FHIRPatient[];
  activePatient: FHIRPatient;
  setActivePatientId: (id: string) => void;
  observations: FHIRObservation[];
  conditions: FHIRCondition[];
  allergies: FHIRAllergyIntolerance[];
  medications: FHIRMedicationRequest[];
  encounters: FHIREncounter[];
  carePlans: FHIRCarePlan[];
  diagnosticReports: FHIRDiagnosticReport[];
  documents: FHIRDocumentReference[];
  erpClaim: ERPClaimSummary;
  messageThreads: MessageThread[];
  schedulerSlots: VirtualAppointmentSlot[];
  handoffSummary: GenAIHandoffSummary | null;
  predictiveRouting: PredictiveTaskRouting | null;
  isLoadingAI: boolean;
  fhirStats: {
    patients: number;
    observations: number;
    conditions: number;
    medications: number;
    encounters: number;
  };
  // Actions
  recordObservation: (obs: Partial<FHIRObservation>) => Promise<FHIRObservation>;
  orderMedication: (med: Partial<FHIRMedicationRequest>) => Promise<FHIRMedicationRequest>;
  updateMARStatus: (medId: string, status: 'due' | 'given' | 'held' | 'prn') => Promise<void>;
  updateCarePlanActivity: (carePlanId: string, activityId: string, status: 'not-started' | 'in-progress' | 'completed' | 'on-hold') => Promise<void>;
  processCheckoutPayment: (claimId: string, paymentMethod: string, amount: number) => Promise<{ success: boolean; receiptNumber: string }>;
  generateHandoffSummary: (intakeTranscript?: string) => Promise<GenAIHandoffSummary>;
  predictTaskRouting: (chiefComplaint?: string) => Promise<PredictiveTaskRouting>;
  bookAppointmentSlot: (slotId: string, reason: string) => Promise<boolean>;
  sendSecureMessage: (threadId: string, content: string, isUrgent?: boolean, attachments?: any[]) => Promise<SecureMessage>;
  markThreadRead: (threadId: string) => Promise<void>;
  verifyInsuranceEligibility: () => Promise<any>;
}

const FHIRContext = createContext<FHIRContextType | undefined>(undefined);

export const FHIRProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [patients, setPatients] = useState<FHIRPatient[]>(INITIAL_PATIENTS);
  const [activePatientId, setActivePatientIdState] = useState<string>('patient-wilson-001');
  const [observations, setObservations] = useState<FHIRObservation[]>(INITIAL_OBSERVATIONS);
  const [conditions, setConditions] = useState<FHIRCondition[]>(INITIAL_CONDITIONS);
  const [allergies, setAllergies] = useState<FHIRAllergyIntolerance[]>(INITIAL_ALLERGIES);
  const [medications, setMedications] = useState<FHIRMedicationRequest[]>(INITIAL_MEDICATIONS);
  const [encounters, setEncounters] = useState<FHIREncounter[]>(INITIAL_ENCOUNTERS);
  const [carePlans, setCarePlans] = useState<FHIRCarePlan[]>(INITIAL_CARE_PLANS);
  const [diagnosticReports, setDiagnosticReports] = useState<FHIRDiagnosticReport[]>(INITIAL_DIAGNOSTIC_REPORTS);
  const [documents, setDocuments] = useState<FHIRDocumentReference[]>(INITIAL_DOCUMENTS);
  const [erpClaims, setErpClaims] = useState<ERPClaimSummary[]>(INITIAL_ERP_CLAIMS);
  const [messageThreads, setMessageThreads] = useState<MessageThread[]>(INITIAL_MESSAGE_THREADS);
  const [schedulerSlots, setSchedulerSlots] = useState<VirtualAppointmentSlot[]>(INITIAL_SCHEDULER_SLOTS);
  const [handoffSummary, setHandoffSummary] = useState<GenAIHandoffSummary | null>(null);
  const [predictiveRouting, setPredictiveRouting] = useState<PredictiveTaskRouting | null>(INITIAL_PREDICTIVE_ROUTINGS['patient-wilson-001'] || null);
  const [isLoadingAI, setIsLoadingAI] = useState<boolean>(false);

  const activePatient = patients.find((p) => p.id === activePatientId) || patients[0];

  const activeClaim = erpClaims.find((c) => c.patientId === activePatient.id) || erpClaims[0];

  const setActivePatientId = useCallback((id: string) => {
    setActivePatientIdState(id);
    if (INITIAL_PREDICTIVE_ROUTINGS[id]) {
      setPredictiveRouting(INITIAL_PREDICTIVE_ROUTINGS[id]);
    }
  }, []);

  // Filtered resources for current patient
  const patientObservations = observations.filter((o) => o.subject?.reference?.includes(activePatient.id));
  const patientConditions = conditions.filter((c) => c.subject?.reference?.includes(activePatient.id));
  const patientAllergies = allergies.filter((a) => a.patient?.reference?.includes(activePatient.id));
  const patientMedications = medications.filter((m) => m.subject?.reference?.includes(activePatient.id));
  const patientEncounters = encounters.filter((e) => e.subject?.reference?.includes(activePatient.id));
  const patientCarePlans = carePlans.filter((cp) => cp.subject?.reference?.includes(activePatient.id));
  const patientDiagnosticReports = diagnosticReports.filter((dr) => dr.subject?.reference?.includes(activePatient.id));
  const patientDocuments = documents.filter((doc) => doc.subject?.reference?.includes(activePatient.id));

  // Initialize handoff summary from document reference if present
  useEffect(() => {
    const sbarDoc = patientDocuments.find((d) => d.type?.text?.includes('Hand-off') || d.type?.text?.includes('SBAR'));
    if (sbarDoc?.content?.[0]?.attachment?.structuredContent) {
      const s = sbarDoc.content[0].attachment.structuredContent;
      setHandoffSummary({
        handoffId: sbarDoc.id,
        patientId: activePatient.id,
        timestamp: sbarDoc.date,
        acuityLevel: 'Moderate',
        acuityScore: 6,
        sbar: {
          situation: s.situation || '',
          background: s.background || '',
          assessment: s.assessment || '',
          recommendation: s.recommendation || ''
        },
        chiefComplaint: 'Suboptimal blood pressure control & glycemic review',
        symptomDuration: '3-5 days',
        keyRiskFactors: ['Elevated cardiovascular risk', 'Suboptimal glycemic control (HbA1c 8.4%)'],
        cdsAlerts: ['Penicillin Anaphylaxis Warning: Cross-allergy checking active', 'CKD 3a renal dose adjustment recommended'],
        suggestedActionPlan: ['Titrate antihypertensive', 'Review home BP daily log'],
        modelUsed: 'gemini-3.7-flash'
      });
    }
  }, [activePatient.id]);

  // Record a new Observation (Vitals / Labs)
  const recordObservation = async (obsData: Partial<FHIRObservation>): Promise<FHIRObservation> => {
    try {
      const res = await fetch('/api/fhir/Observation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: { reference: `Patient/${activePatient.id}`, display: activePatient.name[0].text },
          ...obsData
        })
      });
      if (res.ok) {
        const savedObs: FHIRObservation = await res.json();
        setObservations((prev) => [savedObs, ...prev]);
        return savedObs;
      }
    } catch (e) {
      console.warn('API error, saving locally:', e);
    }

    const fallbackObs: FHIRObservation = {
      resourceType: 'Observation',
      id: `obs-${Date.now()}`,
      status: 'final',
      category: obsData.category || 'vital-signs',
      code: obsData.code || { coding: [], text: 'Observation' },
      subject: { reference: `Patient/${activePatient.id}`, display: activePatient.name[0].text },
      effectiveDateTime: new Date().toISOString(),
      ...obsData
    } as FHIRObservation;

    setObservations((prev) => [fallbackObs, ...prev]);
    return fallbackObs;
  };

  // Order a new MedicationRequest
  const orderMedication = async (medData: Partial<FHIRMedicationRequest>): Promise<FHIRMedicationRequest> => {
    try {
      const res = await fetch('/api/fhir/MedicationRequest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: { reference: `Patient/${activePatient.id}`, display: activePatient.name[0].text },
          ...medData
        })
      });
      if (res.ok) {
        const savedMed: FHIRMedicationRequest = await res.json();
        setMedications((prev) => [savedMed, ...prev]);
        return savedMed;
      }
    } catch (e) {
      console.warn('API error, saving medication locally:', e);
    }

    const fallbackMed: FHIRMedicationRequest = {
      resourceType: 'MedicationRequest',
      id: `med-${Date.now()}`,
      status: 'active',
      intent: 'order',
      authoredOn: new Date().toISOString(),
      subject: { reference: `Patient/${activePatient.id}`, display: activePatient.name[0].text },
      marStatus: 'due',
      ...medData
    } as FHIRMedicationRequest;

    setMedications((prev) => [fallbackMed, ...prev]);
    return fallbackMed;
  };

  // Update MAR Administration status
  const updateMARStatus = async (medId: string, status: 'due' | 'given' | 'held' | 'prn') => {
    try {
      await fetch(`/api/fhir/MedicationRequest/${medId}/mar`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ marStatus: status })
      });
    } catch (e) {
      console.warn('MAR API error:', e);
    }

    setMedications((prev) =>
      prev.map((m) =>
        m.id === medId
          ? {
              ...m,
              marStatus: status,
              isMARAdministered: status === 'given',
              lastAdministeredTime: status === 'given' ? new Date().toISOString() : m.lastAdministeredTime
            }
          : m
      )
    );
  };

  // Update CarePlan activity task
  const updateCarePlanActivity = async (
    carePlanId: string,
    activityId: string,
    status: 'not-started' | 'in-progress' | 'completed' | 'on-hold'
  ) => {
    try {
      await fetch(`/api/fhir/CarePlan/${carePlanId}/activity/${activityId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
    } catch (e) {
      console.warn('CarePlan API error:', e);
    }

    setCarePlans((prev) =>
      prev.map((cp) => {
        if (cp.id !== carePlanId) return cp;
        return {
          ...cp,
          activity: cp.activity.map((act) => (act.id === activityId ? { ...act, detail: { ...act.detail, status } } : act))
        };
      })
    );
  };

  // Process ERP Checkout Payment
  const processCheckoutPayment = async (
    claimId: string,
    paymentMethod: string,
    amount: number
  ): Promise<{ success: boolean; receiptNumber: string }> => {
    try {
      const res = await fetch('/api/erp/process-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claimId, paymentMethod, amountPaid: amount })
      });
      if (res.ok) {
        const data = await res.json();
        setErpClaims((prev) => prev.map((c) => (c.claimId === claimId ? data.claim : c)));
        return { success: true, receiptNumber: data.receiptNumber };
      }
    } catch (e) {
      console.warn('ERP checkout error, local fallback:', e);
    }

    const receiptNum = `RCPT-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;
    setErpClaims((prev) =>
      prev.map((c) =>
        c.claimId === claimId
          ? {
              ...c,
              isPaidAtFrontDesk: true,
              paymentMethod: paymentMethod as any,
              paymentTimestamp: new Date().toISOString(),
              receiptNumber: receiptNum,
              patientTotalBalance: Math.max(0, c.patientTotalBalance - amount),
              claimStatus: 'Approved'
            }
          : c
      )
    );

    // Also update encounter status
    setEncounters((prev) =>
      prev.map((e) => (e.subject.reference.includes(activePatient.id) ? { ...e, status: 'finished', period: { ...e.period, end: new Date().toISOString() } } : e))
    );

    return { success: true, receiptNumber: receiptNum };
  };

  // Generate GenAI Handoff Summary
  const generateHandoffSummary = async (intakeTranscript?: string): Promise<GenAIHandoffSummary> => {
    setIsLoadingAI(true);
    try {
      const res = await fetch('/api/ai/summarize-handoff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId: activePatient.id, intakeTranscript })
      });
      if (res.ok) {
        const data: GenAIHandoffSummary = await res.json();
        setHandoffSummary(data);
        setIsLoadingAI(false);
        return data;
      }
    } catch (e) {
      console.warn('Handoff generation error:', e);
    }

    const fallback: GenAIHandoffSummary = {
      handoffId: `handoff-${Date.now()}`,
      patientId: activePatient.id,
      timestamp: new Date().toISOString(),
      acuityLevel: 'Moderate',
      acuityScore: 6,
      sbar: {
        situation: `Patient ${activePatient.name[0].text} presenting for chronic disease review with home systolic readings (148-152 mmHg) and elevated HbA1c (8.4%).`,
        background: `62yo male with established Type 2 Diabetes, Stage 2 Hypertension, and CKD 3a (eGFR 58). Prescribed Metformin ER 1000mg BID and Lisinopril 20mg. Severe Penicillin anaphylaxis on file.`,
        assessment: `Suboptimal cardiometabolic control with persistently elevated blood pressure. Cardiovascular risk mitigation required with dual-agent therapy titration.`,
        recommendation: `1. Add second-line antihypertensive (Amlodipine 5mg QD). 2. Recheck basic metabolic panel & eGFR in 4 weeks. 3. Continue daily home BP portal synchronization.`
      },
      chiefComplaint: 'Suboptimal blood pressure control & glycemic review',
      symptomDuration: '3-5 days',
      keyRiskFactors: ['Elevated cardiovascular risk', 'Suboptimal glycemic control (HbA1c 8.4%)'],
      cdsAlerts: ['Penicillin Anaphylaxis Warning: Cross-allergy checking active', 'CKD 3a renal dose adjustment recommended'],
      suggestedActionPlan: ['Titrate antihypertensive', 'Review home BP daily log'],
      modelUsed: 'gemini-3.7-flash'
    };

    setHandoffSummary(fallback);
    setIsLoadingAI(false);
    return fallback;
  };

  // Predict Task Routing via AI
  const predictTaskRouting = async (chiefComplaint?: string): Promise<PredictiveTaskRouting> => {
    setIsLoadingAI(true);
    try {
      const res = await fetch('/api/ai/predict-task-routing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: activePatient.id,
          chiefComplaint,
          handoffSummary
        })
      });
      if (res.ok) {
        const data: PredictiveTaskRouting = await res.json();
        setPredictiveRouting(data);
        setIsLoadingAI(false);
        return data;
      }
    } catch (e) {
      console.warn('Predictive task routing error:', e);
    }

    const fallback: PredictiveTaskRouting = {
      taskId: `route-${Date.now()}`,
      patientId: activePatient.id,
      taskTitle: 'Chronic Disease Titration & Cardiorenal Consultation',
      priority: 'Urgent',
      targetRole: 'physician',
      targetDepartment: 'Internal Medicine / Cardiology',
      recommendedProviderName: 'Dr. Eleanor Vance, MD',
      estimatedConsultMinutes: 30,
      slaTargetMinutes: 60,
      rationale: 'Elevated HbA1c (8.4%) combined with persistent home blood pressure spikes (148/92) requires medication titration by Attending Physician.',
      actionChecklist: [
        'Review continuous home BP average from FHIR observation store',
        'Verify renal safety profile (eGFR 58 mL/min) before prescribing nephroprotective agent',
        'Cross-check Penicillin allergy warning before prescribing any antimicrobial',
        'Coordinate with Front-Desk Registrar for ERP billing copay verification ($40.00)'
      ],
      aiConfidenceScore: 0.95
    };

    setPredictiveRouting(fallback);
    setIsLoadingAI(false);
    return fallback;
  };

  // Book Virtual Care Slot
  const bookAppointmentSlot = async (slotId: string, reason: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/scheduler/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slotId, patientId: activePatient.id, appointmentReason: reason })
      });
      if (res.ok) {
        const data = await res.json();
        setSchedulerSlots((prev) => prev.map((s) => (s.id === slotId ? data.slot : s)));
        setEncounters((prev) => [data.encounter, ...prev]);
        return true;
      }
    } catch (e) {
      console.warn('Booking slot error, local fallback:', e);
    }

    setSchedulerSlots((prev) =>
      prev.map((s) => (s.id === slotId ? { ...s, status: 'booked', roomUrl: `https://connectedcare.health/room/telehealth-${Date.now().toString().slice(-6)}` } : s))
    );
    return true;
  };

  // Send Secure Message
  const sendSecureMessage = async (
    threadId: string,
    content: string,
    isUrgent?: boolean,
    attachments?: any[]
  ): Promise<SecureMessage> => {
    const newMessage: SecureMessage = {
      id: `msg-${Date.now()}`,
      threadId,
      senderId: 'current-user',
      senderName: 'Me',
      senderRole: 'physician',
      senderAvatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150',
      recipientId: 'care-team',
      recipientName: 'Care Team',
      timestamp: new Date().toISOString(),
      content,
      isRead: false,
      isUrgent: Boolean(isUrgent),
      attachments: attachments || []
    };

    try {
      const res = await fetch('/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          threadId,
          content,
          isUrgent,
          attachments,
          senderId: 'current-user',
          senderName: 'Current User',
          senderRole: 'physician'
        })
      });
      if (res.ok) {
        const savedMsg: SecureMessage = await res.json();
        setMessageThreads((prev) =>
          prev.map((t) => (t.id === threadId ? { ...t, messages: [...t.messages, savedMsg], lastMessageTimestamp: savedMsg.timestamp } : t))
        );
        return savedMsg;
      }
    } catch (e) {
      console.warn('Send message error, saving locally:', e);
    }

    setMessageThreads((prev) =>
      prev.map((t) => (t.id === threadId ? { ...t, messages: [...t.messages, newMessage], lastMessageTimestamp: newMessage.timestamp } : t))
    );
    return newMessage;
  };

  // Mark thread read
  const markThreadRead = async (threadId: string) => {
    try {
      await fetch(`/api/messages/${threadId}/read`, { method: 'POST' });
    } catch (e) {
      console.warn('Read message error:', e);
    }
    setMessageThreads((prev) =>
      prev.map((t) => (t.id === threadId ? { ...t, unreadCount: 0, messages: t.messages.map((m) => ({ ...m, isRead: true })) } : t))
    );
  };

  // Verify Insurance
  const verifyInsuranceEligibility = async () => {
    try {
      const res = await fetch('/api/erp/verify-eligibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId: activePatient.id, payerName: activeClaim.payerName, policyNumber: activeClaim.policyNumber })
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Verify insurance error:', e);
    }
    return {
      verified: true,
      payerStatus: 'ACTIVE_COVERAGE',
      verificationDate: new Date().toISOString(),
      planType: 'Comprehensive PPO Tier 1',
      copaySummary: { primaryCare: 25.0, specialistConsult: 40.0, telehealthVirtual: 15.0 },
      deductible: { individualTotal: 1500.0, individualMet: 1500.0, remaining: 0.0 }
    };
  };

  const fhirStats = {
    patients: patients.length,
    observations: patientObservations.length,
    conditions: patientConditions.length,
    medications: patientMedications.length,
    encounters: patientEncounters.length
  };

  return (
    <FHIRContext.Provider
      value={{
        patients,
        activePatient,
        setActivePatientId,
        observations: patientObservations,
        conditions: patientConditions,
        allergies: patientAllergies,
        medications: patientMedications,
        encounters: patientEncounters,
        carePlans: patientCarePlans,
        diagnosticReports: patientDiagnosticReports,
        documents: patientDocuments,
        erpClaim: activeClaim,
        messageThreads,
        schedulerSlots,
        handoffSummary,
        predictiveRouting,
        isLoadingAI,
        fhirStats,
        recordObservation,
        orderMedication,
        updateMARStatus,
        updateCarePlanActivity,
        processCheckoutPayment,
        generateHandoffSummary,
        predictTaskRouting,
        bookAppointmentSlot,
        sendSecureMessage,
        markThreadRead,
        verifyInsuranceEligibility
      }}
    >
      {children}
    </FHIRContext.Provider>
  );
};

export const useFHIR = (): FHIRContextType => {
  const context = useContext(FHIRContext);
  if (!context) {
    throw new Error('useFHIR must be used within a FHIRProvider');
  }
  return context;
};
