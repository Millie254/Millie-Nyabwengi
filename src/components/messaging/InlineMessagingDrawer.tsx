import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Paperclip,
  CheckCircle2,
  Bot,
  User,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useFHIR } from '../../context/FHIRContext';

interface InlineMessagingDrawerProps {
  onOpenFullSuite: () => void;
}

export const InlineMessagingDrawer: React.FC<InlineMessagingDrawerProps> = ({ onOpenFullSuite }) => {
  const { currentUser } = useAuth();
  const { activePatient, messageThreads, sendSecureMessage } = useFHIR();

  const [isExpanded, setIsExpanded] = useState(false);
  const [activeThreadId, setActiveThreadId] = useState<string>(messageThreads[0]?.id || 'thread-001');
  const [messageInput, setMessageInput] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeThread = messageThreads.find((t) => t.id === activeThreadId) || messageThreads[0];
  const unreadCount = messageThreads.reduce((acc, t) => acc + (t.unreadCount || 0), 0);

  useEffect(() => {
    if (isExpanded) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isExpanded, activeThread?.messages.length]);

  const handleSend = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const text = customText || messageInput;
    if (!text.trim() || !activeThread) return;

    await sendSecureMessage(activeThread.id, text, isUrgent);
    setMessageInput('');
    setIsUrgent(false);
  };

  const smartRepliesByRole: Record<string, string[]> = {
    physician: [
      'Orders reviewed and approved. Monitor renal panel.',
      'Titrated Amlodipine 5mg QD. Please verify BP in 48 hours.',
      'Consult note filed. ERP prior authorization verified.'
    ],
    nurse: [
      'Vitals captured & logged into FHIR store. MEWS score 2 (Stable).',
      'Morning dose administered per MAR protocol. No adverse events.',
      'Patient reported mild dizziness; notified attending.'
    ],
    registrar: [
      'Insurance 270/271 verified. Copay $40.00 collected.',
      'Prior authorization request submitted to Blue Cross.',
      'Patient checked in. Telehealth room link dispatched.'
    ],
    patient: [
      'I have logged my morning BP reading.',
      'Thank you doctor, I received the prescription update.',
      'Can I confirm the copay amount for my follow-up visit?'
    ]
  };

  const roleSmartReplies = smartRepliesByRole[currentUser.role] || smartRepliesByRole.physician;

  return (
    <div className="fixed bottom-0 right-4 z-40 w-96 max-w-[calc(100vw-2rem)] transition-all duration-200">
      {/* Collapsed Bar / Header */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="bg-slate-900 text-white px-4 py-2.5 rounded-t-xl shadow-2xl border-t border-x border-slate-800 flex items-center justify-between cursor-pointer select-none hover:bg-slate-800 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <MessageSquare className="w-3.5 h-3.5" />
            </div>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center ring-2 ring-slate-900">
                {unreadCount}
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-white">Care Team Chat</span>
              <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.2 rounded">
                HIPAA
              </span>
            </div>
            <p className="text-[10px] text-slate-400 truncate max-w-[170px]">
              As {currentUser.name} ({currentUser.role.toUpperCase()})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-slate-400">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenFullSuite();
            }}
            className="p-1 hover:text-white hover:bg-slate-700 rounded transition-colors"
            title="Open Full Messaging Suite"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
          <div className="p-1 text-slate-400">
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </div>
        </div>
      </div>

      {/* Expanded Chat Drawer */}
      {isExpanded && (
        <div className="bg-white border-x border-b border-slate-200 shadow-2xl rounded-b-none h-[420px] flex flex-col overflow-hidden animate-in fade-in duration-150">
          {/* Thread Selection Pill Bar */}
          <div className="px-3 py-2 bg-slate-50 border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto shrink-0">
            {messageThreads.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveThreadId(t.id)}
                className={`px-2.5 py-1 rounded text-[11px] font-medium whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1 ${
                  activeThreadId === t.id
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>{t.subject.split(' ')[0]}...</span>
                {t.unreadCount > 0 && (
                  <span className="w-3.5 h-3.5 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                    {t.unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Active Thread Subject Banner */}
          <div className="px-3.5 py-1.5 bg-indigo-50/50 border-b border-indigo-100 flex items-center justify-between text-xs shrink-0">
            <span className="font-semibold text-slate-800 truncate">{activeThread?.subject}</span>
            <span className="text-[10px] text-indigo-700 font-mono">Patient/{activePatient.id}</span>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-3 overflow-y-auto space-y-3 bg-white text-xs">
            {activeThread?.messages.map((msg) => {
              const isMe = msg.senderRole === currentUser.role || msg.senderName.includes(currentUser.name);

              return (
                <div key={msg.id} className={`flex items-start gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
                  <img
                    src={msg.senderAvatar || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100'}
                    alt={msg.senderName}
                    className="w-6 h-6 rounded-md object-cover border border-slate-200 shrink-0 mt-0.5"
                  />
                  <div className={`max-w-[78%] space-y-0.5 ${isMe ? 'text-right' : ''}`}>
                    <div className="flex items-center gap-1 text-[10px] text-slate-400">
                      <span className="font-semibold text-slate-700">{msg.senderName}</span>
                      <span>({msg.senderRole})</span>
                      {msg.isUrgent && (
                        <span className="px-1 text-[9px] font-bold bg-rose-100 text-rose-700 rounded">STAT</span>
                      )}
                    </div>
                    <div
                      className={`p-2.5 rounded-lg text-xs leading-relaxed text-left ${
                        isMe
                          ? 'bg-indigo-600 text-white shadow-2xs'
                          : 'bg-slate-50 text-slate-800 border border-slate-200'
                      }`}
                    >
                      <p>{msg.content}</p>
                      <span className={`block text-[9px] mt-1 ${isMe ? 'text-indigo-200' : 'text-slate-400'}`}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Smart Reply Suggestions */}
          <div className="px-3 py-1.5 bg-indigo-50/40 border-t border-slate-100 shrink-0">
            <div className="flex items-center gap-1 text-[10px] text-indigo-700 font-semibold mb-1">
              <Sparkles className="w-3 h-3" />
              <span>Smart Replies for {currentUser.name.split(' ')[0]}:</span>
            </div>
            <div className="flex gap-1 overflow-x-auto pb-1">
              {roleSmartReplies.slice(0, 2).map((reply, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSend(undefined, reply)}
                  className="px-2 py-0.5 text-[10px] bg-white hover:bg-indigo-50 text-slate-700 hover:text-indigo-900 border border-slate-200 rounded transition-colors cursor-pointer shrink-0 truncate max-w-[170px]"
                  title={reply}
                >
                  {reply}
                </button>
              ))}
            </div>
          </div>

          {/* Input Form */}
          <form onSubmit={handleSend} className="p-2 bg-slate-50 border-t border-slate-200 flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setIsUrgent(!isUrgent)}
              className={`px-1.5 py-1 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                isUrgent ? 'bg-rose-100 text-rose-800 border-rose-300' : 'bg-white text-slate-500 border-slate-200'
              }`}
              title="Urgent Flag"
            >
              STAT
            </button>

            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder={`Message care team as ${currentUser.name.split(' ')[0]}...`}
              className="flex-1 text-xs bg-white border border-slate-200 rounded-full px-3 py-1.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />

            <button
              type="submit"
              disabled={!messageInput.trim()}
              className="p-1.5 rounded-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white transition-all shadow-2xs cursor-pointer shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
