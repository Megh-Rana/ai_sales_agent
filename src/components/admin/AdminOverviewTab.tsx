import React from 'react';
import {
  Users,
  CreditCard,
  Radio,
  Activity,
  ShieldAlert,
  Cpu,
  Sparkles,
  Layers,
  ArrowUpRight,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Zap,
  Clock,
  Server
} from 'lucide-react';
import {
  AdminUser,
  AdminSubscription,
  AdminCampaignMonitor,
  VoiceUsageMetrics,
  FraudAnomalyAlert,
  AuditLogEntry
} from '../../types/admin';

interface AdminOverviewTabProps {
  users: AdminUser[];
  subscriptions: AdminSubscription[];
  campaigns: AdminCampaignMonitor[];
  voiceMetrics: VoiceUsageMetrics;
  fraudAlerts: FraudAnomalyAlert[];
  recentLogs: AuditLogEntry[];
  onNavigateTab: (tab: string) => void;
}

export const AdminOverviewTab: React.FC<AdminOverviewTabProps> = ({
  users,
  subscriptions,
  campaigns,
  voiceMetrics,
  fraudAlerts,
  recentLogs,
  onNavigateTab
}) => {
  const activeUsersCount = users.filter((u) => u.status === 'active').length;
  const totalMRR = subscriptions.reduce((sum, s) => {
    if (s.status !== 'active') return sum;
    return sum + (s.billingInterval === 'annual' ? Math.round(s.amount / 12) : s.amount);
  }, 0);
  const activeCampaignsCount = campaigns.filter((c) => c.status === 'active').length;
  const unresolvedAlerts = fraudAlerts.filter((a) => a.status === 'open' || a.status === 'investigating');

  return (
    <div className="space-y-6">
      {/* ── KPI Grid ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div
          onClick={() => onNavigateTab('users')}
          className="p-4 rounded-xl bg-surface-1 border border-border-subtle hover:border-primary/50 transition-all cursor-pointer group shadow-xs"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono uppercase tracking-wider text-foreground-tertiary">
              Global Users
            </span>
            <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:scale-105 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">{users.length}</span>
            <span className="text-xs font-mono text-emerald-400 font-medium">
              {activeUsersCount} Active
            </span>
          </div>
          <p className="text-[11px] text-foreground-tertiary mt-1.5 flex items-center justify-between">
            <span>Enterprise SDR & Admins</span>
            <span className="text-primary flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
              Manage <ArrowUpRight className="w-3 h-3" />
            </span>
          </p>
        </div>

        {/* Subscriptions & MRR */}
        <div
          onClick={() => onNavigateTab('subscriptions')}
          className="p-4 rounded-xl bg-surface-1 border border-border-subtle hover:border-amber-500/50 transition-all cursor-pointer group shadow-xs"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono uppercase tracking-wider text-foreground-tertiary">
              Active Subscriptions
            </span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 group-hover:scale-105 transition-transform">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">₹{(totalMRR / 1000).toFixed(0)}k</span>
            <span className="text-xs font-mono text-amber-400 font-medium">/ month MRR</span>
          </div>
          <p className="text-[11px] text-foreground-tertiary mt-1.5 flex items-center justify-between">
            <span>{subscriptions.length} Enterprise Workspaces</span>
            <span className="text-amber-400 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
              Billing <ArrowUpRight className="w-3 h-3" />
            </span>
          </p>
        </div>

        {/* AI Voice Operations */}
        <div
          onClick={() => onNavigateTab('voice-usage')}
          className="p-4 rounded-xl bg-surface-1 border border-border-subtle hover:border-blue-500/50 transition-all cursor-pointer group shadow-xs"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono uppercase tracking-wider text-foreground-tertiary">
              AI Voice Telemetry
            </span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 group-hover:scale-105 transition-transform">
              <Radio className="w-4 h-4 animate-pulse" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">{voiceMetrics.activeLiveCalls}</span>
            <span className="text-xs font-mono text-blue-400 font-medium">Live Voice Calls</span>
          </div>
          <p className="text-[11px] text-foreground-tertiary mt-1.5 flex items-center justify-between">
            <span>{voiceMetrics.totalCallsToday} calls placed today</span>
            <span className="text-blue-400 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
              Telemetry <ArrowUpRight className="w-3 h-3" />
            </span>
          </p>
        </div>

        {/* Security & Fraud Detection */}
        <div
          onClick={() => onNavigateTab('fraud')}
          className="p-4 rounded-xl bg-surface-1 border border-border-subtle hover:border-red-500/50 transition-all cursor-pointer group shadow-xs"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono uppercase tracking-wider text-foreground-tertiary">
              Fraud & Anomaly Shield
            </span>
            <div className="p-2 rounded-lg bg-red-500/10 text-red-400 group-hover:scale-105 transition-transform">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-bold ${unresolvedAlerts.length > 0 ? 'text-signal-urgent' : 'text-emerald-400'}`}>
              {unresolvedAlerts.length}
            </span>
            <span className="text-xs font-mono text-foreground-secondary">
              {unresolvedAlerts.length === 0 ? 'Threats: None' : 'Active Alerts'}
            </span>
          </div>
          <p className="text-[11px] text-foreground-tertiary mt-1.5 flex items-center justify-between">
            <span>Rate limits & abuse caps active</span>
            <span className="text-red-400 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
              Inspect <ArrowUpRight className="w-3 h-3" />
            </span>
          </p>
        </div>
      </div>

      {/* ── Real-time Engine Infrastructure Status ─────────── */}
      <div className="p-5 rounded-xl bg-surface-1 border border-border-default space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border-subtle pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground tracking-tight">
                AI Voice Pipeline & Telemetry Infrastructure
              </h2>
              <p className="text-[11px] text-foreground-tertiary">
                Real-time latency, uptime, and GPU worker allocations across all AI components
              </p>
            </div>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1.5 self-start sm:self-auto">
            <CheckCircle2 className="w-3.5 h-3.5" />
            All 5 Core Subsystems Operational
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          {voiceMetrics.engines.map((engine, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-lg bg-surface-elevated/70 border border-border-subtle flex flex-col justify-between space-y-2 hover:border-border-default transition-colors"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface-2 text-foreground-tertiary uppercase font-semibold">
                    {engine.type}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] font-mono font-semibold text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    {engine.uptime99}%
                  </span>
                </div>
                <div className="font-semibold text-xs text-foreground mt-2 truncate">
                  {engine.name}
                </div>
                <div className="text-[10px] text-foreground-tertiary truncate">
                  {engine.provider}
                </div>
              </div>

              <div className="pt-2 border-t border-border-subtle flex items-center justify-between text-[11px]">
                <span className="text-foreground-tertiary">Latency</span>
                <span className="font-mono font-semibold text-foreground">
                  {engine.latencyMs} ms
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Active Campaigns & Security Alert Split ──────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Live Campaigns Monitoring */}
        <div className="p-5 rounded-xl bg-surface-1 border border-border-default space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-border-subtle pb-3 mb-3">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Live Outreach Campaigns ({activeCampaignsCount} Active)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab('campaigns')}
                className="text-xs text-primary hover:underline font-medium flex items-center gap-1"
              >
                View all <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {campaigns.slice(0, 3).map((camp) => (
                <div
                  key={camp.id}
                  className="p-3 rounded-lg bg-surface-elevated/60 border border-border-subtle space-y-2 hover:bg-surface-elevated transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-xs text-foreground truncate max-w-[240px]">
                      {camp.name}
                    </div>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold border ${
                      camp.healthStatus === 'optimal'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : camp.healthStatus === 'warning'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        : 'bg-red-500/10 text-red-400 border-red-500/30'
                    }`}>
                      {camp.healthStatus.toUpperCase()}
                    </span>
                  </div>

                  <div className="text-[11px] text-foreground-tertiary flex items-center justify-between">
                    <span>{camp.ownerCompany}</span>
                    <span className="font-mono text-foreground-secondary">
                      {camp.completedCalls} / {camp.targetLeads} calls ({((camp.completedCalls / camp.targetLeads) * 100).toFixed(0)}%)
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-surface-2 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-primary h-full rounded-full transition-all"
                      style={{ width: `${Math.min(100, (camp.completedCalls / camp.targetLeads) * 100)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono text-foreground-tertiary pt-0.5">
                    <span>Connect: <strong className="text-foreground">{camp.connectedRate}%</strong></span>
                    <span>Bookings: <strong className="text-signal-qualified">{camp.meetingBookingRate}%</strong></span>
                    <span>Workers: <strong className="text-blue-400">{camp.concurrentVoiceWorkers} AI Lines</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Security & Audit Pulse */}
        <div className="p-5 rounded-xl bg-surface-1 border border-border-default space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-border-subtle pb-3 mb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-400" />
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Security & Audit Activity Stream
                </h3>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab('audit-logs')}
                className="text-xs text-primary hover:underline font-medium flex items-center gap-1"
              >
                Full Audit Trail <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {recentLogs.slice(0, 4).map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-lg bg-surface-elevated/60 border border-border-subtle flex items-start justify-between gap-3 text-xs"
                >
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold uppercase ${
                        log.severity === 'critical'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : log.severity === 'warning'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-surface-2 text-foreground-secondary'
                      }`}>
                        {log.severity}
                      </span>
                      <span className="font-mono font-semibold text-foreground text-[11px] truncate">
                        {log.action}
                      </span>
                    </div>
                    <p className="text-[11px] text-foreground-secondary truncate max-w-sm">
                      {log.details}
                    </p>
                    <div className="text-[10px] text-foreground-tertiary flex items-center gap-2 pt-0.5">
                      <span>{log.actorName}</span>
                      <span>·</span>
                      <span className="font-mono">{log.ipAddress}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-foreground-tertiary shrink-0 mt-0.5">
                    {log.timestamp.split(' ')[1] || log.timestamp}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
