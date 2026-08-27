import React, { useState, useEffect } from 'react';
import {
  Video,
  Mic,
  MicOff,
  VideoOff,
  PhoneOff,
  Activity,
  Heart,
  Sparkles,
  FileText,
  ShieldCheck,
  Maximize2,
  Users,
  Settings,
  X
} from 'lucide-react';
import { useFHIR } from '../../context/FHIRContext';
import { useAuth } from '../../context/AuthContext';

interface TelehealthRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TelehealthRoomModal: React.FC<TelehealthRoomModalProps> = ({ isOpen, onClose }) => {
  const { currentUser } = useAuth();
  const { activePatient, observations, recordObservation } = useFHIR();

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [transcriptLines, setTranscriptLines] = useState<Array<{ speaker: string; text: string; time: string }>>([
    { speaker: 'Dr. Eleanor Vance', text: 'Hello Mr. Wilson, thank you for joining our virtual consultation. I am reviewing your home blood pressure logs.', time: '00:15' },
    { speaker: 'James Wilson', text: 'Good afternoon, Doctor. Yes, my morning systolic readings have been running between 148 and 152.', time: '00:32' },
    { speaker: 'Dr. Eleanor Vance', text: 'I see that. Your recent HbA1c was also 8.4%. We are going to add Amlodipine 5mg to help reach our target BP below 130/80.', time: '00:54' }
  ]);
  const [consultNotes, setConsultNotes] = useState('Patient confirms adherence to Metformin. Advised on adding Amlodipine 5mg QD.');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 text-white rounded-3xl border border-slate-800 w-full max-w-6xl h-[85vh] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Top Control Bar */}
        <div className="px-6 py-3.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold">ConnectedCare Telehealth Video Suite</h3>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  ENCRYPTED WEBRTC SESSION
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Patient: <strong className="text-slate-200">{activePatient.name[0].text}</strong> (MRN: {activePatient.identifier[0].value})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <PhoneOff className="w-4 h-4" />
              <span>End Consultation</span>
            </button>
          </div>
        </div>

        {/* Main 2-Panel Video & Intelligence Grid */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 overflow-hidden">
          {/* Left 2 Cols: Simulated Video Streams & Live Vitals Overlay */}
          <div className="lg:col-span-2 p-4 bg-slate-950 flex flex-col justify-between relative overflow-hidden">
            {/* Primary Video Feed: Remote Patient */}
            <div className="relative flex-1 bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden flex items-center justify-center">
              <img
                src={activePatient.photo}
                alt={activePatient.name[0].text}
                className="w-full h-full object-cover opacity-90"
              />

              {/* Patient Name & Vitals Heads-Up Display (HUD) Overlay */}
              <div className="absolute top-4 left-4 bg-slate-900/85 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-700/60 shadow-lg">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <p className="text-xs font-bold text-white">{activePatient.name[0].text}</p>
                </div>
                <div className="mt-1 flex items-center gap-3 text-[11px] font-mono text-slate-300">
                  <span className="flex items-center gap-1 text-rose-400">
                    <Heart className="w-3 h-3 animate-pulse" /> 84 bpm
                  </span>
                  <span>BP: 148/92</span>
                  <span>SpO2: 97%</span>
                </div>
              </div>

              {/* Clinician PiP (Picture-in-Picture) */}
              <div className="absolute bottom-4 right-4 w-44 h-32 bg-slate-800 rounded-xl border-2 border-indigo-500 overflow-hidden shadow-2xl">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-1 left-2 text-[10px] font-bold bg-black/60 px-1.5 py-0.5 rounded text-white">
                  You ({currentUser.name})
                </div>
              </div>
            </div>

            {/* In-Call Media Toolbar */}
            <div className="mt-4 flex items-center justify-center gap-3 shrink-0">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`p-3 rounded-full border transition-colors cursor-pointer ${
                  isMuted ? 'bg-rose-600 border-rose-600 text-white' : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                }`}
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              <button
                onClick={() => setIsVideoOff(!isVideoOff)}
                className={`p-3 rounded-full border transition-colors cursor-pointer ${
                  isVideoOff ? 'bg-rose-600 border-rose-600 text-white' : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                }`}
                title={isVideoOff ? 'Turn Camera On' : 'Turn Camera Off'}
              >
                {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
              </button>

              <div className="h-6 w-px bg-slate-700 mx-2"></div>

              <div className="text-xs font-mono text-slate-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
                Call Duration: 04:18
              </div>
            </div>
          </div>

          {/* Right Col: Real-Time AI Live Transcription & Clinical Notes */}
          <div className="p-4 bg-slate-900 border-l border-slate-800 flex flex-col justify-between overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Live AI Ambient Scribe</h4>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                Transcribing
              </span>
            </div>

            {/* Transcript Stream */}
            <div className="flex-1 overflow-y-auto py-3 space-y-2.5 font-sans text-xs">
              {transcriptLines.map((t, idx) => (
                <div key={idx} className="p-2.5 bg-slate-800/70 rounded-xl border border-slate-800 space-y-1">
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span className="font-bold text-indigo-300">{t.speaker}</span>
                    <span className="font-mono">{t.time}</span>
                  </div>
                  <p className="text-slate-200 leading-relaxed">{t.text}</p>
                </div>
              ))}
            </div>

            {/* Clinical Note Capture Scratchpad */}
            <div className="pt-3 border-t border-slate-800 shrink-0 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-300 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-blue-400" />
                  Telehealth Progress Note
                </span>
                <span className="text-[10px] text-slate-400">Auto-commits to FHIR DocumentReference</span>
              </div>
              <textarea
                value={consultNotes}
                onChange={(e) => setConsultNotes(e.target.value)}
                rows={3}
                className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
