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
}

export const PriorityOpportunities: React.FC<PriorityOpportunitiesProps> = ({
  opportunities,
  onCallOpportunity,
  className = '',
}) => {
  const { t } = useI18n();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'high' | 'qualified'>('all');

  const filtered = opportunities.filter((opp) => {
    if (activeTab === 'high') return opp.intentScore >= 85;
    if (activeTab === 'qualified') return opp.salesStatus === 'qualified' || opp.salesStatus === 'meeting';
    return true;
  });

  const handleToggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
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
              <span className="px-2 py-0.2 rounded-full text-[10px] font-mono font-bold bg-surface-elevated text-foreground-secondary border border-border-subtle">
                {filtered.length} of {opportunities.length}
              </span>
            </div>
            <div className="text-caption text-foreground-tertiary">
              {t.dashboard?.priorityQueueSub || 'Ranked dynamically by intent momentum and actionable buying signals'}
            </div>
          </div>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-1 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-2.5 py-1 rounded-md transition-colors font-medium ${
              activeTab === 'all'
                ? 'bg-surface-elevated text-foreground font-semibold'
                : 'text-foreground-secondary hover:text-foreground'
            }`}
          >
            {t.dashboard?.allOpportunities || 'All Leads'}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('high')}
            className={`px-2.5 py-1 rounded-md transition-colors font-medium ${
              activeTab === 'high'
                ? 'bg-surface-elevated text-foreground font-semibold'
                : 'text-foreground-secondary hover:text-foreground'
            }`}
          >
            {t.dashboard?.highIntent || 'Score ≥ 85'}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('qualified')}
            className={`px-2.5 py-1 rounded-md transition-colors font-medium ${
              activeTab === 'qualified'
                ? 'bg-surface-elevated text-foreground font-semibold'
                : 'text-foreground-secondary hover:text-foreground'
            }`}
          >
            {t.dashboard?.filterCallReady || 'Qualified Only'}
          </button>
        </div>
      </div>

      {/* Column Headers (Desktop Only) */}
      <div className="hidden md:grid md:grid-cols-12 gap-3 px-3.5 py-2 bg-surface-1/40 border-b border-border-subtle text-[11px] font-mono uppercase text-foreground-tertiary font-semibold select-none">
        <div className="col-span-2">Intent Score</div>
        <div className="col-span-4">Account & Stakeholder</div>
        <div className="col-span-4">Live Buying Signal (Why Now?)</div>
        <div className="col-span-2 text-right">Autonomous Action</div>
      </div>

      {/* Opportunity Rows / Cards */}
      <div className="divide-y divide-border-subtle">
        {filtered.length === 0 ? (
          <div className="p-10 text-center space-y-2">
            <div className="text-body font-medium text-foreground">No accounts match this intent filter</div>
            <p className="text-caption text-foreground-tertiary max-w-sm mx-auto">
              No opportunities meet your filter threshold. Select 'All Leads' to view the entire priority queue.
            </p>
          </div>
        ) : (
          filtered.map((opp) => (
            <PriorityOpportunity
              key={opp.id}
              opportunity={opp}
              onCall={onCallOpportunity}
              isExpanded={expandedId === opp.id}
              onToggleExpand={() => handleToggleExpand(opp.id)}
            />
          ))
        )}
      </div>

      {/* Footer Navigation Bar */}
      <div className="p-3 sm:px-5 bg-surface-1/30 border-t border-border-subtle flex items-center justify-between text-xs">
        <span className="text-foreground-tertiary">
          Showing <span className="font-semibold text-foreground">{filtered.length}</span> high-priority accounts
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
