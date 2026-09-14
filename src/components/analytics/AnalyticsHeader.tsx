import React from 'react';
import { DateRangePreset } from '../../types/analytics';
import { Calendar, BarChart3, RefreshCw } from 'lucide-react';

interface AnalyticsHeaderProps {
  dateRange: DateRangePreset;
  onDateRangeChange: (range: DateRangePreset) => void;
  viewState: 'normal' | 'loading' | 'empty' | 'error';
  onViewStateChange: (state: 'normal' | 'loading' | 'empty' | 'error') => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const AnalyticsHeader: React.FC<AnalyticsHeaderProps> = ({
  dateRange,
  onDateRangeChange,
  viewState,
  onViewStateChange,
  onRefresh,
  isRefreshing = false,
}) => {
  const dateOptions: { id: DateRangePreset; label: string }[] = [
    { id: 'today', label: 'Today' },
    { id: '7d', label: '7 days' },
    { id: '30d', label: '30 days' },
    { id: '90d', label: '90 days' },
    { id: 'custom', label: 'Custom' },
  ];

  return (
    <header className="bg-surface border border-border rounded-xl p-5 md:p-6 shadow-sm mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Title & Subtitle */}
        <div className="space-y-1">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <BarChart3 className="w-5 h-5" aria-hidden="true" />
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-foreground tracking-tight">
              Sales Analytics
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Intelligence
            </span>
          </div>
          <p className="text-sm text-foreground-secondary font-normal pl-0.5">
            Understand what's driving your sales pipeline and voice call conversions.
          </p>
        </div>

        {/* Right Controls: Date Range Selector & View State Switcher */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Date Range Selector */}
          <nav
            aria-label="Date Range Filter Options"
            className="inline-flex items-center p-1 rounded-lg bg-background border border-border-strong text-xs font-medium"
          >
            <div className="px-2 text-foreground-tertiary flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5 text-foreground-secondary" aria-hidden="true" />
            </div>
            {dateOptions.map((opt) => {
              const isSelected = dateRange === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onDateRangeChange(opt.id)}
                  aria-pressed={isSelected}
                  aria-label={`Select date filter ${opt.label}`}
                  className={`px-3 py-1.5 rounded-md transition-all duration-150 capitalize font-medium ${
                    isSelected
                      ? 'bg-[#2563EB] text-white shadow-sm font-semibold'
                      : 'text-foreground-secondary hover:text-foreground hover:bg-surface-elevated'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </nav>

          {/* Demo State Switcher Toggle */}
          <div className="hidden xl:flex items-center space-x-1 bg-background border border-border-strong rounded-lg p-1 text-xs">
            <span className="px-2 text-foreground-tertiary text-[11px] font-semibold uppercase tracking-wider">
              State:
            </span>
            {(['normal', 'loading', 'empty', 'error'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => onViewStateChange(st)}
                aria-pressed={viewState === st}
                className={`px-2.5 py-1 rounded capitalize ${
                  viewState === st
                    ? 'bg-surface-hover text-foreground font-semibold'
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
              aria-label="Refresh Analytics Data"
              className="p-2 rounded-lg bg-surface-elevated hover:bg-surface-hover text-foreground-secondary hover:text-foreground border border-border-strong transition-all disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-400' : ''}`}
                aria-hidden="true"
              />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
