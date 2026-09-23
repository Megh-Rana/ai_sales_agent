import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { getCallResultData } from '../data/mockCallResults';
import { CallResultData } from '../types/callResults';
import { RecommendationState, FollowUpItem, DismissReason } from '../types/followUp';

import { CallResultHeader } from '../components/calls/results/CallResultHeader';
import { OutcomeBanner } from '../components/calls/results/OutcomeBanner';
import { NextBestActionCard } from '../components/calls/results/NextBestActionCard';
import { QualificationGrid } from '../components/calls/results/QualificationGrid';
import { BuyingSignalsSection } from '../components/calls/results/BuyingSignalsSection';
import { ObjectionsRisksSection } from '../components/calls/results/ObjectionsRisksSection';
import { ConversationSummaryCard } from '../components/calls/results/ConversationSummaryCard';
import { ProspectStatementsCard } from '../components/calls/results/ProspectStatementsCard';
import { LeadIntelligenceChanges } from '../components/calls/results/LeadIntelligenceChanges';
import { VerbatimTranscriptPanel } from '../components/calls/results/VerbatimTranscriptPanel';
import { CallMetadataCard } from '../components/calls/results/CallMetadataCard';
import { SendFollowUpModal } from '../components/calls/results/SendFollowUpModal';
import { ResultLoadingSkeleton } from '../components/calls/results/ResultLoadingSkeleton';

// V3 21st.dev Animations
import {
  AnimatedCircularProgress,
  AnimatedProgressBar,
  AnimatedTimeline,
  AnimatedTabs,
} from '../components/ui/21st';

// Workflow Modals
import { FollowUpSchedulerModal } from '../components/sales/workflow/FollowUpSchedulerModal';
import { DelayActionModal } from '../components/sales/workflow/DelayActionModal';
import { DismissActionModal } from '../components/sales/workflow/DismissActionModal';

import {
  Layers,
  CheckCircle2,
  Clock,
  PhoneOff,
  AlertTriangle,
  TrendingUp,
  Award,
} from 'lucide-react';

export const CallResults: React.FC = () => {
  const { callId, id } = useParams<{ callId?: string; id?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeCallId = searchParams.get('scenario') || callId || id || 'call-101';
  const [data, setData] = useState<CallResultData>(() => getCallResultData(activeCallId));
  const [highlightedTurnId, setHighlightedTurnId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  const [recommendationState, setRecommendationState] = useState<RecommendationState>({
    status: 'RECOMMENDED'
  });

  const [isSchedulerOpen, setIsSchedulerOpen] = useState(false);
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
  const [isDelayModalOpen, setIsDelayModalOpen] = useState(false);
  const [isDismissModalOpen, setIsDismissModalOpen] = useState(false);

  const simState = searchParams.get('state');
  const [isLoading, setIsLoading] = useState(simState === 'loading');

  useEffect(() => {
    if (simState === 'loading') {
      setIsLoading(true);
      const timer = setTimeout(() => setIsLoading(false), 800);
      return () => clearTimeout(timer);
    } else {
      setIsLoading(false);
    }
  }, [simState]);

  useEffect(() => {
    setData(getCallResultData(activeCallId));
    setRecommendationState({ status: 'RECOMMENDED' });
  }, [activeCallId]);

  const jumpTimersRef = React.useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    return () => {
      jumpTimersRef.current.forEach(clearTimeout);
      jumpTimersRef.current = [];
    };
  }, []);

  const handleJumpToTurn = useCallback((turnId?: string) => {
    if (!turnId) return;
    setHighlightedTurnId(turnId);

    const t1 = setTimeout(() => {
      const el = document.getElementById(`transcript-turn-${turnId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 50);

    const t2 = setTimeout(() => {
      setHighlightedTurnId((current) => (current === turnId ? null : current));
    }, 4000);

    jumpTimersRef.current.push(t1, t2);
  }, []);

  const handleScenarioChange = useCallback((scenarioId: string) => {
    setSearchParams({ scenario: scenarioId });
    setData(getCallResultData(scenarioId));
    setRecommendationState({ status: 'RECOMMENDED' });
  }, [setSearchParams]);

  const handleConfirmSchedule = (item: FollowUpItem) => {
    setRecommendationState({
      status: 'SCHEDULED',
      scheduledItem: item
    });
    toast.success(`Demo follow-up scheduled for ${data.companyName} on ${item.date} at ${item.time}.`);
  };

  const handleConfirmDelay = (delayedUntilDate: string, timeframeLabel: string) => {
    setRecommendationState({
      status: 'DELAYED',
      delayedUntil: timeframeLabel
    });
    toast.info(`Recommendation for ${data.companyName} postponed to ${timeframeLabel}.`);
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

  const keyTimelineItems = (data.keyStatements || []).map((ks, i) => ({
    id: ks.id || `ks-${i}`,
    time: ks.timestamp || `${i + 1}m`,
    title: ks.speaker,
    description: ks.statement,
    badge: ks.impact,
    status: 'completed' as const,
  }));

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/30">
      {/* Reviewer Scenario Switcher Bar */}
      <div className="bg-surface border-b border-border-strong px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-2 z-10 sticky top-0">
        <div className="flex items-center gap-2 text-foreground-secondary">
          <Layers className="w-3.5 h-3.5 text-primary" />
          <span className="font-semibold text-foreground">Call Session Dossier:</span>
        </div>

        <nav aria-label="Reviewer scenario switcher" className="flex flex-wrap items-center gap-1.5">
          {activeCallId !== 'call-101' && activeCallId !== 'call-102' && (
            <span className="px-2.5 py-1 rounded text-xs font-semibold bg-primary/20 text-primary border border-primary/40 flex items-center gap-1.5 shadow-xs">
              <CheckCircle2 className="w-3 h-3 text-primary" />
              <span>{data.companyName} ({data.outcome})</span>
            </span>
          )}
          <button
            onClick={() => handleScenarioChange('call-101')}
            className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors flex items-center gap-1.5 ${
              activeCallId === 'call-101'
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 font-semibold'
                : 'bg-surface-elevated text-foreground-secondary border-border'
            }`}
          >
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>Acme Mfg (Qualified)</span>
          </button>
          <button
            onClick={() => handleScenarioChange('call-102')}
            className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors flex items-center gap-1.5 ${
              activeCallId === 'call-102'
                ? 'bg-primary/20 text-primary border-primary/40 font-semibold'
                : 'bg-surface-elevated text-foreground-secondary border-border'
            }`}
          >
            <TrendingUp className="w-3 h-3 text-primary" />
            <span>Fintech (Interested)</span>
          </button>
        </nav>
      </div>

      {/* Main Header */}
      <CallResultHeader
        data={data}
        onOpenScheduleDemo={() => setIsSchedulerOpen(true)}
        onOpenFollowUp={() => setIsFollowUpModalOpen(true)}
      />

      {/* Gauges & Bar Strip */}
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-2xl border border-border-default bg-surface-0">
          <AnimatedCircularProgress
            value={data.outcome === 'QUALIFIED' ? 94 : data.outcome === 'INTERESTED' ? 84 : data.outcome === 'FAILED' ? 24 : 72}
            size={110}
            strokeWidth={8}
            label="QUALITY"
            variant="success"
            sublabel="Call Quality Rating"
          />
          <AnimatedCircularProgress
            value={data.nextBestAction?.confidence || (data.outcome === 'QUALIFIED' ? 91 : 78)}
            size={110}
            strokeWidth={8}
            label="CONFIDENCE"
            variant="primary"
            sublabel="AI Confidence Index"
          />
          <div className="flex flex-col justify-center space-y-3">
            <AnimatedProgressBar
              value={Math.round((data.qualification.filter(q => q.status === 'confirmed').length / Math.max(data.qualification.length, 1)) * 100) || 75}
              label="Qualification Progress"
              color="success"
            />
            <AnimatedProgressBar
              value={data.outcome === 'QUALIFIED' ? 96 : 82}
              label="Decision Maker Alignment"
              color="primary"
            />
          </div>
        </div>
      </div>

      {/* Page Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {isLoading ? (
          <ResultLoadingSkeleton isPartial={simState === 'partial'} />
        ) : (
          <>
            <OutcomeBanner
              outcome={data.outcome}
              explanation={data.outcomeExplanation}
              supportingIndicators={data.supportingIndicators}
              failureReason={data.failureReason}
            />

            <NextBestActionCard
              nba={data.nextBestAction}
              recommendationState={recommendationState}
              onOpenScheduleDemo={() => setIsSchedulerOpen(true)}
              onOpenFollowUp={() => setIsFollowUpModalOpen(true)}
              onOpenDelay={() => setIsDelayModalOpen(true)}
              onOpenDismiss={() => setIsDismissModalOpen(true)}
              onResetRecommendation={handleResetRecommendation}
            />

            <QualificationGrid fields={data.qualification} onJumpToTurn={handleJumpToTurn} />

            {/* Conversation Key Moments Timeline */}
            <div className="p-4 rounded-2xl border border-border-default bg-surface-0 space-y-3">
              <h3 className="text-xs font-bold text-foreground font-mono uppercase tracking-wider flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" /> Key Conversation Moments Timeline
              </h3>
              <AnimatedTimeline items={keyTimelineItems} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              <div className="space-y-6">
                <BuyingSignalsSection signals={data.buyingSignals} onJumpToTurn={handleJumpToTurn} />
                <ObjectionsRisksSection objections={data.objections} onJumpToTurn={handleJumpToTurn} />
              </div>

              <div className="space-y-6">
                <ConversationSummaryCard summary={data.summary} />
                <ProspectStatementsCard statements={data.keyStatements} onJumpToTurn={handleJumpToTurn} />
              </div>
            </div>

            <LeadIntelligenceChanges changes={data.intelligenceChanges} companyName={data.companyName} />
            <VerbatimTranscriptPanel transcript={data.transcript} highlightedTurnId={highlightedTurnId} />
            <CallMetadataCard metadata={data.metadata} />
          </>
        )}
      </main>

      <FollowUpSchedulerModal
        isOpen={isSchedulerOpen}
        onClose={() => setIsSchedulerOpen(false)}
        leadId={data.leadId}
        companyName={data.companyName}
        contactName={data.contactName}
        contactRole={data.contactRole}
        requirement={data.qualification.find((q) => q.key === 'Need')?.value || data.summary}
        intentScore={88}
        recommendedActionTitle={data.nextBestAction.action}
        recommendedReason={data.nextBestAction.whyNow}
        evidenceList={data.nextBestAction.evidence}
        onConfirmSchedule={handleConfirmSchedule}
      />

      <SendFollowUpModal isOpen={isFollowUpModalOpen} onClose={() => setIsFollowUpModalOpen(false)} data={data} />
      <DelayActionModal isOpen={isDelayModalOpen} onClose={() => setIsDelayModalOpen(false)} companyName={data.companyName} actionTitle={data.nextBestAction.action} onConfirmDelay={handleConfirmDelay} />
      <DismissActionModal isOpen={isDismissModalOpen} onClose={() => setIsDismissModalOpen(false)} companyName={data.companyName} actionTitle={data.nextBestAction.action} onConfirmDismiss={handleConfirmDismiss} />
    </div>
  );
};

export default CallResults;
