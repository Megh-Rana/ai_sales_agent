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
    if (id.includes('signals')) return <Zap className="w-4 h-4 text-babyPink" />;
    if (id.includes('high-intent')) return <Target className="w-4 h-4 text-pastelPetal" />;
    if (id.includes('calls')) return <PhoneCall className="w-4 h-4 text-skyBlue" />;
    return <DollarSign className="w-4 h-4 text-success" />;
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
    <div className={`grid grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      {metrics.map((metric, idx) => {
        const { val, prefix, suffix, decimals, raw } = parseValueProps(metric.value);
        const progressVal = Math.min(100, Math.max(15, (val / (val > 100 ? 200 : 50)) * 100));
        
        // Assign pastel colors to each metric
        const colors = ['thistle', 'skyBlue', 'babyPink', 'icyBlue'];
        const colorClass = colors[idx % colors.length];

        return (
          <div
            key={metric.id}
            className={`p-4 rounded-xl border border-${colorClass}/20 bg-surface hover:border-${colorClass}/40 transition-all duration-200 relative overflow-hidden group shadow-sm`}
          >
            <div className="absolute top-0 left-0 bottom-0 w-1 bg-${colorClass} opacity-60 rounded-l-xl" />

            <div className="flex items-center justify-between gap-2 mb-2.5 pl-2">
              <span className="text-xs font-medium text-foreground-secondary">
                {metric.label}
              </span>
              <span className={`p-1.5 rounded-lg bg-${colorClass}/10 border border-${colorClass}/30 shrink-0`}>
                {getMetricIcon(metric.id)}
              </span>
            </div>

            <div className="flex items-baseline gap-2 mb-3 pl-2">
              {isNaN(val) ? (
                <span className="text-2xl font-bold text-foreground tracking-tight">
                  {raw}
                </span>
              ) : (
                <AnimatedNumberTransition
                  value={val}
                  prefix={prefix}
                  suffix={suffix}
                  decimals={decimals}
                  className="text-2xl font-bold text-foreground tracking-tight"
                />
              )}
              {metric.trendValue && (
                <span className="inline-flex items-center text-xs font-semibold text-success">
                  <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
                  <span>{metric.trendValue}</span>
                </span>
              )}
            </div>

            <div className="text-xs text-foreground-tertiary pl-2 leading-relaxed">
              {metric.context}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PipelineSnapshot;
