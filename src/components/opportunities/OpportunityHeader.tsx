import React from 'react';
import { Radar, Flame, Sparkles, Filter, Search, RefreshCw, Layers } from 'lucide-react';
import { OpportunityFilterState, OpportunityCategoryType } from '../../types/opportunities';

import { useI18n } from '../../i18n/i18nContext';

interface OpportunityHeaderProps {
  totalCount: number;
  urgentCount: number;
  newSignalsCount: number;
  filters: OpportunityFilterState;
  onFilterChange: (newFilters: OpportunityFilterState) => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  activeTab: 'all' | 'urgent' | 'warming';
  onTabChange: (tab: 'all' | 'urgent' | 'warming') => void;
}

export const OpportunityHeader: React.FC<OpportunityHeaderProps> = ({
  totalCount,
  urgentCount,
  newSignalsCount,
  filters,
  onFilterChange,
  onRefresh,
  isRefreshing = false,
  activeTab,
  onTabChange,
}) => {
  const { t } = useI18n();

  return (
    <div className="bg-surface-0 border-b border-border-default px-6 py-5 space-y-4">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Radar className="w-5 h-5 animate-pulse" />
            </div>
            <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-semibold">
              Live Sales Command
            </span>
          </div>

          <h1 className="text-h2 font-bold text-foreground tracking-tight flex items-center gap-3">
            <span>{t.navigation?.opportunities || 'Opportunity Radar'}</span>
            <span className="text-sm font-mono font-medium px-2.5 py-0.5 rounded-full bg-surface-1 border border-border-subtle text-foreground-secondary">
              {totalCount} Active
            </span>
          </h1>

          <p className="text-small text-foreground-tertiary mt-0.5 flex items-center gap-2">
            <span className="text-amber-400 font-medium">{urgentCount} high-priority opportunities</span>
            <span className="text-border-subtle">•</span>
            <span>{newSignalsCount} new buying signals today</span>
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-foreground-secondary bg-surface-1 border border-border-subtle hover:bg-surface-hover hover:text-foreground rounded-lg transition-colors disabled:opacity-50"
            title="Scan for live market signals"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
            <span>{isRefreshing ? 'Scanning signals...' : 'Scan Signals'}</span>
          </button>
        </div>
      </div>

      {/* Filter and Tab Navigation Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-2">
        {/* Segmented View Tabs */}
        <div className="flex items-center p-1 bg-surface-1 rounded-lg border border-border-subtle self-start">
          <button
            type="button"
            onClick={() => onTabChange('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 ${
              activeTab === 'all'
                ? 'bg-surface-elevated text-foreground shadow-xs border border-border-default'
                : 'text-foreground-tertiary hover:text-foreground'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>All Radar ({totalCount})</span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange('urgent')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 ${
              activeTab === 'urgent'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-xs'
                : 'text-foreground-tertiary hover:text-foreground'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Action Required ({urgentCount})</span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange('warming')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 ${
              activeTab === 'warming'
                ? 'bg-surface-elevated text-foreground shadow-xs border border-border-default'
                : 'text-foreground-tertiary hover:text-foreground'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Emerging / Warming ({totalCount - urgentCount})</span>
          </button>
        </div>

        {/* Search & Select Filters */}
        <div className="flex items-center gap-2 flex-1 md:max-w-md">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-foreground-tertiary absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
              placeholder="Search lead or company..."
              aria-label="Search lead or company"
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-surface-1 border border-border-subtle rounded-lg text-foreground placeholder:text-foreground-tertiary focus:outline-none focus:border-amber-500/50 transition-colors"
            />
          </div>

          {/* Priority Select */}
          <select
            value={filters.priority}
            onChange={(e) => onFilterChange({ ...filters, priority: e.target.value as any })}
            aria-label="Filter by priority level"
            className="px-2.5 py-1.5 text-xs bg-surface-1 border border-border-subtle rounded-lg text-foreground focus:outline-none focus:border-amber-500/50 transition-colors cursor-pointer"
          >
            <option value="all">All Priorities</option>
            <option value="high">🔥 High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>

          {/* Type Filter Select */}
          <select
            value={filters.type}
            onChange={(e) => onFilterChange({ ...filters, type: e.target.value as any })}
            aria-label="Filter by opportunity type"
            className="px-2.5 py-1.5 text-xs bg-surface-1 border border-border-subtle rounded-lg text-foreground focus:outline-none focus:border-amber-500/50 transition-colors cursor-pointer hidden lg:block"
          >
            <option value="all">All Types</option>
            <option value="BUYING_SIGNAL">Buying Signals</option>
            <option value="HOT_OPPORTUNITY">Hot Opportunities</option>
            <option value="POSITIVE_RESPONSE">Positive Responses</option>
            <option value="FOLLOW_UP_DUE">Follow-Up Due</option>
            <option value="ENGAGEMENT_SPIKE">Engagement Spikes</option>
            <option value="MEETING_OPPORTUNITY">Meeting Requests</option>
          </select>
        </div>
      </div>
    </div>
  );
};
