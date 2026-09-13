import React from 'react';
import {
  ShieldCheck,
  Target,
  Zap,
  Flame,
  Lightbulb,
  Building2,
  Users,
  ArrowRight,
  RefreshCw,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { GeneratedBusinessProfile } from '../../types/onboarding';
import { Button } from '../ui/Button';

export interface Step8IntelligenceProfileProps {
  profile: GeneratedBusinessProfile;
  companyName: string;
  onProceedToReview: () => void;
  onRecalibrate: () => void;
}

export const Step8IntelligenceProfile: React.FC<Step8IntelligenceProfileProps> = ({
  profile,
  companyName,
  onProceedToReview,
  onRecalibrate,
}) => {
  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-4 rounded-xl bg-surface-1 border border-border-default flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-signal-qualified-muted text-signal-qualified border border-signal-qualified/30">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-body font-bold text-foreground">
                Autonomous Sales Profile Generated
              </h3>
              <span className="px-2 py-0.2 rounded-full text-[10px] font-mono font-bold bg-signal-qualified-muted text-signal-qualified border border-signal-qualified/30">
                {profile.confidenceScore}% Confidence
              </span>
            </div>
            <p className="text-caption text-foreground-tertiary">
              Calibrated for {companyName} · Real-time signal radar active
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={onRecalibrate}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Re-run Calibration
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={onProceedToReview}
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            Review & Activate
          </Button>
        </div>
      </div>

      {/* Structured Intelligence Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Card 1: Who You Sell To & Summary (8 cols) */}
        <div className="md:col-span-8 p-5 bg-surface-1/70 border border-border-default rounded-xl space-y-3">
          <div className="flex items-center gap-2 text-foreground font-semibold text-body border-b border-border-subtle pb-2.5">
            <Building2 className="w-4 h-4 text-primary" />
            <span>Target Account & Persona Synthesis</span>
          </div>

          <div className="space-y-2">
            <div className="space-y-1">
              <div className="text-[11px] font-mono uppercase text-foreground-tertiary">
                Business & Value Positioning
              </div>
              <p className="text-body text-foreground leading-relaxed">
                {profile.businessSummary}
              </p>
            </div>

            <div className="space-y-1 pt-2">
              <div className="text-[11px] font-mono uppercase text-foreground-tertiary">
                Ideal Customer Archetype
              </div>
              <p className="text-caption text-foreground-secondary leading-relaxed bg-surface-elevated/50 p-3 rounded-lg border border-border-subtle">
                {profile.idealCustomer}
              </p>
            </div>
          </div>
        </div>

        {/* Card 2: Estimated Signal Radar Velocity (4 cols) */}
        <div className="md:col-span-4 p-5 bg-surface-1/70 border border-border-default rounded-xl space-y-3 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-foreground font-semibold text-body border-b border-border-subtle pb-2.5">
              <Zap className="w-4 h-4 text-signal-high" />
              <span>Signal Ingestion Telemetry</span>
            </div>

            <div className="space-y-1 text-center py-2">
              <div className="text-metric font-bold text-signal-high font-mono">
                ~{profile.estimatedMonthlySignals}
              </div>
              <div className="text-caption text-foreground-secondary font-medium">
                Estimated Monthly Buying Signals
              </div>
              <div className="text-[11px] text-foreground-tertiary">
                Scanned across 42 verified B2B web and regulatory feeds
              </div>
            </div>
          </div>

          <div className="p-2.5 bg-surface-elevated rounded-lg border border-border-subtle text-[11px] text-foreground-secondary space-y-1">
            <div className="font-semibold text-foreground flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-signal-qualified" />
              <span>DNC & Compliance Guard: Active</span>
            </div>
            <div className="text-foreground-tertiary">
              Voice dialer will strictly adhere to target prospect operating timezones.
            </div>
          </div>
        </div>

        {/* Card 3: Strongest Buying Signals (6 cols) */}
        <div className="md:col-span-6 p-5 bg-surface-1/70 border border-border-default rounded-xl space-y-3">
          <div className="flex items-center gap-2 text-foreground font-semibold text-body border-b border-border-subtle pb-2.5">
            <Flame className="w-4 h-4 text-signal-high" />
            <span>Strongest Outbound Buying Triggers</span>
          </div>

          <ul className="space-y-2">
            {profile.buyingSignals.map((signal, i) => (
              <li
                key={i}
                className="flex items-start gap-2.5 text-xs text-foreground-secondary bg-surface-1 p-2.5 rounded-lg border border-border-subtle"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-signal-high shrink-0 mt-1.5" />
                <span className="leading-relaxed">{signal}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Card 4: Core Operational Problems Solved (6 cols) */}
        <div className="md:col-span-6 p-5 bg-surface-1/70 border border-border-default rounded-xl space-y-3">
          <div className="flex items-center gap-2 text-foreground font-semibold text-body border-b border-border-subtle pb-2.5">
            <Target className="w-4 h-4 text-signal-qualified" />
            <span>Core Customer Problems Solved</span>
          </div>

          <ul className="space-y-2">
            {profile.coreProblems.map((prob, i) => (
              <li
                key={i}
                className="flex items-start gap-2.5 text-xs text-foreground-secondary bg-surface-1 p-2.5 rounded-lg border border-border-subtle"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-signal-qualified shrink-0 mt-1.5" />
                <span className="leading-relaxed">{prob}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Card 5: Recommended Sales Approach (Full 12 cols) */}
        <div className="md:col-span-12 p-5 bg-surface-1 border border-primary/40 rounded-xl space-y-4 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 left-0 bottom-0 w-1 bg-primary" />
          <div className="flex items-center justify-between gap-2 border-b border-border-subtle pb-2.5">
            <div className="flex items-center gap-2 text-foreground font-semibold text-body">
              <Lightbulb className="w-4 h-4 text-primary" />
              <span>Recommended Autonomous Sales Strategy & Opening Hook</span>
            </div>
            <span className="text-[10px] font-mono font-bold uppercase bg-primary-muted text-primary px-2 py-0.5 rounded border border-primary/30">
              Generated Playbook Hook
            </span>
          </div>

          <p className="text-body text-foreground-secondary leading-relaxed pl-1">
            {profile.recommendedSalesApproach}
          </p>

          {/* Voice Agent Audio Hook Simulation Banner */}
          <div className="p-3.5 rounded-lg bg-surface-elevated/60 border border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-mono font-bold shrink-0 shadow-xs">
                AI
              </div>
              <div className="space-y-0.5">
                <div className="font-semibold text-foreground flex items-center gap-2">
                  <span>Simulated Dialer Opening Speech Arc</span>
                  <span className="text-[10px] font-mono text-signal-qualified font-normal">
                    · 0.4s Latency Model
                  </span>
                </div>
                <div className="text-[11px] text-foreground-tertiary italic">
                  "Hi David, saw you just scaled logistics at your regional DC. Are you still losing hours to manual cycle counting?"
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <span className="w-1.5 h-3 bg-primary animate-pulse rounded-full" />
              <span className="w-1.5 h-5 bg-primary animate-pulse delay-75 rounded-full" />
              <span className="w-1.5 h-2 bg-primary animate-pulse delay-150 rounded-full" />
              <span className="w-1.5 h-4 bg-primary animate-pulse delay-100 rounded-full" />
              <span className="text-[10px] font-mono text-primary font-bold ml-1">Voice Ready</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
