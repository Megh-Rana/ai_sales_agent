import React from 'react';
import { 
  CheckCircle2, 
  HelpCircle, 
  ShieldCheck, 
  Sparkles,
  MinusCircle,
  ExternalLink
} from 'lucide-react';
import { StructuredQualificationField, QualificationStatusType } from '../../../types/callResults';

interface QualificationGridProps {
  fields: StructuredQualificationField[];
  onJumpToTurn?: (turnId?: string) => void;
}

export const QualificationGrid: React.FC<QualificationGridProps> = ({
  fields,
  onJumpToTurn,
}) => {
  const getStatusBadge = (status: QualificationStatusType) => {
    switch (status) {
      case 'confirmed':
        return {
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/25',
          label: 'Confirmed',
          icon: CheckCircle2,
        };
      case 'inferred':
        return {
          bg: 'bg-blue-50 text-blue-800 border-blue-300 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/25',
          label: 'Inferred',
          icon: ShieldCheck,
        };
      case 'unknown':
        return {
          bg: 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-700/30 dark:text-slate-400 dark:border-slate-600/30',
          label: 'Unknown',
          icon: HelpCircle,
        };
      case 'not_discussed':
        return {
          bg: 'bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-800/20 dark:text-slate-500 dark:border-slate-700/20',
          label: 'Not Discussed',
          icon: MinusCircle,
        };
      default:
        return {
          bg: 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-700/30 dark:text-slate-400 dark:border-slate-600/30',
          label: status,
          icon: HelpCircle,
        };
    }
  };

  return (
    <div className="bg-surface border border-border rounded-xl p-5 sm:p-6 shadow-xs dark:bg-[#12161F] dark:border-[#232B3B]">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-base font-bold text-foreground dark:text-white tracking-tight">
              Structured Qualification Matrix
            </h3>
          </div>
          <p className="text-xs text-foreground-secondary dark:text-slate-400">
            Verified B2B discovery across 8 core operational criteria
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-2 text-[11px]">
          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
            <CheckCircle2 className="w-3 h-3" /> Confirmed
          </span>
          <span className="text-border dark:text-slate-600">•</span>
          <span className="flex items-center gap-1 text-primary dark:text-blue-400 font-medium">
            <ShieldCheck className="w-3 h-3" /> Inferred
          </span>
          <span className="text-border dark:text-slate-600">•</span>
          <span className="flex items-center gap-1 text-foreground-muted dark:text-slate-400">
            <MinusCircle className="w-3 h-3" /> Not Discussed
          </span>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {fields.map((field) => {
          const badge = getStatusBadge(field.status);
          const BadgeIcon = badge.icon;
          const isConfirmedOrInferred = field.status === 'confirmed' || field.status === 'inferred';

          return (
            <div
              key={field.key}
              className={`flex flex-col justify-between rounded-lg p-3.5 border transition-all ${
                isConfirmedOrInferred
                  ? 'bg-surface-elevated border-border hover:border-primary/40 dark:bg-[#151A25] dark:border-[#263143] dark:hover:border-slate-600 shadow-xs'
                  : 'bg-surface border-border opacity-70 dark:bg-[#0E1118] dark:border-[#1C2331]'
              }`}
            >
              <div>
                {/* Field Label & Badge */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-semibold text-foreground-secondary dark:text-slate-300">
                    {field.label}
                  </span>
                  <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium border ${badge.bg}`}>
                    <BadgeIcon className="w-2.5 h-2.5" />
                    <span>{badge.label}</span>
                  </div>
                </div>

                {/* Field Value */}
                <div className="text-sm font-semibold text-foreground dark:text-white mb-2 leading-snug">
                  {field.value}
                </div>

                {/* Evidence Quote if present */}
                {field.evidenceQuote && (
                  <div className="text-[11px] text-foreground-secondary dark:text-slate-300/80 italic bg-surface/80 dark:bg-[#0A0D14] p-2 rounded border border-border dark:border-[#1E2536] mb-2 leading-relaxed">
                    "{field.evidenceQuote}"
                  </div>
                )}
              </div>

              {/* Source Note & Jump Anchor */}
              <div className="pt-2 border-t border-border dark:border-[#1C2331] flex items-center justify-between gap-2 text-[11px] text-foreground-muted dark:text-slate-400 mt-1">
                <span className="truncate">{field.sourceNote}</span>

                {field.turnId && onJumpToTurn && (
                  <button
                    onClick={() => onJumpToTurn(field.turnId)}
                    className="inline-flex items-center gap-1 text-[10px] font-medium text-primary dark:text-blue-400 hover:text-primary-hover dark:hover:text-blue-300 transition-colors shrink-0"
                    title="Jump to transcript turn"
                  >
                    <span>View turn</span>
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
