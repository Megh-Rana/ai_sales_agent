import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { AIState } from '../../types/sales';
import { Bot, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export interface AIStatusProps {
  state: AIState;
  customText?: string;
  className?: string;
}

export const AIStatus: React.FC<AIStatusProps> = ({ state, customText, className }) => {
  const stateConfig: Record<AIState, { label: string; dotColor: string; isLoading: boolean }> = {
    idle: { label: 'AI Agent Ready', dotColor: 'bg-foreground-tertiary', isLoading: false },
    discovering: { label: 'Discovering buying signals...', dotColor: 'bg-signal-high', isLoading: true },
    analyzing: { label: 'Analyzing requirements...', dotColor: 'bg-signal-high', isLoading: true },
    enriching: { label: 'Enriching account intelligence...', dotColor: 'bg-primary-hover', isLoading: true },
    generating: { label: 'Generating recommended pitch...', dotColor: 'bg-primary-hover', isLoading: true },
    calling: { label: 'AI Agent Dialing Prospect...', dotColor: 'bg-primary-hover', isLoading: true },
    listening: { label: 'Listening to prospect response...', dotColor: 'bg-signal-qualified', isLoading: true },
    thinking: { label: 'Formulating objection response...', dotColor: 'bg-signal-high', isLoading: true },
    responding: { label: 'AI Agent Responding...', dotColor: 'bg-primary-hover', isLoading: true },
    completed: { label: 'Sales Intelligence Synthesized', dotColor: 'bg-signal-qualified', isLoading: false },
    error: { label: 'Intelligence Scan Failed', dotColor: 'bg-signal-urgent', isLoading: false },
  };

  const config = stateConfig[state] || stateConfig.idle;
  const displayText = customText || config.label;

  return (
    <div
      className={twMerge(
        clsx(
          'inline-flex items-center gap-2 px-3 py-1.5 bg-surface-1 border border-border-subtle rounded-md text-xs text-foreground-secondary font-medium select-none',
          className
        )
      )}
    >
      {config.isLoading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin text-primary shrink-0" />
      ) : state === 'completed' ? (
        <CheckCircle2 className="w-3.5 h-3.5 text-signal-qualified shrink-0" />
      ) : state === 'error' ? (
        <AlertCircle className="w-3.5 h-3.5 text-signal-urgent shrink-0" />
      ) : (
        <span className="relative flex h-2 w-2 shrink-0">
          <span className={clsx('relative inline-flex rounded-full h-2 w-2', config.dotColor)} />
        </span>
      )}
      <span className="text-foreground">{displayText}</span>
    </div>
  );
};
