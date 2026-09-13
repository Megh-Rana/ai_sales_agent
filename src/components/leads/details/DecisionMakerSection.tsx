import React from 'react';
import { UserCheck, Phone, Mail, ExternalLink, ShieldCheck, PhoneCall } from 'lucide-react';
import { DiscoveredLead } from '../../../types/leads';
import { Button } from '../../ui/Button';
import { toast } from 'sonner';

export interface DecisionMakerSectionProps {
  lead: DiscoveredLead;
  onUseInCall?: () => void;
}

export const DecisionMakerSection: React.FC<DecisionMakerSectionProps> = ({ lead, onUseInCall }) => {
  const dm = lead.decisionMaker;

  const handleUseInCall = () => {
    if (onUseInCall) {
      onUseInCall();
    } else {
      toast.success(`Designated ${dm?.name || 'Contact'} (${dm?.role || 'Lead'}) as primary call participant.`);
    }
  };

  if (!dm) {
    return (
      <section
        aria-labelledby="heading-decision-maker"
        className="bg-surface-0 border border-border-default rounded-xl p-4 space-y-2 text-xs"
      >
        <span className="font-semibold text-foreground block">Verified Decision Maker</span>
        <p className="text-foreground-tertiary">
          Direct contact unverified. Main switchboard routing script active.
        </p>
      </section>
    );
  }

  return (
    <section
      aria-labelledby="heading-decision-maker"
      className="bg-surface-0 border border-border-default rounded-xl p-4 sm:p-5 space-y-3.5 shadow-xs"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-border-subtle pb-3">
        <div className="flex items-center gap-2">
          <span className="p-1 rounded bg-primary/10 text-primary">
            <UserCheck className="w-4 h-4" />
          </span>
          <h2 id="heading-decision-maker" className="text-h4 font-bold text-foreground tracking-tight">
            Verified Decision Maker
          </h2>
        </div>

        <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-signal-qualified/10 text-signal-qualified border border-signal-qualified/20 flex items-center gap-1">
          <ShieldCheck className="w-3 h-3" />
          <span>{dm.confidence}% Match</span>
        </span>
      </div>

      {/* Identity Row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full bg-surface-elevated border border-border-default flex items-center justify-center font-bold text-foreground font-mono text-sm shrink-0">
            {dm.name.split(' ').map((n) => n[0]).join('')}
          </div>

          <div className="space-y-0.5 min-w-0">
            <h3 className="text-sm font-bold text-foreground truncate">{dm.name}</h3>
            <p className="text-xs text-primary font-medium truncate">{dm.role}</p>
            <p className="text-[11px] text-foreground-tertiary truncate">{dm.department}</p>
          </div>
        </div>

        {dm.linkedInUrl && (
          <a
            href={dm.linkedInUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground-tertiary hover:text-primary p-1.5 rounded transition-colors shrink-0"
            title="Inspect LinkedIn Profile"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        )}
      </div>

      {/* Contact Channels (Clean Rows, Zero Nested Boxes) */}
      <div className="space-y-2 pt-2 border-t border-border-subtle text-xs font-mono">
        <div className="flex items-center justify-between gap-2">
          <span className="text-foreground-tertiary flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-foreground-tertiary" />
            <span>Direct Phone:</span>
          </span>
          <span className="font-semibold text-foreground">
            {dm.phone}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <span className="text-foreground-tertiary flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-foreground-tertiary" />
            <span>Email Address:</span>
          </span>
          <span className="font-semibold text-foreground truncate max-w-[200px]">
            {dm.email}
          </span>
        </div>
      </div>

      {/* Action Button */}
      <div className="pt-1">
        <Button
          variant="secondary"
          size="sm"
          leftIcon={<PhoneCall className="w-3.5 h-3.5 text-primary" />}
          onClick={handleUseInCall}
          className="w-full text-xs font-semibold justify-center shadow-xs"
        >
          Use in Call Script
        </Button>
      </div>
    </section>
  );
};
