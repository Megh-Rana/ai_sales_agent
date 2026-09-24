export type CallState =
  | 'PRE_CALL'
  | 'CONFIRMING'
  | 'CONNECTING'
  | 'RINGING'
  | 'LIVE'
  | 'PAUSED'
  | 'COMPLETING'
  | 'COMPLETED'
  | 'FAILED'
  | 'NO_ANSWER';

export type AudioStatus =
  | 'idle'
  | 'ai_speaking'
  | 'listening'
  | 'prospect_speaking'
  | 'processing'
  | 'paused';

export type SpeakerRole = 'ai_agent' | 'prospect' | 'human_rep';

export interface TranscriptItem {
  id: string;
  speaker: SpeakerRole;
  speakerName: string;
  text: string;
  timestamp: string; // e.g., "00:18"
  sentiment?: 'positive' | 'neutral' | 'skeptical' | 'engaged';
  isFinal?: boolean;
}

export type IntelligenceEventType =
  | 'buying_signal'
  | 'qualification'
  | 'interest'
  | 'objection'
  | 'next_question';

export interface IntelligenceEvent {
  id: string;
  type: IntelligenceEventType;
  title: string;
  description: string;
  quote?: string;
  timestamp: string;
  dimension?: 'Need' | 'Pain Point' | 'Timeline' | 'Budget' | 'Decision Maker' | 'Current Solution' | 'Implementation Readiness';
  impactScore?: number;
  whyItMatters?: string;
}

export type QualificationStatus = 'unknown' | 'discovering' | 'confirmed';

export interface QualificationDimension {
  dimension: 'Need' | 'Pain Point' | 'Timeline' | 'Budget' | 'Decision Maker' | 'Current Solution' | 'Implementation Readiness';
  label: string;
  status: QualificationStatus;
  detail?: string;
  evidence?: string;
}

export type CallLanguage = 'English' | 'Hindi' | 'Gujarati' | 'Marathi';

export interface CurrentObjective {
  goal: string;
  suggestedQuestion: string;
  strategyNote: string;
}

export interface CallSession {
  callId: string;
  leadId: string;
  companyName: string;
  companyDomain?: string;
  contactName: string;
  contactRole: string;
  contactPhone: string;
  language: CallLanguage;
  status: CallState;
  audioStatus: AudioStatus;
  duration: number; // in seconds
  isMuted: boolean;
  isHumanTakeover: boolean;
  failureReason?: string;
  primaryOutcome?: string;
  carrier?: string;
  providerCallSid?: string;
  currentObjective: CurrentObjective;
  transcript: TranscriptItem[];
  intelligenceEvents: IntelligenceEvent[];
  qualification: Record<string, QualificationDimension>;
}
