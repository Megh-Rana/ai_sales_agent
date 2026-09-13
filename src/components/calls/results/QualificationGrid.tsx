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
          bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
          label: 'Confirmed',
          icon: CheckCircle2,
        };
      case 'inferred':
        return {
          bg: 'bg-blue-500/10 text-blue-400 border-blue-500/25',
          label: 'Inferred',
          icon: ShieldCheck,
        };
      case 'unknown':
        return {
          bg: 'bg-slate-700/30 text-slate-400 border-slate-600/30',
          label: 'Unknown',
          icon: HelpCircle,
        };
      case 'not_discussed':
        return {
          bg: 'bg-slate-800/20 text-slate-500 border-slate-700/20',
          label: 'Not Discussed',
          icon: MinusCircle,
        };
      default:
        return {
          bg: 'bg-slate-700/30 text-slate-400 border-slate-600/30',
          label: status,
          icon: HelpCircle,
        };
    }
  };

  const config = getStatusBadge;

  return (
    <div className="bg-[#12161F] border border-[#232B3B] rounded-xl p-5 sm:p-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <h3 className="text-base font-bold text-white tracking-tight">
              Structured Qualification Matrix
            </h3>
          </div>
          <p className="text-xs text-slate-400">
            Verified B2B discovery across 8 core operational criteria
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-2 text-[11px]">
          <span className="flex items-center gap-1 text-emerald-400">
            <CheckCircle2 className="w-3 h-3" /> Confirmed
          </span>
          <span className="text-slate-600">•</span>
          <span className="flex items-center gap-1 text-blue-400">
            <ShieldCheck className="w-3 h-3" /> Inferred
          </span>
          <span className="text-slate-600">•</span>
          <span className="flex items-center gap-1 text-slate-400">
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
                  ? 'bg-[#151A25] border-[#263143] hover:border-slate-600'
                  : 'bg-[#0E1118] border-[#1C2331] opacity-75'
              }`}
            >
              <div>
                {/* Field Label & Badge */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-semibold text-slate-300">
                    {field.label}
                  </span>
                  <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium border ${badge.bg}`}>
                    <BadgeIcon className="w-2.5 h-2.5" />
                    <span>{badge.label}</span>
                  </div>
                </div>

                {/* Field Value */}
                <div className="text-sm font-semibold text-white mb-2 leading-snug">
                  {field.value}
                </div>

                {/* Evidence Quote if present */}
                {field.evidenceQuote && (
                  <div className="text-[11px] text-slate-300/80 italic bg-[#0A0D14] p-2 rounded border border-[#1E2536] mb-2 leading-relaxed">
                    "{field.evidenceQuote}"
                  </div>
                )}
              </div>

              {/* Source Note & Jump Anchor */}
              <div className="pt-2 border-t border-[#1C2331] flex items-center justify-between gap-2 text-[11px] text-slate-400 mt-1">
                <span className="truncate">{field.sourceNote}</span>

                {field.turnId && onJumpToTurn && (
                  <button
                    onClick={() => onJumpToTurn(field.turnId)}
                    className="inline-flex items-center gap-1 text-[10px] font-medium text-blue-400 hover:text-blue-300 transition-colors shrink-0"
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
