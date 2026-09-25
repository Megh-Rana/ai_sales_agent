import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Flame,
  Clock,
  ArrowRight,
  PhoneCall,
  Mail,
  CalendarCheck,
  Building2,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Zap,
} from 'lucide-react';
import { SalesOpportunity, OpportunityCategoryType } from '../../types/opportunities';
import { Badge } from '../ui/Badge';

interface OpportunityCardProps {
  opportunity: SalesOpportunity;
  onSelect: (opp: SalesOpportunity) => void;
  onExecuteAction: (opp: SalesOpportunity, actionType: string) => void;
}

const getCategoryBadge = (type: OpportunityCategoryType) => {
  switch (type) {
    case 'BUYING_SIGNAL':
      return { label: 'Buying Signal', color: 'bg-emerald-500/10 text-emerald-950 dark:text-emerald-300 border-emerald-500/30' };
    case 'HOT_OPPORTUNITY':
      return { label: 'Hot Opportunity', color: 'bg-amber-500/10 text-amber-950 dark:text-amber-300 border-amber-500/30' };
    case 'POSITIVE_RESPONSE':
      return { label: 'Positive Response', color: 'bg-emerald-500/10 text-emerald-950 dark:text-emerald-300 border-emerald-500/30' };
    case 'FOLLOW_UP_DUE':
      return { label: 'Follow-Up Due', color: 'bg-amber-500/10 text-amber-950 dark:text-amber-300 border-amber-500/30' };
    case 'ENGAGEMENT_SPIKE':
      return { label: 'Engagement Spike', color: 'bg-blue-500/10 text-blue-950 dark:text-blue-300 border-blue-500/30' };
    case 'MEETING_OPPORTUNITY':
      return { label: 'Meeting Opportunity', color: 'bg-indigo-500/10 text-indigo-950 dark:text-indigo-300 border-indigo-500/30' };
    case 'HIGH_INTENT':
      return { label: 'High Intent', color: 'bg-amber-500/10 text-amber-950 dark:text-amber-300 border-amber-500/30' };
    case 'RE_ENGAGEMENT':
      return { label: 'Re-engagement', color: 'bg-purple-500/10 text-purple-950 dark:text-purple-300 border-purple-500/30' };
    default:
      return { label: 'Opportunity', color: 'bg-surface-1 text-foreground-secondary border-border-subtle' };
  }
};

export const OpportunityCard: React.FC<OpportunityCardProps> = ({
  opportunity,
  onSelect,
  onExecuteAction,
}) => {
  const navigate = useNavigate();
  const categoryBadge = getCategoryBadge(opportunity.type);
  const isHighPriority = opportunity.priority === 'HIGH';

  return (
    <div
      className={`group relative rounded-xl border transition-all duration-200 bg-surface-0 hover:bg-surface-1/40 ${
        isHighPriority
          ? 'border-amber-500/30 hover:border-amber-500/60 shadow-xs'
          : 'border-border-default hover:border-border-subtle'
      }`}
    >
      {/* High Priority Subtle Accent Bar */}
      {isHighPriority && (
        <div className="absolute top-0 left-4 right-4 h-0.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 rounded-t-full opacity-80" />
      )}

      <div className="p-5 space-y-4">
        {/* CARD TOP HEADER: WHO & PRIORITY */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded border ${categoryBadge.color}`}>
                {categoryBadge.label}
              </span>

              {isHighPriority && (
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-950 dark:text-amber-200 border border-amber-500/40 flex items-center gap-1">
                  <Flame className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                  HIGH PRIORITY
                </span>
              )}

              <span className="text-caption text-foreground-tertiary flex items-center gap-1 ml-auto">
                <Clock className="w-3 h-3 text-foreground-tertiary" />
                {opportunity.whyNow.recencyLabel}
              </span>
            </div>

            {/* Lead Company & Contact */}
            <h3
              role="button"
              tabIndex={0}
              onClick={() => onSelect(opportunity)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelect(opportunity);
                }
              }}
              aria-label={`View details for ${opportunity.companyName}`}
              className="text-h4 font-bold text-foreground hover:text-primary transition-colors cursor-pointer tracking-tight flex items-center gap-2 focus:outline-none focus:underline"
            >
              <span>{opportunity.companyName}</span>
              <span className="text-xs font-normal text-foreground-tertiary">({opportunity.location})</span>
            </h3>

            <div className="text-small text-foreground-secondary flex items-center gap-2 mt-0.5">
              <span className="font-medium text-foreground">{opportunity.contactName}</span>
              <span className="text-border-subtle">•</span>
              <span className="text-foreground-tertiary">{opportunity.contactRole}</span>
              <span className="text-border-subtle">•</span>
              <span className="font-mono text-xs text-amber-400 font-medium">{opportunity.estimatedValue}</span>
            </div>
          </div>

          {/* Intent Gauge Badge */}
          <div className="text-right shrink-0">
            <div className="text-xs font-mono text-foreground-tertiary uppercase">Intent Score</div>
            <div className="text-h3 font-mono font-bold text-amber-400 leading-none mt-0.5">
              {opportunity.intentScore}
              <span className="text-xs text-foreground-tertiary font-normal">/100</span>
            </div>
          </div>
        </div>

        {/* WHY NOW BLOCK */}
        <div className="p-3.5 rounded-lg bg-surface-1/80 border border-border-subtle space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-amber-400">
            <Zap className="w-3.5 h-3.5" />
            <span>WHY NOW</span>
          </div>

          <p className="text-small font-medium text-foreground leading-snug">
            {opportunity.whyNow.headline}
          </p>

          {/* Supporting Evidence Signals */}
          <div className="space-y-1 pt-1 border-t border-border-subtle/50">
            {(opportunity.whyNow.evidence || []).slice(0, 2).map((item, idx) => (
              <div key={idx} className="flex items-start gap-1.5 text-caption text-foreground-secondary">
                <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* RECOMMENDED ACTION & FOOTER CTAS */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-border-subtle">
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-mono text-foreground-tertiary uppercase">Recommended Action</div>
            <div className="text-small font-semibold text-foreground truncate">
              {opportunity.recommendedAction.label}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Secondary: View Lead Details */}
            <button
              type="button"
              onClick={() => navigate(`/leads/${opportunity.leadId}`)}
              className="px-3 py-1.5 text-xs font-medium text-foreground-secondary hover:text-foreground bg-surface-1 border border-border-subtle hover:bg-surface-hover rounded-lg transition-colors flex items-center gap-1"
            >
              <span>View Lead</span>
            </button>

            {/* Primary Action Button */}
            <button
              type="button"
              onClick={() => onExecuteAction(opportunity, opportunity.recommendedAction.actionType)}
              className="px-3.5 py-1.5 text-xs font-semibold text-black bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              {opportunity.recommendedAction.actionType === 'call' && <PhoneCall className="w-3.5 h-3.5" />}
              {opportunity.recommendedAction.actionType === 'email' && <Mail className="w-3.5 h-3.5" />}
              {opportunity.recommendedAction.actionType === 'followup' && <CalendarCheck className="w-3.5 h-3.5" />}
              <span>{opportunity.recommendedAction.label}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
