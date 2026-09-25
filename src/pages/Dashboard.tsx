import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockDashboardData, DashboardData, AICallSnapshotData } from '../data/dashboard';
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
import { toast } from 'sonner';
import { BuyingSignalItem } from '../components/dashboard/BuyingSignals';
import { formatExecutiveTakeaway } from '../utils/summaryUtils';

export const Dashboard: React.FC = () => {
  const { t } = useI18n();
  const [data, setData] = useState<DashboardData>(mockDashboardData);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [viewState, setViewState] = useState<'normal' | 'loading' | 'empty' | 'error'>('normal');
  const [rightFeedTab, setRightFeedTab] = useState<'signals' | 'activity'>('signals');
  const [isScanning, setIsScanning] = useState(false);
  const [liveSignals, setLiveSignals] = useState<BuyingSignalItem[]>([
    {
      id: 'bs-101',
      opportunityId: 'opp-101',
      companyName: 'Razorpay',
      type: 'Hiring Surge',
      description: 'Hiring 5 Outbound SDRs & Head of Sales Ops; legacy dialer contract renewal in 45 days.',
      timestamp: '42m ago',
      impactScore: 95,
    },
    {
      id: 'bs-102',
      opportunityId: 'opp-102',
      companyName: 'Freshworks',
      type: 'Tech Migration',
      description: 'Legacy telephony provider decommissioned; evaluating sub-50ms AI voice calling API.',
      timestamp: '1h ago',
      impactScore: 92,
    },
    {
      id: 'bs-103',
      opportunityId: 'opp-103',
      companyName: 'PharmEasy',
      type: 'Growth Capital',
      description: 'Series-D ₹200 Cr round closed; evaluating compliance-grade outbound AI voice qualification.',
      timestamp: '3h ago',
      impactScore: 91,
    },
    {
      id: 'bs-104',
      opportunityId: 'opp-104',
      companyName: 'Delhivery',
      type: 'Intent Surge',
      description: 'Category comparison surge logged on G2 matrix; multi-touch distribution hub evaluation.',
      timestamp: '5h ago',
      impactScore: 86,
    },
  ]);
  const navigate = useNavigate();

  // Load and synchronize actual past AI voice agent call from localStorage and database
  useEffect(() => {
    // 1. Check local storage for actual completed call session or snapshot
    try {
      const savedSnapshot = localStorage.getItem('vidur_latest_ai_call_snapshot');
      if (savedSnapshot) {
        const parsed = JSON.parse(savedSnapshot);
        if (parsed && parsed.companyName) {
          setData((prev) => ({
            ...prev,
            recentAICall: parsed
          }));
        }
      } else {
        const savedCall = localStorage.getItem('vidur_latest_completed_call');
        if (savedCall) {
          const parsed = JSON.parse(savedCall);
          if (parsed && parsed.companyName) {
            const durationSec = typeof parsed.duration === 'number' ? parsed.duration : 148;
            const mins = Math.floor(durationSec / 60);
            const secs = durationSec % 60;
            const snapshotData: AICallSnapshotData = {
              id: parsed.callId || 'call-snap-razorpay',
              opportunityId: parsed.leadId || 'opp-101',
              companyName: parsed.companyName,
              contactName: parsed.contactName || 'Executive Lead',
              contactRole: parsed.contactRole || 'Director of Operations',
              duration: `${mins}m ${secs.toString().padStart(2, '0')}s`,
              completedAt: 'Just now',
              telephonyStatus: 'Completed (SIP 38ms)',
              latencyMs: 38,
              sentimentScore: 94,
              qualificationStatus: 'QUALIFIED',
              qualificationCriteria: {
                budget: true,
                authority: true,
                need: true,
                timeline: true,
              },
              keyTakeaway: formatExecutiveTakeaway(parsed.summary) || `Autonomous call completed with ${parsed.contactName || 'prospect'}. Commercial cadence confirmed.`,
              primaryObjection: 'Inquired on Tier-2 regional network latency and Salesforce bidirectional sync reliability.',
              recommendedNextStep: 'Send calendar invitation and technical architecture memo.',
            };
            setData((prev) => ({
              ...prev,
              recentAICall: snapshotData
            }));
          }
        }
      }
    } catch (err) {
      console.error('Error reading saved call snapshot:', err);
    }

    // 2. Fetch authentic database call from backend
    const fetchLatestCall = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/calls/latest');
        if (res.ok) {
          const json = await res.json();
          if (json.call && json.call.companyName) {
            setData((prev) => ({
              ...prev,
              recentAICall: json.call
            }));
            try {
              localStorage.setItem('vidur_latest_ai_call_snapshot', JSON.stringify(json.call));
            } catch {}
          }
        }
      } catch (err) {
        // Backend offline or unreachable
      }
    };
    fetchLatestCall();

    // 3. Listen to live call completion events from AICalling.tsx
    const handleCallCompleted = (evt: any) => {
      if (evt.detail && evt.detail.companyName) {
        setData((prev) => ({
          ...prev,
          recentAICall: evt.detail
        }));
      } else {
        fetchLatestCall();
      }
    };
    window.addEventListener('vidur_latest_call_updated', handleCallCompleted);
    window.addEventListener('vidur_call_completed', handleCallCompleted);

    return () => {
      window.removeEventListener('vidur_latest_call_updated', handleCallCompleted);
      window.removeEventListener('vidur_call_completed', handleCallCompleted);
    };
  }, []);

  // Instant signal scan execution
  const handleInstantScan = () => {
    if (isScanning) return;
    setIsScanning(true);
    toast.loading('Autonomous agent scanning 42 live B2B feeds for buying triggers...', { id: 'scan-signals' });

    setTimeout(() => {
      setIsScanning(false);

      // Create new fresh buying signals
      const scanTimestamp = 'Just now';
      const newSignals: BuyingSignalItem[] = [
        {
          id: `bs-scanned-${Date.now()}-1`,
          opportunityId: 'opp-106',
          companyName: 'Zerodha Tech',
          type: 'API Telemetry Spike',
          description: 'Sandbox testing logged 45+ simulated voice calls in last 30 minutes.',
          timestamp: scanTimestamp,
          impactScore: 97,
        },
        {
          id: `bs-scanned-${Date.now()}-2`,
          opportunityId: 'opp-107',
          companyName: 'Pine Labs',
          type: 'Retail Expansion',
          description: 'Merchant acquisition team launched Tier-2 regional POS outreach.',
          timestamp: scanTimestamp,
          impactScore: 94,
        },
        {
          id: `bs-scanned-${Date.now()}-3`,
          opportunityId: 'opp-108',
          companyName: 'Meesho Marketplace',
          type: 'Supplier Surge',
          description: '50,000 new marketplace sellers registered; outbound activation required.',
          timestamp: scanTimestamp,
          impactScore: 91,
        },
      ];

      setLiveSignals((prev) => [...newSignals, ...prev]);

      // Update data metrics and activities
      setData((prev) => {
        const updatedMetrics = prev.metrics.map((m) => {
          if (m.id === 'metric-signals') {
            const currentVal = parseInt(m.value) || 142;
            return {
              ...m,
              value: String(currentVal + 3),
              trendValue: '+17% surge today',
            };
          }
          if (m.id === 'metric-high-intent') {
            const currentVal = parseInt(m.value) || 18;
            return {
              ...m,
              value: String(currentVal + 1),
            };
          }
          return m;
        });

        const newActivity = {
          id: `act-scan-${Date.now()}`,
          timestamp: 'Just now',
          title: 'Buying Signals Scan Completed',
          description: 'Scanned 42 B2B feeds; 3 high-impact buying signals ingested into pipeline.',
          category: 'signal' as const,
          status: 'Score 97',
        };

        return {
          ...prev,
          metrics: updatedMetrics,
          recentActivities: [newActivity, ...prev.recentActivities],
        };
      });

      // Switch tab to signals so user immediately sees newly discovered signals
      setRightFeedTab('signals');

      if (viewState === 'empty') {
        setViewState('normal');
      }

      toast.success('Live Buying Signals Ingested!', {
        id: 'scan-signals',
        description: 'Captured 3 fresh buyer intent triggers across 42 B2B feeds. Pipeline refreshed.',
        duration: 4000,
      });
    }, 1200);
  };

  // Dynamic filter counts
  const filterCounts = useMemo(() => {
    return {
      all: data.priorityOpportunities.length,
      callReady: data.priorityOpportunities.filter(
        (opp) => opp.callReady || opp.salesStatus === 'high-intent' || opp.salesStatus === 'qualified' || opp.salesStatus === 'meeting'
      ).length,
      followup: data.priorityOpportunities.filter(
        (opp) => Boolean(opp.followUpDue) || opp.salesStatus === 'follow-up' || opp.salesStatus === 'contacted'
      ).length,
    };
  }, [data.priorityOpportunities]);

  // Filtered opportunities based on header selection
  const displayedOpportunities = useMemo(() => {
    return data.priorityOpportunities.filter((opp) => {
      if (activeFilter === 'call-ready') {
        return opp.callReady || opp.salesStatus === 'high-intent' || opp.salesStatus === 'qualified' || opp.salesStatus === 'meeting';
      }
      if (activeFilter === 'needs-followup') {
        return Boolean(opp.followUpDue) || opp.salesStatus === 'follow-up' || opp.salesStatus === 'contacted';
      }
      return true;
    });
  }, [data.priorityOpportunities, activeFilter]);

  // Dynamically tailor Next Best Action based on the selected filter
  const currentNextBestAction = useMemo(() => {
    if (activeFilter === 'call-ready') {
      const topCall = data.priorityOpportunities.find(
        (opp) => opp.callReady || opp.salesStatus === 'high-intent' || opp.salesStatus === 'qualified'
      );
      if (topCall) {
        return {
          opportunityId: topCall.id,
          companyName: topCall.companyName,
          industry: topCall.industry,
          contactName: topCall.contactName || 'Decision Maker',
          contactRole: topCall.contactRole || 'Executive Lead',
          intentScore: topCall.intentScore,
          scoreDelta: 14,
          urgentReason: `Verified telephony & buying signals detected. Ready for immediate autonomous AI voice qualification.`,
          suggestedOpeningHook: `Calling regarding ${topCall.requirement.toLowerCase()}...`,
          primaryActionLabel: 'Dispatch AI Voice Call',
          primaryActionType: 'call' as const,
          signalPlatform: topCall.signalSource?.platform || 'Voice Gateway',
          signalDiscoveredAt: topCall.signalSource?.discoveredAt || 'Active',
          estimatedValue: topCall.estimatedValue,
        };
      }
    } else if (activeFilter === 'needs-followup') {
      const topFollowup = data.priorityOpportunities.find(
        (opp) => Boolean(opp.followUpDue) || opp.salesStatus === 'follow-up'
      );
      if (topFollowup) {
        return {
          opportunityId: topFollowup.id,
          companyName: topFollowup.companyName,
          industry: topFollowup.industry,
          contactName: topFollowup.contactName || 'Primary Contact',
          contactRole: topFollowup.contactRole || 'Key Stakeholder',
          intentScore: topFollowup.intentScore,
          scoreDelta: 9,
          urgentReason: `${topFollowup.followUpDue || 'Due today'}: ${topFollowup.followUpTask || 'Scheduled touchpoint required'}`,
          suggestedOpeningHook: `Following up on our previous outbound discussions...`,
          primaryActionLabel: 'Execute Follow-up',
          primaryActionType: 'email' as const,
          signalPlatform: 'CRM Cadence Sync',
          signalDiscoveredAt: topFollowup.followUpDue || 'Due now',
          estimatedValue: topFollowup.estimatedValue,
        };
      }
    }
    return data.nextBestAction;
  }, [activeFilter, data]);

  // Dynamically accent metrics in PipelineSnapshot according to filter
  const dynamicMetrics = useMemo(() => {
    return data.metrics.map((metric) => {
      if (activeFilter === 'call-ready') {
        return {
          ...metric,
          isAccent: metric.id === 'metric-ai-calls',
        };
      }
      if (activeFilter === 'needs-followup') {
        return {
          ...metric,
          isAccent: metric.id === 'metric-pipeline-value',
        };
      }
      return {
        ...metric,
        isAccent: metric.id === 'metric-high-intent',
      };
    });
  }, [data.metrics, activeFilter]);

  return (
    <div className="space-y-6 select-none pb-8">
      {/* DASHBOARD HEADER */}
      <DashboardHeader
        workspaceName={data.workspace.name}
        division={data.workspace.division}
        shiftBriefing={data.workspace.shiftBriefing}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        counts={filterCounts}
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
            className="p-4 rounded-xl bg-surface-0 border border-thistle/30 hover:border-thistle/60 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group relative overflow-hidden shadow-xs"
          >
            {/* Left accent stripe matching UI color and flush with container edge */}
            <div className="absolute top-0 left-0 bottom-0 w-1 bg-thistle group-hover:bg-babyPink transition-colors" />

            <div className="flex items-center gap-3 pl-3">
              <div className="w-9 h-9 rounded-lg bg-thistle/10 border border-thistle/30 text-thistle flex items-center justify-center shrink-0 group-hover:bg-thistle/20 transition-all">
                <Activity className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </div>
              <div>
                <div className="text-small font-bold text-foreground flex items-center gap-2 group-hover:text-thistle transition-colors">
                  <span>{t.dashboard?.commandCenterBanner || 'Revenue Command Center • 7 Opportunities & 4 Urgent Actions Pending'}</span>
                </div>
                <div className="text-caption text-foreground-tertiary">
                  {t.dashboard?.commandCenterSub || '₹1.54 Cr Active Pipeline Value • 88% Automated Voice Qualification Rating'}
                </div>
              </div>
            </div>

            <button
              type="button"
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-thistle hover:bg-thistle/90 rounded-lg transition-colors shrink-0 self-start sm:self-auto cursor-pointer shadow-xs"
            >
              {t.dashboard?.openCommandCenter || 'Open Revenue Command Center →'}
            </button>
          </div>

          {/* SECTION 1: NEXT BEST ACTION (HERO PRIORITY 1) */}
          <NextBestAction
            data={currentNextBestAction}
            onDispatchCall={() => navigate('/calls')}
            onPreviewBrief={(id) => navigate(`/leads/${id}`)}
          />

          {/* SECTION 2: OPERATIONAL METRICS STRIP (FULL WIDTH) */}
          <PipelineSnapshot metrics={dynamicMetrics} />

          {/* SECTION 3: ASYMMETRICAL 65/35 WORKBENCH COMPOSITION */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT COLUMN: PRIORITY OPPORTUNITIES QUEUE & FUNNEL (65% width on desktop) */}
            <div className="lg:col-span-8 space-y-6">
              {/* PRIMARY VISUAL FOCUS: PRIORITY OPPORTUNITIES QUEUE */}
              <PriorityOpportunities
                opportunities={displayedOpportunities}
                onCallOpportunity={() => navigate('/calls')}
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
                totalCounts={filterCounts}
              />

              {/* SALES FUNNEL VELOCITY TRACKER */}
              <SalesFunnel stages={data.funnelStages} />
            </div>

            {/* RIGHT COLUMN: COMMITMENTS, AGENT CALL & INTELLIGENCE (35% width on desktop) */}
            <div className="lg:col-span-4 space-y-6">
              {/* FOLLOW-UP EXECUTION COMMITMENTS (URGENT TOP) */}
              <FollowUpQueue
                items={data.urgentFollowUps}
                isHighlighted={activeFilter === 'needs-followup'}
              />

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
                      <span>{t.dashboard?.liveSignalsTab || 'Live Signals'} ({liveSignals.length})</span>
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
                  <BuyingSignals signals={liveSignals} />
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

