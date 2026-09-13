import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export type BadgeVariant =
  | 'high-intent'
  | 'qualified'
  | 'urgent'
  | 'calling'
  | 'follow-up'
  | 'new'
  | 'completed'
  | 'discovered'
  | 'neutral'
  | 'info';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  pulse?: boolean;
  leftDot?: boolean;
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  pulse = false,
  leftDot = false,
  children,
  className,
  ...props
}) => {
  const variantStyles: Record<BadgeVariant, { bg: string; text: string; border: string; dot: string }> = {
    'high-intent': {
      bg: 'bg-signal-high-muted',
      text: 'text-signal-high',
      border: 'border-signal-high/30',
      dot: 'bg-signal-high',
    },
    qualified: {
      bg: 'bg-signal-qualified-muted',
      text: 'text-signal-qualified',
      border: 'border-signal-qualified/30',
      dot: 'bg-signal-qualified',
    },
    urgent: {
      bg: 'bg-signal-urgent-muted',
      text: 'text-signal-urgent',
      border: 'border-signal-urgent/30',
      dot: 'bg-signal-urgent',
    },
    calling: {
      bg: 'bg-primary-muted',
      text: 'text-primary',
      border: 'border-primary/40',
      dot: 'bg-primary',
    },
    'follow-up': {
      bg: 'bg-info-muted',
      text: 'text-info',
      border: 'border-info/40',
      dot: 'bg-info',
    },
    new: {
      bg: 'bg-primary-muted',
      text: 'text-primary',
      border: 'border-primary/40',
      dot: 'bg-primary',
    },
    completed: {
      bg: 'bg-surface-elevated',
      text: 'text-foreground-secondary',
      border: 'border-border-strong',
      dot: 'bg-foreground-tertiary',
    },
    discovered: {
      bg: 'bg-surface-elevated',
      text: 'text-foreground-secondary',
      border: 'border-border-strong',
      dot: 'bg-foreground-tertiary',
    },
    neutral: {
      bg: 'bg-surface-elevated',
      text: 'text-foreground-secondary',
      border: 'border-border-strong',
      dot: 'bg-foreground-tertiary',
    },
    info: {
      bg: 'bg-info-muted',
      text: 'text-info',
      border: 'border-info/40',
      dot: 'bg-info',
    },
  };

  const current = variantStyles[variant];

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center gap-1.5 px-2 py-0.5 text-small font-medium rounded border uppercase tracking-wider select-none',
          current.bg,
          current.text,
          current.border,
          className
        )
      )}
      {...props}
    >
      {(leftDot || pulse) && (
        <span className="relative flex h-1.5 w-1.5 shrink-0">
          {pulse && (
            <span
              className={clsx(
                'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
                current.dot
              )}
            />
          )}
          <span className={clsx('relative inline-flex rounded-full h-1.5 w-1.5', current.dot)} />
        </span>
      )}
      {children}
    </span>
  );
};
