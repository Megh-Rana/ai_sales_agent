import React, { useState, useEffect, useRef } from 'react';
import { X, Ban, CheckCircle2, RotateCcw } from 'lucide-react';
import { DismissReason } from '../../../types/followUp';

export interface DismissActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyName: string;
  actionTitle: string;
  onConfirmDismiss: (reason: DismissReason, note?: string) => void;
}

export const DismissActionModal: React.FC<DismissActionModalProps> = ({
  isOpen,
  onClose,
  companyName,
  actionTitle,
  onConfirmDismiss,
}) => {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [reason, setReason] = useState<DismissReason>('ALREADY_HANDLED');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsSubmitting(false);
      setIsSuccess(false);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setIsSuccess(true);

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setIsSubmitting(false);
      onConfirmDismiss(reason, note);
      setIsSuccess(false);
      onClose();
    }, 1000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-fade-in"
      role="presentation"
      onClick={onClose}
    >
      <div 
        role="dialog"
        aria-modal="true"
        aria-label="Dismiss Recommendation"
        className="bg-surface border border-border-strong rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-surface-elevated">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400">
              <Ban className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Dismiss Recommendation</h3>
              <p className="text-xs text-slate-400">Remove action trigger for {companyName}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-6 text-center space-y-3 animate-fade-in">
            <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 mx-auto">
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            </div>
            <h4 className="text-base font-bold text-white">Recommendation Dismissed</h4>
            <p className="text-xs text-slate-400">Feedback recorded. Action hidden from active queue.</p>
          </div>
        ) : (
          <form onSubmit={handleConfirm} className="p-5 space-y-4">
            <div className="bg-[#151A25] border border-[#232B3B] p-3 rounded-lg text-xs space-y-1">
              <span className="text-[11px] font-mono text-slate-400 uppercase font-semibold">Action Being Dismissed:</span>
              <p className="text-white font-bold">{actionTitle}</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-200 mb-2">
                Reason for Dismissal
              </label>

              <div className="space-y-1.5 text-xs">
                {[
                  { id: 'ALREADY_HANDLED', label: 'Already handled via alternative channel' },
                  { id: 'NOT_RELEVANT', label: 'Not relevant to current prospect context' },
                  { id: 'WRONG_TIMING', label: 'Timing inappropriate for prospect cadence' },
                  { id: 'INCORRECT_RECOMMENDATION', label: 'Recommendation misaligned with intent' },
                  { id: 'OTHER', label: 'Other reason' }
                ].map((item) => (
                  <label
                    key={item.id}
                    className={`flex items-center gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-all ${
                      reason === item.id
                        ? 'bg-rose-500/10 border-rose-500/40 text-rose-200'
                        : 'bg-[#161B26] border-[#263143] text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    <input
                      type="radio"
                      name="dismissReason"
                      value={item.id}
                      checked={reason === item.id}
                      onChange={() => setReason(item.id as DismissReason)}
                      className="text-rose-500 focus:ring-rose-500"
                    />
                    <span className="text-xs font-medium">{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Optional Notes
              </label>
              <textarea
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Brief reason or notes for sales manager audit..."
                className="w-full bg-[#161B26] border border-[#263143] rounded-lg p-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500 resize-none font-sans"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#232B3B]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow transition-all disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-rose-500/50"
              >
                <Ban className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Dismissing...' : 'Confirm Dismissal'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
