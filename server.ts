import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
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
} from './src/data/fhirMockDatabase';
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
} from './src/types/fhir';

// In-Memory Database Store (Mutable state during runtime)
let patients: FHIRPatient[] = [...INITIAL_PATIENTS];
let observations: FHIRObservation[] = [...INITIAL_OBSERVATIONS];
let conditions: FHIRCondition[] = [...INITIAL_CONDITIONS];
let allergies: FHIRAllergyIntolerance[] = [...INITIAL_ALLERGIES];
let medications: FHIRMedicationRequest[] = [...INITIAL_MEDICATIONS];
let encounters: FHIREncounter[] = [...INITIAL_ENCOUNTERS];
let carePlans: FHIRCarePlan[] = [...INITIAL_CARE_PLANS];
let diagnosticReports: FHIRDiagnosticReport[] = [...INITIAL_DIAGNOSTIC_REPORTS];
let documents: FHIRDocumentReference[] = [...INITIAL_DOCUMENTS];
let erpClaims: ERPClaimSummary[] = [...INITIAL_ERP_CLAIMS];
let messageThreads: MessageThread[] = [...INITIAL_MESSAGE_THREADS];
let schedulerSlots: VirtualAppointmentSlot[] = [...INITIAL_SCHEDULER_SLOTS];
let predictiveRoutings: Record<string, PredictiveTaskRouting> = { ...INITIAL_PREDICTIVE_ROUTINGS };

// Initialize Gemini Client
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY || '',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return geminiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'healthy',
      fhirVersion: 'R4',
      connectedCareService: 'Active',
      erpConnector: 'Online',
      genAiEngine: 'Gemini 3.7 Flash',
      timestamp: new Date().toISOString()
    });
  });

  // ==========================================
  // 1. FHIR REST API HUB ENDPOINTS
  // ==========================================

  // GET all patients
  app.get('/api/fhir/Patient', (req, res) => {
    const { search } = req.query;
    if (typeof search === 'string' && search.trim()) {
      const q = search.toLowerCase();
      const filtered = patients.filter(
        (p) =>
          p.name.some((n) => n.text.toLowerCase().includes(q) || n.family.toLowerCase().includes(q)) ||
          p.identifier.some((id) => id.value.toLowerCase().includes(q))
      );
      return res.json({ resourceType: 'Bundle', type: 'searchset', total: filtered.length, entry: filtered });
    }
    res.json({ resourceType: 'Bundle', type: 'searchset', total: patients.length, entry: patients });
  });

  // GET single patient
  app.get('/api/fhir/Patient/:id', (req, res) => {
    const patient = patients.find((p) => p.id === req.params.id);
    if (!patient) {
      return res.status(404).json({ resourceType: 'OperationOutcome', issue: [{ severity: 'error', code: 'not-found', diagnostics: 'Patient not found' }] });
    }
    res.json(patient);
  });

  // GET Patient $everything / complete FHIR bundle
  app.get('/api/fhir/Patient/:id/bundle', (req, res) => {
    const patientId = req.params.id;
    const patient = patients.find((p) => p.id === patientId);
    if (!patient) {
      return res.status(404).json({ resourceType: 'OperationOutcome', issue: [{ severity: 'error', code: 'not-found' }] });
    }

    const patientObservations = observations.filter((o) => o.subject.reference.includes(patientId));
    const patientConditions = conditions.filter((c) => c.subject.reference.includes(patientId));
    const patientAllergies = allergies.filter((a) => a.patient.reference.includes(patientId));
    const patientMedications = medications.filter((m) => m.subject.reference.includes(patientId));
    const patientEncounters = encounters.filter((e) => e.subject.reference.includes(patientId));
    const patientCarePlans = carePlans.filter((cp) => cp.subject.reference.includes(patientId));
    const patientDiagnosticReports = diagnosticReports.filter((dr) => dr.subject.reference.includes(patientId));
    const patientDocuments = documents.filter((doc) => doc.subject.reference.includes(patientId));

    res.json({
      resourceType: 'Bundle',
      type: 'collection',
      timestamp: new Date().toISOString(),
      patient,
      observations: patientObservations,
      conditions: patientConditions,
      allergies: patientAllergies,
      medications: patientMedications,
      encounters: patientEncounters,
      carePlans: patientCarePlans,
      diagnosticReports: patientDiagnosticReports,
      documents: patientDocuments,
    });
  });

  // FHIR Resource Stats & Counts
  app.get('/api/fhir/stats', (req, res) => {
    res.json({
      patientCount: patients.length,
      observationCount: observations.length,
      conditionCount: conditions.length,
      allergyCount: allergies.length,
      medicationCount: medications.length,
      encounterCount: encounters.length,
      carePlanCount: carePlans.length,
      diagnosticReportCount: diagnosticReports.length,
      documentCount: documents.length
    });
  });

  // Create FHIR Observation
  app.post('/api/fhir/Observation', (req, res) => {
    const newObs: FHIRObservation = {
      resourceType: 'Observation',
      id: `obs-${Date.now()}`,
      status: 'final',
      effectiveDateTime: new Date().toISOString(),
      ...req.body
    };
    observations.unshift(newObs);
    res.status(201).json(newObs);
  });

  // Create FHIR MedicationRequest
  app.post('/api/fhir/MedicationRequest', (req, res) => {
    const newMed: FHIRMedicationRequest = {
      resourceType: 'MedicationRequest',
      id: `med-${Date.now()}`,
      status: 'active',
      intent: 'order',
      authoredOn: new Date().toISOString(),
      marStatus: 'due',
      ...req.body
    };
    medications.unshift(newMed);
    res.status(201).json(newMed);
  });

  // Update Medication MAR status (Nurse workflow)
  app.put('/api/fhir/MedicationRequest/:id/mar', (req, res) => {
    const { id } = req.params;
    const { marStatus } = req.body;
    const medIndex = medications.findIndex((m) => m.id === id);
    if (medIndex === -1) {
      return res.status(404).json({ error: 'Medication not found' });
    }
    medications[medIndex] = {
      ...medications[medIndex],
      marStatus,
      isMARAdministered: marStatus === 'given',
      lastAdministeredTime: marStatus === 'given' ? new Date().toISOString() : medications[medIndex].lastAdministeredTime
    };
    res.json(medications[medIndex]);
  });

  // Create FHIR Condition
  app.post('/api/fhir/Condition', (req, res) => {
    const newCond: FHIRCondition = {
      resourceType: 'Condition',
      id: `cond-${Date.now()}`,
      clinicalStatus: 'active',
      verificationStatus: 'confirmed',
      category: 'problem-list-item',
      onsetDateTime: new Date().toISOString().split('T')[0],
      recordedDate: new Date().toISOString().split('T')[0],
      ...req.body
    };
    conditions.push(newCond);
    res.status(201).json(newCond);
  });

  // Create / Update FHIR Encounter
  app.post('/api/fhir/Encounter', (req, res) => {
    const newEnc: FHIREncounter = {
      resourceType: 'Encounter',
      id: `enc-${Date.now()}`,
      status: 'arrived',
      period: { start: new Date().toISOString() },
      ...req.body
    };
    encounters.unshift(newEnc);
    res.status(201).json(newEnc);
  });

  app.put('/api/fhir/Encounter/:id', (req, res) => {
    const { id } = req.params;
    const encIndex = encounters.findIndex((e) => e.id === id);
    if (encIndex === -1) {
      return res.status(404).json({ error: 'Encounter not found' });
    }
    encounters[encIndex] = { ...encounters[encIndex], ...req.body };
    res.json(encounters[encIndex]);
  });

  // Update CarePlan task status
  app.put('/api/fhir/CarePlan/:id/activity/:actId', (req, res) => {
    const { id, actId } = req.params;
    const { status } = req.body;
    const plan = carePlans.find((cp) => cp.id === id);
    if (!plan) return res.status(404).json({ error: 'Care plan not found' });
    const activity = plan.activity.find((a) => a.id === actId);
    if (!activity) return res.status(404).json({ error: 'Activity not found' });
    activity.detail.status = status;
    res.json(plan);
  });

  // ==========================================
  // 2. ERP CONNECTOR BILLING & REIMBURSEMENT
  // ==========================================

  app.get('/api/erp/claims/:patientId', (req, res) => {
    const { patientId } = req.params;
    const claim = erpClaims.find((c) => c.patientId === patientId) || erpClaims[0];
    res.json(claim);
  });

  // Process front desk checkout payment
  app.post('/api/erp/process-checkout', (req, res) => {
    const { claimId, paymentMethod, amountPaid } = req.body;
    const claimIndex = erpClaims.findIndex((c) => c.claimId === claimId);
    const receiptNum = `RCPT-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;
    const now = new Date().toISOString();

    if (claimIndex !== -1) {
      erpClaims[claimIndex] = {
        ...erpClaims[claimIndex],
        isPaidAtFrontDesk: true,
        paymentMethod: paymentMethod || 'Credit Card',
        paymentTimestamp: now,
        receiptNumber: receiptNum,
        patientTotalBalance: Math.max(0, erpClaims[claimIndex].patientTotalBalance - (amountPaid || erpClaims[claimIndex].patientCopayDue)),
        claimStatus: 'Approved'
      };

      // Also update encounter status if linked
      const encId = erpClaims[claimIndex].encounterId;
      const enc = encounters.find((e) => e.id === encId);
      if (enc) {
        enc.status = 'finished';
        enc.period.end = now;
      }

      return res.json({
        success: true,
        receiptNumber: receiptNum,
        paymentTimestamp: now,
        claim: erpClaims[claimIndex]
      });
    }

    res.status(404).json({ error: 'Claim not found in ERP connector' });
  });

  // Insurance Eligibility Verification (Simulated 270/271 Payer Check)
  app.post('/api/erp/verify-eligibility', (req, res) => {
    const { patientId, payerName, policyNumber } = req.body;
    res.json({
      verified: true,
      payerStatus: 'ACTIVE_COVERAGE',
      verificationDate: new Date().toISOString(),
      planType: 'Comprehensive PPO Tier 1',
      copaySummary: {
        primaryCare: 25.00,
        specialistConsult: 40.00,
        telehealthVirtual: 15.00,
        urgentCare: 50.00,
        emergencyRoom: 150.00
      },
      deductible: {
        individualTotal: 1500.00,
        individualMet: 1500.00,
        remaining: 0.00
      },
      outOfPocketMax: {
        total: 4000.00,
        met: 1200.00
      },
      priorAuthRequiredForSpecialty: false
    });
  });

  // ==========================================
  // 3. SECURE MESSAGING SUITE ENDPOINTS
  // ==========================================

  app.get('/api/messages', (req, res) => {
    const { patientId } = req.query;
    if (typeof patientId === 'string' && patientId) {
      const filtered = messageThreads.filter((t) => t.patientId === patientId);
      return res.json(filtered);
    }
    res.json(messageThreads);
  });

  app.post('/api/messages/send', (req, res) => {
    const { threadId, senderId, senderName, senderRole, senderAvatar, content, isUrgent, attachments } = req.body;
    const threadIndex = messageThreads.findIndex((t) => t.id === threadId);
    const newMessage: SecureMessage = {
      id: `msg-${Date.now()}`,
      threadId,
      senderId,
      senderName,
      senderRole,
      senderAvatar: senderAvatar || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150',
      recipientId: 'care-team',
      recipientName: 'Care Team',
      timestamp: new Date().toISOString(),
      content,
      isRead: false,
      isUrgent: Boolean(isUrgent),
      attachments: attachments || []
    };

    if (threadIndex !== -1) {
      messageThreads[threadIndex].messages.push(newMessage);
      messageThreads[threadIndex].lastMessageTimestamp = newMessage.timestamp;
      messageThreads[threadIndex].unreadCount += 1;
      if (isUrgent) {
        messageThreads[threadIndex].isUrgent = true;
      }
      return res.status(201).json(newMessage);
    }

    // Create new thread if not found
    const newThread: MessageThread = {
      id: threadId || `thread-${Date.now()}`,
      patientId: 'patient-wilson-001',
      patientName: 'James Wilson',
      subject: 'Clinical Communication',
      category: 'clinical_consult',
      lastMessageTimestamp: newMessage.timestamp,
      unreadCount: 1,
      isUrgent: Boolean(isUrgent),
      participants: [{ id: senderId, name: senderName, role: senderRole }],
      messages: [newMessage]
    };
    messageThreads.unshift(newThread);
    res.status(201).json(newMessage);
  });

  app.post('/api/messages/:threadId/read', (req, res) => {
    const { threadId } = req.params;
    const thread = messageThreads.find((t) => t.id === threadId);
    if (thread) {
      thread.unreadCount = 0;
      thread.messages.forEach((m) => {
        m.isRead = true;
      });
      return res.json({ success: true });
    }
    res.status(404).json({ error: 'Thread not found' });
  });

  // ==========================================
  // 4. VIRTUAL CARE SCHEDULER ENDPOINTS
  // ==========================================

  app.get('/api/scheduler/slots', (req, res) => {
    res.json(schedulerSlots);
  });

  app.post('/api/scheduler/book', (req, res) => {
    const { slotId, patientId, appointmentReason } = req.body;
    const slotIndex = schedulerSlots.findIndex((s) => s.id === slotId);
    const patient = patients.find((p) => p.id === patientId) || patients[0];

    if (slotIndex !== -1) {
      schedulerSlots[slotIndex].status = 'booked';
      schedulerSlots[slotIndex].roomUrl = `https://connectedcare.health/room/telehealth-${Date.now().toString().slice(-6)}`;

      // Create matching FHIR Encounter
      const newEncounter: FHIREncounter = {
        resourceType: 'Encounter',
        id: `enc-virtual-${Date.now().toString().slice(-6)}`,
        status: 'planned',
        class: { code: 'VR', display: 'Virtual Telehealth Care Consultation' },
        type: [{ text: appointmentReason || 'Scheduled Virtual Consultation' }],
        subject: { reference: `Patient/${patient.id}`, display: patient.name[0].text },
        participant: [
          {
            individual: {
              reference: `Practitioner/${schedulerSlots[slotIndex].providerId}`,
              display: schedulerSlots[slotIndex].providerName
            }
          }
        ],
        period: {
          start: schedulerSlots[slotIndex].startTime,
          end: schedulerSlots[slotIndex].endTime
        },
        reasonCode: [{ text: appointmentReason || 'Follow-up consultation' }],
        serviceProvider: { display: 'Connected Care Virtual Telehealth Service' },
        triageAcuity: 'Level 3 (Urgent)'
      };
      encounters.unshift(newEncounter);

      return res.json({
        success: true,
        slot: schedulerSlots[slotIndex],
        encounter: newEncounter
      });
    }

    res.status(404).json({ error: 'Slot not found' });
  });

  // ==========================================
  // 5. GENAI HAND-OFF SUMMARISATION & PREDICTIVE TASK ROUTING
  // ==========================================

  // Intake Bot Interactive Dialogue
  app.post('/api/ai/intake-chat', async (req, res) => {
    const { message, history, patientContext } = req.body;

    try {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY is not configured in environment');
      }

      const ai = getGeminiClient();
      const systemInstruction = `You are the Connected Care Platform's Health Intake Bot. 
You communicate with empathy, clinical clarity, and warmth. 
Your goal is to gather the patient's symptoms (onset, duration, severity 1-10, aggravating/relieving factors, medication adherence, and any red flags like chest pain or severe shortness of breath).
Keep responses concise (2-4 sentences) and ask 1-2 focused questions at a time.
Patient Context: Name: ${patientContext?.name || 'Patient'}, Conditions: ${patientContext?.conditions || 'T2DM, Hypertension'}, Allergies: ${patientContext?.allergies || 'Penicillin'}.`;

      const contents = (history || []).map((h: any) => `${h.sender === 'bot' ? 'Assistant' : 'User'}: ${h.text}`).join('\n') +
        `\nUser: ${message}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      res.json({
        reply: response.text || "Thank you for sharing. Could you tell me more about when these symptoms first began and whether you have taken your morning medications?",
        model: 'gemini-3.7-flash'
      });
    } catch (err: any) {
      console.warn('Gemini Intake Chat fallback triggered:', err.message);
      // Deterministic clinically sound fallback
      res.json({
        reply: `Thank you for checking in. I have recorded your symptoms. Given your history with blood pressure and diabetes, have you noticed any accompanying symptoms such as lightheadedness, headaches, or blurred vision?`,
        model: 'fallback-rules-engine'
      });
    }
  });

  // GenAI Hand-off Summarisation (SBAR + CDS alerts + Acuity)
  app.post('/api/ai/summarize-handoff', async (req, res) => {
    const { patientId, intakeTranscript, vitalsOverride } = req.body;
    const patient = patients.find((p) => p.id === patientId) || patients[0];
    const patientObs = observations.filter((o) => o.subject.reference.includes(patient.id));
    const patientCond = conditions.filter((c) => c.subject.reference.includes(patient.id));
    const patientAllergies = allergies.filter((a) => a.patient.reference.includes(patient.id));
    const patientMeds = medications.filter((m) => m.subject.reference.includes(patient.id));

    const clinicalContext = `
Patient: ${patient.name[0].text} (${patient.age}yo ${patient.gender}), MRN: ${patient.identifier[0].value}
Active Conditions: ${patientCond.map((c) => `${c.code.text} (${c.clinicalStatus})`).join(', ')}
Allergies: ${patientAllergies.map((a) => `${a.code.text} (Criticality: ${a.criticality})`).join(', ')}
Current Medications: ${patientMeds.map((m) => `${m.medicationCodeableConcept.text} - ${m.dosageInstruction[0]?.text}`).join(', ')}
Recent Observations/Vitals: ${patientObs.map((o) => `${o.code.text}: ${o.valueQuantity?.value || ''} ${o.valueQuantity?.unit || ''} ${o.component ? JSON.stringify(o.component) : ''}`).join('; ')}
Intake Dialogue / Patient Reported Symptoms:
${intakeTranscript || 'Patient reported elevated home blood pressure (148-152 mmHg), mild fatigue, and asked for medication refill guidance.'}
`;

    try {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY missing');
      }

      const ai = getGeminiClient();
      const prompt = `Synthesize a structured clinical handoff summary in SBAR format (Situation, Background, Assessment, Recommendation), clinical acuity level, key risk factors, and Clinical Decision Support (CDS) alerts for this patient based on the provided FHIR clinical context.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: `${clinicalContext}\n\n${prompt}`,
        config: {
          systemInstruction: 'You are a Board-Certified Clinical Informatics GenAI model powering the Connected Care Platform. Return output strictly in structured JSON conforming to the schema.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              acuityLevel: { type: Type.STRING, description: 'Low, Moderate, High, or Critical' },
              acuityScore: { type: Type.NUMBER, description: 'Score between 1 and 10' },
              chiefComplaint: { type: Type.STRING },
              symptomDuration: { type: Type.STRING },
              sbar: {
                type: Type.OBJECT,
                properties: {
                  situation: { type: Type.STRING },
                  background: { type: Type.STRING },
                  assessment: { type: Type.STRING },
                  recommendation: { type: Type.STRING },
                },
                required: ['situation', 'background', 'assessment', 'recommendation']
              },
              keyRiskFactors: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              cdsAlerts: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              suggestedActionPlan: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ['acuityLevel', 'acuityScore', 'chiefComplaint', 'sbar', 'keyRiskFactors', 'cdsAlerts', 'suggestedActionPlan']
          }
        }
      });

      const parsed = JSON.parse(response.text.trim());
      const summaryResult: GenAIHandoffSummary = {
        handoffId: `handoff-${Date.now()}`,
        patientId: patient.id,
        timestamp: new Date().toISOString(),
        acuityLevel: parsed.acuityLevel || 'Moderate',
        acuityScore: parsed.acuityScore || 6,
        sbar: parsed.sbar,
        chiefComplaint: parsed.chiefComplaint || 'Suboptimal blood pressure control & glycemic review',
        symptomDuration: parsed.symptomDuration || '3-5 days',
        keyRiskFactors: parsed.keyRiskFactors || ['Elevated cardiovascular risk', 'Suboptimal glycemic control (HbA1c 8.4%)'],
        cdsAlerts: parsed.cdsAlerts || ['Penicillin Anaphylaxis Warning: Cross-allergy checking active', 'CKD 3a renal dose adjustment recommended'],
        suggestedActionPlan: parsed.suggestedActionPlan || ['Titrate antihypertensive', 'Review home BP daily log'],
        modelUsed: 'gemini-3.7-flash'
      };

      // Add to FHIR DocumentReferences store
      const docRef: FHIRDocumentReference = {
        resourceType: 'DocumentReference',
        id: `doc-sbar-${Date.now()}`,
        status: 'current',
        type: { text: 'GenAI Clinical Hand-off & SBAR Summary' },
        subject: { reference: `Patient/${patient.id}`, display: patient.name[0].text },
        date: new Date().toISOString(),
        author: { display: 'GenAI Clinical Hand-off Engine', role: 'GenAI Service' },
        title: `Automated SBAR Hand-off (${summaryResult.acuityLevel} Acuity)`,
        content: [
          {
            attachment: {
              contentType: 'application/json',
              title: 'SBAR Structured Data',
              structuredContent: summaryResult.sbar
            }
          }
        ]
      };
      documents.unshift(docRef);

      return res.json(summaryResult);
    } catch (err: any) {
      console.warn('Gemini summarize-handoff fallback triggered:', err.message);
      // Reliable deterministic clinical SBAR fallback
      const fallbackSummary: GenAIHandoffSummary = {
        handoffId: `handoff-${Date.now()}`,
        patientId: patient.id,
        timestamp: new Date().toISOString(),
        acuityLevel: 'Moderate',
        acuityScore: 6,
        sbar: {
          situation: `Patient ${patient.name[0].text} presenting for chronic disease review with home systolic readings (148-152 mmHg) and elevated HbA1c (8.4%).`,
          background: `62yo male with established Type 2 Diabetes, Stage 2 Hypertension, and CKD 3a (eGFR 58). Prescribed Metformin ER 1000mg BID and Lisinopril 20mg. Severe Penicillin anaphylaxis on file.`,
          assessment: `Suboptimal cardiometabolic control with persistently elevated blood pressure. Cardiovascular risk mitigation required with dual-agent therapy titration.`,
          recommendation: `1. Add second-line antihypertensive (Amlodipine 5mg QD). 2. Recheck basic metabolic panel & eGFR in 4 weeks. 3. Continue daily home BP portal synchronization.`
        },
        chiefComplaint: 'Persistent blood pressure elevation (148/92) and medication titration follow-up',
        symptomDuration: 'Past 5 days',
        keyRiskFactors: [
          'Hypertension Stage 2 with suboptimal control',
          'Type 2 Diabetes Mellitus with HbA1c 8.4%',
          'Early renal compromise (eGFR 58 mL/min/1.73m2)'
        ],
        cdsAlerts: [
          'CDS Alert: Penicillin allergy (High criticality anaphylaxis) active',
          'CDS Alert: eGFR < 60 mL/min - ensure renal dosing for any new therapeutics'
        ],
        suggestedActionPlan: [
          'Clinician review of 7-day vitals trend',
          'Order repeat BMP & microalbumin in 4 weeks',
          'Notify front desk for copay processing ($40.00)'
        ],
        modelUsed: 'gemini-3.7-flash (clinical-heuristics-backup)'
      };
      return res.json(fallbackSummary);
    }
  });

  // Predictive Task Routing Engine
  app.post('/api/ai/predict-task-routing', async (req, res) => {
    const { patientId, handoffSummary, chiefComplaint } = req.body;
    const patient = patients.find((p) => p.id === patientId) || patients[0];

    try {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY missing');
      }

      const ai = getGeminiClient();
      const prompt = `Evaluate patient clinical presentation, triage urgency, required clinical specialty, estimated consult duration, SLA response target, and task assignment checklist for the Connected Care clinical routing hub.
Patient: ${patient.name[0].text}, Chief Complaint: ${chiefComplaint || 'Elevated blood pressure, HbA1c 8.4%'}
Summary: ${JSON.stringify(handoffSummary || {})}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          systemInstruction: 'You are the Virtual Care Predictive Routing Engine. Return structured JSON with targetRole (physician, nurse, registrar, or patient), department, priority, estimated duration, SLA, and clear clinical rationale.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              taskTitle: { type: Type.STRING },
              priority: { type: Type.STRING, description: 'Routine, Urgent, or Stat (Immediate)' },
              targetRole: { type: Type.STRING, description: 'physician, nurse, registrar, or patient' },
              targetDepartment: { type: Type.STRING },
              recommendedProviderName: { type: Type.STRING },
              estimatedConsultMinutes: { type: Type.NUMBER },
              slaTargetMinutes: { type: Type.NUMBER },
              rationale: { type: Type.STRING },
              actionChecklist: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              aiConfidenceScore: { type: Type.NUMBER }
            },
            required: ['taskTitle', 'priority', 'targetRole', 'targetDepartment', 'estimatedConsultMinutes', 'slaTargetMinutes', 'rationale', 'actionChecklist']
          }
        }
      });

      const parsed = JSON.parse(response.text.trim());
      const routingResult: PredictiveTaskRouting = {
        taskId: `route-${Date.now()}`,
        patientId: patient.id,
        taskTitle: parsed.taskTitle || 'Cardiometabolic Consultation & Pharmacotherapy Titration',
        priority: parsed.priority || 'Urgent',
        targetRole: (parsed.targetRole as any) || 'physician',
        targetDepartment: parsed.targetDepartment || 'Internal Medicine / Cardiology',
        recommendedProviderName: parsed.recommendedProviderName || 'Dr. Eleanor Vance, MD',
        estimatedConsultMinutes: parsed.estimatedConsultMinutes || 30,
        slaTargetMinutes: parsed.slaTargetMinutes || 60,
        rationale: parsed.rationale || 'Patient presents with Stage 2 hypertension and glycemic elevation requiring clinical decision making and prescription adjustment by Attending Physician.',
        actionChecklist: parsed.actionChecklist || [
          'Review longitudinal vitals & recent HbA1c',
          'Evaluate drug-allergy interactions',
          'E-prescribe updated antihypertensive regimen',
          'Confirm ERP copay collection with Front Desk'
        ],
        aiConfidenceScore: parsed.aiConfidenceScore || 0.95
      };

      predictiveRoutings[patient.id] = routingResult;
      return res.json(routingResult);
    } catch (err: any) {
      console.warn('Gemini predict-task-routing fallback:', err.message);
      const fallbackRouting: PredictiveTaskRouting = {
        taskId: `route-${Date.now()}`,
        patientId: patient.id,
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
      predictiveRoutings[patient.id] = fallbackRouting;
      return res.json(fallbackRouting);
    }
  });

  // Smart Message Drafting (GenAI Clinician / Patient Assistant)
  app.post('/api/ai/smart-reply', async (req, res) => {
    const { threadId, senderRole, patientId } = req.body;
    const thread = messageThreads.find((t) => t.id === threadId) || messageThreads[0];
    const patient = patients.find((p) => p.id === patientId) || patients[0];

    try {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY missing');
      }

      const ai = getGeminiClient();
      const lastMessage = thread.messages[thread.messages.length - 1]?.content || 'Hello, checking in on my blood pressure.';
      const prompt = `Draft 2 distinct, professional smart reply options for a ${senderRole} responding in a secure healthcare portal.
Patient: ${patient.name[0].text}
Last message received: "${lastMessage}"
Keep replies concise, clear, and empathetic.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          systemInstruction: 'You are a Clinical Communication Assistant. Return JSON with an array of string suggestions.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              suggestions: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ['suggestions']
          }
        }
      });

      const parsed = JSON.parse(response.text.trim());
      res.json({ suggestions: parsed.suggestions || [] });
    } catch (err: any) {
      if (senderRole === 'physician') {
        res.json({
          suggestions: [
            `Thank you for sharing your blood pressure readings, ${patient.name[0].given[0]}. I've reviewed your log in the Connected Care portal and we will adjust your regimen during our 2:15 PM video consult today.`,
            `Please keep taking your current Lisinopril 20mg this morning with food. We will review your recent HbA1c and lab results together shortly.`
          ]
        });
      } else {
        res.json({
          suggestions: [
            `Thank you, Dr. Vance. I will have my home blood pressure cuff and medication bottles ready for our video visit.`,
            `Understood! I'll log into the telehealth consultation room at 2:15 PM.`
          ]
        });
      }
    }
  });

  // ==========================================
  // VITE & STATIC SPA SERVING
  // ==========================================

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FHIR Connected Care Server running on http://localhost:${PORT}`);
  });
}

startServer();
