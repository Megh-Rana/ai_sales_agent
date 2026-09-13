import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { buttonMotion } from '../../motion/presets';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'icon';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed select-none';

    const sizeStyles: Record<ButtonSize, string> = {
      sm: 'px-3 py-1.5 text-xs gap-1.5',
      md: 'px-4 py-2 text-body-medium gap-2',
      lg: 'px-5 py-2.5 text-body-medium gap-2.5',
    };

    const variantStyles: Record<ButtonVariant, string> = {
      primary: 'bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-active shadow-sm font-semibold',
      secondary:
        'bg-surface-elevated text-foreground hover:bg-surface-hover border border-border-strong shadow-xs',
      ghost: 'bg-transparent text-foreground-secondary hover:text-foreground hover:bg-surface-hover',
      danger: 'bg-danger text-danger-foreground hover:bg-red-600 shadow-sm font-semibold',
      success: 'bg-success text-success-foreground hover:bg-emerald-600 shadow-sm font-semibold',
      icon: 'p-2 bg-transparent text-foreground-secondary hover:text-foreground hover:bg-surface-hover rounded-md',
    };

    const isIconOnly = variant === 'icon';

    return (
      <motion.button
        ref={ref}
        {...buttonMotion}
        disabled={disabled || isLoading}
        className={twMerge(
          clsx(
            baseStyles,
            !isIconOnly && sizeStyles[size],
            variantStyles[variant],
            className
          )
        )}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-current shrink-0" />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        {children && <span>{children}</span>}
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
