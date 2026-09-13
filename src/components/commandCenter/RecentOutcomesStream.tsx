import React from 'react';
import { Activity, CheckCircle2, Calendar, Clock, Sparkles } from 'lucide-react';
import { RecentOutcomeEvent } from '../../types/commandCenter';

interface RecentOutcomesStreamProps {
  outcomes: RecentOutcomeEvent[];
}

export const RecentOutcomesStream: React.FC<RecentOutcomesStreamProps> = ({ outcomes }) => {
  return (
    <div className="p-5 rounded-xl bg-surface-0 border border-border-default space-y-4">
      <div className="flex items-center justify-between border-b border-border-subtle pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <Activity className="w-4 h-4" />
          </div>
          <h3 className="text-h4 font-bold text-foreground tracking-tight">
            Recent Conversation Outcomes & State Log
          </h3>
        </div>
        <span className="text-caption font-mono text-foreground-tertiary">
          Immutable Sales Event Stream
        </span>
      </div>

      <div className="space-y-3">
        {(outcomes || []).map((evt) => (
          <div
            key={evt.id}
            className="p-3.5 rounded-xl bg-surface-1 border border-border-subtle flex items-start gap-3"
          >
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center justify-between text-caption font-mono text-foreground-tertiary">
                <span className="font-semibold text-foreground">{evt.companyName} ({evt.contactName})</span>
                <span>{evt.timestamp}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                  {evt.outcomeLabel}
                </span>
              </div>

              <div className="text-small text-foreground-secondary flex items-center gap-1.5 pt-1">
                <Sparkles className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>Next Best Action: <strong>{evt.nextBestActionHeadline}</strong></span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
