import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { useI18n } from '../i18n/i18nContext';
import { ActionPriorityLevel, NextBestActionItem } from '../types/actions';
import {
  mockActionSummary,
  mockStalledDeals,
  mockLiveSignals,
} from '../data/mockActions';
import { getQueuedLeads } from '../data/leads';
import { ActionCenterHeader } from '../components/actions/ActionCenterHeader';
import { ActionSummaryGrid } from '../components/actions/ActionSummaryGrid';
import { NextBestActionCard } from '../components/actions/NextBestActionCard';
import { StalledOpportunitiesCard } from '../components/actions/StalledOpportunitiesCard';
import { FollowUpQueueCard } from '../components/actions/FollowUpQueueCard';
import { LiveSignalFeedCard } from '../components/actions/LiveSignalFeedCard';
import { ActionCenterSkeleton } from '../components/actions/ActionCenterSkeleton';
import { ActionCenterEmptyState } from '../components/actions/ActionCenterEmptyState';
import { ActionCenterErrorState } from '../components/actions/ActionCenterErrorState';

// V3 21st.dev Animations
import {
  AnimatedCircularProgress,
  AnimatedProgressBar,
  AnimatedNumberTransition,
  AnimatedBadge,
  AnimatedStepper,
} from '../components/ui/21st';

import { Target, Zap, Clock, ShieldAlert, CheckCircle2 } from 'lucide-react';

// Convert queued leads to NextBestActionItem format
function buildActionsFromQueue(): NextBestActionItem[] {
  const queued = getQueuedLeads();
  return queued.map((lead) => ({
    id: `action-q-${lead.id}`,
    leadId: lead.id,
    companyName: lead.companyName,
    companyDomain: lead.companyDomain,
    industry: lead.industry,
    contactName: lead.decisionMakerContact?.name || 'Decision Maker',
    contactRole: lead.decisionMakerContact?.role || 'Executive',
    intentScore: lead.intentScore,
    estimatedValue: lead.estimatedValue || '₹25L',
    priority: lead.intentScore >= 85 ? 'CRITICAL' as const : 'HIGH' as const,
    category: 'CALL' as const,
    title: `AI Call: ${lead.companyName} — ${lead.requirement?.slice(0, 60) || lead.industry}`,
    requirementSummary: lead.requirement || 'Queued from Lead Discovery',
    whyNow: {
      headline: lead.whyNow || 'Queued from AI Discovery',
      evidence: lead.scoreReasons || [],
      timeframe: 'Action required now',
    },
    primaryActionLabel: 'Start AI Call',
    primaryActionTarget: `/calls/${lead.id}?leadId=${lead.id}`,
    primaryActionType: 'call' as const,
    status: 'active' as const,
    createdAt: new Date().toISOString(),
  }));
}

export const ActionCenter: React.FC = () => {
  const { t } = useI18n();
  const [activePriority, setActivePriority] = useState<'ALL' | ActionPriorityLevel>('ALL');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [actionsList, setActionsList] = useState<NextBestActionItem[]>(() => buildActionsFromQueue());
  const [viewState, setViewState] = useState<'normal' | 'loading' | 'empty' | 'error'>('normal');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const reloadActions = useCallback(() => {
    setActionsList(buildActionsFromQueue());
  }, []);

  useEffect(() => {
    reloadActions();
    const onQueueChange = () => reloadActions();
    window.addEventListener('vidur_queue_updated', onQueueChange);
    window.addEventListener('storage', onQueueChange);
    return () => {
      window.removeEventListener('vidur_queue_updated', onQueueChange);
      window.removeEventListener('storage', onQueueChange);
    };
  }, [reloadActions]);

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
    <div className="space-y-6 sm:space-y-8 select-none pb-16 sm:pb-20">
      {/* HEADER */}
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

      {/* QUALIFICATION WORKFLOW STEPPER BAR - Cleaner, more breathing room */}
      <div className="p-4 sm:p-5 rounded-2xl border border-thistle/20 bg-surface-0 flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6 shadow-sm">
        <div className="w-full md:w-2/3">
          <AnimatedStepper
            steps={[
              { id: '1', label: 'DETECT' },
              { id: '2', label: 'ENRICH' },
              { id: '3', label: 'QUALIFY' },
              { id: '4', label: 'EXECUTE' },
              { id: '5', label: 'CLOSE' },
            ]}
            currentStepIndex={3}
          />
        </div>
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          <AnimatedCircularProgress
            value={89}
            size={70}
            strokeWidth={6}
            label="READY"
            variant="success"
          />
          <div className="text-left font-mono">
            <span className="text-[10px] text-foreground-tertiary uppercase block">QUEUE VALUE</span>
            <AnimatedNumberTransition value={9.7} prefix="₹" suffix="L" decimals={1} className="text-lg text-emerald-400 font-bold" />
          </div>
        </div>
      </div>

      {viewState === 'loading' && <ActionCenterSkeleton />}
      {viewState === 'empty' && <ActionCenterEmptyState onResetFilter={handleResetFilter} />}
      {viewState === 'error' && <ActionCenterErrorState onRetry={() => setViewState('normal')} />}

      {viewState === 'normal' && (
        <main className="space-y-6 sm:space-y-8 animate-fade-in">
          <ActionSummaryGrid summary={mockActionSummary} />

          <section aria-label="Priority Next Best Actions" className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 border-b border-border pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-thistle/10 text-thistle border border-thistle/30">
                  <Target className="w-4 h-4" />
                </div>
                <h2 className="text-sm sm:text-base font-bold text-foreground tracking-tight flex items-center gap-2 flex-wrap">
                  <span>{t.actions.nextBestAction.title} ({filteredActions.length})</span>
                  <AnimatedBadge label="HIGH URGENCY" variant="urgent" pulse />
                </h2>
              </div>
              <span className="text-xs text-foreground-secondary font-mono">
                Sorted by Signal Urgency & Intent Score
              </span>
            </div>

            {filteredActions.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
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

          <section aria-label="Stalled Deals and Follow-up Dispatch Queue" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
              <StalledOpportunitiesCard deals={mockStalledDeals} />
              <FollowUpQueueCard />
            </div>
          </section>

          <section aria-label="Real-time Buying Signal Stream" className="space-y-4">
            <LiveSignalFeedCard signals={mockLiveSignals} />
          </section>
        </main>
      )}
    </div>
  );
};

export default ActionCenter;
