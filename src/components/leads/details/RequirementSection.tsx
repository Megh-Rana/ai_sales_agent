import React from 'react';
import { MessageSquareQuote, ExternalLink, Clock, AlertCircle } from 'lucide-react';
import { DiscoveredLead } from '../../../types/leads';
import { SignalSourceBadge } from '../../sales/SignalSourceBadge';

export interface RequirementSectionProps {
  lead: DiscoveredLead;
}

export const RequirementSection: React.FC<RequirementSectionProps> = ({ lead }) => {
  return (
    <section
      aria-labelledby="heading-requirement"
      className="bg-surface-0 border border-border-default rounded-xl p-5 space-y-4 shadow-xs"
    >
      {/* Header Row */}
      <div className="flex items-center justify-between gap-2 border-b border-border-subtle pb-3">
        <div className="flex items-center gap-2">
          <span className="p-1 rounded bg-primary/10 text-primary">
            <MessageSquareQuote className="w-4 h-4" />
          </span>
          <h2 id="heading-requirement" className="text-h4 font-bold text-foreground tracking-tight">
            Original Commercial Requirement
          </h2>
        </div>

        <div className="flex items-center gap-2 text-xs text-foreground-tertiary">
          <Clock className="w-3 h-3" />
          <span>Captured {lead.source.discoveredAt}</span>
        </div>
      </div>

      {/* Main Quotation Display */}
      <div className="relative pl-4 sm:pl-5 border-l-2 border-primary bg-surface-1/50 rounded-r-lg p-3.5 sm:p-4">
        <blockquote className="text-body font-medium text-foreground italic leading-relaxed">
          "{lead.requirement}"
        </blockquote>

        {lead.detailedPain && (
          <div className="mt-3 pt-3 border-t border-border-subtle/60 flex items-start gap-2 text-xs text-foreground-secondary">
            <AlertCircle className="w-3.5 h-3.5 text-signal-urgent shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-semibold text-foreground-secondary block">Underlying Operational Bottleneck:</span>
              <p className="leading-relaxed">{lead.detailedPain}</p>
            </div>
          </div>
        )}
      </div>

      {/* Provenance & Source Artifact Footer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-xs">
        <div className="flex items-center gap-2">
          <SignalSourceBadge source={lead.source} />
          <span className="text-foreground-tertiary text-[11px] font-mono">
            Posted {lead.source.postedAt}
          </span>
        </div>

        {lead.source.sourceUrl && (
          <a
            href={lead.source.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-primary hover:text-primary-hover font-semibold transition-colors focus:outline-none focus:underline"
            title="Inspect original requirement artifact in external tab"
          >
            <span>View Original Source Posting</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>
    </section>
  );
};
