import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockDashboardData, DashboardData } from '../data/dashboard';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { PipelineSnapshot } from '../components/dashboard/PipelineSnapshot';
import { PriorityOpportunities } from '../components/dashboard/PriorityOpportunities';
import { NextBestAction } from '../components/dashboard/NextBestAction';
import { BuyingSignals } from '../components/dashboard/BuyingSignals';
import { FollowUpQueue } from '../components/dashboard/FollowUpQueue';
import { SalesFunnel } from '../components/dashboard/SalesFunnel';
import { AICallSnapshot } from '../components/dashboard/AICallSnapshot';
import { RecentActivity } from '../components/dashboard/RecentActivity';
import { CardSkeleton, MetricSkeleton } from '../components/feedback/Skeleton';
import { EmptyState } from '../components/feedback/EmptyState';
import { ErrorState } from '../components/feedback/ErrorState';
import { Zap, Activity } from 'lucide-react';
import { useI18n } from '../i18n/i18nContext';

export const Dashboard: React.FC = () => {
  const { t } = useI18n();
  const [data, setData] = useState<DashboardData>(mockDashboardData);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [viewState, setViewState] = useState<'normal' | 'loading' | 'empty' | 'error'>('normal');
  const [rightFeedTab, setRightFeedTab] = useState<'signals' | 'activity'>('signals');
  const [isScanning, setIsScanning] = useState(false);
  const navigate = useNavigate();

  // Instant signal scan simulation
  const handleInstantScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
    }, 800);
  };

  // Filtered opportunities based on header selection
  const displayedOpportunities = data.priorityOpportunities.filter((opp) => {
    if (activeFilter === 'call-ready') {
      return opp.salesStatus === 'high-intent' || opp.salesStatus === 'qualified';
    }
    if (activeFilter === 'needs-followup') {
      return opp.salesStatus === 'follow-up' || opp.salesStatus === 'contacted';
    }
    return true;
  });

  return (
    <div className="space-y-6 select-none pb-8">
      {/* DASHBOARD HEADER */}
      <DashboardHeader
        workspaceName={data.workspace.name}
        division={data.workspace.division}
        shiftBriefing={data.workspace.shiftBriefing}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        onInstantScan={handleInstantScan}
        isScanning={isScanning}
      />

      {/* VIEW STATE 1: LOADING SKELETON */}
      {viewState === 'loading' && (
        <div className="space-y-6">
          <CardSkeleton className="h-32 w-full" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            {[1, 2, 3, 4].map((i) => (
              <MetricSkeleton key={i} />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 space-y-6">
              <CardSkeleton className="h-96 w-full" />
              <CardSkeleton className="h-44 w-full" />
            </div>
            <div className="lg:col-span-4 space-y-6">
              <CardSkeleton className="h-64 w-full" />
              <CardSkeleton className="h-64 w-full" />
            </div>
          </div>
        </div>
      )}

      {/* VIEW STATE 2: ERROR STATE */}
      {viewState === 'error' && (
        <ErrorState
          title="Telemetry Signal Stream Disrupted"
          message="Could not establish real-time connection with Vidur Voice Gateway and signal ingestion engine. Showing offline snapshot."
          onRetry={() => setViewState('normal')}
          className="my-10"
        />
      )}

      {/* VIEW STATE 3: EMPTY QUEUE STATE */}
      {viewState === 'empty' && (
        <EmptyState
          title="All Priority Opportunities Cleared"
          description="Your sales team has executed all high-intent opportunities for today. Autonomous agents are scanning 42 web feeds for new triggers."
          actionLabel="Run Signal Discovery Scan"
          onAction={handleInstantScan}
          className="my-10"
        />
      )}

      {/* VIEW STATE 4: NORMAL DASHBOARD WORKBENCH */}
      {viewState === 'normal' && (
        <>
          {/* REVENUE COMMAND CENTER DASHBOARD ENTRY POINT */}
          <div
            onClick={() => navigate('/command-center')}
            className="p-4 rounded-xl bg-surface-0 border border-border-default hover:border-primary/50 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group relative overflow-hidden"
          >
            {/* Left accent stripe */}
            <div className="absolute top-0 left-0 bottom-0 w-1 bg-primary rounded-l-xl" />

            <div className="flex items-center gap-3 pl-2">
              <div className="w-9 h-9 rounded-lg bg-surface-1 border border-border-subtle text-primary flex items-center justify-center shrink-0">
                <Activity className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </div>
              <div>
                <div className="text-small font-bold text-foreground flex items-center gap-2">
                  <span>{t.dashboard?.commandCenterBanner || 'Revenue Command Center • 7 Opportunities & 4 Urgent Actions Pending'}</span>
                </div>
                <div className="text-caption text-foreground-tertiary">
                  {t.dashboard?.commandCenterSub || '₹1.54 Cr Active Pipeline Value • 88% Automated Voice Qualification Rating'}
                </div>
              </div>
            </div>

            <button
              type="button"
              className="px-3.5 py-1.5 text-xs font-semibold text-primary-foreground bg-primary hover:bg-primary-hover rounded-lg transition-colors shrink-0 self-start sm:self-auto cursor-pointer"
            >
              {t.dashboard?.openCommandCenter || 'Open Revenue Command Center →'}
            </button>
          </div>

          {/* SECTION 1: NEXT BEST ACTION (HERO PRIORITY 1) */}
          <NextBestAction
            data={data.nextBestAction}
            onDispatchCall={() => navigate('/calls')}
            onPreviewBrief={(id) => navigate(`/leads/${id}`)}
          />

          {/* SECTION 2: OPERATIONAL METRICS STRIP (FULL WIDTH) */}
          <PipelineSnapshot metrics={data.metrics} />

          {/* SECTION 3: ASYMMETRICAL 65/35 WORKBENCH COMPOSITION */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT COLUMN: PRIORITY OPPORTUNITIES QUEUE & FUNNEL (65% width on desktop) */}
            <div className="lg:col-span-8 space-y-6">
              {/* PRIMARY VISUAL FOCUS: PRIORITY OPPORTUNITIES QUEUE */}
              <PriorityOpportunities
                opportunities={displayedOpportunities}
                onCallOpportunity={() => navigate('/calls')}
              />

              {/* SALES FUNNEL VELOCITY TRACKER */}
              <SalesFunnel stages={data.funnelStages} />
            </div>

            {/* RIGHT COLUMN: COMMITMENTS, AGENT CALL & INTELLIGENCE (35% width on desktop) */}
            <div className="lg:col-span-4 space-y-6">
              {/* FOLLOW-UP EXECUTION COMMITMENTS (URGENT TOP) */}
              <FollowUpQueue items={data.urgentFollowUps} />

              {/* LATEST AI VOICE CALL SNAPSHOT */}
              <AICallSnapshot call={data.recentAICall} />

              {/* TABBED INTELLIGENCE & RECENT ACTIVITY FEED */}
              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-1 bg-surface-1 p-0.5 rounded-lg border border-border-subtle text-xs">
                    <button
                      type="button"
                      onClick={() => setRightFeedTab('signals')}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition-colors ${
                        rightFeedTab === 'signals'
                          ? 'bg-surface-elevated text-foreground font-semibold shadow-xs'
                          : 'text-foreground-secondary hover:text-foreground'
                      }`}
                    >
                      <Zap className="w-3 h-3 text-signal-high" />
                      <span>{t.dashboard?.liveSignalsTab || 'Live Signals'} (4)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRightFeedTab('activity')}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition-colors ${
                        rightFeedTab === 'activity'
                          ? 'bg-surface-elevated text-foreground font-semibold shadow-xs'
                          : 'text-foreground-secondary hover:text-foreground'
                      }`}
                    >
                      <Activity className="w-3 h-3 text-primary" />
                      <span>{t.dashboard?.agentActivityTab || 'Agent Activity'}</span>
                    </button>
                  </div>
                </div>

                {rightFeedTab === 'signals' ? (
                  <BuyingSignals />
                ) : (
                  <RecentActivity activities={data.recentActivities} />
                )}
              </div>
            </div>
          </div>
        </>
      )}


    </div>
  );
};

export default Dashboard;

