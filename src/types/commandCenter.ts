import { OpportunityPriorityLevel, OpportunityCategoryType } from './opportunities';
import { ActionPriorityLevel } from './actions';

export interface RevenueMetricSnapshot {
  activePipelineValue: string; // e.g. "₹1,54,00,000"
  urgentActionCount: number;
  inboundQualificationRate: number; // percentage e.g. 88
  overdueFollowUpsCount: number;
  activeCampaignsCount: number;
  todaySignalsCount: number;
}

export interface TodayPriorityItem {
  id: string;
  leadId: string;
  companyName: string;
  contactName: string;
  contactRole: string;
  industry: string;
  intentScore: number;
  estimatedValue: string;
  priority: OpportunityPriorityLevel;
  type: OpportunityCategoryType;
  whyNowHeadline: string;
  whyNowRecency: string;
  recommendedActionLabel: string;
  actionRoute: string;
  actionType: 'call' | 'email' | 'copilot' | 'followup';
}

export interface ActiveConversationItem {
  id: string;
  leadId: string;
  companyName: string;
  contactName: string;
  contactRole: string;
  status: 'PREPARING' | 'LIVE' | 'QUALIFIED' | 'COMPLETED';
  lastUtteranceOrHook: string;
  durationOrTime: string;
  intentScore: number;
}

export interface CampaignMomentumSummary {
  id: string;
  name: string;
  activeEnrolledCount: number;
  responseRate: number; // percentage
  positiveRepliesToday: number;
  status: 'Active' | 'Optimizing';
}

export interface RecentOutcomeEvent {
  id: string;
  timestamp: string;
  companyName: string;
  contactName: string;
  outcomeLabel: string;
  outcomeType: 'QUALIFIED_INTERESTED' | 'MEETING_BOOKED' | 'FOLLOW_UP_SCHEDULED' | 'NOT_INTERESTED';
  nextBestActionHeadline: string;
}

export interface CommandCenterAggregatedData {
  metrics: RevenueMetricSnapshot;
  todayPriorities: TodayPriorityItem[];
  activeConversations: ActiveConversationItem[];
  campaignMomentum: CampaignMomentumSummary[];
  recentOutcomes: RecentOutcomeEvent[];
}
