import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { pageTransition } from '../motion/presets';
import { getLeadDetails } from '../data/leads';
import { DiscoveredLead } from '../types/leads';
import { RecommendationState, FollowUpItem, DismissReason } from '../types/followUp';

// Refined Lead Details Modular Components
import { LeadDetailsHeader } from '../components/leads/details/LeadDetailsHeader';
import { OpportunitySummaryBar } from '../components/leads/details/OpportunitySummaryBar';
import { RequirementSection } from '../components/leads/details/RequirementSection';
import { WhyNowSection } from '../components/leads/details/WhyNowSection';
import { BuyingSignalsSection } from '../components/leads/details/BuyingSignalsSection';
import { SalesPrepStudio } from '../components/leads/details/SalesPrepStudio';
import { CompanyIntelligenceSection } from '../components/leads/details/CompanyIntelligenceSection';
import { DecisionMakerSection } from '../components/leads/details/DecisionMakerSection';
import { NextBestActionSection } from '../components/leads/details/NextBestActionSection';
import { SourceProvenanceSection } from '../components/leads/details/SourceProvenanceSection';
import { LeadDetailsSkeleton } from '../components/leads/details/LeadDetailsSkeleton';
import { LeadNotFound } from '../components/leads/details/LeadNotFound';

// V3 21st.dev Animations
import {
  ScrollProgress,
  AnimatedSlideshow,
  AnimatedStepper,
  AnimatedCircularProgress,
  AnimatedTimeline,
  AnimatedAccordion,
  AnimatedSheet,
  AnimatedHoverPreview,
} from '../components/ui/21st';
import { Sparkles, HelpCircle, PhoneCall } from 'lucide-react';

// Workflow Modals
import { FollowUpSchedulerModal } from '../components/sales/workflow/FollowUpSchedulerModal';
import { DelayActionModal } from '../components/sales/workflow/DelayActionModal';
import { DismissActionModal } from '../components/sales/workflow/DismissActionModal';

export const LeadDetails: React.FC = () => {
  const { id, leadId } = useParams<{ id?: string; leadId?: string }>();
  const currentLeadId = leadId || id;
  const navigate = useNavigate();

  // Synchronously initialize lead so that authentic dossiers render on frame 0
  const [rawLead, setLead] = useState<DiscoveredLead | null>(() => getLeadDetails(currentLeadId));
  const [isLoading, setIsLoading] = useState<boolean>(() => !getLeadDetails(currentLeadId));
  const [isEnriching, setIsEnriching] = useState<boolean>(false);
  const enrichTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState<boolean>(false);

  // Workflow Recommendation State
  const [recommendationState, setRecommendationState] = useState<RecommendationState>({
    status: 'RECOMMENDED'
  });

  // Workflow Modals
  const [isSchedulerOpen, setIsSchedulerOpen] = useState(false);
  const [isDelayModalOpen, setIsDelayModalOpen] = useState(false);
  const [isDismissModalOpen, setIsDismissModalOpen] = useState(false);

  useEffect(() => {
    return () => {
      if (enrichTimerRef.current) clearTimeout(enrichTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const initialLead = getLeadDetails(currentLeadId);
    if (initialLead) {
      setLead(initialLead);
      setIsLoading(false);
    } else {
      setIsLoading(true);
    }

    // Connect to live backend database record if available
    let isMounted = true;
    const fetchBackendLead = async () => {
      if (!currentLeadId) return;
      try {
        const backendUrls = [
          `/api/leads/${encodeURIComponent(currentLeadId)}`,
          `http://localhost:8000/api/leads/${encodeURIComponent(currentLeadId)}`
        ];
        for (const url of backendUrls) {
          try {
            const res = await fetch(url);
            if (res.ok) {
              const data = await res.json();
              if (data?.lead && isMounted) {
                const dbLead = data.lead;
                setLead((prev) => {
                  const base = prev || initialLead || getLeadDetails(currentLeadId);
                  if (!base) {
                    const fallbackName = dbLead.companyName || currentLeadId;
                    const domain = (dbLead.website || '').replace(/^https?:\/\//, '').replace(/\/.*$/, '') || 'company.com';
                    return {
                      id: currentLeadId,
                      companyName: fallbackName,
                      companyDomain: domain,
                      industry: dbLead.industry || 'Enterprise Technology',
                      location: dbLead.location || 'India',
                      employeeCount: dbLead.companySize || '1,000–5,000',
                      requirement: dbLead.requirement || 'Autonomous Voice Qualification and CRM synchronization.',
                      detailedPain: 'Manual outbound qualification and call logging lag causing drop-offs.',
                      intentScore: dbLead.intentScore || 90,
                      intentLevel: 'high',
                      scoreReasons: ['Verified active lead in corporate database', 'Commercial telemetry active'],
                      whyNow: 'Active buyer evaluation underway.',
                      buyingSignals: [
                        { id: `sig-${currentLeadId}-1`, type: 'Telemetry Spike', description: 'Active qualification interest detected.', timestamp: '1h ago', impactScore: 90 }
                      ],
                      source: {
                        platform: dbLead.source || 'Enterprise DB',
                        originalRequirement: dbLead.requirement || 'Voice AI Evaluation',
                        sourceUrl: dbLead.website || `https://${domain}`,
                        discoveredAt: 'Today · Active',
                        postedAt: '1d ago'
                      },
                      estimatedValue: '₹50,00,000 / yr',
                      recommendedAction: 'call',
                      suggestedOpeningHook: `Hi ${dbLead.contactName || 'there'}, noticed your team is evaluating autonomous voice qualification...`,
                      decisionMakerContact: {
                        name: dbLead.contactName || 'Executive Lead',
                        role: dbLead.jobTitle || 'VP Sales Operations',
                        phoneAvailable: true
                      },
                      decisionMaker: {
                        name: dbLead.contactName || 'Executive Lead',
                        role: dbLead.jobTitle || 'VP Sales Operations',
                        department: 'Revenue Leadership',
                        email: dbLead.contactEmail || `contact@${domain}`,
                        phone: dbLead.contactPhone || '+91 98450 12890',
                        phoneAvailable: true,
                        confidence: 95,
                        isDirectDial: true,
                        linkedInUrl: dbLead.linkedinUrl
                      },
                      status: dbLead.status || 'high-intent',
                      lastActivity: '30m ago',
                      enrichmentState: 'completed',
                      companyIntelligence: {
                        overview: `${fallbackName} is an enterprise account evaluating Vidur sales automation.`,
                        scale: `${dbLead.companySize || '1,000+ employees'}`,
                        techStack: { confirmed: ['Salesforce', 'AWS Cloud'], displacing: ['Manual Telephony'] },
                        aiInferences: [{ deduction: 'Actively modernizing outbound stack', confidence: 92, basis: 'DB record' }],
                        potentialPainPoints: ['Manual outbound calling lag', 'High rep administrative overhead']
                      }
                    };
                  }
                  return {
                    ...base,
                    companyName: dbLead.companyName || base.companyName,
                    industry: dbLead.industry || base.industry,
                    location: dbLead.location || base.location,
                    employeeCount: dbLead.companySize || base.employeeCount,
                    requirement: dbLead.requirement || base.requirement,
                    intentScore: dbLead.intentScore || base.intentScore,
                    website: dbLead.website || base.website,
                    decisionMaker: {
                      name: dbLead.contactName || base.decisionMaker?.name || 'Executive Lead',
                      email: dbLead.contactEmail || base.decisionMaker?.email || `contact@${base.companyDomain || 'company.com'}`,
                      phone: dbLead.contactPhone || base.decisionMaker?.phone || '+91 98450 12890',
                      role: dbLead.jobTitle || base.decisionMaker?.role || 'VP Operations',
                      department: base.decisionMaker?.department || 'Commercial Leadership',
                      phoneAvailable: true,
                      confidence: 96,
                      isDirectDial: true,
                      linkedInUrl: dbLead.linkedinUrl || base.decisionMaker?.linkedInUrl
                    }
                  };
                });
                break;
              }
            }
          } catch {
            // Next url attempt
          }
        }
      } catch {
        // Fallback to local dossier
      } finally {
        if (isMounted) {
          setIsLoading(false);
          setLead((prev) => prev || getLeadDetails(currentLeadId));
        }
      }
    };

    fetchBackendLead();

    return () => {
      isMounted = false;
    };
  }, [currentLeadId]);

  const handleInitiateCall = () => {
    const active = rawLead || getLeadDetails(currentLeadId);
    if (!active) return;
    toast.success(`Preparing AI Voice Agent for ${active.companyName}... Navigating to Call Hub.`);
    navigate(`/calls/call-${active.id}?leadId=${active.id}`);
  };

  const handleAddToCampaign = () => {
    const active = rawLead || getLeadDetails(currentLeadId);
    if (!active) return;
    toast.success(`Enrolled ${active.companyName} into Outreach Cadence queue.`);
    navigate(`/campaigns?leadId=${active.id}`);
  };

  const handleFollowUp = () => {
    setIsSchedulerOpen(true);
  };

  const handleEnrich = () => {
    const active = rawLead || getLeadDetails(currentLeadId);
    if (!active || isEnriching) return;
    setIsEnriching(true);
    if (enrichTimerRef.current) clearTimeout(enrichTimerRef.current);
    enrichTimerRef.current = setTimeout(() => {
      setIsEnriching(false);
      toast.success('Account telemetry re-indexed: Confirmed 3 new buying signals.');
    }, 550);
  };

  const handleUseInCall = () => {
    const active = rawLead || getLeadDetails(currentLeadId);
    if (!active?.decisionMaker) return;
    toast.success(`Designated ${active.decisionMaker.name} (${active.decisionMaker.role}) as primary call participant.`);
  };

  // Workflow Handlers
  const handleConfirmSchedule = (item: FollowUpItem) => {
    setRecommendationState({
      status: 'SCHEDULED',
      scheduledItem: item
    });
    toast.success(`Follow-up scheduled for ${item.companyName} on ${item.date} at ${item.time}.`);
  };

  const handleConfirmDelay = (delayedUntilDate: string, timeframeLabel: string) => {
    setRecommendationState({
      status: 'DELAYED',
      delayedUntil: timeframeLabel
    });
    toast.info(`Next Best Action postponed to ${timeframeLabel}.`);
  };

  const handleConfirmDismiss = (reason: DismissReason, note?: string) => {
    setRecommendationState({
      status: 'DISMISSED',
      dismissReason: reason,
      dismissNote: note
    });
    toast('Recommendation dismissed.');
  };

  const handleResetRecommendation = () => {
    setRecommendationState({ status: 'RECOMMENDED' });
    toast.success('Recommendation re-activated.');
  };

  const activeLead = rawLead || getLeadDetails(currentLeadId);

  if (isLoading && !activeLead) return <LeadDetailsSkeleton />;

  if (!activeLead) {
    return (
      <LeadNotFound
        leadId={currentLeadId}
        onRetry={() => {
          setIsLoading(true);
          setTimeout(() => {
            setLead(getLeadDetails(currentLeadId));
            setIsLoading(false);
          }, 180);
        }}
      />
    );
  }

  const lead: DiscoveredLead = activeLead;

  const timelineItems = (lead.timeline || []).map((t) => ({
    id: t.id,
    time: t.timestamp,
    title: t.title,
    description: t.description,
    badge: t.category,
    status: t.category === 'call' ? ('completed' as const) : ('active' as const),
  }));

  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-6 max-w-7xl mx-auto pb-12 focus:outline-none"
    >
      <ScrollProgress color="#3B82F6" />

      {/* Sales Stepper Bar */}
      <div className="p-4 rounded-2xl border border-border-default bg-surface-0 shadow-xs">
        <AnimatedStepper
          steps={[
            { id: '1', label: 'DISCOVER' },
            { id: '2', label: 'RESEARCH' },
            { id: '3', label: 'SCORE' },
            { id: '4', label: 'CONTACT' },
            { id: '5', label: 'QUALIFY' },
            { id: '6', label: 'MEETING' },
          ]}
          currentStepIndex={lead.intentScore > 85 ? 3 : 2}
        />
      </div>

      {/* Header */}
      <LeadDetailsHeader
        lead={lead}
        onInitiateCall={handleInitiateCall}
        onAddToCampaign={handleAddToCampaign}
        onFollowUp={handleFollowUp}
        onEnrich={handleEnrich}
        isEnriching={isEnriching}
      />

      <OpportunitySummaryBar lead={lead} onInitiateCall={handleInitiateCall} />

      {/* Asymmetric Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-7 space-y-6 min-w-0">
          <RequirementSection lead={lead} />
          <WhyNowSection lead={lead} />
          <BuyingSignalsSection lead={lead} />
          <SalesPrepStudio lead={lead} onInitiateCall={handleInitiateCall} />

          {/* Animated Intelligence Accordion */}
          <div className="p-4 rounded-2xl border border-border-default bg-surface-0 space-y-3">
            <h3 className="text-xs font-bold text-foreground flex items-center gap-2 uppercase tracking-wider font-mono">
              <Sparkles className="w-4 h-4 text-amber-400" /> AI Lead Intelligence Breakdown
            </h3>
            <AnimatedAccordion
              items={[
                {
                  id: 'buying-intent',
                  title: 'Why is this lead high priority?',
                  badge: 'AI ANALYZED',
                  defaultExpanded: true,
                  content: (
                    <div className="space-y-1.5">
                      <p>• High purchase intent score ({lead.intentScore}%) verified via hiring spikes and technology migrations.</p>
                      <p>• Budget authority confirmed with primary decision maker {lead.decisionMaker?.name}.</p>
                    </div>
                  ),
                },
                {
                  id: 'company-fit',
                  title: 'Company Fit & Architecture Match',
                  badge: 'MATCH 94%',
                  content: (
                    <p>
                      Matches core ICP parameters: Enterprise headcount ({lead.employeeCount}), target technology stack, and immediate operational expansion.
                    </p>
                  ),
                },
              ]}
            />
          </div>

          {/* Animated Timeline */}
          <div className="p-4 rounded-2xl border border-border-default bg-surface-0 space-y-3">
            <h3 className="text-xs font-bold text-foreground flex items-center gap-2 uppercase tracking-wider font-mono">
              Lead Activity Timeline
            </h3>
            <AnimatedTimeline items={timelineItems} />
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-5 space-y-6 min-w-0">
          <NextBestActionSection
            lead={lead}
            recommendationState={recommendationState}
            onExecuteAction={handleInitiateCall}
            onOpenScheduleFollowUp={() => setIsSchedulerOpen(true)}
            onOpenDelay={() => setIsDelayModalOpen(true)}
            onOpenDismiss={() => setIsDismissModalOpen(true)}
            onResetRecommendation={handleResetRecommendation}
          />

          {/* Circular Progress Gauge for Intent Score */}
          <div className="p-6 rounded-2xl border border-border-default bg-surface-0 flex flex-col items-center justify-center space-y-3 shadow-xs">
            <AnimatedCircularProgress
              value={lead.intentScore}
              size={130}
              strokeWidth={10}
              label="INTENT SCORE"
              variant={lead.intentScore > 85 ? 'success' : 'amber'}
            />
            <button
              onClick={() => setIsSheetOpen(true)}
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" /> View Full Account Drawer
            </button>
          </div>

          <DecisionMakerSection lead={lead} onUseInCall={handleUseInCall} />
          <CompanyIntelligenceSection lead={lead} />
          <AnimatedSlideshow className="shadow-lg" />
          <SourceProvenanceSection lead={lead} />
        </div>
      </div>

      {/* Animated Sheet Drawer */}
      <AnimatedSheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        title={`${lead.companyName} Deep Analysis`}
        description="Intent signals, decision maker matrix, and complete AI call logs"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 rounded-xl bg-surface-1 border border-border-subtle">
            <span className="font-bold text-foreground block mb-1">Company Overview</span>
            <p className="text-foreground-secondary">{lead.companyIntelligence?.overview || lead.requirement}</p>
          </div>
          <div className="p-3 rounded-xl bg-surface-1 border border-border-subtle space-y-1">
            <span className="font-bold text-foreground block">Key Decision Maker</span>
            <p className="text-foreground-secondary">{lead.decisionMaker?.name} ({lead.decisionMaker?.role})</p>
          </div>
          <button
            onClick={() => {
              setIsSheetOpen(false);
              handleInitiateCall();
            }}
            className="w-full py-2.5 bg-primary text-primary-foreground font-bold rounded-xl text-center flex items-center justify-center gap-2 cursor-pointer"
          >
            <PhoneCall className="w-4 h-4" /> Start AI Call Now
          </button>
        </div>
      </AnimatedSheet>

      {/* Workflow Modals */}
      <FollowUpSchedulerModal
        isOpen={isSchedulerOpen}
        onClose={() => setIsSchedulerOpen(false)}
        leadId={lead.id}
        companyName={lead.companyName}
        contactName={lead.decisionMakerContact?.name || lead.decisionMaker?.name || 'Rahul Shah'}
        contactRole={lead.decisionMakerContact?.role || lead.decisionMaker?.role || 'Operations Director'}
        requirement={lead.requirement}
        intentScore={lead.intentScore}
        recommendedActionTitle={lead.recommendedAction === 'call' ? 'Initiate Outbound AI Call' : 'Schedule Demo'}
        recommendedReason={lead.whyNow}
        onConfirmSchedule={handleConfirmSchedule}
      />

      <DelayActionModal
        isOpen={isDelayModalOpen}
        onClose={() => setIsDelayModalOpen(false)}
        companyName={lead.companyName}
        actionTitle={lead.recommendedAction === 'call' ? 'Initiate Outbound AI Call' : 'Schedule Demo'}
        onConfirmDelay={handleConfirmDelay}
      />

      <DismissActionModal
        isOpen={isDismissModalOpen}
        onClose={() => setIsDismissModalOpen(false)}
        companyName={lead.companyName}
        actionTitle={lead.recommendedAction === 'call' ? 'Initiate Outbound AI Call' : 'Schedule Demo'}
        onConfirmDismiss={handleConfirmDismiss}
      />
    </motion.div>
  );
};

export default LeadDetails;
