import React from 'react';
import { CallOutcomeItem } from '../../types/analytics';
import { ListFilter, Award } from 'lucide-react';

interface CallOutcomeBreakdownProps {
  outcomes: CallOutcomeItem[];
}

export const CallOutcomeBreakdown: React.FC<CallOutcomeBreakdownProps> = ({ outcomes }) => {
  return (
    <div className="bg-surface border border-border rounded-xl p-5 md:p-6 shadow-sm flex flex-col justify-between h-full">
      <div>
        {/* Card Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <ListFilter className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">Call Outcome Distribution</h2>
              <p className="text-xs text-foreground-secondary">
                Scannable ranked breakdown of completed touchpoints
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-medium text-foreground-tertiary bg-background px-2.5 py-1 rounded-md border border-border">
            Ranked List View
          </span>
        </div>

        {/* Outcomes Ranked List */}
        <div className="space-y-3 mb-4">
          {outcomes.map((item) => (
            <div
              key={item.outcome}
              className="bg-background border border-border hover:border-border-strong rounded-lg p-3 transition-all duration-150"
            >
              <div className="flex items-center justify-between text-xs mb-2">
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${item.badgeStyle}`}
                  >
                    {item.outcome}
                  </span>
                  <span className="font-medium text-foreground">{item.label}</span>
                </div>
                <div className="flex items-center space-x-2 font-mono">
                  <span className="font-bold text-foreground">{item.count} calls</span>
                  <span className="text-foreground-secondary font-semibold">({item.percentage}%)</span>
                </div>
              </div>

              {/* Relative Progress Bar */}
              <div className="w-full bg-surface-elevated h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${item.colorClass}`}
                  style={{ width: `${Math.max(item.percentage, 4)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-3 border-t border-border text-xs text-foreground-tertiary flex items-center justify-between">
        <div className="flex items-center space-x-1.5">
          <Award className="w-3.5 h-3.5 text-emerald-400" />
          <span>72.2% positive conversation outcome rate</span>
        </div>
      </div>
    </div>
  );
};
