import React from 'react';
import { Target, Plus, RefreshCw, Layers } from 'lucide-react';

interface CampaignHeaderProps {
  activeCount: number;
  totalPipelineValue: string;
  onOpenCreateModal: () => void;
  viewState: 'normal' | 'loading' | 'empty' | 'error';
  onViewStateChange: (state: 'normal' | 'loading' | 'empty' | 'error') => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const CampaignHeader: React.FC<CampaignHeaderProps> = ({
  activeCount,
  totalPipelineValue,
  onOpenCreateModal,
  viewState,
  onViewStateChange,
  onRefresh,
  isRefreshing = false,
}) => {
  return (
    <header className="bg-surface-0 border border-border-default rounded-xl p-5 md:p-6 shadow-xs mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Title & Subtitle */}
        <div className="space-y-1">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-primary-muted text-primary border border-primary/30">
              <Target className="w-5 h-5" aria-hidden="true" />
            </div>
            <h1 className="text-h2 font-bold text-foreground tracking-tight">
              Outreach Cadences & Campaigns
            </h1>
            <span className="px-2.5 py-0.5 text-caption font-semibold rounded-full bg-signal-qualified/10 text-signal-qualified border border-signal-qualified/30">
              {activeCount} Active Cadences
            </span>
          </div>
          <p className="text-small text-foreground-secondary font-normal pl-0.5">
            Turn high-intent discovered leads into structured, multi-touch sales campaigns.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Pipeline Value Badge */}
          <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-surface-1 border border-border-subtle text-caption font-mono">
            <span className="text-foreground-tertiary">Pipeline Value:</span>
            <span className="text-foreground font-bold">{totalPipelineValue}</span>
          </div>

          {/* Demo State Switcher Toggle */}
          <div className="hidden xl:flex items-center space-x-1 bg-surface-1 border border-border-subtle rounded-lg p-1 text-caption">
            <span className="px-2 text-foreground-tertiary text-[11px] font-semibold uppercase tracking-wider">
              State:
            </span>
            {(['normal', 'loading', 'empty', 'error'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => onViewStateChange(st)}
                aria-pressed={viewState === st}
                className={`px-2.5 py-1 rounded capitalize transition-colors ${
                  viewState === st
                    ? 'bg-surface-elevated text-foreground font-semibold border border-border-subtle'
                    : 'text-foreground-tertiary hover:text-foreground-secondary'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Refresh Button */}
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              aria-label="Refresh Campaign Dashboard"
              className="p-2.5 rounded-lg bg-surface-1 hover:bg-surface-hover text-foreground-tertiary hover:text-foreground border border-border-default transition-all disabled:opacity-50 focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <RefreshCw
                className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-primary' : ''}`}
                aria-hidden="true"
              />
            </button>
          )}

          {/* Primary Create Campaign Button */}
          <button
            type="button"
            onClick={onOpenCreateModal}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-primary-foreground font-semibold text-caption transition-all shadow-xs focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span>Create Campaign</span>
          </button>
        </div>
      </div>
    </header>
  );
};
