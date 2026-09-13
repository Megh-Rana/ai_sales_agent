export type OpportunityPriorityLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export type OpportunityCategoryType =
  | 'HOT_OPPORTUNITY'
  | 'BUYING_SIGNAL'
  | 'POSITIVE_RESPONSE'
  | 'FOLLOW_UP_DUE'
  | 'HIGH_INTENT'
  | 'ENGAGEMENT_SPIKE'
  | 'MEETING_OPPORTUNITY'
  | 'RE_ENGAGEMENT';

export type OpportunityState =
  | 'new'
  | 'active'
  | 'high_priority'
  | 'warming'
  | 'action_required'
  | 'waiting'
  | 'converted'
  | 'closed'
  | 'dismissed';

export interface OpportunitySignal {
  id: string;
  title: string;
  category: string;
  recency: string;
  impactScore: number;
}

export interface OpportunityWhyNow {
  headline: string;
  evidence: string[];
  recencyLabel: string; // e.g. "Today", "2 hours ago", "Yesterday"
  timestamp: string;
}

export interface OpportunityRecommendedAction {
  label: string;
  actionType: 'call' | 'message' | 'email' | 'followup' | 'campaign' | 'meeting' | 'lead';
  route: string;
  suggestedOpening?: string;
}

export interface OpportunityNextBestAction {
  headline: string;
  recommendedTiming: string;
  targetAction: string;
}

export interface OpportunityTimelineEvent {
  id: string;
  timestamp: string;
  title: string;
  description: string;
  type: 'intent' | 'engagement' | 'campaign' | 'response' | 'followup' | 'call' | 'outcome';
}

export interface SalesOpportunity {
  id: string;
  leadId: string;
  companyName: string;
  companyDomain?: string;
  industry: string;
  location: string;
  contactName: string;
  contactRole: string;
  contactPhone?: string;
  contactEmail?: string;
  phoneAvailable: boolean;

  intentScore: number;
  estimatedValue: string;
  priority: OpportunityPriorityLevel;
  type: OpportunityCategoryType;
  state: OpportunityState;
  isEmerging?: boolean; // false = Action Required Now; true = Warming up

  whyNow: OpportunityWhyNow;
  signals: OpportunitySignal[];
  recommendedAction: OpportunityRecommendedAction;
  nextBestAction?: OpportunityNextBestAction;

  campaignId?: string;
  campaignName?: string;
  followUpDate?: string;

  timeline: OpportunityTimelineEvent[];
  updatedAt: string;
}

export interface OpportunityFilterState {
  search: string;
  priority: 'all' | 'high' | 'medium' | 'low';
  type: 'all' | OpportunityCategoryType;
  state: 'all' | 'action_required' | 'warming' | 'waiting' | 'completed';
  timeframe: 'all' | 'today' | 'this_week';
}
