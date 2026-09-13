import React, { useRef, useEffect } from 'react';
import {
  Search,
  X,
  Compass,
  SlidersHorizontal,
  Clock,
  ArrowUpDown,
  Zap,
  Flame,
} from 'lucide-react';
import { DiscoveryFilterState, SortOption } from '../../types/leads';
import { Button } from '../ui/Button';

export interface DiscoveryControlsProps {
  filters: DiscoveryFilterState;
  onFilterChange: (updates: Partial<DiscoveryFilterState>) => void;
  onOpenFilterDrawer: () => void;
  activeFilterCount: number;
  onDiscover: () => void;
  isDiscovering: boolean;
  totalMatches: number;
  highIntentCount: number;
  className?: string;
}

const PRESET_REQUIREMENTS = [
  'Warehouse Automation & Dispatch',
  'Legacy Telephony & Dialer Migration',
  'Pricing / Vendor RFP Issued',
  'Series-A/B GTM Expansion',
  'Patient Intake IVR Software',
];

const FRESHNESS_OPTIONS: { value: DiscoveryFilterState['freshness']; label: string }[] = [
  { value: 'all', label: 'Any Time' },
  { value: 'today', label: 'Discovered Today' },
  { value: '3d', label: 'Last 3 Days' },
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
];

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'intent', label: 'Highest Intent' },
  { value: 'freshness', label: 'Newest Requirement' },
  { value: 'value', label: 'Highest Value' },
];

export const DiscoveryControls: React.FC<DiscoveryControlsProps> = ({
  filters,
  onFilterChange,
  onOpenFilterDrawer,
  activeFilterCount,
  onDiscover,
  isDiscovering,
  totalMatches,
  highIntentCount,
  className = '',
}) => {
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Global Keyboard Shortcut: '/' to focus search bar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.key === '/') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleApplyPreset = (preset: string) => {
    if (filters.query === preset) {
      onFilterChange({ query: '' });
    } else {
      onFilterChange({ query: preset });
    }
  };

  return (
    <div className={`space-y-3.5 ${className}`}>
      {/* Primary Requirement Search Workbench Bar */}
      <div className="flex flex-col md:flex-row items-stretch gap-3">
        {/* Natural Language Requirement Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-foreground-tertiary absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            aria-label="Search by buyer requirement or pain point"
            placeholder="Search by buyer requirement or pain point (e.g. 'Looking for warehouse automation' or 'Replacing legacy telephony')..."
            value={filters.query}
            onChange={(e) => onFilterChange({ query: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                onDiscover();
              }
            }}
            className="w-full bg-surface border border-border-strong rounded-xl pl-10 pr-20 py-2.5 text-xs text-foreground placeholder:text-foreground-tertiary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-xs transition-all"
          />

          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
            {filters.query ? (
              <button
                type="button"
                onClick={() => onFilterChange({ query: '' })}
                className="p-1 rounded text-foreground-tertiary hover:text-foreground hover:bg-surface-elevated transition-colors"
                title="Clear requirement search"
                aria-label="Clear requirement search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-mono text-foreground-tertiary bg-surface-elevated border border-border-subtle">
                /
              </kbd>
            )}
          </div>
        </div>

        {/* Primary CTA: Discover Leads */}
        <Button
          variant="primary"
          size="md"
          className="shadow-md font-semibold shrink-0 px-6 justify-center"
          isLoading={isDiscovering}
          leftIcon={<Compass className="w-4 h-4 text-signal-high" />}
          onClick={onDiscover}
        >
          {isDiscovering ? 'Scanning Telemetry...' : 'Discover Leads'}
        </Button>
      </div>

      {/* Suggested Commercial Requirement Presets */}
      <div className="flex flex-wrap items-center gap-1.5 text-xs">
        <span className="text-[11px] font-mono text-foreground-tertiary flex items-center gap-1 mr-1">
          <Zap className="w-3 h-3 text-signal-high" />
          <span>Intent Triggers:</span>
        </span>
        {PRESET_REQUIREMENTS.map((preset) => {
          const isSelected = filters.query.toLowerCase() === preset.toLowerCase();
          return (
            <button
              key={preset}
              type="button"
              onClick={() => handleApplyPreset(preset)}
              className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all ${
                isSelected
                  ? 'bg-primary-muted text-primary border-primary font-semibold shadow-2xs'
                  : 'bg-surface-1 text-foreground-secondary border-border-subtle hover:border-border-default hover:text-foreground'
              }`}
            >
              {preset}
            </button>
          );
        })}
      </div>

      {/* Secondary Discovery Filter Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2 bg-surface border border-border-strong rounded-xl text-xs">
        {/* Left: Quick Segmented Intent Pills */}
        <div className="flex items-center gap-1 p-0.5 bg-surface-1 rounded-lg border border-border-subtle">
          <button
            type="button"
            onClick={() => onFilterChange({ intentLevel: 'all' })}
            className={`px-3 py-1 rounded-md transition-colors font-medium ${
              filters.intentLevel === 'all'
                ? 'bg-surface-elevated text-foreground font-semibold shadow-xs'
                : 'text-foreground-secondary hover:text-foreground'
            }`}
          >
            All Leads ({totalMatches})
          </button>
          <button
            type="button"
            onClick={() => onFilterChange({ intentLevel: 'high' })}
            className={`px-3 py-1 rounded-md transition-colors font-medium flex items-center gap-1.5 ${
              filters.intentLevel === 'high'
                ? 'bg-signal-high-muted text-signal-high font-semibold border border-signal-high/30 shadow-xs'
                : 'text-foreground-secondary hover:text-foreground'
            }`}
          >
            <Flame className="w-3 h-3 text-signal-high" />
            <span>High Intent 80+ ({highIntentCount})</span>
          </button>
          <button
            type="button"
            onClick={() => onFilterChange({ intentLevel: 'medium' })}
            className={`px-3 py-1 rounded-md transition-colors font-medium ${
              filters.intentLevel === 'medium'
                ? 'bg-surface-elevated text-primary font-semibold shadow-xs'
                : 'text-foreground-secondary hover:text-foreground'
            }`}
          >
            Moderate 50–79
          </button>
        </div>

        {/* Right: Freshness, Sort, and Filter Drawer Toggle */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Freshness Select */}
          <div className="flex items-center gap-1 bg-surface-1 px-2.5 py-1 rounded-lg border border-border-subtle text-[11px]">
            <Clock className="w-3.5 h-3.5 text-foreground-tertiary" />
            <select
              value={filters.freshness}
              onChange={(e) =>
                onFilterChange({ freshness: e.target.value as DiscoveryFilterState['freshness'] })
              }
              aria-label="Requirement Freshness"
              className="bg-transparent text-foreground font-medium focus:outline-none cursor-pointer"
            >
              {FRESHNESS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-surface-0 text-foreground">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By Select */}
          <div className="flex items-center gap-1 bg-surface-elevated px-2.5 py-1 rounded-lg border border-border text-[11px]">
            <ArrowUpDown className="w-3.5 h-3.5 text-foreground-tertiary" />
            <select
              value={filters.sortBy}
              onChange={(e) => onFilterChange({ sortBy: e.target.value as SortOption })}
              aria-label="Sort Leads By"
              className="bg-transparent text-foreground font-medium focus:outline-none cursor-pointer"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-surface text-foreground">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Drawer / Panel Toggle Button */}
          <button
            type="button"
            onClick={onOpenFilterDrawer}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border text-xs font-semibold transition-all ${
              activeFilterCount > 0
                ? 'bg-primary-muted text-primary border-primary/50 shadow-xs'
                : 'bg-surface-1 text-foreground-secondary border-border-subtle hover:border-border-default hover:text-foreground'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] font-mono flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
