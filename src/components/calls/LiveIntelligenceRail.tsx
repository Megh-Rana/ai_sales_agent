import React from 'react';
import {
  CurrentObjective,
  IntelligenceEvent,
  QualificationDimension,
  QualificationStatus
} from '../../types/calls';
import {
  Target,
  Sparkles,
  Zap,
  TrendingUp,
  MessageSquare,
  Check,
  CircleDot,
  HelpCircle,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

export interface LiveIntelligenceRailProps {
  objective: CurrentObjective;
  intelligenceEvents: IntelligenceEvent[];
  qualification: Record<string, QualificationDimension>;
  className?: string;
}

export const LiveIntelligenceRail: React.FC<LiveIntelligenceRailProps> = ({
  objective,
  intelligenceEvents,
  qualification,
  className = ''
}) => {
  // Calculate qualification progress metrics
  const dimensions = Object.values(qualification);
  const confirmedCount = dimensions.filter((d) => d.status === 'confirmed').length;
  const totalCount = dimensions.length;
  const progressPercent = Math.round((confirmedCount / totalCount) * 100);

  return (
    <aside
      aria-label="Live Sales Intelligence Rail"
      className={`space-y-4 ${className}`}
    >
      {/* 1. CURRENT CONVERSATIONAL OBJECTIVE (LEVEL 3 HIERARCHY) */}
      <section
        aria-labelledby="heading-current-objective"
        className="bg-surface-0 border border-primary/35 rounded-xl p-4 shadow-xs relative overflow-hidden"
      >
        {/* Accent Bar */}
        <div className="absolute top-0 left-0 bottom-0 w-1 bg-primary" />

        <div className="flex items-center justify-between pb-2.5 border-b border-border-subtle pl-1.5">
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-primary">
            <Target className="w-3.5 h-3.5" />
            <h2 id="heading-current-objective">Current Objective</h2>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 font-semibold">
            In Progress
          </span>
        </div>

        <div className="mt-3 space-y-2.5 pl-1.5">
          <p className="text-xs font-semibold text-foreground leading-snug">
            {objective.goal}
          </p>

          <div className="p-3 rounded-lg bg-surface-elevated/80 border border-border-subtle space-y-1">
            <span className="text-[10px] font-mono text-foreground-tertiary uppercase flex items-center gap-1">
              <MessageSquare className="w-3 h-3 text-primary" />
              Suggested Probe
            </span>
            <p className="text-xs text-foreground-secondary italic font-serif leading-relaxed">
              "{objective.suggestedQuestion}"
            </p>
          </div>

          <p className="text-[11px] text-foreground-tertiary leading-relaxed">
            <strong className="text-foreground-secondary font-medium">Sales Strategy:</strong>{' '}
            {objective.strategyNote}
          </p>
        </div>
      </section>

      {/* 2. REAL-TIME Qualification & READINESS QUALIFICATION */}
      <section
        aria-labelledby="heading-qualification-matrix"
        className="bg-surface-0 border border-border-default rounded-xl p-4 shadow-xs"
      >
        <div className="flex items-center justify-between pb-2.5 border-b border-border-subtle">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-signal-qualified" />
            <h2
              id="heading-qualification-matrix"
              className="text-xs font-mono font-bold uppercase tracking-wider text-foreground"
            >
              Qualification Matrix
            </h2>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-mono">
            <span className="text-signal-qualified font-bold">{confirmedCount}/{totalCount}</span>
            <span className="text-foreground-tertiary">({progressPercent}%)</span>
          </div>
        </div>

        {/* Qualification Dimensions List */}
        <div className="mt-3 space-y-2">
          {dimensions.map((dim) => {
            const isConfirmed = dim.status === 'confirmed';
            const isDiscovering = dim.status === 'discovering';

            return (
              <div
                key={dim.dimension}
                className={`p-2.5 rounded-lg border transition-colors ${
                  isConfirmed
                    ? 'bg-signal-qualified/5 border-signal-qualified/25'
                    : isDiscovering
                    ? 'bg-signal-high/5 border-signal-high/25'
                    : 'bg-surface-elevated/40 border-border-subtle/70'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    {isConfirmed ? (
                      <Check className="w-3.5 h-3.5 text-signal-qualified shrink-0 stroke-[2.5]" />
                    ) : isDiscovering ? (
                      <CircleDot className="w-3.5 h-3.5 text-signal-high shrink-0 animate-pulse" />
                    ) : (
                      <span className="w-3.5 h-3.5 rounded-full border border-foreground-tertiary/40 inline-block shrink-0" />
                    )}
                    <span
                      className={`text-xs font-medium truncate ${
                        isConfirmed
                          ? 'text-foreground font-semibold'
                          : isDiscovering
                          ? 'text-foreground'
                          : 'text-foreground-tertiary'
                      }`}
                    >
                      {dim.label}
                    </span>
                  </div>

                  {/* Clean Sales Status Badge */}
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase shrink-0 ${
                      isConfirmed
                        ? 'bg-signal-qualified/10 text-signal-qualified border-signal-qualified/30 font-semibold'
                        : isDiscovering
                        ? 'bg-signal-high/10 text-signal-high border-signal-high/30 font-semibold'
                        : 'bg-surface-elevated text-foreground-tertiary border-border-subtle'
                    }`}
                  >
                    {isConfirmed ? 'Confirmed' : isDiscovering ? 'Discovering' : 'Not discussed'}
                  </span>
                </div>

                {dim.detail && (
                  <p className="mt-1 pl-5 text-[11px] text-foreground-secondary line-clamp-1 font-mono">
                    {dim.detail}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. IN-FLIGHT BUYING SIGNALS FEED */}
      <section
        aria-labelledby="heading-signals-feed"
        className="bg-surface-0 border border-border-default rounded-xl p-4 shadow-xs"
      >
        <div className="flex items-center justify-between pb-2.5 border-b border-border-subtle">
          <div className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-signal-high" />
            <h2
              id="heading-signals-feed"
              className="text-xs font-mono font-bold uppercase tracking-wider text-foreground"
            >
              Detected In-Flight Signals
            </h2>
          </div>

          <span className="text-[11px] font-mono text-foreground-tertiary">
            {intelligenceEvents.length} detected
          </span>
        </div>

        <div className="mt-3 space-y-2.5 max-h-[340px] overflow-y-auto scrollbar-thin pr-1">
          {intelligenceEvents.length === 0 ? (
            <div className="p-5 text-center text-foreground-tertiary space-y-1 select-none">
              <Sparkles className="w-5 h-5 mx-auto text-foreground-tertiary/40" />
              <p className="text-xs font-medium">Listening for sales signals...</p>
              <p className="text-[11px] text-foreground-tertiary/70">
                Timeline triggers, objections, and buying intent will appear here in real time.
              </p>
            </div>
          ) : (
            intelligenceEvents.map((evt) => {
              const isBuyingSignal = evt.type === 'buying_signal';
              const isObjection = evt.type === 'objection';
              const isInterest = evt.type === 'interest';

              return (
                <div
                  key={evt.id}
                  className={`p-3 rounded-lg border text-xs space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-200 ${
                    isBuyingSignal
                      ? 'bg-signal-high/5 border-signal-high/25'
                      : isObjection
                      ? 'bg-signal-urgent/5 border-signal-urgent/25'
                      : isInterest
                      ? 'bg-signal-qualified/5 border-signal-qualified/25'
                      : 'bg-primary/5 border-primary/25'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span
                      className={`text-[10px] font-mono font-bold tracking-tight uppercase ${
                        isBuyingSignal
                          ? 'text-signal-high'
                          : isObjection
                          ? 'text-signal-urgent'
                          : isInterest
                          ? 'text-signal-qualified'
                          : 'text-primary'
                      }`}
                    >
                      {evt.title}
                    </span>

                    <span className="font-mono text-[10px] text-foreground-tertiary shrink-0">
                      {evt.timestamp}
                    </span>
                  </div>

                  <p className="text-foreground-secondary leading-snug font-medium">
                    {evt.description}
                  </p>

                  {evt.quote && (
                    <blockquote className="pl-2 border-l-2 border-border-default text-[11px] italic text-foreground-tertiary font-serif line-clamp-2">
                      "{evt.quote}"
                    </blockquote>
                  )}

                  {/* Why it matters highlight */}
                  {evt.whyItMatters && (
                    <div className="pt-1.5 border-t border-border-subtle/50 text-[11px] text-foreground-secondary flex items-start gap-1">
                      <strong className="text-foreground font-semibold shrink-0">Why it matters:</strong>
                      <span>{evt.whyItMatters}</span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </section>
    </aside>
  );
};
