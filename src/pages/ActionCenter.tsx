import React, { useState, useMemo, useCallback } from 'react';
import { toast } from 'sonner';
import { ActionPriorityLevel, NextBestActionItem } from '../types/actions';
import {
  mockNextBestActions,
  mockActionSummary,
  mockStalledDeals,
  mockLiveSignals,
} from '../data/mockActions';
import { ActionCenterHeader } from '../components/actions/ActionCenterHeader';
import { ActionSummaryGrid } from '../components/actions/ActionSummaryGrid';
import { NextBestActionCard } from '../components/actions/NextBestActionCard';
import { StalledOpportunitiesCard } from '../components/actions/StalledOpportunitiesCard';
import { FollowUpQueueCard } from '../components/actions/FollowUpQueueCard';
import { LiveSignalFeedCard } from '../components/actions/LiveSignalFeedCard';
import { ActionCenterSkeleton } from '../components/actions/ActionCenterSkeleton';
import { ActionCenterEmptyState } from '../components/actions/ActionCenterEmptyState';
import { ActionCenterErrorState } from '../components/actions/ActionCenterErrorState';
import { Target, Zap, Clock, ShieldAlert } from 'lucide-react';

export const ActionCenter: React.FC = () => {
  const [activePriority, setActivePriority] = useState<'ALL' | ActionPriorityLevel>('ALL');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [actionsList, setActionsList] = useState<NextBestActionItem[]>(mockNextBestActions);
  const [viewState, setViewState] = useState<'normal' | 'loading' | 'empty' | 'error'>('normal');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filter actions dynamically based on priority and category
  const filteredActions = useMemo(() => {
    return actionsList.filter((item) => {
      if (item.status === 'dismissed') return false;

      const matchesPriority =
        activePriority === 'ALL' || item.priority === activePriority;

      const matchesCategory =
        activeCategory === 'all' || item.category.toLowerCase() === activeCategory.toLowerCase();

      return matchesPriority && matchesCategory;
    });
  }, [actionsList, activePriority, activeCategory]);

  const handleExecuteAction = useCallback((action: NextBestActionItem) => {
    toast.success(`Action Launched: ${action.primaryActionLabel} for ${action.companyName}`, {
      description: `Targeting ${action.contactName} (${action.contactRole})`,
    });
  }, []);

  const handleDismissAction = useCallback((actionId: string) => {
    setActionsList((prev) =>
      prev.map((item) => (item.id === actionId ? { ...item, status: 'dismissed' } : item))
    );
    toast.info('Action dismissed from queue');
  }, []);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success('Sales action queue updated');
    }, 600);
  }, []);

  const handleResetFilter = useCallback(() => {
    setActivePriority('ALL');
    setActiveCategory('all');
  }, []);

  return (
    <div className="space-y-8 select-none pb-16">
      {/* SECTION 1: HEADER & FILTERS */}
      <ActionCenterHeader
        activePriority={activePriority}
        onPriorityChange={setActivePriority}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        viewState={viewState}
        onViewStateChange={setViewState}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />

      {/* VIEW STATE 1: LOADING */}
      {viewState === 'loading' && <ActionCenterSkeleton />}

      {/* VIEW STATE 2: EMPTY */}
      {viewState === 'empty' && (
        <ActionCenterEmptyState onResetFilter={handleResetFilter} />
      )}

      {/* VIEW STATE 3: ERROR */}
      {viewState === 'error' && (
        <ActionCenterErrorState onRetry={() => setViewState('normal')} />
      )}

      {/* VIEW STATE 4: NORMAL WORKSPACE */}
      {viewState === 'normal' && (
        <main className="space-y-8 animate-fade-in">
          {/* EXECUTIVE ACTION SUMMARY COUNTERS */}
          <ActionSummaryGrid summary={mockActionSummary} />

          {/* PRIMARY NEXT BEST ACTIONS QUEUE */}
          <section aria-label="Priority Next Best Actions" className="space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-2.5">
              <div className="flex items-center space-x-2">
                <div className="p-1 rounded bg-primary-muted text-primary border border-primary/30">
                  <Target className="w-4 h-4" aria-hidden="true" />
                </div>
                <h2 className="text-sm font-bold text-foreground tracking-tight uppercase font-mono">
                  Priority Next Best Actions Queue ({filteredActions.length})
                </h2>
              </div>
              <span className="text-xs text-foreground-secondary font-mono">
                Sorted by Signal Urgency & Intent Score
              </span>
            </div>

            {filteredActions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredActions.map((action) => (
                  <NextBestActionCard
                    key={action.id}
                    action={action}
                    onExecuteAction={handleExecuteAction}
                    onDismissAction={handleDismissAction}
                  />
                ))}
              </div>
            ) : (
              <ActionCenterEmptyState onResetFilter={handleResetFilter} />
            )}
          </section>

          {/* DUAL WORKSPACE: STALLEDS & FOLLOW-UPS */}
          <section aria-label="Stalled Deals and Follow-up Dispatch Queue" className="space-y-4 pt-2">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <StalledOpportunitiesCard deals={mockStalledDeals} />
              <FollowUpQueueCard />
            </div>
          </section>

          {/* LIVE SIGNAL STREAM */}
          <section aria-label="Real-time Buying Signal Stream" className="space-y-4 pt-2">
            <LiveSignalFeedCard signals={mockLiveSignals} />
          </section>
        </main>
      )}
    </div>
  );
};

export default ActionCenter;
