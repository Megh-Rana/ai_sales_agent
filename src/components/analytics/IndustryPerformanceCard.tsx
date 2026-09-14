import React from 'react';
import { IndustryPerformanceItem } from '../../types/analytics';
import { Building2, Layers } from 'lucide-react';

interface IndustryPerformanceCardProps {
  industries: IndustryPerformanceItem[];
}

export const IndustryPerformanceCard: React.FC<IndustryPerformanceCardProps> = ({ industries }) => {
  return (
    <div className="bg-surface border border-border rounded-xl p-5 md:p-6 shadow-sm flex flex-col justify-between h-full">
      <div>
        {/* Card Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">Industry Segment Performance</h2>
              <p className="text-xs text-foreground-secondary">
                Opportunity yield and pipeline value by industry vertical
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-medium text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-md border border-purple-500/20">
            ICP Breakdown
          </span>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto mb-4">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border text-foreground-tertiary font-mono">
                <th className="pb-2.5 font-semibold">Industry</th>
                <th className="pb-2.5 font-semibold text-right">Leads</th>
                <th className="pb-2.5 font-semibold text-right">High Intent</th>
                <th className="pb-2.5 font-semibold text-right">Qualified</th>
                <th className="pb-2.5 font-semibold text-right">Est. Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E2638]/50">
              {industries.map((ind, idx) => (
                <tr
                  key={ind.industry}
                  className="hover:bg-surface-elevated/50 transition-colors"
                >
                  <td className="py-2.5 font-semibold text-foreground">
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-purple-400 shrink-0" />
                      <span className="truncate max-w-[140px]">{ind.industry}</span>
                    </div>
                  </td>
                  <td className="py-2.5 text-right font-mono text-foreground-secondary">
                    {ind.discoveredLeads}
                  </td>
                  <td className="py-2.5 text-right font-mono font-semibold text-amber-400">
                    {ind.highIntentCount}
                  </td>
                  <td className="py-2.5 text-right font-mono font-semibold text-emerald-400">
                    {ind.qualifiedCount}
                  </td>
                  <td className="py-2.5 text-right font-mono font-bold text-foreground">
                    {ind.totalEstimatedValue}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="pt-3 border-t border-border text-xs text-foreground-tertiary flex items-center justify-between">
        <span>Highest Converting ICP: Technology & SaaS</span>
        <span className="text-purple-400 font-semibold font-mono">31.3% Qualified Yield</span>
      </div>
    </div>
  );
};
