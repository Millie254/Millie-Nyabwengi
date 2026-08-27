import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FHIRProvider, useFHIR } from './context/FHIRContext';
import { Header } from './components/common/Header';
import { PhysicianView } from './components/views/PhysicianView';
import { NurseView } from './components/views/NurseView';
import { FrontDeskView } from './components/views/FrontDeskView';
import { PatientPortalView } from './components/views/PatientPortalView';
import { SecureMessagingSuite } from './components/messaging/SecureMessagingSuite';
import { InlineMessagingDrawer } from './components/messaging/InlineMessagingDrawer';
import { TelehealthRoomModal } from './components/telehealth/TelehealthRoomModal';
import { FHIRInspectorModal } from './components/fhir/FHIRInspectorModal';
import {
  Stethoscope,
  Activity,
  CreditCard,
  User,
  ShieldCheck,
  ChevronRight,
  Database,
  Sparkles
} from 'lucide-react';
import { RoleType } from './types/fhir';

const MainAppContent: React.FC = () => {
  const { currentUser, switchRole } = useAuth();
  const [isFHIRInspectorOpen, setIsFHIRInspectorOpen] = useState(false);
  const [isTelehealthOpen, setIsTelehealthOpen] = useState(false);
  const [isMessagingOpen, setIsMessagingOpen] = useState(false);

  // Render role-specific UI components
  const renderRoleView = () => {
    switch (currentUser.role) {
      case 'physician':
        return <PhysicianView />;
      case 'nurse':
        return <NurseView />;
      case 'registrar':
        return <FrontDeskView />;
      case 'patient':
        return <PatientPortalView onOpenTelehealth={() => setIsTelehealthOpen(true)} />;
      default:
        return <PhysicianView />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans antialiased selection:bg-indigo-500 selection:text-white">
      {/* Top Universal Connected Care Header */}
      <Header
        onOpenFHIRInspector={() => setIsFHIRInspectorOpen(true)}
        onOpenTelehealth={() => setIsTelehealthOpen(true)}
        onToggleMessaging={() => setIsMessagingOpen(!isMessagingOpen)}
        isMessagingOpen={isMessagingOpen}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6 pb-24">
        {renderRoleView()}
      </main>

      {/* Persistent Quick Role Switcher Floating Dock (Geometric Balance Theme) */}
      <aside aria-label="Role Switcher Dock" className="fixed bottom-5 left-1/2 -translate-x-1/2 z-30 bg-slate-900/95 backdrop-blur-md border border-slate-800 px-3 py-2 rounded-xl shadow-2xl flex items-center gap-2 text-white">
        <div className="w-6 h-6 bg-indigo-500 rounded-md flex items-center justify-center text-white font-bold text-xs">C</div>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 hidden sm:inline border-r border-slate-800 pr-3">
          Role Mode:
        </span>
        <button
          onClick={() => switchRole('physician')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
            currentUser.role === 'physician'
              ? 'bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-400'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Stethoscope className="w-3.5 h-3.5" />
          <span>Physician</span>
        </button>

        <button
          onClick={() => switchRole('nurse')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
            currentUser.role === 'nurse'
              ? 'bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-400'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Nurse / MAR</span>
        </button>

        <button
          onClick={() => switchRole('registrar')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
            currentUser.role === 'registrar'
              ? 'bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-400'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Front-Desk (ERP)</span>
        </button>

        <button
          onClick={() => switchRole('patient')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
            currentUser.role === 'patient'
              ? 'bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-400'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Patient Portal</span>
        </button>
      </aside>

      {/* Persistent Inline Secure Messaging Care-Team Drawer */}
      <InlineMessagingDrawer onOpenFullSuite={() => setIsMessagingOpen(true)} />

      {/* Modals */}
      <SecureMessagingSuite
        isOpen={isMessagingOpen}
        onClose={() => setIsMessagingOpen(false)}
      />

      <TelehealthRoomModal
        isOpen={isTelehealthOpen}
        onClose={() => setIsTelehealthOpen(false)}
      />

      <FHIRInspectorModal
        isOpen={isFHIRInspectorOpen}
        onClose={() => setIsFHIRInspectorOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <FHIRProvider>
        <MainAppContent />
      </FHIRProvider>
    </AuthProvider>
  );
}
