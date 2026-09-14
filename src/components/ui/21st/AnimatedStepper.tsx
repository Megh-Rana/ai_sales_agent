import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

export interface StepItem {
  id: string;
  label: string;
  sublabel?: string;
}

export interface AnimatedStepperProps {
  steps: StepItem[];
  currentStepIndex: number;
  onStepClick?: (index: number) => void;
  className?: string;
}

export const AnimatedStepper: React.FC<AnimatedStepperProps> = ({
  steps,
  currentStepIndex,
  onStepClick,
  className = '',
}) => {
  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-start justify-between relative">
        {/* Background Line centered on 32px circles (top-4 = 16px) */}
        <div className="absolute top-4 left-4 right-4 h-0.5 bg-border-subtle -translate-y-1/2 z-0" />

        {/* Animated Active Line Fill */}
        <motion.div
          className="absolute top-4 left-4 h-0.5 bg-primary -translate-y-1/2 z-0"
          initial={{ width: '0%' }}
          animate={{
            width: `${(currentStepIndex / Math.max(1, steps.length - 1)) * 100}%`,
          }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
        />

        {steps.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;

          return (
            <div
              key={step.id || index}
              onClick={() => onStepClick && onStepClick(index)}
              className={`relative z-10 flex flex-col items-center group ${
                onStepClick ? 'cursor-pointer' : ''
              }`}
            >
              <motion.div
                initial={false}
                animate={{
                  scale: isCurrent ? 1.15 : 1,
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono font-bold border transition-colors ${
                  isCompleted
                    ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm'
                    : isCurrent
                    ? 'bg-primary text-white border-primary ring-4 ring-primary/20 shadow-md'
                    : 'bg-surface-0 text-foreground-tertiary border-border-default'
                }`}
              >
                {isCompleted ? <Check className="w-4 h-4 text-white" /> : index + 1}
              </motion.div>
              <span
                className={`mt-2 text-[11px] font-mono uppercase tracking-wider font-semibold truncate max-w-[90px] text-center ${
                  isCurrent
                    ? 'text-primary'
                    : isCompleted
                    ? 'text-foreground font-medium'
                    : 'text-foreground-tertiary'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AnimatedStepper;
