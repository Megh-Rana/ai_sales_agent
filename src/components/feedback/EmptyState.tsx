import React from 'react';
import { SearchX, Plus, RefreshCw } from 'lucide-react';
import { Button } from '../ui/Button';

export interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'NO ACTIVE OPPORTUNITIES',
  description = "Your AI sales agent hasn't detected any high-intent prospects matching this criteria yet.",
  actionLabel = 'Discover Opportunities',
  onAction,
  icon,
  className = '',
}) => {
  return (
    <div
      className={`bg-surface-0 border border-border-default rounded-xl p-8 sm:p-12 text-center flex flex-col items-center justify-center max-w-md mx-auto my-6 ${className}`}
    >
      <div className="w-14 h-14 rounded-full bg-surface-1 border border-border-subtle flex items-center justify-center text-foreground-tertiary mb-4 shadow-inner">
        {icon || <SearchX className="w-6 h-6 text-foreground-tertiary" />}
      </div>

      <h3 className="text-h4 font-bold text-foreground tracking-wider uppercase mb-1.5">{title}</h3>

      <p className="text-body text-foreground-secondary mb-6 leading-relaxed">{description}</p>

      {onAction && (
        <Button variant="primary" size="md" leftIcon={<RefreshCw className="w-4 h-4" />} onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
