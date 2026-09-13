import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Loader2, Cpu, ShieldCheck, ArrowRight, Zap, Target } from 'lucide-react';
import { Button } from '../ui/Button';

export interface Step7AIUnderstandingProps {
  businessName: string;
  onComplete: () => void;
}

interface ProcessingStage {
  id: number;
  title: string;
  description: string;
  durationMs: number;
}

const STAGES: ProcessingStage[] = [
  {
    id: 1,
    title: 'Understanding your business & value model',
    description: 'Analyzing company DNA, core product offerings, and competitive differentiators...',
    durationMs: 900,
  },
  {
    id: 2,
    title: 'Analyzing your customers & decision-maker personas',
    description: 'Calibrating ICP criteria, job title hierarchies, and target company sizes...',
    durationMs: 1000,
  },
  {
    id: 3,
    title: 'Identifying high-velocity buying signals',
    description: 'Mapping 42 external trigger sources (hiring sprees, facility growth, tech stack migrations)...',
    durationMs: 1100,
  },
  {
    id: 4,
    title: 'Preparing autonomous sales profile & pitch playbook',
    description: 'Compiling personalized voice opening hooks, ROI claims, and objection counter-arguments...',
    durationMs: 900,
  },
];

export const Step7AIUnderstanding: React.FC<Step7AIUnderstandingProps> = ({
  businessName,
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
      }, STAGES[currentStageIdx].durationMs);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [currentStageIdx, isFinished]);

  const totalProgress = Math.min(
    100,
    Math.round(((currentStageIdx + (isFinished ? 1 : 0.5)) / STAGES.length) * 100)
  );

  return (
    <div className="space-y-6 max-w-2xl mx-auto py-4">
      {/* Visual Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-muted text-primary text-xs font-mono font-semibold border border-primary/30">
          <Cpu className="w-3.5 h-3.5 animate-pulse" />
          <span>Vidur Autonomous Synthesis Engine</span>
        </div>

        <h3 className="text-h2 font-bold text-foreground tracking-tight">
          Building Your Sales Intelligence Profile
        </h3>
        <p className="text-body text-foreground-secondary max-w-lg mx-auto leading-relaxed">
          Synthesizing your business parameters, target ICP criteria, and buying signal triggers for{' '}
          <strong className="text-foreground">{businessName || 'your enterprise'}</strong>.
        </p>
      </div>

      {/* Progress Track */}
      <div className="space-y-2 p-4 bg-surface-1 rounded-xl border border-border-default">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-foreground-secondary">
            {isFinished ? 'Autonomous Calibration Complete' : 'Synthesizing Telemetry...'}
          </span>
          <span className="font-bold text-primary">{totalProgress}%</span>
        </div>

        <div className="w-full h-2 bg-surface-elevated rounded-full overflow-hidden border border-border-subtle">
          <motion.div
            className="h-full bg-primary rounded-full transition-all duration-300"
            initial={{ width: 0 }}
            animate={{ width: `${totalProgress}%` }}
          />
        </div>
      </div>

      {/* Sequential Telemetry Stages */}
      <div className="space-y-3">
        {STAGES.map((stage, idx) => {
          const isDone = isFinished || idx < currentStageIdx;
          const isCurrent = !isFinished && idx === currentStageIdx;
          const isPending = !isFinished && idx > currentStageIdx;

          return (
            <motion.div
              key={stage.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: idx * 0.08 }}
              className={`p-4 rounded-xl border transition-all text-xs flex items-start gap-3.5 ${
                isDone
                  ? 'bg-surface-1/60 border-signal-qualified/30 text-foreground'
                  : isCurrent
                  ? 'bg-surface-1 border-primary shadow-xs ring-1 ring-primary/20 text-foreground'
                  : 'bg-surface-0 border-border-subtle opacity-40 text-foreground-tertiary'
              }`}
            >
              {/* Status Icon */}
              <div className="mt-0.5 shrink-0">
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-signal-qualified" />
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 text-primary animate-spin" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-border-default flex items-center justify-center font-mono text-[10px]">
                    {stage.id}
                  </div>
                )}
              </div>

              {/* Stage Content */}
              <div className="space-y-0.5 flex-1 min-w-0">
                <div className="font-semibold text-body flex items-center justify-between gap-2">
                  <span>{stage.title}</span>
                  {isDone && (
                    <span className="text-[10px] font-mono text-signal-qualified font-bold uppercase">
                      Ready
                    </span>
                  )}
                  {isCurrent && (
                    <span className="text-[10px] font-mono text-primary animate-pulse font-bold uppercase">
                      Executing
                    </span>
                  )}
                </div>
                <p className="text-caption text-foreground-secondary leading-relaxed">
                  {stage.description}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Completion CTA */}
      {isFinished && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="pt-4 text-center"
        >
          <Button
            variant="primary"
            size="lg"
            className="w-full sm:w-auto px-8 justify-center shadow-md font-semibold"
            rightIcon={<ArrowRight className="w-4 h-4" />}
            onClick={onComplete}
          >
            View Generated Business Profile
          </Button>
        </motion.div>
      )}
    </div>
  );
};
