import React from 'react';
import { MessageSquareQuote, ExternalLink, Clock, AlertCircle } from 'lucide-react';
import { DiscoveredLead } from '../../../types/leads';
import { SignalSourceBadge } from '../../sales/SignalSourceBadge';
import { getResolvableSourceUrl } from '../../../utils/sourceUrl';

export interface RequirementSectionProps {
  lead: DiscoveredLead;
}

export const RequirementSection: React.FC<RequirementSectionProps> = ({ lead }) => {
  return (
    <section
      aria-labelledby="heading-requirement"
      className="bg-surface-0 border border-border-default rounded-xl p-5 space-y-4 shadow-xs"
    >
      <div className="flex items-center justify-between border-b border-border-subtle pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary-muted text-primary flex items-center justify-center border border-primary/30">
            <MessageSquareQuote className="w-4 h-4" />
          </div>
          <div>
            <h2 id="heading-requirement" className="text-body font-bold text-foreground">
              Detected Commercial Requirement
            </h2>
            <p className="text-[11px] text-foreground-tertiary">
              Parsed from unstructured public intent signals
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-foreground-secondary font-medium">
          <Clock className="w-3.5 h-3.5 text-foreground-tertiary" />
          <span>Discovered {lead.source.discoveredAt}</span>
        </div>
      </div>

      {/* Requirement Verbatim Quote */}
      <div className="p-4 rounded-xl bg-surface-1 border border-border-subtle space-y-2">
        <p className="text-body text-foreground font-medium italic leading-relaxed">
          "{lead.requirement}"
        </p>

        {lead.detailedPain && (
          <div className="flex items-start gap-2 pt-2 border-t border-border-subtle/50 text-xs text-foreground-secondary">
            <AlertCircle className="w-4 h-4 text-signal-high shrink-0 mt-0.5" />
            <span>
              <strong className="text-foreground font-semibold">Underlying Commercial Pain: </strong>
              {lead.detailedPain}
            </span>
          </div>
        )}
      </div>

      {/* Provenance & Source Artifact Footer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-xs">
        <div className="flex items-center gap-2">
          <SignalSourceBadge
            source={lead.source}
            companyName={lead.companyName}
            companyDomain={lead.companyDomain}
            requirement={lead.requirement}
          />
          <span className="text-foreground-tertiary text-[11px] font-mono">
            Posted {lead.source.postedAt}
          </span>
        </div>

        {lead.source.sourceUrl && (
          <a
            href={getResolvableSourceUrl(
              lead.source.sourceUrl,
              lead.source.platform,
              lead.companyName,
              lead.companyDomain,
              lead.requirement
            )}
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
