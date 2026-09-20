import React, { useState } from 'react';
import {
  Flame,
  Radio,
  Pause,
  Play,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  Users,
  Building2,
  Clock,
  Sparkles,
  Zap
} from 'lucide-react';
import { Button } from '../ui/Button';
import { AdminCampaignMonitor } from '../../types/admin';
import { toast } from 'sonner';

interface AdminCampaignsTabProps {
  campaigns: AdminCampaignMonitor[];
  onUpdateCampaigns: (camps: AdminCampaignMonitor[]) => void;
}

export const AdminCampaignsTab: React.FC<AdminCampaignsTabProps> = ({
  campaigns,
  onUpdateCampaigns
}) => {
  const activeCount = campaigns.filter((c) => c.status === 'active').length;
  const totalVoiceWorkers = campaigns.reduce((sum, c) => c.status === 'active' ? sum + c.concurrentVoiceWorkers : sum, 0);
  const avgBookingRate = (campaigns.reduce((sum, c) => sum + c.meetingBookingRate, 0) / (campaigns.length || 1)).toFixed(1);

  const handleToggleStatus = (campId: string) => {
    const updated = campaigns.map((c) => {
      if (c.id === campId) {
        const nextStatus = c.status === 'active' ? 'paused' : 'active';
        toast.info(`Campaign "${c.name}" ${nextStatus === 'active' ? 'resumed' : 'paused'}.`);
        return {
          ...c,
          status: nextStatus as any,
          healthStatus: (nextStatus === 'paused' ? 'paused' : 'optimal') as any
        };
      }
      return c;
    });
    onUpdateCampaigns(updated);
  };

  const handleScaleWorkers = (campId: string, delta: number) => {
    const updated = campaigns.map((c) => {
      if (c.id === campId) {
        const current = c.concurrentVoiceWorkers;
        const next = Math.max(1, Math.min(12, current + delta));
        toast.success(`Allocated ${next} concurrent voice workers to ${c.name}`);
        return { ...c, concurrentVoiceWorkers: next };
      }
      return c;
    });
    onUpdateCampaigns(updated);
  };

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-surface-1 border border-border-subtle shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-mono uppercase text-foreground-tertiary">
              Active Global Cadences
            </span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground">{activeCount} / {campaigns.length}</div>
          <p className="text-[11px] text-foreground-tertiary font-mono mt-1">
            Running across all enterprise client accounts
          </p>
        </div>

        <div className="p-4 rounded-xl bg-surface-1 border border-border-subtle shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-mono uppercase text-foreground-tertiary">
              Allocated AI Voice Lines
            </span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <Radio className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground">{totalVoiceWorkers} Concurrent</div>
          <p className="text-[11px] text-blue-400 font-mono mt-1">
            Max global concurrency ceiling: 24 lines
          </p>
        </div>

        <div className="p-4 rounded-xl bg-surface-1 border border-border-subtle shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-mono uppercase text-foreground-tertiary">
              Avg Meeting Booking Rate
            </span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground">{avgBookingRate}%</div>
          <p className="text-[11px] text-emerald-400 font-mono mt-1">
            Target qualified discovery consultations scheduled
          </p>
        </div>
      </div>

      {/* Campaigns Monitor Table */}
      <div className="border border-border-default rounded-xl overflow-hidden bg-surface-1 shadow-xs">
        <div className="p-4 border-b border-border-subtle flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-foreground">Global Outreach Campaigns Telemetry</h2>
            <p className="text-[11px] text-foreground-tertiary">
              Real-time health, connection efficiency, and AI voice line throttling
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-elevated/70 border-b border-border-default text-foreground-secondary font-mono">
              <tr>
                <th className="p-3.5">Campaign Name & Type</th>
                <th className="p-3.5">Owner Workspace</th>
                <th className="p-3.5">Health</th>
                <th className="p-3.5">Progress</th>
                <th className="p-3.5">Performance</th>
                <th className="p-3.5">Voice Workers</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {campaigns.map((camp) => {
                const percent = Math.min(100, Math.round((camp.completedCalls / camp.targetLeads) * 100));

                return (
                  <tr key={camp.id} className="hover:bg-surface-elevated/40 transition-colors">
                    <td className="p-3.5">
                      <div className="font-semibold text-foreground">{camp.name}</div>
                      <div className="text-[10px] font-mono text-foreground-tertiary mt-0.5">
                        {camp.type} · Started {camp.startedAt}
                      </div>
                    </td>

                    <td className="p-3.5 text-foreground-secondary">
                      <div className="font-medium text-foreground">{camp.ownerCompany}</div>
                      <div className="text-[10px] text-foreground-tertiary">{camp.ownerEmail}</div>
                    </td>

                    <td className="p-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold border ${
                        camp.healthStatus === 'optimal'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : camp.healthStatus === 'warning'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          : 'bg-red-500/10 text-red-400 border-red-500/30'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${camp.healthStatus === 'optimal' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                        {camp.healthStatus.toUpperCase()}
                      </span>
                    </td>

                    <td className="p-3.5 min-w-[150px]">
                      <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                        <span className="text-foreground">{camp.completedCalls}</span>
                        <span className="text-foreground-tertiary">/ {camp.targetLeads} ({percent}%)</span>
                      </div>
                      <div className="w-full bg-surface-2 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-primary h-full rounded-full"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </td>

                    <td className="p-3.5">
                      <div className="text-[11px] font-mono">
                        <span>Connect: <strong className="text-foreground">{camp.connectedRate}%</strong></span>
                      </div>
                      <div className="text-[10px] font-mono text-signal-qualified font-semibold mt-0.5">
                        Bookings: {camp.meetingBookingRate}%
                      </div>
                    </td>

                    {/* Scale Voice Workers */}
                    <td className="p-3.5">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleScaleWorkers(camp.id, -1)}
                          disabled={camp.concurrentVoiceWorkers <= 1}
                          className="w-6 h-6 rounded bg-surface-2 hover:bg-surface-hover flex items-center justify-center font-bold text-xs disabled:opacity-30 cursor-pointer"
                        >
                          -
                        </button>
                        <span className="font-mono font-bold text-xs px-1 text-blue-400 min-w-[24px] text-center">
                          {camp.concurrentVoiceWorkers}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleScaleWorkers(camp.id, 1)}
                          disabled={camp.concurrentVoiceWorkers >= 12}
                          className="w-6 h-6 rounded bg-surface-2 hover:bg-surface-hover flex items-center justify-center font-bold text-xs disabled:opacity-30 cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </td>

                    <td className="p-3.5 text-right">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleToggleStatus(camp.id)}
                        leftIcon={camp.status === 'active' ? <Pause className="w-3 h-3 text-amber-400" /> : <Play className="w-3 h-3 text-emerald-400" />}
                        className="text-[11px]"
                      >
                        {camp.status === 'active' ? 'Pause' : 'Resume'}
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
