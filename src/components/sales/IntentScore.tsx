import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Zap, CheckCircle2 } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { IntentLevel } from '../../types/sales';
import { Badge } from '../ui/Badge';

export interface IntentScoreProps {
  score: number;
  level?: IntentLevel;
  reasoning?: string[];
  expandable?: boolean;
  showDetailsDefault?: boolean;
  className?: string;
}

export const IntentScore: React.FC<IntentScoreProps> = ({
  score,
  level = score >= 80 ? 'high' : score >= 50 ? 'medium' : 'low',
  reasoning = [
    'Requirement posted on public job board (48h ago)',
    'Strong category fit: Outbound AI Automation',
    'Decision timeline detected within 14 days',
  ],
  expandable = true,
  showDetailsDefault = false,
  className,
}) => {
  const [isExpanded, setIsExpanded] = useState(showDetailsDefault);

  const getLevelConfig = () => {
    if (level === 'high') {
      return {
        label: 'High Intent',
        color: 'text-signal-high',
        bgColor: 'bg-signal-high',
        badgeVariant: 'high-intent' as const,
        borderColor: 'border-signal-high/30',
        glowShadow: 'shadow-glow-amber',
      };
    }
    if (level === 'medium') {
      return {
        label: 'Moderate Intent',
        color: 'text-info',
        bgColor: 'bg-info',
        badgeVariant: 'info' as const,
        borderColor: 'border-info/30',
        glowShadow: 'shadow-none',
      };
    }
    return {
      label: 'Low Intent',
      color: 'text-foreground-tertiary',
      bgColor: 'bg-foreground-tertiary',
      badgeVariant: 'neutral' as const,
      borderColor: 'border-border-default',
      glowShadow: 'shadow-none',
    };
  };

  const config = getLevelConfig();

  if (!expandable) {
    return (
      <div
        className={twMerge(
          clsx(
            'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-elevated border shrink-0 shadow-xs select-none',
            config.borderColor,
            className
          )
        )}
      >
        <Zap className={clsx('w-3.5 h-3.5 fill-current shrink-0', config.color)} />
        <span className={clsx('text-xs font-bold font-mono', config.color)}>{score}</span>
        <span className="text-[10px] text-foreground-tertiary font-sans font-semibold uppercase tracking-wider hidden xs:inline sm:inline">
          INTENT
        </span>
      </div>
    );
  }

  return (
    <div
      className={twMerge(
        clsx(
          'bg-surface border rounded-xl p-4 transition-all duration-200',
          config.borderColor,
          isExpanded && 'bg-surface-elevated',
          className
        )
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Score Badge Radial/Circle */}
          <div className="relative flex items-center justify-center shrink-0">
            <div className="w-12 h-12 rounded-lg bg-surface-elevated flex items-center justify-center border border-border-strong">
              <span className={clsx('text-h2 font-bold font-mono', config.color)}>{score}</span>
            </div>
            <div className="absolute -top-1 -right-1 bg-surface rounded-full p-0.5 border border-border">
              <Zap className={clsx('w-3 h-3 fill-current', config.color)} />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-caption uppercase font-semibold tracking-wider text-foreground-tertiary">
                Intent Score
              </span>
              <Badge variant={config.badgeVariant} pulse={level === 'high'}>
                {config.label}
              </Badge>
            </div>

            {/* Visual Progress Bar */}
            <div className="w-36 sm:w-44 h-1.5 bg-surface-elevated rounded-full mt-2 overflow-hidden border border-border">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${score}%` }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className={clsx('h-full rounded-full', config.bgColor)}
              />
            </div>
          </div>
        </div>

        {expandable && reasoning.length > 0 && (
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-xs text-foreground-secondary hover:text-foreground px-2 py-1 rounded bg-surface-elevated hover:bg-surface-hover border border-border transition-colors"
          >
            <span>Why now?</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>

      {/* Expandable Reasoning Breakdown */}
      <AnimatePresence>
        {isExpanded && reasoning.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden mt-3 pt-3 border-t border-border-subtle"
          >
            <p className="text-caption font-medium uppercase text-foreground-tertiary mb-2">
              Buying Signal Provenance
            </p>
            <ul className="space-y-1.5">
              {reasoning.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-small text-foreground-secondary">
                  <CheckCircle2 className={clsx('w-3.5 h-3.5 mt-0.5 shrink-0', config.color)} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
