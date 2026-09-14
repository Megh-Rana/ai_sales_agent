import React from 'react';
import { ExecutiveMetric } from '../../types/analytics';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface MetricCardProps {
  metric: ExecutiveMetric;
  icon?: React.ReactNode;
}

export const MetricCard: React.FC<MetricCardProps> = ({ metric, icon }) => {
  const isPositive = metric.trendDirection === 'up';
  const isNegative = metric.trendDirection === 'down';

  return (
    <div className="bg-surface border border-border hover:border-border-strong rounded-xl p-5 transition-all duration-200 shadow-sm flex flex-col justify-between group">
      {/* Top Header Row */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="text-xs font-medium text-foreground-secondary tracking-wide uppercase">
          {metric.label}
        </span>
        {icon && (
          <div className="p-1.5 rounded-lg bg-surface-elevated text-foreground-tertiary group-hover:text-blue-400 group-hover:bg-blue-500/10 border border-transparent group-hover:border-blue-500/20 transition-all">
            {icon}
          </div>
        )}
      </div>

      {/* Main Metric Value & Trend */}
      <div className="space-y-2">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight font-mono">
            {metric.value}
          </span>

          {/* Trend Badge */}
          <div
            className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-xs font-semibold border ${
              isPositive
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : isNegative
                ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
            }`}
          >
            {isPositive && <ArrowUpRight className="w-3.5 h-3.5" />}
            {isNegative && <ArrowDownRight className="w-3.5 h-3.5" />}
            {!isPositive && !isNegative && <Minus className="w-3.5 h-3.5" />}
            <span>{metric.trendPercentage}%</span>
          </div>
        </div>

        {/* Comparison Context */}
        <div className="flex items-center justify-between text-[11px] text-foreground-tertiary">
          <span>{metric.comparisonLabel}</span>
          {metric.context && (
            <span className="truncate max-w-[140px] text-foreground-secondary font-medium text-right">
              {metric.context}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
