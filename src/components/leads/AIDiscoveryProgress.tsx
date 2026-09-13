import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Loader2, Radio, Compass, ShieldCheck } from 'lucide-react';

export interface AIDiscoveryProgressProps {
  queryText: string;
  onComplete: () => void;
}

interface DiscoveryStage {
  id: number;
  title: string;
  detail: string;
  durationMs: number;
}

const STAGES: DiscoveryStage[] = [
  {
    id: 1,
    title: 'Preparing search & query parameters',
    detail: 'Calibrating intent vectors against user business profile...',
    durationMs: 400,
  },
  {
    id: 2,
    title: 'Finding verified commercial requirements',
    detail: 'Scanning 42 external B2B exchanges, job postings, and RFP portals...',
    durationMs: 500,
  },
  {
    id: 3,
    title: 'Analyzing multi-source buying signals',
    detail: 'Detecting technology migrations, hiring sprees, and budget notices...',
    durationMs: 600,
  },
  {
    id: 4,
    title: 'Scoring opportunity intent & urgency (80–100)',
    detail: 'Applying dynamic intent velocity weights and contact availability checks...',
    durationMs: 450,
  },
  {
    id: 5,
    title: 'Preparing prioritized results workbench',
    detail: 'Organizing priority deals and signal provenance records...',
    durationMs: 400,
  },
];

export const AIDiscoveryProgress: React.FC<AIDiscoveryProgressProps> = ({
  queryText,
  onComplete,
}) => {
  const [currentStageIdx, setCurrentStageIdx] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (currentStageIdx < STAGES.length - 1) {
      timeoutId = setTimeout(() => {
        setCurrentStageIdx((prev) => prev + 1);
      }, STAGES[currentStageIdx].durationMs);
    } else if (currentStageIdx === STAGES.length - 1 && !isFinished) {
      timeoutId = setTimeout(() => {
        setIsFinished(true);
        onComplete();
      }, STAGES[currentStageIdx].durationMs);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [currentStageIdx, isFinished, onComplete]);

  const progressPercent = Math.min(
    100,
    Math.round(((currentStageIdx + 1) / STAGES.length) * 100)
  );

  return (
    <div className="p-6 bg-surface-0 border border-primary/30 rounded-xl space-y-5 max-w-2xl mx-auto my-8 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-border-subtle pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary-muted text-primary flex items-center justify-center border border-primary/30">
            <Radio className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-body font-bold text-foreground">
              Executing Autonomous Intent Discovery
            </h3>
            <p className="text-[11px] text-foreground-tertiary">
              {queryText ? `Filtering query: "${queryText}"` : 'Scanning all 42 live telemetry streams'}
            </p>
          </div>
        </div>

        <span className="font-mono text-body font-bold text-primary">{progressPercent}%</span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-surface-elevated rounded-full overflow-hidden border border-border-subtle">
        <motion.div
          className="h-full bg-primary rounded-full transition-all duration-300"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Sequential Stage Items */}
      <div className="space-y-2.5">
        {STAGES.map((stage, idx) => {
          const isDone = isFinished || idx < currentStageIdx;
          const isCurrent = !isFinished && idx === currentStageIdx;

          return (
            <div
              key={stage.id}
              className={`p-3 rounded-lg border text-xs flex items-center gap-3 transition-colors ${
                isDone
                  ? 'bg-surface-1/60 border-signal-qualified/30 text-foreground'
                  : isCurrent
                  ? 'bg-surface-1 border-primary ring-1 ring-primary/20 text-foreground'
                  : 'bg-surface-0 border-border-subtle opacity-30 text-foreground-tertiary'
              }`}
            >
              <div className="shrink-0">
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-signal-qualified" />
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 text-primary animate-spin" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-border-default flex items-center justify-center text-[10px] font-mono">
                    {stage.id}
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
                <div className="truncate">
                  <span className="font-semibold">{stage.title}</span>
                  <span className="text-foreground-tertiary hidden sm:inline ml-2">
                    · {stage.detail}
                  </span>
                </div>

                {isDone && (
                  <span className="text-[10px] font-mono text-signal-qualified font-bold uppercase shrink-0">
                    Done
                  </span>
                )}
                {isCurrent && (
                  <span className="text-[10px] font-mono text-primary font-bold uppercase animate-pulse shrink-0">
                    Scanning
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
