import React from 'react';
import { IntentLevelDistribution } from '../../types/analytics';
import { ShieldAlert, Zap, Compass } from 'lucide-react';

interface IntentDistributionCardProps {
  distribution: IntentLevelDistribution;
}

export const IntentDistributionCard: React.FC<IntentDistributionCardProps> = ({ distribution }) => {
  const items = [
    {
      label: 'VERY HIGH INTENT (85-100)',
      count: distribution.veryHigh.count,
      percentage: distribution.veryHigh.percentage,
      color: 'bg-amber-500',
      textColor: 'text-amber-400',
      badgeBg: 'bg-amber-500/10 border-amber-500/30',
      barColor: 'bg-amber-500 border-amber-400/30',
    },
    {
      label: 'HIGH INTENT (70-84)',
      count: distribution.high.count,
      percentage: distribution.high.percentage,
      color: 'bg-emerald-500',
      textColor: 'text-emerald-400',
      badgeBg: 'bg-emerald-500/10 border-emerald-500/30',
      barColor: 'bg-emerald-500 border-emerald-400/30',
    },
    {
      label: 'MEDIUM INTENT (45-69)',
      count: distribution.medium.count,
      percentage: distribution.medium.percentage,
      color: 'bg-blue-500',
      textColor: 'text-blue-400',
      badgeBg: 'bg-blue-500/10 border-blue-500/30',
      barColor: 'bg-blue-500 border-blue-400/30',
    },
    {
      label: 'LOW INTENT (<45)',
      count: distribution.low.count,
      percentage: distribution.low.percentage,
      color: 'bg-slate-500',
      textColor: 'text-slate-400',
      badgeBg: 'bg-slate-500/10 border-slate-500/30',
      barColor: 'bg-slate-500 border-slate-400/30',
    },
  ];

  return (
    <div className="bg-[#12161F] border border-[#1E2638] rounded-xl p-5 md:p-6 shadow-sm flex flex-col justify-between h-full">
      <div>
        {/* Card Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#F8FAFC]">Lead Quality & Intent Distribution</h2>
              <p className="text-xs text-[#94A3B8]">
                Buying signal density across discovered dataset
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-medium text-[#64748B] bg-[#0B0E14] px-2.5 py-1 rounded-md border border-[#1E2638]">
            AI Score Model
          </span>
        </div>

        {/* Intent Stack List */}
        <div className="space-y-4 mb-6">
          {items.map((item) => (
            <div key={item.label} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className={`font-semibold tracking-wide text-[11px] ${item.textColor}`}>
                  {item.label}
                </span>
                <div className="flex items-center space-x-2 font-mono">
                  <span className="text-sm font-bold text-[#F8FAFC]">{item.count} leads</span>
                  <span className={`px-1.5 py-0.5 rounded text-[11px] border font-medium ${item.badgeBg}`}>
                    {item.percentage}%
                  </span>
                </div>
              </div>

              {/* Bar */}
              <div className="w-full bg-[#0B0E14] h-3.5 rounded-md overflow-hidden p-0.5 border border-[#1E2638]">
                <div
                  className={`h-full rounded ${item.barColor} transition-all duration-500`}
                  style={{ width: `${Math.max(item.percentage, 2)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Note */}
      <div className="pt-3 border-t border-[#1E2638] flex items-center justify-between text-xs text-[#64748B]">
        <div className="flex items-center space-x-1.5">
          <Compass className="w-3.5 h-3.5 text-[#94A3B8]" />
          <span>High-intent signals updated continuously</span>
        </div>
        <span className="font-mono text-emerald-400 font-semibold">
          {distribution.veryHigh.count + distribution.high.count} Actionable Leads
        </span>
      </div>
    </div>
  );
};
