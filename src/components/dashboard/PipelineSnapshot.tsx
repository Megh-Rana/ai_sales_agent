import React from 'react';
import { ArrowUpRight, Zap, Target, PhoneCall, DollarSign } from 'lucide-react';
import { PipelineSnapshotMetric } from '../../data/dashboard';
import { AnimatedNumberTransition, AnimatedProgressBar } from '../ui/21st';

export interface PipelineSnapshotProps {
  metrics: PipelineSnapshotMetric[];
  className?: string;
}

export const PipelineSnapshot: React.FC<PipelineSnapshotProps> = ({ metrics, className = '' }) => {
  const getMetricIcon = (id: string) => {
    if (id.includes('signals')) return <Zap className="w-4 h-4 text-signal-high" />;
    if (id.includes('high-intent')) return <Target className="w-4 h-4 text-signal-high" />;
    if (id.includes('calls')) return <PhoneCall className="w-4 h-4 text-primary" />;
    return <DollarSign className="w-4 h-4 text-signal-qualified" />;
  };

  const parseValueProps = (raw: string) => {
    let prefix = '';
    let suffix = '';
    let numStr = raw;

    if (raw.startsWith('₹')) {
      prefix = '₹';
      numStr = raw.substring(1);
    } else if (raw.startsWith('$')) {
      prefix = '$';
      numStr = raw.substring(1);
    }

    if (numStr.endsWith(' Cr')) {
      suffix = ' Cr';
      numStr = numStr.replace(' Cr', '');
    } else if (numStr.endsWith('%')) {
      suffix = '%';
      numStr = numStr.replace('%', '');
    }

    const val = parseFloat(numStr.replace(/,/g, ''));
    const decimals = numStr.includes('.') ? numStr.split('.')[1].length : 0;

    return { val: isNaN(val) ? 0 : val, prefix, suffix, decimals, raw };
  };

  return (
    <div className={`grid grid-cols-2 lg:grid-cols-4 gap-3.5 ${className}`}>
      {metrics.map((metric, idx) => {
        const { val, prefix, suffix, decimals, raw } = parseValueProps(metric.value);
        const progressVal = Math.min(100, Math.max(15, (val / (val > 100 ? 200 : 50)) * 100));

        return (
          <div
            key={metric.id}
            className={`p-4 rounded-xl border transition-all duration-150 relative overflow-hidden group ${
              metric.isAccent
                ? 'bg-surface-0 border-border-default shadow-xs'
                : 'bg-surface-0 border-border-default hover:border-border-hover/60'
            }`}
          >
            {metric.isAccent && (
              <div className="absolute top-0 left-0 bottom-0 w-1 bg-primary rounded-l-xl" />
            )}

            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-caption font-medium text-foreground-secondary truncate">
                {metric.label}
              </span>
              <span className="p-1 rounded bg-surface-1 text-foreground-tertiary shrink-0">
                {getMetricIcon(metric.id)}
              </span>
            </div>

            <div className="flex items-baseline gap-2 mb-2">
              {isNaN(val) ? (
                <span className="text-metric font-bold text-foreground tracking-tight">
                  {raw}
                </span>
              ) : (
                <AnimatedNumberTransition
                  value={val}
                  prefix={prefix}
                  suffix={suffix}
                  decimals={decimals}
                  className="text-metric font-bold text-foreground tracking-tight"
                />
              )}
              {metric.trendValue && (
                <span className="inline-flex items-center text-[11px] font-medium text-signal-qualified">
                  <ArrowUpRight className="w-3 h-3 shrink-0" />
                  <span>{metric.trendValue}</span>
                </span>
              )}
            </div>

            <AnimatedProgressBar
              value={progressVal}
              height={4}
              showPercentage={false}
              color={idx % 2 === 0 ? 'primary' : 'success'}
            />

            <div className="text-[11px] text-foreground-tertiary truncate mt-2">
              {metric.context}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PipelineSnapshot;
