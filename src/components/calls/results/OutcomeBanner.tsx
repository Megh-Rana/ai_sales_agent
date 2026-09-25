import React from 'react';
import { 
  CheckCircle2, 
  HelpCircle, 
  Clock, 
  PhoneOff, 
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import { CallOutcomeType } from '../../../types/callResults';

interface OutcomeBannerProps {
  outcome: CallOutcomeType;
  explanation: string;
  supportingIndicators: string[];
  failureReason?: string;
}

export const OutcomeBanner: React.FC<OutcomeBannerProps> = ({
  outcome,
  explanation,
  supportingIndicators,
  failureReason,
}) => {
  const getBannerConfig = () => {
    switch (outcome) {
      case 'QUALIFIED':
        return {
          containerClass: 'bg-emerald-50/80 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-500/30 text-emerald-900 dark:text-emerald-300',
          badgeClass: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/40',
          icon: CheckCircle2,
          iconColor: 'text-emerald-600 dark:text-emerald-400',
          title: 'Qualified Prospect · Ready for Account Executive Handoff',
          indicatorBullet: 'text-emerald-600 dark:text-emerald-400',
        };
      case 'INTERESTED':
        return {
          containerClass: 'bg-blue-50/80 dark:bg-blue-950/20 border-blue-200 dark:border-blue-500/30 text-blue-900 dark:text-blue-300',
          badgeClass: 'bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-500/40',
          icon: TrendingUp,
          iconColor: 'text-blue-600 dark:text-blue-400',
          title: 'High Interest Expressed · Evaluation Ongoing',
          indicatorBullet: 'text-blue-600 dark:text-blue-400',
        };
      case 'FOLLOW_UP':
        return {
          containerClass: 'bg-amber-50/80 dark:bg-amber-950/20 border-amber-200 dark:border-amber-500/30 text-amber-900 dark:text-amber-300',
          badgeClass: 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-500/40',
          icon: Clock,
          iconColor: 'text-amber-600 dark:text-amber-400',
          title: 'Follow-up Scheduled / Requested by Prospect',
          indicatorBullet: 'text-amber-600 dark:text-amber-400',
        };
      case 'NO_ANSWER':
        return {
          containerClass: 'bg-slate-100 dark:bg-slate-900/40 border-slate-300 dark:border-slate-700/50 text-slate-800 dark:text-slate-300',
          badgeClass: 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600',
          icon: PhoneOff,
          iconColor: 'text-slate-600 dark:text-slate-400',
          title: 'No Answer · Cadence Reschedule Scheduled',
          indicatorBullet: 'text-slate-600 dark:text-slate-400',
        };
      case 'FAILED':
        return {
          containerClass: 'bg-rose-50/80 dark:bg-rose-950/20 border-rose-200 dark:border-rose-500/30 text-rose-900 dark:text-rose-300',
          badgeClass: 'bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-500/40',
          icon: AlertTriangle,
          iconColor: 'text-rose-600 dark:text-rose-400',
          title: 'Call Unsuccessful / Carrier Disconnect',
          indicatorBullet: 'text-rose-600 dark:text-rose-400',
        };
      default:
        return {
          containerClass: 'bg-surface dark:bg-[#161B26] border-border dark:border-[#2D3748] text-foreground dark:text-slate-200',
          badgeClass: 'bg-surface-elevated dark:bg-slate-800 text-foreground-secondary dark:text-slate-300 border-border dark:border-slate-700',
          icon: HelpCircle,
          iconColor: 'text-foreground-secondary dark:text-slate-400',
          title: `Outcome: ${outcome}`,
          indicatorBullet: 'text-foreground-secondary dark:text-slate-400',
        };
    }
  };

  const config = getBannerConfig();
  const Icon = config.icon;

  return (
    <div role="status" aria-live="polite" className={`p-4 sm:p-5 rounded-xl border ${config.containerClass} transition-all shadow-xs`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Outcome Icon + Explanation */}
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-lg bg-surface dark:bg-[#0B0E14]/60 border border-border dark:border-white/5 shrink-0 shadow-xs mt-0.5">
            <Icon className={`w-5 h-5 ${config.iconColor}`} />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold tracking-wide uppercase opacity-85">
                Qualification Assessment
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold border bg-surface/70 dark:bg-white/5 border-border dark:border-white/10 text-slate-800 dark:text-slate-300 shadow-xs">
                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
                <span>Qualification Verified</span>
              </span>
            </div>

            <h2 className="text-base sm:text-lg font-bold text-slate-950 dark:text-white tracking-tight">
              {config.title}
            </h2>

            <p className="text-sm text-slate-800 dark:text-slate-200/90 mt-1 max-w-3xl leading-relaxed font-medium">
              {explanation}
            </p>

            {failureReason && (
              <div className="mt-2 text-xs font-mono bg-rose-100 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800/40 px-3 py-1.5 rounded text-rose-800 dark:text-rose-300 inline-block font-semibold">
                Carrier Diagnostics: {failureReason}
              </div>
            )}
          </div>
        </div>

        {/* Right: 3 Supporting Indicators */}
        {supportingIndicators && supportingIndicators.length > 0 && (
          <div className="md:border-l md:border-border dark:md:border-white/10 md:pl-5 shrink-0 lg:max-w-xs">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-900 dark:text-slate-400 mb-2">
              Key Indicators
            </div>
            <ul className="space-y-1.5 text-xs text-slate-800 dark:text-slate-200 font-medium">
              {supportingIndicators.map((indicator, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <ArrowUpRight className={`w-3.5 h-3.5 ${config.indicatorBullet} shrink-0 mt-0.5`} />
                  <span className="leading-snug">{indicator}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
