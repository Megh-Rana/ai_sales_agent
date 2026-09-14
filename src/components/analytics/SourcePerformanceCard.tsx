import React from 'react';
import { SourcePerformanceItem } from '../../types/analytics';
import { Globe, Award, Sparkles, TrendingUp } from 'lucide-react';

interface SourcePerformanceCardProps {
  sources: SourcePerformanceItem[];
}

export const SourcePerformanceCard: React.FC<SourcePerformanceCardProps> = ({ sources }) => {
  return (
    <div className="bg-surface border border-border rounded-xl p-5 md:p-6 shadow-sm flex flex-col justify-between h-full">
      <div>
        {/* Card Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">Discovery Source Yield</h2>
              <p className="text-xs text-foreground-secondary">
                Where should you find more leads?
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-medium text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-md border border-blue-500/20">
            Source Provenance
          </span>
        </div>

        {/* Source List */}
        <div className="space-y-3.5 mb-4">
          {sources.map((item, idx) => (
            <div
              key={item.sourceKey}
              className={`bg-background border rounded-lg p-3.5 transition-all duration-150 ${
                idx === 0
                  ? 'border-blue-500/40 bg-blue-500/[0.02]'
                  : 'border-border hover:border-border-strong'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {idx === 0 && (
                    <span className="p-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold uppercase tracking-wider">
                      Top Source
                    </span>
                  )}
                  <span className="font-semibold text-xs text-foreground">{item.sourceLabel}</span>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Qualified: {item.qualificationRate}%
                </span>
              </div>

              {/* Detail Metrics Row */}
              <div className="grid grid-cols-3 gap-2 text-[11px] font-mono text-foreground-secondary pt-1">
                <div>
                  <span className="text-foreground-tertiary block">Discovered</span>
                  <span className="font-bold text-foreground">{item.discoveredLeads}</span>
                </div>
                <div>
                  <span className="text-foreground-tertiary block">High Intent</span>
                  <span className="font-bold text-amber-400">{item.highIntentLeads}</span>
                </div>
                <div>
                  <span className="text-foreground-tertiary block">Avg Intent</span>
                  <span className="font-bold text-blue-400">{item.avgIntentScore} / 100</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-3 border-t border-border text-xs text-foreground-tertiary flex items-center justify-between">
        <span>Recommendation: Focus scanning on Public Requirements</span>
        <span className="text-blue-400 font-semibold font-mono">1.8× Higher Conversion</span>
      </div>
    </div>
  );
};
