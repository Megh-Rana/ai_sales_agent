import React, { useState } from 'react';
import { TrendingUp, Clock, ChevronDown, ChevronUp, ShieldCheck } from 'lucide-react';
import { DiscoveredLead } from '../../../types/leads';

export interface BuyingSignalsSectionProps {
  lead: DiscoveredLead;
}

export const BuyingSignalsSection: React.FC<BuyingSignalsSectionProps> = ({ lead }) => {
  const [showAll, setShowAll] = useState(false);

  // Sort signals by impact score descending
  const sortedSignals = [...lead.buyingSignals].sort((a, b) => b.impactScore - a.impactScore);
  const displayedSignals = showAll ? sortedSignals : sortedSignals.slice(0, 3);
  const hasMore = sortedSignals.length > 3;

  return (
    <section
      aria-labelledby="heading-buying-signals"
      className="bg-surface-0 border border-border-default rounded-xl p-5 space-y-4 shadow-xs"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-border-subtle pb-3">
        <div className="flex items-center gap-2">
          <span className="p-1 rounded bg-signal-qualified/10 text-signal-qualified">
            <TrendingUp className="w-4 h-4" />
          </span>
          <h2 id="heading-buying-signals" className="text-h4 font-bold text-foreground tracking-tight">
            Verified Buying Signals (Empirical Evidence)
          </h2>
          <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-surface-elevated text-foreground-secondary border border-border-subtle">
            {lead.buyingSignals.length} Detected
          </span>
        </div>

        <span className="text-caption text-foreground-tertiary">
          Ranked by conversion correlation
        </span>
      </div>

      {/* Signal Verification Ledger */}
      <div className="divide-y divide-border-subtle/80">
        {displayedSignals.map((signal, idx) => (
          <div
            key={signal.id || idx}
            className="py-3.5 first:pt-1 last:pb-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
          >
            {/* Left: Signal Type, Badge & Description */}
            <div className="space-y-1 min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-foreground text-xs tracking-tight">
                  {signal.type}
                </span>

                <span className="text-[10px] font-mono text-signal-qualified font-semibold px-1.5 py-0.2 rounded bg-signal-qualified/10 border border-signal-qualified/20 inline-flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  +{signal.impactScore}% Impact
                </span>

                <span className="text-[11px] text-foreground-tertiary font-mono flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5" />
                  {signal.timestamp}
                </span>
              </div>

              <p className="text-xs text-foreground-secondary leading-relaxed">
                {signal.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Progressive Disclosure Toggle */}
      {hasMore && (
        <div className="pt-2 border-t border-border-subtle flex justify-center">
          <button
            type="button"
            onClick={() => setShowAll(!showAll)}
            className="inline-flex items-center gap-1.5 text-xs text-primary hover:text-primary-hover font-semibold transition-colors focus:outline-none focus:underline"
            aria-expanded={showAll}
          >
            <span>{showAll ? 'Collapse Secondary Signals' : `+ View ${sortedSignals.length - 3} Additional Detected Signals`}</span>
            {showAll ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      )}
    </section>
  );
};
