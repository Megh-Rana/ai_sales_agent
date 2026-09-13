import React, { useState, useEffect } from 'react';
import { X, Search, Check, RefreshCw, Filter, Globe, Building2, Zap, Radio } from 'lucide-react';
import { DiscoveryFilterState } from '../../types/leads';
import { Button } from '../ui/Button';

export interface DiscoveryFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: DiscoveryFilterState;
  onApplyFilters: (updated: Partial<DiscoveryFilterState>) => void;
  onClearAll: () => void;
  activeFilterCount: number;
}

const AVAILABLE_INDUSTRIES = [
  'Logistics & 3PL',
  'Industrial Automation',
  'Healthcare & Life Sciences',
  'B2B SaaS',
  'Fintech & Financial Services',
  'Retail & E-Commerce',
];

const AVAILABLE_LOCATIONS = [
  'Chicago, IL',
  'Austin, TX',
  'San Francisco, CA',
  'San Jose, CA',
  'Boston, MA',
  'Atlanta, GA',
  'Dallas, TX',
  'Detroit, MI',
  'New York, NY',
  'London, UK',
  'Birmingham, UK',
  'Manchester, UK',
  'Stuttgart, Germany',
  'Basel, Switzerland',
  'Mumbai, India',
  'Bengaluru, India',
];

const SIGNAL_TYPES = [
  'RFP Published',
  'Pricing Requested',
  'Hiring Surge',
  'Tech Migration',
  'Facility Expansion',
  'G2 Buyer Surge',
  'Incumbent Churn',
  'Urgent Requirement',
];

const SOURCE_PLATFORMS = [
  'IndiaMART',
  'LinkedIn',
  'G2 Crowd',
  'RFP Portal',
  'TechStack',
  'Job Board',
  'Crunchbase',
];

export const DiscoveryFilterDrawer: React.FC<DiscoveryFilterDrawerProps> = ({
  isOpen,
  onClose,
  filters,
  onApplyFilters,
  onClearAll,
  activeFilterCount,
}) => {
  const [localIndustries, setLocalIndustries] = useState<string[]>(filters.industries);
  const [localLocations, setLocalLocations] = useState<string[]>(filters.locations);
  const [localSignals, setLocalSignals] = useState<string[]>(filters.signalTypes);
  const [localSources, setLocalSources] = useState<string[]>(filters.sources);
  const [industrySearch, setIndustrySearch] = useState('');

  // Sync state when filters update or drawer opens
  useEffect(() => {
    if (isOpen) {
      setLocalIndustries(filters.industries);
      setLocalLocations(filters.locations);
      setLocalSignals(filters.signalTypes);
      setLocalSources(filters.sources);
    }
  }, [filters, isOpen]);

  // Escape key handler for dialog accessibility
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const toggleArrayItem = (list: string[], item: string) => {
    return list.includes(item) ? list.filter((i) => i !== item) : [...list, item];
  };

  const handleApply = () => {
    onApplyFilters({
      industries: localIndustries,
      locations: localLocations,
      signalTypes: localSignals,
      sources: localSources,
    });
    onClose();
  };

  const handleReset = () => {
    setLocalIndustries([]);
    setLocalLocations([]);
    setLocalSignals([]);
    setLocalSources([]);
    onClearAll();
  };

  const filteredIndustries = AVAILABLE_INDUSTRIES.filter((ind) =>
    ind.toLowerCase().includes(industrySearch.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over Drawer Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Lead Discovery Filters"
        className="relative w-full max-w-md bg-surface-0 border-l border-border-default h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-200"
      >
        {/* Drawer Header */}
        <div className="p-4 sm:px-6 border-b border-border-subtle flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-primary" />
            <h3 className="text-body font-bold text-foreground">Discovery Filters</h3>
            {activeFilterCount > 0 && (
              <span className="px-2 py-0.2 rounded-full text-[10px] font-mono font-bold bg-primary-muted text-primary border border-primary/30">
                {activeFilterCount} Active
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={handleReset}
                className="text-xs text-foreground-tertiary hover:text-signal-urgent transition-colors"
              >
                Clear All
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded text-foreground-tertiary hover:text-foreground hover:bg-surface-elevated transition-colors"
              aria-label="Close filters"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Filter Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:px-6 space-y-6 text-xs">
          {/* Section 1: Industry Verticals */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-foreground flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-primary" />
                <span>Industry Vertical</span>
              </label>
              <span className="text-[11px] text-foreground-tertiary">
                {localIndustries.length} selected
              </span>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-foreground-tertiary absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search industries..."
                value={industrySearch}
                onChange={(e) => setIndustrySearch(e.target.value)}
                className="w-full bg-surface-1 border border-border-subtle rounded-lg pl-8 pr-3 py-1.5 text-xs text-foreground placeholder:text-foreground-tertiary focus:outline-none focus:border-primary"
              />
            </div>

            <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
              {filteredIndustries.map((ind) => {
                const isChecked = localIndustries.includes(ind);
                return (
                  <button
                    key={ind}
                    type="button"
                    onClick={() => setLocalIndustries(toggleArrayItem(localIndustries, ind))}
                    className={`w-full p-2 rounded-lg border text-left flex items-center justify-between transition-colors ${
                      isChecked
                        ? 'bg-primary-muted border-primary text-primary font-medium'
                        : 'bg-surface-1/60 border-border-subtle hover:border-border-default text-foreground-secondary'
                    }`}
                  >
                    <span className="truncate">{ind}</span>
                    <div
                      className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[10px] border shrink-0 ${
                        isChecked ? 'bg-primary text-primary-foreground border-primary' : 'border-border-default'
                      }`}
                    >
                      {isChecked && <Check className="w-2.5 h-2.5" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Buying Signal Types */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-foreground flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-signal-high" />
                <span>Buying Signal Triggers</span>
              </label>
              <span className="text-[11px] text-foreground-tertiary">
                {localSignals.length} selected
              </span>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              {SIGNAL_TYPES.map((sig) => {
                const isChecked = localSignals.includes(sig);
                return (
                  <button
                    key={sig}
                    type="button"
                    onClick={() => setLocalSignals(toggleArrayItem(localSignals, sig))}
                    className={`p-2 rounded-lg border text-left flex items-center justify-between gap-1 text-[11px] transition-colors ${
                      isChecked
                        ? 'bg-signal-high-muted border-signal-high/40 text-foreground font-medium'
                        : 'bg-surface-1/60 border-border-subtle hover:border-border-default text-foreground-secondary'
                    }`}
                  >
                    <span className="truncate">{sig}</span>
                    {isChecked && <Check className="w-3 h-3 text-signal-high shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Telemetry Source Platforms */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-foreground flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-signal-qualified" />
                <span>Signal Ingestion Feeds</span>
              </label>
              <span className="text-[11px] text-foreground-tertiary">
                {localSources.length} selected
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {SOURCE_PLATFORMS.map((src) => {
                const isChecked = localSources.includes(src);
                return (
                  <button
                    key={src}
                    type="button"
                    onClick={() => setLocalSources(toggleArrayItem(localSources, src))}
                    className={`px-2.5 py-1 rounded-md border text-[11px] transition-colors ${
                      isChecked
                        ? 'bg-surface-elevated text-signal-qualified border-signal-qualified font-semibold'
                        : 'bg-surface-1 text-foreground-secondary border-border-subtle hover:border-border-default'
                    }`}
                  >
                    {isChecked ? `✓ ${src}` : `+ ${src}`}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 4: Target Location / Dialing Zones */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-foreground flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-primary" />
                <span>Geographic Territory</span>
              </label>
              <span className="text-[11px] text-foreground-tertiary">
                {localLocations.length} selected
              </span>
            </div>

            <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto pr-1">
              {AVAILABLE_LOCATIONS.map((loc) => {
                const isChecked = localLocations.includes(loc);
                return (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => setLocalLocations(toggleArrayItem(localLocations, loc))}
                    className={`p-2 rounded-lg border text-left flex items-center justify-between gap-1 text-[11px] transition-colors ${
                      isChecked
                        ? 'bg-surface-elevated text-primary border-primary font-semibold'
                        : 'bg-surface-1/60 border-border-subtle hover:border-border-default text-foreground-secondary'
                    }`}
                  >
                    <span className="truncate">{loc}</span>
                    {isChecked && <Check className="w-3 h-3 text-primary shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Drawer Bottom Actions */}
        <div className="p-4 sm:px-6 border-t border-border-subtle bg-surface-0 flex items-center justify-between gap-3 shrink-0">
          <Button variant="secondary" size="md" onClick={onClose}>
            Cancel
          </Button>

          <Button variant="primary" size="md" className="flex-1 justify-center" onClick={handleApply}>
            Apply Filters
          </Button>
        </div>
      </div>
    </div>
  );
};
