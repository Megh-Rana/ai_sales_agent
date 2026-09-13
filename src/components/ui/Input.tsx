import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, rightIcon, className, disabled, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-small text-foreground-secondary font-medium">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 text-foreground-tertiary pointer-events-none shrink-0">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            disabled={disabled}
            className={twMerge(
              clsx(
                'w-full bg-surface text-foreground text-body rounded-md border border-border-strong px-3 py-2 transition-colors placeholder:text-foreground-tertiary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed',
                leftIcon && 'pl-9',
                rightIcon && 'pr-9',
                error && 'border-danger focus:border-danger focus:ring-danger',
                className
              )
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 text-foreground-tertiary shrink-0">{rightIcon}</div>
          )}
        </div>
        {error && <p className="text-small text-danger">{error}</p>}
        {!error && helperText && <p className="text-caption">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
