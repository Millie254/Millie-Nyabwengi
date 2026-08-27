import React from 'react';
import {
  Activity,
  ShieldCheck,
  UserCheck,
  Code2,
  Video,
  MessageSquare,
  CreditCard,
  Sparkles,
  ChevronDown,
  Clock,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useFHIR } from '../../context/FHIRContext';
import { RoleType } from '../../types/fhir';

interface HeaderProps {
  onOpenFHIRInspector: () => void;
  onOpenTelehealth: () => void;
  onToggleMessaging: () => void;
  isMessagingOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenFHIRInspector,
  onOpenTelehealth,
  onToggleMessaging,
  isMessagingOpen
}) => {
  const { currentUser, allUsers, switchUser } = useAuth();
  const { patients, activePatient, setActivePatientId, messageThreads, erpClaim } = useFHIR();

  const totalUnreadMessages = messageThreads.reduce((acc, t) => acc + (t.unreadCount || 0), 0);

  const getRoleBadgeColor = (role: RoleType) => {
    switch (role) {
      case 'physician':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'nurse':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'registrar':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'patient':
        return 'bg-purple-50 text-purple-700 border-purple-200';
    }
  };

  const getRoleLabel = (role: RoleType) => {
    switch (role) {
      case 'physician':
        return 'Physician / Clinician View';
      case 'nurse':
        return 'Nurse / Care Coordinator View';
      case 'registrar':
        return 'Front-Desk / ERP Checkout View';
      case 'patient':
        return 'Patient Portal & Intake View';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      {/* Top Banner: Service Integration Status */}
      <div className="bg-slate-900 text-slate-300 text-xs px-4 py-1.5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="flex items-center gap-1.5 font-medium text-white">
            <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            FHIR API Hub R4 Foundation
          </span>
          <span className="text-slate-500">•</span>
          <span className="flex items-center gap-1 text-slate-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            Connected Care Platform Active
          </span>
          <span className="text-slate-500">•</span>
          <span className="flex items-center gap-1 text-slate-300">
            <Sparkles className="w-3 h-3 text-indigo-400" />
            GenAI Hand-off & Task Routing (Gemini 3.7)
          </span>
          <span className="text-slate-500">•</span>
          <span className="flex items-center gap-1 text-slate-300">
            <CreditCard className="w-3 h-3 text-amber-400" />
            ERP Connector: Claims & Copay
          </span>
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>HIPAA Secure Auth Context</span>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand & Platform Identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
            C
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold text-slate-900 leading-none">Connected Care Hub</h1>
              <span className="px-2.5 py-0.5 text-[10px] font-bold bg-indigo-100 text-indigo-700 rounded-full uppercase tracking-wider">
                FHIR R4
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Enterprise Clinical & Ambulatory Suite</p>
          </div>
        </div>

        {/* Center: Patient Switcher (Context-Aware) */}
        <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
          <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
            FHIR Connected:
          </span>
          <select
            id="active-patient-selector"
            value={activePatient.id}
            onChange={(e) => setActivePatientId(e.target.value)}
            className="text-xs font-semibold text-slate-800 bg-white border border-slate-200 rounded-md px-2.5 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-2xs"
          >
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name[0].text} ({p.gender === 'male' ? 'M' : 'F'}, {p.age}y) — ID: {p.identifier[0].value}
              </option>
            ))}
          </select>
        </div>

        {/* Right Tools & Role Persona Switcher */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Virtual Telehealth Room Launcher */}
          <button
            id="btn-telehealth-launcher"
            onClick={onOpenTelehealth}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors shadow-2xs cursor-pointer"
            title="Launch Virtual-Care Telehealth Examination Suite"
          >
            <Video className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden sm:inline">Telehealth Suite</span>
          </button>

          {/* Secure Messaging Suite Button */}
          <button
            id="btn-toggle-messaging"
            onClick={onToggleMessaging}
            className={`relative flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors shadow-2xs cursor-pointer ${
              isMessagingOpen
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'text-slate-700 bg-white hover:bg-slate-50 border-slate-200'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Messaging</span>
            {totalUnreadMessages > 0 && (
              <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                {totalUnreadMessages}
              </span>
            )}
          </button>

          {/* Raw FHIR Inspector Button */}
          <button
            id="btn-open-fhir-inspector"
            onClick={onOpenFHIRInspector}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors shadow-2xs cursor-pointer"
            title="Inspect Raw FHIR R4 Bundle JSON"
          >
            <Code2 className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden md:inline">FHIR JSON</span>
          </button>

          {/* Role Persona Switcher (Unified Auth Context) */}
          <div className="relative pl-2 border-l border-slate-200 flex items-center gap-2">
            <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-lg border border-slate-200">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-7 h-7 rounded-md object-cover border border-white shadow-2xs"
              />
              <div className="text-left pr-1 hidden lg:block">
                <p className="text-xs font-bold text-slate-900 leading-tight">{currentUser.name}</p>
                <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">{currentUser.role}</p>
              </div>
              <select
                id="user-persona-switcher"
                value={currentUser.id}
                onChange={(e) => switchUser(e.target.value)}
                className="text-xs font-medium bg-white text-slate-800 border border-slate-200 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-2xs"
              >
                {allUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Role Context Bar */}
      <div className="bg-slate-50 border-t border-slate-200 px-4 sm:px-6 py-2 flex items-center justify-between flex-wrap gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-medium">Active Role UI:</span>
          <span className={`px-2.5 py-0.5 rounded-md font-semibold border ${getRoleBadgeColor(currentUser.role)}`}>
            {getRoleLabel(currentUser.role)}
          </span>
          <span className="text-slate-400">|</span>
          <span className="text-slate-600">{currentUser.department}</span>
        </div>

        <div className="flex items-center gap-4 text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-700">MRN:</span>
            <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-800 font-bold">
              {activePatient.identifier[0].value}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-700">Insurance:</span>
            <span className="text-slate-800 font-medium">{erpClaim.payerName.split(' ')[0]}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-700">Copay:</span>
            <span className={`font-semibold ${erpClaim.isPaidAtFrontDesk ? 'text-emerald-600' : 'text-amber-600'}`}>
              ${erpClaim.patientCopayDue.toFixed(2)} {erpClaim.isPaidAtFrontDesk ? '(Paid)' : '(Due)'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
