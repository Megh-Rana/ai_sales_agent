import React from 'react';
import { ArrowRight, BarChart3, TrendingUp, CheckCircle2 } from 'lucide-react';
import { SalesFunnelStage } from '../../data/dashboard';

export interface SalesFunnelProps {
  stages: SalesFunnelStage[];
  className?: string;
}

export const SalesFunnel: React.FC<SalesFunnelProps> = ({ stages, className = '' }) => {
  return (
    <div className={`bg-surface-0 border border-border-default rounded-xl p-4 sm:p-5 space-y-4 shadow-xs ${className}`}>
      <div className="flex items-center justify-between gap-2 border-b border-border-subtle pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-surface-1 text-primary border border-border-subtle">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-body font-semibold text-foreground">Pipeline Conversion Funnel</h4>
            <div className="text-[11px] text-foreground-tertiary">Real-time signal-to-meeting conversion tracking</div>
          </div>
        </div>
        <span className="text-[11px] font-mono text-primary font-semibold bg-primary-muted px-2 py-0.5 rounded border border-primary/30">
          Active Pipeline
        </span>
      </div>

      {/* Funnel Stages Stack */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        {stages.map((stage, idx) => {
          const maxCount = stages[0].count;
          const pct = Math.round((stage.count / maxCount) * 100);

          return (
            <div
              key={stage.id}
              className="p-3 bg-surface-1/60 rounded-lg border border-border-subtle space-y-1.5 relative overflow-hidden"
            >
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-foreground truncate">{stage.name}</span>
                <span className="text-foreground-tertiary font-mono">Stage {idx + 1}</span>
              </div>

              <div className="flex items-baseline justify-between gap-2">
                <span className="text-h3 font-bold text-foreground font-mono">{stage.count}</span>
                <span className="text-[11px] font-mono font-medium text-signal-qualified">
                  {stage.value}
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-surface-elevated h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-primary h-full rounded-full transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>

              <div className="text-[10px] text-foreground-tertiary flex justify-between">
                <span>{stage.conversionRate} conv</span>
                <span>{pct}% of top</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
