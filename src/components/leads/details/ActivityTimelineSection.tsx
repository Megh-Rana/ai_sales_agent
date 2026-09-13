import React from 'react';
import { Search, Sparkles, Zap, PhoneCall, CheckCircle2, Clock } from 'lucide-react';
import { DiscoveredLead, LeadActivityEvent } from '../../../types/leads';

export interface ActivityTimelineSectionProps {
  lead: DiscoveredLead;
}

export const ActivityTimelineSection: React.FC<ActivityTimelineSectionProps> = ({ lead }) => {
  const events = lead.timeline || [];

  const getCategoryIcon = (category: LeadActivityEvent['category']) => {
    switch (category) {
      case 'discovery':
        return <Search className="w-3.5 h-3.5 text-info" />;
      case 'enrichment':
        return <Sparkles className="w-3.5 h-3.5 text-primary" />;
      case 'signal':
        return <Zap className="w-3.5 h-3.5 text-signal-high" />;
      case 'call':
        return <PhoneCall className="w-3.5 h-3.5 text-primary" />;
      default:
        return <CheckCircle2 className="w-3.5 h-3.5 text-signal-qualified" />;
    }
  };

  return (
    <section
      aria-labelledby="heading-activity-timeline"
      className="bg-surface-0 border border-border-default rounded-xl p-5 space-y-4 shadow-xs"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-border-subtle pb-3">
        <div className="flex items-center gap-2">
          <span className="p-1 rounded bg-surface-elevated text-foreground-secondary">
            <Clock className="w-4 h-4" />
          </span>
          <h2 id="heading-activity-timeline" className="text-h4 font-bold text-foreground tracking-tight">
            Sales Activity & Provenance Timeline
          </h2>
        </div>

        <span className="text-caption text-foreground-tertiary">
          Real-time event log
        </span>
      </div>

      {/* Vertical Timeline */}
      <div className="space-y-4 pt-1">
        {events.map((item, idx) => (
          <div key={item.id || idx} className="relative flex items-start gap-3 pl-1">
            {/* Connecting Vertical Line */}
            {idx < events.length - 1 && (
              <div className="absolute left-[17px] top-6 bottom-0 w-0.5 bg-border-subtle" />
            )}

            {/* Event Category Dot */}
            <div className="relative z-10 w-7 h-7 rounded-full bg-surface-1 border border-border-default flex items-center justify-center shrink-0">
              {getCategoryIcon(item.category)}
            </div>

            {/* Event Description */}
            <div className="flex-1 pb-3 text-xs space-y-0.5">
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-foreground">{item.title}</span>
                <span className="font-mono text-[11px] text-foreground-tertiary shrink-0">
                  {item.timestamp}
                </span>
              </div>
              <p className="text-foreground-secondary leading-relaxed">{item.description}</p>
            </div>
          </div>
        ))}

        {events.length === 0 && (
          <div className="text-center py-4 text-xs text-foreground-tertiary">
            No historical touchpoints logged yet. Opportunity discovered recently.
          </div>
        )}
      </div>
    </section>
  );
};
