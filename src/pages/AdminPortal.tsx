import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  Activity,
  Users,
  CreditCard,
  Flame,
  Radio,
  Sliders,
  AlertTriangle,
  Receipt
} from 'lucide-react';
import { AdminHeader } from '../components/admin/AdminHeader';
import { AdminOverviewTab } from '../components/admin/AdminOverviewTab';
import { AdminUsersTab } from '../components/admin/AdminUsersTab';
import { AdminSubscriptionsTab } from '../components/admin/AdminSubscriptionsTab';
import { AdminCampaignsTab } from '../components/admin/AdminCampaignsTab';
import { AdminVoiceUsageTab } from '../components/admin/AdminVoiceUsageTab';
import { AdminAuditLogsTab } from '../components/admin/AdminAuditLogsTab';
import { AdminFraudTab } from '../components/admin/AdminFraudTab';
import { AdminSettingsTab } from '../components/admin/AdminSettingsTab';
import {
  getAdminUsers,
  saveAdminUsers,
  getAdminSubscriptions,
  saveAdminSubscriptions,
  getAdminCampaigns,
  saveAdminCampaigns,
  getAuditLogs,
  getFraudAlerts,
  saveFraudAlerts,
  getPlatformConfig,
  savePlatformConfig,
  initialVoiceUsageMetrics
} from '../data/mockAdminData';
import {
  AdminUser,
  AdminSubscription,
  AdminCampaignMonitor,
  VoiceUsageMetrics,
  AuditLogEntry,
  FraudAnomalyAlert,
  PlatformConfig
} from '../types/admin';
import { toast } from 'sonner';

type TabKey =
  | 'overview'
  | 'users'
  | 'subscriptions'
  | 'campaigns'
  | 'voice-usage'
  | 'audit-logs'
  | 'fraud'
  | 'settings';

export const AdminPortal: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Determine active tab from URL pathname
  const getTabFromPath = (pathname: string): TabKey => {
    if (pathname.includes('/admin/users')) return 'users';
    if (pathname.includes('/admin/subscriptions') || pathname.includes('/admin/billing')) return 'subscriptions';
    if (pathname.includes('/admin/campaigns')) return 'campaigns';
    if (pathname.includes('/admin/voice-usage') || pathname.includes('/admin/voice')) return 'voice-usage';
    if (pathname.includes('/admin/audit-logs') || pathname.includes('/admin/audit')) return 'audit-logs';
    if (pathname.includes('/admin/fraud') || pathname.includes('/admin/anomalies')) return 'fraud';
    if (pathname.includes('/admin/settings')) return 'settings';
    return 'overview';
  };

  const [activeTab, setActiveTab] = useState<TabKey>(() => getTabFromPath(location.pathname));
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);

  // Live state
  const [users, setUsers] = useState<AdminUser[]>(() => getAdminUsers());
  const [subscriptions, setSubscriptions] = useState<AdminSubscription[]>(() => getAdminSubscriptions());
  const [campaigns, setCampaigns] = useState<AdminCampaignMonitor[]>(() => getAdminCampaigns());
  const [voiceMetrics, setVoiceMetrics] = useState<VoiceUsageMetrics>(initialVoiceUsageMetrics);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => getAuditLogs());
  const [fraudAlerts, setFraudAlerts] = useState<FraudAnomalyAlert[]>(() => getFraudAlerts());
  const [platformConfig, setPlatformConfig] = useState<PlatformConfig>(() => getPlatformConfig());

  // Keep active tab in sync with URL
  useEffect(() => {
    const tab = getTabFromPath(location.pathname);
    setActiveTab(tab);
  }, [location.pathname]);

  const handleTabChange = (tab: string) => {
    const validTab = tab as TabKey;
    setActiveTab(validTab);
    if (validTab === 'overview') {
      navigate('/admin');
    } else {
      navigate(`/admin/${validTab}`);
    }
  };

  // Sync state listeners
  const refreshAllData = useCallback(() => {
    setIsRefreshing(true);
    setUsers(getAdminUsers());
    setSubscriptions(getAdminSubscriptions());
    setCampaigns(getAdminCampaigns());
    setAuditLogs(getAuditLogs());
    setFraudAlerts(getFraudAlerts());
    setPlatformConfig(getPlatformConfig());

    setTimeout(() => {
      setIsRefreshing(false);
      toast.success('Admin platform telemetry synchronized!');
    }, 500);
  }, []);

  useEffect(() => {
    const handleStorageUpdate = () => {
      setUsers(getAdminUsers());
      setSubscriptions(getAdminSubscriptions());
      setCampaigns(getAdminCampaigns());
      setAuditLogs(getAuditLogs());
      setFraudAlerts(getFraudAlerts());
      setPlatformConfig(getPlatformConfig());
    };

    window.addEventListener('vidur_admin_updated', handleStorageUpdate);
    window.addEventListener('storage', handleStorageUpdate);
    return () => {
      window.removeEventListener('vidur_admin_updated', handleStorageUpdate);
      window.removeEventListener('storage', handleStorageUpdate);
    };
  }, []);

  // Update handlers with persistence
  const handleUpdateUsers = (updated: AdminUser[]) => {
    setUsers(updated);
    saveAdminUsers(updated);
  };

  const handleUpdateSubscriptions = (updated: AdminSubscription[]) => {
    setSubscriptions(updated);
    saveAdminSubscriptions(updated);
  };

  const handleUpdateCampaigns = (updated: AdminCampaignMonitor[]) => {
    setCampaigns(updated);
    saveAdminCampaigns(updated);
  };

  const handleUpdateFraudAlerts = (updated: FraudAnomalyAlert[]) => {
    setFraudAlerts(updated);
    saveFraudAlerts(updated);
  };

  const handleSaveConfig = (updated: PlatformConfig) => {
    setPlatformConfig(updated);
    savePlatformConfig(updated);
  };

  const openFraudCount = fraudAlerts.filter((a) => a.status === 'open' || a.status === 'investigating').length;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col pb-16">
      {/* Header */}
      <AdminHeader
        activeTab={activeTab}
        onRefresh={refreshAllData}
        isRefreshing={isRefreshing}
        onOpenAddUser={() => setIsAddUserModalOpen(true)}
        onExportAudit={() => {
          handleTabChange('audit-logs');
          toast.info('Viewing audit logs. Click "Export CSV" to download the records.');
        }}
      />

      {/* Tabs Navigation */}
      <div className="bg-surface-0 border-b border-border-default px-6 py-2 overflow-x-auto">
        <div className="flex items-center gap-1 min-w-max">
          <button
            type="button"
            onClick={() => handleTabChange('overview')}
            className={`px-3 py-2 text-xs font-medium rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-surface-elevated text-foreground shadow-xs border border-border-default font-semibold'
                : 'text-foreground-tertiary hover:text-foreground'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Overview & Health</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('users')}
            className={`px-3 py-2 text-xs font-medium rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'users'
                ? 'bg-surface-elevated text-foreground shadow-xs border border-border-default font-semibold'
                : 'text-foreground-tertiary hover:text-foreground'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Users ({users.length})</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('subscriptions')}
            className={`px-3 py-2 text-xs font-medium rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'subscriptions'
                ? 'bg-surface-elevated text-foreground shadow-xs border border-border-default font-semibold'
                : 'text-foreground-tertiary hover:text-foreground'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Subscriptions & Billing ({subscriptions.length})</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('campaigns')}
            className={`px-3 py-2 text-xs font-medium rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'campaigns'
                ? 'bg-surface-elevated text-foreground shadow-xs border border-border-default font-semibold'
                : 'text-foreground-tertiary hover:text-foreground'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Campaign Monitoring</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('voice-usage')}
            className={`px-3 py-2 text-xs font-medium rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'voice-usage'
                ? 'bg-surface-elevated text-foreground shadow-xs border border-border-default font-semibold'
                : 'text-foreground-tertiary hover:text-foreground'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-blue-400" />
            <span>AI Voice Usage Telemetry</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('audit-logs')}
            className={`px-3 py-2 text-xs font-medium rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'audit-logs'
                ? 'bg-surface-elevated text-foreground shadow-xs border border-border-default font-semibold'
                : 'text-foreground-tertiary hover:text-foreground'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-purple-400" />
            <span>System Audit Logs</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('fraud')}
            className={`px-3 py-2 text-xs font-medium rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'fraud'
                ? 'bg-surface-elevated text-red-400 shadow-xs border border-border-default font-semibold'
                : 'text-foreground-tertiary hover:text-foreground'
            }`}
          >
            <AlertTriangle className={`w-3.5 h-3.5 ${openFraudCount > 0 ? 'text-signal-urgent animate-pulse' : 'text-foreground-tertiary'}`} />
            <span>Fraud & Anomaly Shield</span>
            {openFraudCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-red-500/20 text-red-400 border border-red-500/30 font-bold">
                {openFraudCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('settings')}
            className={`px-3 py-2 text-xs font-medium rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-surface-elevated text-foreground shadow-xs border border-border-default font-semibold'
                : 'text-foreground-tertiary hover:text-foreground'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Platform Settings</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'overview' && (
          <AdminOverviewTab
            users={users}
            subscriptions={subscriptions}
            campaigns={campaigns}
            voiceMetrics={voiceMetrics}
            fraudAlerts={fraudAlerts}
            recentLogs={auditLogs}
            onNavigateTab={handleTabChange}
          />
        )}

        {activeTab === 'users' && (
          <AdminUsersTab
            users={users}
            onUpdateUsers={handleUpdateUsers}
            isAddModalOpen={isAddUserModalOpen}
            setIsAddModalOpen={setIsAddUserModalOpen}
          />
        )}

        {activeTab === 'subscriptions' && (
          <AdminSubscriptionsTab
            subscriptions={subscriptions}
            onUpdateSubscriptions={handleUpdateSubscriptions}
          />
        )}

        {activeTab === 'campaigns' && (
          <AdminCampaignsTab
            campaigns={campaigns}
            onUpdateCampaigns={handleUpdateCampaigns}
          />
        )}

        {activeTab === 'voice-usage' && (
          <AdminVoiceUsageTab
            metrics={voiceMetrics}
          />
        )}

        {activeTab === 'audit-logs' && (
          <AdminAuditLogsTab
            logs={auditLogs}
          />
        )}

        {activeTab === 'fraud' && (
          <AdminFraudTab
            alerts={fraudAlerts}
            onUpdateAlerts={handleUpdateFraudAlerts}
          />
        )}

        {activeTab === 'settings' && (
          <AdminSettingsTab
            config={platformConfig}
            onSaveConfig={handleSaveConfig}
          />
        )}
      </main>
    </div>
  );
};
