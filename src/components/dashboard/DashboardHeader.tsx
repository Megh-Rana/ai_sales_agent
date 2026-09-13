import React from 'react';
import { Compass, RefreshCw, Zap, SlidersHorizontal } from 'lucide-react';
import { Button } from '../ui/Button';
import { useNavigate } from 'react-router-dom';

export interface DashboardHeaderProps {
  workspaceName: string;
  division: string;
  shiftBriefing: string;
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  onInstantScan?: () => void;
  isScanning?: boolean;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  workspaceName,
  division,
  shiftBriefing,
  activeFilter,
  onFilterChange,
  onInstantScan,
  isScanning = false,
}) => {
  const navigate = useNavigate();

  const filterOptions = [
    { id: 'all', label: 'All High Intent' },
    { id: 'call-ready', label: 'Call Ready' },
    { id: 'needs-followup', label: 'Follow-ups Due' },
  ];

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-border-subtle">
      {/* Left: Operational Context & Morning Briefing */}
      <div className="space-y-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-h1 font-bold text-foreground tracking-tight">Sales Workspace</h1>
          <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-primary-muted text-primary border border-primary/30">
            {workspaceName} · {division}
          </span>
        </div>
        <p className="text-body text-foreground-secondary flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-signal-high shrink-0 animate-pulse" />
          <span className="truncate">{shiftBriefing}</span>
        </p>
      </div>

      {/* Right: Filter Segment + Action */}
      <div className="flex flex-wrap items-center gap-2.5 shrink-0">
        {/* Quick Filter Segmented Control */}
        <div className="flex items-center p-1 bg-surface-1 rounded-lg border border-border-subtle text-xs">
          {filterOptions.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => onFilterChange(opt.id)}
              className={`px-3 py-1.5 rounded-md font-medium transition-all select-none ${
                activeFilter === opt.id
                  ? 'bg-surface-elevated text-foreground font-semibold shadow-xs'
                  : 'text-foreground-secondary hover:text-foreground'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Instant Scan CTA */}
        <Button
          variant="secondary"
          size="sm"
          onClick={onInstantScan || (() => navigate('/leads/discover'))}
          isLoading={isScanning}
          leftIcon={<Compass className="w-3.5 h-3.5 text-signal-high" />}
        >
          Scan Buying Signals
        </Button>
      </div>
    </div>
  );
};
