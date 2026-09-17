import React from 'react';
import { DateRangePreset } from '../../types/analytics';
import { Calendar, BarChart3, RefreshCw, FileDown } from 'lucide-react';
import { toast } from 'sonner';
import { PDFReportService } from '../../services/pdfReportService';

interface AnalyticsHeaderProps {
  dateRange: DateRangePreset;
  onDateRangeChange: (range: DateRangePreset) => void;
  viewState: 'normal' | 'loading' | 'empty' | 'error';
  onViewStateChange: (state: 'normal' | 'loading' | 'empty' | 'error') => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const AnalyticsHeader: React.FC<AnalyticsHeaderProps> = ({
  dateRange,
  onDateRangeChange,
  viewState,
  onViewStateChange,
  onRefresh,
  isRefreshing = false,
}) => {
  const dateOptions: { id: DateRangePreset; label: string }[] = [
    { id: 'today', label: 'Today' },
    { id: '7d', label: '7 days' },
    { id: '30d', label: '30 days' },
    { id: '90d', label: '90 days' },
    { id: 'custom', label: 'Custom' },
  ];

  return (
    <header className="bg-surface border border-border rounded-xl p-5 md:p-6 shadow-sm mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Title & Subtitle */}
        <div className="space-y-1">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <BarChart3 className="w-5 h-5" aria-hidden="true" />
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-foreground tracking-tight">
              Sales Analytics
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Intelligence
            </span>
          </div>
          <p className="text-sm text-foreground-secondary font-normal pl-0.5">
            Understand what's driving your sales pipeline and voice call conversions.
          </p>
        </div>

        {/* Right Controls: Date Range Selector & View State Switcher */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Date Range Selector */}
          <nav
            aria-label="Date Range Filter Options"
            className="inline-flex items-center p-1 rounded-lg bg-background border border-border-strong text-xs font-medium"
          >
            <div className="px-2 text-foreground-tertiary flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5 text-foreground-secondary" aria-hidden="true" />
            </div>
            {dateOptions.map((opt) => {
              const isSelected = dateRange === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onDateRangeChange(opt.id)}
                  aria-pressed={isSelected}
                  aria-label={`Select date filter ${opt.label}`}
                  className={`px-3 py-1.5 rounded-md transition-all duration-150 capitalize font-medium ${
                    isSelected
                      ? 'bg-[#2563EB] text-white shadow-sm font-semibold'
                      : 'text-foreground-secondary hover:text-foreground hover:bg-surface-elevated'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </nav>

          {/* Demo State Switcher Toggle */}
          <div className="hidden xl:flex items-center space-x-1 bg-background border border-border-strong rounded-lg p-1 text-xs">
            <span className="px-2 text-foreground-tertiary text-[11px] font-semibold uppercase tracking-wider">
              State:
            </span>
            {(['normal', 'loading', 'empty', 'error'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => onViewStateChange(st)}
                aria-pressed={viewState === st}
                className={`px-2.5 py-1 rounded capitalize ${
                  viewState === st
                    ? 'bg-surface-hover text-foreground font-semibold'
                    : 'text-foreground-tertiary hover:text-foreground-secondary'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Export PDF Button */}
          <button
            type="button"
            onClick={() => {
              try {
                PDFReportService.generateCallReport({
                  companyName: 'Executive Sales Operations Summary',
                  callId: `REPORT-${dateRange.toUpperCase()}`,
                  outcome: 'PIPELINE_SYNTHESIS',
                  intentScore: 92,
                  estimatedValue: '$385,000 ARR',
                  durationSeconds: 1200,
                  decisionMakerName: 'Enterprise Sales Team',
                  decisionMakerRole: 'Commercial Pipeline',
                  requirement: 'Autonomous B2B Voice Discovery & Lead Qualification Operations',
                  whyNow: `Executive debrief generated for date range preset: ${dateRange}`,
                  summary: 'Comprehensive sales operating telemetry. High volume outbound conversion demonstrates consistent qualification across target industry verticals.',
                  signals: [
                    'Conversion rate sustained above 24.8% across core accounts',
                    'Pipeline velocity accelerated by autonomous first-touch qualification',
                    'Real-time objection handling automated with zero agent burnout'
                  ],
                  nextSteps: [
                    'Allocate additional outbound capacity to high-intent tiers',
                    'Review weekly synthesized qualification transcripts with sales leads',
                    'Sync verified meeting attendees into CRM opportunity stages'
                  ]
                });
                toast.success('Analytics Summary PDF downloaded successfully');
              } catch (e) {
                toast.error('Failed to generate analytics PDF');
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/30 hover:bg-emerald-900/40 text-emerald-300 hover:text-white border border-emerald-500/30 text-xs font-semibold transition-all shadow-xs"
            title="Download executive analytics PDF"
          >
            <FileDown className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Export PDF</span>
          </button>

          {/* Refresh Button */}
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              aria-label="Refresh Analytics Data"
              className="p-2 rounded-lg bg-surface-elevated hover:bg-surface-hover text-foreground hover:text-white border border-border-strong transition-all disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-400' : ''}`}
                aria-hidden="true"
              />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
