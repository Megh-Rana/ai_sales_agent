import React from 'react';
import { Flame, Clock } from 'lucide-react';
import { DiscoveredLead } from '../../../types/leads';

export interface WhyNowSectionProps {
  lead: DiscoveredLead;
}

export const WhyNowSection: React.FC<WhyNowSectionProps> = ({ lead }) => {
  return (
    <section
      aria-labelledby="heading-why-now"
      className="bg-signal-high/5 border border-signal-high/35 rounded-xl p-5 space-y-4 shadow-xs relative overflow-hidden"
    >
      {/* Top Subtle Amber Indicator Strip */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-signal-high" />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="p-1 rounded bg-signal-high/15 text-signal-high">
            <Flame className="w-4 h-4" />
          </span>
          <h2 id="heading-why-now" className="text-h4 font-bold text-foreground tracking-tight">
            Why Now? (Timing Catalyst & Window)
          </h2>
        </div>

        <span className="text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded bg-signal-high/10 text-signal-high border border-signal-high/25 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>72-Hour Decision Window</span>
        </span>
      </div>

      {/* Narrative Urgency Rationale */}
      <div className="space-y-2">
        <p className="text-body font-semibold text-foreground leading-relaxed">
          {lead.whyNow}
        </p>

        <p className="text-xs text-foreground-secondary leading-relaxed">
          Reaching this prospect today positions your solution before vendor shortlists are locked and RFPs enter formal evaluation. Reaching out after Friday risks competing against entrenched vendor proposals.
        </p>
      </div>

      {/* Concrete Timing Advantages Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-signal-high/15 text-xs">
        <div className="p-2.5 rounded-lg bg-surface-0/80 border border-border-subtle space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-foreground-tertiary block">
            Procurement State
          </span>
          <span className="font-semibold text-foreground block">
            Active Vendor Evaluation
          </span>
          <span className="text-[11px] text-foreground-tertiary">
            Specs issued yesterday
          </span>
        </div>

        <div className="p-2.5 rounded-lg bg-surface-0/80 border border-border-subtle space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-foreground-tertiary block">
            Competitive Window
          </span>
          <span className="font-semibold text-signal-qualified block">
            First-Mover Advantage
          </span>
          <span className="text-[11px] text-foreground-tertiary">
            Caught within 18h of posting
          </span>
        </div>

        <div className="p-2.5 rounded-lg bg-surface-0/80 border border-border-subtle space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-foreground-tertiary block">
            Cost of Delay
          </span>
          <span className="font-semibold text-signal-urgent block">
            RFP Shortlist Closure
          </span>
          <span className="text-[11px] text-foreground-tertiary">
            Committee convenes this Friday
          </span>
        </div>
      </div>
    </section>
  );
};
