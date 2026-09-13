export type ActionPriority = 'HIGH' | 'MEDIUM' | 'LOW';

export type RecommendationStatus = 'RECOMMENDED' | 'SCHEDULED' | 'DELAYED' | 'DISMISSED';

export type FollowUpActionType =
  | 'SCHEDULE_DEMO'
  | 'SEND_FOLLOW_UP'
  | 'CALL_AGAIN'
  | 'CREATE_TASK'
  | 'SEND_PRICING'
  | 'MOVE_STAGE'
  | 'ADD_TO_NURTURE'
  | 'DISMISS';

export type DismissReason =
  | 'NOT_RELEVANT'
  | 'ALREADY_HANDLED'
  | 'WRONG_TIMING'
  | 'INCORRECT_RECOMMENDATION'
  | 'OTHER';

export interface FollowUpItem {
  id: string;
  leadId: string;
  callId?: string;
  companyName: string;
  contactName: string;
  contactRole?: string;
  actionType: FollowUpActionType;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  priority: ActionPriority;
  note?: string;
  status: RecommendationStatus;
  owner: string;
  reason: string;
  createdAt: string;
}

export interface RecommendationState {
  status: RecommendationStatus;
  scheduledItem?: FollowUpItem;
  delayedUntil?: string;
  dismissReason?: DismissReason;
  dismissNote?: string;
}
