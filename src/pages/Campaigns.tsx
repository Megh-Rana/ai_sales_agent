import React, { useState, useMemo, useCallback } from 'react';
import { toast } from 'sonner';
import { SalesCampaign } from '../types/campaigns';
import { mockCampaignsData } from '../data/mockCampaigns';
import { CampaignHeader } from '../components/campaigns/CampaignHeader';
import { CampaignCard } from '../components/campaigns/CampaignCard';
import { CampaignBuilderModal } from '../components/campaigns/CampaignBuilderModal';
import { CampaignCadenceProgress } from '../components/campaigns/CampaignCadenceProgress';
import { CampaignSkeleton } from '../components/campaigns/CampaignSkeleton';
import { CampaignEmptyState } from '../components/campaigns/CampaignEmptyState';
import { CampaignErrorState } from '../components/campaigns/CampaignErrorState';
import { Target } from 'lucide-react';

export const Campaigns: React.FC = () => {
  const [campaignsList, setCampaignsList] = useState<SalesCampaign[]>(mockCampaignsData);
  const [viewState, setViewState] = useState<'normal' | 'loading' | 'empty' | 'error'>('normal');
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const activeCount = useMemo(() => {
    return campaignsList.filter((c) => c.status === 'RUNNING' || c.status === 'READY').length;
  }, [campaignsList]);

  const totalPipelineValue = '₹1.85Cr';

  const handleToggleStatus = useCallback((id: string) => {
    setCampaignsList((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const newStatus = c.status === 'RUNNING' ? 'PAUSED' : 'RUNNING';
          toast.success(`Campaign "${c.name}" status updated to ${newStatus}`);
          return { ...c, status: newStatus };
        }
        return c;
      })
    );
  }, []);

  const handleLaunchNewCampaign = useCallback((newCampaign: SalesCampaign) => {
    setCampaignsList((prev) => [newCampaign, ...prev]);
    toast.success(`Campaign "${newCampaign.name}" launched successfully!`, {
      description: `Targeting ${newCampaign.targetAudienceCount} leads via AI Voice Agent Cadence.`,
    });
  }, []);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success('Campaign metrics updated');
    }, 600);
  }, []);

  return (
    <div className="space-y-8 select-none pb-16">
      {/* HEADER & CONTROLS */}
      <CampaignHeader
        activeCount={activeCount}
        totalPipelineValue={totalPipelineValue}
        onOpenCreateModal={() => setIsBuilderOpen(true)}
        viewState={viewState}
        onViewStateChange={setViewState}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />

      {/* VIEW STATE 1: LOADING */}
      {viewState === 'loading' && <CampaignSkeleton />}

      {/* VIEW STATE 2: EMPTY */}
      {viewState === 'empty' && (
        <CampaignEmptyState onOpenCreateModal={() => setIsBuilderOpen(true)} />
      )}

      {/* VIEW STATE 3: ERROR */}
      {viewState === 'error' && (
        <CampaignErrorState onRetry={() => setViewState('normal')} />
      )}

      {/* VIEW STATE 4: NORMAL WORKSPACE */}
      {viewState === 'normal' && (
        <main className="space-y-8 animate-fade-in">
          {/* CAMPAIGN CARDS GRID */}
          <section aria-label="Active Outreach Campaigns" className="space-y-4">
            <div className="flex items-center justify-between border-b border-border-subtle pb-2.5">
              <div className="flex items-center space-x-2">
                <div className="p-1 rounded bg-primary-muted text-primary border border-primary/30">
                  <Target className="w-4 h-4" aria-hidden="true" />
                </div>
                <h2 className="text-caption font-bold text-foreground tracking-tight uppercase font-mono">
                  Active & Scheduled Campaigns ({campaignsList.length})
                </h2>
              </div>
              <span className="text-caption text-foreground-tertiary font-mono">
                Sorted by Recency & Pipeline Value
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {campaignsList.map((campaign) => (
                <CampaignCard
                  key={campaign.id}
                  campaign={campaign}
                  onToggleStatus={handleToggleStatus}
                />
              ))}
            </div>
          </section>

          {/* OUTREACH CADENCE SEQUENCE VISUALIZER */}
          <section aria-label="Cadence Sequence Progress" className="space-y-4 pt-2">
            <CampaignCadenceProgress />
          </section>
        </main>
      )}

      {/* 5-STEP CAMPAIGN BUILDER MODAL */}
      <CampaignBuilderModal
        isOpen={isBuilderOpen}
        onClose={() => setIsBuilderOpen(false)}
        onLaunchCampaign={handleLaunchNewCampaign}
      />
    </div>
  );
};

export default Campaigns;
