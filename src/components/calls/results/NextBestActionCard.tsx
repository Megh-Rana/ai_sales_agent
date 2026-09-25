import React from 'react';
import { 
  Zap, 
  CalendarPlus, 
  Mail, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  TrendingUp,
  Ban,
  RotateCcw,
  Check
} from 'lucide-react';
import { NextBestAction } from '../../../types/callResults';
import { RecommendationState } from '../../../types/followUp';

interface NextBestActionCardProps {
  nba: NextBestAction;
  recommendationState?: RecommendationState;
  onOpenScheduleDemo: () => void;
  onOpenFollowUp: () => void;
  onOpenDelay?: () => void;
  onOpenDismiss?: () => void;
  onResetRecommendation?: () => void;
}

export const NextBestActionCard: React.FC<NextBestActionCardProps> = ({
  nba,
  recommendationState,
  onOpenScheduleDemo,
  onOpenFollowUp,
  onOpenDelay,
  onOpenDismiss,
  onResetRecommendation,
}) => {
  const status = recommendationState?.status || 'RECOMMENDED';
  const scheduled = recommendationState?.scheduledItem;

  return (
    <div className="relative overflow-hidden rounded-xl bg-surface border border-border shadow-xs dark:bg-gradient-to-br dark:from-[#151B28] dark:via-[#121620] dark:to-[#10141D] dark:border-blue-500/30 dark:shadow-lg p-5 sm:p-6 transition-all">
      {/* Subtle background accent glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 dark:bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Tag & Priority / Alignment */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary/10 border border-primary/20 text-primary dark:bg-blue-500/15 dark:border-blue-500/30 dark:text-blue-400 text-xs font-semibold uppercase tracking-wide">
            <Zap className="w-3.5 h-3.5 text-primary dark:text-blue-400" />
            <span>Next Best Action</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface-elevated border border-border text-xs font-medium text-foreground-secondary dark:bg-[#1B2232] dark:border-[#2D3748] dark:text-slate-300">
            <Clock className="w-3 h-3 text-amber-500 dark:text-amber-400" />
            <span className="text-foreground-muted dark:text-slate-400">Timeframe:</span>
            <span className="text-foreground dark:text-white font-semibold">{nba.targetTimeframe}</span>
          </div>
        </div>

        {/* Alignment & Status indicator */}
        <div className="flex items-center gap-2.5">
          {status === 'SCHEDULED' && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-100 border border-emerald-300 text-emerald-800 dark:bg-emerald-500/15 dark:border-emerald-500/30 dark:text-emerald-300 text-xs font-bold uppercase">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Action Confirmed</span>
            </div>
          )}

          {status === 'DELAYED' && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-amber-100 border border-amber-300 text-amber-800 dark:bg-amber-500/15 dark:border-amber-500/30 dark:text-amber-300 text-xs font-bold uppercase">
              <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Postponed ({recommendationState?.delayedUntil})</span>
            </div>
          )}

          {status === 'DISMISSED' && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-rose-100 border border-rose-300 text-rose-800 dark:bg-rose-500/15 dark:border-rose-500/30 dark:text-rose-300 text-xs font-bold uppercase">
              <Ban className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
              <span>Dismissed</span>
            </div>
          )}

          {status === 'RECOMMENDED' && (
            <div className="flex items-center gap-2.5 bg-surface-elevated px-3 py-1.5 rounded-lg border border-border dark:bg-[#0D111A] dark:border-[#232B3B] shadow-xs">
              <TrendingUp className="w-3.5 h-3.5 text-primary dark:text-blue-400" />
              <span className="text-xs text-foreground-secondary dark:text-slate-400">Commercial Alignment:</span>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">High ({nba.confidence}%)</span>
                <div className="w-14 h-1.5 bg-border dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 dark:bg-emerald-400 rounded-full" 
                    style={{ width: `${nba.confidence}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Primary Action Title */}
      <div className="mb-4">
        <h3 className="text-xl sm:text-2xl font-bold text-foreground dark:text-white tracking-tight leading-tight">
          {nba.action}
        </h3>
      </div>

      {/* If SCHEDULED state */}
      {status === 'SCHEDULED' && scheduled ? (
        <div className="mb-5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-500/30 rounded-xl p-4 space-y-2 animate-fade-in">
          <div className="flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300 font-bold uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Follow-up Scheduled & Logged
            </span>
            <span className="font-mono text-emerald-700 dark:text-emerald-400">{scheduled.date} at {scheduled.time}</span>
          </div>
          <p className="text-xs text-foreground-secondary dark:text-slate-200 leading-relaxed">
            Assigned owner: <strong className="text-foreground dark:text-white">{scheduled.owner}</strong>. Sales note: <span className="italic font-normal">"{scheduled.note || 'No custom note.'}"</span>
          </p>
        </div>
      ) : status === 'DELAYED' ? (
        <div className="mb-5 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-500/30 rounded-xl p-4 flex items-center justify-between gap-3 text-xs text-amber-900 dark:text-amber-200 animate-fade-in">
          <div>
            <span className="font-bold block text-foreground dark:text-white">Action postponed until {recommendationState?.delayedUntil}</span>
            <span className="text-foreground-secondary dark:text-slate-400">This recommendation has been moved out of immediate sales priority.</span>
          </div>
          {onResetRecommendation && (
            <button
              onClick={onResetRecommendation}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 border border-amber-300 text-amber-900 dark:bg-amber-500/20 dark:hover:bg-amber-500/30 dark:border-amber-500/40 dark:text-amber-300 font-medium shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Re-activate</span>
            </button>
          )}
        </div>
      ) : status === 'DISMISSED' ? (
        <div className="mb-5 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-500/30 rounded-xl p-4 flex items-center justify-between gap-3 text-xs text-rose-900 dark:text-rose-200 animate-fade-in">
          <div>
            <span className="font-bold block text-foreground dark:text-white">Recommendation Dismissed</span>
            <span className="text-foreground-secondary dark:text-slate-400">Feedback recorded for account executive lead queue.</span>
          </div>
          {onResetRecommendation && (
            <button
              onClick={onResetRecommendation}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 border border-rose-300 text-rose-900 dark:bg-rose-500/20 dark:hover:bg-rose-500/30 dark:border-rose-500/40 dark:text-rose-300 font-medium shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Undo Dismissal</span>
            </button>
          )}
        </div>
      ) : (
        <>
          {/* "Why Now" Section */}
          <div className="mb-5 bg-surface-elevated border border-border rounded-lg p-3.5 sm:p-4 dark:bg-[#0D121C] dark:border-[#1F293D]">
            <div className="text-[11px] font-bold uppercase tracking-wider text-primary dark:text-blue-400 flex items-center gap-1.5 mb-1.5">
              <Zap className="w-3 h-3 text-primary dark:text-blue-400" />
              <span>Commercial Catalyst (Why Now)</span>
            </div>
            <p className="text-sm font-medium text-foreground-secondary dark:text-slate-200 leading-relaxed">
              {nba.whyNow}
            </p>
          </div>

          {/* Supporting Evidence Checklist */}
          <div className="mb-6">
            <div className="text-[11px] font-bold uppercase tracking-wider text-foreground-muted dark:text-slate-400 mb-2.5">
              Supporting Signals & Evidence
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
              {nba.evidence.map((item, idx) => (
                <div 
                  key={idx} 
                  className="flex items-start gap-2 bg-surface-elevated border border-border p-2.5 rounded-lg text-xs text-foreground-secondary dark:bg-[#121620] dark:border-[#232B3B] dark:text-slate-300 shadow-xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span className="leading-snug">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Action Buttons Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border dark:border-[#1F293D]">
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onOpenScheduleDemo}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary hover:bg-primary-hover active:bg-blue-700 text-white text-xs sm:text-sm font-semibold shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <CalendarPlus className="w-4 h-4" />
            <span>{status === 'SCHEDULED' ? 'Modify Schedule' : 'Schedule Demo Now'}</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1 opacity-80" />
          </button>

          <button
            onClick={onOpenFollowUp}
            className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-lg bg-surface-elevated hover:bg-surface-hover border border-border text-foreground hover:text-foreground dark:bg-[#1A2233] dark:hover:bg-[#222C42] dark:border-[#2F3E5E] dark:text-slate-200 dark:hover:text-white text-xs sm:text-sm font-medium transition-all shadow-xs"
          >
            <Mail className="w-4 h-4 text-primary dark:text-cyan-400" />
            <span>Draft Email</span>
          </button>
        </div>

        {status === 'RECOMMENDED' && (
          <div className="flex items-center gap-2">
            {onOpenDelay && (
              <button
                type="button"
                onClick={onOpenDelay}
                className="px-3 py-2 text-xs font-medium text-foreground-secondary hover:text-amber-600 dark:text-slate-400 dark:hover:text-amber-300 hover:bg-amber-500/10 rounded-lg transition-colors"
                title="Postpone follow-up date"
              >
                <span>Delay</span>
              </button>
            )}

            {onOpenDismiss && (
              <button
                type="button"
                onClick={onOpenDismiss}
                className="px-3 py-2 text-xs font-medium text-foreground-secondary hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors"
                title="Dismiss recommendation"
              >
                <span>Dismiss</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
