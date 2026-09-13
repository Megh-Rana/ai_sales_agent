import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Info } from 'lucide-react';

export interface ScoreFactor {
  label: string;
  points: number;
  color?: string;
}

export interface AnimatedTooltipProps {
  score?: number;
  factors?: ScoreFactor[];
  children?: React.ReactNode;
  title?: string;
  className?: string;
}

const defaultFactors: ScoreFactor[] = [
  { label: 'Requirement Match', points: 30, color: 'text-emerald-400' },
  { label: 'Buying Intent', points: 25, color: 'text-amber-400' },
  { label: 'Urgency & Timing', points: 20, color: 'text-blue-400' },
  { label: 'Company Fit', points: 19, color: 'text-indigo-400' },
];

export const AnimatedTooltip: React.FC<AnimatedTooltipProps> = ({
  score = 94,
  factors = defaultFactors,
  children,
  title = 'AI Intent Score Formula',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className={`relative inline-block ${className}`}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {children || (
        <button
          type="button"
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold hover:bg-amber-500/20 transition-colors cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Intent Score: {score}</span>
          <Info className="w-3 h-3 opacity-60" />
        </button>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 w-64 p-3.5 rounded-xl bg-surface-0 border border-border-default shadow-2xl shadow-black/80 z-50 pointer-events-none"
          >
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-border-subtle">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{title}</span>
              </span>
              <span className="text-xs font-mono font-extrabold text-amber-400">{score}/100</span>
            </div>

            <div className="space-y-1.5">
              {factors.map((factor, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <span className="text-foreground-secondary">{factor.label}</span>
                  <span className={`font-mono font-bold ${factor.color || 'text-emerald-400'}`}>
                    +{factor.points}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 mt-2 border-t border-border-subtle/60 flex items-center justify-between text-[10px] text-foreground-tertiary">
              <span>Vidur Telemetry Engine</span>
              <span className="font-mono text-primary font-bold">Total: {score}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AnimatedTooltip;
