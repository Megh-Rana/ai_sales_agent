import React from 'react';
import { Check } from 'lucide-react';
import { ONBOARDING_STEPS } from '../../data/mockOnboarding';
import { OnboardingStepId } from '../../types/onboarding';

export interface OnboardingProgressProps {
  currentStep: OnboardingStepId;
  maxStepReached: OnboardingStepId;
  onSelectStep: (step: OnboardingStepId) => void;
  className?: string;
}

export const OnboardingProgress: React.FC<OnboardingProgressProps> = ({
  currentStep,
  maxStepReached,
  onSelectStep,
  className = '',
}) => {
  const currentStepMeta = ONBOARDING_STEPS.find((s) => s.id === currentStep) || ONBOARDING_STEPS[0];
  const progressPercent = Math.round(((currentStep - 1) / (ONBOARDING_STEPS.length - 1)) * 100);

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Top Meta Bar */}
      <div className="flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold text-primary bg-primary-muted px-2 py-0.5 rounded border border-primary/30 text-[11px]">
            Step {currentStep} of {ONBOARDING_STEPS.length}
          </span>
          <span className="font-semibold text-foreground truncate">{currentStepMeta.name}</span>
        </div>

        <div className="flex items-center gap-2 font-mono text-[11px] text-foreground-tertiary">
          <span>{progressPercent}% Calibrated</span>
        </div>
      </div>

      {/* Linear Track */}
      <div className="relative w-full h-1.5 bg-surface-1 rounded-full overflow-hidden border border-border-subtle">
        <div
          className="h-full bg-primary transition-all duration-300 ease-out rounded-full"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Step Dots & Labels (Desktop / Tablet) */}
      <nav aria-label="Onboarding Progress" className="hidden sm:grid grid-cols-9 gap-1.5 pt-1">
        {ONBOARDING_STEPS.map((step) => {
          const isCurrent = step.id === currentStep;
          const isCompleted = step.id < currentStep;
          const isClickable = step.id <= maxStepReached;

          return (
            <button
              key={step.id}
              type="button"
              disabled={!isClickable}
              onClick={() => onSelectStep(step.id)}
              className={`group flex flex-col items-center gap-1.5 p-1 rounded transition-colors text-center focus:outline-none focus-visible:ring-1 focus-visible:ring-primary ${
                isClickable ? 'cursor-pointer' : 'cursor-not-allowed opacity-40'
              }`}
              title={`${step.name}${isCompleted ? ' (Completed)' : isCurrent ? ' (Current)' : ''}`}
            >
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold transition-all ${
                  isCurrent
                    ? 'bg-primary text-primary-foreground ring-2 ring-primary/40 shadow-xs'
                    : isCompleted
                    ? 'bg-signal-qualified text-background'
                    : 'bg-surface-elevated text-foreground-tertiary border border-border-subtle group-hover:border-border-default'
                }`}
              >
                {isCompleted ? <Check className="w-3 h-3" /> : step.id}
              </div>

              <span
                className={`text-[10px] font-medium truncate max-w-[70px] ${
                  isCurrent
                    ? 'text-foreground font-semibold'
                    : isCompleted
                    ? 'text-foreground-secondary'
                    : 'text-foreground-tertiary'
                }`}
              >
                {step.shortLabel}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
