/**
 * FHIR R4 & Connected Care Platform Core Type Definitions
 */

export type RoleType = 'physician' | 'nurse' | 'registrar' | 'patient';

export interface UserPersona {
  id: string;
  name: string;
  role: RoleType;
  title: string;
  department: string;
  avatar: string;
  email: string;
  licenseNumber?: string;
  patientId?: string; // Associated patient ID when role is 'patient'
}

// FHIR R4 Patient Resource
export interface FHIRIdentifier {
  system: string;
  value: string;
  type?: string;
}

export interface FHIRHumanName {
  use: 'usual' | 'official' | 'temp' | 'nickname' | 'maiden';
  text: string;
  family: string;
  given: string[];
  prefix?: string[];
}

export interface FHIRContactPoint {
  system: 'phone' | 'email' | 'sms';
  value: string;
  use: 'home' | 'work' | 'mobile';
}

export interface FHIRAddress {
  use: 'home' | 'work' | 'billing';
  line: string[];
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface FHIRPatient {
  resourceType: 'Patient';
  id: string;
  identifier: FHIRIdentifier[];
  active: boolean;
  name: FHIRHumanName[];
  telecom: FHIRContactPoint[];
  gender: 'male' | 'female' | 'other' | 'unknown';
  birthDate: string;
  age: number;
  address: FHIRAddress[];
  maritalStatus?: string;
  photo?: string;
  primaryCarePhysician: {
    id: string;
    name: string;
    clinic: string;
  };
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  bloodType: string;
}

// FHIR R4 Observation (Vitals & Labs)
export interface FHIRObservation {
  resourceType: 'Observation';
  id: string;
  status: 'registered' | 'preliminary' | 'final' | 'amended';
  category: 'vital-signs' | 'laboratory' | 'social-history' | 'exam';
  code: {
    coding: {
      system: string; // e.g., LOINC
      code: string;
      display: string;
    }[];
    text: string;
  };
  subject: {
    reference: string; // Patient/123
    display: string;
  };
  effectiveDateTime: string;
  issued?: string;
  performer?: {
    reference: string;
    display: string;
  }[];
  valueQuantity?: {
    value: number;
    unit: string;
    system?: string;
    code?: string;
  };
  valueString?: string;
  interpretation?: {
    coding: {
      system: string;
      code: 'N' | 'H' | 'L' | 'A' | 'HH' | 'LL'; // Normal, High, Low, Abnormal, Critical High, Critical Low
      display: string;
    }[];
  };
  referenceRange?: {
    low?: { value: number; unit: string };
    high?: { value: number; unit: string };
    text?: string;
  }[];
  component?: {
    code: { text: string; coding?: { code: string; display: string }[] };
    valueQuantity: { value: number; unit: string };
    interpretation?: string;
  }[];
}

// FHIR R4 Condition (Diagnoses & Problems)
export interface FHIRCondition {
  resourceType: 'Condition';
  id: string;
  clinicalStatus: 'active' | 'recurrence' | 'relapse' | 'inactive' | 'remission' | 'resolved';
  verificationStatus: 'confirmed' | 'provisional' | 'differential' | 'refuted';
  category: 'problem-list-item' | 'encounter-diagnosis';
  severity?: 'mild' | 'moderate' | 'severe' | 'critical';
  code: {
    coding: {
      system: string; // e.g. ICD-10-CM or SNOMED-CT
      code: string;
      display: string;
    }[];
    text: string;
  };
  subject: {
    reference: string;
    display: string;
  };
  onsetDateTime: string;
  recordedDate?: string;
  recorder?: {
    display: string;
  };
  note?: string;
}

// FHIR R4 AllergyIntolerance
export interface FHIRAllergyIntolerance {
  resourceType: 'AllergyIntolerance';
  id: string;
  clinicalStatus: 'active' | 'inactive' | 'resolved';
  verificationStatus: 'confirmed' | 'unconfirmed' | 'refuted';
  type: 'allergy' | 'intolerance';
  category: ('food' | 'medication' | 'environment' | 'biologic')[];
  criticality: 'low' | 'high' | 'unable-to-assess';
  code: {
    text: string;
    coding?: { system: string; code: string; display: string }[];
  };
  patient: {
    reference: string;
    display: string;
  };
  reaction?: {
    substance?: string;
    manifestation: string[];
    severity: 'mild' | 'moderate' | 'severe';
  }[];
}

// FHIR R4 MedicationRequest (Prescriptions)
export interface FHIRMedicationRequest {
  resourceType: 'MedicationRequest';
  id: string;
  status: 'active' | 'on-hold' | 'cancelled' | 'completed' | 'entered-in-error' | 'stopped' | 'draft';
  intent: 'order' | 'proposal' | 'plan';
  medicationCodeableConcept: {
    text: string;
    coding?: { system: string; code: string; display: string }[];
  };
  subject: {
    reference: string;
    display: string;
  };
  authoredOn: string;
  requester: {
    reference: string;
    display: string;
    role?: string;
  };
  dosageInstruction: {
    text: string;
    timing?: { repeat?: { frequency: number; period: number; periodUnit: 'd' | 'wk' | 'mo' } };
    route?: string;
    doseQuantity?: { value: number; unit: string };
  }[];
  dispenseRequest?: {
    numberOfRepeatsAllowed: number;
    quantity: { value: number; unit: string };
    expectedSupplyDuration: { value: number; unit: string };
  };
  isMARAdministered?: boolean;
  lastAdministeredTime?: string;
  marStatus?: 'due' | 'given' | 'held' | 'prn';
}

// FHIR R4 Encounter
export interface FHIREncounter {
  resourceType: 'Encounter';
  id: string;
  status: 'planned' | 'arrived' | 'triaged' | 'in-progress' | 'onleave' | 'finished' | 'cancelled';
  class: {
    code: 'AMB' | 'EMER' | 'IMP' | 'VR' | 'HH'; // Ambulatory, Emergency, Inpatient, Virtual, Home Health
    display: string;
  };
  type: {
    text: string;
    coding?: { code: string; display: string }[];
  }[];
  subject: {
    reference: string;
    display: string;
  };
  participant: {
    individual: { reference: string; display: string };
    period?: { start: string; end?: string };
  }[];
  period: {
    start: string;
    end?: string;
  };
  reasonCode?: {
    text: string;
  }[];
  serviceProvider?: {
    display: string;
  };
  location?: {
    location: { display: string };
    status: 'planned' | 'active' | 'completed';
  }[];
  triageAcuity?: 'Level 1 (Resuscitation)' | 'Level 2 (Emergent)' | 'Level 3 (Urgent)' | 'Level 4 (Less Urgent)' | 'Level 5 (Non-Urgent)';
}

// FHIR R4 CarePlan
export interface FHIRCarePlan {
  resourceType: 'CarePlan';
  id: string;
  status: 'active' | 'completed' | 'draft' | 'on-hold';
  intent: 'plan' | 'order';
  title: string;
  description: string;
  subject: { reference: string; display: string };
  period: { start: string; end?: string };
  category?: { text: string };
  activity: {
    id: string;
    detail: {
      code: { text: string };
      status: 'not-started' | 'scheduled' | 'in-progress' | 'completed' | 'on-hold';
      scheduledTiming?: string;
      description?: string;
      assignedRole?: 'nurse' | 'physician' | 'patient' | 'therapist';
    };
  }[];
}

// FHIR R4 DiagnosticReport
export interface FHIRDiagnosticReport {
  resourceType: 'DiagnosticReport';
  id: string;
  status: 'registered' | 'partial' | 'preliminary' | 'final';
  category: { text: string };
  code: { text: string; coding?: { code: string; display: string }[] };
  subject: { reference: string; display: string };
  effectiveDateTime: string;
  issued: string;
  performer: { display: string }[];
  conclusion: string;
  resultsInterpreter?: { display: string };
}

// FHIR R4 DocumentReference (Clinical Notes / Hand-offs)
export interface FHIRDocumentReference {
  resourceType: 'DocumentReference';
  id: string;
  status: 'current' | 'superseded';
  type: { text: string; coding?: { code: string; display: string }[] };
  subject: { reference: string; display: string };
  date: string;
  author: { display: string; role?: string };
  title: string;
  content: {
    attachment: {
      contentType: string;
      data?: string;
      title?: string;
      url?: string;
      structuredContent?: {
        situation?: string;
        background?: string;
        assessment?: string;
        recommendation?: string;
      };
    };
  }[];
}

// Unified FHIR Patient Bundle
export interface FHIRPatientBundle {
  patient: FHIRPatient;
  observations: FHIRObservation[];
  conditions: FHIRCondition[];
  allergies: FHIRAllergyIntolerance[];
  medications: FHIRMedicationRequest[];
  encounters: FHIREncounter[];
  carePlans: FHIRCarePlan[];
  diagnosticReports: FHIRDiagnosticReport[];
  documents: FHIRDocumentReference[];
}

// ERP Billing & Reimbursement Integration
export interface ERPItemizedCharge {
  cptCode: string;
  description: string;
  units: number;
  unitPrice: number;
  totalPrice: number;
  insuranceAllowed: number;
  copayApplicable: number;
  coinsurance: number;
}

export interface ERPClaimSummary {
  claimId: string;
  encounterId: string;
  patientId: string;
  payerName: string;
  policyNumber: string;
  groupNumber: string;
  claimStatus: 'Submitted' | 'In-Review' | 'Approved' | 'Paid' | 'Prior-Auth Required';
  totalBilledAmount: number;
  insurancePaidAmount: number;
  patientCopayDue: number;
  patientDeductibleRemaining: number;
  patientTotalBalance: number;
  isPaidAtFrontDesk: boolean;
  paymentMethod?: 'Credit Card' | 'Debit Card' | 'Cash' | 'HSA / FSA' | 'Apple Pay';
  paymentTimestamp?: string;
  receiptNumber?: string;
  items: ERPItemizedCharge[];
  priorAuthCode?: string;
  dateOfService: string;
}

// Secure Messaging Suite
export interface MessageAttachment {
  type: 'fhir_observation' | 'fhir_medication' | 'document' | 'image' | 'lab_report';
  title: string;
  referenceId?: string;
  previewText?: string;
}

export interface SecureMessage {
  id: string;
  threadId: string;
  senderId: string;
  senderName: string;
  senderRole: RoleType;
  senderAvatar: string;
  recipientId: string;
  recipientName: string;
  timestamp: string;
  content: string;
  isRead: boolean;
  isUrgent?: boolean;
  attachments?: MessageAttachment[];
  aiGeneratedSuggestion?: boolean;
}

export interface MessageThread {
  id: string;
  patientId: string;
  patientName: string;
  subject: string;
  category: 'clinical_consult' | 'prescription_refill' | 'intake_handoff' | 'billing_inquiry' | 'care_coordination';
  lastMessageTimestamp: string;
  unreadCount: number;
  isUrgent: boolean;
  participants: {
    id: string;
    name: string;
    role: RoleType;
  }[];
  messages: SecureMessage[];
}

// GenAI Hand-off Summarisation & Predictive Task Routing
export interface GenAIHandoffSummary {
  handoffId: string;
  patientId: string;
  timestamp: string;
  acuityLevel: 'Low' | 'Moderate' | 'High' | 'Critical';
  acuityScore: number; // 1-10
  sbar: {
    situation: string;
    background: string;
    assessment: string;
    recommendation: string;
  };
  chiefComplaint: string;
  symptomDuration: string;
  keyRiskFactors: string[];
  cdsAlerts: string[];
  suggestedActionPlan: string[];
  modelUsed: string;
}

export interface PredictiveTaskRouting {
  taskId: string;
  patientId: string;
  taskTitle: string;
  priority: 'Routine' | 'Urgent' | 'Stat (Immediate)';
  targetRole: RoleType;
  targetDepartment: string;
  recommendedProviderId?: string;
  recommendedProviderName?: string;
  estimatedConsultMinutes: number;
  slaTargetMinutes: number;
  rationale: string;
  actionChecklist: string[];
  aiConfidenceScore: number; // 0.0 - 1.0
}

// Health Intake Bot Dialogue
export interface IntakeBotMessage {
  id: string;
  sender: 'bot' | 'patient';
  text: string;
  timestamp: string;
  options?: string[];
  collectedData?: Record<string, any>;
}

// Virtual Care Scheduler
export interface VirtualAppointmentSlot {
  id: string;
  providerId: string;
  providerName: string;
  providerRole: string;
  providerSpecialty: string;
  providerAvatar: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  appointmentType: 'Virtual Video Telehealth' | 'In-Clinic Consult' | 'Urgent Triage Call';
  status: 'available' | 'booked';
  roomUrl?: string;
  aiMatchScore: number; // 1-100%
  aiMatchReason: string;
}
