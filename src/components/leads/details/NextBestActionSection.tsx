import React from 'react';
import { ArrowRight, PhoneCall, Plus, Clock, FileText, CalendarPlus, CheckCircle2, Ban, RotateCcw } from 'lucide-react';
import { DiscoveredLead } from '../../../types/leads';
import { RecommendationState } from '../../../types/followUp';
import { Button } from '../../ui/Button';

export interface NextBestActionSectionProps {
  lead: DiscoveredLead;
  recommendationState?: RecommendationState;
  onExecuteAction: () => void;
  onOpenScheduleFollowUp?: () => void;
  onOpenDelay?: () => void;
  onOpenDismiss?: () => void;
  onResetRecommendation?: () => void;
}

export const NextBestActionSection: React.FC<NextBestActionSectionProps> = ({
  lead,
  recommendationState,
  onExecuteAction,
  onOpenScheduleFollowUp,
  onOpenDelay,
  onOpenDismiss,
  onResetRecommendation,
}) => {
  const status = recommendationState?.status || 'RECOMMENDED';
  const scheduled = recommendationState?.scheduledItem;

  const getActionConfig = () => {
    switch (lead.recommendedAction) {
      case 'call':
        return {
          title: 'INITIATE OUTBOUND VOICE CALL',
          reason: `High Intent Score (${lead.intentScore}/100) & timing catalyst: ${lead.whyNow}`,
          ctaLabel: 'Start Voice Call',
          icon: <PhoneCall className="w-4 h-4 text-primary" />,
          actionType: 'call',
        };
      case 'campaign':
        return {
          title: 'ENROLL IN SALES CADENCE',
          reason: `Opportunity is highly relevant (${lead.employeeCount} employees). Automated cadence recommended.`,
          ctaLabel: 'Enroll in Cadence',
          icon: <Plus className="w-4 h-4 text-primary" />,
          actionType: 'campaign',
        };
      case 'followup':
        return {
          title: 'SCHEDULE PRODUCT DEMO FOLLOW-UP',
          reason: `Qualified opportunity verified during call. Schedule demo within 48 hours.`,
          ctaLabel: 'Schedule Demo Follow-up',
          icon: <Clock className="w-4 h-4 text-primary" />,
          actionType: 'followup',
        };
      default:
        return {
          title: 'REVIEW ACCOUNT BRIEF',
          reason: 'Account reconnaissance complete. Inspect brief before engaging executive contact.',
          ctaLabel: 'Review Dossier',
          icon: <FileText className="w-4 h-4 text-primary" />,
          actionType: 'brief',
        };
    }
  };

  const config = getActionConfig();

  return (
    <section
      aria-labelledby="heading-next-action"
      className="bg-surface-0 border border-primary/40 rounded-xl p-4 sm:p-5 shadow-xs relative overflow-hidden space-y-3"
    >
      {/* Visual left accent bar */}
      <div className={`absolute top-0 left-0 bottom-0 w-1 ${
        status === 'SCHEDULED' ? 'bg-signal-qualified' : status === 'DELAYED' ? 'bg-amber-400' : status === 'DISMISSED' ? 'bg-[#334155]' : 'bg-primary'
      }`} />

      <div className="space-y-1 pl-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-primary/10 shrink-0">
              {config.icon}
            </span>
            <span className="text-[11px] font-mono uppercase font-bold tracking-wider text-primary">
              Next Best Action
            </span>
          </div>

          {status === 'SCHEDULED' && (
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-signal-qualified/15 text-signal-qualified border border-signal-qualified/30 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Scheduled
            </span>
          )}

          {status === 'DELAYED' && (
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1">
              <Clock className="w-3 h-3" /> Postponed ({recommendationState?.delayedUntil})
            </span>
          )}

          {status === 'DISMISSED' && (
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-[#1E293B] text-foreground-tertiary border border-[#334155] flex items-center gap-1">
              <Ban className="w-3 h-3" /> Dismissed
            </span>
          )}
        </div>

        <h2 id="heading-next-action" className="text-h3 font-bold text-foreground tracking-tight pt-1">
          {config.title}
        </h2>

        {status === 'SCHEDULED' && scheduled ? (
          <div className="p-3 rounded-lg bg-signal-qualified/10 border border-signal-qualified/25 text-xs text-foreground space-y-1">
            <p className="font-bold text-signal-qualified flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Follow-Up Scheduled for {scheduled.date} at {scheduled.time}
            </p>
            <p className="text-foreground-secondary">
              Owner: <strong className="text-foreground">{scheduled.owner}</strong> · Note: <span className="italic">"{scheduled.note || 'No custom note.'}"</span>
            </p>
          </div>
        ) : status === 'DELAYED' ? (
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/25 text-xs text-amber-300 flex items-center justify-between gap-2">
            <span>Action delayed until {recommendationState?.delayedUntil}.</span>
            {onResetRecommendation && (
              <button
                onClick={onResetRecommendation}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 hover:text-amber-300 underline"
              >
                <RotateCcw className="w-3 h-3" /> Re-activate
              </button>
            )}
          </div>
        ) : status === 'DISMISSED' ? (
          <div className="p-3 rounded-lg bg-surface-elevated border border-border-subtle text-xs text-foreground-tertiary flex items-center justify-between gap-2">
            <span>Recommendation dismissed for this lead profile.</span>
            {onResetRecommendation && (
              <button
                onClick={onResetRecommendation}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:text-primary-hover underline"
              >
                <RotateCcw className="w-3 h-3" /> Undo
              </button>
            )}
          </div>
        ) : (
          <p className="text-xs text-foreground-secondary leading-relaxed">
            <strong className="text-foreground-tertiary font-medium">Action Reasoning: </strong>
            {config.reason}
          </p>
        )}
      </div>

      <div className="pt-2 pl-2 space-y-2">
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <Button
            variant="primary"
            size="md"
            rightIcon={<ArrowRight className="w-4 h-4" />}
            onClick={onExecuteAction}
            className="w-full sm:flex-1 text-xs font-semibold justify-center shadow-xs"
          >
            {config.ctaLabel}
          </Button>

          {onOpenScheduleFollowUp && (
            <Button
              variant="secondary"
              size="md"
              leftIcon={<CalendarPlus className="w-4 h-4 text-primary" />}
              onClick={onOpenScheduleFollowUp}
              className="w-full sm:w-auto text-xs font-medium justify-center"
            >
              Schedule Follow-Up
            </Button>
          )}
        </div>

        {status === 'RECOMMENDED' && (onOpenDelay || onOpenDismiss) && (
          <div className="flex items-center justify-end gap-3 text-xs pt-1">
            {onOpenDelay && (
              <button
                type="button"
                onClick={onOpenDelay}
                className="text-foreground-tertiary hover:text-amber-400 transition-colors text-[11px] font-medium"
              >
                Delay Action
              </button>
            )}
            {onOpenDismiss && (
              <button
                type="button"
                onClick={onOpenDismiss}
                className="text-foreground-tertiary hover:text-signal-urgent transition-colors text-[11px] font-medium"
              >
                Dismiss Recommendation
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
