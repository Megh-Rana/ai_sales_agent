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
    <div className="bg-surface border border-border rounded-xl p-5 sm:p-6 shadow-xs dark:bg-[#12161F] dark:border-[#232B3B]">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-base font-bold text-foreground dark:text-white tracking-tight">
            Lead Dossier Intelligence Updates
          </h3>
          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30">
            Auto-Updated
          </span>
        </div>
      </div>

      <p className="text-xs text-foreground-secondary dark:text-slate-400 mb-4">
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
              className={`rounded-lg p-3.5 border transition-all shadow-xs ${
                isIntent && directionUp
                  ? 'bg-emerald-50/80 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-500/30'
                  : isIntent && directionDown
                  ? 'bg-rose-50/80 border-rose-200 dark:bg-rose-950/20 dark:border-rose-500/30'
                  : 'bg-surface-elevated border-border dark:bg-[#151A25] dark:border-[#232B3B]'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-bold text-foreground dark:text-slate-300">
                  {change.metric}
                </span>

                {delta !== null && delta !== 0 && (
                  <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                    delta > 0
                      ? 'text-emerald-800 bg-emerald-50 border-emerald-300 dark:text-emerald-400 dark:bg-emerald-500/15 dark:border-emerald-500/30'
                      : 'text-rose-800 bg-rose-50 border-rose-300 dark:text-rose-400 dark:bg-rose-500/15 dark:border-rose-500/30'
                  }`}>
                    {delta > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {delta > 0 ? `+${delta}` : delta} pts
                  </span>
                )}

                {delta === 0 && isIntent && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-foreground-secondary bg-surface px-2 py-0.5 rounded-full border border-border dark:text-slate-400 dark:bg-slate-700/30 dark:border-slate-600/30">
                    <Minus className="w-3 h-3" />
                    No change
                  </span>
                )}
              </div>

              {/* Before -> After visual pill */}
              <div className="flex items-center gap-2 mb-2.5 bg-surface p-2 rounded border border-border text-xs dark:bg-[#0D1017] dark:border-[#1E2536]">
                <span className={`truncate max-w-[45%] ${change.direction === 'neutral' ? 'text-foreground-muted dark:text-slate-400' : 'text-foreground-muted dark:text-slate-400 line-through'}`}>
                  {change.before}
                </span>
                <ArrowRight className="w-3 h-3 text-primary dark:text-blue-400 shrink-0" />
                <span className={`font-semibold truncate max-w-[45%] ${
                  directionUp ? 'text-emerald-600 dark:text-emerald-400' : directionDown ? 'text-rose-600 dark:text-rose-400' : 'text-foreground dark:text-slate-300'
                }`}>
                  {change.after}
                </span>
              </div>

              {/* Rationale */}
              <div className="flex items-start gap-1.5 text-[11px] text-foreground-secondary dark:text-slate-300/90 leading-relaxed">
                <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>{change.rationale}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
