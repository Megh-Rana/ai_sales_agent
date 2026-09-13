import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarCheck, Clock, ArrowRight, AlertCircle } from 'lucide-react';

export const FollowUpsWidget: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="p-5 rounded-xl bg-surface-0 border border-border-default space-y-4">
      <div className="flex items-center justify-between border-b border-border-subtle pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <CalendarCheck className="w-4 h-4" />
          </div>
          <h3 className="text-h4 font-bold text-foreground tracking-tight">
            Follow-Ups & Sequence Actions Queue
          </h3>
        </div>

        <button
          type="button"
          onClick={() => navigate('/follow-ups')}
          className="text-xs text-foreground-tertiary hover:text-foreground flex items-center gap-1 cursor-pointer"
        >
          <span>Open Full Queue</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      <div className="p-4 rounded-xl bg-surface-1 border border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-small font-bold text-foreground">
              2 Overdue Follow-ups Require Immediate Action
            </div>
            <div className="text-caption text-foreground-tertiary">
              Nexus Global (Vikram Verma) • Apex Healthtech (Priya Mehta)
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate('/follow-ups')}
          className="px-3.5 py-1.5 text-xs font-semibold text-black bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors cursor-pointer shrink-0"
        >
          Process Overdue Queue →
        </button>
      </div>
    </div>
  );
};
