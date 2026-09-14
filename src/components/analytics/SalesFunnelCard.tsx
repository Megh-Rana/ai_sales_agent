import React from 'react';
import { FunnelStageData } from '../../types/analytics';
import { safePercentage } from '../../utils/analyticsMath';
import { Filter, TrendingDown, Info } from 'lucide-react';

interface SalesFunnelCardProps {
  stages: FunnelStageData[];
  insightText: {
    highlight: string;
    dropOffDetail: string;
  };
}

export const SalesFunnelCard: React.FC<SalesFunnelCardProps> = ({ stages, insightText }) => {
  const topCount = Math.max(stages[0]?.count || 1, 1);

  const getStageColor = (index: number) => {
    switch (index) {
      case 0:
        return 'bg-blue-500/80 border-blue-400/40 text-blue-200';
      case 1:
        return 'bg-amber-500/80 border-amber-400/40 text-amber-200';
      case 2:
        return 'bg-indigo-500/80 border-indigo-400/40 text-indigo-200';
      case 3:
        return 'bg-emerald-500/80 border-emerald-400/40 text-emerald-200';
      case 4:
        return 'bg-purple-500/80 border-purple-400/40 text-purple-200';
      default:
        return 'bg-slate-500/80 border-slate-400/40 text-slate-200';
    }
  };

  return (
    <div className="bg-surface border border-border rounded-xl p-5 md:p-6 shadow-sm flex flex-col justify-between h-full">
      <div>
        {/* Card Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Filter className="w-4 h-4" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">Sales Funnel Conversion</h2>
              <p className="text-xs text-foreground-secondary">
                Stage volume, conversion yield & drop-off points
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-medium text-foreground-tertiary bg-background px-2.5 py-1 rounded-md border border-border">
            5 Stages Supported
          </span>
        </div>

        {/* Visual Funnel Stack */}
        <div className="space-y-3.5 mb-6">
          {stages.map((stage, idx) => {
            const calculatedPctOfTop = safePercentage(stage.count, topCount, 1);
            const widthPercentage = Math.max(calculatedPctOfTop, 14);

            return (
              <div key={stage.stageId} className="space-y-1">
                {/* Bar Label & Value Row */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-foreground">{stage.label}</span>
                    <span className="text-[11px] font-mono text-foreground-tertiary">
                      ({calculatedPctOfTop}% of total)
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 font-mono">
                    <span className="text-sm font-bold text-foreground">{stage.count}</span>
                    {idx > 0 && (
                      <span className="text-[11px] text-foreground-secondary bg-surface-elevated px-1.5 py-0.5 rounded border border-border-strong">
                        {stage.conversionFromPrevious}% yield
                      </span>
                    )}
                  </div>
                </div>

                {/* Proportional Bar */}
                <div className="w-full bg-background h-7 rounded-lg overflow-hidden p-1 border border-border flex items-center">
                  <div
                    className={`h-full rounded-md transition-all duration-500 flex items-center justify-end px-2 text-[11px] font-mono font-bold border ${getStageColor(
                      idx
                    )}`}
                    style={{ width: `${widthPercentage}%` }}
                  >
                    {widthPercentage > 25 && `${stage.count}`}
                  </div>
                </div>

                {/* Drop-off Callout line between stages */}
                {idx < stages.length - 1 && stage.dropOffCount > 0 && (
                  <div className="flex items-center justify-between px-2 pt-0.5 text-[11px] text-foreground-tertiary">
                    <span className="flex items-center space-x-1 text-rose-400/80">
                      <TrendingDown className="w-3 h-3" aria-hidden="true" />
                      <span>Drop-off: {stage.dropOffCount} leads</span>
                    </span>
                    <span>{stage.dropOffPercentage}% loss</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Actionable Funnel Insight Banner */}
      <div className="p-3.5 rounded-lg bg-blue-500/5 border border-blue-500/20 flex items-start space-x-3">
        <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" aria-hidden="true" />
        <div className="text-xs space-y-0.5">
          <p className="font-semibold text-foreground">{insightText.highlight}</p>
          <p className="text-foreground-secondary">{insightText.dropOffDetail}</p>
        </div>
      </div>
    </div>
  );
};
