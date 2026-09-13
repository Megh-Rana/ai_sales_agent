export type ActionPriorityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type ActionCategoryType = 'CALL' | 'PITCH' | 'FOLLOW_UP' | 'REENGAGE' | 'REVIEW';

export interface NextBestActionItem {
  id: string;
  leadId: string;
  companyName: string;
  companyDomain?: string;
  industry: string;
  contactName: string;
  contactRole: string;
  intentScore: number;
  estimatedValue: string;
  priority: ActionPriorityLevel;
  category: ActionCategoryType;
  title: string;
  requirementSummary: string;
  whyNow: {
    headline: string;
    evidence: string[];
    timeframe: string;
  };
  primaryActionLabel: string;
  primaryActionTarget: string; // route e.g. "/calls" or "/leads/lead-1"
  primaryActionType: 'call' | 'pitch' | 'followup' | 'results';
  secondaryActionLabel?: string;
  status: 'active' | 'completed' | 'snoozed' | 'dismissed';
  createdAt: string;
}

export interface ActionCenterSummary {
  urgentCallsCount: number;
  urgentCallsPipelineValue: string;
  followUpsPendingCount: number;
  stalledDealsCount: number;
  newRequirementAlertsCount: number;
}

export interface StalledDealItem {
  id: string;
  leadId: string;
  companyName: string;
  industry: string;
  daysIdle: number;
  lastTouchpoint: string;
  recommendedAngle: string;
  estimatedValue: string;
}

export interface LiveSignalEvent {
  id: string;
  timestamp: string;
  companyName: string;
  signalTitle: string;
  signalType: 'intent_surge' | 'rfp_posted' | 'executive_hiring' | 'call_completed' | 'followup_due';
  impactScore: number;
  sourceLabel: string;
}
