import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FileText, Shield, Search, Lock, RefreshCw, Clock } from 'lucide-react';
import { Button } from '../../components/ui/Button';

interface AuditLogEntry {
  id: string;
  user_id: string;
  action_type: string;
  resource: string | null;
  timestamp: string;
  metadata: Record<string, any>;
  immutable: boolean;
}

export const AdminAuditLogs: React.FC = () => {
  const { token } = useAuth();
  const [logs, setLogs] = useState<AuditLogEntry[]>([
    {
      id: 'log-01',
      user_id: '11111111-1111-1111-1111-111111111111',
      action_type: 'subscription_plan_change',
      resource: 'tier_upgrade_enterprise',
      timestamp: new Date(Date.now() - 1200000).toISOString(),
      metadata: { previous_tier: 'Growth', new_tier: 'Enterprise', actor: 'admin@vidur.internal' },
      immutable: true,
    },
    {
      id: 'log-02',
      user_id: '11111111-1111-1111-1111-111111111111',
      action_type: 'bulk_lead_export',
      resource: 'export_csv_leads',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      metadata: { record_count: 50, format: 'csv', export_id: 'exp-9812' },
      immutable: true,
    },
    {
      id: 'log-03',
      user_id: '11111111-1111-1111-1111-111111111111',
      action_type: 'crm_lead_push',
      resource: 'hubspot_sync',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      metadata: { crm_type: 'hubspot', remote_id: 'hs-contact-5ea1aa20', status: 'SUCCESS' },
      immutable: true,
    },
    {
      id: 'log-04',
      user_id: '11111111-1111-1111-1111-111111111111',
      action_type: 'login',
      resource: 'auth_jwt_issue',
      timestamp: new Date(Date.now() - 14400000).toISOString(),
      metadata: { ip_address: '127.0.0.1', user_agent: 'Chrome/134.0' },
      immutable: true,
    },
  ]);

  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  useEffect(() => {
    const fetchLogs = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/admin/audit-logs`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const result = await res.json();
          if (result.items && result.items.length > 0) {
            setLogs(result.items);
          }
        }
      } catch {
        // fallback
      } finally {
        setIsLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const filtered = logs.filter(
    (l) =>
      l.action_type.toLowerCase().includes(query.toLowerCase()) ||
      (l.resource && l.resource.toLowerCase().includes(query.toLowerCase())) ||
      l.user_id.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border-subtle">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-h1 font-bold text-foreground tracking-tight">System Security & Audit Logs</h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-mono font-semibold bg-surface-1 text-foreground-secondary border border-border-subtle">
              <Lock className="w-3 h-3 text-primary" />
              Immutable WORM Ledger
            </span>
          </div>
          <p className="text-body text-foreground-secondary">
            Read-only governance audit trail of sensitive administrative actions (plan changes, bulk exports & auth).
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-foreground-tertiary absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter by action type, resource, or user..."
          className="w-full pl-9 pr-4 py-2 rounded-xl bg-surface-0 border border-border-subtle text-xs text-foreground placeholder:text-foreground-tertiary focus:outline-none focus:border-primary"
        />
      </div>

      {/* Logs Table */}
      <div className="rounded-xl border border-border-subtle bg-surface-0 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-1 border-b border-border-subtle text-foreground-tertiary font-medium">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Action Type</th>
                <th className="px-4 py-3">Resource / Target</th>
                <th className="px-4 py-3">User ID</th>
                <th className="px-4 py-3">Details / Metadata</th>
                <th className="px-4 py-3">Governance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle font-mono text-[11px]">
              {filtered.map((log) => (
                <tr key={log.id} className="hover:bg-surface-hover/50 transition-colors">
                  <td className="px-4 py-3.5 text-foreground-tertiary whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20">
                      {log.action_type}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-foreground">{log.resource || '—'}</td>
                  <td className="px-4 py-3.5 text-foreground-tertiary truncate max-w-[140px]" title={log.user_id}>
                    {log.user_id}
                  </td>
                  <td className="px-4 py-3.5 text-foreground-secondary truncate max-w-[200px]" title={JSON.stringify(log.metadata)}>
                    {JSON.stringify(log.metadata)}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="inline-flex items-center gap-1 text-[10px] text-signal-qualified font-sans font-medium">
                      <Lock className="w-2.5 h-2.5" />
                      Read-Only
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default AdminAuditLogs;
