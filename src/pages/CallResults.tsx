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
  TrendingUp
} from 'lucide-react';

export const CallResults: React.FC = () => {
  const { callId, id } = useParams<{ callId?: string; id?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active call ID resolution
  const activeCallId = searchParams.get('scenario') || callId || id || 'call-101';
  
  // Data resolution
  const [data, setData] = useState<CallResultData>(() => getCallResultData(activeCallId));
  const [highlightedTurnId, setHighlightedTurnId] = useState<string | null>(null);

  // Workflow Recommendation State
  const [recommendationState, setRecommendationState] = useState<RecommendationState>({
    status: 'RECOMMENDED'
  });

  // Modals
  const [isSchedulerOpen, setIsSchedulerOpen] = useState(false);
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
  const [isDelayModalOpen, setIsDelayModalOpen] = useState(false);
  const [isDismissModalOpen, setIsDismissModalOpen] = useState(false);

  // Simulation mode: loading or partial
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
    // Reset recommendation state when scenario changes
    setRecommendationState({ status: 'RECOMMENDED' });
  }, [activeCallId]);

  const jumpTimersRef = React.useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    return () => {
      jumpTimersRef.current.forEach(clearTimeout);
      jumpTimersRef.current = [];
    };
  }, []);

  // Turn Jump Anchor Handler
  const handleJumpToTurn = useCallback((turnId?: string) => {
    if (!turnId) return;

    setHighlightedTurnId(turnId);

    // Give DOM time to expand or render if needed
    const t1 = setTimeout(() => {
      const el = document.getElementById(`transcript-turn-${turnId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 50);

    // Auto clear highlight after 4 seconds
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

  // Workflow Event Handlers
  const handleConfirmSchedule = (item: FollowUpItem) => {
    setRecommendationState({
      status: 'SCHEDULED',
      scheduledItem: item
    });

    // Dynamically add a stage progression to intelligence updates if not present
    setData((prev) => {
      const updatedChanges = [
        ...prev.intelligenceChanges,
        {
          metric: 'Sales Workflow Action',
          before: 'Recommendation Pending',
          after: `Demo Scheduled (${item.date})`,
          rationale: `Action confirmed by AE: ${item.note || 'Meeting invite dispatched'}`,
          direction: 'up' as const
        }
      ];
      return {
        ...prev,
        intelligenceChanges: updatedChanges
      };
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
    toast('Recommendation dismissed. Recorded feedback.');
  };

  const handleResetRecommendation = () => {
    setRecommendationState({ status: 'RECOMMENDED' });
    toast.success('Recommendation re-activated.');
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/30">
      {/* Reviewer / Evaluation Scenario Switcher Bar */}
      <div className="bg-surface border-b border-border-strong px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-2 z-10 sticky top-0">
        <div className="flex items-center gap-2 text-foreground-secondary">
          <Layers className="w-3.5 h-3.5 text-primary" />
          <span className="font-semibold text-foreground">Reviewer Scenarios:</span>
        </div>

        <nav aria-label="Reviewer scenario switcher" className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => handleScenarioChange('call-101')}
            aria-current={activeCallId === 'call-101' ? 'page' : undefined}
            className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              activeCallId === 'call-101'
                ? 'bg-success-muted text-success border-success/40 shadow-sm font-semibold'
                : 'bg-surface-elevated text-foreground-secondary border-border hover:border-border-strong'
            }`}
          >
            <CheckCircle2 className="w-3 h-3 text-success" />
            <span>Acme Mfg (Qualified Flagship)</span>
          </button>

          <button
            onClick={() => handleScenarioChange('call-102')}
            aria-current={activeCallId === 'call-102' ? 'page' : undefined}
            className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              activeCallId === 'call-102'
                ? 'bg-primary-muted text-primary border-primary/40 shadow-sm font-semibold'
                : 'bg-surface-elevated text-foreground-secondary border-border hover:border-border-strong'
            }`}
          >
            <TrendingUp className="w-3 h-3 text-primary" />
            <span>Fintech (Interested)</span>
          </button>

          <button
            onClick={() => handleScenarioChange('call-103')}
            aria-current={activeCallId === 'call-103' ? 'page' : undefined}
            className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              activeCallId === 'call-103'
                ? 'bg-warning-muted text-warning border-warning/40 shadow-sm font-semibold'
                : 'bg-surface-elevated text-foreground-secondary border-border hover:border-border-strong'
            }`}
          >
            <Clock className="w-3 h-3 text-warning" />
            <span>Nexus (Follow-up)</span>
          </button>

          <button
            onClick={() => handleScenarioChange('call-104')}
            aria-current={activeCallId === 'call-104' ? 'page' : undefined}
            className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              activeCallId === 'call-104'
                ? 'bg-surface-hover text-foreground border-border-strong font-semibold'
                : 'bg-surface-elevated text-foreground-secondary border-border hover:border-border-strong'
            }`}
          >
            <PhoneOff className="w-3 h-3 text-foreground-tertiary" />
            <span>CloudTech (No Answer)</span>
          </button>

          <button
            onClick={() => handleScenarioChange('call-105')}
            aria-current={activeCallId === 'call-105' ? 'page' : undefined}
            className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              activeCallId === 'call-105'
                ? 'bg-danger-muted text-danger border-danger/40 shadow-sm font-semibold'
                : 'bg-surface-elevated text-foreground-secondary border-border hover:border-border-strong'
            }`}
          >
            <AlertTriangle className="w-3 h-3 text-danger" />
            <span>Beacon (Failed Call)</span>
          </button>
        </nav>
      </div>

      {/* Main Header */}
      <CallResultHeader
        data={data}
        onOpenScheduleDemo={() => setIsSchedulerOpen(true)}
        onOpenFollowUp={() => setIsFollowUpModalOpen(true)}
      />

      {/* Page Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {simState === 'error' || data.status === 'error' ? (
          <div role="alert" className="p-6 rounded-xl bg-rose-950/30 border border-rose-500/40 text-rose-200 space-y-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <h2 className="text-base font-bold text-white">Call analysis couldn't be completed</h2>
                <p className="text-xs text-rose-300 mt-1 leading-relaxed">
                  Automated sales intelligence extraction encountered a carrier telemetry timeout. Telephony recording and raw verbatim transcript remain accessible below.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-rose-900/50">
              <button
                onClick={() => {
                  setIsLoading(true);
                  setTimeout(() => {
                    setIsLoading(false);
                    setSearchParams({ scenario: activeCallId });
                  }, 600);
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg shadow-sm transition-colors"
              >
                Retry Analysis
              </button>
              <button
                onClick={() => window.history.back()}
                className="px-4 py-2 text-xs font-medium text-foreground-secondary hover:text-foreground bg-surface-elevated border border-border-strong rounded-lg transition-colors"
              >
                Back to Lead
              </button>
            </div>
          </div>
        ) : null}

        {isLoading ? (
          <ResultLoadingSkeleton isPartial={simState === 'partial'} />
        ) : (
          <>
            {/* 1. Outcome Assessment Banner */}
            <OutcomeBanner
              outcome={data.outcome}
              explanation={data.outcomeExplanation}
              supportingIndicators={data.supportingIndicators}
              failureReason={data.failureReason}
            />

            {/* 2. Dominant Commercial Decision Card: Next Best Action & Workflow Integration */}
            <NextBestActionCard
              nba={data.nextBestAction}
              recommendationState={recommendationState}
              onOpenScheduleDemo={() => setIsSchedulerOpen(true)}
              onOpenFollowUp={() => setIsFollowUpModalOpen(true)}
              onOpenDelay={() => setIsDelayModalOpen(true)}
              onOpenDismiss={() => setIsDismissModalOpen(true)}
              onResetRecommendation={handleResetRecommendation}
            />

            {/* 3. Structured Qualification Matrix (8 Standard B2B Fields) */}
            <QualificationGrid
              fields={data.qualification}
              onJumpToTurn={handleJumpToTurn}
            />

            {/* 4. Core Sales Intelligence: 2-Column Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              {/* Left Column: Signals & Objections */}
              <div className="space-y-6">
                <BuyingSignalsSection
                  signals={data.buyingSignals}
                  onJumpToTurn={handleJumpToTurn}
                />

                <ObjectionsRisksSection
                  objections={data.objections}
                  onJumpToTurn={handleJumpToTurn}
                />
              </div>

              {/* Right Column: Executive Summary & Key Statements */}
              <div className="space-y-6">
                <ConversationSummaryCard
                  summary={data.summary}
                />

                <ProspectStatementsCard
                  statements={data.keyStatements}
                  onJumpToTurn={handleJumpToTurn}
                />
              </div>
            </div>

            {/* 5. Lead Intelligence Updates (Dossier Synchronization) */}
            <LeadIntelligenceChanges
              changes={data.intelligenceChanges}
              companyName={data.companyName}
            />

            {/* 6. Verbatim Transcript with Interactive Navigation */}
            <VerbatimTranscriptPanel
              transcript={data.transcript}
              highlightedTurnId={highlightedTurnId}
            />

            {/* 7. Subdued Telephony & Audio Player Telemetry */}
            <CallMetadataCard
              metadata={data.metadata}
            />
          </>
        )}
      </main>

      {/* Modals & Workflow Confirmations */}
      <FollowUpSchedulerModal
        isOpen={isSchedulerOpen}
        onClose={() => setIsSchedulerOpen(false)}
        leadId={data.leadId}
        companyName={data.companyName}
        contactName={data.contactName}
        contactRole={data.contactRole}
        requirement={data.qualification.find(q => q.key === 'Need')?.value || data.summary}
        intentScore={data.intelligenceChanges.find(c => c.metric.includes('Intent')) ? parseInt(data.intelligenceChanges.find(c => c.metric.includes('Intent'))!.after) : 88}
        recommendedActionTitle={data.nextBestAction.action}
        recommendedReason={data.nextBestAction.whyNow}
        evidenceList={data.nextBestAction.evidence}
        onConfirmSchedule={handleConfirmSchedule}
      />

      <SendFollowUpModal
        isOpen={isFollowUpModalOpen}
        onClose={() => setIsFollowUpModalOpen(false)}
        data={data}
      />

      <DelayActionModal
        isOpen={isDelayModalOpen}
        onClose={() => setIsDelayModalOpen(false)}
        companyName={data.companyName}
        actionTitle={data.nextBestAction.action}
        onConfirmDelay={handleConfirmDelay}
      />

      <DismissActionModal
        isOpen={isDismissModalOpen}
        onClose={() => setIsDismissModalOpen(false)}
        companyName={data.companyName}
        actionTitle={data.nextBestAction.action}
        onConfirmDismiss={handleConfirmDismiss}
      />
    </div>
  );
};
