import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, Sparkles } from 'lucide-react';

export interface AIProcessingProps {
  label?: string;
  sublabel?: string;
  progress?: number;
  className?: string;
}

export const AIProcessing: React.FC<AIProcessingProps> = ({
  label = 'Analyzing buying signals...',
  sublabel = 'Scanning public job postings, funding feeds, and tech stack telemetry',
  progress,
  className = '',
}) => {
  return (
    <div className={`p-5 bg-surface-1 border border-border-default rounded-xl space-y-3 ${className}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary-muted flex items-center justify-center border border-primary/30">
            <Loader2 className="w-4 h-4 text-primary animate-spin" />
          </div>
          <div>
            <h4 className="text-body font-semibold text-foreground">{label}</h4>
            <p className="text-caption text-foreground-tertiary">{sublabel}</p>
          </div>
        </div>

        {typeof progress === 'number' && (
          <span className="font-mono text-body font-bold text-primary">{Math.round(progress)}%</span>
        )}
      </div>

      {typeof progress === 'number' && (
        <div className="w-full h-1.5 bg-surface-elevated rounded-full overflow-hidden border border-border-subtle">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
            className="h-full bg-primary rounded-full"
          />
        </div>
      )}
    </div>
  );
};
