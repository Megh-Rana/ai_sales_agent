import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  CallSession,
  CallState,
  AudioStatus,
  CallLanguage,
  TranscriptItem,
  IntelligenceEvent,
  QualificationDimension,
  CurrentObjective
} from '../types/calls';
import { getLeadDetails, mockDiscoveredLeads } from '../data/leads';
import {
  createMockCallSession,
  buildDynamicScriptForLead,
  ScriptProgressionStep,
  INITIAL_QUALIFICATION_DIMENSIONS
} from '../data/mockCalls';
import { CallHeader } from '../components/calls/CallHeader';
import { CallWaveform } from '../components/calls/CallWaveform';
import { LiveTranscript } from '../components/calls/LiveTranscript';
import { LiveIntelligenceRail } from '../components/calls/LiveIntelligenceRail';
import { CallControls } from '../components/calls/CallControls';
import { PreCallView } from '../components/calls/PreCallView';
import { CallConfirmationModal } from '../components/calls/CallConfirmationModal';
import { CallConnectingView } from '../components/calls/CallConnectingView';
import { CallCompletedView } from '../components/calls/CallCompletedView';
import { CallFailureView } from '../components/calls/CallFailureView';
import { Button } from '../components/ui/Button';
import {
  MessageSquare,
  Sparkles,
  Zap,
  Sliders,
  RotateCcw,
  FastForward,
  PhoneOff,
  PhoneMissed,
  Layers,
  ArrowLeft,
  AlertCircle,
  Loader2
} from 'lucide-react';

export const AICalling: React.FC = () => {
  const { callId, id } = useParams<{ callId?: string; id?: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Resolve lead ID from URL params or search params
  const rawId = callId || id || '';
  const queryLeadId = searchParams.get('leadId');

  const resolvedLeadId = React.useMemo(() => {
    if (queryLeadId) return queryLeadId;
    if (rawId.startsWith('call-lead-')) return rawId.replace('call-', '');
    if (rawId.startsWith('call-')) return `lead-${rawId.replace('call-', '')}`;
    if (rawId.startsWith('lead-')) return rawId;
    return 'lead-101'; // Default to flagship Acme Logistics
  }, [queryLeadId, rawId]);

  const lead = getLeadDetails(resolvedLeadId);

  // Primary Call Session State
  const [session, setSession] = useState<CallSession>(() => {
    return createMockCallSession(resolvedLeadId, rawId || undefined, 'English');
  });

  // Modal / Sub-State trackers
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [connectingStageText, setConnectingStageText] = useState('Allocating Tier-1 SIP Carrier Route...');
  const [activeMobileTab, setActiveMobileTab] = useState<'transcript' | 'intelligence'>('transcript');
  const [showDevSimulator, setShowDevSimulator] = useState(false);

  // Script Progression & Timer Refs
  const scriptSteps = React.useMemo(() => {
    return buildDynamicScriptForLead(resolvedLeadId);
  }, [resolvedLeadId]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const activeTimeoutsRef = useRef<NodeJS.Timeout[]>([]);
  const stepIndexRef = useRef<number>(0);

  // Safe timeout scheduler that tracks active handles
  const safeTimeout = useCallback((fn: () => void, ms: number) => {
    const t = setTimeout(() => {
      activeTimeoutsRef.current = activeTimeoutsRef.current.filter((id) => id !== t);
      fn();
    }, ms);
    activeTimeoutsRef.current.push(t);
    return t;
  }, []);

  // Clear all tracked active timeouts
  const clearAllTimeouts = useCallback(() => {
    activeTimeoutsRef.current.forEach(clearTimeout);
    activeTimeoutsRef.current = [];
  }, []);

  // Helper to format duration MM:SS
  const formatDuration = useCallback((totalSeconds: number): string => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Cleanup all timers and intervals on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      clearAllTimeouts();
    };
  }, [clearAllTimeouts]);

  // Synchronize script steps with deterministic duration in LIVE state
  useEffect(() => {
    if (session.status !== 'LIVE') return;

    // Check if next step is ready to be revealed
    const nextStep = scriptSteps.find((s) => s.stepIndex === stepIndexRef.current + 1);

    if (nextStep && session.duration >= nextStep.atSeconds) {
      stepIndexRef.current = nextStep.stepIndex;

      setSession((prev) => {
        const updatedTranscript = [...prev.transcript, nextStep.transcriptItem];
        const updatedEvents = nextStep.intelligenceEvent
          ? [nextStep.intelligenceEvent, ...prev.intelligenceEvents]
          : prev.intelligenceEvents;

        const updatedQualification = nextStep.qualificationUpdate
          ? {
              ...prev.qualification,
              [nextStep.qualificationUpdate.dimension]: {
                ...prev.qualification[nextStep.qualificationUpdate.dimension],
                status: nextStep.qualificationUpdate.status,
                detail: nextStep.qualificationUpdate.detail,
                evidence: nextStep.qualificationUpdate.evidence
              }
            }
          : prev.qualification;

        return {
          ...prev,
          audioStatus: nextStep.audioStatus,
          transcript: updatedTranscript,
          intelligenceEvents: updatedEvents,
          qualification: updatedQualification,
          currentObjective: nextStep.objectiveUpdate || prev.currentObjective
        };
      });

      // Show high-signal toast notification on detected buying signal
      if (nextStep.intelligenceEvent?.type === 'buying_signal') {
        toast.info(nextStep.intelligenceEvent.title, {
          description: nextStep.intelligenceEvent.description,
          duration: 3500
        });
      }
    }

    // Auto-complete call after final step duration + buffer
    const finalStep = scriptSteps[scriptSteps.length - 1];
    if (finalStep && session.duration >= finalStep.atSeconds + 10) {
      if (timerRef.current) clearInterval(timerRef.current);
      setSession((prev) => ({
        ...prev,
        status: 'COMPLETING',
        audioStatus: 'idle'
      }));

      safeTimeout(() => {
        setSession((prev) => ({
          ...prev,
          status: 'COMPLETED',
          audioStatus: 'idle'
        }));
        toast.success('Conversation concluded. Executive debrief generated.');
      }, 750);
    }
  }, [session.status, session.duration, scriptSteps, safeTimeout]);

  // Master Call Duration Timer
  useEffect(() => {
    if (session.status === 'LIVE') {
      timerRef.current = setInterval(() => {
        setSession((prev) => ({
          ...prev,
          duration: prev.duration + 1
        }));
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [session.status]);

  // Handle Starting the Call Flow
  const handleInitiateCall = () => {
    setIsConfirmationOpen(true);
  };

  const handleConfirmStart = (language: CallLanguage) => {
    setIsConfirmationOpen(false);
    clearAllTimeouts();
    stepIndexRef.current = 0;

    setSession((prev) => ({
      ...prev,
      language,
      status: 'CONNECTING',
      audioStatus: 'idle',
      duration: 0,
      transcript: [],
      intelligenceEvents: [],
      qualification: JSON.parse(JSON.stringify(INITIAL_QUALIFICATION_DIMENSIONS))
    }));

    setConnectingStageText('Allocating Tier-1 SIP Carrier Route...');

    // Stage 1: Connecting (1.2s)
    safeTimeout(() => {
      setConnectingStageText(`Calling ${session.contactName} (${session.contactPhone})...`);

      // Stage 2: Ringing (1.5s later)
      safeTimeout(() => {
        setSession((prev) => ({ ...prev, status: 'RINGING' }));
        setConnectingStageText(`Ringing ${session.contactName}'s direct line...`);

        // Stage 3: Answered & Live (2.0s later)
        safeTimeout(() => {
          setSession((prev) => ({
            ...prev,
            status: 'LIVE',
            audioStatus: 'ai_speaking'
          }));
          toast.success(`${session.contactName} answered the call. Live full-duplex session active.`);
        }, 2000);
      }, 1500);
    }, 1200);
  };

  // Toggle Mute
  const handleToggleMute = useCallback(() => {
    setSession((prev) => {
      const nextMuted = !prev.isMuted;
      toast(nextMuted ? 'Microphone muted' : 'Microphone unmuted', {
        duration: 1500
      });
      return { ...prev, isMuted: nextMuted };
    });
  }, []);

  // Toggle Pause
  const handleTogglePause = useCallback(() => {
    setSession((prev) => {
      if (prev.status === 'LIVE') {
        toast.warning('Call paused. Spoken AI stream suspended.');
        return { ...prev, status: 'PAUSED', audioStatus: 'paused' };
      }
      if (prev.status === 'PAUSED') {
        toast.info('Resuming live conversation stream.');
        return { ...prev, status: 'LIVE', audioStatus: 'ai_speaking' };
      }
      return prev;
    });
  }, []);

  // Toggle Human Takeover
  const handleTakeOver = useCallback(() => {
    setSession((prev) => {
      const nextTakeover = !prev.isHumanTakeover;
      if (nextTakeover) {
        toast.success('Human Sales Representative takeover active. AI voice muted.');
      } else {
        toast.info('Returned call control to autonomous AI voice agent.');
      }
      return {
        ...prev,
        isHumanTakeover: nextTakeover,
        audioStatus: nextTakeover ? 'prospect_speaking' : 'ai_speaking'
      };
    });
  }, []);

  // End Call with safe COMPLETING transition
  const handleEndCall = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    clearAllTimeouts();

    setSession((prev) => ({
      ...prev,
      status: 'COMPLETING',
      audioStatus: 'idle'
    }));

    safeTimeout(() => {
      setSession((prev) => ({
        ...prev,
        status: 'COMPLETED',
        audioStatus: 'idle'
      }));
      toast.success('Conversation concluded. Executive brief generated.');
    }, 750);
  }, [clearAllTimeouts, safeTimeout]);

  // Cancel Connecting
  const handleCancelConnecting = () => {
    clearAllTimeouts();
    setSession((prev) => ({
      ...prev,
      status: 'PRE_CALL',
      audioStatus: 'idle',
      duration: 0
    }));
    toast('Outbound dial canceled.');
  };

  // Global Keyboard Shortcuts (With modal safety guard)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore when inside input/textarea/select or when any modal dialog is open
      if (
        ['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName) ||
        isConfirmationOpen ||
        document.querySelector('[role="dialog"]')
      ) {
        return;
      }

      if (e.code === 'Space' && session.status === 'LIVE') {
        e.preventDefault();
        handleToggleMute();
      } else if (e.code === 'KeyP' && (session.status === 'LIVE' || session.status === 'PAUSED')) {
        e.preventDefault();
        handleTogglePause();
      } else if (e.code === 'KeyT' && session.status === 'LIVE') {
        e.preventDefault();
        handleTakeOver();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [session.status, isConfirmationOpen, handleToggleMute, handleTogglePause, handleTakeOver]);

  // Reviewer / Demo State Overrides
  const simulateNoAnswer = () => {
    clearAllTimeouts();
    setSession((prev) => ({
      ...prev,
      status: 'NO_ANSWER',
      audioStatus: 'idle',
      failureReason: 'Contact did not answer after 5 rings (Carrier timeout).'
    }));
    toast.error('Simulation: No answer from contact.');
  };

  const simulateFailure = () => {
    clearAllTimeouts();
    setSession((prev) => ({
      ...prev,
      status: 'FAILED',
      audioStatus: 'idle',
      failureReason: 'Telephony carrier SIP route dropped connection.'
    }));
    toast.error('Simulation: Connection failure triggered.');
  };

  const fastForwardToComplete = () => {
    clearAllTimeouts();
    if (timerRef.current) clearInterval(timerRef.current);

    const allTranscript = scriptSteps.map((s) => s.transcriptItem);
    const allEvents = scriptSteps
      .filter((s) => s.intelligenceEvent)
      .map((s) => s.intelligenceEvent!)
      .reverse();

    const fullyConfirmedQualification = { ...session.qualification };
    scriptSteps.forEach((s) => {
      if (s.qualificationUpdate) {
        fullyConfirmedQualification[s.qualificationUpdate.dimension] = {
          ...fullyConfirmedQualification[s.qualificationUpdate.dimension],
          status: s.qualificationUpdate.status,
          detail: s.qualificationUpdate.detail,
          evidence: s.qualificationUpdate.evidence
        };
      }
    });

    setSession((prev) => ({
      ...prev,
      duration: 142,
      status: 'COMPLETED',
      audioStatus: 'idle',
      transcript: allTranscript,
      intelligenceEvents: allEvents,
      qualification: fullyConfirmedQualification
    }));
    toast.success('Simulation: Fast-forwarded to Call Completion.');
  };

  const resetToPreCall = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    clearAllTimeouts();
    stepIndexRef.current = 0;
    setSession(createMockCallSession(resolvedLeadId, session.callId, session.language));
    toast('Reset session to Pre-Call state.');
  };

  // Safe navigation to Call Results & AI Qualification
  const handleViewResults = () => {
    navigate(`/calls/${session.callId}/results`);
  };

  // Graceful 404 / Missing Lead Handling
  if (!lead) {
    return (
      <div className="py-16 max-w-md mx-auto text-center space-y-4 bg-surface-0 border border-border-default rounded-xl p-8 shadow-xs animate-in fade-in duration-200">
        <AlertCircle className="w-10 h-10 text-foreground-tertiary mx-auto" />
        <div className="space-y-1">
          <h2 className="text-h3 font-bold text-foreground">Call Session Not Found</h2>
          <p className="text-xs text-foreground-secondary">
            No active lead or call session matches the identifier "{rawId}".
          </p>
        </div>
        <Button
          variant="secondary"
          size="md"
          leftIcon={<ArrowLeft className="w-4 h-4" />}
          onClick={() => navigate('/leads/discover')}
          className="text-xs font-medium"
        >
          Back to Lead Discovery
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-5 pb-16">
      {/* 1. PRE-CALL STATE */}
      {session.status === 'PRE_CALL' && (
        <PreCallView
          lead={lead}
          onStartCallFlow={handleInitiateCall}
        />
      )}

      {/* 2. CONNECTING / RINGING STATES */}
      {(session.status === 'CONNECTING' || session.status === 'RINGING') && (
        <div className="py-8">
          <CallConnectingView
            status={session.status}
            companyName={session.companyName}
            contactName={session.contactName}
            contactRole={session.contactRole}
            contactPhone={session.contactPhone}
            location={lead.location}
            connectingStageText={connectingStageText}
            onCancelCall={handleCancelConnecting}
          />
        </div>
      )}

      {/* 3. FAILED OR NO-ANSWER STATES */}
      {(session.status === 'FAILED' || session.status === 'NO_ANSWER') && (
        <div className="py-8">
          <CallFailureView
            type={session.status}
            reason={session.failureReason}
            companyName={session.companyName}
            contactName={session.contactName}
            contactPhone={session.contactPhone}
            onRetry={() => handleConfirmStart(session.language)}
            onScheduleFollowUp={() => {
              toast.success(`Priority follow-up scheduled for ${session.companyName} in 2 hours.`);
              navigate(`/leads/${session.leadId}`);
            }}
            onBackToLead={() => navigate(`/leads/${session.leadId}`)}
          />
        </div>
      )}

      {/* 4. COMPLETING STATE (TRANSITIONAL SYNTHESIS) */}
      {session.status === 'COMPLETING' && (
        <div className="py-16 max-w-md mx-auto text-center space-y-4 bg-surface-0 border border-border-default rounded-xl p-8 shadow-xs animate-in fade-in duration-200">
          <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/25 flex items-center justify-center text-primary mx-auto">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-primary">
              Synthesizing Executive Debrief
            </span>
            <h2 className="text-h3 font-bold text-foreground">
              Finalizing Call Intelligence...
            </h2>
            <p className="text-xs text-foreground-secondary">
              Compiling verified BANT dimensions, detected signals, and next best actions for {session.companyName}.
            </p>
          </div>
        </div>
      )}

      {/* 5. COMPLETED STATE */}
      {session.status === 'COMPLETED' && (
        <div className="py-6">
          <CallCompletedView
            session={session}
            formatDuration={formatDuration}
            onViewResults={handleViewResults}
            onBackToLead={() => navigate(`/leads/${session.leadId}`)}
          />
        </div>
      )}

      {/* 6. LIVE AND PAUSED STATES (CORE INTERACTION SURFACE) */}
      {(session.status === 'LIVE' || session.status === 'PAUSED') && (
        <div className="space-y-4 animate-in fade-in duration-300">
          {/* Header */}
          <CallHeader
            session={session}
            formatDuration={formatDuration}
          />

          {/* Compact Waveform Stream */}
          <CallWaveform
            status={session.audioStatus}
            isMuted={session.isMuted}
          />

          {/* Explicit Paused In-Stream Notice */}
          {session.status === 'PAUSED' && (
            <div
              role="status"
              aria-live="polite"
              className="p-3 rounded-xl bg-surface-elevated border border-border-default flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs animate-in fade-in duration-200"
            >
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0" />
                <span className="font-bold text-foreground">Call Paused</span>
                <span className="text-foreground-tertiary">·</span>
                <span className="text-foreground-secondary">
                  Prospect line held active on carrier bridge. Spoken AI dialogue is suspended.
                </span>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={handleTogglePause}
                className="text-xs shrink-0 font-medium"
              >
                Resume Call (P)
              </Button>
            </div>
          )}

          {/* Mobile Tab Switcher */}
          <div className="flex lg:hidden items-center gap-2 p-1 bg-surface-elevated rounded-lg border border-border-subtle">
            <button
              type="button"
              onClick={() => setActiveMobileTab('transcript')}
              className={`flex-1 py-1.5 px-3 rounded-md text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                activeMobileTab === 'transcript'
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-foreground-secondary hover:text-foreground'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Transcript ({session.transcript.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveMobileTab('intelligence')}
              className={`flex-1 py-1.5 px-3 rounded-md text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                activeMobileTab === 'intelligence'
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-foreground-secondary hover:text-foreground'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-signal-high" />
              <span>Intelligence ({session.intelligenceEvents.length})</span>
            </button>
          </div>

          {/* Main Content Area */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            {/* Primary Transcript Surface (7 columns on desktop) */}
            <div
              className={`lg:col-span-7 h-[560px] flex flex-col ${
                activeMobileTab === 'transcript' ? 'block' : 'hidden lg:flex'
              }`}
            >
              <LiveTranscript
                transcript={session.transcript}
                isCallLive={session.status === 'LIVE'}
                className="h-full"
              />
            </div>

            {/* Supporting Intelligence Rail (5 columns on desktop) */}
            <div
              className={`lg:col-span-5 ${
                activeMobileTab === 'intelligence' ? 'block' : 'hidden lg:block'
              }`}
            >
              <LiveIntelligenceRail
                objective={session.currentObjective}
                intelligenceEvents={session.intelligenceEvents}
                qualification={session.qualification}
              />
            </div>
          </div>

          {/* Bottom Call Controls Bar */}
          <CallControls
            isMuted={session.isMuted}
            isPaused={session.status === 'PAUSED'}
            isHumanTakeover={session.isHumanTakeover}
            onToggleMute={handleToggleMute}
            onTogglePause={handleTogglePause}
            onTakeOver={handleTakeOver}
            onEndCall={handleEndCall}
          />
        </div>
      )}

      {/* LIGHTWEIGHT CONFIRMATION MODAL */}
      <CallConfirmationModal
        isOpen={isConfirmationOpen}
        onClose={() => setIsConfirmationOpen(false)}
        onConfirm={handleConfirmStart}
        companyName={session.companyName}
        contactName={session.contactName}
        contactRole={session.contactRole}
        objective={`Understand their ${lead.industry.toLowerCase()} requirement and qualify implementation timeline.`}
        whyNow={lead.whyNow}
        selectedLanguage={session.language}
        onLanguageChange={(lang) => setSession((prev) => ({ ...prev, language: lang }))}
      />

      {/* DEVELOPER / REVIEWER SCENARIO SIMULATOR BAR */}
      <div className="pt-4 border-t border-border-subtle flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowDevSimulator((prev) => !prev)}
            className="inline-flex items-center gap-1 text-[11px] font-mono text-foreground-tertiary hover:text-foreground transition-colors px-2 py-1 rounded bg-surface-elevated border border-border-subtle"
          >
            <Sliders className="w-3 h-3 text-primary" />
            <span>{showDevSimulator ? 'Hide Test Simulator' : 'Reviewer Test Controls'}</span>
          </button>
          <span className="text-[11px] text-foreground-tertiary">
            Current State: <strong className="font-mono text-primary">{session.status}</strong>
          </span>
        </div>

        {showDevSimulator && (
          <div className="w-full p-3 rounded-lg bg-surface-elevated/70 border border-border-subtle flex flex-wrap items-center gap-2 animate-in fade-in duration-200">
            <span className="text-[10px] font-mono uppercase text-foreground-tertiary font-bold mr-2">
              State Simulation:
            </span>

            <Button
              variant="secondary"
              size="sm"
              leftIcon={<RotateCcw className="w-3 h-3" />}
              onClick={resetToPreCall}
              className="text-xs"
            >
              Reset to Pre-Call
            </Button>

            <Button
              variant="secondary"
              size="sm"
              leftIcon={<FastForward className="w-3 h-3 text-primary" />}
              onClick={fastForwardToComplete}
              className="text-xs"
            >
              Jump to Complete
            </Button>

            <Button
              variant="secondary"
              size="sm"
              leftIcon={<PhoneMissed className="w-3 h-3 text-signal-high" />}
              onClick={simulateNoAnswer}
              className="text-xs"
            >
              Simulate No Answer
            </Button>

            <Button
              variant="secondary"
              size="sm"
              leftIcon={<PhoneOff className="w-3 h-3 text-signal-urgent" />}
              onClick={simulateFailure}
              className="text-xs"
            >
              Simulate Drop
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
