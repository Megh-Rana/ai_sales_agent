import React from 'react';
import { ShieldCheck, ExternalLink, Globe, Clock, CheckCircle } from 'lucide-react';
import { DiscoveredLead } from '../../../types/leads';

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

  return (
    <section
      aria-labelledby="heading-provenance"
      className="bg-surface-0 border border-border-default rounded-xl p-4 sm:p-5 space-y-3.5 shadow-xs"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-border-subtle pb-3">
        <div className="flex items-center gap-2">
          <span className="p-1 rounded bg-primary/10 text-primary">
            <ShieldCheck className="w-4 h-4" />
          </span>
          <h2 id="heading-provenance" className="text-h4 font-bold text-foreground tracking-tight">
            Source & Data Provenance
          </h2>
        </div>

        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-signal-qualified/10 text-signal-qualified border border-signal-qualified/20 flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          <span>VERIFIED ORIGIN</span>
        </span>
      </div>

      {/* Provenance Metadata Rows */}
      <div className="space-y-2 text-xs font-mono">
        <div className="flex items-center justify-between gap-2 py-1 border-b border-border-subtle/60">
          <span className="text-foreground-tertiary">Ingestion Source:</span>
          <span className="font-semibold text-foreground flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-primary" />
            <span>{prov.platform}</span>
          </span>
        </div>

        <div className="flex items-center justify-between gap-2 py-1 border-b border-border-subtle/60">
          <span className="text-foreground-tertiary">Captured Timestamp:</span>
          <span className="font-semibold text-foreground">{prov.discoveredAt}</span>
        </div>

        <div className="flex items-center justify-between gap-2 py-1 border-b border-border-subtle/60">
          <span className="text-foreground-tertiary">Data Freshness SLA:</span>
          <span className="font-semibold text-signal-qualified">{prov.freshness}</span>
        </div>

        <div className="flex items-center justify-between gap-2 py-1">
          <span className="text-foreground-tertiary">Original Requirement:</span>
          <span className="text-foreground-secondary italic truncate max-w-[200px]" title={prov.originalRequirement}>
            "{prov.originalRequirement}"
          </span>
        </div>
      </div>

      {/* Working External Link */}
      {prov.sourceUrl && (
        <div className="pt-1">
          <a
            href={prov.sourceUrl}
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
