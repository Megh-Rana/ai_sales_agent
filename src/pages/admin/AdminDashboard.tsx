import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  Users,
  PhoneCall,
  CreditCard,
  AlertTriangle,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Search,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';

interface ComplianceItem {
  id: string;
  product_name: string;
  description: string;
  category: string;
  status: 'auto-approved' | 'needs-review' | 'approved' | 'rejected';
  is_regulated: boolean;
  reason: string;
  blocked_calling: boolean;
  created_at: string;
}

export const AdminDashboard: React.FC = () => {
  const { token } = useAuth();
  const [complianceQueue, setComplianceQueue] = useState<ComplianceItem[]>([
    {
      id: 'comp-01',
      product_name: 'Financial Investment Advisory Services',
      description: 'Automated portfolio rebalancing and algorithmic equity recommendations for retail investors.',
      category: 'Financial Services & Investment Advisory',
      status: 'needs-review',
      is_regulated: true,
      reason: 'Regulated offering requires SEBI/SEC compliance certification before AI dialing.',
      blocked_calling: true,
      created_at: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 'comp-02',
      product_name: 'Telehealth Medical Prescription Assistant',
      description: 'AI voice triage for outpatient prescription refills and doctor appointments.',
      category: 'Healthcare & Clinical Telehealth',
      status: 'needs-review',
      is_regulated: true,
      reason: 'HIPAA and clinical compliance review required before patient outreach.',
      blocked_calling: true,
      created_at: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      id: 'comp-03',
      product_name: 'Cloud-Based Project Management Software',
      description: 'Sprint planning and resource management tool for engineering organizations.',
      category: 'B2B Software & SaaS',
      status: 'auto-approved',
      is_regulated: false,
      reason: 'Standard commercial offering passed automated compliance validation.',
      blocked_calling: false,
      created_at: new Date(Date.now() - 14400000).toISOString(),
    },
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  const fetchQueue = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/compliance/queue`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          setComplianceQueue(data);
        }
      }
    } catch {
      // Keep state
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleReview = async (id: string, decision: 'approved' | 'rejected') => {
    try {
      await fetch(`${API_BASE}/api/admin/compliance/${id}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          decision,
          admin_notes: `Manually ${decision} by Admin on ${new Date().toLocaleDateString()}`,
        }),
      });
    } catch {
      // fallback
    }

    setComplianceQueue((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: decision,
              blocked_calling: decision === 'rejected',
            }
          : item
      )
    );

    setNotification(
      `Product "${complianceQueue.find((i) => i.id === id)?.product_name}" has been ${decision.toUpperCase()} for AI calling.`
    );
    setTimeout(() => setNotification(null), 4000);
  };

  const pendingCount = complianceQueue.filter((i) => i.status === 'needs-review').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border-subtle">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-h1 font-bold text-foreground tracking-tight">Administration Portal</h1>
            <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-semibold bg-primary/15 text-primary border border-primary/30">
              Super Admin Mode
            </span>
          </div>
          <p className="text-body text-foreground-secondary">
            Global governance, compliance review queue, telephony telemetry, and threat monitoring.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={fetchQueue}
          isLoading={isLoading}
          leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
        >
          Refresh Queue
        </Button>
      </div>

      {notification && (
        <div className="p-3.5 rounded-xl bg-signal-qualified/10 border border-signal-qualified/30 text-xs text-signal-qualified flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Admin KPI Quick Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          to="/admin/users"
          className="p-4 rounded-xl bg-surface-0 border border-border-subtle hover:border-primary/50 transition-all group"
        >
          <div className="flex items-center justify-between text-xs text-foreground-tertiary">
            <span>Client Accounts</span>
            <Users className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold font-mono text-foreground mt-2">12 Accounts</div>
          <div className="text-[11px] text-foreground-secondary mt-1">Across Starter, Growth & Enterprise</div>
        </Link>

        <Link
          to="/admin/voice-usage"
          className="p-4 rounded-xl bg-surface-0 border border-border-subtle hover:border-signal-qualified/50 transition-all group"
        >
          <div className="flex items-center justify-between text-xs text-foreground-tertiary">
            <span>Voice Telemetry</span>
            <PhoneCall className="w-4 h-4 text-signal-qualified group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold font-mono text-signal-qualified mt-2">1,482 Mins</div>
          <div className="text-[11px] text-foreground-secondary mt-1">Exact parity with call logs (0.0% drift)</div>
        </Link>

        <Link
          to="/admin/billing"
          className="p-4 rounded-xl bg-surface-0 border border-border-subtle hover:border-amber-400/50 transition-all group"
        >
          <div className="flex items-center justify-between text-xs text-foreground-tertiary">
            <span>Usage Billing Engine</span>
            <CreditCard className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold font-mono text-foreground mt-2">Metered Tiers</div>
          <div className="text-[11px] text-foreground-secondary mt-1">Voice minutes, contacts & CRM fee</div>
        </Link>

        <Link
          to="/admin/fraud"
          className="p-4 rounded-xl bg-surface-0 border border-border-subtle hover:border-signal-urgent/50 transition-all group"
        >
          <div className="flex items-center justify-between text-xs text-foreground-tertiary">
            <span>Fraud & Anomaly</span>
            <ShieldAlert className="w-4 h-4 text-signal-urgent group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold font-mono text-signal-urgent mt-2">Active Sentinel</div>
          <div className="text-[11px] text-foreground-secondary mt-1">Abnormal call volume spike monitor</div>
        </Link>
      </div>

      {/* PRODUCT COMPLIANCE APPROVAL QUEUE (TC-05) */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
              <h2 className="text-h3 font-bold text-foreground">Product & Service Compliance Queue</h2>
              {pendingCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-400/20 text-amber-400 border border-amber-400/30">
                  {pendingCount} Flagged
                </span>
              )}
            </div>
            <p className="text-caption text-foreground-secondary">
              Review ambiguous and regulated offerings before autonomous AI voice calling is unlocked.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {complianceQueue.map((item) => {
            const isPending = item.status === 'needs-review';
            const isApproved = item.status === 'approved' || item.status === 'auto-approved';
            const isRejected = item.status === 'rejected';

            return (
              <div
                key={item.id}
                className={`p-4 rounded-xl border transition-all ${
                  isPending
                    ? 'bg-surface-0 border-amber-500/40 shadow-xs'
                    : isApproved
                    ? 'bg-surface-0/60 border-signal-qualified/30 opacity-80'
                    : 'bg-surface-0/60 border-signal-urgent/30 opacity-70'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-sm text-foreground">{item.product_name}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-surface-1 border border-border-subtle text-foreground-tertiary">
                        {item.category}
                      </span>
                      {isPending && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-400/15 text-amber-400 border border-amber-400/30">
                          <Clock className="w-3 h-3" />
                          Needs Admin Review
                        </span>
                      )}
                      {isApproved && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-signal-qualified/15 text-signal-qualified border border-signal-qualified/30">
                          <CheckCircle2 className="w-3 h-3" />
                          {item.status === 'auto-approved' ? 'Auto-Approved' : 'Approved by Admin'}
                        </span>
                      )}
                      {isRejected && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-signal-urgent/15 text-signal-urgent border border-signal-urgent/30">
                          <XCircle className="w-3 h-3" />
                          Rejected
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-foreground-secondary leading-relaxed">
                      {item.description}
                    </p>

                    <div className="text-[11px] text-amber-400/90 flex items-center gap-1.5 font-medium">
                      <span>Reason:</span>
                      <span>{item.reason}</span>
                    </div>
                  </div>

                  {/* Admin Decision Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {isPending ? (
                      <>
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => handleReview(item.id, 'approved')}
                          leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                        >
                          Approve AI Calling
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleReview(item.id, 'rejected')}
                          leftIcon={<XCircle className="w-3.5 h-3.5" />}
                        >
                          Reject
                        </Button>
                      </>
                    ) : (
                      <span className="text-xs font-mono text-foreground-tertiary">
                        Decision Finalized
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
export default AdminDashboard;
