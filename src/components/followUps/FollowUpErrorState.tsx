import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface FollowUpErrorStateProps {
  onRetry: () => void;
}

export const FollowUpErrorState: React.FC<FollowUpErrorStateProps> = ({ onRetry }) => {
  return (
    <div className="bg-surface-0 border border-border-default rounded-xl p-8 text-center space-y-4 max-w-lg mx-auto shadow-xs">
      <div className="w-12 h-12 rounded-xl bg-signal-high/10 text-signal-high border border-signal-high/30 flex items-center justify-center mx-auto">
        <AlertTriangle className="w-6 h-6" aria-hidden="true" />
      </div>

      <div className="space-y-1">
        <h3 className="text-h3 font-bold text-foreground">Follow-up Telemetry Service Unavailable</h3>
        <p className="text-caption text-foreground-secondary leading-relaxed">
          Could not fetch sequence queue. Check your workspace network connection and try again.
        </p>
      </div>

      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-lg bg-surface-1 hover:bg-surface-hover text-foreground border border-border-default text-caption font-semibold transition-all"
      >
        <RefreshCw className="w-4 h-4" />
        <span>Retry Connection</span>
      </button>
    </div>
  );
};
