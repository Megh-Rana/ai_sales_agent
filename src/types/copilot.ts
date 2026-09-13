export interface TalkingPoint {
  id: string;
  angle: string;
  description: string;
  basis: string; // Citation tag e.g. "Based on Pricing Calculator Inquiry"
  suggestedPhrasing: string;
}

export interface DiscoveryQuestion {
  id: string;
  category: 'Need' | 'Timeline' | 'Budget' | 'Decision Maker' | 'Technical Fit';
  question: string;
  whyAsk: string;
  expectedInsight: string;
}

export interface ObjectionItem {
  id: string;
  category: 'Price' | 'Timing' | 'Competitor' | 'Existing Solution' | 'Not Interested';
  objection: string;
  suggestedResponse: string;
  reasoning: string;
  discoveryPivot: string;
}

export interface CopilotOpeningHook {
  hook: string;
  rationale: string;
  citation: string;
  tone: 'direct' | 'value-led' | 'technical';
}

export type CopilotOutcomeType =
  | 'QUALIFIED_INTERESTED'
  | 'MEETING_BOOKED'
  | 'FOLLOW_UP_SCHEDULED'
  | 'NOT_INTERESTED'
  | 'UNQUALIFIED';

export interface SalesConversationContext {
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
  whyNowHeadline: string;
  whyNowRecency: string;
  primarySignal: string;

  summaryBrief: string;
  confirmedPainPoints: string[];
  techStack: string[];
  scaleInfo: string;

  openingHook: CopilotOpeningHook;
  talkingPoints: TalkingPoint[];
  discoveryQuestions: DiscoveryQuestion[];
  objections: ObjectionItem[];

  lastInteraction?: {
    date: string;
    channel: string;
    summary: string;
  };

  nextBestAction: {
    label: string;
    targetRoute: string;
    actionType: 'call' | 'email' | 'followup' | 'meeting';
  };
}
