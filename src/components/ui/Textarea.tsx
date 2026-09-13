import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, className, id, rows = 3, ...props }, ref) => {
    const areaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={areaId} className="text-small text-foreground-secondary font-medium">
            {label}
          </label>
        )}
        <textarea
          id={areaId}
          ref={ref}
          rows={rows}
          className={twMerge(
            clsx(
              'w-full bg-surface text-foreground text-body rounded-md border border-border-strong px-3 py-2 transition-colors placeholder:text-foreground-tertiary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed resize-y',
              error && 'border-danger focus:border-danger focus:ring-danger',
              className
            )
          )}
          {...props}
        />
        {error && <p className="text-small text-danger">{error}</p>}
        {!error && helperText && <p className="text-caption">{helperText}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
