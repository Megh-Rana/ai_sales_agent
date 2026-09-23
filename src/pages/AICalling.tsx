import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
import { getLeadDetails, getDiscoveredLeads } from '../data/leads';
import {
  createMockCallSession,
  buildDynamicScriptForLead,
  INITIAL_QUALIFICATION_DIMENSIONS
} from '../data/mockCalls';
import { callService } from '../services/callService';
import { dataBackboneService } from '../services/dataBackboneService';
import { CallHeader } from '../components/calls/CallHeader';
import { CallWaveform } from '../components/calls/CallWaveform';
import { LiveTranscript } from '../components/calls/LiveTranscript';
import { LiveIntelligenceRail } from '../components/calls/LiveIntelligenceRail';
import { CallControls } from '../components/calls/CallControls';
import { PreCallView } from '../components/calls/PreCallView';
import { CallConfirmationModal } from '../components/calls/CallConfirmationModal';
import { SendPitchEmailModal } from '../components/calls/SendPitchEmailModal';
import { CallConnectingView } from '../components/calls/CallConnectingView';
import { CallCompletedView } from '../components/calls/CallCompletedView';
import { CallFailureView } from '../components/calls/CallFailureView';
import { Button } from '../components/ui/Button';
import { getProspectTimezone, getCallingWindowStatus } from '../utils/timezoneUtils';

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
  Loader2,
  CheckCircle2,
  Mail
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

  const lead = React.useMemo(() => {
    const found = getLeadDetails(resolvedLeadId);
    if (found) return found;
    const discovered = getDiscoveredLeads();
    const match = discovered.find(
      (d) =>
        d.id.toLowerCase() === resolvedLeadId.toLowerCase() ||
        d.id.toLowerCase() === resolvedLeadId.replace('lead-', '').toLowerCase()
    );
    if (match) return match;

    if (resolvedLeadId) {
      const num = resolvedLeadId.replace(/[^0-9]/g, '') || '2438';
      return {
        id: resolvedLeadId,
        companyName: `Discovered Enterprise #${num}`,
        companyDomain: `enterprise-${num}.com`,
        industry: 'B2B Technology & Logistics',
        location: 'Mumbai, India',
        employeeCount: '250-500',
        requirement: 'Autonomous AI voice agent and workflow dispatch automation',
        detailedPain: 'Manual operational bottleneck in lead qualification and outbound coordination',
        intentScore: 92,
        intentLevel: 'high' as const,
        scoreReasons: [
          'High buying intent signal detected on commercial network',
          'Actively seeking voice AI appointment qualification',
        ],
        whyNow: 'Urgent commercial deployment deadline for quarterly expansion',
        buyingSignals: [
          {
            id: `sig-${num}-1`,
            type: 'Commercial Requirement',
            description: 'Actively evaluating AI sales voice calling solutions for workflow automation.',
            timestamp: 'Today',
            impactScore: 94,
          },
        ],
        source: {
          platform: 'Web Search',
          originalRequirement: 'Looking for autonomous AI voice agent solutions.',
          sourceUrl: 'https://linkedin.com',
          discoveredAt: 'Today',
          postedAt: '1h ago',
        },
        estimatedValue: '₹45 Lakh / yr',
        recommendedAction: 'call' as const,
        suggestedOpeningHook: `Hello, following up on your business automation and AI voice initiative.`,
        decisionMakerContact: {
          name: 'Vikram Mehta',
          role: 'Head of Operations',
          phoneAvailable: true,
        },
        status: 'high-intent' as const,
      };
    }
    return null;
  }, [resolvedLeadId]);

  const [session, setSession] = useState<CallSession>(() => {
    return createMockCallSession(resolvedLeadId, rawId || undefined, 'English');
  });

  const [dynamicPitch, setDynamicPitch] = useState<string>('');
  const [isGeneratingPitch, setIsGeneratingPitch] = useState<boolean>(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [connectingStageText, setConnectingStageText] = useState('Allocating Tier-1 SIP Carrier Route...');
  const [activeMobileTab, setActiveMobileTab] = useState<'transcript' | 'intelligence'>('transcript');
  const [showDevSimulator, setShowDevSimulator] = useState(false);
  const [backendSessionId, setBackendSessionId] = useState<string | null>(null);
  const [isRealVoiceCall, setIsRealVoiceCall] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailNotificationToast, setEmailNotificationToast] = useState<string | null>(null);

  // Timezone and Calling Window Safety Analysis
  const prospectTimezone = useMemo(() => {
    return getProspectTimezone(lead?.location, session.contactPhone);
  }, [lead?.location, session.contactPhone]);

  const callingWindowStatus = useMemo(() => {
    return getCallingWindowStatus(prospectTimezone);
  }, [prospectTimezone]);

  const fetchDynamicPitch = useCallback(
    async (langName: CallLanguage = session.language) => {
      setIsGeneratingPitch(true);
      const LANG_CODE_MAP: Record<CallLanguage, string> = {
        English: 'en',
        Hindi: 'hi',
        Gujarati: 'gu',
        Marathi: 'mr',
      };
      const code = LANG_CODE_MAP[langName] || 'en';
      try {
        const res = await callService.generatePitch({
          companyName: session.companyName,
          contactName: session.contactName,
          contactRole: session.contactRole,
          language: code,
          companyInfo: `${session.companyName} - ${lead?.industry || 'Business Services'}`,
          requirement: lead?.requirement || session.currentObjective.goal,
          services: lead?.buyingSignals?.map((s) => s.description).join(', ') || 'AI voice automation and sales workflows',
          buyingSignals: lead?.whyNow || '',
        });
        if (res?.pitch) {
          setDynamicPitch(res.pitch);
        }
      } catch (e) {
        console.warn('Failed to generate dynamic pitch:', e);
      } finally {
        setIsGeneratingPitch(false);
      }
    },
    [session.companyName, session.contactName, session.contactRole, session.language, session.currentObjective.goal, lead]
  );

  useEffect(() => {
    fetchDynamicPitch(session.language);
  }, [session.companyName, session.contactName]);

  const handleLanguageChange = (lang: CallLanguage) => {
    setSession((prev) => ({ ...prev, language: lang }));
    fetchDynamicPitch(lang);
  };

  const scriptSteps = React.useMemo(() => {
    return buildDynamicScriptForLead(resolvedLeadId);
  }, [resolvedLeadId]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const activeTimeoutsRef = useRef<NodeJS.Timeout[]>([]);
  const stepIndexRef = useRef<number>(0);
  const statusPollingRef = useRef<NodeJS.Timeout | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const pollCallStatus = useCallback(async (sessionId: string) => {
    // Stop any existing polling and socket
    if (statusPollingRef.current) {
      clearInterval(statusPollingRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    // Try WebSocket connection for instant zero-latency speech turn streaming
    try {
      const explicitWs = import.meta.env.VITE_WS_URL as string | undefined;
      const apiBase = import.meta.env.VITE_API_URL as string | undefined;
      let wsUrl = '';

      if (explicitWs && !explicitWs.includes('vidur-api.onrender.com')) {
        wsUrl = `${explicitWs.replace(/\/+$/, '')}/ws/call/${sessionId}`;
      } else if (apiBase && !apiBase.includes('vidur-api.onrender.com')) {
        try {
          const parsed = new URL(apiBase);
          const proto = parsed.protocol === 'https:' ? 'wss:' : 'ws:';
          wsUrl = `${proto}//${parsed.host}/ws/call/${sessionId}`;
        } catch {
          const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
          wsUrl = `${protocol}//${window.location.hostname}:8000/ws/call/${sessionId}`;
        }
      } else {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        wsUrl = `${protocol}//${window.location.hostname}:8000/ws/call/${sessionId}`;
      }
      const socket = new WebSocket(wsUrl);
      wsRef.current = socket;

      socket.onopen = () => {
        console.log('[WebSocket] Connected to live call stream:', wsUrl);
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'transcript') {
            const rawSpeaker = data.speaker || data.item?.speaker || 'agent';
            const speakerRole: 'ai_agent' | 'prospect' = rawSpeaker === 'agent' ? 'ai_agent' : 'prospect';
            const rawText = data.text ?? data.item?.text ?? '';
            const textStr = (typeof rawText === 'string' ? rawText : String(rawText || '')).trim();
            if (!textStr) return;

            const totalSecs = Math.floor(data.timestamp ?? data.item?.timestamp ?? 0);
            const mins = Math.floor(totalSecs / 60).toString().padStart(2, '0');
            const secs = (totalSecs % 60).toString().padStart(2, '0');

            setSession((prev) => {
              // Avoid duplicate messages with safe optional chaining
              const exists = prev.transcript.some(t => (t?.text ?? '').trim() === textStr);
              if (exists) return prev;

              const newItem: TranscriptItem = {
                id: `${rawSpeaker}-${Date.now()}-${Math.random()}`,
                speaker: speakerRole,
                speakerName: speakerRole === 'ai_agent' ? 'Vidur AI Agent' : 'You (Customer) · Live Mic',
                text: textStr,
                timestamp: `${mins}:${secs}`,
                isFinal: true
              };

              return {
                ...prev,
                audioStatus: speakerRole === 'ai_agent' ? 'ai_speaking' : 'prospect_speaking',
                transcript: [...prev.transcript, newItem]
              };
            });
          }
        } catch (e) {
          console.error('[WebSocket] Failed to parse message:', e);
        }
      };

      socket.onerror = (err) => {
        console.log('[WebSocket] Socket error, falling back to fast polling:', err);
      };
    } catch (e) {
      console.log('[WebSocket] Init failed, relying on poller:', e);
    }

    // Fast polling fallback (every 700ms) for real-time STT & LLM sync
    statusPollingRef.current = setInterval(async () => {
      try {
        const status = await callService.getCallStatus(sessionId);

        // Handle backend-reported failures
        if (status.status === 'failed') {
          if (statusPollingRef.current) clearInterval(statusPollingRef.current);
          if (wsRef.current) wsRef.current.close();
          setSession((prev) => ({
            ...prev,
            status: 'FAILED',
            audioStatus: 'idle',
            failureReason: 'Voice agent encountered an error. Check backend logs.'
          }));
          toast.error('Voice agent stopped unexpectedly. Check the backend terminal.');
          return;
        }

        // Update transcript — guard against malformed items
        if (Array.isArray(status.transcript) && status.transcript.length > 0) {
          setSession((prev) => ({
            ...prev,
            transcript: status.transcript
              .filter(t => t && t.speaker && t.text)
              .map(t => {
                const totalSecs = Math.floor((t.timestamp ?? 0));
                const mins = Math.floor(totalSecs / 60).toString().padStart(2, '0');
                const secs = (totalSecs % 60).toString().padStart(2, '0');
                const speakerRole: 'ai_agent' | 'prospect' = t.speaker === 'agent' ? 'ai_agent' : 'prospect';
                return {
                  id: `${t.speaker}-${t.timestamp ?? Date.now()}`,
                  speaker: speakerRole,
                  speakerName: speakerRole === 'ai_agent' ? 'Vidur AI Agent' : 'You (Customer) · Live Mic',
                  text: t.text,
                  timestamp: `${mins}:${secs}`,
                  isFinal: true,
                };
              })
          }));
        }

        // Update duration
        if (typeof status.duration === 'number') {
          setSession((prev) => ({ ...prev, duration: status.duration }));
        }

        // Check if call ended cleanly
        if (status.status === 'completed') {
          if (statusPollingRef.current) clearInterval(statusPollingRef.current);
          if (wsRef.current) wsRef.current.close();
          setSession((prev) => ({
            ...prev,
            status: 'COMPLETED',
            audioStatus: 'idle'
          }));
        }

      } catch (error) {
        console.error('Failed to poll status:', error);
      }
    }, 700);
  }, []);

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
      if (statusPollingRef.current) clearInterval(statusPollingRef.current);
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      clearAllTimeouts();
    };
  }, [clearAllTimeouts]);

  useEffect(() => {
    if (session.status !== 'LIVE') return;
    // When real mic/speaker voice call is active with the backend, do NOT inject mock script steps!
    if (isRealVoiceCall) return;

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
        setSession((prev) => {
          dataBackboneService.recordCallOutcome({
            leadId: resolvedLeadId,
            status: 'completed',
            duration: prev.duration || 180,
            outcome: 'meeting_booked',
            transcript: prev.transcript.map(t => `${t.speaker}: ${t.text ?? ''}`).join('\n')
          });
          return {
            ...prev,
            status: 'COMPLETED',
            audioStatus: 'idle'
          };
        });
        toast.success('Conversation concluded. Executive debrief generated.');
      }, 750);
    }
  }, [session.status, session.duration, scriptSteps, safeTimeout, resolvedLeadId]);

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

  const handleConfirmStart = async (language: CallLanguage) => {
    setIsConfirmationOpen(false);
    clearAllTimeouts();
    stepIndexRef.current = 0;

    // Map display names → backend short codes (SARVAM_LANG_MAP expects 'en','hi','gu','mr')
    const LANG_CODE_MAP: Record<CallLanguage, string> = {
      'English':  'en',
      'Hindi':    'hi',
      'Gujarati': 'gu',
      'Marathi':  'mr',
    };
    const langCode = LANG_CODE_MAP[language] ?? 'en';

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

    setConnectingStageText('Initializing AI Voice Agent...');

    try {
      // Start REAL voice call with backend
      const startResponse = await callService.startCall({
        leadId: resolvedLeadId,
        companyName: session.companyName,
        contactName: session.contactName,
        contactRole: session.contactRole,
        contactPhone: session.contactPhone,
        language: langCode,
        companyInfo: `${session.companyName} - ${lead?.industry ?? 'Technology'}`,
        services: lead?.buyingSignals?.map(s => s.description).join(', '),
        goal: `Understand ${session.contactName}'s requirements and qualify for demo`,
        customPitch: dynamicPitch || undefined,
        requirement: lead?.requirement || session.currentObjective.goal,
        buyingSignals: lead?.whyNow || '',
        timezone: prospectTimezone,
        bypassTimezoneCheck: true,
      });

      setBackendSessionId(startResponse.sessionId);
      setIsRealVoiceCall(true);
      
      setConnectingStageText('AI models loaded. Ready to launch voice call...');
      toast.success(startResponse.message);

      // Wait a moment, then launch the actual voice interaction
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setConnectingStageText('Launching live voice interaction...');
      
      // Launch the REAL voice call (this starts the mic/speaker interaction)
      const launchResponse = await callService.launchVoiceCall(startResponse.sessionId);
      
      setSession((prev) => ({
        ...prev,
        status: 'LIVE',
        audioStatus: 'ai_speaking'
      }));

      toast.success(launchResponse.message, {
        description: launchResponse.instruction,
        duration: 5000
      });

      // Start polling for status updates
      pollCallStatus(startResponse.sessionId);

    } catch (error: any) {
      console.error('Failed to start voice call:', error);
      toast.error('Failed to start voice call', {
        description: error.message || 'Please check backend is running'
      });
      
      setSession((prev) => ({
        ...prev,
        status: 'FAILED',
        failureReason: error.message || 'Backend connection failed'
      }));
      setIsRealVoiceCall(false);
    }
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

  const handleEndCall = useCallback(async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (statusPollingRef.current) clearInterval(statusPollingRef.current);
    clearAllTimeouts();

    setSession((prev) => ({
      ...prev,
      status: 'COMPLETING',
      audioStatus: 'idle'
    }));

    // If this is a real voice call, end it on the backend
    if (isRealVoiceCall && backendSessionId) {
      try {
        const result = await callService.endCall(backendSessionId);
        
        setSession((prev) => {
          const finalDuration = result.duration || prev.duration || 120;
          const completedRecord = {
            callId: prev.callId,
            leadId: resolvedLeadId,
            companyName: prev.companyName,
            companyDomain: prev.companyDomain,
            contactName: prev.contactName,
            contactRole: prev.contactRole,
            contactPhone: prev.contactPhone,
            language: prev.language,
            duration: finalDuration,
            transcript: prev.transcript,
            qualification: prev.qualification,
            intelligenceEvents: prev.intelligenceEvents,
            primaryOutcome: prev.primaryOutcome,
            summary: result?.summary ? (typeof result.summary === 'string' ? result.summary : JSON.stringify(result.summary)) : undefined,
            outcome: finalDuration > 20 ? 'QUALIFIED' : 'INTERESTED',
            lead: lead,
            savedAt: Date.now()
          };
          try {
            localStorage.setItem(`vidur_completed_call_${prev.callId}`, JSON.stringify(completedRecord));
            localStorage.setItem(`vidur_completed_call_${resolvedLeadId}`, JSON.stringify(completedRecord));
            localStorage.setItem('vidur_latest_completed_call', JSON.stringify(completedRecord));
          } catch {}

          return {
            ...prev,
            status: 'COMPLETED',
            audioStatus: 'idle',
            duration: finalDuration
          };
        });

        toast.success('Call ended. AI is generating the executive summary...', {
          description: `Duration: ${formatDuration(result.duration)}`,
          duration: 3000
        });

      } catch (error: any) {
        console.error('Failed to end call:', error);
        toast.error('Failed to end call properly', {
          description: error.message
        });
        
        // Still mark as completed on frontend and persist session
        setSession((prev) => {
          const completedRecord = {
            callId: prev.callId,
            leadId: resolvedLeadId,
            companyName: prev.companyName,
            companyDomain: prev.companyDomain,
            contactName: prev.contactName,
            contactRole: prev.contactRole,
            contactPhone: prev.contactPhone,
            language: prev.language,
            duration: prev.duration || 60,
            transcript: prev.transcript,
            qualification: prev.qualification,
            intelligenceEvents: prev.intelligenceEvents,
            primaryOutcome: prev.primaryOutcome,
            outcome: prev.duration > 20 ? 'QUALIFIED' : 'INTERESTED',
            lead: lead,
            savedAt: Date.now()
          };
          try {
            localStorage.setItem(`vidur_completed_call_${prev.callId}`, JSON.stringify(completedRecord));
            localStorage.setItem(`vidur_completed_call_${resolvedLeadId}`, JSON.stringify(completedRecord));
            localStorage.setItem('vidur_latest_completed_call', JSON.stringify(completedRecord));
          } catch {}

          return {
            ...prev,
            status: 'COMPLETED',
            audioStatus: 'idle'
          };
        });
      }
    } else {
      // Manual/Simulated call ending
      safeTimeout(() => {
        setSession((prev) => {
          const finalDuration = prev.duration || 120;
          dataBackboneService.recordCallOutcome({
            leadId: resolvedLeadId,
            status: 'completed',
            duration: finalDuration,
            outcome: 'meeting_booked',
            transcript: prev.transcript.map(t => `${t.speaker}: ${t.text ?? ''}`).join('\n')
          });

          const completedRecord = {
            callId: prev.callId,
            leadId: resolvedLeadId,
            companyName: prev.companyName,
            companyDomain: prev.companyDomain,
            contactName: prev.contactName,
            contactRole: prev.contactRole,
            contactPhone: prev.contactPhone,
            language: prev.language,
            duration: finalDuration,
            transcript: prev.transcript,
            qualification: prev.qualification,
            intelligenceEvents: prev.intelligenceEvents,
            primaryOutcome: prev.primaryOutcome,
            outcome: 'QUALIFIED',
            lead: lead,
            savedAt: Date.now()
          };
          try {
            localStorage.setItem(`vidur_completed_call_${prev.callId}`, JSON.stringify(completedRecord));
            localStorage.setItem(`vidur_completed_call_${resolvedLeadId}`, JSON.stringify(completedRecord));
            localStorage.setItem('vidur_latest_completed_call', JSON.stringify(completedRecord));
          } catch {}

          return {
            ...prev,
            status: 'COMPLETED',
            audioStatus: 'idle'
          };
        });
        toast.success('Conversation concluded. Executive brief generated.');
      }, 750);
    }
  }, [isRealVoiceCall, backendSessionId, clearAllTimeouts, safeTimeout, formatDuration, resolvedLeadId, lead]);

  const handleCancelConnecting = async () => {
    clearAllTimeouts();
    if (statusPollingRef.current) clearInterval(statusPollingRef.current);

    // If real call was started, clean it up
    if (backendSessionId) {
      try {
        await callService.deleteSession(backendSessionId);
      } catch (error) {
        console.error('Failed to delete session:', error);
      }
      setBackendSessionId(null);
      setIsRealVoiceCall(false);
    }

    setSession((prev) => ({
      ...prev,
      status: 'PRE_CALL',
      audioStatus: 'idle',
      duration: 0
    }));
    toast('Call canceled.');
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
          currentPitch={dynamicPitch}
          isGeneratingPitch={isGeneratingPitch}
          onRegeneratePitch={() => fetchDynamicPitch(session.language)}
          onOpenEmailModal={() => setIsEmailModalOpen(true)}
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
            location={lead?.location || 'India'}
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
          {isRealVoiceCall && (
            <div className="p-3 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-semibold text-foreground">
                  Hackathon Live Demo: <strong className="text-primary">You are the Customer</strong>
                </span>
                <span className="text-[11px] text-foreground-secondary hidden sm:inline">
                  • Speak into your microphone to converse with Vidur AI. Speech-to-text and LLM answers stream below.
                </span>
              </div>
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded bg-surface-elevated text-signal-qualified border border-signal-qualified/30 font-bold shrink-0">
                MIC ACTIVE
              </span>
            </div>
          )}

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
        location={lead?.location}
        phone={session.contactPhone}
        objective={`Understand their ${lead?.industry?.toLowerCase() || 'business'} requirement and qualify implementation timeline.`}
        whyNow={lead?.whyNow || 'Active lead discovered via AI discovery.'}
        selectedLanguage={session.language}
        onLanguageChange={handleLanguageChange}
        currentPitch={dynamicPitch}
        isGeneratingPitch={isGeneratingPitch}
        onRegeneratePitch={() => fetchDynamicPitch(session.language)}
        onOpenEmailModal={() => setIsEmailModalOpen(true)}
      />

      <SendPitchEmailModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        companyName={session.companyName}
        contactName={session.contactName}
        contactRole={session.contactRole}
        pitch={dynamicPitch}
        language={session.language}
        requirement={lead?.requirement || session.currentObjective.goal}
        timezoneStatus={callingWindowStatus}
        leadId={resolvedLeadId}
        onSuccess={(msg) => {
          setEmailNotificationToast(msg);
          setTimeout(() => setEmailNotificationToast(null), 4000);
        }}
      />

      {emailNotificationToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#102A20] border border-emerald-500/50 text-emerald-200 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 animate-slide-up text-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-medium">{emailNotificationToast}</span>
        </div>
      )}
    </div>
  );
};

export default AICalling;
