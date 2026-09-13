import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  MapPin,
  ExternalLink,
  PhoneCall,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Clock,
  Briefcase,
  Users,
  UserCheck,
  Phone,
  Plus
} from 'lucide-react';
import { DiscoveredLead } from '../../types/leads';
import { IntentScore } from '../sales/IntentScore';
import { SignalSourceBadge } from '../sales/SignalSourceBadge';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface LeadResultRowProps {
  lead: DiscoveredLead;
  onInitiateCall?: (lead: DiscoveredLead) => void;
  onAddToPipeline?: (lead: DiscoveredLead) => void;
}

export const LeadResultRow: React.FC<LeadResultRowProps> = ({
  lead,
  onInitiateCall,
  onAddToPipeline
}) => {
  const [expanded, setExpanded] = useState(false);

  const primarySignal = lead.buyingSignals[0];

  return (
    <div
      className={`border transition-all duration-150 rounded-xl overflow-hidden ${
        expanded
          ? 'border-border-focus bg-surface-raised shadow-md'
          : 'border-border bg-surface hover:bg-surface-hover hover:border-border-focus'
      }`}
    >
      {/* Dense Row Header Bar */}
      <div
        onClick={() => setExpanded(!expanded)}
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
        aria-controls={`lead-details-${lead.id}`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setExpanded(!expanded);
          }
        }}
        className="p-3.5 sm:p-4 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-3 select-none focus:outline-none focus:ring-1 focus:ring-primary min-w-0"
      >
        {/* Column 1: Intent Score + Company Meta + Decision Maker */}
        <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
          <div className="shrink-0 pt-0.5 sm:pt-0">
            <IntentScore
              score={lead.intentScore}
              level={lead.intentLevel}
              expandable={false}
              className="py-1 px-2.5 text-xs"
            />
          </div>

          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-foreground text-sm tracking-tight truncate max-w-[280px] sm:max-w-none">
                {lead.companyName}
              </span>
              <Badge variant="neutral" className="text-[11px] py-0.5 px-2 font-medium shrink-0">
                {lead.industry}
              </Badge>
              <span className="inline-flex items-center gap-1 text-[11px] text-foreground-tertiary font-mono shrink-0">
                <MapPin className="w-3 h-3 text-foreground-tertiary" />
                {lead.location}
              </span>

              {/* WHO: Key Decision Maker shown upfront */}
              {lead.decisionMakerContact && (
                <span className="inline-flex items-center gap-1 text-[11px] text-foreground-secondary font-medium bg-surface-subtle px-2 py-0.5 rounded border border-border-subtle shrink-0">
                  <UserCheck className="w-3 h-3 text-primary" />
                  <span className="text-foreground font-semibold">{lead.decisionMakerContact.name}</span>
                  <span className="text-foreground-tertiary">({lead.decisionMakerContact.role})</span>
                </span>
              )}
            </div>

            {/* Requirement / Pain Headline */}
            <p className="text-xs text-foreground-secondary font-medium line-clamp-1 flex items-center gap-1.5 min-w-0">
              <span className="text-primary font-semibold shrink-0">Need:</span>
              <span className="truncate">{lead.requirement}</span>
            </p>
          </div>
        </div>

        {/* Column 2: WHAT Signal + WHY Now + Provenance + Actions */}
        <div className="flex flex-wrap items-center justify-between md:justify-end gap-2.5 shrink-0 pt-2 md:pt-0 border-t border-border-subtle md:border-t-0 min-w-0">
          <div className="flex flex-wrap items-center gap-2 min-w-0">
            {/* Signal Trigger Badge */}
            {primarySignal && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-foreground-secondary bg-surface-subtle px-2 py-0.5 rounded border border-border-subtle shrink-0">
                <TrendingUp className="w-3 h-3 text-signal-qualified shrink-0" />
                <span className="truncate max-w-[160px]">{primarySignal.type}</span>
              </span>
            )}

            <SignalSourceBadge source={lead.source} />

            {lead.estimatedValue && (
              <span className="text-xs font-semibold text-signal-qualified font-mono hidden xl:inline-block shrink-0">
                {lead.estimatedValue}
              </span>
            )}
          </div>

          {/* Quick Action Buttons & Expand Toggle */}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="secondary"
              size="sm"
              className="text-xs h-8 px-3 font-medium border border-border hover:bg-surface-hover shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                onAddToPipeline?.(lead);
              }}
              title="Add to sales pipeline"
            >
              <Plus className="w-3 h-3 mr-1" />
              Queue
            </Button>

            <Button
              variant="primary"
              size="sm"
              className="text-xs h-8 px-3 font-medium bg-primary text-primary-foreground hover:bg-primary-hover shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                onInitiateCall?.(lead);
              }}
              title="Trigger AI Outbound Call"
              leftIcon={<PhoneCall className="w-3.5 h-3.5 text-primary-foreground" />}
            >
              AI Call
            </Button>

            <button
              type="button"
              aria-label={expanded ? 'Collapse opportunity details' : 'Expand opportunity details'}
              className="p-1.5 rounded text-foreground-tertiary hover:text-foreground hover:bg-surface-subtle transition-colors ml-0.5"
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Provenance & Action Accordion */}
      {expanded && (
        <div
          id={`lead-details-${lead.id}`}
          className="px-4 pb-4 pt-1 border-t border-border-subtle bg-surface-sunken space-y-3.5 text-xs animate-fadeIn"
        >
          {/* Detailed Pain & Why Now Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {lead.detailedPain && (
              <div className="p-3 rounded-lg bg-surface border border-border text-foreground-secondary leading-relaxed">
                <div className="flex items-center gap-1.5 text-primary font-semibold mb-1">
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>Commercial Pain Analysis</span>
                </div>
                <p className="text-foreground-secondary text-xs leading-relaxed">{lead.detailedPain}</p>
              </div>
            )}

            <div className="p-3 rounded-lg bg-surface border border-border text-foreground-secondary leading-relaxed">
              <div className="flex items-center gap-1.5 text-signal-high font-semibold mb-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Why Now? Commercial Urgency</span>
              </div>
              <p className="text-foreground-secondary text-xs leading-relaxed">{lead.whyNow}</p>
            </div>
          </div>

          {/* Buying Signals Breakdown */}
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-foreground-tertiary mb-2 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-signal-qualified" />
              <span>Verified Buying Signals ({lead.buyingSignals.length})</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
              {lead.buyingSignals.map((signal) => (
                <div
                  key={signal.id}
                  className="p-2.5 rounded-lg bg-surface border border-border-subtle space-y-1"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-semibold text-foreground text-[11px]">{signal.type}</span>
                    <span className="text-[10px] text-foreground-tertiary font-mono">{signal.timestamp}</span>
                  </div>
                  <p className="text-foreground-secondary text-[11px] leading-relaxed">
                    {signal.description}
                  </p>
                  <div className="text-[10px] text-primary font-mono pt-0.5">
                    Impact Confidence: +{signal.impactScore}%
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Original Source Excerpt */}
          <div className="p-3 rounded-lg bg-surface-subtle border border-border text-foreground-secondary flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="space-y-0.5 flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <SignalSourceBadge source={lead.source} />
                <span className="text-[11px] text-foreground-tertiary font-mono">
                  Captured at {lead.source.discoveredAt}
                </span>
              </div>
              <p className="text-[11px] text-foreground-secondary italic truncate max-w-xl">
                "{lead.source.originalRequirement}"
              </p>
            </div>
            {lead.source.sourceUrl && (
              <a
                href={lead.source.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary-hover font-medium shrink-0 transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
                <span>Source Artifact</span>
              </a>
            )}
          </div>

          {/* AI Recommended Pitch Hook */}
          {lead.suggestedOpeningHook && (
            <div className="p-3 rounded-lg bg-surface border border-border text-foreground flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-primary text-xs block mb-0.5">Suggested Opening Angle</span>
                <p className="text-foreground-secondary text-xs leading-relaxed">{lead.suggestedOpeningHook}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
