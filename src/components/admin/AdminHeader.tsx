import React from 'react';
import {
  ShieldAlert,
  Activity,
  Cpu,
  Download,
  Plus,
  RefreshCw,
  Sliders,
  CheckCircle2
} from 'lucide-react';
import { Button } from '../ui/Button';

export interface AdminHeaderProps {
  activeTab: string;
  onRefresh: () => void;
  isRefreshing?: boolean;
  onOpenAddUser?: () => void;
  onExportAudit?: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  activeTab,
  onRefresh,
  isRefreshing = false,
  onOpenAddUser,
  onExportAudit
}) => {
  return (
    <div className="bg-surface-0 border-b border-border-default px-6 py-5 space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <span className="text-xs font-mono uppercase tracking-wider text-red-400 font-semibold flex items-center gap-1.5">
              <span>Platform Administration</span>
              <span className="text-border-subtle">•</span>
              <span className="text-foreground-tertiary">Global Operations</span>
            </span>
          </div>

          <h1 className="text-h2 font-bold text-foreground tracking-tight flex items-center gap-3">
            <span>Admin Command Center</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              99.98% Telemetry SLA
            </span>
          </h1>

          <p className="text-small text-foreground-tertiary mt-0.5 flex flex-wrap items-center gap-2">
            <span>Manage users, subscriptions, AI voice agents, campaign telemetry, and platform security.</span>
            <span className="text-border-subtle hidden sm:inline">•</span>
            <span className="text-emerald-400 font-mono text-xs flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5" />
              RTX 5050 GPU Acceleration Active (16ms LLM)
            </span>
          </p>
        </div>

        {/* Global Admin Actions */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Button
            variant="secondary"
            size="sm"
            onClick={onRefresh}
            isLoading={isRefreshing}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-primary' : ''}`} />}
            className="text-xs"
          >
            {isRefreshing ? 'Syncing...' : 'Sync Telemetry'}
          </Button>

          {onExportAudit && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onExportAudit}
              leftIcon={<Download className="w-3.5 h-3.5" />}
              className="text-xs"
            >
              Export Audit Trail
            </Button>
          )}

          {onOpenAddUser && (
            <Button
              variant="primary"
              size="sm"
              onClick={onOpenAddUser}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              className="text-xs font-semibold shadow-xs"
            >
              Add User
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
