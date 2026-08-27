import React, { useState } from 'react';
import {
  MessageSquare,
  Send,
  Paperclip,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  User,
  ShieldCheck,
  Clock,
  X,
  FileText,
  Activity
} from 'lucide-react';
import { useFHIR } from '../../context/FHIRContext';
import { useAuth } from '../../context/AuthContext';
import { MessageThread, SecureMessage } from '../../types/fhir';

interface SecureMessagingSuiteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SecureMessagingSuite: React.FC<SecureMessagingSuiteProps> = ({ isOpen, onClose }) => {
  const { currentUser } = useAuth();
  const { messageThreads, sendSecureMessage, markThreadRead, activePatient } = useFHIR();

  const [activeThreadId, setActiveThreadId] = useState<string>(messageThreads[0]?.id || 'thread-001');
  const [messageInput, setMessageInput] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [smartReplies, setSmartReplies] = useState<string[]>([
    'I have reviewed your home BP log and added Amlodipine 5mg to your regimen.',
    'Please schedule a repeat metabolic panel in 4 weeks.',
    'Your symptoms are noted. If you experience dizziness or shortness of breath, please call triage immediately.'
  ]);

  if (!isOpen) return null;

  const activeThread = messageThreads.find((t) => t.id === activeThreadId) || messageThreads[0];

  const handleSelectThread = (thread: MessageThread) => {
    setActiveThreadId(thread.id);
    markThreadRead(thread.id);
  };

  const handleSendMessage = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const text = customText || messageInput;
    if (!text.trim()) return;

    await sendSecureMessage(activeThreadId, text, isUrgent);
    setMessageInput('');
    setIsUrgent(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-4xl h-[650px] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Top Header */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold">Secure Messaging Suite</h3>
                <span className="px-2 py-0.2 text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  HIPAA Encrypted
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Authenticated as {currentUser.name} ({currentUser.role.toUpperCase()})</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2-Column Messaging Layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* Thread List Sidebar */}
          <div className="w-72 border-r border-slate-200 bg-slate-50 flex flex-col shrink-0">
            <div className="p-3 border-b border-slate-200">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Clinical Threads ({messageThreads.length})</p>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {messageThreads.map((thread) => {
                const isActive = thread.id === activeThreadId;
                const lastMessage = thread.messages[thread.messages.length - 1];
                return (
                  <button
                    key={thread.id}
                    onClick={() => handleSelectThread(thread)}
                    className={`w-full text-left p-3 transition-colors cursor-pointer block ${
                      isActive ? 'bg-indigo-50/80 border-l-4 border-indigo-600' : 'hover:bg-slate-100/80'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1">
                      <h4 className="text-xs font-semibold text-slate-900 truncate">{thread.subject}</h4>
                      {thread.unreadCount > 0 && (
                        <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                          {thread.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">{lastMessage?.content || 'No messages yet'}</p>
                    <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400">
                      <span>{thread.patientName}</span>
                      <span>{new Date(thread.lastMessageTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Thread Chat Area */}
          <div className="flex-1 flex flex-col bg-white">
            {/* Thread Header */}
            <div className="p-3.5 border-b border-slate-200 bg-white flex items-center justify-between shrink-0">
              <div>
                <h4 className="text-sm font-semibold text-slate-900">{activeThread?.subject}</h4>
                <p className="text-xs text-slate-500">
                  Patient: <strong className="text-slate-700">{activeThread?.patientName}</strong> • Care Team Thread
                </p>
              </div>
              <span className="px-2.5 py-0.5 text-xs font-semibold bg-slate-100 text-slate-700 rounded-full font-mono text-[11px]">
                FHIR: Patient/{activePatient.id}
              </span>
            </div>

            {/* Messages Stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {activeThread?.messages.map((msg) => {
                const isMe = msg.senderRole === currentUser.role || msg.senderId === 'current-user';
                return (
                  <div key={msg.id} className={`flex items-start gap-2.5 ${isMe ? 'flex-row-reverse' : ''}`}>
                    <img
                      src={msg.senderAvatar}
                      alt={msg.senderName}
                      className="w-8 h-8 rounded-lg object-cover border border-slate-200 shrink-0"
                    />
                    <div className={`max-w-[75%] space-y-1 ${isMe ? 'text-right' : ''}`}>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                        <span className="font-semibold text-slate-800">{msg.senderName}</span>
                        <span>•</span>
                        <span className="capitalize">{msg.senderRole}</span>
                        {msg.isUrgent && (
                          <span className="px-1.5 py-0.2 bg-rose-100 text-rose-800 font-bold rounded text-[9px]">
                            URGENT
                          </span>
                        )}
                      </div>

                      <div
                        className={`p-3 rounded-lg text-xs leading-relaxed text-left ${
                          isMe
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'bg-slate-50 text-slate-800 border border-slate-200/80'
                        }`}
                      >
                        <p>{msg.content}</p>

                        {/* Attachments */}
                        {msg.attachments && msg.attachments.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-white/20 space-y-1">
                            {msg.attachments.map((att, i) => (
                              <div key={i} className="flex items-center gap-1 text-[11px] font-medium bg-black/10 px-2 py-1 rounded">
                                <Activity className="w-3 h-3" />
                                <span>Attached: {att.title}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <span className="block text-[10px] text-slate-400">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Smart Reply Suggestions */}
            <div className="px-4 py-2 bg-indigo-50/50 border-t border-slate-100 shrink-0">
              <div className="flex items-center gap-1.5 text-[11px] text-indigo-700 font-semibold mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>GenAI Smart Reply Drafts:</span>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {smartReplies.map((reply, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(undefined, reply)}
                    className="px-2.5 py-1 text-[11px] bg-white hover:bg-indigo-100 text-slate-700 hover:text-indigo-900 border border-slate-200 hover:border-indigo-300 rounded-md transition-colors cursor-pointer shrink-0 truncate max-w-[280px]"
                    title={reply}
                  >
                    {reply}
                  </button>
                ))}
              </div>
            </div>

            {/* Message Input Box */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 bg-white flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsUrgent(!isUrgent)}
                className={`p-2 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                  isUrgent ? 'bg-rose-100 text-rose-800 border-rose-300' : 'bg-slate-50 text-slate-600 border-slate-200'
                }`}
                title="Toggle Urgent Priority"
              >
                <AlertCircle className="w-4 h-4 text-rose-600" />
              </button>

              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Type a HIPAA-compliant secure clinical message..."
                className="flex-1 text-xs bg-slate-100 border-0 rounded-full px-4 py-2.5 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />

              <button
                type="submit"
                disabled={!messageInput.trim()}
                className="p-2.5 rounded-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white transition-all shadow-xs cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
