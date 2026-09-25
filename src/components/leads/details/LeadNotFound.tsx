import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchX, ArrowLeft, RefreshCw, Compass } from 'lucide-react';
import { Button } from '../../ui/Button';

export interface LeadNotFoundProps {
  leadId?: string;
  onRetry?: () => void;
}

export const LeadNotFound: React.FC<LeadNotFoundProps> = ({ leadId, onRetry }) => {
  const navigate = useNavigate();

  return (
    <div className="max-w-2xl mx-auto my-12 p-8 sm:p-12 bg-surface-0 border border-border-default rounded-2xl text-center space-y-6 shadow-sm">
      <div className="w-16 h-16 rounded-2xl bg-surface-elevated border border-border-subtle flex items-center justify-center text-foreground-tertiary mx-auto shadow-inner">
        <SearchX className="w-8 h-8 text-signal-high" />
      </div>

      <div className="space-y-2">
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-signal-high">
          Opportunity Not Located
        </span>
        <h1 className="text-h2 font-bold text-foreground">
          Lead Intelligence Dossier Unavailable
        </h1>
        <p className="text-body text-foreground-secondary max-w-md mx-auto leading-relaxed">
          The opportunity identifier <code className="px-1.5 py-0.5 rounded bg-surface-elevated font-mono text-primary text-xs">{leadId || 'unknown'}</code> does not match an active record in your pipeline or discovery stream.
        </p>
      </div>

      <div className="p-4 rounded-xl bg-surface-1/80 border border-border-subtle text-xs text-foreground-secondary text-left space-y-1.5 max-w-md mx-auto">
        <span className="font-semibold text-foreground block">Possible reasons:</span>
        <ul className="list-disc list-inside space-y-1 text-foreground-tertiary">
          <li>The opportunity was archived or merged into an existing enterprise account.</li>
          <li>Real-time intent cache expired and requires re-discovery.</li>
          <li>The link or identifier was entered incorrectly.</li>
        </ul>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <Button
          variant="primary"
          size="md"
          leftIcon={<Compass className="w-4 h-4" />}
          onClick={() => navigate('/leads/opp-101')}
        >
          View Flagship Dossier (Razorpay)
        </Button>

        <Button
          variant="secondary"
          size="md"
          leftIcon={<ArrowLeft className="w-4 h-4" />}
          onClick={() => navigate('/dashboard')}
        >
          Return to Dashboard
        </Button>

        {onRetry && (
          <Button
            variant="ghost"
            size="md"
            leftIcon={<RefreshCw className="w-4 h-4" />}
            onClick={onRetry}
          >
            Retry Telemetry Fetch
          </Button>
        )}
      </div>
    </div>
  );
};
