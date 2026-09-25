export type DateRangePreset = 'today' | '7d' | '15d' | '30d' | '90d' | 'custom';

export interface ExecutiveMetric {
  id: string;
  label: string;
  value: string | number;
  trendPercentage: number;
  trendDirection: 'up' | 'down' | 'neutral';
  comparisonLabel: string; // e.g. "vs previous period"
  context?: string;
}

export interface FunnelStageData {
  stageId: 'discovered' | 'high_intent' | 'contacted' | 'qualified' | 'meeting' | 'opportunity';
  label: string;
  count: number;
  percentageOfTop: number; // Conversion relative to Discovered
  conversionFromPrevious: number; // Conversion relative to previous stage
  dropOffCount: number;
  dropOffPercentage: number;
}

export interface IntentLevelDistribution {
  veryHigh: { count: number; percentage: number };
  high: { count: number; percentage: number };
  medium: { count: number; percentage: number };
  low: { count: number; percentage: number };
}

export interface StageConversionMetric {
  id: string;
  title: string;
  fromStage: string;
  toStage: string;
  rate: number; // Percentage, e.g. 50.0
  trendPercentage: number;
  benchmark: number;
  status: 'above' | 'on_track' | 'below';
}

export interface CallPerformanceData {
  totalCalls: number;
  avgDurationSeconds: number; // e.g. 222 (3m 42s)
  qualifiedCalls: number;
  interestedCalls: number;
  followUpsCreated: number;
  qualificationRate: number; // e.g. 50%
  interestedRate: number; // e.g. 22.2%
}

export interface CallOutcomeItem {
  outcome: 'QUALIFIED' | 'INTERESTED' | 'FOLLOW_UP' | 'NURTURE' | 'NOT_INTERESTED' | 'NO_ANSWER' | 'FAILED';
  label: string;
  count: number;
  percentage: number;
  colorClass: string;
  badgeStyle: string;
}

export interface SourcePerformanceItem {
  sourceKey: string;
  sourceLabel: string;
  platformIconName?: string;
  discoveredLeads: number;
  highIntentLeads: number;
  qualifiedLeads: number;
  qualificationRate: number; // Percentage e.g. 38%
  avgIntentScore: number;
}

export interface IndustryPerformanceItem {
  industry: string;
  discoveredLeads: number;
  highIntentCount: number;
  qualifiedCount: number;
  qualificationRate: number; // Percentage
  totalEstimatedValue: string; // e.g. "₹42.5L"
}

export interface AnalyticsInsight {
  id: string;
  category: 'HIGH_PERFORMING_SOURCE' | 'CALL_CONVERSION' | 'FUNNEL_DROPOFF' | 'INTENT_VELOCITY';
  categoryLabel: string;
  title: string;
  evidence: string;
  whyItMatters: string;
  recommendedAction: string;
  ctaLabel?: string;
  ctaTarget?: string; // route e.g. "/leads/discover" or "/leads"
}

export interface SalesAnalyticsDataset {
  dateRange: DateRangePreset;
  executiveMetrics: ExecutiveMetric[];
  funnelStages: FunnelStageData[];
  funnelInsightText: {
    highlight: string;
    dropOffDetail: string;
  };
  intentDistribution: IntentLevelDistribution;
  conversions: StageConversionMetric[];
  callPerformance: CallPerformanceData;
  callOutcomes: CallOutcomeItem[];
  sourcePerformance: SourcePerformanceItem[];
  industryPerformance: IndustryPerformanceItem[];
  insights: AnalyticsInsight[];
  trendChartData?: { label: string; value: number; highlight?: boolean }[];
}
