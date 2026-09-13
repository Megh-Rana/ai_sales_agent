import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PhoneCall, Target, HelpCircle, ShieldAlert, CheckCircle, Zap, FileText } from 'lucide-react';
import { DiscoveredLead } from '../../../types/leads';
import { Button } from '../../ui/Button';

export interface AICallBriefSectionProps {
  lead: DiscoveredLead;
  onInitiateCall?: () => void;
}

export const AICallBriefSection: React.FC<AICallBriefSectionProps> = ({ lead, onInitiateCall }) => {
  const navigate = useNavigate();
  const brief = lead.callBrief;

  const handleStartCall = () => {
    if (onInitiateCall) {
      onInitiateCall();
    } else {
      navigate('/calls');
    }
  };

  if (!brief) return null;

  return (
    <section
      aria-labelledby="heading-call-brief"
      className="bg-surface-0 border border-border-default rounded-xl p-5 space-y-4 shadow-xs"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-border-subtle pb-3">
        <div className="flex items-center gap-2">
          <span className="p-1 rounded bg-primary/10 text-primary">
            <FileText className="w-4 h-4" />
          </span>
          <h2 id="heading-call-brief" className="text-h4 font-bold text-foreground tracking-tight">
            AI Pre-Call Brief & Dossier
          </h2>
        </div>

        <span className="text-[11px] font-mono text-foreground-tertiary">
          Synthesized from 3 signals
        </span>
      </div>

      {/* Grid of Dossier Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        {/* 1. Opening Hook */}
        <div className="p-3 rounded-lg bg-surface-1 border border-border-subtle space-y-1 md:col-span-2">
          <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-primary flex items-center gap-1.5">
            <Zap className="w-3 h-3" />
            <span>Target Opening Hook</span>
          </span>
          <p className="text-foreground font-medium italic leading-relaxed">
            "{brief.opening}"
          </p>
        </div>

        {/* 2. Lead Context */}
        <div className="p-3 rounded-lg bg-surface-1 border border-border-subtle space-y-1">
          <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-foreground-tertiary">
            Operational Context
          </span>
          <p className="text-foreground-secondary leading-relaxed">
            {brief.leadContext}
          </p>
        </div>

        {/* 3. Key Buying Signal */}
        <div className="p-3 rounded-lg bg-surface-1 border border-border-subtle space-y-1">
          <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-signal-high">
            Dominant Signal Trigger
          </span>
          <p className="text-foreground-secondary leading-relaxed">
            {brief.keySignal}
          </p>
        </div>

        {/* 4. Discovery Question */}
        <div className="p-3 rounded-lg bg-surface-1 border border-border-subtle space-y-1">
          <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-info flex items-center gap-1.5">
            <HelpCircle className="w-3 h-3" />
            <span>Recommended Discovery Question</span>
          </span>
          <p className="text-foreground-secondary font-medium leading-relaxed">
            "{brief.discoveryQuestion}"
          </p>
        </div>

        {/* 5. Objection & Counter */}
        <div className="p-3 rounded-lg bg-surface-1 border border-border-subtle space-y-1">
          <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-signal-urgent flex items-center gap-1.5">
            <ShieldAlert className="w-3 h-3" />
            <span>Anticipated Objection & Response</span>
          </span>
          <p className="text-foreground-secondary italic">
            {brief.potentialObjection}
          </p>
          <div className="pt-1 text-foreground-tertiary">
            <strong className="text-primary font-semibold">Counter:</strong> {brief.objectionCounter}
          </div>
        </div>

        {/* 6. Desired Outcome */}
        <div className="p-3 rounded-lg bg-surface-1 border border-border-subtle space-y-1 md:col-span-2">
          <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-signal-qualified flex items-center gap-1.5">
            <Target className="w-3 h-3" />
            <span>Primary Call Objective & Desired Outcome</span>
          </span>
          <p className="text-foreground font-medium leading-relaxed">
            {brief.desiredOutcome}
          </p>
        </div>
      </div>

      {/* CTA Row */}
      <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-border-subtle">
        <span className="text-xs text-foreground-tertiary">
          Ready to initiate autonomous dialogue with real-time sentiment telemetry.
        </span>

        <Button
          variant="primary"
          size="md"
          leftIcon={<PhoneCall className="w-4 h-4" />}
          onClick={handleStartCall}
          className="text-xs font-semibold px-5 shadow-sm"
        >
          Start AI Call
        </Button>
      </div>
    </section>
  );
};
