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
import { ActivityTimelineSection } from '../components/leads/details/ActivityTimelineSection';
import { SourceProvenanceSection } from '../components/leads/details/SourceProvenanceSection';
import { LeadDetailsSkeleton } from '../components/leads/details/LeadDetailsSkeleton';
import { LeadNotFound } from '../components/leads/details/LeadNotFound';
import { IntentScore } from '../components/sales/IntentScore';

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
    // Brief realistic telemetry fetch
    const timer = setTimeout(() => {
      const foundLead = getLeadDetails(currentLeadId);
      setLead(foundLead);
      setIsLoading(false);
    }, 140);

    return () => clearTimeout(timer);
  }, [currentLeadId]);

  // Global Keyboard Shortcuts for Sales Rep Efficiency
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        navigate('/leads/discover');
      } else if ((e.key === 'c' || e.key === 'C') && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        handleInitiateCall();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate, lead]);

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

    if (lead) {
      const nowStr = 'Just now';
      const updatedTimeline = [
        {
          id: `act-${Date.now()}`,
          timestamp: nowStr,
          title: 'Demo Follow-Up Scheduled by Sales Representative',
          description: `Confirmed demo scheduled for ${item.date} at ${item.time} (${item.owner}). Note: "${item.note || 'No custom note.'}"`,
          category: 'status' as const
        },
        ...(lead.timeline || [])
      ];

      setLead({
        ...lead,
        status: 'meeting',
        timeline: updatedTimeline
      });
    }

    toast.success(`Follow-up scheduled for ${item.companyName} on ${item.date} at ${item.time}.`);
  };

  const handleConfirmDelay = (delayedUntilDate: string, timeframeLabel: string) => {
    setRecommendationState({
      status: 'DELAYED',
      delayedUntil: timeframeLabel
    });

    if (lead) {
      const updatedTimeline = [
        {
          id: `act-${Date.now()}`,
          timestamp: 'Just now',
          title: 'Next Best Action Postponed',
          description: `Sales representative delayed recommendation until ${timeframeLabel}.`,
          category: 'status' as const
        },
        ...(lead.timeline || [])
      ];
      setLead({ ...lead, timeline: updatedTimeline });
    }

    toast.info(`Next Best Action postponed to ${timeframeLabel}.`);
  };

  const handleConfirmDismiss = (reason: DismissReason, note?: string) => {
    setRecommendationState({
      status: 'DISMISSED',
      dismissReason: reason,
      dismissNote: note
    });

    if (lead) {
      const updatedTimeline = [
        {
          id: `act-${Date.now()}`,
          timestamp: 'Just now',
          title: 'Next Best Action Dismissed',
          description: `Dismissed recommendation. Feedback logged (${reason.toLowerCase().replace(/_/g, ' ')}).`,
          category: 'status' as const
        },
        ...(lead.timeline || [])
      ];
      setLead({ ...lead, timeline: updatedTimeline });
    }

    toast('Recommendation dismissed.');
  };

  const handleResetRecommendation = () => {
    setRecommendationState({ status: 'RECOMMENDED' });
    toast.success('Recommendation re-activated.');
  };

  // 1. Loading State
  if (isLoading) {
    return <LeadDetailsSkeleton />;
  }

  // 2. Lead Not Found State
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

  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-6 max-w-7xl mx-auto pb-12 focus:outline-none"
      tabIndex={-1}
      role="main"
      aria-label={`Lead Intelligence Profile: ${lead.companyName}`}
    >
      {/* 1. Header with Compact Metadata & Primary Action Cluster */}
      <LeadDetailsHeader
        lead={lead}
        onInitiateCall={handleInitiateCall}
        onAddToCampaign={handleAddToCampaign}
        onFollowUp={handleFollowUp}
        onEnrich={handleEnrich}
        isEnriching={isEnriching}
      />

      {/* 2. Opportunity Summary Bar (High Density Scan, Non-Redundant) */}
      <OpportunitySummaryBar lead={lead} onInitiateCall={handleInitiateCall} />

      {/* 3. Main Asymmetric Intelligence Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Core Opportunity Intelligence & Sales Preparation (62% - 7 cols) */}
        <div className="lg:col-span-7 space-y-6 min-w-0">
          {/* A. The Commercial Requirement */}
          <RequirementSection lead={lead} />

          {/* B. Why Now? (Timing Catalyst Banner) */}
          <WhyNowSection lead={lead} />

          {/* C. Verified Buying Signals (Moved UP as proof before Pitch) */}
          <BuyingSignalsSection lead={lead} />

          {/* D. Outbound Sales Preparation Studio (Pitch Script + Pre-Call Brief) */}
          <SalesPrepStudio lead={lead} onInitiateCall={handleInitiateCall} />

          {/* E. Sales Activity & Touchpoint Timeline */}
          <ActivityTimelineSection lead={lead} />
        </div>

        {/* RIGHT COLUMN: Intent Telemetry, Decision Maker, & Account Governance (38% - 5 cols) */}
        <div className="lg:col-span-5 space-y-6 min-w-0">
          {/* F. Dominant Next Best Action (Positioned at TOP of Right Column) */}
          <NextBestActionSection
            lead={lead}
            recommendationState={recommendationState}
            onExecuteAction={handleInitiateCall}
            onOpenScheduleFollowUp={() => setIsSchedulerOpen(true)}
            onOpenDelay={() => setIsDelayModalOpen(true)}
            onOpenDismiss={() => setIsDismissModalOpen(true)}
            onResetRecommendation={handleResetRecommendation}
          />

          {/* G. Explainable Intent Score */}
          <div className="space-y-2">
            <IntentScore
              score={lead.intentScore}
              level={lead.intentLevel}
              reasoning={lead.scoreReasons}
              expandable={true}
              showDetailsDefault={true}
            />
          </div>

          {/* H. Verified Decision Maker Profile */}
          <DecisionMakerSection lead={lead} onUseInCall={handleUseInCall} />

          {/* I. Company Intelligence & Telemetry */}
          <CompanyIntelligenceSection lead={lead} />

          {/* J. Source & Provenance Verification */}
          <SourceProvenanceSection lead={lead} />
        </div>
      </div>

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
        recommendedActionTitle={lead.recommendedAction === 'call' ? 'Initiate Outbound AI Call & Schedule Follow-Up' : 'Schedule Technical Demo Walkthrough'}
        recommendedReason={lead.whyNow}
        onConfirmSchedule={handleConfirmSchedule}
      />

      <DelayActionModal
        isOpen={isDelayModalOpen}
        onClose={() => setIsDelayModalOpen(false)}
        companyName={lead.companyName}
        actionTitle={lead.recommendedAction === 'call' ? 'Initiate Outbound AI Call' : 'Schedule Technical Demo Walkthrough'}
        onConfirmDelay={handleConfirmDelay}
      />

      <DismissActionModal
        isOpen={isDismissModalOpen}
        onClose={() => setIsDismissModalOpen(false)}
        companyName={lead.companyName}
        actionTitle={lead.recommendedAction === 'call' ? 'Initiate Outbound AI Call' : 'Schedule Technical Demo Walkthrough'}
        onConfirmDismiss={handleConfirmDismiss}
      />
    </motion.div>
  );
};
