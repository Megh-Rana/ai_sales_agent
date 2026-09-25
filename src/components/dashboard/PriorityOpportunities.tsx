import React, { useState } from 'react';
import { ArrowRight, Filter, Users, SlidersHorizontal, Search } from 'lucide-react';
import { Opportunity } from '../../types/sales';
import { PriorityOpportunity } from './PriorityOpportunity';
import { Button } from '../ui/Button';
import { Link } from 'react-router-dom';
import { useI18n } from '../../i18n/i18nContext';

export interface PriorityOpportunitiesProps {
  opportunities: Opportunity[];
  onCallOpportunity?: (id: string) => void;
  className?: string;
  activeFilter?: string;
  onFilterChange?: (filter: string) => void;
  totalCounts?: {
    all: number;
    callReady: number;
    followup: number;
  };
}

export const PriorityOpportunities: React.FC<PriorityOpportunitiesProps> = ({
  opportunities,
  onCallOpportunity,
  className = '',
  activeFilter = 'all',
  onFilterChange,
  totalCounts,
}) => {
  const { t } = useI18n();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleToggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleTabClick = (filterId: string) => {
    if (onFilterChange) {
      onFilterChange(filterId);
    }
  };

  return (
    <div className={`bg-surface-0 border border-border-default rounded-xl overflow-hidden shadow-xs ${className}`}>
      {/* Queue Header & Filters */}
      <div className="p-4 sm:px-5 border-b border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-surface-1 text-signal-high border border-border-subtle">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-h4 font-bold text-foreground tracking-tight">
                {t.dashboard?.priorityQueueTitle || 'Priority Opportunities Queue'}
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-surface-elevated text-foreground-secondary border border-border-subtle">
                {opportunities.length} accounts
              </span>
            </div>
            <div className="text-caption text-foreground-tertiary">
              {t.dashboard?.priorityQueueSub || 'Ranked dynamically by intent momentum and actionable buying signals'}
            </div>
          </div>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-1 text-xs bg-surface-1 p-1 rounded-lg border border-border-subtle">
          <button
            type="button"
            onClick={() => handleTabClick('all')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all font-medium cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-surface-elevated text-foreground font-semibold shadow-xs ring-1 ring-border-default'
                : 'text-foreground-secondary hover:text-foreground'
            }`}
          >
            <span>{t.dashboard?.allOpportunities || 'All Leads'}</span>
            {totalCounts?.all !== undefined && (
              <span className="text-[10px] font-mono px-1 rounded bg-surface-2 text-foreground-tertiary">
                {totalCounts.all}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => handleTabClick('call-ready')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all font-medium cursor-pointer ${
              activeFilter === 'call-ready'
                ? 'bg-surface-elevated text-foreground font-semibold shadow-xs ring-1 ring-border-default'
                : 'text-foreground-secondary hover:text-foreground'
            }`}
          >
            <span>{t.dashboard?.filterCallReady || 'Call Ready'}</span>
            {totalCounts?.callReady !== undefined && (
              <span className="text-[10px] font-mono px-1 rounded bg-surface-2 text-foreground-tertiary">
                {totalCounts.callReady}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => handleTabClick('needs-followup')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all font-medium cursor-pointer ${
              activeFilter === 'needs-followup'
                ? 'bg-surface-elevated text-foreground font-semibold shadow-xs ring-1 ring-border-default'
                : 'text-foreground-secondary hover:text-foreground'
            }`}
          >
            <span>{t.dashboard?.filterFollowup || 'Follow-ups'}</span>
            {totalCounts?.followup !== undefined && (
              <span className="text-[10px] font-mono px-1 rounded bg-surface-2 text-foreground-tertiary">
                {totalCounts.followup}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Active Filter Context Banner */}
      {activeFilter !== 'all' && (
        <div className="px-4 py-2 bg-surface-1/70 border-b border-border-subtle flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              {activeFilter === 'call-ready' ? 'Call Ready Filter Active:' : 'Follow-ups Due Filter Active:'}
            </span>
            <span className="text-foreground-secondary">
              {activeFilter === 'call-ready'
                ? 'Showing accounts with verified direct-dial contacts ready for autonomous AI dialing.'
                : 'Showing accounts with scheduled outreach touchpoints due today.'}
            </span>
          </div>
          {onFilterChange && (
            <button
              type="button"
              onClick={() => onFilterChange('all')}
              className="text-primary hover:text-primary-hover font-medium underline text-[11px] shrink-0 cursor-pointer"
            >
              Reset to All Leads
            </button>
          )}
        </div>
      )}

      {/* Column Headers (Desktop Only) */}
      <div className="hidden md:grid md:grid-cols-12 gap-3 px-3.5 py-2 bg-surface-1/40 border-b border-border-subtle text-[11px] font-mono uppercase text-foreground-tertiary font-semibold select-none">
        <div className="col-span-2">Intent Score</div>
        <div className="col-span-4">Account & Stakeholder</div>
        <div className="col-span-4">Live Buying Signal (Why Now?)</div>
        <div className="col-span-2 text-right">Autonomous Action</div>
      </div>

      {/* Opportunity Rows / Cards */}
      <div className="divide-y divide-border-subtle">
        {opportunities.length === 0 ? (
          <div className="p-10 text-center space-y-3">
            <div className="text-body font-semibold text-foreground">No accounts match this filter</div>
            <p className="text-caption text-foreground-tertiary max-w-sm mx-auto">
              No opportunities meet the criteria for this filter. Switch back to 'All Leads' to view the entire priority queue.
            </p>
            {onFilterChange && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onFilterChange('all')}
              >
                Show All Opportunities
              </Button>
            )}
          </div>
        ) : (
          opportunities.map((opp) => (
            <PriorityOpportunity
              key={opp.id}
              opportunity={opp}
              onCall={onCallOpportunity}
              activeFilter={activeFilter}
              isExpanded={expandedId === opp.id}
              onToggleExpand={() => handleToggleExpand(opp.id)}
            />
          ))
        )}
      </div>

      {/* Footer Navigation Bar */}
      <div className="p-3 sm:px-5 bg-surface-1/30 border-t border-border-subtle flex items-center justify-between text-xs">
        <span className="text-foreground-tertiary">
          Showing <span className="font-semibold text-foreground">{opportunities.length}</span> high-priority accounts
        </span>
        <Link
          to="/leads"
          className="text-primary hover:text-primary-hover font-semibold flex items-center gap-1 group"
        >
          <span>View All 38 Opportunities</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
};
