import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from '../ui/Button';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Couldn't complete discovery.",
  message = "We encountered a temporary error while scanning buying signals. No account data was lost.",
  onRetry,
  className = '',
}) => {
  return (
    <div
      className={`p-6 bg-surface-0 border border-danger/40 rounded-xl flex flex-col items-center text-center max-w-md mx-auto my-4 ${className}`}
    >
      <div className="w-12 h-12 rounded-full bg-signal-urgent-muted text-signal-urgent flex items-center justify-center mb-3">
        <AlertTriangle className="w-6 h-6" />
      </div>

      <h4 className="text-h4 font-bold text-foreground mb-1">{title}</h4>
      <p className="text-body text-foreground-secondary mb-4">{message}</p>

      {onRetry && (
        <Button variant="secondary" size="sm" leftIcon={<RotateCcw className="w-3.5 h-3.5" />} onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
};
