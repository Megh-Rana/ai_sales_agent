export type IntentLevel = 'high' | 'medium' | 'low';

export type AIState =
  | 'idle'
  | 'discovering'
  | 'analyzing'
  | 'enriching'
  | 'generating'
  | 'calling'
  | 'listening'
  | 'thinking'
  | 'responding'
  | 'completed'
  | 'error';

export type SalesStatusType =
  | 'discovered'
  | 'high-intent'
  | 'qualified'
  | 'contacted'
  | 'interested'
  | 'meeting'
  | 'won'
  | 'lost'
  | 'follow-up';

export interface BuyingSignal {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  impactScore: number;
}

export interface SignalSource {
  platform: string;
  discoveredAt: string;
  originalRequirement: string;
  sourceUrl?: string;
}

export interface Opportunity {
  id: string;
  companyName: string;
  companyDomain?: string;
  industry: string;
  employeeCount?: string;
  requirement: string;
  location: string;
  intentScore: number;
  intentLevel: IntentLevel;
  buyingSignals: BuyingSignal[];
  signalSource: SignalSource;
  salesStatus: SalesStatusType;
  estimatedValue: string;
  contactName?: string;
  contactRole?: string;
  lastTouchpoint?: string;
}

export interface ActivityItemData {
  id: string;
  timestamp: string;
  title: string;
  description: string;
  category: 'discovery' | 'enrichment' | 'signal' | 'call' | 'status';
  status?: string;
}

export interface AISalesBriefData {
  objective: string;
  whyNow: string[];
  recommendedAngle: string;
  recommendedOpening: string;
  potentialObjections: { objection: string; counter: string }[];
  nextBestAction: string;
}

export interface SalesMetricData {
  id: string;
  label: string;
  value: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  context?: string;
}
