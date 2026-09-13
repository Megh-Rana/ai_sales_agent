import React, { useState, useEffect, useRef } from 'react';
import { X, Clock, Calendar, CheckCircle2, ArrowRight } from 'lucide-react';

export interface DelayActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyName: string;
  actionTitle: string;
  onConfirmDelay: (delayedUntilDate: string, timeframeLabel: string) => void;
}

export const DelayActionModal: React.FC<DelayActionModalProps> = ({
  isOpen,
  onClose,
  companyName,
  actionTitle,
  onConfirmDelay,
}) => {
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const formatLocalDate = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getTomorrowDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return formatLocalDate(d);
  };

  const [selectedOption, setSelectedOption] = useState<'tomorrow' | '3days' | 'nextweek' | 'custom'>('tomorrow');
  const [customDate, setCustomDate] = useState(getTomorrowDate());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [finalDateLabel, setFinalDateLabel] = useState('');

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
    let targetDate = customDate;
    let label = 'Tomorrow';

    const d = new Date();
    if (selectedOption === 'tomorrow') {
      d.setDate(d.getDate() + 1);
      targetDate = formatLocalDate(d);
      label = 'Tomorrow';
    } else if (selectedOption === '3days') {
      d.setDate(d.getDate() + 3);
      targetDate = formatLocalDate(d);
      label = 'In 3 Days';
    } else if (selectedOption === 'nextweek') {
      d.setDate(d.getDate() + 7);
      targetDate = formatLocalDate(d);
      label = 'Next Week';
    } else {
      label = `Custom (${customDate})`;
    }

    setFinalDateLabel(label);
    setIsSuccess(true);

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setIsSubmitting(false);
      onConfirmDelay(targetDate, label);
      setIsSuccess(false);
      onClose();
    }, 1200);
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
        aria-label="Postpone Sales Recommendation"
        className="bg-surface border border-border-strong rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-surface-elevated">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Postpone Recommendation</h3>
              <p className="text-xs text-slate-400">Delay action timeline for {companyName}</p>
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
            <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-white">Recommendation Postponed</h4>
            <p className="text-xs text-slate-300">
              Action delayed until <strong className="text-amber-300">{finalDateLabel}</strong>.
            </p>
          </div>
        ) : (
          <form onSubmit={handleConfirm} className="p-5 space-y-4">
            <div className="bg-[#151A25] border border-[#232B3B] p-3 rounded-lg text-xs space-y-1">
              <span className="text-[11px] font-mono text-slate-400 uppercase font-semibold">Action Being Delayed:</span>
              <p className="text-white font-bold">{actionTitle}</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-200 mb-2">
                Select Delay Timeframe
              </label>

              <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                <button
                  type="button"
                  onClick={() => setSelectedOption('tomorrow')}
                  className={`p-2.5 rounded-lg border text-center font-medium transition-all ${
                    selectedOption === 'tomorrow'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                      : 'bg-[#161B26] border-[#263143] text-slate-400 hover:text-white'
                  }`}
                >
                  Tomorrow
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedOption('3days')}
                  className={`p-2.5 rounded-lg border text-center font-medium transition-all ${
                    selectedOption === '3days'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                      : 'bg-[#161B26] border-[#263143] text-slate-400 hover:text-white'
                  }`}
                >
                  In 3 Days
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedOption('nextweek')}
                  className={`p-2.5 rounded-lg border text-center font-medium transition-all ${
                    selectedOption === 'nextweek'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                      : 'bg-[#161B26] border-[#263143] text-slate-400 hover:text-white'
                  }`}
                >
                  Next Week
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedOption('custom')}
                  className={`p-2.5 rounded-lg border text-center font-medium transition-all ${
                    selectedOption === 'custom'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                      : 'bg-[#161B26] border-[#263143] text-slate-400 hover:text-white'
                  }`}
                >
                  Custom Date
                </button>
              </div>

              {selectedOption === 'custom' && (
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Choose Date
                  </label>
                  <input
                    type="date"
                    value={customDate}
                    onChange={(e) => setCustomDate(e.target.value)}
                    className="w-full bg-[#161B26] border border-[#263143] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                    required
                  />
                </div>
              )}
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
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow transition-all disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Delaying...' : 'Confirm Delay'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
