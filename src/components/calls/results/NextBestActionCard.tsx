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
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#151B28] via-[#121620] to-[#10141D] border border-blue-500/30 shadow-lg p-5 sm:p-6 transition-all">
      {/* Subtle background accent glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Tag & Priority / Alignment */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-500/15 border border-blue-500/30 text-blue-400 text-xs font-semibold uppercase tracking-wide">
            <Zap className="w-3.5 h-3.5 text-blue-400" />
            <span>Next Best Action</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#1B2232] border border-[#2D3748] text-xs font-medium text-slate-300">
            <Clock className="w-3 h-3 text-amber-400" />
            <span>Timeframe:</span>
            <span className="text-white font-semibold">{nba.targetTimeframe}</span>
          </div>
        </div>

        {/* Alignment & Status indicator */}
        <div className="flex items-center gap-2.5">
          {status === 'SCHEDULED' && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Action Confirmed</span>
            </div>
          )}

          {status === 'DELAYED' && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Postponed ({recommendationState?.delayedUntil})</span>
            </div>
          )}

          {status === 'DISMISSED' && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-bold uppercase">
              <Ban className="w-3.5 h-3.5 text-rose-400" />
              <span>Dismissed</span>
            </div>
          )}

          {status === 'RECOMMENDED' && (
            <div className="flex items-center gap-2.5 bg-[#0D111A] px-3 py-1.5 rounded-lg border border-[#232B3B]">
              <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-xs text-slate-400">Commercial Alignment:</span>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-emerald-400">High ({nba.confidence}%)</span>
                <div className="w-14 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-400 rounded-full" 
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
        <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-tight">
          {nba.action}
        </h3>
      </div>

      {/* If SCHEDULED state */}
      {status === 'SCHEDULED' && scheduled ? (
        <div className="mb-5 bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-4 space-y-2 animate-fade-in">
          <div className="flex items-center justify-between text-xs text-emerald-300 font-bold uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-400" />
              Follow-up Scheduled & Logged
            </span>
            <span className="font-mono text-emerald-400">{scheduled.date} at {scheduled.time}</span>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed">
            Assigned owner: <strong className="text-white">{scheduled.owner}</strong>. Sales note: <span className="italic font-normal">"{scheduled.note || 'No custom note.'}"</span>
          </p>
        </div>
      ) : status === 'DELAYED' ? (
        <div className="mb-5 bg-amber-950/20 border border-amber-500/30 rounded-xl p-4 flex items-center justify-between gap-3 text-xs text-amber-200 animate-fade-in">
          <div>
            <span className="font-bold block text-white">Action postponed until {recommendationState?.delayedUntil}</span>
            <span className="text-slate-400">This recommendation has been moved out of immediate sales priority.</span>
          </div>
          {onResetRecommendation && (
            <button
              onClick={onResetRecommendation}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-medium shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Re-activate</span>
            </button>
          )}
        </div>
      ) : status === 'DISMISSED' ? (
        <div className="mb-5 bg-rose-950/20 border border-rose-500/30 rounded-xl p-4 flex items-center justify-between gap-3 text-xs text-rose-200 animate-fade-in">
          <div>
            <span className="font-bold block text-white">Recommendation Dismissed</span>
            <span className="text-slate-400">Feedback recorded for account executive lead queue.</span>
          </div>
          {onResetRecommendation && (
            <button
              onClick={onResetRecommendation}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 font-medium shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Undo Dismissal</span>
            </button>
          )}
        </div>
      ) : (
        <>
          {/* "Why Now" Section */}
          <div className="mb-5 bg-[#0D121C] border border-[#1F293D] rounded-lg p-3.5 sm:p-4">
            <div className="text-[11px] font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5 mb-1.5">
              <Zap className="w-3 h-3 text-blue-400" />
              <span>Commercial Catalyst (Why Now)</span>
            </div>
            <p className="text-sm font-medium text-slate-200 leading-relaxed">
              {nba.whyNow}
            </p>
          </div>

          {/* Supporting Evidence Checklist */}
          <div className="mb-6">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2.5">
              Supporting Signals & Evidence
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
              {nba.evidence.map((item, idx) => (
                <div 
                  key={idx} 
                  className="flex items-start gap-2 bg-[#121620] border border-[#232B3B] p-2.5 rounded-lg text-xs text-slate-300"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="leading-snug">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Action Buttons Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#1F293D]">
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onOpenScheduleDemo}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary hover:bg-primary-hover active:bg-blue-700 text-white text-xs sm:text-sm font-semibold shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <CalendarPlus className="w-4 h-4" />
            <span>{status === 'SCHEDULED' ? 'Modify Schedule' : 'Schedule Demo Now'}</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1 opacity-80" />
          </button>

          <button
            onClick={onOpenFollowUp}
            className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-lg bg-[#1A2233] hover:bg-[#222C42] border border-[#2F3E5E] text-slate-200 hover:text-white text-xs sm:text-sm font-medium transition-all"
          >
            <Mail className="w-4 h-4 text-cyan-400" />
            <span>Draft Email</span>
          </button>
        </div>

        {status === 'RECOMMENDED' && (
          <div className="flex items-center gap-2">
            {onOpenDelay && (
              <button
                type="button"
                onClick={onOpenDelay}
                className="px-3 py-2 text-xs font-medium text-slate-400 hover:text-amber-300 hover:bg-amber-500/10 rounded-lg transition-colors"
                title="Postpone follow-up date"
              >
                <span>Delay</span>
              </button>
            )}

            {onOpenDismiss && (
              <button
                type="button"
                onClick={onOpenDismiss}
                className="px-3 py-2 text-xs font-medium text-slate-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors"
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
