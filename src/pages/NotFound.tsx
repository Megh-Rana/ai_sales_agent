import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Compass, Search } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const NotFound: React.FC = () => {
  const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);

  return (
    <div className="bg-surface-0 border border-border-default rounded-xl p-8 sm:p-14 text-center max-w-lg mx-auto my-12 space-y-6 shadow-xl">
      <div className="w-16 h-16 rounded-full bg-surface-1 border border-border-subtle flex items-center justify-center text-foreground-tertiary mx-auto shadow-inner">
        <Compass className="w-8 h-8 text-signal-high" />
      </div>

      <div className="space-y-2">
        <span className="text-caption font-mono uppercase font-bold text-signal-high bg-signal-high-muted px-2.5 py-1 rounded border border-signal-high/30">
          404 Pipeline Endpoint Unmapped
        </span>
        <h1 className="text-h1 font-bold text-foreground tracking-tight">That page isn't in your pipeline.</h1>
        <p className="text-body text-foreground-secondary leading-relaxed">
          The opportunity account, cadence, or endpoint you are looking for may have moved, been archived, or does not exist.
        </p>
      </div>

      <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
        <Link to="/dashboard">
          <Button variant="primary" size="md" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to Dashboard
          </Button>
        </Link>
        <Link to="/leads">
          <Button variant="secondary" size="md">
            View Active Leads
          </Button>
        </Link>
      </div>
    </div>
  );
};
