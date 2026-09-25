import React, { useState, useEffect } from 'react';
import { 
  X, 
  Mail, 
  Copy, 
  Check, 
  Send, 
  ShieldCheck, 
  CheckCircle2,
  AlertCircle,
  Loader2,
  Globe
} from 'lucide-react';
import { CallResultData } from '../../../types/callResults';
import { callService, SendPitchEmailRequest } from '../../../services/callService';
import { toast } from 'sonner';

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
  const [recipientEmail, setRecipientEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [copied, setCopied] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [deliveryResult, setDeliveryResult] = useState<{ id: string; msg: string; mode: string } | null>(null);
  const [smtpStatus, setSmtpStatus] = useState<{ configured: boolean; message: string } | null>(null);

  // Initialize draft when modal opens
  useEffect(() => {
    if (!isOpen) return;

    const firstName = data.contactName ? data.contactName.split(' ')[0] : 'there';
    const defaultEmail = data.contactEmail || 'meghrana2007@gmail.com';
    
    setRecipientEmail(defaultEmail);
    setSubject(`Recap & Next Steps: AI Voice Follow-Up for ${data.companyName}`);

    const defaultBody = `Hi ${firstName},

Thank you for speaking with our autonomous AI sales agent today regarding ${data.companyName}'s operations.

Based on our conversation, we discussed addressing key operational priorities and streamlining workflow response times across your ${data.industry || 'operations'} team.

${data.summary ? `Summary of Discussion:\n"${data.summary}"\n` : ''}
Our deployment is modular and turnkey—integrating directly with existing CRM and communication channels with zero disruption to your daily operations.

I would love to invite you to a brief 20-minute technical architecture walkthrough focused specifically on how Vidur AI's voice workflows can scale your pipeline.

Would tomorrow at 2:30 PM IST or the following day at 11:00 AM IST work for a brief product walkthrough?

Best regards,

Vidur Sales Operations Team
support@vidur.in | https://vidur.in`;

    setBody(defaultBody);
    setSentSuccess(false);
    setErrorMessage(null);
    setDeliveryResult(null);

    // Query SMTP status
    callService.getEmailStatus().then((status) => {
      setSmtpStatus(status);
    }).catch(() => {
      setSmtpStatus({ configured: false, message: 'Simulated audit mode active' });
    });
  }, [isOpen, data]);

  // Handle ESC key
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
    toast.success('Follow-up email copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const emailTrimmed = recipientEmail.trim();
    if (!emailTrimmed || !emailTrimmed.includes('@') || !emailTrimmed.includes('.')) {
      setErrorMessage('Please enter a valid recipient email address (e.g. name@company.com).');
      return;
    }

    if (!subject.trim()) {
      setErrorMessage('Please enter an email subject line.');
      return;
    }

    if (!body.trim()) {
      setErrorMessage('Email message body cannot be empty.');
      return;
    }

    setIsSending(true);

    try {
      const payload: SendPitchEmailRequest = {
        recipientEmail: emailTrimmed,
        recipientName: data.contactName,
        companyName: data.companyName,
        subject: subject.trim(),
        body: body.trim(),
        pitchSnippet: data.nextBestAction?.action || undefined,
        language: 'en',
        leadId: data.leadId,
      };

      const res = await callService.sendPitchEmail(payload);

      if (!res.success && res.error) {
        throw new Error(res.error);
      }

      setSentSuccess(true);
      setDeliveryResult({
        id: res.deliveryId,
        msg: res.message,
        mode: res.mode,
      });

      toast.success(`Follow-up email dispatched to ${emailTrimmed}`);

      setTimeout(() => {
        setIsSending(false);
        onClose();
      }, 2500);
    } catch (err: any) {
      console.error('[SendFollowUpModal] Dispatch failed:', err);
      const msg = err.message || 'Failed to dispatch follow-up email. Please check your network or SMTP settings.';
      setErrorMessage(msg);
      toast.error(msg);
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
        aria-label="Review AI Follow-Up Draft"
        className="bg-surface border border-border rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl animate-scale-up dark:bg-[#121620] dark:border-[#263143]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface-elevated dark:border-[#232B3B] dark:bg-[#151B28]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 text-primary dark:bg-cyan-500/10 dark:border-cyan-500/30 dark:text-cyan-400">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground dark:text-white flex items-center gap-2">
                <span>Review & Dispatch Follow-Up Email</span>
                {smtpStatus && (
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-semibold ${
                    smtpStatus.configured 
                      ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400' 
                      : 'bg-blue-500/15 border-blue-500/30 text-blue-600 dark:text-blue-400'
                  }`}>
                    {smtpStatus.configured ? 'Live SMTP' : 'Audit Queue'}
                  </span>
                )}
              </h3>
              <p className="text-xs text-foreground-secondary dark:text-slate-400">
                Context-aware email customized with call evidence for {data.companyName}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSending}
            aria-label="Close modal"
            className="p-1 rounded-lg text-foreground-muted hover:text-foreground hover:bg-surface-hover transition-colors dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {sentSuccess ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-14 h-14 bg-emerald-500/20 border border-emerald-500/40 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-foreground dark:text-white">Email Dispatched Successfully!</h4>
            <p className="text-xs text-foreground-secondary dark:text-slate-300 max-w-sm mx-auto">
              Follow-up note transmitted to <strong className="text-foreground dark:text-white">{recipientEmail}</strong>.
            </p>
            {deliveryResult && (
              <div className="inline-flex items-center gap-2 text-[11px] font-mono text-foreground-secondary dark:text-slate-400 bg-surface-elevated dark:bg-slate-900/80 px-3 py-1.5 rounded-lg border border-border dark:border-slate-800">
                <Globe className="w-3.5 h-3.5 text-primary" />
                <span>Tracking ID: <strong>{deliveryResult.id}</strong> ({deliveryResult.mode})</span>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSend} className="p-6 space-y-4">
            {/* Error Banner */}
            {errorMessage && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-start gap-2 animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Recipient Email */}
            <div>
              <label className="block text-xs font-semibold text-foreground-secondary dark:text-slate-400 mb-1">
                Recipient Email Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                required
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="meghrana2007@gmail.com"
                className="w-full bg-surface-elevated border border-border rounded-lg px-3 py-2 text-xs font-mono text-foreground dark:bg-[#161B26] dark:border-[#263143] dark:text-white focus:outline-none focus:ring-1 focus:ring-primary shadow-xs"
              />
            </div>

            {/* Subject Line */}
            <div>
              <label className="block text-xs font-semibold text-foreground-secondary dark:text-slate-400 mb-1">
                Subject Line <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Follow-up Subject Line"
                className="w-full bg-surface-elevated border border-border rounded-lg px-3 py-2 text-xs font-medium text-foreground dark:bg-[#161B26] dark:border-[#263143] dark:text-white focus:outline-none focus:ring-1 focus:ring-primary shadow-xs"
              />
            </div>

            {/* Email Body */}
            <div>
              <div className="flex items-center justify-between gap-2 mb-1">
                <label className="block text-xs font-semibold text-foreground-secondary dark:text-slate-400">
                  Message Body (Editable)
                </label>
                <div className="flex items-center gap-1 text-[11px] text-primary dark:text-blue-400">
                  <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-foreground-secondary dark:text-slate-300">Customized with call takeaways</span>
                </div>
              </div>

              <textarea
                rows={9}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full bg-surface-elevated border border-border rounded-lg p-3 text-xs text-foreground font-sans leading-relaxed focus:outline-none focus:ring-1 focus:ring-primary resize-y shadow-xs dark:bg-[#0D1017] dark:border-[#1E2536] dark:text-slate-200"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-border dark:border-[#232B3B]">
              <button
                type="button"
                onClick={handleCopy}
                disabled={isSending}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-foreground-secondary hover:text-foreground bg-surface-elevated hover:bg-surface-hover border border-border rounded-lg transition-colors shadow-xs dark:text-slate-300 dark:hover:text-white dark:bg-[#1A202C] dark:border-[#2D3748] disabled:opacity-50"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-foreground-muted dark:text-slate-400" />
                    <span>Copy Draft</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSending}
                  className="px-4 py-2 text-xs font-medium text-foreground-muted hover:text-foreground transition-colors dark:text-slate-400 dark:hover:text-white disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSending}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover active:bg-blue-700 text-white text-xs font-semibold shadow transition-all disabled:opacity-50"
                >
                  {isSending ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Dispatching...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Follow-Up</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
export default SendFollowUpModal;
