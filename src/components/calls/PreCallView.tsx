import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PhoneCall,
  ArrowLeft,
  Building2,
  User,
  Zap,
  Clock,
  Target,
  FileText,
  HelpCircle,
  ShieldAlert,
  CheckCircle2,
  Flame,
  Radio,
  Languages
} from 'lucide-react';
import { DiscoveredLead } from '../../types/leads';
import { Button } from '../ui/Button';

export interface PreCallViewProps {
  lead: DiscoveredLead;
  onStartCallFlow: () => void;
}

export const PreCallView: React.FC<PreCallViewProps> = ({
  lead,
  onStartCallFlow
}) => {
  const navigate = useNavigate();

  const decisionMakerName =
    lead.decisionMakerContact?.name || lead.decisionMaker?.name || 'David Reynolds';
  const decisionMakerRole =
    lead.decisionMakerContact?.role || lead.decisionMaker?.role || 'Operations Leader';
  const decisionMakerPhone =
    lead.decisionMaker?.phone || '+1 (312) 555-0184';

  const primarySignal = lead.buyingSignals?.[0];
  const brief = lead.callBrief;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(`/leads/${lead.id}`)}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground-secondary hover:text-foreground transition-colors group focus:outline-none focus:ring-1 focus:ring-primary rounded px-1.5 py-0.5"
          aria-label="Back to Lead Details"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Lead: {lead.companyName}</span>
        </button>

        <div className="flex items-center gap-2 text-[11px] font-mono text-foreground-tertiary">
          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
          <span>Pre-Call Strategic Briefing</span>
        </div>
      </div>

      {/* Target Prospect Intelligence Memo */}
      <header className="bg-surface-0 border border-border-default rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-start gap-4 min-w-0">
            <div className="w-13 h-13 rounded-xl bg-surface-elevated border border-border-default flex items-center justify-center shrink-0 font-mono text-h3 font-bold text-primary shadow-inner">
              {lead.companyName.slice(0, 2).toUpperCase()}
            </div>

            <div className="space-y-1.5 min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-h2 font-bold text-foreground truncate tracking-tight">
                  {lead.companyName}
                </h1>

                {/* Intent Score Badge */}
                <div
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border ${
                    lead.intentScore >= 80
                      ? 'bg-signal-high/10 text-signal-high border-signal-high/30'
                      : 'bg-primary/10 text-primary border-primary/30'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  <span>{lead.intentScore}/100 INTENT</span>
                </div>

                <span className="text-xs font-mono text-signal-qualified px-2 py-0.5 rounded bg-surface-elevated border border-border-subtle">
                  {lead.estimatedValue}
                </span>
              </div>

              {/* Contact Metadata Row */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-foreground-secondary">
                <span className="flex items-center gap-1 text-foreground font-semibold">
                  <User className="w-3.5 h-3.5 text-foreground-tertiary" />
                  <span>{decisionMakerName}</span>
                  <span className="text-foreground-tertiary font-normal">({decisionMakerRole})</span>
                </span>
                <span className="text-foreground-tertiary">·</span>
                <span className="font-mono text-foreground-tertiary">{decisionMakerPhone}</span>
                <span className="text-foreground-tertiary">·</span>
                <span>{lead.location}</span>
                <span className="text-foreground-tertiary">·</span>
                <span>{lead.industry}</span>
              </div>
            </div>
          </div>

          {/* Primary Action Button */}
          <div className="shrink-0 flex items-center gap-3">
            <Button
              variant="secondary"
              size="md"
              onClick={() => navigate(`/leads/${lead.id}`)}
              className="text-xs"
            >
              Back to Lead
            </Button>

            <Button
              variant="primary"
              size="lg"
              leftIcon={<PhoneCall className="w-4 h-4" />}
              onClick={onStartCallFlow}
              className="text-xs font-semibold px-6 shadow-sm"
              title="Launch autonomous outbound call"
            >
              Start AI Call
            </Button>
          </div>
        </div>

        {/* Operational Context & Trigger Grid */}
        <div className="pt-4 border-t border-border-subtle grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="md:col-span-2 space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-foreground-tertiary font-bold">
              Verified Commercial Requirement
            </span>
            <p className="text-foreground font-medium leading-relaxed">
              "{lead.requirement}"
            </p>
          </div>

          <div className="space-y-1.5 p-3.5 rounded-lg bg-icyBlue/5 border border-icyBlue/25">
            <div className="flex items-center gap-1.5 text-icyBlue font-semibold text-xs">
              <Clock className="w-3.5 h-3.5" />
              <span>Why Contact Now?</span>
            </div>
            <p className="text-foreground-secondary text-xs leading-relaxed">
              {lead.whyNow}
            </p>
          </div>
        </div>

        {/* Telephony Session Parameters Bar */}
        <div className="pt-3 border-t border-border-subtle/70 flex flex-wrap items-center gap-4 text-[11px] font-mono text-foreground-tertiary">
          <span className="flex items-center gap-1.5 text-foreground-secondary">
            <Radio className="w-3 h-3 text-signal-qualified" />
            <span>Mode: Outbound Autonomous Discovery</span>
          </span>
          <span>·</span>
          <span className="flex items-center gap-1.5 text-foreground-secondary">
            <Languages className="w-3 h-3 text-primary" />
            <span>Default Language: English</span>
          </span>
          <span>·</span>
          <span>Target Window: Active Business Hours</span>
        </div>
      </header>

      {/* Strongest Buying Signal Highlight Card */}
      {primarySignal && (
        <section
          aria-label="Strongest Buying Signal"
          className="p-4 rounded-xl bg-signal-high/5 border border-signal-high/25 flex items-start gap-3.5"
        >
          <div className="p-2 rounded-lg bg-signal-high/15 border border-signal-high/30 text-signal-high shrink-0 mt-0.5">
            <Flame className="w-4 h-4 fill-current" />
          </div>
          <div className="space-y-1 flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-signal-high">
                Strongest Buying Signal: {primarySignal.type}
              </span>
              <span className="text-[11px] font-mono text-foreground-tertiary">
                {primarySignal.timestamp}
              </span>
            </div>
            <p className="text-xs text-foreground-secondary leading-relaxed font-medium">
              {primarySignal.description}
            </p>
          </div>
        </section>
      )}

      {/* CALL BRIEF DOSSIER */}
      <section
        aria-labelledby="heading-call-brief"
        className="bg-surface-0 border border-border-default rounded-xl p-5 sm:p-6 space-y-5 shadow-xs"
      >
        <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            <h2 id="heading-call-brief" className="text-sm font-mono font-bold uppercase tracking-wider text-foreground">
              Autonomous Call Brief & Strategic Blueprint
            </h2>
          </div>
          <span className="text-xs font-mono text-foreground-tertiary">
            Sales Intelligence Dossier
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Opening Hook */}
          <div className="p-4 rounded-lg bg-surface-elevated border border-border-subtle space-y-1.5 md:col-span-2">
            <div className="flex items-center gap-1.5 text-primary font-semibold text-xs">
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Recommended Opening Hook</span>
            </div>
            <p className="text-foreground leading-relaxed italic font-serif text-sm">
              "{brief?.opening || lead.suggestedOpeningHook}"
            </p>
          </div>

          {/* Lead Context */}
          <div className="p-4 rounded-lg bg-surface-elevated/70 border border-border-subtle space-y-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-foreground-tertiary flex items-center gap-1 font-bold">
              <Building2 className="w-3 h-3 text-foreground-tertiary" />
              Lead Context
            </span>
            <p className="text-foreground-secondary leading-relaxed">
              {brief?.leadContext || `${lead.companyName} is in ${lead.industry} (${lead.employeeCount} employees) seeking automated solutions.`}
            </p>
          </div>

          {/* Key Signal Focus */}
          <div className="p-4 rounded-lg bg-surface-elevated/70 border border-border-subtle space-y-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-signal-high flex items-center gap-1 font-bold">
              <Zap className="w-3 h-3" />
              Key Signal Focus
            </span>
            <p className="text-foreground-secondary leading-relaxed">
              {brief?.keySignal || lead.whyNow}
            </p>
          </div>

          {/* Recommended Question */}
          <div className="p-4 rounded-lg bg-surface-elevated/70 border border-border-subtle space-y-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-primary flex items-center gap-1 font-bold">
              <HelpCircle className="w-3 h-3" />
              Recommended Discovery Question
            </span>
            <p className="text-foreground-secondary leading-relaxed italic font-serif">
              "{brief?.discoveryQuestion || `How is your team currently handling ${lead.industry.toLowerCase()} touchpoint workflows?`}"
            </p>
          </div>

          {/* Potential Objection & Defense */}
          <div className="p-4 rounded-lg bg-surface-elevated/70 border border-border-subtle space-y-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-signal-urgent flex items-center gap-1 font-bold">
              <ShieldAlert className="w-3 h-3" />
              Potential Objection & Defense
            </span>
            <p className="text-foreground-secondary leading-relaxed">
              <strong className="text-foreground font-semibold">Objection:</strong> "{brief?.potentialObjection || 'We are currently reviewing multiple vendors.'}"
            </p>
            <p className="text-foreground-tertiary leading-relaxed text-[11px] pt-1 border-t border-border-subtle/50">
              <strong className="text-signal-qualified font-semibold">Defense:</strong> "{brief?.objectionCounter || 'Sub-second voice agents connect directly into existing CRMs with zero workflow friction.'}"
            </p>
          </div>

          {/* Desired Outcome */}
          <div className="p-4 rounded-lg bg-signal-qualified/5 border border-signal-qualified/25 space-y-1.5 md:col-span-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-signal-qualified flex items-center gap-1 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Target Call Outcome
            </span>
            <p className="text-foreground font-semibold leading-relaxed">
              {brief?.desiredOutcome || `Qualify procurement timeline and secure 20-min technical architecture demo with ${decisionMakerName}.`}
            </p>
          </div>
        </div>

        {/* Bottom CTA Bar */}
        <div className="pt-4 border-t border-border-subtle flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-foreground-tertiary">
            The autonomous AI voice agent will strictly adhere to this strategic brief during the outbound call.
          </p>

          <Button
            variant="primary"
            size="lg"
            leftIcon={<PhoneCall className="w-4 h-4" />}
            onClick={onStartCallFlow}
            className="w-full sm:w-auto text-xs font-semibold px-6 shadow-sm"
          >
            Start AI Call
          </Button>
        </div>
      </section>
    </div>
  );
};
