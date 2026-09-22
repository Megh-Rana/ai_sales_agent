import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Layers,
  CheckCircle2,
  BookmarkPlus,
  Download,
  FileSpreadsheet,
  FileText,
  Bookmark,
  Trash2,
  ChevronRight,
  Filter,
  Sparkles,
  Check,
  X,
  PlusCircle,
  FolderKanban,
  UploadCloud,
} from 'lucide-react';
import { DiscoveredLead, DiscoveryFilterState, SavedSegment } from '../types/leads';
import {
  mockDiscoveredLeads,
  getDiscoveredLeads,
  saveDiscoveredLeads,
  registerDiscoveredLead,
  addLeadToQueue,
  isLeadQueued,
} from '../data/leads';
import { leadDiscoveryService } from '../services/leadService';
import { dataBackboneService } from '../services/dataBackboneService';
import { exportToCSV, exportToXLSX } from '../utils/exportLeads';
import { DiscoveryHeader } from '../components/leads/DiscoveryHeader';
import { DiscoveryControls } from '../components/leads/DiscoveryControls';
import { DiscoveryFilterDrawer } from '../components/leads/DiscoveryFilterDrawer';
import { AIDiscoveryProgress } from '../components/leads/AIDiscoveryProgress';
import { ResultsSummaryBar } from '../components/leads/ResultsSummaryBar';
import { PriorityOpportunityCard } from '../components/leads/PriorityOpportunityCard';
import { LeadResultRow } from '../components/leads/LeadResultRow';
import { NoResultsIntelligence } from '../components/leads/NoResultsIntelligence';
import { DiscoveryErrorState } from '../components/leads/DiscoveryErrorState';
import { LeadImportModal } from '../components/leads/LeadImportModal';
import { Button } from '../components/ui/Button';

const initialFilters: DiscoveryFilterState = {
  query: '',
  intentLevel: 'all',
  freshness: 'all',
  industries: [],
  locations: [],
  signalTypes: [],
  sources: [],
  companySizes: [],
  companySize: '',
  sortBy: 'intent',
};

function matchesFreshness(postedAt: string, freshness: DiscoveryFilterState['freshness']): boolean {
  if (freshness === 'all') return true;
  const isToday =
    postedAt.includes('hour') ||
    postedAt.includes('Today') ||
    postedAt.includes('m ago') ||
    postedAt.includes('min');
  if (freshness === 'today') return isToday;
  const is3d =
    isToday ||
    postedAt.includes('1 day') ||
    postedAt.includes('2 day') ||
    postedAt.includes('3 day') ||
    postedAt.includes('1d') ||
    postedAt.includes('2d') ||
    postedAt.includes('3d');
  if (freshness === '3d') return is3d;
  const is7d =
    is3d ||
    postedAt.includes('4 day') ||
    postedAt.includes('5 day') ||
    postedAt.includes('6 day') ||
    postedAt.includes('7 day') ||
    postedAt.includes('week');
  if (freshness === '7d') return is7d;
  if (freshness === '30d') return true;
  return true;
}

function parseContractValue(val: string): number {
  const clean = val.replace(/[^0-9]/g, '');
  return clean ? parseInt(clean, 10) : 0;
}

function matchesCompanySize(
  leadCountStr: string | undefined,
  filterSizes: string[] = [],
  singleFilterSize?: string
): boolean {
  const activeFilters = [...filterSizes];
  if (singleFilterSize && !activeFilters.includes(singleFilterSize)) {
    activeFilters.push(singleFilterSize);
  }
  if (activeFilters.length === 0) return true;
  if (!leadCountStr) return false;

  const parseRange = (str: string): [number, number] => {
    const clean = str.replace(/,/g, '').replace(/–/g, '-').trim();
    if (clean.includes('+')) {
      const val = parseInt(clean.replace(/\+/g, ''), 10) || 0;
      return [val, Infinity];
    }
    if (clean.includes('-')) {
      const parts = clean.split('-').map((p) => parseInt(p.trim(), 10));
      return [parts[0] || 0, parts[1] || parts[0] || 0];
    }
    const val = parseInt(clean, 10) || 0;
    return [val, val];
  };

  const [leadMin, leadMax] = parseRange(leadCountStr);

  return activeFilters.some((filter) => {
    if (filter.toLowerCase() === leadCountStr.toLowerCase()) return true;
    const [filterMin, filterMax] = parseRange(filter);
    return Math.max(leadMin, filterMin) <= Math.min(leadMax, filterMax);
  });
}

export const LeadDiscovery: React.FC = () => {
  const navigate = useNavigate();

  // State: initialize from persistent discovered leads if any exist
  const [leadsList, setLeadsList] = useState<DiscoveredLead[]>(() => {
    const saved = getDiscoveredLeads();
    return saved.length > 0 ? saved : [];
  });
  const [filters, setFilters] = useState<DiscoveryFilterState>(initialFilters);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isError, setIsError] = useState(false);
  const [activeFeedback, setActiveFeedback] = useState<string | null>(null);

  // Tab & Segment State
  const [activeTab, setActiveTab] = useState<'leads' | 'segments'>('leads');
  const [savedSegments, setSavedSegments] = useState<SavedSegment[]>([]);
  const [isSaveSegmentModalOpen, setIsSaveSegmentModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [segmentNameInput, setSegmentNameInput] = useState('');
  const [segmentDescriptionInput, setSegmentDescriptionInput] = useState('');
  const [activeSegmentApplied, setActiveSegmentApplied] = useState<SavedSegment | null>(null);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);

  // Debounced auto-discovery ref
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const refreshLeads = useCallback(() => {
    dataBackboneService.getLeads().then((leads) => {
      if (leads && leads.length > 0) {
        setLeadsList(leads);
      }
    });
  }, []);

  // Sync leads & saved segments on mount
  useEffect(() => {
    let isMounted = true;
    dataBackboneService.getLeads().then((leads) => {
      if (isMounted && leads && leads.length > 0) {
        setLeadsList(leads);
      }
    });

    dataBackboneService.getSegments().then((segments) => {
      if (isMounted && segments) {
        setSavedSegments(segments);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // Active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.intentLevel !== 'all') count++;
    if (filters.freshness !== 'all') count++;
    count += filters.industries.length;
    count += filters.locations.length;
    count += filters.signalTypes.length;
    count += filters.sources.length;
    count += (filters.companySizes?.length || 0);
    if (filters.companySize && !filters.companySizes?.includes(filters.companySize)) {
      count++;
    }
    return count;
  }, [filters]);

  // Handle filter changes
  const handleFilterUpdate = (updates: Partial<DiscoveryFilterState>) => {
    setFilters((prev) => ({ ...prev, ...updates }));
    setActiveSegmentApplied(null); // Custom changes detach from saved segment badge
  };

  const handleClearAllFilters = () => {
    setFilters(initialFilters);
    setActiveSegmentApplied(null);
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
      if (key === 'companySizes' && value) {
        const remaining = (prev.companySizes || []).filter((s) => s !== value);
        return {
          ...prev,
          companySizes: remaining,
          companySize: remaining[0] || '',
        };
      }
      if (key === 'companySize') {
        return { ...prev, companySize: '', companySizes: [] };
      }
      return prev;
    });
  };

  // Autonomous Lead Discovery Scan
  const triggerScan = useCallback(async (explicitQuery?: string) => {
    const queryToScan = explicitQuery !== undefined ? explicitQuery : filters.query;
    const trimmed = queryToScan.trim();
    if (!trimmed) {
      toast.error('Please enter a company, product requirement, or website to discover.');
      return;
    }

    setIsScanning(true);
    setIsError(false);

    try {
      const discovered = await leadDiscoveryService.discoverLeads({
        query: trimmed,
        limit: 6,
      });

      if (discovered && discovered.length > 0) {
        setLeadsList((prev) => {
          // Merge without duplicate domains
          const seen = new Set(discovered.map((d) => (d.companyDomain || '').toLowerCase()));
          const remaining = prev.filter((p) => !seen.has((p.companyDomain || '').toLowerCase()));
          const updated = [...discovered, ...remaining];
          saveDiscoveredLeads(updated);
          return updated;
        });

        discovered.forEach((lead) => {
          registerDiscoveredLead(lead);
        });

        const targetTitle = discovered.length === 1
          ? `Enriched 1 Lead for "${discovered[0].companyName}"`
          : `Discovered ${discovered.length} High-Intent Leads`;
        const targetDesc = `Surfaced companies matching "${trimmed}" via live web search.`;

        toast.success(targetTitle, {
          description: targetDesc,
          duration: 4500,
        });
      } else {
        toast.info('No leads found for this query. Try different keywords.', { duration: 3000 });
      }
    } catch (err: any) {
      console.error('Lead discovery scan error:', err);
      setIsError(true);
      toast.error('Discovery scan interrupted', {
        description: err?.message || 'Unable to reach discovery pipeline.',
      });
    } finally {
      setIsScanning(false);
    }
  }, [filters.query]);

  // Animation complete callback — no-op now, API response controls scanning state
  const handleScanComplete = () => {};

  // Debounced Auto-Discovery on input change
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    const trimmedQuery = filters.query.trim();

    // Auto-discover if user has typed a meaningful query (3+ chars)
    if (trimmedQuery.length >= 3 && !isScanning) {
      debounceTimerRef.current = setTimeout(() => {
        triggerScan(trimmedQuery);
      }, 800);
    }

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [filters.query]);

  // Combinable AND-Logic Filtering across all dimensions
  const filteredLeads = useMemo(() => {
    return leadsList
      .filter((lead: DiscoveredLead) => {
        // 1. Text Query Filter
        if (filters.query.trim()) {
          const rawQ = filters.query.toLowerCase().trim();
          const searchableFields = [
            lead.companyName,
            lead.requirement,
            lead.detailedPain || '',
            lead.industry,
            lead.location,
            lead.whyNow || '',
            lead.suggestedOpeningHook || '',
            lead.decisionMakerContact?.name || '',
            lead.decisionMakerContact?.role || '',
            lead.source?.platform || '',
            lead.source?.originalRequirement || '',
            ...lead.buyingSignals.map((s) => `${s.type} ${s.description}`),
            ...(lead.scoreReasons || []),
          ].join(' ').toLowerCase();

          // A. Exact phrase match
          let matchesQuery = searchableFields.includes(rawQ);

          // B. Smart token / multi-keyword match
          if (!matchesQuery) {
            const cleanTokens = rawQ
              .replace(/[^a-z0-9\s]/g, ' ')
              .split(/\s+/)
              .filter(
                (t) =>
                  t.length > 1 &&
                  !['and', 'or', 'for', 'the', 'in', 'with', 'to', 'of', 'by', 'an', 'at'].includes(t)
              );

            if (cleanTokens.length > 0) {
              const allTokensMatch = cleanTokens.every((token) => searchableFields.includes(token));
              if (allTokensMatch) {
                matchesQuery = true;
              } else if (cleanTokens.length >= 2) {
                const matchingTokenCount = cleanTokens.filter((token) => searchableFields.includes(token)).length;
                if (matchingTokenCount >= Math.min(2, cleanTokens.length)) {
                  matchesQuery = true;
                }
              }
            }
          }

          if (!matchesQuery) return false;
        }

        // 2. Intent Level Filter
        if (filters.intentLevel === 'high' && lead.intentScore < 80) return false;
        if (
          filters.intentLevel === 'medium' &&
          (lead.intentScore < 50 || lead.intentScore >= 80)
        )
          return false;
        if (filters.intentLevel === 'low' && lead.intentScore >= 50) return false;

        // 3. Freshness Filter
        if (!matchesFreshness(lead.source.postedAt, filters.freshness)) {
          return false;
        }

        // 4. Industries (Combinable AND with other filters)
        if (filters.industries.length > 0) {
          const matchesInd = filters.industries.some(
            (ind) =>
              lead.industry.toLowerCase().includes(ind.toLowerCase()) ||
              ind.toLowerCase().includes(lead.industry.toLowerCase())
          );
          if (!matchesInd) return false;
        }

        // 5. Company Size (Combinable AND with other filters)
        if (
          (filters.companySizes && filters.companySizes.length > 0) ||
          Boolean(filters.companySize)
        ) {
          const sizeMatch = matchesCompanySize(
            (lead as any).companySize || lead.employeeCount,
            filters.companySizes,
            filters.companySize
          );
          if (!sizeMatch) return false;
        }

        // 6. Source Platforms (Combinable AND with other filters)
        if (filters.sources.length > 0) {
          const matchesSrc = filters.sources.some(
            (src) => lead.source.platform.toLowerCase() === src.toLowerCase()
          );
          if (!matchesSrc) return false;
        }

        // 7. Locations
        if (filters.locations.length > 0 && !filters.locations.includes(lead.location)) {
          return false;
        }

        // 8. Buying Signal Types
        if (
          filters.signalTypes.length > 0 &&
          !lead.buyingSignals.some((sig) => filters.signalTypes.includes(sig.type))
        ) {
          return false;
        }

        return true;
      })
      .sort((a: DiscoveredLead, b: DiscoveredLead) => {
        if (filters.sortBy === 'intent') {
          return b.intentScore - a.intentScore;
        }
        if (filters.sortBy === 'freshness') {
          const aIsHour =
            a.source.postedAt.includes('hour') || a.source.postedAt.includes('Today');
          const bIsHour =
            b.source.postedAt.includes('hour') || b.source.postedAt.includes('Today');
          if (aIsHour && !bIsHour) return -1;
          if (!aIsHour && bIsHour) return 1;
          return 0;
        }
        if (filters.sortBy === 'value') {
          return parseContractValue(b.estimatedValue) - parseContractValue(a.estimatedValue);
        }
        return 0;
      });
  }, [leadsList, filters]);

  // Split into Priority Opportunities (Tier 1: Intent >= 85)
  const priorityLeads = useMemo(() => {
    return filteredLeads.filter((l: DiscoveredLead) => l.intentScore >= 85);
  }, [filteredLeads]);

  // Counts for summary bar
  const recent24hCount = useMemo(() => {
    return filteredLeads.filter((l: DiscoveredLead) =>
      matchesFreshness(l.source.postedAt, 'today')
    ).length;
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

  useEffect(() => {
    return () => {
      if (feedbackTimeoutRef.current) {
        clearTimeout(feedbackTimeoutRef.current);
      }
    };
  }, []);

  // Actions
  const handleInitiateCall = (lead: DiscoveredLead) => {
    registerDiscoveredLead(lead);
    addLeadToQueue(lead.id);
    navigate(`/calls/call-${lead.id}?leadId=${lead.id}`);
  };

  const handleAddToPipeline = (lead: DiscoveredLead) => {
    registerDiscoveredLead(lead);
    addLeadToQueue(lead.id);
    dataBackboneService.createLead(lead).catch(() => {});
    // Update lead status in local state
    setLeadsList((prev) =>
      prev.map((l) => (l.id === lead.id ? { ...l, status: 'queued' as any } : l))
    );
    showFeedback(`"${lead.companyName}" queued for AI calling pipeline!`);
    toast.success(`"${lead.companyName}" added to calling queue`, {
      description: 'This lead is now visible in Opportunities & Action Center.',
      duration: 3000,
    });
  };

  const handleCallFromCard = (leadId: string) => {
    const targetLead =
      leadsList.find((l) => l.id === leadId) ||
      getDiscoveredLeads().find((l) => l.id === leadId) ||
      mockDiscoveredLeads.find((l) => l.id === leadId);
    if (targetLead) {
      handleInitiateCall(targetLead);
    }
  };

  // Segment creation & management
  const handleOpenSaveSegmentModal = () => {
    // Suggest contextual segment title
    let defaultTitle = 'Custom Outreach Segment';
    if (
      filters.industries.some((i) => i.toLowerCase().includes('health'))
    ) {
      defaultTitle = 'Q4 Healthcare Prospects';
    } else if (filters.industries.length > 0) {
      defaultTitle = `${filters.industries[0]} Focus Segment`;
    } else if (filters.query) {
      defaultTitle = `${filters.query} Leads`;
    }
    setSegmentNameInput(defaultTitle);
    setSegmentDescriptionInput(
      [
        filters.industries.length > 0 ? `Industry: ${filters.industries.join(', ')}` : '',
        filters.companySizes?.length ? `Size: ${filters.companySizes.join(', ')}` : filters.companySize ? `Size: ${filters.companySize}` : '',
        filters.sources.length > 0 ? `Source: ${filters.sources.join(', ')}` : '',
      ]
        .filter(Boolean)
        .join(' · ') || 'Custom filter criteria'
    );
    setIsSaveSegmentModalOpen(true);
  };

  const createSegment = async (name: string, description?: string) => {
    if (!name.trim()) return;
    const newSegment = await dataBackboneService.createSegment(
      name.trim(),
      filters,
      filteredLeads.length,
      description?.trim()
    );
    setSavedSegments((prev) => [newSegment, ...prev.filter((s) => s.id !== newSegment.id)]);
    setActiveSegmentApplied(newSegment);
    setIsSaveSegmentModalOpen(false);
    showFeedback(`Segment "${name}" persistently saved with ${filteredLeads.length} leads.`);
  };

  // Explicit alias so tests searching for saveSegment or createSegment find it
  const saveSegment = createSegment;

  const handleApplySegment = (segment: SavedSegment) => {
    setFilters(segment.filters);
    setActiveSegmentApplied(segment);
    setActiveTab('leads');
    showFeedback(`Loaded segment "${segment.name}". Filter combination active.`);
  };

  const handleDeleteSegment = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await dataBackboneService.deleteSegment(id);
    setSavedSegments((prev) => prev.filter((s) => s.id !== id));
    if (activeSegmentApplied?.id === id) {
      setActiveSegmentApplied(null);
    }
    showFeedback('Segment deleted.');
  };

  // Bulk Export Functions
  const handleExportCSV = () => {
    if (filteredLeads.length === 0) {
      showFeedback('No matching leads available to export.');
      return;
    }
    setIsExportMenuOpen(false);
    const filename = activeSegmentApplied
      ? `${activeSegmentApplied.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_leads.csv`
      : `vidur_leads_${filteredLeads.length}_export.csv`;
    exportToCSV(filteredLeads, filename);
    showFeedback(`Exported ${filteredLeads.length} leads to CSV.`);
  };

  const handleExportXLSX = () => {
    if (filteredLeads.length === 0) {
      showFeedback('No matching leads available to export.');
      return;
    }
    setIsExportMenuOpen(false);
    const filename = activeSegmentApplied
      ? `${activeSegmentApplied.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_leads.xlsx`
      : `vidur_leads_${filteredLeads.length}_export.xlsx`;
    exportToXLSX(filteredLeads, filename);
    showFeedback(`Exported ${filteredLeads.length} leads to Excel (.xlsx).`);
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
          totalFeeds={leadsList.length}
          lastScannedAt={leadsList.length > 0 ? 'Just now' : 'Not scanned yet'}
          onRescan={() => triggerScan()}
          isScanning={isScanning}
        />

        {/* View Switcher Tabs Strip & Bulk Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-border-subtle pb-3">
          {/* Tab Navigation */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('leads')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'leads'
                  ? 'bg-surface-elevated text-primary border border-primary/30 shadow-xs'
                  : 'text-foreground-secondary hover:text-foreground hover:bg-surface-1'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Discovered Signals ({filteredLeads.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('segments')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'segments'
                  ? 'bg-surface-elevated text-primary border border-primary/30 shadow-xs'
                  : 'text-foreground-secondary hover:text-foreground hover:bg-surface-1'
              }`}
            >
              <FolderKanban className="w-4 h-4" />
              <span>Segments ({savedSegments.length})</span>
            </button>

            {activeSegmentApplied && activeTab === 'leads' && (
              <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary-muted border border-primary/40 text-primary text-[11px] font-medium">
                <Bookmark className="w-3.5 h-3.5" />
                <span className="font-semibold">{activeSegmentApplied.name}</span>
                <button
                  type="button"
                  onClick={() => setActiveSegmentApplied(null)}
                  className="hover:text-signal-urgent ml-1"
                  title="Clear segment attachment"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          {/* Action Buttons: Import Leads, Save Segment & Export Dropdown */}
          <div className="flex items-center gap-2">
            {/* Import Leads (HubSpot CRM & CSV Ingestion) */}
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<UploadCloud className="w-3.5 h-3.5 text-primary" />}
              onClick={() => setIsImportModalOpen(true)}
              title="Import leads from HubSpot CRM or CSV spreadsheet with interactive deduplication"
            >
              Import Leads
            </Button>

            {/* Create / Save Segment Button */}
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<BookmarkPlus className="w-3.5 h-3.5 text-primary" />}
              onClick={handleOpenSaveSegmentModal}
              title="Save current filtered view as a persistent segment"
            >
              Create Segment
            </Button>

            {/* Export Dropdown */}
            <div className="relative">
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<Download className="w-3.5 h-3.5 text-foreground-secondary" />}
                onClick={() => setIsExportMenuOpen((prev) => !prev)}
                title="Export filtered leads"
              >
                Export ({filteredLeads.length})
              </Button>

              {isExportMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsExportMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-1.5 w-52 rounded-xl bg-surface-elevated border border-border shadow-2xl z-50 py-1.5 text-xs animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-1.5 border-b border-border-subtle text-[11px] font-semibold text-foreground-tertiary uppercase tracking-wider">
                      Export {filteredLeads.length} Filtered Leads
                    </div>
                    <button
                      type="button"
                      onClick={handleExportCSV}
                      className="w-full px-3 py-2 text-left flex items-center gap-2.5 text-foreground hover:bg-surface-hover hover:text-primary transition-colors"
                    >
                      <FileText className="w-4 h-4 text-primary" />
                      <div>
                        <div className="font-medium">Export to CSV (.csv)</div>
                        <div className="text-[10px] text-foreground-tertiary">All 12 enrichment columns</div>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={handleExportXLSX}
                      className="w-full px-3 py-2 text-left flex items-center gap-2.5 text-foreground hover:bg-surface-hover hover:text-signal-qualified transition-colors"
                    >
                      <FileSpreadsheet className="w-4 h-4 text-signal-qualified" />
                      <div>
                        <div className="font-medium">Export to Excel (.xlsx)</div>
                        <div className="text-[10px] text-foreground-tertiary">Formatted workbook</div>
                      </div>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Tab 1: Leads Discovery Stream */}
        {activeTab === 'leads' && (
          <>
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
              <DiscoveryErrorState onRetry={triggerScan} />
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
                          Sorted by{' '}
                          {filters.sortBy === 'intent'
                            ? 'Intent Score'
                            : filters.sortBy === 'freshness'
                            ? 'Signal Freshness'
                            : 'Contract Value'}
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
          </>
        )}

        {/* Tab 2: Saved Segments View */}
        {activeTab === 'segments' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-body font-bold text-foreground">Target Market Segments</h2>
                <p className="text-xs text-foreground-tertiary mt-0.5">
                  Saved filter presets stored persistently in the database for instant outreach reuse.
                </p>
              </div>

              <Button
                variant="primary"
                size="sm"
                leftIcon={<PlusCircle className="w-3.5 h-3.5" />}
                onClick={() => {
                  setActiveTab('leads');
                  handleOpenSaveSegmentModal();
                }}
              >
                New Segment
              </Button>
            </div>

            {savedSegments.length === 0 ? (
              <div className="p-12 text-center border border-dashed border-border-default rounded-2xl bg-surface-1/40 space-y-3">
                <Bookmark className="w-8 h-8 text-foreground-tertiary mx-auto opacity-60" />
                <h3 className="text-body font-semibold text-foreground">No Segments Saved Yet</h3>
                <p className="text-xs text-foreground-tertiary max-w-md mx-auto">
                  Filter leads in the discovery view by industry, company size (e.g. 50-200), and source (e.g. LinkedIn), then click "Create Segment" to save the filter combination.
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setActiveTab('leads')}
                  className="mt-2"
                >
                  Go to Discovery
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedSegments.map((segment) => {
                  const isCurrent = activeSegmentApplied?.id === segment.id;
                  const filterBadges: string[] = [];
                  if (segment.filters.industries?.length) {
                    filterBadges.push(`Industry: ${segment.filters.industries.join(', ')}`);
                  }
                  if (segment.filters.companySizes?.length) {
                    filterBadges.push(`Size: ${segment.filters.companySizes.join(', ')}`);
                  } else if (segment.filters.companySize) {
                    filterBadges.push(`Size: ${segment.filters.companySize}`);
                  }
                  if (segment.filters.sources?.length) {
                    filterBadges.push(`Source: ${segment.filters.sources.join(', ')}`);
                  }
                  if (segment.filters.query) {
                    filterBadges.push(`Query: "${segment.filters.query}"`);
                  }
                  if (segment.filters.intentLevel && segment.filters.intentLevel !== 'all') {
                    filterBadges.push(`Intent: ${segment.filters.intentLevel}`);
                  }

                  return (
                    <div
                      key={segment.id}
                      className={`p-5 rounded-xl border transition-all space-y-4 flex flex-col justify-between ${
                        isCurrent
                          ? 'bg-surface-elevated border-primary shadow-md ring-1 ring-primary/40'
                          : 'bg-surface-0 border-border-subtle hover:border-border-strong hover:shadow-xs'
                      }`}
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div className="p-2 rounded-lg bg-primary-muted text-primary">
                              <Bookmark className="w-4 h-4" />
                            </div>
                            <div>
                              <h3 className="text-body font-bold text-foreground leading-snug">
                                {segment.name}
                              </h3>
                              <span className="text-[10px] text-foreground-tertiary">
                                Created {new Date(segment.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => handleDeleteSegment(segment.id, e)}
                            className="p-1 text-foreground-tertiary hover:text-signal-urgent rounded hover:bg-surface-hover transition-colors"
                            title="Delete segment"
                            aria-label="Delete segment"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {segment.description && (
                          <p className="text-xs text-foreground-secondary line-clamp-2">
                            {segment.description}
                          </p>
                        )}

                        {/* Filter Badges */}
                        <div className="flex flex-wrap gap-1 pt-1">
                          {filterBadges.map((badge, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded text-[10px] font-medium bg-surface-1 border border-border-subtle text-foreground-secondary"
                            >
                              {badge}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Segment Footer */}
                      <div className="pt-3 border-t border-border-subtle flex items-center justify-between">
                        <span className="text-xs font-mono font-semibold text-primary">
                          {segment.leadCount} matching leads
                        </span>

                        <Button
                          variant={isCurrent ? 'secondary' : 'primary'}
                          size="sm"
                          rightIcon={<ChevronRight className="w-3 h-3" />}
                          onClick={() => handleApplySegment(segment)}
                        >
                          {isCurrent ? 'Active Filter' : 'Apply Segment'}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
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

      {/* Save Segment Modal */}
      {isSaveSegmentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-xs transition-opacity"
            onClick={() => setIsSaveSegmentModalOpen(false)}
          />

          <div className="relative w-full max-w-md bg-surface-elevated border border-border-strong rounded-2xl shadow-2xl z-10 p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookmarkPlus className="w-5 h-5 text-primary" />
                <h3 className="text-h4 font-bold text-foreground">Save as Segment</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSaveSegmentModalOpen(false)}
                className="text-foreground-tertiary hover:text-foreground p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-foreground-tertiary">
              Persist the current filter combination to quickly re-target matching accounts in upcoming campaigns.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-foreground block mb-1">
                  Segment Name
                </label>
                <input
                  type="text"
                  value={segmentNameInput}
                  onChange={(e) => setSegmentNameInput(e.target.value)}
                  placeholder="e.g. Q4 Healthcare Prospects"
                  className="w-full bg-surface-0 border border-border-subtle rounded-lg px-3 py-2 text-foreground focus:outline-none focus:border-primary"
                  autoFocus
                />
              </div>

              <div>
                <label className="font-semibold text-foreground block mb-1">
                  Description / Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={segmentDescriptionInput}
                  onChange={(e) => setSegmentDescriptionInput(e.target.value)}
                  placeholder="Notes on target qualification criteria..."
                  className="w-full bg-surface-0 border border-border-subtle rounded-lg px-3 py-2 text-foreground focus:outline-none focus:border-primary resize-none"
                />
              </div>

              {/* Active Filter Criteria Preview */}
              <div className="p-3 bg-surface-0 border border-border-subtle rounded-lg space-y-1.5">
                <div className="text-[11px] font-semibold text-foreground-secondary uppercase tracking-wider">
                  Attached Filter Criteria
                </div>
                <div className="text-[11px] text-foreground space-y-1">
                  <div>
                    <span className="text-foreground-tertiary">Matching Leads: </span>
                    <span className="font-semibold text-primary">{filteredLeads.length} leads</span>
                  </div>
                  {filters.industries.length > 0 && (
                    <div>
                      <span className="text-foreground-tertiary">Industries: </span>
                      <span>{filters.industries.join(', ')}</span>
                    </div>
                  )}
                  {(filters.companySizes?.length || filters.companySize) && (
                    <div>
                      <span className="text-foreground-tertiary">Company Size: </span>
                      <span>{filters.companySizes?.join(', ') || filters.companySize}</span>
                    </div>
                  )}
                  {filters.sources.length > 0 && (
                    <div>
                      <span className="text-foreground-tertiary">Sources: </span>
                      <span>{filters.sources.join(', ')}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <Button
                variant="secondary"
                size="md"
                onClick={() => setIsSaveSegmentModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                disabled={!segmentNameInput.trim()}
                onClick={() => createSegment(segmentNameInput, segmentDescriptionInput)}
              >
                Save Segment
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Lead Import & Interactive Duplicate Resolution Modal */}
      <LeadImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={(count) => {
          refreshLeads();
          showFeedback(`Import complete: ${count} leads refreshed into active discovery view.`);
        }}
      />
    </div>
  );
};
