import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { SalesMetricData } from '../../types/sales';

export interface MetricProps extends Partial<SalesMetricData> {
  label: string;
  value: string;
  icon?: React.ReactNode;
  className?: string;
}

export const Metric: React.FC<MetricProps> = ({
  label,
  value,
  trend = 'neutral',
  trendValue,
  context,
  icon,
  className = '',
}) => {
  return (
    <div
      className={twMerge(
        clsx(
          'bg-surface-0 border border-border-default rounded-xl p-4 sm:p-5 flex flex-col justify-between gap-3 shadow-xs',
          className
        )
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-caption font-semibold uppercase tracking-wider text-foreground-tertiary">
          {label}
        </span>
        {icon && <span className="p-1.5 rounded-md bg-surface-elevated text-foreground-secondary">{icon}</span>}
      </div>

      <div>
        <div className="text-metric font-bold text-foreground font-mono">{value}</div>

        {(trendValue || context) && (
          <div className="flex items-center gap-1.5 mt-1 text-xs">
            {trend === 'up' && (
              <span className="flex items-center gap-0.5 text-signal-qualified font-semibold">
                <TrendingUp className="w-3.5 h-3.5" />
                {trendValue}
              </span>
            )}
            {trend === 'down' && (
              <span className="flex items-center gap-0.5 text-signal-urgent font-semibold">
                <TrendingDown className="w-3.5 h-3.5" />
                {trendValue}
              </span>
            )}
            {trend === 'neutral' && trendValue && (
              <span className="flex items-center gap-0.5 text-foreground-tertiary font-medium">
                <Minus className="w-3.5 h-3.5" />
                {trendValue}
              </span>
            )}
            {context && <span className="text-foreground-tertiary">{context}</span>}
          </div>
        )}
      </div>
    </div>
  );
};
