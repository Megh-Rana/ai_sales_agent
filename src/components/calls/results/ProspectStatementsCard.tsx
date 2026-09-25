import React from 'react';
import { MessageSquare, ExternalLink, ArrowUpRight, AlertCircle, HelpCircle } from 'lucide-react';
import { KeyProspectStatement } from '../../../types/callResults';

interface ProspectStatementsCardProps {
  statements: KeyProspectStatement[];
  onJumpToTurn?: (turnId?: string) => void;
}

export const ProspectStatementsCard: React.FC<ProspectStatementsCardProps> = ({
  statements,
  onJumpToTurn,
}) => {
  if (!statements || statements.length === 0) {
    return null;
  }

  const getImpactBadge = (impact: KeyProspectStatement['impact']) => {
    switch (impact) {
      case 'positive':
        return {
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/25',
          label: 'Positive Catalyst',
          icon: ArrowUpRight,
        };
      case 'concern':
        return {
          bg: 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/25',
          label: 'Friction / Question',
          icon: AlertCircle,
        };
      case 'neutral':
      default:
        return {
          bg: 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-700/20 dark:text-slate-300 dark:border-slate-700/40',
          label: 'Context',
          icon: HelpCircle,
        };
    }
  };

  return (
    <div className="bg-surface border border-border rounded-xl p-5 sm:p-6 shadow-xs dark:bg-[#12161F] dark:border-[#232B3B]">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-base font-bold text-foreground dark:text-white tracking-tight">
            Key Prospect Statements
          </h3>
          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-800 border border-indigo-300 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/30">
            {statements.length} Highlights
          </span>
        </div>
      </div>

      {/* Statements List */}
      <div className="space-y-3">
        {statements.map((stmt) => {
          const badge = getImpactBadge(stmt.impact);
          const BadgeIcon = badge.icon;

          return (
            <div
              key={stmt.id}
              className="bg-surface-elevated border border-border hover:border-primary/40 rounded-lg p-3.5 transition-all shadow-xs dark:bg-[#151A25] dark:border-[#232B3B] dark:hover:border-slate-600"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-foreground dark:text-white">
                    {stmt.speaker}
                  </span>
                  <span className="text-[11px] font-mono text-foreground-muted dark:text-slate-500">
                    {stmt.timestamp}
                  </span>
                </div>

                <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium border ${badge.bg}`}>
                  <BadgeIcon className="w-2.5 h-2.5" />
                  <span>{badge.label}</span>
                </div>
              </div>

              {/* Exact Quote */}
              <div className="bg-surface border border-border rounded p-2.5 mb-2 dark:bg-[#0C0F16] dark:border-[#1E2536]">
                <p className="text-xs text-foreground-secondary dark:text-slate-200 italic leading-relaxed">
                  "{stmt.statement}"
                </p>
              </div>

              {/* Sales Meaning */}
              <div className="flex items-center justify-between gap-2 text-xs">
                <div className="text-foreground-secondary dark:text-slate-300">
                  <span className="font-semibold text-foreground-muted dark:text-slate-400 mr-1">Sales Meaning:</span>
                  <span>{stmt.salesMeaning}</span>
                </div>

                {stmt.turnId && onJumpToTurn && (
                  <button
                    onClick={() => onJumpToTurn(stmt.turnId)}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-primary dark:text-blue-400 hover:text-primary-hover dark:hover:text-blue-300 transition-colors shrink-0"
                    title="Jump to turn in transcript"
                  >
                    <span>View Turn</span>
                    <ExternalLink className="w-2.5 h-2.5" />
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
