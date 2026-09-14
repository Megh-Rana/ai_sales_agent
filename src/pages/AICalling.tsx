import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useI18n } from '../i18n/i18nContext';
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
import { getLeadDetails } from '../data/leads';
import {
  createMockCallSession,
  buildDynamicScriptForLead,
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

// V3 21st.dev Animations
import {
  AnimatedStatusIndicator,
  AnimatedTextScramble,
  AnimatedTypingEffect,
  AnimatedStepper,
  AnimatedProgressBar,
  AnimatedNumberTransition,
} from '../components/ui/21st';

import {
  MessageSquare,
  Sparkles,
  Zap,
  Sliders,
  RotateCcw,
  FastForward,
  PhoneOff,
  PhoneMissed,
  ArrowLeft,
  AlertCircle,
  Loader2
} from 'lucide-react';

export const AICalling: React.FC = () => {
  const { callId, id } = useParams<{ callId?: string; id?: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useI18n();

  const rawId = callId || id || '';
  const queryLeadId = searchParams.get('leadId');

  const resolvedLeadId = React.useMemo(() => {
    if (queryLeadId) return queryLeadId;
    if (rawId.startsWith('call-lead-')) return rawId.replace('call-', '');
    if (rawId.startsWith('call-')) return `lead-${rawId.replace('call-', '')}`;
    if (rawId.startsWith('lead-')) return rawId;
    return 'lead-101';
  }, [queryLeadId, rawId]);

  const lead = getLeadDetails(resolvedLeadId);

  const [session, setSession] = useState<CallSession>(() => {
    return createMockCallSession(resolvedLeadId, rawId || undefined, 'English');
  });

  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [connectingStageText, setConnectingStageText] = useState('Allocating Tier-1 SIP Carrier Route...');
  const [activeMobileTab, setActiveMobileTab] = useState<'transcript' | 'intelligence'>('transcript');
  const [showDevSimulator, setShowDevSimulator] = useState(false);

  const scriptSteps = React.useMemo(() => {
    return buildDynamicScriptForLead(resolvedLeadId);
  }, [resolvedLeadId]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const activeTimeoutsRef = useRef<NodeJS.Timeout[]>([]);
  const stepIndexRef = useRef<number>(0);

  const safeTimeout = useCallback((fn: () => void, ms: number) => {
    const t = setTimeout(() => {
      activeTimeoutsRef.current = activeTimeoutsRef.current.filter((id) => id !== t);
      fn();
    }, ms);
    activeTimeoutsRef.current.push(t);
    return t;
  }, []);

  const clearAllTimeouts = useCallback(() => {
    activeTimeoutsRef.current.forEach(clearTimeout);
    activeTimeoutsRef.current = [];
  }, []);

  const formatDuration = useCallback((totalSeconds: number): string => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      clearAllTimeouts();
    };
  }, [clearAllTimeouts]);

  useEffect(() => {
    if (session.status !== 'LIVE') return;

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

      if (nextStep.intelligenceEvent?.type === 'buying_signal') {
        toast.info(nextStep.intelligenceEvent.title, {
          description: nextStep.intelligenceEvent.description,
          duration: 3500
        });
      }
    }

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

    safeTimeout(() => {
      setConnectingStageText(`Calling ${session.contactName} (${session.contactPhone})...`);
      safeTimeout(() => {
        setSession((prev) => ({ ...prev, status: 'RINGING' }));
        setConnectingStageText(`Ringing ${session.contactName}'s direct line...`);
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

  const handleToggleMute = useCallback(() => {
    setSession((prev) => {
      const nextMuted = !prev.isMuted;
      toast(nextMuted ? 'Microphone muted' : 'Microphone unmuted', { duration: 1500 });
      return { ...prev, isMuted: nextMuted };
    });
  }, []);

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

  const mapAIStatus = (): 'ready' | 'thinking' | 'listening' | 'speaking' | 'completed' => {
    if (session.status === 'COMPLETED') return 'completed';
    if (session.status === 'CONNECTING' || session.status === 'RINGING') return 'thinking';
    if (session.audioStatus === 'prospect_speaking') return 'listening';
    if (session.audioStatus === 'ai_speaking') return 'speaking';
    return 'ready';
  };

  if (!lead) {
    return (
      <div className="py-16 max-w-md mx-auto text-center space-y-4 bg-surface-0 border border-border-default rounded-xl p-8 shadow-xs">
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
    <div className="space-y-4 sm:space-y-5 pb-16 sm:pb-20">
      {/* Top AI Status Indicator Bar - Cleaner design */}
      <div className="p-3 sm:p-4 rounded-2xl border border-skyBlue/20 bg-surface-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <AnimatedStatusIndicator status={mapAIStatus()} />
          <div className="text-xs sm:text-sm font-mono">
            <span className="font-bold text-foreground block uppercase">{t.calls.aiStatus}: {session.contactName}</span>
            <AnimatedTextScramble text={`STATUS_${session.status}`} speed={30} className="text-skyBlue text-[10px]" />
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="text-foreground-tertiary">{t.calls.confidence}:</span>
          <AnimatedNumberTransition value={94} suffix="%" className="text-emerald-400 font-bold" />
        </div>
      </div>

      {/* Workflow Stepper - Simplified */}
      <div className="p-3 sm:p-4 rounded-2xl border border-border-default bg-surface-0">
        <AnimatedStepper
          steps={[
            { id: '1', label: 'PREP' },
            { id: '2', label: 'CONNECT' },
            { id: '3', label: 'TALK' },
            { id: '4', label: 'QUALIFY' },
            { id: '5', label: 'SUMMARY' },
          ]}
          currentStepIndex={
            session.status === 'PRE_CALL'
              ? 0
              : session.status === 'CONNECTING' || session.status === 'RINGING'
              ? 1
              : session.status === 'LIVE' || session.status === 'PAUSED'
              ? 2
              : 4
          }
        />
      </div>

      {/* 1. PRE-CALL STATE */}
      {session.status === 'PRE_CALL' && (
        <PreCallView
          lead={lead}
          onStartCallFlow={handleInitiateCall}
        />
      )}

      {/* 2. CONNECTING / RINGING STATES */}
      {(session.status === 'CONNECTING' || session.status === 'RINGING') && (
        <div className="py-8 space-y-4">
          <AnimatedProgressBar value={65} color="primary" label="Establishing full-duplex audio route..." />
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

      {/* 4. COMPLETING STATE */}
      {session.status === 'COMPLETING' && (
        <div className="py-16 max-w-md mx-auto text-center space-y-4 bg-surface-0 border border-border-default rounded-xl p-8 shadow-xs">
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
            <AnimatedTypingEffect text="Compiling lead qualification dimensions and executive notes..." speed={20} className="text-xs text-foreground-secondary" />
          </div>
        </div>
      )}

      {/* 5. COMPLETED STATE */}
      {session.status === 'COMPLETED' && (
        <div className="py-6">
          <CallCompletedView
            session={session}
            formatDuration={formatDuration}
            onViewResults={() => navigate(`/calls/${session.callId}/results`)}
            onBackToLead={() => navigate(`/leads/${session.leadId}`)}
          />
        </div>
      )}

      {/* 6. LIVE AND PAUSED STATES - Cleaner layout */}
      {(session.status === 'LIVE' || session.status === 'PAUSED') && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <CallHeader session={session} formatDuration={formatDuration} />
          <CallWaveform status={session.audioStatus} isMuted={session.isMuted} />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            <div className="lg:col-span-7 h-[520px] sm:h-[560px] flex flex-col">
              <LiveTranscript transcript={session.transcript} isCallLive={session.status === 'LIVE'} className="h-full" />
            </div>

            <div className="lg:col-span-5">
              <LiveIntelligenceRail
                objective={session.currentObjective}
                intelligenceEvents={session.intelligenceEvents}
                qualification={session.qualification}
              />
            </div>
          </div>

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
    </div>
  );
};

export default AICalling;
