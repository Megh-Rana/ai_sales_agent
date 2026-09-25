import { Compass, Flame, PhoneCall, CalendarCheck } from 'lucide-react';
import { Button } from '../ui/Button';
import { useNavigate } from 'react-router-dom';
import { AnimatedBadge } from '../ui/21st';
import { useI18n } from '../../i18n/i18nContext';

export interface DashboardFilterCounts {
  all: number;
  callReady: number;
  followup: number;
}

export interface DashboardHeaderProps {
  workspaceName: string;
  division: string;
  shiftBriefing: string;
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  counts?: DashboardFilterCounts;
  onInstantScan?: () => void;
  isScanning?: boolean;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  workspaceName,
  division,
  shiftBriefing,
  activeFilter,
  onFilterChange,
  counts,
  onInstantScan,
  isScanning = false,
}) => {
  const navigate = useNavigate();
  const { t } = useI18n();

  const filterOptions = [
    {
      id: 'all',
      label: t.dashboard?.filterAll || 'All High Intent',
      count: counts?.all,
      icon: Flame,
      color: 'text-signal-high',
    },
    {
      id: 'call-ready',
      label: t.dashboard?.filterCallReady || 'Call Ready',
      count: counts?.callReady,
      icon: PhoneCall,
      color: 'text-primary',
    },
    {
      id: 'needs-followup',
      label: t.dashboard?.filterFollowup || 'Follow-ups Due',
      count: counts?.followup,
      icon: CalendarCheck,
      color: 'text-info',
    },
  ];

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-border-subtle">
      {/* Left: Operational Context & Morning Briefing */}
      <div className="space-y-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-h1 font-bold text-foreground tracking-tight">{t.dashboard?.title || 'Sales Workspace'}</h1>
          <AnimatedBadge label={`${workspaceName} · ${division}`} variant="hot" />
        </div>
        <p className="text-body text-foreground-secondary flex items-center gap-2">
          <span className="truncate">{shiftBriefing}</span>
        </p>
      </div>

      {/* Right: Filter Segment + Action */}
      <div className="flex flex-wrap items-center gap-2.5 shrink-0">
        {/* Quick Filter Segmented Control */}
        <div
          role="tablist"
          aria-label="Dashboard views"
          className="flex items-center p-1 bg-surface-1 rounded-lg border border-border-subtle text-xs gap-1"
        >
          {filterOptions.map((opt) => {
            const Icon = opt.icon;
            const isActive = activeFilter === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => onFilterChange(opt.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all select-none cursor-pointer ${
                  isActive
                    ? 'bg-surface-elevated text-foreground font-semibold shadow-xs ring-1 ring-border-default'
                    : 'text-foreground-secondary hover:text-foreground hover:bg-surface-2/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? opt.color : 'text-foreground-tertiary'}`} />
                <span>{opt.label}</span>
                {typeof opt.count === 'number' && (
                  <span
                    className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold leading-none transition-colors ${
                      isActive
                        ? 'bg-primary/20 text-primary'
                        : 'bg-surface-2 text-foreground-tertiary'
                    }`}
                  >
                    {opt.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Instant Scan CTA */}
        <Button
          variant="secondary"
          size="sm"
          onClick={onInstantScan || (() => navigate('/leads/discover'))}
          isLoading={isScanning}
          leftIcon={<Compass className={`w-3.5 h-3.5 text-signal-high ${isScanning ? 'animate-spin' : ''}`} />}
        >
          {isScanning ? 'Scanning Feeds...' : (t.dashboard?.scanSignals || 'Scan Buying Signals')}
        </Button>
      </div>
    </div>
  );
};

export default DashboardHeader;
