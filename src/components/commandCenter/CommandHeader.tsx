import React from 'react';
import { ShieldAlert, RefreshCw, Radar, Sparkles, Layers, Activity } from 'lucide-react';
import { RevenueMetricSnapshot } from '../../types/commandCenter';

interface CommandHeaderProps {
  metrics: RevenueMetricSnapshot;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const CommandHeader: React.FC<CommandHeaderProps> = ({
  metrics,
  onRefresh,
  isRefreshing,
}) => {
  return (
    <div className="bg-surface-0 border-b border-border-default px-6 py-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-semibold">
              Vidur Sales Operating System
            </span>
          </div>

          <h1 className="text-h2 font-bold text-foreground tracking-tight flex items-center gap-3">
            <span>Revenue Command Center</span>
            <span className="text-sm font-mono font-medium px-2.5 py-0.5 rounded-full bg-surface-1 border border-border-subtle text-foreground-secondary">
              Live Orchestration
            </span>
          </h1>

          <p className="text-small text-foreground-tertiary mt-0.5 flex items-center gap-2">
            <span className="text-amber-400 font-semibold">{(metrics?.urgentActionCount || 0)} priority actions require focus</span>
            <span className="text-border-subtle">•</span>
            <span>{metrics?.activePipelineValue || '₹0'} active pipeline value</span>
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-foreground bg-surface-1 border border-border-subtle hover:bg-surface-hover rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
            title="Refresh signal stream & revenue progress"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
            <span>{isRefreshing ? 'Refreshing Telemetry...' : 'Refresh Telemetry'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
