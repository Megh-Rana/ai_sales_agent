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

  const [lead, setLead] = useState<DiscoveredLead | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
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
    setIsLoading(true);
    const timer = setTimeout(() => {
      const foundLead = getLeadDetails(currentLeadId);
      setLead(foundLead);
      setIsLoading(false);
    }, 140);

    return () => clearTimeout(timer);
  }, [currentLeadId]);

  const handleInitiateCall = () => {
    if (!lead) return;
    toast.success(`Preparing AI Voice Agent for ${lead.companyName}... Navigating to Call Hub.`);
    navigate(`/calls/call-${lead.id}?leadId=${lead.id}`);
  };

  const handleAddToCampaign = () => {
    if (!lead) return;
    toast.success(`Enrolled ${lead.companyName} into Outreach Cadence queue.`);
    navigate(`/campaigns?leadId=${lead.id}`);
  };

  const handleFollowUp = () => {
    setIsSchedulerOpen(true);
  };

  const handleEnrich = () => {
    if (!lead || isEnriching) return;
    setIsEnriching(true);
    if (enrichTimerRef.current) clearTimeout(enrichTimerRef.current);
    enrichTimerRef.current = setTimeout(() => {
      setIsEnriching(false);
      toast.success('Account telemetry re-indexed: Confirmed 3 new buying signals.');
    }, 550);
  };

  const handleUseInCall = () => {
    if (!lead?.decisionMaker) return;
    toast.success(`Designated ${lead.decisionMaker.name} (${lead.decisionMaker.role}) as primary call participant.`);
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

  if (isLoading) return <LeadDetailsSkeleton />;

  if (!lead) {
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
