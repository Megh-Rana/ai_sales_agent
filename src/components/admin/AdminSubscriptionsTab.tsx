import React, { useState } from 'react';
import {
  CreditCard,
  Building2,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  Zap,
  Layers,
  ArrowUpRight,
  Receipt,
  Sliders,
  Sparkles
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { AdminSubscription, SubscriptionTier, SubscriptionStatus } from '../../types/admin';
import { toast } from 'sonner';

interface AdminSubscriptionsTabProps {
  subscriptions: AdminSubscription[];
  onUpdateSubscriptions: (subs: AdminSubscription[]) => void;
}

export const AdminSubscriptionsTab: React.FC<AdminSubscriptionsTabProps> = ({
  subscriptions,
  onUpdateSubscriptions
}) => {
  const [selectedSub, setSelectedSub] = useState<AdminSubscription | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Form edit states
  const [editTier, setEditTier] = useState<SubscriptionTier>('Enterprise AI Scale');
  const [editStatus, setEditStatus] = useState<SubscriptionStatus>('active');
  const [editVoiceQuota, setEditVoiceQuota] = useState(10000);
  const [editLeadQuota, setEditLeadQuota] = useState(5000);

  const totalMRR = subscriptions.reduce((sum, s) => {
    if (s.status !== 'active') return sum;
    return sum + (s.billingInterval === 'annual' ? Math.round(s.amount / 12) : s.amount);
  }, 0);

  const totalARR = totalMRR * 12;
  const activeSubsCount = subscriptions.filter((s) => s.status === 'active').length;

  const handleOpenEdit = (sub: AdminSubscription) => {
    setSelectedSub(sub);
    setEditTier(sub.planTier);
    setEditStatus(sub.status);
    setEditVoiceQuota(sub.voiceMinutesQuota);
    setEditLeadQuota(sub.leadSearchQuota);
    setIsEditModalOpen(true);
  };

  const handleSaveSub = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSub) return;

    const updated = subscriptions.map((s) => {
      if (s.id === selectedSub.id) {
        return {
          ...s,
          planTier: editTier,
          status: editStatus,
          voiceMinutesQuota: Number(editVoiceQuota),
          leadSearchQuota: Number(editLeadQuota)
        };
      }
      return s;
    });

    onUpdateSubscriptions(updated);
    toast.success(`Updated subscription for ${selectedSub.workspaceName}!`);
    setIsEditModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Telemetry Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-surface-1 border border-border-subtle shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-mono uppercase text-foreground-tertiary">
              Total Monthly Recurring Revenue
            </span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground">₹{totalMRR.toLocaleString('en-IN')}</div>
          <p className="text-[11px] text-emerald-400 font-mono mt-1">
            +18.4% MRR expansion this quarter
          </p>
        </div>

        <div className="p-4 rounded-xl bg-surface-1 border border-border-subtle shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-mono uppercase text-foreground-tertiary">
              Annual Contract Value (ARR)
            </span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground">₹{(totalARR / 100000).toFixed(1)} Lakh</div>
          <p className="text-[11px] text-foreground-tertiary font-mono mt-1">
            Based on active committed annual & monthly contracts
          </p>
        </div>

        <div className="p-4 rounded-xl bg-surface-1 border border-border-subtle shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-mono uppercase text-foreground-tertiary">
              Active Tier Allocation
            </span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground">{activeSubsCount} / {subscriptions.length}</div>
          <p className="text-[11px] text-foreground-tertiary font-mono mt-1">
            {subscriptions.filter(s => s.status === 'past_due').length} past due · 1 pilot trial
          </p>
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="border border-border-default rounded-xl overflow-hidden bg-surface-1 shadow-xs">
        <div className="p-4 border-b border-border-subtle flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-foreground">Workspace Subscription Accounts</h2>
            <p className="text-[11px] text-foreground-tertiary">
              Tier allocations, voice minute consumption quotas, and renewal dates
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-elevated/70 border-b border-border-default text-foreground-secondary font-mono">
              <tr>
                <th className="p-3.5">Workspace & Domain</th>
                <th className="p-3.5">Plan Tier</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Billing & Renewal</th>
                <th className="p-3.5">Voice Minutes Quota</th>
                <th className="p-3.5">Lead Search Quota</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {subscriptions.map((sub) => {
                const voicePercent = Math.min(100, Math.round((sub.voiceMinutesUsed / sub.voiceMinutesQuota) * 100));
                const leadPercent = Math.min(100, Math.round((sub.leadSearchUsed / sub.leadSearchQuota) * 100));

                return (
                  <tr key={sub.id} className="hover:bg-surface-elevated/40 transition-colors">
                    <td className="p-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-lg bg-surface-2 text-foreground-secondary shrink-0">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-foreground truncate">{sub.workspaceName}</div>
                          <div className="text-[11px] font-mono text-foreground-tertiary truncate">
                            {sub.companyDomain}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5">
                      <span className={`text-[11px] font-mono px-2 py-0.5 rounded-md font-semibold border ${
                        sub.planTier === 'Enterprise AI Scale'
                          ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                          : sub.planTier === 'Growth Professional'
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                          : 'bg-surface-2 text-foreground-secondary border-border-subtle'
                      }`}>
                        {sub.planTier}
                      </span>
                    </td>

                    <td className="p-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold border ${
                        sub.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : sub.status === 'past_due'
                          ? 'bg-red-500/10 text-red-400 border-red-500/30'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sub.status === 'active' ? 'bg-emerald-400' : 'bg-red-400'}`} />
                        {sub.status.toUpperCase()}
                      </span>
                    </td>

                    <td className="p-3.5 text-foreground-secondary">
                      <div className="font-mono font-semibold text-foreground">
                        ₹{sub.amount.toLocaleString('en-IN')} / {sub.billingInterval}
                      </div>
                      <div className="text-[10px] text-foreground-tertiary flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3" /> Renew: {sub.currentPeriodEnd}
                      </div>
                    </td>

                    {/* Voice Quota Bar */}
                    <td className="p-3.5 min-w-[140px]">
                      <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                        <span className="text-foreground">{sub.voiceMinutesUsed} min</span>
                        <span className="text-foreground-tertiary">{sub.voiceMinutesQuota}</span>
                      </div>
                      <div className="w-full bg-surface-2 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${voicePercent > 90 ? 'bg-signal-urgent' : voicePercent > 70 ? 'bg-amber-400' : 'bg-primary'}`}
                          style={{ width: `${voicePercent}%` }}
                        />
                      </div>
                    </td>

                    {/* Lead Search Quota Bar */}
                    <td className="p-3.5 min-w-[140px]">
                      <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                        <span className="text-foreground">{sub.leadSearchUsed}</span>
                        <span className="text-foreground-tertiary">{sub.leadSearchQuota}</span>
                      </div>
                      <div className="w-full bg-surface-2 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-400 h-full rounded-full"
                          style={{ width: `${leadPercent}%` }}
                        />
                      </div>
                    </td>

                    <td className="p-3.5 text-right">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleOpenEdit(sub)}
                        leftIcon={<Sliders className="w-3 h-3 text-primary" />}
                        className="text-[11px]"
                      >
                        Manage
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Subscription Modal */}
      {selectedSub && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title={
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-bold text-foreground">Manage Subscription: {selectedSub.workspaceName}</div>
                <p className="text-[11px] font-normal text-foreground-tertiary">
                  Adjust plan tier, voice agent minutes quotas, and billing status.
                </p>
              </div>
            </div>
          }
          maxWidth="md"
        >
          <form onSubmit={handleSaveSub} className="space-y-4 text-xs">
            <div>
              <label className="block text-foreground-secondary font-medium mb-1">Plan Tier</label>
              <select
                value={editTier}
                onChange={(e) => setEditTier(e.target.value as SubscriptionTier)}
                className="w-full px-3 py-2 bg-surface-elevated border border-border-default rounded-lg text-foreground focus:outline-none focus:border-primary/50 text-xs cursor-pointer"
              >
                <option value="Enterprise AI Scale">Enterprise AI Scale (₹1,45,000 / yr)</option>
                <option value="Growth Professional">Growth Professional (₹28,000 / mo)</option>
                <option value="Starter Pilot">Starter Pilot (₹9,500 / mo)</option>
              </select>
            </div>

            <div>
              <label className="block text-foreground-secondary font-medium mb-1">Account Status</label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value as SubscriptionStatus)}
                className="w-full px-3 py-2 bg-surface-elevated border border-border-default rounded-lg text-foreground focus:outline-none focus:border-primary/50 text-xs cursor-pointer"
              >
                <option value="active">Active (Good Standing)</option>
                <option value="past_due">Past Due (Payment Failed)</option>
                <option value="trialing">Trialing (Evaluation Period)</option>
                <option value="canceled">Canceled</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-foreground-secondary font-medium mb-1">Voice Minutes Quota</label>
                <input
                  type="number"
                  value={editVoiceQuota}
                  onChange={(e) => setEditVoiceQuota(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-surface-elevated border border-border-default rounded-lg text-foreground focus:outline-none focus:border-primary/50 text-xs"
                />
              </div>

              <div>
                <label className="block text-foreground-secondary font-medium mb-1">Lead Search Quota</label>
                <input
                  type="number"
                  value={editLeadQuota}
                  onChange={(e) => setEditLeadQuota(Number(editLeadQuota))}
                  className="w-full px-3 py-2 bg-surface-elevated border border-border-default rounded-lg text-foreground focus:outline-none focus:border-primary/50 text-xs"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-border-subtle flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setIsEditModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                className="font-semibold"
              >
                Save Subscription Changes
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
