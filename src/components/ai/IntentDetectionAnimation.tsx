import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Zap, CheckCircle2, PhoneCall, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';

export interface IntentDetectionAnimationProps {
  onComplete?: () => void;
  className?: string;
}

export const IntentDetectionAnimation: React.FC<IntentDetectionAnimationProps> = ({
  onComplete,
  className = '',
}) => {
  const [stage, setStage] = useState<number>(0);

  const stages = [
    { title: 'Discovering Prospects', detail: 'Scanning public tech stack & job postings...' },
    { title: 'Analyzing Requirements', detail: 'Matching category intent & budget indicators...' },
    { title: 'Buying Signal Detected', detail: 'Urgent hiring post for Head of Sales Ops (48h ago)' },
    { title: 'Intent Score Generated', detail: 'Intent Velocity: 94 / 100 (High Buying Signal)' },
    { title: 'Opportunity Actionable', detail: 'AI Sales Agent script & pitch brief generated.' },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setStage((prev) => {
        if (prev < stages.length - 1) {
          return prev + 1;
        }
        clearInterval(timer);
        if (onComplete) onComplete();
        return prev;
      });
    }, 1200);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div
      className={`bg-surface-0 border border-primary/40 rounded-xl p-6 shadow-xl relative overflow-hidden ${className}`}
    >
      {/* Background Pulse Scan Line */}
      <motion.div
        initial={{ x: '-100%' }}
        animate={{ x: '100%' }}
        transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
        className="absolute top-0 bottom-0 w-24 bg-gradient-to-r from-transparent via-primary/10 to-transparent pointer-events-none"
      />

      <div className="space-y-6 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-signal-high" />
            <h3 className="text-h3 font-semibold text-foreground">Intent Detection Pipeline</h3>
          </div>
          <span className="text-caption font-mono text-signal-high uppercase font-semibold">
            Signature Signal Interaction
          </span>
        </div>

        {/* Horizontal Progress Timeline */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
          {stages.map((s, idx) => {
            const isDone = idx < stage;
            const isCurrent = idx === stage;
            return (
              <div
                key={idx}
                className={`p-3 rounded-lg border text-xs transition-all duration-300 ${
                  isCurrent
                    ? 'bg-primary-muted border-primary text-foreground shadow-glow-blue'
                    : isDone
                    ? 'bg-surface-1 border-signal-qualified/30 text-foreground-secondary'
                    : 'bg-surface-0 border-border-subtle text-foreground-tertiary opacity-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-[10px] text-foreground-tertiary">0{idx + 1}</span>
                  {isDone ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-signal-qualified" />
                  ) : isCurrent ? (
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 1 }}
                      className="w-2 h-2 rounded-full bg-primary"
                    />
                  ) : null}
                </div>
                <div className="font-semibold truncate">{s.title}</div>
              </div>
            );
          })}
        </div>

        {/* Current Active Step Display */}
        <div className="p-4 bg-surface-1 rounded-lg border border-border-subtle flex items-center justify-between gap-4">
          <div>
            <div className="text-caption uppercase text-foreground-tertiary font-semibold">Current State</div>
            <div className="text-body-medium font-semibold text-foreground">{stages[stage].title}</div>
            <div className="text-small text-foreground-secondary">{stages[stage].detail}</div>
          </div>

          {stage === stages.length - 1 ? (
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
              <Button variant="primary" size="md" leftIcon={<PhoneCall className="w-4 h-4" />}>
                Contact Opportunity
              </Button>
            </motion.div>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setStage((prev) => (prev < stages.length - 1 ? prev + 1 : prev))}
            >
              Next Step
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
