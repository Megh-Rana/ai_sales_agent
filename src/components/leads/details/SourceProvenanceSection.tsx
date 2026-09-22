import React from 'react';
import { ShieldCheck, ExternalLink, Globe, Clock, CheckCircle } from 'lucide-react';
import { DiscoveredLead } from '../../../types/leads';
import { getResolvableSourceUrl } from '../../../utils/sourceUrl';

export interface SourceProvenanceSectionProps {
  lead: DiscoveredLead;
}

export const SourceProvenanceSection: React.FC<SourceProvenanceSectionProps> = ({ lead }) => {
  const prov = lead.provenance || {
    platform: lead.source.platform,
    originalRequirement: lead.source.originalRequirement,
    sourceUrl: lead.source.sourceUrl,
    discoveredAt: lead.source.discoveredAt,
    postedAt: lead.source.postedAt,
    lastUpdated: 'Today · Active',
    freshness: 'Fresh (Captured <24h)',
  };

  const resolvableUrl = getResolvableSourceUrl(
    prov.sourceUrl,
    prov.platform,
    lead.companyName,
    lead.companyDomain,
    lead.requirement || prov.originalRequirement
  );

  return (
    <section
      aria-labelledby="heading-provenance"
      className="bg-surface-0 border border-border-default rounded-xl p-4 sm:p-5 space-y-3.5 shadow-xs"
    >
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-border-subtle pb-3">
        <div className="w-8 h-8 rounded-lg bg-signal-qualified-muted text-signal-qualified flex items-center justify-center border border-signal-qualified/30">
          <ShieldCheck className="w-4 h-4" />
        </div>
        <div>
          <h2 id="heading-provenance" className="text-body font-bold text-foreground">
            Ingestion Provenance
          </h2>
          <p className="text-[11px] text-foreground-tertiary">
            Source telemetry & verification metadata
          </p>
        </div>
      </div>

      {/* Metadata Table */}
      <div className="space-y-2 text-xs divide-y divide-border-subtle/50">
        <div className="flex items-center justify-between gap-2 py-1">
          <span className="text-foreground-tertiary">Source Platform:</span>
          <span className="font-semibold text-foreground">{prov.platform}</span>
        </div>

        <div className="flex items-center justify-between gap-2 py-1">
          <span className="text-foreground-tertiary">First Discovered:</span>
          <span className="font-mono text-foreground-secondary">{prov.discoveredAt}</span>
        </div>

        <div className="flex items-center justify-between gap-2 py-1">
          <span className="text-foreground-tertiary">Posted On Platform:</span>
          <span className="font-mono text-foreground-secondary">{prov.postedAt}</span>
        </div>

        <div className="flex items-center justify-between gap-2 py-1">
          <span className="text-foreground-tertiary">Requirement Freshness:</span>
          <span className="inline-flex items-center gap-1 font-semibold text-signal-qualified">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>{prov.freshness}</span>
          </span>
        </div>

        <div className="flex items-center justify-between gap-2 py-1">
          <span className="text-foreground-tertiary">Original Requirement:</span>
          <span className="text-foreground-secondary italic truncate max-w-[200px]" title={prov.originalRequirement}>
            "{prov.originalRequirement}"
          </span>
        </div>
      </div>

      {/* Working External Link */}
      {resolvableUrl && (
        <div className="pt-1">
          <a
            href={resolvableUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 w-full p-2 rounded-lg bg-surface-1 hover:bg-surface-elevated border border-border-subtle hover:border-primary/40 text-xs font-semibold text-primary transition-colors focus:outline-none focus:ring-1 focus:ring-primary"
            title="Inspect original requirement artifact in external tab"
          >
            <span>Inspect Verified Source Record</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      )}
    </section>
  );
};
