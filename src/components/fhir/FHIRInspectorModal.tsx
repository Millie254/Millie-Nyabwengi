import React, { useState } from 'react';
import {
  Code2,
  Copy,
  Check,
  Search,
  Layers,
  Database,
  ExternalLink,
  X
} from 'lucide-react';
import { useFHIR } from '../../context/FHIRContext';

interface FHIRInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FHIRInspectorModal: React.FC<FHIRInspectorModalProps> = ({ isOpen, onClose }) => {
  const {
    activePatient,
    observations,
    conditions,
    allergies,
    medications,
    encounters,
    carePlans,
    diagnosticReports,
    documents
  } = useFHIR();

  const [activeCategory, setActiveCategory] = useState<'Bundle' | 'Patient' | 'Observation' | 'Condition' | 'MedicationRequest' | 'CarePlan' | 'DiagnosticReport'>('Bundle');
  const [copied, setCopied] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const bundleData = {
    resourceType: 'Bundle',
    id: `bundle-patient-${activePatient.id}`,
    type: 'searchset',
    timestamp: new Date().toISOString(),
    total: 1 + observations.length + conditions.length + allergies.length + medications.length + encounters.length + carePlans.length + diagnosticReports.length,
    entry: [
      { fullUrl: `urn:uuid:${activePatient.id}`, resource: activePatient },
      ...observations.map((o) => ({ fullUrl: `urn:uuid:${o.id}`, resource: o })),
      ...conditions.map((c) => ({ fullUrl: `urn:uuid:${c.id}`, resource: c })),
      ...allergies.map((a) => ({ fullUrl: `urn:uuid:${a.id}`, resource: a })),
      ...medications.map((m) => ({ fullUrl: `urn:uuid:${m.id}`, resource: m })),
      ...encounters.map((e) => ({ fullUrl: `urn:uuid:${e.id}`, resource: e })),
      ...carePlans.map((cp) => ({ fullUrl: `urn:uuid:${cp.id}`, resource: cp })),
      ...diagnosticReports.map((dr) => ({ fullUrl: `urn:uuid:${dr.id}`, resource: dr }))
    ]
  };

  const getActiveJSON = () => {
    switch (activeCategory) {
      case 'Patient':
        return activePatient;
      case 'Observation':
        return observations;
      case 'Condition':
        return conditions;
      case 'MedicationRequest':
        return medications;
      case 'CarePlan':
        return carePlans;
      case 'DiagnosticReport':
        return diagnosticReports;
      default:
        return bundleData;
    }
  };

  const jsonString = JSON.stringify(getActiveJSON(), null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-900 text-slate-100 rounded-3xl border border-slate-800 w-full max-w-4xl h-[750px] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <Code2 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">FHIR R4 Raw Resource Inspector</h3>
                <span className="px-2 py-0.2 text-[10px] font-mono font-bold bg-blue-900/60 text-blue-300 border border-blue-700/50 rounded">
                  HL7 FHIR v4.0.1
                </span>
              </div>
              <p className="text-xs text-slate-400">Context: Patient/{activePatient.id} ({activePatient.name[0].text})</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-xl border border-slate-700 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied to Clipboard' : 'Copy JSON'}</span>
            </button>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Category Navigation Pills */}
        <div className="px-6 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center gap-2 overflow-x-auto shrink-0">
          {(['Bundle', 'Patient', 'Observation', 'Condition', 'MedicationRequest', 'CarePlan', 'DiagnosticReport'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1 text-xs font-mono rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                activeCategory === cat
                  ? 'bg-blue-600 text-white font-bold shadow-xs'
                  : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Code Content Area */}
        <div className="flex-1 p-6 overflow-auto bg-slate-950 font-mono text-xs text-blue-300 leading-relaxed select-text">
          <pre>{jsonString}</pre>
        </div>

        {/* Footer */}
        <div className="px-6 py-2 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between shrink-0 font-mono">
          <span>Endpoint: /api/fhir/Patient/{activePatient.id}/bundle</span>
          <span>Status: 200 OK • Content-Type: application/fhir+json</span>
        </div>
      </div>
    </div>
  );
};
