import React from 'react';
import { RefreshCw, ArrowRight, TrendingUp, TrendingDown, Minus, Sparkles, CheckCircle2 } from 'lucide-react';
import { IntelligenceChange } from '../../../types/callResults';

interface LeadIntelligenceChangesProps {
  changes: IntelligenceChange[];
  companyName?: string;
}

/**
 * Extracts numeric values from score strings like "72 / 100" and computes delta.
 * Returns null if parsing fails to avoid fabricated precision.
 */
function computeScoreDelta(before: string, after: string): number | null {
  const beforeNum = parseInt(before, 10);
  const afterNum = parseInt(after, 10);
  if (isNaN(beforeNum) || isNaN(afterNum)) return null;
  return afterNum - beforeNum;
}

export const LeadIntelligenceChanges: React.FC<LeadIntelligenceChangesProps> = ({
  changes,
  companyName,
}) => {
  if (!changes || changes.length === 0) {
    return null;
  }

  return (
    <div className="bg-[#12161F] border border-[#232B3B] rounded-xl p-5 sm:p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4 text-emerald-400" />
          <h3 className="text-base font-bold text-white tracking-tight">
            Lead Dossier Intelligence Updates
          </h3>
          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            Auto-Updated
          </span>
        </div>
      </div>

      <p className="text-xs text-slate-400 mb-4">
        Call findings have automatically synchronized to {companyName ? `${companyName}'s` : 'the'} lead dossier.
      </p>

      {/* Changes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {changes.map((change, idx) => {
          const isIntent = change.metric.toLowerCase().includes('intent');
          const delta = isIntent ? computeScoreDelta(change.before, change.after) : null;
          const directionUp = change.direction === 'up';
          const directionDown = change.direction === 'down';

          return (
            <div
              key={`${change.metric}-${idx}`}
              className={`rounded-lg p-3.5 border transition-all ${
                isIntent && directionUp
                  ? 'bg-emerald-950/20 border-emerald-500/30'
                  : isIntent && directionDown
                  ? 'bg-rose-950/20 border-rose-500/30'
                  : 'bg-[#151A25] border-[#232B3B]'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-bold text-slate-300">
                  {change.metric}
                </span>

                {delta !== null && delta !== 0 && (
                  <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                    delta > 0
                      ? 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30'
                      : 'text-rose-400 bg-rose-500/15 border-rose-500/30'
                  }`}>
                    {delta > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {delta > 0 ? `+${delta}` : delta} pts
                  </span>
                )}

                {delta === 0 && isIntent && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-400 bg-slate-700/30 px-2 py-0.5 rounded-full border border-slate-600/30">
                    <Minus className="w-3 h-3" />
                    No change
                  </span>
                )}
              </div>

              {/* Before -> After visual pill */}
              <div className="flex items-center gap-2 mb-2.5 bg-[#0D1017] p-2 rounded border border-[#1E2536] text-xs">
                <span className={`truncate max-w-[45%] ${change.direction === 'neutral' ? 'text-slate-400' : 'text-slate-400 line-through'}`}>
                  {change.before}
                </span>
                <ArrowRight className="w-3 h-3 text-blue-400 shrink-0" />
                <span className={`font-semibold truncate max-w-[45%] ${
                  directionUp ? 'text-emerald-400' : directionDown ? 'text-rose-400' : 'text-slate-300'
                }`}>
                  {change.after}
                </span>
              </div>

              {/* Rationale */}
              <div className="flex items-start gap-1.5 text-[11px] text-slate-300/90 leading-relaxed">
                <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                <span>{change.rationale}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
