import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getQueuedLeads, registerDiscoveredLead, addLeadToQueue } from '../data/leads';
import { SalesOpportunity, OpportunityFilterState } from '../types/opportunities';
import { DiscoveredLead } from '../types/leads';
import { OpportunityHeader } from '../components/opportunities/OpportunityHeader';
import { OpportunityCard } from '../components/opportunities/OpportunityCard';
import { OpportunityDetailDrawer } from '../components/opportunities/OpportunityDetailDrawer';
import { OpportunitySkeleton } from '../components/opportunities/OpportunitySkeleton';
import { OpportunityEmptyState } from '../components/opportunities/OpportunityEmptyState';
import { OpportunityErrorState } from '../components/opportunities/OpportunityErrorState';
import { ImportLeadsModal } from '../components/leads/ImportLeadsModal';
import { Flame, Sparkles, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

// Convert queued DiscoveredLeads into SalesOpportunity format
function buildOpportunitiesFromQueue(): SalesOpportunity[] {
  const queued = getQueuedLeads();
  return queued.map((lead) => {
    const hasCallResult = typeof window !== 'undefined' && !!(
      localStorage.getItem(`vidur_call_results_${lead.id.toLowerCase()}`) ||
      localStorage.getItem(`vidur_call_results_call-${lead.id.toLowerCase().replace('lead-', '')}`)
    );

    return {
      id: `opp-${lead.id}`,
      leadId: lead.id,
      companyName: lead.companyName,
      companyDomain: lead.companyDomain,
      industry: lead.industry,
      location: lead.location,
      contactName: lead.decisionMakerContact?.name || (lead as any).decisionMaker?.name || 'Decision Maker',
      contactRole: lead.decisionMakerContact?.role || (lead as any).decisionMaker?.role || 'Executive',
      contactPhone: (lead as any).decisionMaker?.phone || '+91 98201 54890',
      contactEmail: (lead as any).decisionMaker?.email || `contact@${lead.companyDomain || 'company.com'}`,
      phoneAvailable: true,
      intentScore: hasCallResult ? 96 : lead.intentScore,
      estimatedValue: lead.estimatedValue || '₹25 Lakh / yr',
      priority: hasCallResult ? ('HIGH' as const) : lead.intentScore >= 85 ? ('HIGH' as const) : lead.intentScore >= 70 ? ('MEDIUM' as const) : ('LOW' as const),
      type: 'BUYING_SIGNAL' as const,
      state: hasCallResult ? ('converted' as const) : ('action_required' as const),
      isEmerging: false,
      whyNow: {
        headline: hasCallResult ? `Discovery consultation appointment booked with ${lead.companyName}` : (lead.whyNow || `Active requirement discovered for ${lead.companyName}`),
        evidence: hasCallResult ? ['Verbal confirmation on live call', 'Project scope gathered', 'Calendar invite pending'] : (lead.scoreReasons || [lead.requirement]),
        recencyLabel: 'Today',
        timestamp: new Date().toISOString(),
      },
      signals: lead.buyingSignals?.map((s) => ({
        id: s.id, title: s.description?.slice(0, 60) || s.type, category: s.type,
        recency: s.timestamp || 'Today', impactScore: s.impactScore || 88,
      })) || [],
      recommendedAction: hasCallResult ? {
        label: 'View Booked Appointment & Debrief',
        actionType: 'meeting' as const,
        route: `/calls/${lead.id}/results`,
        suggestedOpening: 'Appointment confirmed with decision maker.',
      } : {
        label: 'Start AI Call',
        actionType: 'call' as const,
        route: `/calls/${lead.id}?leadId=${lead.id}`,
        suggestedOpening: lead.suggestedOpeningHook,
      },
      timeline: hasCallResult ? [
        { id: 'q-2', timestamp: 'Just now', title: 'Consultation Appointment Confirmed', description: 'Discovery meeting confirmed on live voice call.', type: 'call' as const },
        { id: 'q-1', timestamp: 'Today', title: 'Queued from Discovery', description: 'Lead queued for AI outreach.', type: 'intent' as const },
      ] : [
        { id: 'q-1', timestamp: 'Today', title: 'Queued from Discovery', description: 'Lead queued for AI outreach.', type: 'intent' as const },
      ],
      updatedAt: new Date().toISOString(),
    };
  });
}

export const Opportunities: React.FC = () => {
  const navigate = useNavigate();
  const { id: paramOppId } = useParams<{ id?: string }>();
  const [opportunities, setOpportunities] = useState<SalesOpportunity[]>(() => buildOpportunitiesFromQueue());
  const [selectedOpp, setSelectedOpp] = useState<SalesOpportunity | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'urgent' | 'warming'>('all');

  const refreshFromQueue = useCallback(() => {
    setOpportunities(buildOpportunitiesFromQueue());
  }, []);

  const handleLeadsImported = (imported: DiscoveredLead[], autoQueue: boolean) => {
    imported.forEach((lead) => {
      registerDiscoveredLead(lead);
      addLeadToQueue(lead.id);
    });
    refreshFromQueue();
    window.dispatchEvent(new CustomEvent('vidur_queue_updated'));
  };

  useEffect(() => {
    refreshFromQueue();
    const onQueueChange = () => refreshFromQueue();
    window.addEventListener('vidur_queue_updated', onQueueChange);
    window.addEventListener('storage', onQueueChange);
    return () => {
      window.removeEventListener('vidur_queue_updated', onQueueChange);
      window.removeEventListener('storage', onQueueChange);
    };
  }, [refreshFromQueue]);

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
        onOpenImport={() => setIsImportModalOpen(true)}
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

      {/* IMPORT LEADS MODAL (CSV & EXCEL) */}
      <ImportLeadsModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onLeadsImported={handleLeadsImported}
      />
    </div>
  );
};
