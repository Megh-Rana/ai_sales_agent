export type CallOutcomeType =
  | 'QUALIFIED'
  | 'INTERESTED'
  | 'FOLLOW_UP'
  | 'NURTURE'
  | 'NOT_INTERESTED'
  | 'DISQUALIFIED'
  | 'NO_ANSWER'
  | 'FAILED';

export type QualificationStatusType = 'confirmed' | 'inferred' | 'unknown' | 'not_discussed';

export interface StructuredQualificationField {
  key: 'Need' | 'Budget' | 'Timeline' | 'Decision Maker' | 'Current Solution' | 'Urgency' | 'Use Case' | 'Decision Process';
  label: string;
  value: string;
  status: QualificationStatusType;
  sourceNote: string; // e.g. "Confirmed during call", "AI inferred", "Not discussed"
  evidenceQuote?: string;
  turnId?: string;
}

export interface ResultBuyingSignal {
  id: string;
  title: string;
  importance: 'high' | 'medium' | 'low';
  category: string;
  evidenceQuote: string;
  whyItMatters: string;
  timestamp: string;
  turnId?: string;
}

export interface ResultObjection {
  id: string;
  category: 'Budget' | 'Timing' | 'Implementation' | 'Integration' | 'Competition' | 'Trust' | 'Internal approval' | 'Technical complexity';
  concern: string;
  riskLevel: 'high' | 'medium' | 'low';
  prospectQuote?: string;
  aiResponseOpportunity: string;
  resolutionStatus?: 'resolved' | 'partially_resolved' | 'unresolved';
  turnId?: string;
}

export interface KeyProspectStatement {
  id: string;
  statement: string;
  speaker: string;
  salesMeaning: string;
  impact: 'positive' | 'concern' | 'neutral';
  timestamp: string;
  turnId?: string;
}

export interface IntelligenceChange {
  metric: string;
  before: string;
  after: string;
  rationale: string;
  direction?: 'up' | 'down' | 'neutral';
}

export interface NextBestAction {
  action: string;
  whyNow: string;
  confidence: number; // e.g. 87%
  evidence: string[];
  targetTimeframe: string;
}

export interface CallMetadata {
  callId: string;
  duration: string;
  callTime: string;
  agent: string;
  direction: 'Outbound' | 'Inbound';
  phone: string;
  attemptNumber: number;
  recordingStatus: string;
  telephonyCodec?: string;
  carrierLatency?: string;
}

export interface TranscriptTurn {
  id: string;
  speaker: 'ai_agent' | 'prospect';
  speakerName: string;
  text: string;
  timestamp: string;
  marker?: 'BUYING_SIGNAL' | 'OBJECTION' | 'QUALIFICATION' | 'DECISION_MAKER';
  markerLabel?: string;
}

export interface CallResultData {
  callId: string;
  leadId: string;
  companyName: string;
  companyDomain?: string;
  contactName: string;
  contactRole: string;
  contactPhone: string;
  industry: string;
  location: string;
  outcome: CallOutcomeType;
  outcomeExplanation: string;
  supportingIndicators: string[];
  nextBestAction: NextBestAction;
  summary: string;
  qualification: StructuredQualificationField[];
  buyingSignals: ResultBuyingSignal[];
  objections: ResultObjection[];
  keyStatements: KeyProspectStatement[];
  intelligenceChanges: IntelligenceChange[];
  transcript: TranscriptTurn[];
  metadata: CallMetadata;
  status: 'ready' | 'partial' | 'loading' | 'error';
  failureReason?: string;
}
