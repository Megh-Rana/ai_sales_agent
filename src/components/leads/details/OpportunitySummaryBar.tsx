import React from 'react';
import { Target, Zap, Clock, ArrowRight } from 'lucide-react';
import { DiscoveredLead } from '../../../types/leads';

export interface OpportunitySummaryBarProps {
  lead: DiscoveredLead;
  onInitiateCall?: () => void;
}

export const OpportunitySummaryBar: React.FC<OpportunitySummaryBarProps> = ({
  lead,
  onInitiateCall,
}) => {
  // Distill requirement into a concise operational phrase rather than repeating full paragraph
  const getCoreNeedSnippet = () => {
    if (lead.id === 'lead-101') return '1,200 Daily Freight Dispatches & Fleet Voice Automation';
    if (lead.id === 'lead-102') return 'Sub-60s Inbound Voice Qualification & CRM Sync';
    if (lead.id === 'lead-103') return 'Multilingual European Automotive Outbound Outreach';
    if (lead.id === 'lead-104') return 'HIPAA-Compliant Patient Intake & Appointment Reminders';
    // Fallback: extract first clause of requirement
    return lead.requirement.split('.')[0].slice(0, 75);
  };

  const getUrgencySnippet = () => {
    if (lead.id === 'lead-101') return 'RFP Committee Convenes Friday · 72h Evaluation Window';
    if (lead.id === 'lead-102') return 'G2 Evaluation Active · Series-A GTM Budget Deployed';
    if (lead.id === 'lead-103') return 'Cobot Series 6 Launch Yesterday · Active Rep Scaling';
    if (lead.id === 'lead-104') return 'Trust Board Approved Q3 Telephony Modernization';
    return lead.whyNow.split(';')[0];
  };

  return (
    <section
      aria-label="Opportunity Execution Summary"
      className="bg-surface-0 border border-border-default rounded-xl p-3.5 sm:p-4 text-xs shadow-xs"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 divide-y sm:divide-y-0 sm:divide-x divide-border-subtle">
        {/* Metric 1: Distilled Core Demand */}
        <div className="space-y-1 sm:pr-3">
          <div className="flex items-center gap-1.5 text-foreground-tertiary font-mono uppercase tracking-wider text-[10px] font-semibold">
            <Target className="w-3.5 h-3.5 text-primary shrink-0" />
            <span>Target Operational Need</span>
          </div>
          <p className="text-foreground font-semibold line-clamp-2 leading-relaxed">
            {getCoreNeedSnippet()}
          </p>
        </div>

        {/* Metric 2: Intent Score & Deal Valuation */}
        <div className="space-y-1 pt-2.5 sm:pt-0 sm:px-3">
          <div className="flex items-center gap-1.5 text-foreground-tertiary font-mono uppercase tracking-wider text-[10px] font-semibold">
            <Zap className="w-3.5 h-3.5 text-signal-high shrink-0" />
            <span>Intent & Pipeline Value</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-foreground text-sm">
              {lead.intentScore}/100
            </span>
            <span className="text-foreground-tertiary">·</span>
            <span className="font-semibold text-signal-qualified font-mono">
              {lead.estimatedValue || '₹40 Lakh / yr'}
            </span>
          </div>
          <p className="text-foreground-tertiary text-[11px]">
            {lead.intentLevel.toUpperCase()} INTENT · {lead.buyingSignals.length} Corroborating Signals
          </p>
        </div>

        {/* Metric 3: Timing Catalyst (Why Now) */}
        <div className="space-y-1 pt-2.5 sm:pt-0 sm:px-3">
          <div className="flex items-center gap-1.5 text-foreground-tertiary font-mono uppercase tracking-wider text-[10px] font-semibold">
            <Clock className="w-3.5 h-3.5 text-signal-high shrink-0" />
            <span>Timing Catalyst (Why Today)</span>
          </div>
          <p className="text-foreground-secondary font-medium line-clamp-2 leading-relaxed">
            {getUrgencySnippet()}
          </p>
        </div>

        {/* Metric 4: Immediate Action Directive */}
        <div className="space-y-1 pt-2.5 sm:pt-0 sm:pl-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-foreground-tertiary font-mono uppercase tracking-wider text-[10px] font-semibold">
              <ArrowRight className="w-3.5 h-3.5 text-primary shrink-0" />
              <span>Immediate Directive</span>
            </div>
            <div className="text-primary font-bold font-mono text-xs pt-0.5">
              {lead.recommendedAction === 'call'
                ? 'Outbound AI Call'
                : lead.recommendedAction === 'campaign'
                ? 'Enroll in Cadence'
                : 'Account Reconnaissance'}
            </div>
          </div>

          <div className="text-foreground-tertiary text-[11px] pt-1">
            {lead.decisionMakerContact?.name ? (
              <span className="truncate block">
                Target: <strong className="text-foreground font-semibold">{lead.decisionMakerContact.name}</strong> ({lead.decisionMakerContact.role.split('&')[0]})
              </span>
            ) : (
              <span>Target: Operations Leadership</span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
