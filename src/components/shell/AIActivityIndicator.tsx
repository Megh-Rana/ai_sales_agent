import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, CheckCircle2, ChevronDown, Radio, ShieldCheck, Zap } from 'lucide-react';
import { AIActivityState } from '../../services/mockShellData';

export interface AIActivityIndicatorProps {
  initialState?: AIActivityState;
}

export const AIActivityIndicator: React.FC<AIActivityIndicatorProps> = ({
  initialState = 'discovering',
}) => {
  const [currentState, setCurrentState] = useState<AIActivityState>(initialState);
  const [isOpen, setIsOpen] = useState(false);

  const getStateConfig = (st: AIActivityState) => {
    switch (st) {
      case 'discovering':
        return {
          label: 'AI discovering leads...',
          color: 'bg-signal-high',
          pulseColor: 'bg-signal-high',
          isActive: true,
        };
      case 'analyzing':
        return {
          label: 'AI analyzing...',
          color: 'bg-signal-high',
          pulseColor: 'bg-signal-high',
          isActive: true,
        };
      case 'processing-call':
        return {
          label: 'AI processing call...',
          color: 'bg-primary',
          pulseColor: 'bg-primary',
          isActive: true,
        };
      case 'preparing-followup':
        return {
          label: 'AI preparing follow-up...',
          color: 'bg-signal-high',
          pulseColor: 'bg-signal-high',
          isActive: true,
        };
      case 'idle':
      default:
        return {
          label: 'AI ready',
          color: 'bg-foreground-tertiary',
          pulseColor: 'bg-foreground-tertiary',
          isActive: false,
        };
    }
  };

  const currentConfig = getStateConfig(currentState);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="hidden md:flex items-center gap-2 px-2.5 py-1 bg-surface-1 hover:bg-surface-elevated border border-border-subtle hover:border-border-default rounded-full text-xs text-foreground-secondary transition-colors select-none"
        title="Autonomous Sales Agent Status"
        aria-label="Toggle AI Agent Status"
      >
        <span className="relative flex h-2 w-2 shrink-0">
          {currentConfig.isActive ? (
            <>
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${currentConfig.pulseColor}`}
              />
              <span className={`relative inline-flex rounded-full h-2 w-2 ${currentConfig.color}`} />
            </>
          ) : (
            <span className={`relative inline-flex rounded-full h-2 w-2 ${currentConfig.color}`} />
          )}
        </span>
        <span className="font-medium text-foreground tracking-tight">{currentConfig.label}</span>
        <ChevronDown className="w-3 h-3 text-foreground-tertiary" />
      </button>

      {/* Autonomous Agent Telemetry Popover */}
      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 z-50 w-80 bg-surface-0 border border-border-default rounded-xl shadow-2xl p-3.5 space-y-3"
            >
              <div className="flex items-center justify-between border-b border-border-subtle pb-2.5">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-primary" />
                  <span className="text-body font-semibold text-foreground">AI Sales Agent Status</span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface-1 text-foreground-tertiary border border-border-subtle">
                  Autonomous
                </span>
              </div>

              {/* Agent Streams */}
              <div className="space-y-2 text-xs">
                <div className="p-2 rounded-lg bg-surface-1 border border-border-subtle flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-signal-high mt-1 shrink-0 animate-pulse" />
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-foreground">Intent Signal Engine</div>
                    <div className="text-caption text-foreground-secondary">
                      Scanning 42 web feeds & hiring triggers for buying signals.
                    </div>
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-surface-1 border border-border-subtle flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-signal-qualified mt-1 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-foreground">Voice Calling Agent</div>
                    <div className="text-caption text-foreground-secondary">
                      Telephony gateway connected · 1 call completed today.
                    </div>
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-surface-1 border border-border-subtle flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-signal-qualified mt-1 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-foreground">Cadence Follow-Up Engine</div>
                    <div className="text-caption text-foreground-secondary">
                      12 follow-ups queued · Next dispatch in 30 minutes.
                    </div>
                  </div>
                </div>
              </div>

              {/* State Simulation Selector for Verification */}
              <div className="pt-2 border-t border-border-subtle">
                <div className="text-[10px] font-mono uppercase text-foreground-tertiary mb-1.5 font-semibold">
                  Simulate Agent Activity State
                </div>
                <div className="grid grid-cols-2 gap-1 text-[11px]">
                  {(['idle', 'discovering', 'analyzing', 'processing-call', 'preparing-followup'] as AIActivityState[]).map(
                    (st) => (
                      <button
                        key={st}
                        onClick={() => setCurrentState(st)}
                        className={`px-2 py-1 rounded text-left truncate transition-colors ${
                          currentState === st
                            ? 'bg-primary-muted text-primary font-semibold border border-primary/30'
                            : 'text-foreground-secondary hover:text-foreground hover:bg-surface-hover'
                        }`}
                      >
                        {st === 'idle' && 'AI ready'}
                        {st === 'discovering' && 'Discovering...'}
                        {st === 'analyzing' && 'Analyzing...'}
                        {st === 'processing-call' && 'Calling...'}
                        {st === 'preparing-followup' && 'Follow-up...'}
                      </button>
                    )
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
