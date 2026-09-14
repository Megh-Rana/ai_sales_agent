import React from 'react';
import { Target, Clock, MessageSquare, ShieldAlert, Zap, ArrowRight, Copy, Check } from 'lucide-react';
import { AISalesBriefData } from '../../types/sales';
import { Button } from '../ui/Button';

export interface AISalesBriefProps {
  brief?: AISalesBriefData;
  className?: string;
}

export const AISalesBrief: React.FC<AISalesBriefProps> = ({
  brief = {
    objective: 'Book a 20-minute technical evaluation demo with VP of Operations.',
    whyNow: [
      'Posted urgent hiring request for 3 Sales Engineers yesterday.',
      'Active tech stack migration away from legacy Salesforce workflow.',
    ],
    recommendedAngle:
      'Highlight 40% reduction in rep onboarding time & automated lead qualification without increasing headcount.',
    recommendedOpening:
      '"Hi Sarah, I noticed Acme Corp is expanding the Ops team while migrating stack. Most VP Ops we partner with are looking to automate outbound qualification before hiring standard BDRs. Would 10 minutes make sense this Thursday?"',
    potentialObjections: [
      {
        objection: '"We are currently locked into our existing tool contract."',
        counter:
          '"Understood — our native sync runs alongside legacy setups with zero downtime, and we offer contract buyouts for Q4 deals."',
      },
    ],
    nextBestAction: 'Initiate AI Voice Agent call to qualify budget availability.',
  },
  className = '',
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopyOpening = () => {
    navigator.clipboard.writeText(brief.recommendedOpening);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`bg-surface-0 border border-border-default rounded-xl p-5 space-y-5 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
        <div className="flex items-center gap-2">
          <span className="p-1 rounded bg-primary-muted text-primary font-mono text-xs font-bold uppercase">
            Brief
          </span>
          <h3 className="text-h3 font-semibold text-foreground">AI Sales Brief</h3>
        </div>
        <span className="text-caption font-mono text-foreground-tertiary">Synthesized 4m ago</span>
      </div>

      {/* 1. Objective */}
      <div className="space-y-1">
        <div className="flex items-center gap-1.5 text-small font-medium text-foreground-secondary uppercase tracking-wider">
          <Target className="w-3.5 h-3.5 text-primary" />
          Primary Touchpoint Objective
        </div>
        <p className="text-body font-medium text-foreground bg-surface-1 p-3 rounded-lg border border-border-subtle">
          {brief.objective}
        </p>
      </div>

      {/* 2. Why Now */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5 text-small font-medium text-foreground-secondary uppercase tracking-wider">
          <Clock className="w-3.5 h-3.5 text-signal-high" />
          Why Now? (Trigger Context)
        </div>
        <ul className="space-y-1">
          {brief.whyNow.map((item, idx) => (
            <li key={idx} className="text-body text-foreground-secondary flex items-start gap-2">
              <span className="text-signal-high font-bold">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 3. Recommended Angle & Pitch Opening */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-small font-medium text-foreground-secondary uppercase tracking-wider">
            <MessageSquare className="w-3.5 h-3.5 text-signal-qualified" />
            Recommended Opening Script
          </div>
          <button
            type="button"
            onClick={handleCopyOpening}
            className="flex items-center gap-1 text-xs text-foreground-tertiary hover:text-foreground"
          >
            {copied ? <Check className="w-3 h-3 text-signal-qualified" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'Copied' : 'Copy Script'}</span>
          </button>
        </div>
        <div className="bg-surface-1 p-3.5 rounded-lg border border-border-subtle italic text-body text-foreground-secondary">
          {brief.recommendedOpening}
        </div>
      </div>

      {/* 4. Potential Objections */}
      {brief.potentialObjections.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-small font-medium text-foreground-secondary uppercase tracking-wider">
            <ShieldAlert className="w-3.5 h-3.5 text-signal-urgent" />
            Objection Handbook
          </div>
          {brief.potentialObjections.map((obj, idx) => (
            <div key={idx} className="p-3 bg-surface-1 rounded-lg border border-border-subtle space-y-1 text-xs">
              <p className="font-semibold text-signal-urgent">{obj.objection}</p>
              <p className="text-foreground-secondary">
                <span className="font-medium text-foreground">Counter: </span>
                {obj.counter}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* 5. Action Recommendation */}
      <div className="pt-3 border-t border-border-subtle flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-signal-high" />
          <span className="text-small font-medium text-foreground">
            Next Action: {brief.nextBestAction}
          </span>
        </div>
        <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
          Execute Now
        </Button>
      </div>
    </div>
  );
};
