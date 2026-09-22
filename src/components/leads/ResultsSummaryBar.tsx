import React from 'react';
import { X, Flame, Clock, Filter } from 'lucide-react';
import { DiscoveryFilterState } from '../../types/leads';

export interface ResultsSummaryBarProps {
  totalCount: number;
  highIntentCount: number;
  recent24hCount: number;
  filters: DiscoveryFilterState;
  onRemoveFilter: (key: keyof DiscoveryFilterState, value?: string) => void;
  onClearAll: () => void;
  className?: string;
}

export const ResultsSummaryBar: React.FC<ResultsSummaryBarProps> = ({
  totalCount,
  highIntentCount,
  recent24hCount,
  filters,
  onRemoveFilter,
  onClearAll,
  className = '',
}) => {
  const hasActiveFilters =
    filters.query ||
    filters.intentLevel !== 'all' ||
    filters.freshness !== 'all' ||
    filters.industries.length > 0 ||
    filters.locations.length > 0 ||
    filters.signalTypes.length > 0 ||
    filters.sources.length > 0 ||
    (filters.companySizes && filters.companySizes.length > 0) ||
    !!filters.companySize;

  return (
    <div className={`space-y-2.5 ${className}`}>
      {/* Top Counts Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-body font-bold text-foreground">
            {totalCount} {totalCount === 1 ? 'Opportunity' : 'Opportunities'} Found
          </span>
          <span className="text-foreground-tertiary">·</span>
          <span className="inline-flex items-center gap-1 font-semibold text-signal-high">
            <Flame className="w-3.5 h-3.5" />
            <span>{highIntentCount} High Intent (80+)</span>
          </span>
          {recent24hCount > 0 && (
            <>
              <span className="text-foreground-tertiary hidden sm:inline-block">·</span>
              <span className="text-foreground-secondary hidden sm:inline-flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-signal-qualified" />
                <span>{recent24hCount} posted in last 24h</span>
              </span>
            </>
          )}
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClearAll}
            className="text-[11px] text-foreground-tertiary hover:text-signal-urgent transition-colors"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Removable Active Filter Tags */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          {filters.query && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] bg-surface-1 text-primary border border-primary/30">
              <span>Query: "{filters.query}"</span>
              <button
                type="button"
                onClick={() => onRemoveFilter('query')}
                className="hover:text-signal-urgent ml-0.5"
                aria-label="Remove query filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.intentLevel !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] bg-signal-high-muted text-signal-high border border-signal-high/30 font-medium">
              <span>Intent: {filters.intentLevel === 'high' ? 'High (80+)' : 'Medium (50–79)'}</span>
              <button
                type="button"
                onClick={() => onRemoveFilter('intentLevel')}
                className="hover:text-signal-urgent ml-0.5"
                aria-label="Remove intent filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.freshness !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] bg-surface-1 text-foreground-secondary border border-border-subtle">
              <span>Freshness: {filters.freshness}</span>
              <button
                type="button"
                onClick={() => onRemoveFilter('freshness')}
                className="hover:text-signal-urgent ml-0.5"
                aria-label="Remove freshness filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.industries.map((ind) => (
            <span
              key={ind}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] bg-surface-1 text-foreground-secondary border border-border-subtle"
            >
              <span>{ind}</span>
              <button
                type="button"
                onClick={() => onRemoveFilter('industries', ind)}
                className="hover:text-signal-urgent ml-0.5"
                aria-label={`Remove industry filter ${ind}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          {filters.locations.map((loc) => (
            <span
              key={loc}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] bg-surface-1 text-foreground-secondary border border-border-subtle"
            >
              <span>{loc}</span>
              <button
                type="button"
                onClick={() => onRemoveFilter('locations', loc)}
                className="hover:text-signal-urgent ml-0.5"
                aria-label={`Remove location filter ${loc}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          {filters.signalTypes.map((sig) => (
            <span
              key={sig}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] bg-surface-1 text-signal-high border border-signal-high/30"
            >
              <span>{sig}</span>
              <button
                type="button"
                onClick={() => onRemoveFilter('signalTypes', sig)}
                className="hover:text-signal-urgent ml-0.5"
                aria-label={`Remove signal filter ${sig}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          {filters.sources.map((src) => (
            <span
              key={src}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] bg-surface-1 text-signal-qualified border border-signal-qualified/30"
            >
              <span>{src}</span>
              <button
                type="button"
                onClick={() => onRemoveFilter('sources', src)}
                className="hover:text-signal-urgent ml-0.5"
                aria-label={`Remove source filter ${src}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          {(filters.companySizes || (filters.companySize ? [filters.companySize] : [])).map((size) => (
            <span
              key={size}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] bg-surface-1 text-primary border border-primary/30"
            >
              <span>Size: {size}</span>
              <button
                type="button"
                onClick={() => onRemoveFilter('companySizes', size)}
                className="hover:text-signal-urgent ml-0.5"
                aria-label={`Remove company size filter ${size}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
