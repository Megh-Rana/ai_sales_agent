import React, { useState, useEffect } from 'react';
import { 
  X, 
  Mail, 
  Copy, 
  Check, 
  Send, 
  Sparkles, 
  CheckCircle2, 
  Building2, 
  User, 
  Clock, 
  Globe 
} from 'lucide-react';
import { callService, SendPitchEmailRequest } from '../../services/callService';
import { CallingWindowStatus } from '../../utils/timezoneUtils';

interface SendPitchEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyName: string;
  contactName: string;
  contactEmail?: string;
  contactRole?: string;
  pitch: string;
  language?: string;
  requirement?: string;
  timezoneStatus?: CallingWindowStatus;
  leadId?: string;
  onSuccess?: (message: string) => void;
}

export const SendPitchEmailModal: React.FC<SendPitchEmailModalProps> = ({
  isOpen,
  onClose,
  companyName,
  contactName,
  contactEmail = '',
  contactRole = 'Decision Maker',
  pitch,
  language = 'en',
  requirement = '',
  timezoneStatus,
  leadId,
  onSuccess,
}) => {
  const [recipientEmail, setRecipientEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [copied, setCopied] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [deliveryResult, setDeliveryResult] = useState<{ id: string; msg: string } | null>(null);

  // Initialize draft when modal opens or pitch changes
  useEffect(() => {
    if (!isOpen) return;

    const firstName = contactName ? contactName.split(' ')[0] : 'there';
    const fallbackEmail = contactEmail || `${firstName.toLowerCase()}@${companyName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'company'}.com`;
    setRecipientEmail(fallbackEmail);

    const emailSubject = `Introduction & Quick Idea regarding ${companyName}'s ${requirement || 'Automation'}`;
    setSubject(emailSubject);

    // Format clean, executive email draft wrapping the dynamic Ollama pitch
    const emailDraft = `Hi ${firstName},

I hope this note finds you well.

${pitch}

We help companies like ${companyName} eliminate pipeline bottlenecks through autonomous, low-latency AI sales intelligence that integrates directly into your existing CRM workflows.

${requirement ? `Given your recent focus on "${requirement}", I believe our automated workflows could save your team significant ramp-up time.` : ''}

Would you be open to a brief 10-minute introductory conversation this week? If preferred, you can also reply directly with a convenient time.

Best regards,

Alex
Vidur AI Sales Team
support@vidur.in | https://vidur.in`;

    setBody(emailDraft);
    setSentSuccess(false);
    setDeliveryResult(null);
  }, [isOpen, companyName, contactName, contactEmail, pitch, requirement]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSending) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, isSending]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(`To: ${recipientEmail}\nSubject: ${subject}\n\n${body}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientEmail || !recipientEmail.includes('@')) {
      alert('Please enter a valid recipient email address.');
      return;
    }

    setIsSending(true);
    try {
      const payload: SendPitchEmailRequest = {
        recipientEmail,
        recipientName: contactName,
        companyName,
        subject,
        body,
        pitchSnippet: pitch,
        language,
        leadId,
      };

      const res = await callService.sendPitchEmail(payload);
      setSentSuccess(true);
      setDeliveryResult({ id: res.deliveryId, msg: res.message });
      if (onSuccess) {
        onSuccess(`Pitch email dispatched to ${recipientEmail}`);
      }
      setTimeout(() => {
        setIsSending(false);
        onClose();
      }, 2000);
    } catch (err: any) {
      console.error('Failed to send email:', err);
      alert(err.message || 'Failed to dispatch email. Please try again.');
      setIsSending(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in"
      role="presentation"
      onClick={() => !isSending && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Send Prepared Pitch via Email"
        className="bg-[#121620] border border-[#263143] rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#232B3B] bg-[#151B28]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/30 text-primary">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Send Pitch via Email</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30 font-semibold uppercase">
                  Ollama Assisted
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Dispatches your AI-generated opening pitch directly to {companyName}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSending}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Timezone Context Banner if outside calling window */}
        {timezoneStatus && (
          <div className="px-6 py-2.5 bg-[#161D2C] border-b border-[#232B3B] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
              <span>
                Prospect Local Time: <strong className="text-white font-mono">{timezoneStatus.localTimeFormatted}</strong> ({timezoneStatus.timezoneAbbr})
              </span>
            </div>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-semibold ${timezoneStatus.badgeClass}`}>
              {timezoneStatus.label}
            </span>
          </div>
        )}

        {sentSuccess ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-14 h-14 bg-emerald-500/20 border border-emerald-500/40 rounded-full flex items-center justify-center text-emerald-400 mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-white">Email Dispatched Successfully!</h4>
            <p className="text-xs text-slate-300 max-w-sm mx-auto">
              Your personalized pitch has been transmitted to <strong className="text-white">{recipientEmail}</strong>.
            </p>
            {deliveryResult && (
              <span className="inline-block text-[11px] font-mono text-slate-400 bg-slate-900/80 px-3 py-1 rounded border border-slate-800">
                Delivery Tracking: {deliveryResult.id}
              </span>
            )}
          </div>
        ) : (
          <form onSubmit={handleSend} className="p-6 space-y-4">
            {/* Recipient & Contact Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <User className="w-3 h-3 text-slate-400" />
                  Prospect Name
                </label>
                <div className="bg-[#161B26] border border-[#263143] rounded-lg px-3 py-2 text-xs font-medium text-slate-200 truncate">
                  {contactName} ({contactRole})
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Building2 className="w-3 h-3 text-slate-400" />
                  Target Company
                </label>
                <div className="bg-[#161B26] border border-[#263143] rounded-lg px-3 py-2 text-xs font-medium text-slate-200 truncate">
                  {companyName}
                </div>
              </div>
            </div>

            {/* Recipient Email */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Mail className="w-3 h-3 text-primary" />
                  Recipient Email Address
                </span>
                <span className="text-[10px] font-normal text-slate-500">Editable</span>
              </label>
              <input
                type="email"
                required
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full bg-[#0D1017] border border-[#263143] rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            {/* Subject Line */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Subject Line
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Email Subject"
                className="w-full bg-[#0D1017] border border-[#263143] rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            {/* Message Body */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-primary" />
                  Personalized Pitch Outreach Body
                </label>
                <span className="text-[10px] text-slate-400">Includes Ollama Spoken Pitch</span>
              </div>
              <textarea
                rows={8}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full bg-[#0D1017] border border-[#263143] rounded-lg p-3 text-xs text-slate-200 font-sans leading-relaxed focus:outline-none focus:border-primary transition-colors resize-none"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-[#232B3B]">
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-300 hover:text-white bg-[#1A202C] border border-[#2D3748] rounded-lg hover:border-slate-500 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-semibold">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    <span>Copy Draft</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSending}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSending}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover active:bg-blue-700 text-white text-xs font-semibold shadow transition-all disabled:opacity-50 cursor-pointer"
                >
                  <Send className={`w-3.5 h-3.5 ${isSending ? 'animate-pulse' : ''}`} />
                  <span>{isSending ? 'Transmitting...' : 'Send Pitch Email'}</span>
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
export default SendPitchEmailModal;
