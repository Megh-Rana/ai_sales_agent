import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  Search,
  Filter,
  Download,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  Code,
  Eye
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { AuditLogEntry, AuditSeverity } from '../../types/admin';
import { toast } from 'sonner';

interface AdminAuditLogsTabProps {
  logs: AuditLogEntry[];
}

export const AdminAuditLogsTab: React.FC<AdminAuditLogsTabProps> = ({ logs }) => {
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        const matches =
          log.action.toLowerCase().includes(q) ||
          log.actorName.toLowerCase().includes(q) ||
          log.actorEmail.toLowerCase().includes(q) ||
          log.resource.toLowerCase().includes(q) ||
          log.ipAddress.toLowerCase().includes(q) ||
          log.details.toLowerCase().includes(q);
        if (!matches) return false;
      }
      if (severityFilter !== 'all' && log.severity !== severityFilter) return false;
      return true;
    });
  }, [logs, search, severityFilter]);

  const handleExportCSV = () => {
    const headers = ['ID', 'Timestamp', 'Actor Name', 'Actor Email', 'Role', 'Action', 'Resource', 'Details', 'Severity', 'IP Address'];
    const rows = filteredLogs.map((l) => [
      l.id,
      l.timestamp,
      l.actorName,
      l.actorEmail,
      l.actorRole,
      l.action,
      l.resource,
      `"${l.details.replace(/"/g, '""')}"`,
      l.severity,
      l.ipAddress
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `platform_audit_logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Exported ${filteredLogs.length} audit log records!`);
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-foreground-tertiary absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search audit trail by actor, action, resource, IP..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-surface-1 border border-border-subtle rounded-lg text-foreground placeholder:text-foreground-tertiary focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-surface-1 border border-border-subtle rounded-lg text-foreground focus:outline-none focus:border-primary/50 transition-colors cursor-pointer"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="warning">Warning</option>
            <option value="info">Informational</option>
          </select>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={handleExportCSV}
          leftIcon={<Download className="w-3.5 h-3.5" />}
          className="text-xs shrink-0"
        >
          Export CSV ({filteredLogs.length})
        </Button>
      </div>

      {/* Audit Logs Table */}
      <div className="border border-border-default rounded-xl overflow-hidden bg-surface-1 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-elevated/70 border-b border-border-default text-foreground-secondary font-mono">
              <tr>
                <th className="p-3.5">Timestamp</th>
                <th className="p-3.5">Severity</th>
                <th className="p-3.5">Actor</th>
                <th className="p-3.5">Action Event</th>
                <th className="p-3.5">Target Resource</th>
                <th className="p-3.5">Details</th>
                <th className="p-3.5">IP Address</th>
                <th className="p-3.5 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle font-mono text-[11px]">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-surface-elevated/40 transition-colors">
                  {/* Timestamp */}
                  <td className="p-3.5 whitespace-nowrap text-foreground-tertiary">
                    {log.timestamp}
                  </td>

                  {/* Severity */}
                  <td className="p-3.5">
                    <span className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] border ${
                      log.severity === 'critical'
                        ? 'bg-red-500/15 text-red-400 border-red-500/30'
                        : log.severity === 'warning'
                        ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                        : 'bg-surface-2 text-foreground-secondary border-border-subtle'
                    }`}>
                      {log.severity}
                    </span>
                  </td>

                  {/* Actor */}
                  <td className="p-3.5 whitespace-nowrap">
                    <div className="font-semibold text-foreground font-sans">{log.actorName}</div>
                    <div className="text-[10px] text-foreground-tertiary">{log.actorRole}</div>
                  </td>

                  {/* Action */}
                  <td className="p-3.5 whitespace-nowrap font-bold text-foreground">
                    {log.action}
                  </td>

                  {/* Resource */}
                  <td className="p-3.5 whitespace-nowrap text-foreground-secondary">
                    {log.resource}
                  </td>

                  {/* Details */}
                  <td className="p-3.5 font-sans text-foreground-secondary max-w-xs truncate">
                    {log.details}
                  </td>

                  {/* IP */}
                  <td className="p-3.5 whitespace-nowrap text-foreground-tertiary">
                    {log.ipAddress}
                  </td>

                  {/* Inspect */}
                  <td className="p-3.5 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => setSelectedLog(log)}
                      className="p-1.5 rounded hover:bg-surface-hover text-primary hover:text-foreground cursor-pointer"
                      title="Inspect Log Entry"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedLog && (
        <Modal
          isOpen={!!selectedLog}
          onClose={() => setSelectedLog(null)}
          title={
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-surface-2 border border-border-default flex items-center justify-center text-foreground">
                <Code className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-bold text-foreground">Audit Log Event: {selectedLog.action}</div>
                <p className="text-[11px] font-normal text-foreground-tertiary">
                  ID: {selectedLog.id} · Recorded {selectedLog.timestamp}
                </p>
              </div>
            </div>
          }
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs font-mono">
            <div className="grid grid-cols-2 gap-3 p-3 bg-surface-elevated rounded-lg border border-border-default text-[11px]">
              <div>
                <span className="text-foreground-tertiary block">Actor</span>
                <span className="text-foreground font-semibold">{selectedLog.actorName} ({selectedLog.actorRole})</span>
              </div>
              <div>
                <span className="text-foreground-tertiary block">Email</span>
                <span className="text-foreground">{selectedLog.actorEmail}</span>
              </div>
              <div>
                <span className="text-foreground-tertiary block">IP Address</span>
                <span className="text-foreground">{selectedLog.ipAddress}</span>
              </div>
              <div>
                <span className="text-foreground-tertiary block">Target Resource</span>
                <span className="text-foreground">{selectedLog.resource}</span>
              </div>
            </div>

            <div>
              <span className="text-foreground-secondary font-medium block mb-1">Payload & Event Details</span>
              <div className="p-3 bg-surface-0 border border-border-subtle rounded-lg text-foreground-secondary leading-relaxed font-sans text-xs">
                {selectedLog.details}
              </div>
            </div>

            <div className="pt-3 border-t border-border-subtle flex justify-end">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSelectedLog(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
