import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  Copy, 
  Check, 
  Send, 
  ShieldCheck, 
  CheckCircle2
} from 'lucide-react';
import { CallResultData } from '../../../types/callResults';

interface SendFollowUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: CallResultData;
}

export const SendFollowUpModal: React.FC<SendFollowUpModalProps> = ({
  isOpen,
  onClose,
  data,
}) => {
  const [copied, setCopied] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const emailSubject = `Recap & Next Steps: Sales follow-up automation for ${data.companyName}`;
  const emailBody = `Hi ${data.contactName.split(' ')[0]},

Thank you for speaking with our team today regarding Acme Manufacturing's sales operations.

Based on our discussion, you are looking to eliminate manual spreadsheet follow-up delays (saving 2-3 days on inbound response times) across your 12-member sales team within a 30-day evaluation window.

Regarding your question on implementation effort: our onboarding is modular and turnkey—most manufacturing teams are fully operational within 2 to 3 weeks with zero disruption to active CRM workflows.

I'd love to show you a quick 20-minute walkthrough focused specifically on how the automated voice cadence works for your team.

Would Thursday at 2:30 PM IST or Friday at 11:00 AM IST work for a brief product demo?

Best regards,
Vidur Sales Operations Team`;

  const handleCopy = () => {
    navigator.clipboard.writeText(`Subject: ${emailSubject}\n\n${emailBody}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSend = () => {
    setSentSuccess(true);
    setTimeout(() => {
      setSentSuccess(false);
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in" role="presentation" onClick={onClose}>
      <div 
        role="dialog"
        aria-modal="true"
        aria-label="Review AI Follow-Up Draft"
        className="bg-[#121620] border border-[#263143] rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#232B3B] bg-[#151B28]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Review AI Follow-Up Draft
              </h3>
              <p className="text-xs text-slate-400">
                Context-aware email customized with call evidence
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {sentSuccess ? (
          <div className="p-8 text-center">
            <div className="w-12 h-12 bg-emerald-500/20 border border-emerald-500/40 rounded-full flex items-center justify-center text-emerald-400 mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-white mb-1">Email Dispatched Successfully</h4>
            <p className="text-xs text-slate-400">
              Follow-up note sent to {data.contactName} ({data.companyDomain || 'company domain'}).
            </p>
          </div>
        ) : (
          <div className="p-6 space-y-4">
            {/* Subject Line */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Subject Line
              </label>
              <div className="bg-[#161B26] border border-[#263143] rounded-lg px-3 py-2 text-xs font-medium text-white">
                {emailSubject}
              </div>
            </div>

            {/* Email Body */}
            <div>
              <div className="flex items-center justify-between gap-2 mb-1">
                <label className="block text-xs font-semibold text-slate-400">
                  Message Body
                </label>
                <div className="flex items-center gap-1 text-[11px] text-blue-400">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span className="text-slate-300">Tailored for prospect context</span>
                </div>
              </div>

              <textarea
                rows={10}
                value={emailBody}
                readOnly
                className="w-full bg-[#0D1017] border border-[#1E2536] rounded-lg p-3 text-xs text-slate-200 font-sans leading-relaxed focus:outline-none resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-[#232B3B]">
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-300 hover:text-white bg-[#1A202C] border border-[#2D3748] rounded-lg hover:border-slate-500 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-semibold">Copied to Clipboard</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    <span>Copy to Clipboard</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSend}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover active:bg-blue-700 text-white text-xs font-semibold shadow transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Follow-Up</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
