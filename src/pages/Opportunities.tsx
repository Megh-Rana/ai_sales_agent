import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { mockOpportunities } from '../data/mockOpportunities';
import { getQueuedLeads } from '../data/leads';
import { SalesOpportunity, OpportunityFilterState } from '../types/opportunities';
import { OpportunityHeader } from '../components/opportunities/OpportunityHeader';
import { OpportunityCard } from '../components/opportunities/OpportunityCard';
import { OpportunityDetailDrawer } from '../components/opportunities/OpportunityDetailDrawer';
import { OpportunitySkeleton } from '../components/opportunities/OpportunitySkeleton';
import { OpportunityEmptyState } from '../components/opportunities/OpportunityEmptyState';
import { OpportunityErrorState } from '../components/opportunities/OpportunityErrorState';
import { Flame, Sparkles, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

// Convert queued DiscoveredLeads into SalesOpportunity format
function buildOpportunitiesFromQueue(): SalesOpportunity[] {
  const queued = getQueuedLeads();
  return queued.map((lead) => ({
    id: `opp-${lead.id}`,
    leadId: lead.id,
    companyName: lead.companyName,
    companyDomain: lead.companyDomain,
    industry: lead.industry,
    location: lead.location,
    contactName: lead.decisionMakerContact?.name || 'Decision Maker',
    contactRole: lead.decisionMakerContact?.role || 'Executive',
    contactPhone: (lead as any).decisionMaker?.phone || '',
    contactEmail: (lead as any).decisionMaker?.email || '',
    phoneAvailable: lead.decisionMakerContact?.phoneAvailable || false,
    intentScore: lead.intentScore,
    estimatedValue: lead.estimatedValue || '₹20 Lakh / yr',
    priority: lead.intentScore >= 85 ? 'HIGH' as const : lead.intentScore >= 70 ? 'MEDIUM' as const : 'LOW' as const,
    type: 'BUYING_SIGNAL' as const,
    state: 'action_required' as const,
    isEmerging: false,
    whyNow: {
      headline: lead.whyNow || 'Queued from AI Lead Discovery',
      evidence: lead.scoreReasons || [],
      recencyLabel: 'Just now',
      timestamp: new Date().toISOString(),
    },
    signals: lead.buyingSignals?.map((s) => ({
      id: s.id, title: s.description?.slice(0, 60) || s.type, category: s.type,
      recency: s.timestamp, impactScore: s.impactScore,
    })) || [],
    recommendedAction: {
      label: 'Start AI Call',
      actionType: 'call' as const,
      route: `/calls/call-${lead.id}?leadId=${lead.id}`,
      suggestedOpening: lead.suggestedOpeningHook,
    },
    timeline: [
      { id: 'q-1', timestamp: 'Just now', title: 'Queued from Discovery', description: `Lead queued for outreach from AI Discovery.`, type: 'intent' as const },
    ],
    updatedAt: new Date().toISOString(),
  }));
}

export const Opportunities: React.FC = () => {
  const navigate = useNavigate();
  const { id: paramOppId } = useParams<{ id?: string }>();
  const [opportunities, setOpportunities] = useState<SalesOpportunity[]>(() => {
    const fromQueue = buildOpportunitiesFromQueue();
    // Queued leads first, then mock data
    return [...fromQueue, ...mockOpportunities];
  });
  const [selectedOpp, setSelectedOpp] = useState<SalesOpportunity | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'urgent' | 'warming'>('all');

  useEffect(() => {
    if (paramOppId) {
      const match = opportunities.find((o) => o.id === paramOppId || o.leadId === paramOppId);
      if (match) {
        setSelectedOpp(match);
        setIsDrawerOpen(true);
      }
    }
  }, [paramOppId, opportunities]);

  const [filters, setFilters] = useState<OpportunityFilterState>({
    search: '',
    priority: 'all',
    type: 'all',
    state: 'all',
    timeframe: 'all',
  });

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success('Opportunity Radar refreshed with live market signals.');
    }, 800);
  };

  const handleExecuteAction = (opp: SalesOpportunity, actionType: string) => {
    if (actionType === 'call') {
      toast.info(`Launching voice agent call for ${opp.contactName}...`);
      navigate(`/calls?leadId=${opp.leadId}`);
    } else if (actionType === 'email' || actionType === 'followup') {
      toast.info(`Opening follow-up task for ${opp.companyName}...`);
      navigate(`/follow-ups?leadId=${opp.leadId}`);
    } else if (actionType === 'campaign') {
      toast.info(`Opening outreach campaign for ${opp.companyName}...`);
      navigate(`/campaigns`);
    } else {
      setSelectedOpp(opp);
      setIsDrawerOpen(true);
    }
  };

  const handleUpdateState = (oppId: string, newState: SalesOpportunity['state']) => {
    setOpportunities((prev) =>
      prev.map((o) => (o.id === oppId ? { ...o, state: newState } : o))
    );
    if (selectedOpp?.id === oppId) {
      setSelectedOpp((prev) => (prev ? { ...prev, state: newState } : null));
    }
  };

  // Filtered lists computation
  const filteredOpportunities = useMemo(() => {
    return opportunities.filter((opp) => {
      // Tab filter
      if (activeTab === 'urgent' && opp.isEmerging) return false;
      if (activeTab === 'warming' && !opp.isEmerging) return false;

      // Priority Filter
      if (filters.priority !== 'all') {
        if (filters.priority === 'high' && opp.priority !== 'HIGH') return false;
        if (filters.priority === 'medium' && opp.priority !== 'MEDIUM') return false;
        if (filters.priority === 'low' && opp.priority !== 'LOW') return false;
      }

      // Type Filter
      if (filters.type !== 'all' && opp.type !== filters.type) return false;

      // Search Query
      if (filters.search.trim() !== '') {
        const q = filters.search.toLowerCase();
        const matchesName = opp.companyName.toLowerCase().includes(q);
        const matchesContact = opp.contactName.toLowerCase().includes(q);
        const matchesIndustry = opp.industry.toLowerCase().includes(q);
        const matchesHeadline = opp.whyNow.headline.toLowerCase().includes(q);
        if (!matchesName && !matchesContact && !matchesIndustry && !matchesHeadline) return false;
      }

      return true;
    });
  }, [opportunities, filters, activeTab]);

  // Urgent vs Emerging Split for step 4 & step 11
  const urgentOpportunities = useMemo(() => {
    return filteredOpportunities.filter((o) => !o.isEmerging);
  }, [filteredOpportunities]);

  const emergingOpportunities = useMemo(() => {
    return filteredOpportunities.filter((o) => o.isEmerging);
  }, [filteredOpportunities]);

  const urgentCountTotal = useMemo(() => opportunities.filter((o) => !o.isEmerging).length, [opportunities]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col pb-16">
      {/* OPPORTUNITY RADAR HEADER */}
      <OpportunityHeader
        totalCount={opportunities.length}
        urgentCount={urgentCountTotal}
        newSignalsCount={3}
        filters={filters}
        onFilterChange={setFilters}
        onRefresh={handleRefresh}
        isRefreshing={isLoading}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 px-6 py-6 max-w-7xl w-full mx-auto space-y-8">
        {isLoading ? (
          <OpportunitySkeleton />
        ) : isError ? (
          <OpportunityErrorState onRetry={handleRefresh} />
        ) : filteredOpportunities.length === 0 ? (
          <OpportunityEmptyState
            type={activeTab}
            onResetFilters={() =>
              setFilters({ search: '', priority: 'all', type: 'all', state: 'all', timeframe: 'all' })
            }
          />
        ) : (
          <div className="space-y-8">
            {/* SECTION 1: PRIORITY OPPORTUNITIES (ACTION REQUIRED NOW) */}
            {(activeTab === 'all' || activeTab === 'urgent') && urgentOpportunities.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-border-subtle pb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                      <Flame className="w-4 h-4" />
                    </div>
                    <h2 className="text-h4 font-bold text-foreground tracking-tight">
                      Action Required Now
                    </h2>
                    <span className="text-xs font-mono font-medium text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                      {urgentOpportunities.length} Urgent
                    </span>
                  </div>
                  <span className="text-caption text-foreground-tertiary">
                    Prioritized by intent surge & buyer triggers
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {urgentOpportunities.map((opp) => (
                    <OpportunityCard
                      key={opp.id}
                      opportunity={opp}
                      onSelect={(o) => {
                        setSelectedOpp(o);
                        setIsDrawerOpen(true);
                      }}
                      onExecuteAction={handleExecuteAction}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* SECTION 2: EMERGING / WARMING OPPORTUNITIES */}
            {(activeTab === 'all' || activeTab === 'warming') && emergingOpportunities.length > 0 && (
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between border-b border-border-subtle pb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <h2 className="text-h4 font-bold text-foreground tracking-tight">
                      Emerging & Warming Opportunities
                    </h2>
                    <span className="text-xs font-mono font-medium text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/30">
                      {emergingOpportunities.length} Warming
                    </span>
                  </div>
                  <span className="text-caption text-foreground-tertiary">
                    High intent engagement, warming up for outreach
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {emergingOpportunities.map((opp) => (
                    <OpportunityCard
                      key={opp.id}
                      opportunity={opp}
                      onSelect={(o) => {
                        setSelectedOpp(o);
                        setIsDrawerOpen(true);
                      }}
                      onExecuteAction={handleExecuteAction}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* DETAIL DRAWER */}
      <OpportunityDetailDrawer
        opportunity={selectedOpp}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onUpdateState={handleUpdateState}
      />
    </div>
  );
};
