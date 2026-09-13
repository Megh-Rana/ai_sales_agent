export type CampaignStatus = 'DRAFT' | 'READY' | 'RUNNING' | 'PAUSED' | 'COMPLETED' | 'STOPPED';

export type CampaignObjectiveType =
  | 'BOOK_MEETINGS'
  | 'REQUIREMENT_RESPONSE'
  | 'REENGAGE_STALLED'
  | 'ICP_OUTREACH'
  | 'SERVICE_PROMOTION';

export interface CampaignLeadTarget {
  leadId: string;
  companyName: string;
  contactName: string;
  contactRole: string;
  phone: string;
  intentScore: number;
  industry: string;
  customOpeningHook: string;
  customValueProp: string;
  status: 'QUEUED' | 'CONTACTED' | 'QUALIFIED' | 'FAILED' | 'SKIPPED';
  callSessionId?: string;
}

export interface SalesCampaign {
  id: string;
  name: string;
  objective: CampaignObjectiveType;
  objectiveLabel: string;
  status: CampaignStatus;
  primaryChannel: 'AI_VOICE_CALL' | 'FOLLOW_UP_CADENCE' | 'MULTI_CHANNEL';
  targetAudienceCount: number;
  contactedCount: number;
  qualifiedCount: number;
  meetingsBookedCount: number;
  conversionRate: number; // e.g. 33.3
  estimatedPipelineValue: string; // e.g. "₹48.5L"
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  leads: CampaignLeadTarget[];
}

export interface CampaignBuilderState {
  step: number;
  name: string;
  objective: CampaignObjectiveType;
  primaryChannel: 'AI_VOICE_CALL' | 'FOLLOW_UP_CADENCE' | 'MULTI_CHANNEL';
  selectedLeadIds: string[];
  customHooks: Record<string, string>;
}
