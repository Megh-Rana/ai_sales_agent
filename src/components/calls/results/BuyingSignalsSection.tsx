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
      <div className="bg-[#12161F] border border-[#232B3B] rounded-xl p-5 text-center">
        <TrendingUp className="w-6 h-6 text-slate-500 mx-auto mb-2" />
        <p className="text-sm font-medium text-slate-300">No strong buying signals detected</p>
        <p className="text-xs text-slate-500 mt-1">Prospect conversation remained exploratory without explicit commercial triggers.</p>
      </div>
    );
  }

  return (
    <div className="bg-[#12161F] border border-[#232B3B] rounded-xl p-5 sm:p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <h3 className="text-base font-bold text-white tracking-tight">
            Detected Buying Signals
          </h3>
          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
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
              className="bg-[#151A25] border border-[#232B3B] hover:border-slate-600 rounded-lg p-4 transition-all"
            >
              {/* Top row: Title & Importance */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">
                    {signal.title}
                  </span>
                  <span className="text-[10px] uppercase font-semibold text-slate-400 bg-[#1E2536] px-2 py-0.5 rounded border border-[#2D384E]">
                    {signal.category}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                      isHigh
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                        : 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                    }`}
                  >
                    <ArrowUpRight className="w-2.5 h-2.5" />
                    <span>{isHigh ? 'High Impact' : 'Moderate Impact'}</span>
                  </span>

                  <span className="text-xs text-slate-500 font-mono">
                    {signal.timestamp}
                  </span>
                </div>
              </div>

              {/* Exact Verbatim Quote */}
              <div className="bg-[#0D1017] border border-[#1E2536] rounded-md p-3 mb-2.5">
                <div className="flex items-start gap-2">
                  <MessageSquareQuote className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-200 italic leading-relaxed">
                    "{signal.evidenceQuote}"
                  </p>
                </div>
              </div>

              {/* Commercial Impact */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                <div className="flex items-start gap-1.5 text-xs text-slate-300">
                  <TrendingUp className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-blue-300 mr-1">Commercial Impact:</span>
                    <span>{signal.whyItMatters}</span>
                  </div>
                </div>

                {signal.turnId && onJumpToTurn && (
                  <button
                    onClick={() => onJumpToTurn(signal.turnId)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors shrink-0 self-end sm:self-auto"
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
