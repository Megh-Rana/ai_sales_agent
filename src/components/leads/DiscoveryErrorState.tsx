import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '../ui/Button';

interface DiscoveryErrorStateProps {
  errorMessage?: string;
  onRetry: () => void;
}

export const DiscoveryErrorState: React.FC<DiscoveryErrorStateProps> = ({
  errorMessage = 'Telemetry signal ingestion interrupted. Unable to sync live commercial streams.',
  onRetry
}) => {
  return (
    <div className="rounded-xl border border-rose-500/30 bg-rose-950/20 p-8 sm:p-10 text-center max-w-xl mx-auto space-y-5">
      <div className="w-12 h-12 rounded-2xl bg-rose-900/40 border border-rose-500/40 flex items-center justify-center mx-auto text-rose-400">
        <AlertTriangle className="w-6 h-6" />
      </div>

      <div className="space-y-1.5">
        <h3 className="text-base font-bold text-rose-200">
          Telemetry Stream Disruption
        </h3>
        <p className="text-xs text-rose-300/80 leading-relaxed">
          {errorMessage}
        </p>
      </div>

      <div className="pt-2">
        <Button
          variant="secondary"
          onClick={onRetry}
          className="inline-flex items-center gap-2 text-xs border-rose-800 text-rose-200 hover:bg-rose-900/30"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Discovery Stream</span>
        </Button>
      </div>
    </div>
  );
};
