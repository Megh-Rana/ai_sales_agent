import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface OpportunityErrorStateProps {
  onRetry: () => void;
  message?: string;
}

export const OpportunityErrorState: React.FC<OpportunityErrorStateProps> = ({
  onRetry,
  message = "Couldn't load live opportunities.",
}) => {
  return (
    <div className="p-8 text-center rounded-xl bg-surface-0 border border-red-500/30 space-y-4 my-6 max-w-lg mx-auto">
      <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto text-red-400">
        <AlertTriangle className="w-5 h-5" />
      </div>

      <div className="space-y-1">
        <h3 className="text-h4 font-bold text-foreground">{message}</h3>
        <p className="text-small text-foreground-tertiary">
          Something went wrong while refreshing signals. Standard activity feeds remain available.
        </p>
      </div>

      <button
        type="button"
        onClick={onRetry}
        className="px-4 py-2 text-xs font-semibold text-foreground bg-surface-1 border border-border-subtle hover:bg-surface-hover rounded-lg transition-colors inline-flex items-center gap-2"
      >
        <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
        <span>Try Again</span>
      </button>
    </div>
  );
};
