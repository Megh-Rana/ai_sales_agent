import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Layers, CheckCircle2 } from 'lucide-react';
import { DiscoveredLead, DiscoveryFilterState } from '../types/leads';
import { mockDiscoveredLeads, getDiscoveredLeads, saveDiscoveredLeads, registerDiscoveredLead } from '../data/leads';
import { leadDiscoveryService } from '../services/leadService';
import { DiscoveryHeader } from '../components/leads/DiscoveryHeader';
import { DiscoveryControls } from '../components/leads/DiscoveryControls';
import { DiscoveryFilterDrawer } from '../components/leads/DiscoveryFilterDrawer';
import { AIDiscoveryProgress } from '../components/leads/AIDiscoveryProgress';
import { ResultsSummaryBar } from '../components/leads/ResultsSummaryBar';
import { PriorityOpportunityCard } from '../components/leads/PriorityOpportunityCard';
import { LeadResultRow } from '../components/leads/LeadResultRow';
import { NoResultsIntelligence } from '../components/leads/NoResultsIntelligence';
import { DiscoveryErrorState } from '../components/leads/DiscoveryErrorState';

const initialFilters: DiscoveryFilterState = {
  query: '',
  intentLevel: 'all',
  freshness: 'all',
  industries: [],
  locations: [],
  signalTypes: [],
  sources: [],
  sortBy: 'intent'
};

function matchesFreshness(postedAt: string, freshness: DiscoveryFilterState['freshness']): boolean {
  if (freshness === 'all') return true;
  const isToday = postedAt.includes('hour') || postedAt.includes('Today') || postedAt.includes('m ago') || postedAt.includes('min');
  if (freshness === 'today') return isToday;
  const is3d = isToday || postedAt.includes('1 day') || postedAt.includes('2 day') || postedAt.includes('3 day') || postedAt.includes('1d') || postedAt.includes('2d') || postedAt.includes('3d');
  if (freshness === '3d') return is3d;
  const is7d = is3d || postedAt.includes('4 day') || postedAt.includes('5 day') || postedAt.includes('6 day') || postedAt.includes('7 day') || postedAt.includes('week');
  if (freshness === '7d') return is7d;
  if (freshness === '30d') return true;
  return true;
}

function parseContractValue(val: string): number {
  const clean = val.replace(/[^0-9]/g, '');
  return clean ? parseInt(clean, 10) : 0;
}

export const LeadDiscovery: React.FC = () => {
  const navigate = useNavigate();

  // State
  const [filters, setFilters] = useState<DiscoveryFilterState>(initialFilters);
  const [allLeads, setAllLeads] = useState<DiscoveredLead[]>(() => getDiscoveredLeads());
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isError, setIsError] = useState(false);
  const [activeFeedback, setActiveFeedback] = useState<string | null>(null);

  // Active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.intentLevel !== 'all') count++;
    if (filters.freshness !== 'all') count++;
    count += filters.industries.length;
    count += filters.locations.length;
    count += filters.signalTypes.length;
    count += filters.sources.length;
    return count;
  }, [filters]);

  // Handle filter changes
  const handleFilterUpdate = (updates: Partial<DiscoveryFilterState>) => {
    setFilters((prev) => ({ ...prev, ...updates }));
  };

  const handleClearAllFilters = () => {
    setFilters(initialFilters);
  };

  const handleRemoveFilter = (key: keyof DiscoveryFilterState, value?: string) => {
    setFilters((prev) => {
      if (key === 'query') return { ...prev, query: '' };
      if (key === 'intentLevel') return { ...prev, intentLevel: 'all' };
      if (key === 'freshness') return { ...prev, freshness: 'all' };
      if (key === 'industries' && value) {
        return { ...prev, industries: prev.industries.filter((i) => i !== value) };
      }
      if (key === 'locations' && value) {
        return { ...prev, locations: prev.locations.filter((l) => l !== value) };
      }
      if (key === 'signalTypes' && value) {
        return { ...prev, signalTypes: prev.signalTypes.filter((s) => s !== value) };
      }
      if (key === 'sources' && value) {
        return { ...prev, sources: prev.sources.filter((s) => s !== value) };
      }
      return prev;
    });
  };

  // Autonomous Telemetry & Website Lead Scan
  const triggerScan = useCallback(async () => {
    setIsScanning(true);
    setIsError(false);

    try {
      const discovered = await leadDiscoveryService.discoverLeads({
        query: filters.query,
        limit: 6,
      });

      if (discovered && discovered.length > 0) {
        setAllLeads((prev) => {
          const existingIds = new Set(prev.map((l) => l.id.toLowerCase()));
          const newUnique = discovered.filter((l) => !existingIds.has(l.id.toLowerCase()));
          const updated = [...newUnique, ...prev];
          saveDiscoveredLeads(updated);
          return updated;
        });

        discovered.forEach(registerDiscoveredLead);

        const targetDesc = filters.query.trim()
          ? `Extracted intelligence from web sources for: "${filters.query}"`
          : 'Scanned live telemetry streams and synthesized high-intent leads.';

        toast.success(`Discovered ${discovered.length} commercial leads!`, {
          description: targetDesc,
          duration: 4500,
        });
      }
    } catch (err: any) {
      console.error('Lead discovery scan error:', err);
      setIsError(true);
      toast.error('Discovery scan interrupted', {
        description: err?.message || 'Unable to reach discovery pipeline.',
      });
    }
  }, [filters.query]);

  const handleScanComplete = () => {
    setIsScanning(false);
  };

  // Filter & Sort Logic
  const filteredLeads = useMemo(() => {
    return allLeads.filter((lead: DiscoveredLead) => {
      // 1. Text Query Filter
      if (filters.query.trim()) {
        const q = filters.query.toLowerCase();
        const matchesQuery =
          lead.companyName.toLowerCase().includes(q) ||
          (lead.companyDomain && lead.companyDomain.toLowerCase().includes(q)) ||
          lead.requirement.toLowerCase().includes(q) ||
          (lead.detailedPain && lead.detailedPain.toLowerCase().includes(q)) ||
          lead.industry.toLowerCase().includes(q) ||
          lead.location.toLowerCase().includes(q) ||
          lead.buyingSignals.some((sig) => sig.description.toLowerCase().includes(q) || sig.type.toLowerCase().includes(q));

        if (!matchesQuery) return false;
      }

      // 2. Intent Level Filter
      if (filters.intentLevel === 'high' && lead.intentScore < 80) return false;
      if (filters.intentLevel === 'medium' && (lead.intentScore < 50 || lead.intentScore >= 80))
        return false;
      if (filters.intentLevel === 'low' && lead.intentScore >= 50) return false;

      // 3. Freshness Filter
      if (!matchesFreshness(lead.source.postedAt, filters.freshness)) {
        return false;
      }

      // 4. Industries
      if (filters.industries.length > 0 && !filters.industries.includes(lead.industry)) {
        return false;
      }

      // 5. Locations
      if (filters.locations.length > 0 && !filters.locations.includes(lead.location)) {
        return false;
      }

      // 6. Buying Signal Types
      if (
        filters.signalTypes.length > 0 &&
        !lead.buyingSignals.some((sig) => filters.signalTypes.includes(sig.type))
      ) {
        return false;
      }

      // 7. Sources
      if (
        filters.sources.length > 0 &&
        !filters.sources.includes(lead.source.platform)
      ) {
        return false;
      }

      return true;
    }).sort((a: DiscoveredLead, b: DiscoveredLead) => {
      if (filters.sortBy === 'intent') {
        return b.intentScore - a.intentScore;
      }
      if (filters.sortBy === 'freshness') {
        const aIsHour = a.source.postedAt.includes('hour') || a.source.postedAt.includes('Today');
        const bIsHour = b.source.postedAt.includes('hour') || b.source.postedAt.includes('Today');
        if (aIsHour && !bIsHour) return -1;
        if (!aIsHour && bIsHour) return 1;
        return 0;
      }
      if (filters.sortBy === 'value') {
        return parseContractValue(b.estimatedValue) - parseContractValue(a.estimatedValue);
      }
      return 0;
    });
  }, [filters]);

  // Split into Priority Opportunities (Tier 1: Intent >= 85)
  const priorityLeads = useMemo(() => {
    return filteredLeads.filter((l: DiscoveredLead) => l.intentScore >= 85);
  }, [filteredLeads]);

  // Counts for summary bar
  const recent24hCount = useMemo(() => {
    return filteredLeads.filter((l: DiscoveredLead) => matchesFreshness(l.source.postedAt, 'today')).length;
  }, [filteredLeads]);

  const feedbackTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const showFeedback = (message: string) => {
    if (feedbackTimeoutRef.current) {
      clearTimeout(feedbackTimeoutRef.current);
    }
    setActiveFeedback(message);
    feedbackTimeoutRef.current = setTimeout(() => {
      setActiveFeedback(null);
    }, 4000);
  };

  React.useEffect(() => {
    return () => {
      if (feedbackTimeoutRef.current) {
        clearTimeout(feedbackTimeoutRef.current);
      }
    };
  }, []);

  // Actions
  const handleInitiateCall = (lead: DiscoveredLead) => {
    registerDiscoveredLead(lead);
    const contactName = lead.decisionMakerContact?.name || lead.companyName;
    toast.info(`Launching voice workspace for ${contactName} at ${lead.companyName}...`);
    navigate(`/calls/${lead.id}?leadId=${lead.id}`);
  };

  const handleAddToPipeline = (lead: DiscoveredLead) => {
    registerDiscoveredLead(lead);
    showFeedback(`Opportunity "${lead.companyName}" added to active pipeline.`);
    toast.success(`"${lead.companyName}" added to active pipeline`);
  };

  const handleCallFromCard = (leadId: string) => {
    const targetLead = allLeads.find((l) => l.id === leadId) || mockDiscoveredLeads.find((l) => l.id === leadId);
    if (targetLead) {
      handleInitiateCall(targetLead);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Feedback Toast */}
      {activeFeedback && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2.5 px-4 py-3 rounded-lg bg-signal-qualified-muted border border-signal-qualified text-signal-qualified text-xs shadow-xl animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-signal-qualified shrink-0" />
          <span className="font-medium">{activeFeedback}</span>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Header */}
        <DiscoveryHeader
          totalFeeds={42}
          lastScannedAt="2 minutes ago"
          onRescan={triggerScan}
          isScanning={isScanning}
        />

        {/* Search & Discovery Controls */}
        <DiscoveryControls
          filters={filters}
          onFilterChange={handleFilterUpdate}
          onOpenFilterDrawer={() => setIsFilterDrawerOpen(true)}
          activeFilterCount={activeFilterCount}
          onDiscover={triggerScan}
          isDiscovering={isScanning}
          totalMatches={filteredLeads.length}
          highIntentCount={priorityLeads.length}
        />

        {/* AI Progressive Discovery Scan State */}
        {isScanning && (
          <AIDiscoveryProgress
            queryText={filters.query || 'B2B Commercial Intent Vectors'}
            onComplete={handleScanComplete}
          />
        )}

        {/* Error State */}
        {isError && !isScanning && (
          <DiscoveryErrorState
            onRetry={triggerScan}
          />
        )}

        {/* Active Results Display */}
        {!isScanning && !isError && (
          <>
            {/* Results Summary & Active Filter Tags */}
            <ResultsSummaryBar
              totalCount={filteredLeads.length}
              highIntentCount={priorityLeads.length}
              recent24hCount={recent24hCount}
              filters={filters}
              onRemoveFilter={handleRemoveFilter}
              onClearAll={handleClearAllFilters}
            />

            {/* Zero Results Diagnostic View */}
            {filteredLeads.length === 0 ? (
              <NoResultsIntelligence
                query={filters.query}
                activeFilterCount={activeFilterCount}
                onClearFilters={handleClearAllFilters}
                onRelaxIntent={() => handleFilterUpdate({ intentLevel: 'medium' })}
                onExpandFreshness={() => handleFilterUpdate({ freshness: '30d' })}
                onClearQuery={() => handleFilterUpdate({ query: '' })}
              />
            ) : (
              <div className="space-y-8">
                {/* Tier 1: Priority Opportunities Grid (>=85 Intent) */}
                {priorityLeads.length > 0 && (
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-signal-high" />
                        <h2 className="text-xs font-semibold uppercase tracking-wider text-signal-high">
                          Priority Opportunities ({priorityLeads.length})
                        </h2>
                      </div>
                      <span className="text-xs text-foreground-tertiary font-mono">
                        Intent Score ≥ 85 • Highest Commercial Urgency
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
                      {priorityLeads.map((lead: DiscoveredLead) => (
                        <PriorityOpportunityCard
                          key={lead.id}
                          lead={lead}
                          onCall={handleCallFromCard}
                          onAddToPipeline={handleAddToPipeline}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Tier 2: Comprehensive Opportunity Stream */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-foreground-tertiary" />
                      <h2 className="text-xs font-semibold uppercase tracking-wider text-foreground-secondary">
                        Signal Stream ({filteredLeads.length})
                      </h2>
                    </div>
                    <span className="text-xs text-foreground-tertiary font-mono">
                      Sorted by {filters.sortBy === 'intent' ? 'Intent Score' : filters.sortBy === 'freshness' ? 'Signal Freshness' : 'Contract Value'}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {filteredLeads.map((lead: DiscoveredLead) => (
                      <LeadResultRow
                        key={lead.id}
                        lead={lead}
                        onInitiateCall={handleInitiateCall}
                        onAddToPipeline={handleAddToPipeline}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Filter Drawer */}
      <DiscoveryFilterDrawer
        isOpen={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        filters={filters}
        onApplyFilters={handleFilterUpdate}
        onClearAll={handleClearAllFilters}
        activeFilterCount={activeFilterCount}
      />
    </div>
  );
};
