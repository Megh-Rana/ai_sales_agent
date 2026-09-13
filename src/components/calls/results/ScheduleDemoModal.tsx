import React, { useState } from 'react';
import { 
  X, 
  CalendarPlus, 
  User, 
  Building, 
  CheckCircle2, 
  Zap
} from 'lucide-react';
import { CallResultData } from '../../../types/callResults';

interface ScheduleDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: CallResultData;
}

export const ScheduleDemoModal: React.FC<ScheduleDemoModalProps> = ({
  isOpen,
  onClose,
  data,
}) => {
  const [selectedDate, setSelectedDate] = useState('2026-09-14'); // Within 48 hours
  const [selectedTime, setSelectedTime] = useState('14:30');
  const [duration, setDuration] = useState('30 min');
  const [scheduledSuccess, setScheduledSuccess] = useState(false);

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

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    setScheduledSuccess(true);
    setTimeout(() => {
      setScheduledSuccess(false);
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in" role="presentation" onClick={onClose}>
      <div 
        role="dialog"
        aria-modal="true"
        aria-label="Schedule Product Demo"
        className="bg-[#121620] border border-[#263143] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#232B3B] bg-[#151B28]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400">
              <CalendarPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Schedule Product Demo
              </h3>
              <p className="text-xs text-slate-400">
                Recommended Action: Connect within 48 hours
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

        {scheduledSuccess ? (
          <div className="p-8 text-center">
            <div className="w-12 h-12 bg-emerald-500/20 border border-emerald-500/40 rounded-full flex items-center justify-center text-emerald-400 mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-white mb-1">Demo Scheduled Successfully</h4>
            <p className="text-xs text-slate-400">
              Calendar invite sent to {data.contactName} ({data.contactPhone}) for {selectedDate} at {selectedTime}.
            </p>
          </div>
        ) : (
          <form onSubmit={handleConfirm} className="p-6 space-y-4">
            {/* Prospect Summary Box */}
            <div className="bg-[#151A25] border border-[#232B3B] p-3 rounded-lg flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-slate-400" />
                <span className="font-semibold text-white">{data.contactName}</span>
                <span className="text-slate-400">({data.contactRole})</span>
              </div>
              <span className="text-slate-400 flex items-center gap-1">
                <Building className="w-3.5 h-3.5" />
                {data.companyName}
              </span>
            </div>

            {/* Date & Time Pickers */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Suggested Date (48h Window)
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full bg-[#161B26] border border-[#263143] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Time
                </label>
                <input
                  type="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="w-full bg-[#161B26] border border-[#263143] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
            </div>

            {/* Meeting Type */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Meeting Format & Duration
              </label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {['30 min', '45 min', '60 min'].map((dur) => (
                  <button
                    key={dur}
                    type="button"
                    onClick={() => setDuration(dur)}
                    className={`py-2 rounded-lg border font-medium transition-all ${
                      duration === dur
                        ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                        : 'bg-[#161B26] border-[#263143] text-slate-400 hover:text-white'
                    }`}
                  >
                    {dur}
                  </button>
                ))}
              </div>
            </div>

            {/* Recommended Agenda Box */}
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-1.5">
                <Zap className="w-3 h-3 text-blue-400" />
                <span>Recommended Agenda (From Call Intelligence)</span>
              </div>
              <div className="bg-[#0D1017] border border-[#1E2536] p-3 rounded-lg text-xs text-slate-300 space-y-1.5">
                <p>• <strong>10m:</strong> Eliminating manual spreadsheet follow-up delays (Rahul's stated pain point)</p>
                <p>• <strong>15m:</strong> Live walkthrough of automated multi-tier lead calling for 12 sales reps</p>
                <p>• <strong>05m:</strong> 3-week phased onboarding plan & pricing breakdown</p>
              </div>
            </div>

            {/* Action Footer */}
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
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover active:bg-blue-700 text-white text-xs font-semibold shadow transition-all"
              >
                <CalendarPlus className="w-4 h-4" />
                <span>Confirm & Send Calendar Invite</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
