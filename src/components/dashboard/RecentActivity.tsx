import React from 'react';
import { Activity, Clock, ArrowRight } from 'lucide-react';
import { ActivityTimeline } from '../data/ActivityTimeline';
import { ActivityItemData } from '../../types/sales';

export interface RecentActivityProps {
  activities: ActivityItemData[];
  className?: string;
}

export const RecentActivity: React.FC<RecentActivityProps> = ({
  activities,
  className = '',
}) => {
  return (
    <div className={`bg-surface-0 border border-border-default rounded-xl p-4 sm:p-5 space-y-4 shadow-xs ${className}`}>
      <div className="flex items-center justify-between gap-2 border-b border-border-subtle pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-surface-1 text-foreground-secondary border border-border-subtle">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-body font-semibold text-foreground">Recent Sales Agent Activity</h4>
            <div className="text-[11px] text-foreground-tertiary">Real-time touchpoint and autonomous execution feed</div>
          </div>
        </div>
        <span className="text-[11px] font-mono text-foreground-tertiary">
          Live Stream
        </span>
      </div>

      <ActivityTimeline items={activities} />
    </div>
  );
};
