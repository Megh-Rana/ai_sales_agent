import React from 'react';
import { 
  AlertTriangle, 
  MessageSquareQuote, 
  Lightbulb, 
  ExternalLink,
  ShieldAlert,
  CheckCircle2
} from 'lucide-react';
import { ResultObjection } from '../../../types/callResults';

interface ObjectionsRisksSectionProps {
  objections: ResultObjection[];
  onJumpToTurn?: (turnId?: string) => void;
}

export const ObjectionsRisksSection: React.FC<ObjectionsRisksSectionProps> = ({
  objections,
  onJumpToTurn,
}) => {
  if (!objections || objections.length === 0) {
    return (
      <div className="bg-surface border border-border rounded-xl p-5 text-center dark:bg-[#12161F] dark:border-[#232B3B]">
        <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 mx-auto mb-2" />
        <p className="text-sm font-medium text-foreground-secondary dark:text-slate-300">No major commercial objections raised</p>
        <p className="text-xs text-foreground-muted dark:text-slate-500 mt-1">Prospect did not express friction regarding pricing, timing, or technical feasibility.</p>
      </div>
    );
  }

  const getRiskBadge = (risk: ResultObjection['riskLevel']) => {
    switch (risk) {
      case 'high':
        return {
          bg: 'bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-500/15 dark:text-rose-400 dark:border-rose-500/30',
          label: 'High Commercial Risk',
        };
      case 'medium':
        return {
          bg: 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/30',
          label: 'Medium Risk',
        };
      case 'low':
      default:
        return {
          bg: 'bg-blue-50 text-blue-800 border-blue-300 dark:bg-blue-500/15 dark:text-blue-400 dark:border-blue-500/30',
          label: 'Low Risk',
        };
    }
  };

  return (
    <div className="bg-surface border border-border rounded-xl p-5 sm:p-6 shadow-xs dark:bg-[#12161F] dark:border-[#232B3B]">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-500 dark:text-amber-400" />
          <h3 className="text-base font-bold text-foreground dark:text-white tracking-tight">
            Commercial Objections & Risks
          </h3>
          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-300 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30">
            {objections.length} Identified
          </span>
        </div>
      </div>

      {/* Objections List */}
      <div className="space-y-4">
        {objections.map((obj) => {
          const riskBadge = getRiskBadge(obj.riskLevel);

          return (
            <div
              key={obj.id}
              className="bg-surface-elevated border border-border hover:border-primary/40 rounded-lg p-4 transition-all shadow-xs dark:bg-[#151A25] dark:border-[#232B3B] dark:hover:border-slate-600"
            >
              {/* Top row: Category, Concern, and Risk Level */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 dark:text-amber-400 dark:bg-amber-500/10 dark:border-amber-500/20">
                    {obj.category} Concern
                  </span>
                  <span className="text-sm font-bold text-foreground dark:text-white">
                    {obj.concern}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${riskBadge.bg}`}>
                    <AlertTriangle className="w-2.5 h-2.5" />
                    <span>{riskBadge.label}</span>
                  </span>

                  {obj.resolutionStatus && (
                    <span className="text-[10px] font-medium text-foreground-secondary bg-surface px-2 py-0.5 rounded border border-border dark:text-slate-400 dark:bg-[#1E2536] dark:border-transparent">
                      {obj.resolutionStatus === 'resolved' ? 'Resolved' : 'Partially addressed'}
                    </span>
                  )}
                </div>
              </div>

              {/* Prospect Verbatim Quote */}
              {obj.prospectQuote && (
                <div className="bg-surface border border-border rounded-md p-3 mb-3 dark:bg-[#0D1017] dark:border-[#1E2536]">
                  <div className="flex items-start gap-2">
                    <MessageSquareQuote className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-foreground-secondary dark:text-slate-200 italic leading-relaxed">
                      "{obj.prospectQuote}"
                    </p>
                  </div>
                </div>
              )}

              {/* AI Response Opportunity / Counter Strategy Card */}
              <div className="bg-primary/5 dark:bg-[#10192A] border border-primary/20 dark:border-blue-500/25 rounded-md p-3">
                <div className="flex items-start gap-2">
                  <Lightbulb className="w-3.5 h-3.5 text-primary dark:text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-semibold text-primary dark:text-blue-300 mr-1.5">
                      Recommended AE Counter-Strategy:
                    </span>
                    <span className="text-xs text-foreground-secondary dark:text-slate-200 leading-relaxed">
                      {obj.aiResponseOpportunity}
                    </span>
                  </div>
                </div>
              </div>

              {/* Turn Jump Anchor */}
              {obj.turnId && onJumpToTurn && (
                <div className="flex justify-end mt-2 pt-1">
                  <button
                    onClick={() => onJumpToTurn(obj.turnId)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary dark:text-blue-400 hover:text-primary-hover dark:hover:text-blue-300 transition-colors"
                  >
                    <span>View in Transcript</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
