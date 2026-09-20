import React from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Lock,
  ArrowUpRight,
  Sliders
} from 'lucide-react';
import { Button } from '../ui/Button';
import { FraudAnomalyAlert, AnomalyStatus } from '../../types/admin';
import { toast } from 'sonner';

interface AdminFraudTabProps {
  alerts: FraudAnomalyAlert[];
  onUpdateAlerts: (alerts: FraudAnomalyAlert[]) => void;
}

export const AdminFraudTab: React.FC<AdminFraudTabProps> = ({ alerts, onUpdateAlerts }) => {
  const openAlerts = alerts.filter((a) => a.status === 'open' || a.status === 'investigating');

  const handleAction = (alertId: string, nextStatus: AnomalyStatus) => {
    const updated = alerts.map((a) => {
      if (a.id === alertId) {
        return { ...a, status: nextStatus };
      }
      return a;
    });
    onUpdateAlerts(updated);
    toast.success(`Threat status updated to ${nextStatus.toUpperCase()}`);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Status */}
      <div className="p-5 rounded-xl bg-surface-1 border border-border-default flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/25 flex items-center justify-center text-red-400 shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground">
              Autonomous Threat & Abuse Prevention Shield
            </h2>
            <p className="text-[11px] text-foreground-tertiary">
              Continuous monitoring for credential abuse, abnormal SIP call drop spikes, token exhaust, and scrapers.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            Active Protection Enabled
          </span>
        </div>
      </div>

      {/* Alerts Stream */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
            Detected Anomaly & Security Events ({alerts.length})
          </h3>
          <span className="text-xs font-mono text-foreground-tertiary">
            {openAlerts.length} Require Review
          </span>
        </div>

        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-xl border transition-all ${
                alert.status === 'investigating' || alert.status === 'open'
                  ? 'bg-surface-1 border-red-500/30 shadow-xs'
                  : 'bg-surface-1/70 border-border-subtle opacity-85'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2.5">
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase border ${
                    alert.severity === 'critical'
                      ? 'bg-red-500/20 text-red-400 border-red-500/30'
                      : alert.severity === 'high'
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                      : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                  }`}>
                    {alert.severity}
                  </span>
                  <span className="font-bold text-xs text-foreground">
                    {alert.type}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold border ${
                    alert.status === 'resolved' || alert.status === 'mitigated'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/25'
                  }`}>
                    {alert.status.toUpperCase()}
                  </span>
                  <span className="text-[11px] font-mono text-foreground-tertiary">
                    {alert.timestamp}
                  </span>
                </div>
              </div>

              <p className="text-xs text-foreground-secondary mb-3">
                {alert.description}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-2.5 rounded-lg bg-surface-elevated/70 border border-border-subtle text-[11px] font-mono mb-3">
                <div>
                  <span className="text-foreground-tertiary block">Trigger Telemetry</span>
                  <span className="text-signal-urgent font-bold">{alert.triggerValue}</span>
                </div>
                <div>
                  <span className="text-foreground-tertiary block">Safety Threshold</span>
                  <span className="text-foreground">{alert.threshold}</span>
                </div>
                <div>
                  <span className="text-foreground-tertiary block">Affected Entity</span>
                  <span className="text-foreground truncate">{alert.affectedEntity}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-border-subtle">
                <div className="text-[11px] text-foreground-tertiary flex items-center gap-1.5">
                  <span className="font-semibold text-foreground-secondary">Recommended:</span>
                  <span>{alert.recommendedAction}</span>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  {alert.status !== 'mitigated' && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleAction(alert.id, 'mitigated')}
                      className="text-[11px] text-emerald-400 hover:bg-emerald-500/10"
                    >
                      Mitigate & Apply Rule
                    </Button>
                  )}
                  {alert.status !== 'resolved' && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleAction(alert.id, 'resolved')}
                      className="text-[11px]"
                    >
                      Resolve
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
