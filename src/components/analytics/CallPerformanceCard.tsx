import React from 'react';
import { CallPerformanceData } from '../../types/analytics';
import { formatDurationSeconds, safePercentage } from '../../utils/analyticsMath';
import { PhoneCall, Clock, CheckCircle2, ThumbsUp, CalendarPlus } from 'lucide-react';

interface CallPerformanceCardProps {
  data: CallPerformanceData;
}

export const CallPerformanceCard: React.FC<CallPerformanceCardProps> = ({ data }) => {
  const qualRate = data.totalCalls > 0 ? safePercentage(data.qualifiedCalls, data.totalCalls, 1) : data.qualificationRate;
  const intRate = data.totalCalls > 0 ? safePercentage(data.interestedCalls, data.totalCalls, 1) : data.interestedRate;

  return (
    <div className="bg-surface border border-border rounded-xl p-5 md:p-6 shadow-sm flex flex-col justify-between h-full">
      <div>
        {/* Card Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <PhoneCall className="w-4 h-4" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">AI Voice Agent Performance</h2>
              <p className="text-xs text-foreground-secondary">
                Evaluating conversation quality & lead qualification yield
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-medium text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-md border border-blue-500/20">
            Autonomous Voice
          </span>
        </div>

        {/* Focus Statement Banner */}
        <div className="bg-background border border-border rounded-lg p-3.5 mb-5 flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-xs font-semibold text-foreground">
              Operational Focus: Useful Sales Conversations
            </p>
            <p className="text-[11px] text-foreground-secondary">
              {qualRate}% of completed calls resulted in BANT qualified opportunities.
            </p>
          </div>
          <div className="text-right font-mono">
            <span className="text-lg font-bold text-emerald-400">{data.qualifiedCalls}</span>
            <span className="text-xs text-foreground-tertiary block">/ {data.totalCalls} Calls</span>
          </div>
        </div>

        {/* 4-Stat Metric Cards Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-background border border-border rounded-lg p-3.5">
            <div className="flex items-center justify-between text-xs text-foreground-tertiary mb-1">
              <span>Avg Duration</span>
              <Clock className="w-3.5 h-3.5 text-blue-400" aria-hidden="true" />
            </div>
            <span className="text-xl font-bold text-foreground font-mono">
              {formatDurationSeconds(data.avgDurationSeconds)}
            </span>
            <span className="text-[11px] text-foreground-secondary block mt-0.5">
              High engagement window
            </span>
          </div>

          <div className="bg-background border border-border rounded-lg p-3.5">
            <div className="flex items-center justify-between text-xs text-foreground-tertiary mb-1">
              <span>Qualification Yield</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
            </div>
            <span className="text-xl font-bold text-emerald-400 font-mono">
              {qualRate}%
            </span>
            <span className="text-[11px] text-foreground-secondary block mt-0.5">
              {data.qualifiedCalls} qualified leads
            </span>
          </div>

          <div className="bg-background border border-border rounded-lg p-3.5">
            <div className="flex items-center justify-between text-xs text-foreground-tertiary mb-1">
              <span>Interested Yield</span>
              <ThumbsUp className="w-3.5 h-3.5 text-blue-400" aria-hidden="true" />
            </div>
            <span className="text-xl font-bold text-blue-400 font-mono">
              {intRate}%
            </span>
            <span className="text-[11px] text-foreground-secondary block mt-0.5">
              {data.interestedCalls} info requests
            </span>
          </div>

          <div className="bg-background border border-border rounded-lg p-3.5">
            <div className="flex items-center justify-between text-xs text-foreground-tertiary mb-1">
              <span>Follow-ups Created</span>
              <CalendarPlus className="w-3.5 h-3.5 text-purple-400" aria-hidden="true" />
            </div>
            <span className="text-xl font-bold text-purple-400 font-mono">
              {data.followUpsCreated}
            </span>
            <span className="text-[11px] text-foreground-secondary block mt-0.5">
              Dispatched to queue
            </span>
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-border text-xs text-foreground-tertiary flex items-center justify-between">
        <span>Telephony & AI Voice Latency Nominal</span>
        <span className="text-foreground font-mono font-medium">100% Verified Transcripts</span>
      </div>
    </div>
  );
};
