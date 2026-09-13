import React from 'react';
import { DollarSign, Flame, Clock, Target, CheckCircle2, TrendingUp } from 'lucide-react';
import { RevenueMetricSnapshot } from '../../types/commandCenter';

interface RevenueProgressStripProps {
  metrics: RevenueMetricSnapshot;
}

export const RevenueProgressStrip: React.FC<RevenueProgressStripProps> = ({ metrics }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
      {/* Metric 1: Active Pipeline Value */}
      <div className="p-4 rounded-xl bg-surface-0 border border-border-default space-y-1">
        <div className="flex items-center justify-between text-caption font-mono text-foreground-tertiary">
          <span>ACTIVE PIPELINE VALUE</span>
          <DollarSign className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="text-h3 font-mono font-bold text-foreground tracking-tight">
          {metrics?.activePipelineValue || '₹0'}
        </div>
        <div className="text-caption text-foreground-secondary flex items-center gap-1">
          <TrendingUp className="w-3 h-3 text-emerald-400" />
          <span>Across {metrics?.todaySignalsCount || 0} live signal triggers</span>
        </div>
      </div>

      {/* Metric 2: Urgent Priority Actions */}
      <div className="p-4 rounded-xl bg-surface-0 border border-amber-500/30 space-y-1">
        <div className="flex items-center justify-between text-caption font-mono text-amber-400">
          <span>ACTION REQUIRED NOW</span>
          <Flame className="w-4 h-4 text-amber-400" />
        </div>
        <div className="text-h3 font-mono font-bold text-amber-400 tracking-tight">
          {metrics?.urgentActionCount || 0} High Priority
        </div>
        <div className="text-caption text-foreground-secondary">
          High-intent leads requiring rep triage
        </div>
      </div>

      {/* Metric 3: Inbound Qualification Rate */}
      <div className="p-4 rounded-xl bg-surface-0 border border-border-default space-y-1">
        <div className="flex items-center justify-between text-caption font-mono text-foreground-tertiary">
          <span>QUALIFICATION RATE</span>
          <CheckCircle2 className="w-4 h-4 text-blue-400" />
        </div>
        <div className="text-h3 font-mono font-bold text-foreground tracking-tight">
          {metrics?.inboundQualificationRate || 0}%
        </div>
        <div className="text-caption text-foreground-secondary">
          Automated AI Voice qualification rating
        </div>
      </div>

      {/* Metric 4: Overdue Follow-ups */}
      <div className="p-4 rounded-xl bg-surface-0 border border-border-default space-y-1">
        <div className="flex items-center justify-between text-caption font-mono text-foreground-tertiary">
          <span>OVERDUE FOLLOW-UPS</span>
          <Clock className="w-4 h-4 text-amber-400" />
        </div>
        <div className="text-h3 font-mono font-bold text-amber-400 tracking-tight">
          {metrics?.overdueFollowUpsCount || 0} Pending
        </div>
        <div className="text-caption text-foreground-secondary">
          Scheduled touchpoints requiring completion
        </div>
      </div>
    </div>
  );
};
