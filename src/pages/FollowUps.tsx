import React, { useState, useMemo, useCallback } from 'react';
import { toast } from 'sonner';
import { ExtendedFollowUpItem, mockFollowUpDataset } from '../data/mockFollowUps';
import { FollowUpHeader } from '../components/followUps/FollowUpHeader';
import { FollowUpCard } from '../components/followUps/FollowUpCard';
import { FollowUpDetailDrawer } from '../components/followUps/FollowUpDetailDrawer';
import { FollowUpSkeleton } from '../components/followUps/FollowUpSkeleton';
import { FollowUpEmptyState } from '../components/followUps/FollowUpEmptyState';
import { FollowUpErrorState } from '../components/followUps/FollowUpErrorState';
import { FollowUpSchedulerModal } from '../components/sales/workflow/FollowUpSchedulerModal';
import { FollowUpItem } from '../types/followUp';
import { CalendarCheck, Filter, Zap, Clock, ShieldCheck } from 'lucide-react';

export const FollowUps: React.FC = () => {
  const [items, setItems] = useState<ExtendedFollowUpItem[]>(mockFollowUpDataset);
  const [activeTab, setActiveTab] = useState<'ALL' | 'CRITICAL' | 'DUE_TODAY' | 'UPCOMING' | 'WAITING'>('ALL');
  const [viewState, setViewState] = useState<'normal' | 'loading' | 'empty' | 'error'>('normal');
  const [selectedItem, setSelectedItem] = useState<ExtendedFollowUpItem | null>(null);
  const [isSchedulerOpen, setIsSchedulerOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const urgentCount = useMemo(
    () => items.filter((i) => i.priority === 'HIGH' || i.timingLabel === 'DUE_NOW').length,
    [items]
  );

  const dueTodayCount = useMemo(
    () => items.filter((i) => i.timingLabel === 'DUE_TODAY' || i.timingLabel === 'DUE_NOW').length,
    [items]
  );

  const totalPipelineAtRisk = '₹1.29Cr';

  const filteredItems = useMemo(() => {
    switch (activeTab) {
      case 'CRITICAL':
        return items.filter((i) => i.priority === 'HIGH' || i.timingLabel === 'DUE_NOW');
      case 'DUE_TODAY':
        return items.filter((i) => i.timingLabel === 'DUE_TODAY' || i.timingLabel === 'DUE_NOW');
      case 'UPCOMING':
        return items.filter((i) => i.timingLabel === 'UPCOMING');
      case 'WAITING':
        return items.filter((i) => i.timingLabel === 'WAITING');
      default:
        return items;
    }
  }, [items, activeTab]);

  const handleComplete = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    toast.success('Follow-up marked as completed!');
  }, []);

  const handleReschedule = useCallback((item: ExtendedFollowUpItem) => {
    setIsSchedulerOpen(true);
    setSelectedItem(item);
  }, []);

  const handleConfirmSchedule = useCallback((newItem: FollowUpItem) => {
    const extendedNew: ExtendedFollowUpItem = {
      ...newItem,
      dealValue: '₹25.0L',
      timingLabel: 'DUE_TODAY',
      intentScore: 85,
      suggestedPitch: `Following up regarding ${newItem.companyName} upcoming requirements...`,
      previousInteraction: 'Scheduled by Sales Representative.',
    };

    setItems((prev) => [extendedNew, ...prev]);
    toast.success(`Follow-up scheduled for ${newItem.companyName} on ${newItem.date} at ${newItem.time}.`);
  }, []);

  const handleCompleteOutcome = useCallback((id: string, outcome: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    toast.success(`Follow-up completed: Outcome logged as "${outcome.replace(/_/g, ' ')}".`);
  }, []);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success('Follow-up sequence queue refreshed.');
    }, 550);
  }, []);

  return (
    <div className="space-y-8 select-none pb-16">
      {/* PAGE HEADER */}
      <FollowUpHeader
        urgentCount={urgentCount}
        dueTodayCount={dueTodayCount}
        totalPipelineAtRisk={totalPipelineAtRisk}
        onOpenScheduleModal={() => {
          setSelectedItem(null);
          setIsSchedulerOpen(true);
        }}
        viewState={viewState}
        onViewStateChange={setViewState}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />

      {/* VIEW STATE 1: LOADING */}
      {viewState === 'loading' && <FollowUpSkeleton />}

      {/* VIEW STATE 2: EMPTY */}
      {viewState === 'empty' && (
        <FollowUpEmptyState
          onOpenScheduleModal={() => {
            setSelectedItem(null);
            setIsSchedulerOpen(true);
          }}
        />
      )}

      {/* VIEW STATE 3: ERROR */}
      {viewState === 'error' && (
        <FollowUpErrorState onRetry={() => setViewState('normal')} />
      )}

      {/* VIEW STATE 4: NORMAL WORKSPACE */}
      {viewState === 'normal' && (
        <main className="space-y-6 animate-fade-in">
          {/* TAB FILTER CONTROLS */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-subtle pb-3">
            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: 'ALL', label: `All Items (${items.length})` },
                { id: 'CRITICAL', label: `Critical Urgent (${urgentCount})` },
                { id: 'DUE_TODAY', label: `Due Today (${dueTodayCount})` },
                { id: 'UPCOMING', label: 'Upcoming' },
                { id: 'WAITING', label: 'Waiting for Prospect' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`px-3 py-1.5 rounded-lg text-caption font-semibold transition-all ${
                    activeTab === tab.id
                      ? 'bg-primary text-white shadow-xs'
                      : 'bg-surface-1 text-foreground-tertiary hover:text-foreground border border-border-subtle'
                  }`}
                >
                  <span className={activeTab === tab.id ? 'text-white' : ''}>{tab.label}</span>
                </button>
              ))}
            </div>

            <span className="text-caption text-foreground-tertiary font-mono hidden md:inline">
              Prioritized by Buying Intent & Urgency
            </span>
          </div>

          {/* FOLLOW-UP CARDS GRID */}
          {filteredItems.length === 0 ? (
            <FollowUpEmptyState
              onOpenScheduleModal={() => {
                setSelectedItem(null);
                setIsSchedulerOpen(true);
              }}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredItems.map((item) => (
                <FollowUpCard
                  key={item.id}
                  item={item}
                  isSelected={selectedItem?.id === item.id}
                  onSelect={(selected) => setSelectedItem(selected)}
                  onComplete={handleComplete}
                  onReschedule={handleReschedule}
                />
              ))}
            </div>
          )}
        </main>
      )}

      {/* DETAIL SLIDE-OVER DRAWER */}
      <FollowUpDetailDrawer
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onCompleteOutcome={handleCompleteOutcome}
      />

      {/* WORKFLOW SCHEDULER MODAL */}
      <FollowUpSchedulerModal
        isOpen={isSchedulerOpen}
        onClose={() => setIsSchedulerOpen(false)}
        leadId={selectedItem?.leadId || 'lead-1'}
        companyName={selectedItem?.companyName || 'Acme Logistics'}
        contactName={selectedItem?.contactName || 'Rahul Shah'}
        contactRole={selectedItem?.contactRole || 'VP Operations'}
        requirement="Enterprise Telematics Upgrade & API Dispatch"
        intentScore={selectedItem?.intentScore || 92}
        recommendedActionTitle={selectedItem?.title || 'Schedule Technical Demo Walkthrough'}
        recommendedReason={selectedItem?.reason || 'Prospect requested tier pricing proposal.'}
        onConfirmSchedule={handleConfirmSchedule}
      />
    </div>
  );
};

export default FollowUps;
