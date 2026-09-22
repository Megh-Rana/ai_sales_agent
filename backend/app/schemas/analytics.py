from typing import List, Optional
from pydantic import BaseModel, Field


class FunnelStageData(BaseModel):
    stageId: str
    label: str
    count: int
    percentageOfTop: float
    conversionFromPrevious: float
    dropOffCount: int
    dropOffPercentage: float


class FunnelInsightText(BaseModel):
    highlight: str
    dropOffDetail: str


class ExecutiveMetric(BaseModel):
    id: str
    label: str
    value: str
    trendPercentage: float = 0.0
    trendDirection: str = "neutral"
    comparisonLabel: str = "vs previous period"
    context: Optional[str] = None


class IntentDistributionCount(BaseModel):
    count: int
    percentage: float


class IntentLevelDistribution(BaseModel):
    veryHigh: IntentDistributionCount
    high: IntentDistributionCount
    medium: IntentDistributionCount
    low: IntentDistributionCount


class CallPerformanceData(BaseModel):
    totalCalls: int
    avgDurationSeconds: int
    qualifiedCalls: int
    interestedCalls: int
    followUpsCreated: int
    qualificationRate: float
    interestedRate: float


class CallOutcomeItem(BaseModel):
    outcome: str
    label: str
    count: int
    percentage: float
    colorClass: str = "bg-primary text-primary"
    badgeStyle: str = "bg-primary-muted text-primary border-primary/30"


class AnalyticsMetricsResponse(BaseModel):
    dateRange: str = "30d"
    discoveredCount: int
    contactedCount: int
    interestedCount: int
    convertedCount: int
    conversionRate: float
    funnelStages: List[FunnelStageData]
    funnelInsightText: FunnelInsightText
    executiveMetrics: List[ExecutiveMetric]
    intentDistribution: IntentLevelDistribution
    callPerformance: CallPerformanceData
    callOutcomes: List[CallOutcomeItem]
