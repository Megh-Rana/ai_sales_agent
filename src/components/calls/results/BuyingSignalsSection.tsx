import React from 'react';
import { 
  TrendingUp, 
  MessageSquareQuote, 
  ExternalLink, 
  Sparkles, 
  ArrowUpRight 
} from 'lucide-react';
import { ResultBuyingSignal } from '../../../types/callResults';

interface BuyingSignalsSectionProps {
  signals: ResultBuyingSignal[];
  onJumpToTurn?: (turnId?: string) => void;
}

export const BuyingSignalsSection: React.FC<BuyingSignalsSectionProps> = ({
  signals,
  onJumpToTurn,
}) => {
  if (!signals || signals.length === 0) {
    return (
      <div className="bg-surface border border-border rounded-xl p-5 text-center dark:bg-[#12161F] dark:border-[#232B3B]">
        <TrendingUp className="w-6 h-6 text-foreground-muted dark:text-slate-500 mx-auto mb-2" />
        <p className="text-sm font-medium text-foreground-secondary dark:text-slate-300">No strong buying signals detected</p>
        <p className="text-xs text-foreground-muted dark:text-slate-500 mt-1">Prospect conversation remained exploratory without explicit commercial triggers.</p>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border rounded-xl p-5 sm:p-6 shadow-xs dark:bg-[#12161F] dark:border-[#232B3B]">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-base font-bold text-foreground dark:text-white tracking-tight">
            Detected Buying Signals
          </h3>
          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30">
            {signals.length} Signals
          </span>
        </div>
      </div>

      {/* Signals List */}
      <div className="space-y-3.5">
        {signals.map((signal) => {
          const isHigh = signal.importance === 'high';

          return (
            <div
              key={signal.id}
              className="bg-surface-elevated border border-border hover:border-primary/40 rounded-lg p-4 transition-all shadow-xs dark:bg-[#151A25] dark:border-[#232B3B] dark:hover:border-slate-600"
            >
              {/* Top row: Title & Importance */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-foreground dark:text-white">
                    {signal.title}
                  </span>
                  <span className="text-[10px] uppercase font-semibold text-foreground-secondary bg-surface px-2 py-0.5 rounded border border-border dark:text-slate-400 dark:bg-[#1E2536] dark:border-[#2D384E]">
                    {signal.category}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                      isHigh
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30'
                        : 'bg-blue-50 text-blue-800 border-blue-300 dark:bg-blue-500/15 dark:text-blue-400 dark:border-blue-500/30'
                    }`}
                  >
                    <ArrowUpRight className="w-2.5 h-2.5" />
                    <span>{isHigh ? 'High Impact' : 'Moderate Impact'}</span>
                  </span>

                  <span className="text-xs text-foreground-muted dark:text-slate-500 font-mono">
                    {signal.timestamp}
                  </span>
                </div>
              </div>

              {/* Exact Verbatim Quote */}
              <div className="bg-surface border border-border rounded-md p-3 mb-2.5 dark:bg-[#0D1017] dark:border-[#1E2536]">
                <div className="flex items-start gap-2">
                  <MessageSquareQuote className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-foreground-secondary dark:text-slate-200 italic leading-relaxed">
                    "{signal.evidenceQuote}"
                  </p>
                </div>
              </div>

              {/* Commercial Impact */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                <div className="flex items-start gap-1.5 text-xs text-foreground-secondary dark:text-slate-300">
                  <TrendingUp className="w-3.5 h-3.5 text-primary dark:text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-primary dark:text-blue-300 mr-1">Commercial Impact:</span>
                    <span>{signal.whyItMatters}</span>
                  </div>
                </div>

                {signal.turnId && onJumpToTurn && (
                  <button
                    onClick={() => onJumpToTurn(signal.turnId)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary dark:text-blue-400 hover:text-primary-hover dark:hover:text-blue-300 transition-colors shrink-0 self-end sm:self-auto"
                  >
                    <span>View Conversation Moment</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
