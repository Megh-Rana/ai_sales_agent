import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, 
  CalendarPlus, 
  User, 
  Building2, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  FileText,
  Zap,
  ArrowRight,
  ShieldCheck,
  Calendar
} from 'lucide-react';
import { FollowUpItem, ActionPriority } from '../../../types/followUp';

export interface FollowUpSchedulerModalProps {
  isOpen: boolean;
  onClose: () => void;
  leadId: string;
  companyName: string;
  contactName: string;
  contactRole?: string;
  requirement?: string;
  intentScore?: number;
  recommendedActionTitle?: string;
  recommendedReason?: string;
  evidenceList?: string[];
  onConfirmSchedule: (item: FollowUpItem) => void;
}

export const FollowUpSchedulerModal: React.FC<FollowUpSchedulerModalProps> = ({
  isOpen,
  onClose,
  leadId,
  companyName,
  contactName,
  contactRole = 'Decision Maker',
  requirement = 'Outbound sales automation',
  intentScore = 86,
  recommendedActionTitle = 'Schedule Product Demo within 48 Hours',
  recommendedReason = 'Prospect confirmed 30-day timeline and requested pricing.',
  evidenceList = [
    '30-day evaluation timeline confirmed',
    'Pricing requested for 12 sales reps',
    'Decision maker authority verified'
  ],
  onConfirmSchedule,
}) => {
  const navigate = useNavigate();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Deterministic Local Date Calculation
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

  const [selectedDateOption, setSelectedDateOption] = useState<'tomorrow' | '2days' | '3days' | 'nextweek' | 'custom'>('tomorrow');
  const [date, setDate] = useState(getTomorrowDate());
  const [time, setTime] = useState('14:30');
  const [priority, setPriority] = useState<ActionPriority>('HIGH');
  const [owner, setOwner] = useState('Account Executive (Direct)');
  const [note, setNote] = useState('Send pricing deck and technical overview prior to demo walkthrough.');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [scheduledItem, setScheduledItem] = useState<FollowUpItem | null>(null);

  // Reset modal states on open / cleanup timers on unmount
  useEffect(() => {
    if (isOpen) {
      setIsSubmitting(false);
      setIsSuccess(false);
      setScheduledItem(null);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isOpen]);

  // Keyboard accessibility
  useEffect(() => {
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

  const handleDateChipSelect = (option: 'tomorrow' | '2days' | '3days' | 'nextweek') => {
    setSelectedDateOption(option);
    const d = new Date();
    if (option === 'tomorrow') d.setDate(d.getDate() + 1);
    else if (option === '2days') d.setDate(d.getDate() + 2);
    else if (option === '3days') d.setDate(d.getDate() + 3);
    else if (option === 'nextweek') d.setDate(d.getDate() + 7);
    setDate(formatLocalDate(d));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return; // Prevent duplicate submissions

    setIsSubmitting(true);

    const newItem: FollowUpItem = {
      id: `flw-${Date.now()}`,
      leadId,
      companyName,
      contactName,
      contactRole,
      actionType: 'SCHEDULE_DEMO',
      title: recommendedActionTitle,
      date,
      time,
      priority,
      note,
      status: 'SCHEDULED',
      owner,
      reason: recommendedReason,
      createdAt: new Date().toISOString()
    };

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setIsSubmitting(false);
      setScheduledItem(newItem);
      setIsSuccess(true);
      onConfirmSchedule(newItem);
    }, 450);
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
        aria-label="Confirm Next Best Action & Schedule Follow-up"
        className="bg-surface border border-border-strong rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface-elevated">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400">
              <CalendarPlus className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-400">
                  Sales Decision Confirmation
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                  Verified Intent
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Schedule Recommended Sales Follow-up
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors focus:outline-none focus:ring-1 focus:ring-primary"
            title="Close dialog (Escape)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess && scheduledItem ? (
          /* SUCCESS STATE */
          <div className="p-6 sm:p-8 text-center space-y-5 animate-fade-in">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-emerald-400">
                Action Confirmed & Logged to Sales Dossier
              </span>
              <h3 className="text-xl font-bold text-white">
                Follow-up Scheduled for {companyName}
              </h3>
              <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                <strong className="text-white">{scheduledItem.title}</strong> is set for{' '}
                <span className="font-mono text-emerald-300 font-bold">{scheduledItem.date}</span> at{' '}
                <span className="font-mono text-emerald-300 font-bold">{scheduledItem.time}</span>. Assigned to{' '}
                <span className="text-white font-medium">{scheduledItem.owner}</span>.
              </p>
            </div>

            {/* Quick Context Summary Box */}
            <div className="bg-[#151A25] border border-[#232B3B] rounded-xl p-4 text-left space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-400 font-medium">
                <span>Opportunity Status:</span>
                <span className="text-emerald-400 font-semibold uppercase">Demo Scheduled</span>
              </div>
              {scheduledItem.note && (
                <div className="pt-2 border-t border-[#222B3D] text-slate-300">
                  <span className="font-semibold text-slate-400">Sales Note: </span>
                  <span className="italic">"{scheduledItem.note}"</span>
                </div>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => {
                  onClose();
                  navigate(`/leads/${leadId}`);
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#1A202C] hover:bg-[#252D3D] border border-[#2D3748] text-slate-200 hover:text-white text-xs font-medium transition-colors"
              >
                <FileText className="w-4 h-4 text-blue-400" />
                <span>View Lead Dossier</span>
              </button>

              <button
                onClick={onClose}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-hover active:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all"
              >
                <span>Return to Call Results</span>
                <ArrowRight className="w-4 h-4 opacity-80" />
              </button>
            </div>
          </div>
        ) : (
          /* SCHEDULER FORM */
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5">
            {/* 1. Persistent Opportunity Context Header */}
            <div className="bg-[#151B28] border border-[#232B3B] rounded-xl p-3.5 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-400" />
                  <span className="font-bold text-white text-sm">{companyName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Intent Score:</span>
                  <span className="font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    {intentScore} / 100
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300">
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>{contactName}</span>
                  <span className="text-slate-500">({contactRole})</span>
                </div>
                <span className="text-slate-600 hidden sm:inline">•</span>
                <span className="text-slate-300 line-clamp-1">{requirement}</span>
              </div>
            </div>

            {/* 2. Recommendation Overview */}
            <div className="bg-[#0D121C] border border-blue-500/30 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-blue-400" />
                  <span>Recommended Action</span>
                </span>
                <span className="text-[10px] uppercase font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  {priority} Priority
                </span>
              </div>
              <p className="text-sm font-bold text-white">{recommendedActionTitle}</p>
              <p className="text-xs text-slate-300 leading-relaxed">{recommendedReason}</p>
            </div>

            {/* 3. Date & Time Selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-200">
                  Follow-up Date
                </label>
                <span className="text-[11px] text-slate-400 font-mono">Window: Next 48 Hours</span>
              </div>

              {/* Quick Date Chips */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleDateChipSelect('tomorrow')}
                  className={`py-2 px-2.5 rounded-lg border text-center font-medium transition-all ${
                    selectedDateOption === 'tomorrow'
                      ? 'bg-blue-600/20 border-blue-500 text-blue-300 font-bold shadow-xs'
                      : 'bg-[#161B26] border-[#263143] text-slate-300 hover:border-slate-500'
                  }`}
                >
                  Tomorrow
                </button>

                <button
                  type="button"
                  onClick={() => handleDateChipSelect('2days')}
                  className={`py-2 px-2.5 rounded-lg border text-center font-medium transition-all ${
                    selectedDateOption === '2days'
                      ? 'bg-blue-600/20 border-blue-500 text-blue-300 font-bold shadow-xs'
                      : 'bg-[#161B26] border-[#263143] text-slate-300 hover:border-slate-500'
                  }`}
                >
                  In 2 Days
                </button>

                <button
                  type="button"
                  onClick={() => handleDateChipSelect('3days')}
                  className={`py-2 px-2.5 rounded-lg border text-center font-medium transition-all ${
                    selectedDateOption === '3days'
                      ? 'bg-blue-600/20 border-blue-500 text-blue-300 font-bold shadow-xs'
                      : 'bg-[#161B26] border-[#263143] text-slate-300 hover:border-slate-500'
                  }`}
                >
                  In 3 Days
                </button>

                <button
                  type="button"
                  onClick={() => handleDateChipSelect('nextweek')}
                  className={`py-2 px-2.5 rounded-lg border text-center font-medium transition-all ${
                    selectedDateOption === 'nextweek'
                      ? 'bg-blue-600/20 border-blue-500 text-blue-300 font-bold shadow-xs'
                      : 'bg-[#161B26] border-[#263143] text-slate-300 hover:border-slate-500'
                  }`}
                >
                  Next Week
                </button>
              </div>

              {/* Date & Time Input Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Specific Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => {
                      setSelectedDateOption('custom');
                      setDate(e.target.value);
                    }}
                    className="w-full bg-[#161B26] border border-[#263143] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Target Time
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full bg-[#161B26] border border-[#263143] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Priority & Owner */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1.5">
                  Action Priority
                </label>
                <div className="grid grid-cols-3 gap-1.5 text-xs">
                  {(['HIGH', 'MEDIUM', 'LOW'] as ActionPriority[]).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`py-1.5 rounded-lg border font-semibold text-[11px] transition-all ${
                        priority === p
                          ? p === 'HIGH'
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                            : p === 'MEDIUM'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                          : 'bg-[#161B26] border-[#263143] text-slate-400 hover:text-white'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1.5">
                  Assign Owner
                </label>
                <select
                  value={owner}
                  onChange={(e) => setOwner(e.target.value)}
                  className="w-full bg-[#161B26] border border-[#263143] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Account Executive (Direct)">Account Executive (Direct)</option>
                  <option value="Vidur AI Voice Agent Alpha">Vidur AI Voice Agent Alpha</option>
                  <option value="SDR Team Lead">SDR Team Lead</option>
                </select>
              </div>
            </div>

            {/* 5. Sales Note */}
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1">
                Sales Preparation Note (Optional)
              </label>
              <textarea
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add contextual instructions for demo walkthrough..."
                className="w-full bg-[#161B26] border border-[#263143] rounded-lg p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 leading-relaxed resize-none font-sans"
              />
            </div>

            {/* Form Footer */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#232B3B]">
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
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover active:bg-blue-700 text-white text-xs font-semibold shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
              >
                <CalendarPlus className="w-4 h-4" />
                <span>{isSubmitting ? 'Scheduling Action...' : 'Confirm & Schedule Follow-Up'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
