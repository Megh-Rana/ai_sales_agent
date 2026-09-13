import React from 'react';
import { ExecutiveMetric } from '../../types/analytics';
import { MetricCard } from './MetricCard';
import { Search, Zap, PhoneCall, CheckCircle2, CalendarCheck } from 'lucide-react';

interface ExecutiveMetricsGridProps {
  metrics: ExecutiveMetric[];
}

export const ExecutiveMetricsGrid: React.FC<ExecutiveMetricsGridProps> = ({ metrics }) => {
  const getIconForMetric = (id: string) => {
    switch (id) {
      case 'discovered':
        return <Search className="w-4 h-4" />;
      case 'high-intent':
        return <Zap className="w-4 h-4 text-amber-400" />;
      case 'calls-completed':
        return <PhoneCall className="w-4 h-4 text-blue-400" />;
      case 'qualified':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'meetings':
        return <CalendarCheck className="w-4 h-4 text-purple-400" />;
      default:
        return undefined;
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      {metrics.map((metric) => (
        <MetricCard
          key={metric.id}
          metric={metric}
          icon={getIconForMetric(metric.id)}
        />
      ))}
    </div>
  );
};
