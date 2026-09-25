import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { DateRangePreset } from '../types/analytics';
import { mockAnalyticsDataByRange } from '../data/mockAnalytics';
import { AnalyticsHeader } from '../components/analytics/AnalyticsHeader';
import { ExecutiveMetricsGrid } from '../components/analytics/ExecutiveMetricsGrid';
import { SalesFunnelCard } from '../components/analytics/SalesFunnelCard';
import { IntentDistributionCard } from '../components/analytics/IntentDistributionCard';
import { ConversionPerformanceCard } from '../components/analytics/ConversionPerformanceCard';
import { CallPerformanceCard } from '../components/analytics/CallPerformanceCard';
import { CallOutcomeBreakdown } from '../components/analytics/CallOutcomeBreakdown';
import { SourcePerformanceCard } from '../components/analytics/SourcePerformanceCard';
import { IndustryPerformanceCard } from '../components/analytics/IndustryPerformanceCard';
import { AnalyticsInsightCard } from '../components/analytics/AnalyticsInsightCard';
import { AnalyticsSkeleton } from '../components/analytics/AnalyticsSkeleton';
import { AnalyticsEmptyState } from '../components/analytics/AnalyticsEmptyState';
import { AnalyticsErrorState } from '../components/analytics/AnalyticsErrorState';
import { Sparkles, Activity, Compass, Layers } from 'lucide-react';
import { ScrollProgress, AnimatedCardChart } from '../components/ui/21st';

import { SalesAnalyticsDataset } from '../types/analytics';
import { dataBackboneService } from '../services/dataBackboneService';

export const Analytics: React.FC = () => {
  const [dateRange, setDateRange] = useState<DateRangePreset>('30d');
  const [customStartDate, setCustomStartDate] = useState<string>('2026-09-01');
  const [customEndDate, setCustomEndDate] = useState<string>('2026-09-25');
  const [viewState, setViewState] = useState<'normal' | 'loading' | 'empty' | 'error'>('normal');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dataset, setDataset] = useState<SalesAnalyticsDataset>(() => {
    return mockAnalyticsDataByRange[dateRange] || mockAnalyticsDataByRange['30d'];
  });

  const loadMetrics = useCallback((range: DateRangePreset, start?: string, end?: string) => {
    dataBackboneService.getAnalyticsMetrics(range, start, end).then((data) => {
      if (data) {
        setDataset(data);
      }
    });
  }, []);

  useEffect(() => {
    if (dateRange === 'custom') {
      loadMetrics(dateRange, customStartDate, customEndDate);
    } else {
      loadMetrics(dateRange);
    }
  }, [dateRange, customStartDate, customEndDate, loadMetrics]);

  const currentDataset = dataset;

  const handleDateRangeChange = useCallback((range: DateRangePreset) => {
    setDateRange(range);
  }, []);

  const handleCustomDateChange = useCallback((start: string, end: string) => {
    setCustomStartDate(start);
    setCustomEndDate(end);
  }, []);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    const start = dateRange === 'custom' ? customStartDate : undefined;
    const end = dateRange === 'custom' ? customEndDate : undefined;
    dataBackboneService
      .getAnalyticsMetrics(dateRange, start, end)
      .then((data) => {
        if (data) setDataset(data);
        setIsRefreshing(false);
      })
      .catch(() => {
        setIsRefreshing(false);
      });
  }, [dateRange, customStartDate, customEndDate]);

  const handleResetFilter = useCallback(() => {
    setDateRange('30d');
  }, []);

  const handleRetry = useCallback(() => {
    setViewState('normal');
    const start = dateRange === 'custom' ? customStartDate : undefined;
    const end = dateRange === 'custom' ? customEndDate : undefined;
    loadMetrics(dateRange, start, end);
  }, [dateRange, customStartDate, customEndDate, loadMetrics]);

  // Compute trend chart points from live data
  const chartPoints = useMemo(() => {
    if (currentDataset.trendChartData && currentDataset.trendChartData.length > 0) {
      return currentDataset.trendChartData;
    }
    if (currentDataset.callPerformance.totalCalls === 0) {
      return [{ label: dateRange === 'today' ? 'Today' : 'Period', value: 0 }];
    }
    return [
      { label: 'Start', value: 0 },
      { label: 'Current', value: currentDataset.callPerformance.totalCalls, highlight: true },
    ];
  }, [currentDataset.trendChartData, currentDataset.callPerformance.totalCalls, dateRange]);

  return (
    <div className="space-y-8 select-none pb-16">
      {/* 21st.dev Scroll Progress Indicator */}
      <ScrollProgress color="#2563EB" />

      {/* SECTION 1: ANALYTICS HEADER & CONTROLS */}
      <AnalyticsHeader
        dateRange={dateRange}
        onDateRangeChange={handleDateRangeChange}
        customStartDate={customStartDate}
        customEndDate={customEndDate}
        onCustomDateChange={handleCustomDateChange}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />

      {/* VIEW STATE 1: LOADING SKELETON */}
      {viewState === 'loading' && <AnalyticsSkeleton />}

      {/* VIEW STATE 2: EMPTY STATE */}
      {viewState === 'empty' && (
        <AnalyticsEmptyState onResetFilter={handleResetFilter} />
      )}

      {/* VIEW STATE 3: ERROR STATE */}
      {viewState === 'error' && (
        <AnalyticsErrorState onRetry={handleRetry} />
      )}

      {/* VIEW STATE 4: NORMAL OPERATIONAL DASHBOARD */}
      {viewState === 'normal' && (
        <main className="space-y-8 animate-fade-in">
          {/* NARRATIVE BLOCK 1: EXECUTIVE HEALTH & PIPELINE VELOCITY */}
          <section aria-label="Executive Pipeline Overview" className="space-y-4">
            <ExecutiveMetricsGrid metrics={currentDataset.executiveMetrics} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SalesFunnelCard
                stages={currentDataset.funnelStages}
                insightText={currentDataset.funnelInsightText}
              />
              <IntentDistributionCard distribution={currentDataset.intentDistribution} />
            </div>
          </section>

          {/* NARRATIVE BLOCK 2: TOUCHPOINT QUALITY & CONVERSION RATIOS */}
          <section aria-label="Call Performance and Stage Conversions" className="space-y-4 pt-2">
            <div className="flex items-center space-x-2 border-b border-border pb-2.5">
              <div className="p-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Activity className="w-4 h-4" aria-hidden="true" />
              </div>
              <h2 className="text-sm font-bold text-foreground tracking-tight uppercase font-mono">
                Touchpoint Efficiency & Conversation Conversion
              </h2>
            </div>

            {/* 21st.dev Animated Card Chart - Uses live connected calls data */}
            <AnimatedCardChart
              title="Autonomous Voice Qualification Trend"
              subtitle="Daily volume of connected AI calls and qualified prospect conversions"
              type="area"
              color="#3B82F6"
              height={160}
              data={chartPoints}
              valuePrefix=""
              valueSuffix=" Calls"
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CallPerformanceCard data={currentDataset.callPerformance} />
              <ConversionPerformanceCard conversions={currentDataset.conversions} />
            </div>
          </section>

          {/* NARRATIVE BLOCK 3: TOUCHPOINT OUTCOMES & DISCOVERY PROVENANCE */}
          <section aria-label="Call Outcomes and Discovery Sources" className="space-y-4 pt-2">
            <div className="flex items-center space-x-2 border-b border-border pb-2.5">
              <div className="p-1 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Compass className="w-4 h-4" aria-hidden="true" />
              </div>
              <h2 className="text-sm font-bold text-foreground tracking-tight uppercase font-mono">
                Outcome Breakdown & Discovery Channel Yield
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CallOutcomeBreakdown outcomes={currentDataset.callOutcomes} />
              <SourcePerformanceCard sources={currentDataset.sourcePerformance} />
            </div>
          </section>

          {/* NARRATIVE BLOCK 4: ICP SEGMENTATION & MARKET VERTICAL MATRIX */}
          <section aria-label="Industry Segment Matrix" className="space-y-4 pt-2">
            <div className="flex items-center space-x-2 border-b border-border pb-2.5">
              <div className="p-1 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Layers className="w-4 h-4" aria-hidden="true" />
              </div>
              <h2 className="text-sm font-bold text-foreground tracking-tight uppercase font-mono">
                ICP Industry Performance Matrix
              </h2>
            </div>

            <IndustryPerformanceCard industries={currentDataset.industryPerformance} />
          </section>

          {/* NARRATIVE BLOCK 5: TACTICAL AI SALES INSIGHTS */}
          <section aria-label="AI Sales Insights" className="space-y-4 pt-4 border-t border-border">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Sparkles className="w-4 h-4" aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-base font-bold text-foreground">AI Sales Insights</h2>
                <p className="text-xs text-foreground-secondary">
                  Contextual observations & recommended next best actions derived from live data
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {currentDataset.insights.map((insight) => (
                <AnalyticsInsightCard key={insight.id} insight={insight} />
              ))}
            </div>
          </section>
        </main>
      )}
    </div>
  );
};

export default Analytics;
