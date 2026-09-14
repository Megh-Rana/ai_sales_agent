import React from 'react';
import { ActionCenterSummary } from '../../types/actions';
import { PhoneCall, CalendarClock, AlertOctagon, FileText } from 'lucide-react';

interface ActionSummaryGridProps {
  summary: ActionCenterSummary;
}

export const ActionSummaryGrid: React.FC<ActionSummaryGridProps> = ({ summary }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* 1. Urgent Calls Due */}
      <div className="bg-surface-0 border border-rose-500/30 hover:border-rose-500/50 rounded-xl p-4 transition-all duration-200 shadow-sm flex items-center justify-between">
        <div className="space-y-1">
          <span className="text-xs font-semibold text-foreground-secondary tracking-wide uppercase">
            Urgent Calls Due
          </span>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-extrabold text-rose-400 font-mono">
              {summary.urgentCallsCount}
            </span>
            <span className="text-xs font-semibold text-rose-400/80 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
              {summary.urgentCallsPipelineValue}
            </span>
          </div>
          <span className="text-[11px] text-foreground-tertiary block">Action window &lt; 2h</span>
        </div>
        <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
          <PhoneCall className="w-5 h-5" aria-hidden="true" />
        </div>
      </div>

      {/* 2. Follow-ups Pending */}
      <div className="bg-surface-0 border border-amber-500/30 hover:border-amber-500/50 rounded-xl p-4 transition-all duration-200 shadow-sm flex items-center justify-between">
        <div className="space-y-1">
          <span className="text-xs font-semibold text-foreground-secondary tracking-wide uppercase">
            Follow-ups Due Today
          </span>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-extrabold text-amber-400 font-mono">
              {summary.followUpsPendingCount}
            </span>
            <span className="text-xs font-semibold text-amber-400/80 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              High Priority
            </span>
          </div>
          <span className="text-[11px] text-foreground-tertiary block">Touchpoints queued</span>
        </div>
        <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <CalendarClock className="w-5 h-5" aria-hidden="true" />
        </div>
      </div>

      {/* 3. Stalled Opportunities */}
      <div className="bg-surface-0 border border-indigo-500/30 hover:border-indigo-500/50 rounded-xl p-4 transition-all duration-200 shadow-sm flex items-center justify-between">
        <div className="space-y-1">
          <span className="text-xs font-semibold text-foreground-secondary tracking-wide uppercase">
            Stalled Deals (&gt;48h Idle)
          </span>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-extrabold text-indigo-400 font-mono">
              {summary.stalledDealsCount}
            </span>
            <span className="text-xs font-semibold text-indigo-400/80 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
              Needs Hook
            </span>
          </div>
          <span className="text-[11px] text-foreground-tertiary block">Re-engagement candidate</span>
        </div>
        <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
          <AlertOctagon className="w-5 h-5" aria-hidden="true" />
        </div>
      </div>

      {/* 4. New Requirement Alerts */}
      <div className="bg-surface-0 border border-blue-500/30 hover:border-blue-500/50 rounded-xl p-4 transition-all duration-200 shadow-sm flex items-center justify-between">
        <div className="space-y-1">
          <span className="text-xs font-semibold text-foreground-secondary tracking-wide uppercase">
            New Requirement Signals
          </span>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-extrabold text-blue-400 font-mono">
              {summary.newRequirementAlertsCount}
            </span>
            <span className="text-xs font-semibold text-blue-400/80 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
              RFPs Detected
            </span>
          </div>
          <span className="text-[11px] text-foreground-tertiary block">Fresh active tenders</span>
        </div>
        <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
          <FileText className="w-5 h-5" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
};
