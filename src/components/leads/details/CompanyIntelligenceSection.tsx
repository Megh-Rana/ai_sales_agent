import React from 'react';
import { Building, Cpu, Sparkles, CheckCircle2 } from 'lucide-react';
import { DiscoveredLead } from '../../../types/leads';

export interface CompanyIntelligenceSectionProps {
  lead: DiscoveredLead;
}

export const CompanyIntelligenceSection: React.FC<CompanyIntelligenceSectionProps> = ({ lead }) => {
  const intel = lead.companyIntelligence;

  return (
    <section
      aria-labelledby="heading-company-intel"
      className="bg-surface-0 border border-border-default rounded-xl p-4 sm:p-5 space-y-4 shadow-xs"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-border-subtle pb-3">
        <div className="flex items-center gap-2">
          <span className="p-1 rounded bg-info/10 text-info">
            <Building className="w-4 h-4" />
          </span>
          <h2 id="heading-company-intel" className="text-h4 font-bold text-foreground tracking-tight">
            Company Intelligence & Telemetry
          </h2>
        </div>

        <span className="text-[10px] font-mono text-signal-qualified font-semibold px-2 py-0.5 rounded bg-signal-qualified/10 border border-signal-qualified/20">
          ENRICHED PROFILE
        </span>
      </div>

      {/* Operational Overview */}
      {intel?.overview && (
        <div className="space-y-1">
          <span className="text-[10px] uppercase tracking-wider font-mono font-semibold text-foreground-tertiary">
            Operational Scope & Scale
          </span>
          <p className="text-xs text-foreground-secondary leading-relaxed bg-surface-1/40 p-2.5 rounded-lg border border-border-subtle">
            {intel.overview}
          </p>
        </div>
      )}

      {/* Confirmed Tech Stack & Legacy Displacement */}
      {intel?.techStack && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[10px] uppercase tracking-wider font-mono font-semibold text-foreground-tertiary flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5 text-primary" />
              <span>Confirmed Infrastructure</span>
            </span>
            <span className="text-[10px] font-mono text-signal-qualified font-semibold px-1.5 py-0.2 rounded bg-signal-qualified/10 border border-signal-qualified/20">
              CONFIRMED DATA
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {intel.techStack.confirmed.map((tech, idx) => (
              <span
                key={idx}
                className="text-[11px] px-2 py-0.5 rounded bg-surface-1 border border-border-subtle text-foreground font-medium flex items-center gap-1"
              >
                <CheckCircle2 className="w-3 h-3 text-signal-qualified" />
                <span>{tech}</span>
              </span>
            ))}
            {intel.techStack.displacing && intel.techStack.displacing.map((tech, idx) => (
              <span
                key={`disp-${idx}`}
                className="text-[11px] px-2 py-0.5 rounded bg-signal-urgent/5 border border-signal-urgent/25 text-signal-urgent line-through font-mono"
                title="Target for vendor displacement"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* AI Epistemic Inferences (Strictly Demarcated) */}
      {intel?.aiInferences && intel.aiInferences.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-border-subtle">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[10px] uppercase tracking-wider font-mono font-semibold text-signal-high flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-signal-high" />
              <span>Deductions & Opportunity Analysis</span>
            </span>
            <span className="text-[10px] font-mono text-signal-high font-semibold px-1.5 py-0.2 rounded bg-signal-high/10 border border-signal-high/20">
              AI INFERENCE
            </span>
          </div>

          <div className="space-y-2">
            {intel.aiInferences.map((inf, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-lg bg-surface-1/60 border border-border-subtle space-y-1 text-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-foreground font-medium leading-relaxed">
                    "{inf.deduction}"
                  </p>
                  <span className="text-[10px] font-mono font-semibold text-primary shrink-0">
                    {inf.confidence}% Conf.
                  </span>
                </div>
                <div className="text-[11px] text-foreground-tertiary">
                  <strong className="text-foreground-tertiary">Basis:</strong> {inf.basis}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
