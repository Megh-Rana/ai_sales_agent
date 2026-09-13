import React, { useState } from 'react';
import { Compass, Search, Globe, DollarSign, Building2, Check, X } from 'lucide-react';
import { TargetMarketData } from '../../types/onboarding';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';

export interface Step4TargetMarketProps {
  data: TargetMarketData;
  onChange: (updated: Partial<TargetMarketData>) => void;
  errors: Record<string, string>;
}

const INDUSTRY_POOL = [
  '3PL & Warehousing',
  'Cold Chain Distribution',
  'E-Commerce Logistics',
  'Pharmaceutical Supply Chain',
  'Automotive Spare Parts',
  'Industrial Manufacturing',
  'Heavy Equipment Distribution',
  'Food & Beverage Logistics',
  'Retail Fulfillment Networks',
  'Packaging & Materials',
];

const GEOGRAPHY_PRESETS = [
  'North America (US & Canada)',
  'Western Europe (UK, Germany, France, Benelux)',
  'India (Metro Tier 1 & Industrial Hubs)',
  'Southeast Asia (Singapore, Malaysia, Indonesia)',
  'Middle East & North Africa (GCC Hubs)',
  'Australia & New Zealand',
];

const REVENUE_THRESHOLDS = [
  { value: 'Any Revenue', label: 'Any Revenue Band (Startups & Mid-Market)' },
  { value: '>$5M ARR', label: '>$5M Annual Revenue' },
  { value: '>$10M ARR', label: '>$10M Annual Revenue' },
  { value: '>$25M ARR', label: '>$25M Annual Revenue' },
  { value: '>$100M ARR', label: '>$100M Enterprise Revenue' },
];

export const Step4TargetMarket: React.FC<Step4TargetMarketProps> = ({
  data,
  onChange,
  errors,
}) => {
  const [industrySearch, setIndustrySearch] = useState('');
  const [customSegment, setCustomSegment] = useState('');

  const filteredIndustries = INDUSTRY_POOL.filter((ind) =>
    ind.toLowerCase().includes(industrySearch.toLowerCase())
  );

  const toggleIndustry = (ind: string) => {
    const exists = data.industries.includes(ind);
    const updated = exists ? data.industries.filter((i) => i !== ind) : [...data.industries, ind];
    onChange({ industries: updated });
  };

  const toggleRegion = (region: string) => {
    const exists = data.regions.includes(region);
    const updated = exists ? data.regions.filter((r) => r !== region) : [...data.regions, region];
    onChange({ regions: updated });
  };

  const handleAddSegment = () => {
    const trimmed = customSegment.trim();
    if (trimmed && !data.customerSegments.includes(trimmed)) {
      onChange({ customerSegments: [...data.customerSegments, trimmed] });
      setCustomSegment('');
    }
  };

  const handleRemoveSegment = (seg: string) => {
    onChange({ customerSegments: data.customerSegments.filter((s) => s !== seg) });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h3 className="text-h3 font-bold text-foreground tracking-tight">
          Target Market & Geographic Boundaries
        </h3>
        <p className="text-body text-foreground-secondary leading-relaxed">
          Establish boundaries for the autonomous radar engine to discover matching buying signals and accounts.
        </p>
      </div>

      {/* Section 1: Target Industries with Search */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="block text-caption font-medium text-foreground-secondary">
            Priority Target Industries <span className="text-signal-urgent">*</span>
          </label>
          <span className="text-[11px] text-foreground-tertiary">
            {data.industries.length} industries selected
          </span>
        </div>

        {/* Search bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-foreground-tertiary absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search vertical industries..."
            value={industrySearch}
            onChange={(e) => setIndustrySearch(e.target.value)}
            className="w-full bg-surface-1 border border-border-subtle rounded-lg pl-9 pr-3 py-2 text-xs text-foreground placeholder:text-foreground-tertiary focus:outline-none focus:border-primary"
          />
        </div>

        {/* Industry Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
          {filteredIndustries.map((ind) => {
            const isSelected = data.industries.includes(ind);
            return (
              <button
                key={ind}
                type="button"
                onClick={() => toggleIndustry(ind)}
                className={`p-2.5 rounded-lg border text-xs text-left transition-all flex items-center justify-between gap-2 ${
                  isSelected
                    ? 'bg-primary-muted border-primary text-primary font-medium'
                    : 'bg-surface-1 border-border-subtle text-foreground-secondary hover:border-border-default hover:text-foreground'
                }`}
              >
                <span className="truncate">{ind}</span>
                <div
                  className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[10px] shrink-0 border ${
                    isSelected ? 'bg-primary text-primary-foreground border-primary' : 'border-border-default'
                  }`}
                >
                  {isSelected && <Check className="w-2.5 h-2.5" />}
                </div>
              </button>
            );
          })}
        </div>
        {errors.industries && <p className="text-caption text-signal-urgent">{errors.industries}</p>}
      </div>

      {/* Section 2: Target Geographic Regions */}
      <div className="space-y-2.5">
        <label className="block text-caption font-medium text-foreground-secondary">
          Target Geographies & Dialing Zones <span className="text-signal-urgent">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {GEOGRAPHY_PRESETS.map((geo) => {
            const isSelected = data.regions.includes(geo);
            return (
              <button
                key={geo}
                type="button"
                onClick={() => toggleRegion(geo)}
                className={`p-3 rounded-lg border text-xs text-left transition-all flex items-center justify-between gap-2 ${
                  isSelected
                    ? 'bg-surface-elevated text-foreground border-primary font-semibold shadow-xs'
                    : 'bg-surface-1 border-border-subtle text-foreground-secondary hover:border-border-default hover:text-foreground'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <Globe className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-primary' : 'text-foreground-tertiary'}`} />
                  <span className="truncate">{geo}</span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-primary shrink-0" />}
              </button>
            );
          })}
        </div>
        {errors.regions && <p className="text-caption text-signal-urgent">{errors.regions}</p>}
      </div>

      {/* Section 3: Revenue Band & Customer Segments */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="Minimum Revenue Qualification Band"
          options={REVENUE_THRESHOLDS}
          value={data.revenueThreshold}
          onChange={(e) => onChange({ revenueThreshold: e.target.value })}
          helperText="Limits automated outreach to accounts with confirmed operational budget."
        />

        {/* Customer Segments Tags */}
        <div className="space-y-1.5">
          <label className="block text-caption font-medium text-foreground-secondary">
            Strategic Account Segments
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="e.g., Omni-channel 3PLs..."
              value={customSegment}
              onChange={(e) => setCustomSegment(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddSegment();
                }
              }}
              className="flex-1 bg-surface-1 border border-border-subtle rounded-lg px-3 py-1.5 text-xs text-foreground placeholder:text-foreground-tertiary focus:outline-none focus:border-primary"
            />
            <button
              type="button"
              onClick={handleAddSegment}
              disabled={!customSegment.trim()}
              className="px-3 py-1.5 rounded-lg bg-surface-elevated border border-border-default text-xs font-medium text-foreground hover:bg-surface-2 transition-colors disabled:opacity-40"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {data.customerSegments.map((seg) => (
              <span
                key={seg}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs bg-surface-1 text-foreground-secondary border border-border-subtle"
              >
                <span>{seg}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSegment(seg)}
                  className="text-foreground-tertiary hover:text-signal-urgent transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
