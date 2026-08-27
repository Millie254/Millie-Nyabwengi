/**
 * FHIR Mock Database & Clinical Foundation Store
 * Realistic FHIR R4 clinical data, ERP billing records, user personas, and messaging threads.
 */

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
  UserPersona,
  MessageThread,
  GenAIHandoffSummary,
  PredictiveTaskRouting,
  VirtualAppointmentSlot
} from '../types/fhir';

export const USER_PERSONAS: UserPersona[] = [
  {
    id: 'user-doc-vance',
    name: 'Dr. Eleanor Vance, MD',
    role: 'physician',
    title: 'Attending Physician & Clinical Lead',
    department: 'Internal Medicine / Cardiology',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80',
    email: 'e.vance@connectedcare.org',
    licenseNumber: 'MD-884920'
  },
  {
    id: 'user-nurse-chen',
    name: 'Marcus Chen, BSN, RN',
    role: 'nurse',
    title: 'Senior Triage & Care Coordinator',
    department: 'Acute Care & Tele-Triage',
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
    email: 'm.chen@connectedcare.org',
    licenseNumber: 'RN-551029'
  },
  {
    id: 'user-reg-sarah',
    name: 'Sarah Jenkins',
    role: 'registrar',
    title: 'Patient Access & Front-Desk Registrar',
    department: 'Patient Services & Revenue Cycle',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    email: 's.jenkins@connectedcare.org'
  },
  {
    id: 'user-patient-wilson',
    name: 'James Wilson',
    role: 'patient',
    title: 'Patient (Type 2 DM, HTN)',
    department: 'General Ambulatory Care',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    email: 'j.wilson62@gmail.com',
    patientId: 'patient-wilson-001'
  }
];

export const INITIAL_PATIENTS: FHIRPatient[] = [
  {
    resourceType: 'Patient',
    id: 'patient-wilson-001',
    identifier: [
      { system: 'urn:oid:connectedcare:mrn', value: 'MRN-894021', type: 'Medical Record Number' },
      { system: 'http://hl7.org/fhir/sid/us-ssn', value: '***-**-4912' }
    ],
    active: true,
    name: [
      {
        use: 'official',
        text: 'James Arthur Wilson',
        family: 'Wilson',
        given: ['James', 'Arthur'],
        prefix: ['Mr.']
      }
    ],
    gender: 'male',
    birthDate: '1962-04-14',
    age: 62,
    telecom: [
      { system: 'phone', value: '(555) 349-8812', use: 'mobile' },
      { system: 'email', value: 'j.wilson62@gmail.com', use: 'home' }
    ],
    address: [
      {
        use: 'home',
        line: ['742 Evergreen Terrace'],
        city: 'Springfield',
        state: 'IL',
        postalCode: '62704',
        country: 'USA'
      }
    ],
    maritalStatus: 'Married',
    bloodType: 'A+',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    primaryCarePhysician: {
      id: 'user-doc-vance',
      name: 'Dr. Eleanor Vance, MD',
      clinic: 'Connected Care Comprehensive Clinic'
    },
    emergencyContact: {
      name: 'Martha Wilson',
      relationship: 'Spouse',
      phone: '(555) 349-8815'
    }
  },
  {
    resourceType: 'Patient',
    id: 'patient-rostova-002',
    identifier: [
      { system: 'urn:oid:connectedcare:mrn', value: 'MRN-773019', type: 'Medical Record Number' }
    ],
    active: true,
    name: [
      {
        use: 'official',
        text: 'Elena Rostova',
        family: 'Rostova',
        given: ['Elena'],
        prefix: ['Ms.']
      }
    ],
    gender: 'female',
    birthDate: '1990-09-22',
    age: 34,
    telecom: [
      { system: 'phone', value: '(555) 782-9014', use: 'mobile' },
      { system: 'email', value: 'elena.rostova@gmail.com', use: 'home' }
    ],
    address: [
      {
        use: 'home',
        line: ['128 Pinecrest Avenue'],
        city: 'Springfield',
        state: 'IL',
        postalCode: '62701',
        country: 'USA'
      }
    ],
    maritalStatus: 'Single',
    bloodType: 'O+',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    primaryCarePhysician: {
      id: 'user-doc-vance',
      name: 'Dr. Eleanor Vance, MD',
      clinic: 'Connected Care Pulmonary & Internal Clinic'
    },
    emergencyContact: {
      name: 'Dmitri Rostov',
      relationship: 'Brother',
      phone: '(555) 782-9099'
    }
  },
  {
    resourceType: 'Patient',
    id: 'patient-sterling-003',
    identifier: [
      { system: 'urn:oid:connectedcare:mrn', value: 'MRN-602914', type: 'Medical Record Number' }
    ],
    active: true,
    name: [
      {
        use: 'official',
        text: 'Marcus Sterling',
        family: 'Sterling',
        given: ['Marcus'],
        prefix: ['Mr.']
      }
    ],
    gender: 'male',
    birthDate: '1976-11-05',
    age: 48,
    telecom: [
      { system: 'phone', value: '(555) 441-2098', use: 'mobile' },
      { system: 'email', value: 'marcus.sterling@outlook.com', use: 'home' }
    ],
    address: [
      {
        use: 'home',
        line: ['450 Oak Valley Rd'],
        city: 'Springfield',
        state: 'IL',
        postalCode: '62702',
        country: 'USA'
      }
    ],
    maritalStatus: 'Married',
    bloodType: 'B+',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    primaryCarePhysician: {
      id: 'user-doc-vance',
      name: 'Dr. Eleanor Vance, MD',
      clinic: 'Connected Care Orthopedic & Sports Medicine'
    },
    emergencyContact: {
      name: 'Sarah Sterling',
      relationship: 'Spouse',
      phone: '(555) 441-2099'
    }
  }
];

export const INITIAL_OBSERVATIONS: FHIRObservation[] = [
  // James Wilson Vitals & Labs
  {
    resourceType: 'Observation',
    id: 'obs-wilson-bp-01',
    status: 'final',
    category: 'vital-signs',
    code: {
      coding: [{ system: 'http://loinc.org', code: '85354-9', display: 'Blood pressure panel' }],
      text: 'Blood Pressure'
    },
    subject: { reference: 'Patient/patient-wilson-001', display: 'James Wilson' },
    effectiveDateTime: '2026-08-27T09:30:00Z',
    component: [
      {
        code: { text: 'Systolic Blood Pressure', coding: [{ code: '8480-6', display: 'Systolic BP' }] },
        valueQuantity: { value: 148, unit: 'mmHg' },
        interpretation: 'High (Stage 2 Hypertension)'
      },
      {
        code: { text: 'Diastolic Blood Pressure', coding: [{ code: '8462-4', display: 'Diastolic BP' }] },
        valueQuantity: { value: 92, unit: 'mmHg' },
        interpretation: 'High'
      }
    ],
    interpretation: {
      coding: [{ system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation', code: 'H', display: 'High' }]
    }
  },
  {
    resourceType: 'Observation',
    id: 'obs-wilson-hr-01',
    status: 'final',
    category: 'vital-signs',
    code: {
      coding: [{ system: 'http://loinc.org', code: '8867-4', display: 'Heart rate' }],
      text: 'Heart Rate'
    },
    subject: { reference: 'Patient/patient-wilson-001', display: 'James Wilson' },
    effectiveDateTime: '2026-08-27T09:30:00Z',
    valueQuantity: { value: 84, unit: 'beats/min' },
    interpretation: { coding: [{ system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation', code: 'N', display: 'Normal' }] },
    referenceRange: [{ low: { value: 60, unit: 'beats/min' }, high: { value: 100, unit: 'beats/min' } }]
  },
  {
    resourceType: 'Observation',
    id: 'obs-wilson-spo2-01',
    status: 'final',
    category: 'vital-signs',
    code: {
      coding: [{ system: 'http://loinc.org', code: '2708-6', display: 'Oxygen saturation in Arterial blood' }],
      text: 'Pulse Oximetry (SpO2)'
    },
    subject: { reference: 'Patient/patient-wilson-001', display: 'James Wilson' },
    effectiveDateTime: '2026-08-27T09:30:00Z',
    valueQuantity: { value: 97, unit: '%' },
    interpretation: { coding: [{ system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation', code: 'N', display: 'Normal' }] }
  },
  {
    resourceType: 'Observation',
    id: 'obs-wilson-temp-01',
    status: 'final',
    category: 'vital-signs',
    code: {
      coding: [{ system: 'http://loinc.org', code: '8310-5', display: 'Body temperature' }],
      text: 'Body Temperature'
    },
    subject: { reference: 'Patient/patient-wilson-001', display: 'James Wilson' },
    effectiveDateTime: '2026-08-27T09:30:00Z',
    valueQuantity: { value: 98.4, unit: '°F' },
    interpretation: { coding: [{ system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation', code: 'N', display: 'Normal' }] }
  },
  {
    resourceType: 'Observation',
    id: 'obs-wilson-hba1c-01',
    status: 'final',
    category: 'laboratory',
    code: {
      coding: [{ system: 'http://loinc.org', code: '4548-4', display: 'Hemoglobin A1c/Hemoglobin.total in Blood' }],
      text: 'Hemoglobin A1c'
    },
    subject: { reference: 'Patient/patient-wilson-001', display: 'James Wilson' },
    effectiveDateTime: '2026-08-20T08:15:00Z',
    valueQuantity: { value: 8.4, unit: '%' },
    interpretation: { coding: [{ system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation', code: 'H', display: 'High (Suboptimal Glycemic Control)' }] },
    referenceRange: [{ low: { value: 4.0, unit: '%' }, high: { value: 5.6, unit: '%' }, text: 'Normal < 5.7%, Goal in DM < 7.0%' }]
  },
  {
    resourceType: 'Observation',
    id: 'obs-wilson-egfr-01',
    status: 'final',
    category: 'laboratory',
    code: {
      coding: [{ system: 'http://loinc.org', code: '33914-3', display: 'Glomerular filtration rate/1.73 sq M.predicted' }],
      text: 'Estimated GFR (CKD-EPI)'
    },
    subject: { reference: 'Patient/patient-wilson-001', display: 'James Wilson' },
    effectiveDateTime: '2026-08-20T08:15:00Z',
    valueQuantity: { value: 58, unit: 'mL/min/1.73m2' },
    interpretation: { coding: [{ system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation', code: 'L', display: 'Low (Mildly to Moderately Decreased / CKD 3a)' }] },
    referenceRange: [{ low: { value: 60, unit: 'mL/min/1.73m2' }, text: '> 60 mL/min normal' }]
  },
  {
    resourceType: 'Observation',
    id: 'obs-wilson-glucose-fasting',
    status: 'final',
    category: 'laboratory',
    code: {
      coding: [{ system: 'http://loinc.org', code: '1558-6', display: 'Fasting Glucose in Serum or Plasma' }],
      text: 'Fasting Blood Glucose'
    },
    subject: { reference: 'Patient/patient-wilson-001', display: 'James Wilson' },
    effectiveDateTime: '2026-08-20T08:15:00Z',
    valueQuantity: { value: 164, unit: 'mg/dL' },
    interpretation: { coding: [{ system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation', code: 'H', display: 'High' }] },
    referenceRange: [{ low: { value: 70, unit: 'mg/dL' }, high: { value: 99, unit: 'mg/dL' } }]
  },
  // Elena Rostova Vitals
  {
    resourceType: 'Observation',
    id: 'obs-rostova-spo2-01',
    status: 'final',
    category: 'vital-signs',
    code: {
      coding: [{ system: 'http://loinc.org', code: '2708-6', display: 'Oxygen saturation' }],
      text: 'Pulse Oximetry (SpO2)'
    },
    subject: { reference: 'Patient/patient-rostova-002', display: 'Elena Rostova' },
    effectiveDateTime: '2026-08-27T10:15:00Z',
    valueQuantity: { value: 94, unit: '%' },
    interpretation: { coding: [{ system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation', code: 'L', display: 'Borderline Low' }] },
    referenceRange: [{ low: { value: 95, unit: '%' }, high: { value: 100, unit: '%' } }]
  },
  {
    resourceType: 'Observation',
    id: 'obs-rostova-rr-01',
    status: 'final',
    category: 'vital-signs',
    code: {
      coding: [{ system: 'http://loinc.org', code: '9279-1', display: 'Respiratory rate' }],
      text: 'Respiratory Rate'
    },
    subject: { reference: 'Patient/patient-rostova-002', display: 'Elena Rostova' },
    effectiveDateTime: '2026-08-27T10:15:00Z',
    valueQuantity: { value: 22, unit: 'breaths/min' },
    interpretation: { coding: [{ system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation', code: 'H', display: 'Tachypneic' }] }
  }
];

export const INITIAL_CONDITIONS: FHIRCondition[] = [
  {
    resourceType: 'Condition',
    id: 'cond-wilson-t2dm',
    clinicalStatus: 'active',
    verificationStatus: 'confirmed',
    category: 'problem-list-item',
    severity: 'moderate',
    code: {
      coding: [{ system: 'http://hl7.org/fhir/sid/icd-10-cm', code: 'E11.69', display: 'Type 2 diabetes mellitus with other specified complication' }],
      text: 'Type 2 Diabetes Mellitus'
    },
    subject: { reference: 'Patient/patient-wilson-001', display: 'James Wilson' },
    onsetDateTime: '2018-05-12',
    recordedDate: '2026-01-10',
    recorder: { display: 'Dr. Eleanor Vance, MD' },
    note: 'Suboptimal glycemic control. Last HbA1c 8.4%. Consider adding GLP-1 RA or SGLT-2 inhibitor.'
  },
  {
    resourceType: 'Condition',
    id: 'cond-wilson-htn',
    clinicalStatus: 'active',
    verificationStatus: 'confirmed',
    category: 'problem-list-item',
    severity: 'moderate',
    code: {
      coding: [{ system: 'http://hl7.org/fhir/sid/icd-10-cm', code: 'I10', display: 'Essential (primary) hypertension' }],
      text: 'Essential Hypertension'
    },
    subject: { reference: 'Patient/patient-wilson-001', display: 'James Wilson' },
    onsetDateTime: '2015-03-20',
    recordedDate: '2026-01-10',
    recorder: { display: 'Dr. Eleanor Vance, MD' },
    note: 'On Lisinopril 20mg daily. Recent ambulatory readings elevated at 148/92.'
  },
  {
    resourceType: 'Condition',
    id: 'cond-wilson-ckd',
    clinicalStatus: 'active',
    verificationStatus: 'confirmed',
    category: 'problem-list-item',
    severity: 'moderate',
    code: {
      coding: [{ system: 'http://hl7.org/fhir/sid/icd-10-cm', code: 'N18.31', display: 'Chronic kidney disease, stage 3a' }],
      text: 'Chronic Kidney Disease Stage 3a'
    },
    subject: { reference: 'Patient/patient-wilson-001', display: 'James Wilson' },
    onsetDateTime: '2023-09-14',
    recordedDate: '2026-08-20',
    recorder: { display: 'Dr. Eleanor Vance, MD' },
    note: 'eGFR 58 mL/min. Monitor renal function and avoid nephrotoxic agents.'
  },
  {
    resourceType: 'Condition',
    id: 'cond-rostova-asthma',
    clinicalStatus: 'active',
    verificationStatus: 'confirmed',
    category: 'problem-list-item',
    severity: 'moderate',
    code: {
      coding: [{ system: 'http://hl7.org/fhir/sid/icd-10-cm', code: 'J45.41', display: 'Moderate persistent asthma with (acute) exacerbation' }],
      text: 'Moderate Persistent Asthma with Acute Exacerbation'
    },
    subject: { reference: 'Patient/patient-rostova-002', display: 'Elena Rostova' },
    onsetDateTime: '2026-08-25',
    recordedDate: '2026-08-27',
    recorder: { display: 'Marcus Chen, RN' },
    note: 'Triggered by recent upper respiratory viral infection. Wheezing on expiration.'
  }
];

export const INITIAL_ALLERGIES: FHIRAllergyIntolerance[] = [
  {
    resourceType: 'AllergyIntolerance',
    id: 'all-wilson-penicillin',
    clinicalStatus: 'active',
    verificationStatus: 'confirmed',
    type: 'allergy',
    category: ['medication'],
    criticality: 'high',
    code: {
      text: 'Penicillin G / Amoxicillin',
      coding: [{ system: 'http://www.nlm.nih.gov/research/umls/rxnorm', code: '7980', display: 'Penicillin' }]
    },
    patient: { reference: 'Patient/patient-wilson-001', display: 'James Wilson' },
    reaction: [
      {
        substance: 'Amoxicillin',
        manifestation: ['Anaphylaxis', 'Urticaria / Generalized Hives', 'Bronchospasm'],
        severity: 'severe'
      }
    ]
  },
  {
    resourceType: 'AllergyIntolerance',
    id: 'all-wilson-sulfa',
    clinicalStatus: 'active',
    verificationStatus: 'confirmed',
    type: 'allergy',
    category: ['medication'],
    criticality: 'low',
    code: {
      text: 'Sulfamethoxazole / Trimethoprim (Bactrim)',
      coding: [{ system: 'http://www.nlm.nih.gov/research/umls/rxnorm', code: '10167', display: 'Sulfonamides' }]
    },
    patient: { reference: 'Patient/patient-wilson-001', display: 'James Wilson' },
    reaction: [
      {
        substance: 'Bactrim',
        manifestation: ['Maculopapular rash', 'Pruritus'],
        severity: 'moderate'
      }
    ]
  }
];

export const INITIAL_MEDICATIONS: FHIRMedicationRequest[] = [
  {
    resourceType: 'MedicationRequest',
    id: 'med-wilson-metformin',
    status: 'active',
    intent: 'order',
    medicationCodeableConcept: {
      text: 'Metformin Hydrochloride 1000 mg Oral Tablet Extended Release',
      coding: [{ system: 'http://www.nlm.nih.gov/research/umls/rxnorm', code: '861004', display: 'Metformin 1000mg ER' }]
    },
    subject: { reference: 'Patient/patient-wilson-001', display: 'James Wilson' },
    authoredOn: '2026-02-15T10:00:00Z',
    requester: { reference: 'Practitioner/user-doc-vance', display: 'Dr. Eleanor Vance, MD' },
    dosageInstruction: [
      {
        text: 'Take 1 tablet (1000 mg) orally twice daily with meals',
        route: 'Oral',
        doseQuantity: { value: 1000, unit: 'mg' },
        timing: { repeat: { frequency: 2, period: 1, periodUnit: 'd' } }
      }
    ],
    dispenseRequest: {
      numberOfRepeatsAllowed: 3,
      quantity: { value: 60, unit: 'tablets' },
      expectedSupplyDuration: { value: 30, unit: 'days' }
    },
    isMARAdministered: true,
    lastAdministeredTime: '2026-08-27T08:00:00Z',
    marStatus: 'given'
  },
  {
    resourceType: 'MedicationRequest',
    id: 'med-wilson-lisinopril',
    status: 'active',
    intent: 'order',
    medicationCodeableConcept: {
      text: 'Lisinopril 20 mg Oral Tablet',
      coding: [{ system: 'http://www.nlm.nih.gov/research/umls/rxnorm', code: '314076', display: 'Lisinopril 20mg' }]
    },
    subject: { reference: 'Patient/patient-wilson-001', display: 'James Wilson' },
    authoredOn: '2026-02-15T10:00:00Z',
    requester: { reference: 'Practitioner/user-doc-vance', display: 'Dr. Eleanor Vance, MD' },
    dosageInstruction: [
      {
        text: 'Take 1 tablet (20 mg) orally every morning',
        route: 'Oral',
        doseQuantity: { value: 20, unit: 'mg' },
        timing: { repeat: { frequency: 1, period: 1, periodUnit: 'd' } }
      }
    ],
    dispenseRequest: {
      numberOfRepeatsAllowed: 5,
      quantity: { value: 30, unit: 'tablets' },
      expectedSupplyDuration: { value: 30, unit: 'days' }
    },
    isMARAdministered: true,
    lastAdministeredTime: '2026-08-27T08:00:00Z',
    marStatus: 'given'
  },
  {
    resourceType: 'MedicationRequest',
    id: 'med-wilson-atorvastatin',
    status: 'active',
    intent: 'order',
    medicationCodeableConcept: {
      text: 'Atorvastatin Calcium 40 mg Oral Tablet',
      coding: [{ system: 'http://www.nlm.nih.gov/research/umls/rxnorm', code: '259255', display: 'Atorvastatin 40mg' }]
    },
    subject: { reference: 'Patient/patient-wilson-001', display: 'James Wilson' },
    authoredOn: '2026-02-15T10:00:00Z',
    requester: { reference: 'Practitioner/user-doc-vance', display: 'Dr. Eleanor Vance, MD' },
    dosageInstruction: [
      {
        text: 'Take 1 tablet (40 mg) orally at bedtime for cardiovascular prophylaxis',
        route: 'Oral',
        doseQuantity: { value: 40, unit: 'mg' },
        timing: { repeat: { frequency: 1, period: 1, periodUnit: 'd' } }
      }
    ],
    dispenseRequest: {
      numberOfRepeatsAllowed: 5,
      quantity: { value: 30, unit: 'tablets' },
      expectedSupplyDuration: { value: 30, unit: 'days' }
    },
    isMARAdministered: false,
    marStatus: 'due'
  }
];

export const INITIAL_ENCOUNTERS: FHIREncounter[] = [
  {
    resourceType: 'Encounter',
    id: 'enc-wilson-current',
    status: 'in-progress',
    class: { code: 'VR', display: 'Virtual Telehealth Care Consultation' },
    type: [{ text: 'Comprehensive Chronic Disease Follow-up & Intake Review' }],
    subject: { reference: 'Patient/patient-wilson-001', display: 'James Wilson' },
    participant: [
      { individual: { reference: 'Practitioner/user-doc-vance', display: 'Dr. Eleanor Vance, MD' } },
      { individual: { reference: 'Practitioner/user-nurse-chen', display: 'Marcus Chen, RN' } }
    ],
    period: { start: '2026-08-27T14:15:00Z' },
    reasonCode: [{ text: 'Follow-up for elevated HbA1c (8.4%) and blood pressure titration' }],
    serviceProvider: { display: 'Connected Care Comprehensive Telehealth Service' },
    location: [{ location: { display: 'Virtual Telehealth Examination Suite #3' }, status: 'active' }],
    triageAcuity: 'Level 3 (Urgent)'
  },
  {
    resourceType: 'Encounter',
    id: 'enc-rostova-triage',
    status: 'triaged',
    class: { code: 'AMB', display: 'Ambulatory Urgent Care Clinic' },
    type: [{ text: 'Acute Asthma Exacerbation Intake & Nebulizer Treatment' }],
    subject: { reference: 'Patient/patient-rostova-002', display: 'Elena Rostova' },
    participant: [
      { individual: { reference: 'Practitioner/user-nurse-chen', display: 'Marcus Chen, RN' } }
    ],
    period: { start: '2026-08-27T10:00:00Z' },
    reasonCode: [{ text: 'Shortness of breath, chest tightness, wheezing' }],
    serviceProvider: { display: 'Connected Care Urgent Care Pavilion' },
    location: [{ location: { display: 'Triage Bay 2' }, status: 'active' }],
    triageAcuity: 'Level 2 (Emergent)'
  },
  {
    resourceType: 'Encounter',
    id: 'enc-sterling-checkout',
    status: 'finished',
    class: { code: 'AMB', display: 'Outpatient Orthopedic Clinic' },
    type: [{ text: 'Post-Op Knee Arthroscopy Week 4 Check' }],
    subject: { reference: 'Patient/patient-sterling-003', display: 'Marcus Sterling' },
    participant: [
      { individual: { reference: 'Practitioner/user-doc-vance', display: 'Dr. Eleanor Vance, MD' } }
    ],
    period: { start: '2026-08-27T08:30:00Z', end: '2026-08-27T09:15:00Z' },
    reasonCode: [{ text: 'Post-surgical range of motion and pain assessment' }],
    serviceProvider: { display: 'Connected Care Orthopedic Clinic' },
    location: [{ location: { display: 'Exam Room 104' }, status: 'completed' }],
    triageAcuity: 'Level 4 (Less Urgent)'
  }
];

export const INITIAL_CARE_PLANS: FHIRCarePlan[] = [
  {
    resourceType: 'CarePlan',
    id: 'cp-wilson-dm-htn',
    status: 'active',
    intent: 'plan',
    title: 'Type 2 Diabetes & Cardiorenal Protection Plan',
    description: 'Multidisciplinary pathway optimizing glycemic control (target HbA1c < 7.0%), blood pressure control (<130/80 mmHg), and renal function monitoring.',
    subject: { reference: 'Patient/patient-wilson-001', display: 'James Wilson' },
    period: { start: '2026-01-15' },
    category: { text: 'Chronic Disease Management' },
    activity: [
      {
        id: 'act-1',
        detail: {
          code: { text: 'Daily Home Blood Pressure & Blood Glucose Log' },
          status: 'in-progress',
          scheduledTiming: 'Every Morning Before Breakfast',
          description: 'Patient logs fasting glucose and resting systolic/diastolic BP into patient portal app',
          assignedRole: 'patient'
        }
      },
      {
        id: 'act-2',
        detail: {
          code: { text: 'Medication Administration & Refill Reconciliation' },
          status: 'in-progress',
          scheduledTiming: 'Bi-weekly',
          description: 'Nurse reconciliation of Metformin ER, Lisinopril, and Atorvastatin compliance',
          assignedRole: 'nurse'
        }
      },
      {
        id: 'act-3',
        detail: {
          code: { text: 'Order Repeat Renal Panel (BUN/Cr/eGFR) & Microalbuminuria' },
          status: 'scheduled',
          scheduledTiming: 'In 6 weeks',
          description: 'Evaluate eGFR trajectory and titrate ACE inhibitor dosage',
          assignedRole: 'physician'
        }
      },
      {
        id: 'act-4',
        detail: {
          code: { text: 'Diabetic Foot & Retinal Eye Screening Referral' },
          status: 'scheduled',
          scheduledTiming: 'Within 30 days',
          description: 'Annual comprehensive dilated retinal exam and monofilament foot assessment',
          assignedRole: 'nurse'
        }
      }
    ]
  }
];

export const INITIAL_DIAGNOSTIC_REPORTS: FHIRDiagnosticReport[] = [
  {
    resourceType: 'DiagnosticReport',
    id: 'diag-wilson-cmp',
    status: 'final',
    category: { text: 'Chemistry / Laboratory' },
    code: {
      text: 'Comprehensive Metabolic Panel (CMP-14)',
      coding: [{ code: '80053', display: 'Comprehensive metabolic panel' }]
    },
    subject: { reference: 'Patient/patient-wilson-001', display: 'James Wilson' },
    effectiveDateTime: '2026-08-20T08:15:00Z',
    issued: '2026-08-20T11:40:00Z',
    performer: [{ display: 'Central Clinical Pathology Laboratories' }],
    conclusion: 'Suboptimal fasting glucose at 164 mg/dL. Elevated serum creatinine 1.4 mg/dL with corresponding eGFR 58 mL/min/1.73m2 consistent with early CKD Stage 3a. Serum potassium 4.6 mEq/L (normal). LFTs within normal limits.',
    resultsInterpreter: { display: 'Dr. Gregory House, MD (Pathologist)' }
  },
  {
    resourceType: 'DiagnosticReport',
    id: 'diag-wilson-echo',
    status: 'final',
    category: { text: 'Cardiovascular Imaging' },
    code: {
      text: 'Transthoracic Echocardiogram (TTE)',
      coding: [{ code: '93306', display: 'Echocardiography, transthoracic' }]
    },
    subject: { reference: 'Patient/patient-wilson-001', display: 'James Wilson' },
    effectiveDateTime: '2026-06-10T14:00:00Z',
    issued: '2026-06-11T09:30:00Z',
    performer: [{ display: 'Connected Care Noninvasive Cardiology Lab' }],
    conclusion: 'Normal left ventricular systolic function with LVEF 58%. Mild concentric left ventricular hypertrophy secondary to chronic hypertension. Grade 1 diastolic dysfunction (impaired relaxation). No hemodynamically significant valvular stenosis or regurgitation.',
    resultsInterpreter: { display: 'Dr. Evelyn Reed, MD (Cardiologist)' }
  }
];

export const INITIAL_DOCUMENTS: FHIRDocumentReference[] = [
  {
    resourceType: 'DocumentReference',
    id: 'doc-wilson-sbar-01',
    status: 'current',
    type: { text: 'GenAI Clinical Hand-off & SBAR Summary' },
    subject: { reference: 'Patient/patient-wilson-001', display: 'James Wilson' },
    date: '2026-08-27T13:45:00Z',
    author: { display: 'Health Intake Bot & Care Coordinator AI', role: 'GenAI Service' },
    title: 'Automated Hand-off Summary for Virtual Care Follow-up',
    content: [
      {
        attachment: {
          contentType: 'application/json',
          title: 'SBAR Structured Hand-off Data',
          structuredContent: {
            situation: 'Patient James Wilson (62yo M) presenting for scheduled virtual care follow-up regarding persistent elevated blood pressure readings at home (145-152 systolic) and review of recent laboratory panel (HbA1c 8.4%).',
            background: 'Established patient with Type 2 Diabetes (6+ yrs), Primary Hypertension, and early CKD 3a (eGFR 58). Currently prescribed Metformin ER 1000mg BID and Lisinopril 20mg daily. Known severe anaphylactic allergy to Penicillin.',
            assessment: 'Elevated cardiovascular risk profile with suboptimal glycemic control and persistent Stage 2 hypertension despite mono-antihypertensive therapy. Renal function stable but mildly compromised.',
            recommendation: '1. Titrate antihypertensive therapy (consider adding Amlodipine 5mg or SGLT2 inhibitor e.g., Empagliflozin). 2. Re-educate on low-sodium dietary adherence. 3. Schedule 4-week virtual follow-up with repeat home BP log review.'
          }
        }
      }
    ]
  }
];

// ERP Billing & Reimbursement Datasets (Front-Desk Checkout Integration)
export const INITIAL_ERP_CLAIMS: ERPClaimSummary[] = [
  {
    claimId: 'ERP-CLM-2026-88401',
    encounterId: 'enc-wilson-current',
    patientId: 'patient-wilson-001',
    payerName: 'BlueCross BlueShield Premier PPO',
    policyNumber: 'BCBS-IL-89240182',
    groupNumber: 'GRP-77402',
    claimStatus: 'In-Review',
    totalBilledAmount: 285.00,
    insurancePaidAmount: 245.00,
    patientCopayDue: 40.00,
    patientDeductibleRemaining: 0.00,
    patientTotalBalance: 40.00,
    isPaidAtFrontDesk: false,
    dateOfService: '2026-08-27',
    priorAuthCode: 'AUTH-993821',
    items: [
      {
        cptCode: '99214',
        description: 'Office or other outpatient visit for the evaluation and management of an established patient (Moderate Medical Decision Making - 30-39 mins)',
        units: 1,
        unitPrice: 195.00,
        totalPrice: 195.00,
        insuranceAllowed: 165.00,
        copayApplicable: 40.00,
        coinsurance: 0.00
      },
      {
        cptCode: '99442',
        description: 'Virtual-Care Telehealth synchronous audio/video medical discussion (21-30 minutes)',
        units: 1,
        unitPrice: 90.00,
        totalPrice: 90.00,
        insuranceAllowed: 80.00,
        copayApplicable: 0.00,
        coinsurance: 0.00
      }
    ]
  },
  {
    claimId: 'ERP-CLM-2026-77312',
    encounterId: 'enc-rostova-triage',
    patientId: 'patient-rostova-002',
    payerName: 'Aetna Open Choice HDHP',
    policyNumber: 'AET-IL-5540192',
    groupNumber: 'GRP-33100',
    claimStatus: 'Approved',
    totalBilledAmount: 410.00,
    insurancePaidAmount: 335.00,
    patientCopayDue: 75.00,
    patientDeductibleRemaining: 150.00,
    patientTotalBalance: 75.00,
    isPaidAtFrontDesk: false,
    dateOfService: '2026-08-27',
    items: [
      {
        cptCode: '99283',
        description: 'Urgent Care / Emergency Department visit for the evaluation of a patient (Moderate Acuity)',
        units: 1,
        unitPrice: 280.00,
        totalPrice: 280.00,
        insuranceAllowed: 230.00,
        copayApplicable: 50.00,
        coinsurance: 0.00
      },
      {
        cptCode: '94640',
        description: 'Pressurized or nonpressurized inhalation treatment for acute airway obstruction (Nebulizer Treatment)',
        units: 1,
        unitPrice: 130.00,
        totalPrice: 130.00,
        insuranceAllowed: 105.00,
        copayApplicable: 25.00,
        coinsurance: 0.00
      }
    ]
  },
  {
    claimId: 'ERP-CLM-2026-60281',
    encounterId: 'enc-sterling-checkout',
    patientId: 'patient-sterling-003',
    payerName: 'Medicare Part B / UnitedHealthcare Advantage',
    policyNumber: 'MED-9948271',
    groupNumber: 'GRP-10022',
    claimStatus: 'Approved',
    totalBilledAmount: 220.00,
    insurancePaidAmount: 195.00,
    patientCopayDue: 25.00,
    patientDeductibleRemaining: 0.00,
    patientTotalBalance: 25.00,
    isPaidAtFrontDesk: true,
    paymentMethod: 'Credit Card',
    paymentTimestamp: '2026-08-27T09:20:00Z',
    receiptNumber: 'RCPT-2026-0827-0941',
    dateOfService: '2026-08-27',
    items: [
      {
        cptCode: '99213',
        description: 'Office Outpatient Visit - Low-to-Moderate Complexity (Post-Op Check)',
        units: 1,
        unitPrice: 145.00,
        totalPrice: 145.00,
        insuranceAllowed: 125.00,
        copayApplicable: 25.00,
        coinsurance: 0.00
      },
      {
        cptCode: '97110',
        description: 'Therapeutic exercises to develop strength, endurance, range of motion (15 min physical therapy check)',
        units: 1,
        unitPrice: 75.00,
        totalPrice: 75.00,
        insuranceAllowed: 70.00,
        copayApplicable: 0.00,
        coinsurance: 0.00
      }
    ]
  }
];

// Secure Messaging Suite Initial Threads
export const INITIAL_MESSAGE_THREADS: MessageThread[] = [
  {
    id: 'thread-wilson-vance',
    patientId: 'patient-wilson-001',
    patientName: 'James Wilson',
    subject: 'Blood Pressure Log & Medication Refill Question',
    category: 'clinical_consult',
    lastMessageTimestamp: '2026-08-27T11:20:00Z',
    unreadCount: 1,
    isUrgent: false,
    participants: [
      { id: 'user-patient-wilson', name: 'James Wilson', role: 'patient' },
      { id: 'user-doc-vance', name: 'Dr. Eleanor Vance, MD', role: 'physician' },
      { id: 'user-nurse-chen', name: 'Marcus Chen, RN', role: 'nurse' }
    ],
    messages: [
      {
        id: 'msg-01',
        threadId: 'thread-wilson-vance',
        senderId: 'user-patient-wilson',
        senderName: 'James Wilson',
        senderRole: 'patient',
        senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        recipientId: 'user-doc-vance',
        recipientName: 'Dr. Eleanor Vance, MD',
        timestamp: '2026-08-27T10:45:00Z',
        content: 'Hello Dr. Vance, I have been logging my morning blood pressures as requested. For the past 3 days they have been averaging around 148/92. Should I adjust my Lisinopril dose before our virtual visit this afternoon?',
        isRead: true,
        attachments: [
          {
            type: 'fhir_observation',
            title: 'Blood Pressure Observation (148/92 mmHg)',
            referenceId: 'obs-wilson-bp-01',
            previewText: 'Systolic: 148 mmHg, Diastolic: 92 mmHg (LOINC 85354-9)'
          }
        ]
      },
      {
        id: 'msg-02',
        threadId: 'thread-wilson-vance',
        senderId: 'user-nurse-chen',
        senderName: 'Marcus Chen, RN',
        senderRole: 'nurse',
        senderAvatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
        recipientId: 'user-patient-wilson',
        recipientName: 'James Wilson',
        timestamp: '2026-08-27T11:05:00Z',
        content: 'Hi James, thank you for checking in. Please maintain your current Lisinopril 20mg dose for today. Dr. Vance has reviewed your log in the FHIR Connected Care portal and will discuss medication adjustments during your 2:15 PM video visit.',
        isRead: true
      },
      {
        id: 'msg-03',
        threadId: 'thread-wilson-vance',
        senderId: 'user-patient-wilson',
        senderName: 'James Wilson',
        senderRole: 'patient',
        senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        recipientId: 'user-nurse-chen',
        recipientName: 'Marcus Chen, RN',
        timestamp: '2026-08-27T11:20:00Z',
        content: 'Understood Marcus! I completed the Health Intake Bot questionnaire earlier today so the clinical summary should be ready for Dr. Vance.',
        isRead: false
      }
    ]
  },
  {
    id: 'thread-rostova-nurse',
    patientId: 'patient-rostova-002',
    patientName: 'Elena Rostova',
    subject: 'Urgent Care Follow-up & Inhaler Technique',
    category: 'intake_handoff',
    lastMessageTimestamp: '2026-08-27T10:35:00Z',
    unreadCount: 0,
    isUrgent: true,
    participants: [
      { id: 'user-patient-rostova', name: 'Elena Rostova', role: 'patient' },
      { id: 'user-nurse-chen', name: 'Marcus Chen, RN', role: 'nurse' }
    ],
    messages: [
      {
        id: 'msg-rostova-01',
        threadId: 'thread-rostova-nurse',
        senderId: 'user-nurse-chen',
        senderName: 'Marcus Chen, RN',
        senderRole: 'nurse',
        senderAvatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
        recipientId: 'user-patient-rostova',
        recipientName: 'Elena Rostova',
        timestamp: '2026-08-27T10:35:00Z',
        content: 'Elena, your post-nebulizer SpO2 has improved to 97%. Please continue using your spacer device with the Albuterol inhaler every 4-6 hours as needed for coughing or wheezing.',
        isRead: true,
        isUrgent: true
      }
    ]
  }
];

// Pre-configured Virtual Care Scheduler Slots
export const INITIAL_SCHEDULER_SLOTS: VirtualAppointmentSlot[] = [
  {
    id: 'slot-vance-01',
    providerId: 'user-doc-vance',
    providerName: 'Dr. Eleanor Vance, MD',
    providerRole: 'Attending Physician',
    providerSpecialty: 'Internal Medicine & Cardiorenal Health',
    providerAvatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80',
    startTime: '2026-08-27T14:15:00Z',
    endTime: '2026-08-27T14:45:00Z',
    durationMinutes: 30,
    appointmentType: 'Virtual Video Telehealth',
    status: 'booked',
    roomUrl: 'https://connectedcare.health/room/telehealth-vance-wilson',
    aiMatchScore: 98,
    aiMatchReason: 'Assigned Primary Care Provider with deep longitudinal history in HTN & Type 2 Diabetes management.'
  },
  {
    id: 'slot-vance-02',
    providerId: 'user-doc-vance',
    providerName: 'Dr. Eleanor Vance, MD',
    providerRole: 'Attending Physician',
    providerSpecialty: 'Internal Medicine & Cardiorenal Health',
    providerAvatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80',
    startTime: '2026-08-27T15:30:00Z',
    endTime: '2026-08-27T16:00:00Z',
    durationMinutes: 30,
    appointmentType: 'Virtual Video Telehealth',
    status: 'available',
    aiMatchScore: 95,
    aiMatchReason: 'Optimal next available slot for comprehensive medication titration & clinical review.'
  },
  {
    id: 'slot-chen-01',
    providerId: 'user-nurse-chen',
    providerName: 'Marcus Chen, RN',
    providerRole: 'Senior Triage Nurse',
    providerSpecialty: 'Acute Triage & Care Management',
    providerAvatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
    startTime: '2026-08-27T15:00:00Z',
    endTime: '2026-08-27T15:15:00Z',
    durationMinutes: 15,
    appointmentType: 'Urgent Triage Call',
    status: 'available',
    aiMatchScore: 92,
    aiMatchReason: 'Rapid 15-minute nurse touchpoint for home BP measurement technique & dietary coaching.'
  }
];

export const INITIAL_PREDICTIVE_ROUTINGS: Record<string, PredictiveTaskRouting> = {
  'patient-wilson-001': {
    taskId: 'task-route-wilson-01',
    patientId: 'patient-wilson-001',
    taskTitle: 'Chronic Disease Titration & Cardiorenal Consultation',
    priority: 'Urgent',
    targetRole: 'physician',
    targetDepartment: 'Internal Medicine / Cardiology',
    recommendedProviderId: 'user-doc-vance',
    recommendedProviderName: 'Dr. Eleanor Vance, MD',
    estimatedConsultMinutes: 30,
    slaTargetMinutes: 60,
    rationale: 'Elevated HbA1c (8.4%) combined with persistent home blood pressure spikes (148/92) and early CKD 3a requires dual medication titration (SGLT2i / CCB) by Attending Physician.',
    actionChecklist: [
      'Review continuous home BP average from FHIR observation store',
      'Verify renal safety profile (eGFR 58 mL/min) before prescribing nephroprotective agent',
      'Cross-check Penicillin allergy warning before prescribing any antimicrobial',
      'Coordinate with Front-Desk Registrar for ERP billing copay verification ($40.00)'
    ],
    aiConfidenceScore: 0.96
  },
  'patient-rostova-002': {
    taskId: 'task-route-rostova-02',
    patientId: 'patient-rostova-002',
    taskTitle: 'Acute Respiratory Assessment & Nebulizer Protocol',
    priority: 'Stat (Immediate)',
    targetRole: 'nurse',
    targetDepartment: 'Acute Care & Tele-Triage',
    recommendedProviderId: 'user-nurse-chen',
    recommendedProviderName: 'Marcus Chen, RN',
    estimatedConsultMinutes: 20,
    slaTargetMinutes: 15,
    rationale: 'Patient exhibits tachypnea (RR 22) and borderline pulse oximetry (SpO2 94%) in context of acute asthma flare. Immediate nurse-led respiratory protocol indicated.',
    actionChecklist: [
      'Perform continuous SpO2 pulse oximetry monitoring',
      'Administer Albuterol / Ipratropium nebulizer treatment per standing orders',
      'Assess post-treatment peak flow rate and lung auscultation',
      'Document MEWS acuity change in nurse shift handover'
    ],
    aiConfidenceScore: 0.94
  }
};
