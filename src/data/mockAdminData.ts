import {
  AdminUser,
  AdminSubscription,
  AdminCampaignMonitor,
  VoiceUsageMetrics,
  AuditLogEntry,
  FraudAnomalyAlert,
  PlatformConfig
} from '../types/admin';

// ── Initial Mock Users ──────────────────────────────────────────────
export const initialAdminUsers: AdminUser[] = [
  {
    id: 'usr-1',
    name: 'Megh Rana',
    email: 'megh@vidur.ai',
    role: 'Super Admin',
    status: 'active',
    companyName: 'Vidur AI Core',
    lastActive: 'Just now',
    twoFactorEnabled: true,
    voiceMinutesUsed: 1420,
    assignedWorkspaces: ['Vidur Core', 'Enterprise Sales', 'Partner Networks'],
    createdAt: '2025-11-12'
  },
  {
    id: 'usr-2',
    name: 'Sarah Jenkins',
    email: 'sarah.j@cloudpoint.io',
    role: 'Platform Admin',
    status: 'active',
    companyName: 'CloudPoint Technologies',
    lastActive: '12 minutes ago',
    twoFactorEnabled: true,
    voiceMinutesUsed: 890,
    assignedWorkspaces: ['CloudPoint IT', 'EMEA Outreach'],
    createdAt: '2026-01-08'
  },
  {
    id: 'usr-3',
    name: 'Rohan Deshmukh',
    email: 'rohan@amritdairy.com',
    role: 'Sales Ops Lead',
    status: 'active',
    companyName: 'Amrit Dairy Foods Ltd',
    lastActive: '3 hours ago',
    twoFactorEnabled: true,
    voiceMinutesUsed: 620,
    assignedWorkspaces: ['Dairy Supply West', 'Gujarat HoReCa'],
    createdAt: '2026-02-14'
  },
  {
    id: 'usr-4',
    name: 'Vikram Mehta',
    email: 'vikram.m@apexlogistics.in',
    role: 'Enterprise SDR',
    status: 'active',
    companyName: 'Apex Logistics & Freight',
    lastActive: 'Yesterday',
    twoFactorEnabled: false,
    voiceMinutesUsed: 410,
    assignedWorkspaces: ['Domestic Freight'],
    createdAt: '2026-03-01'
  },
  {
    id: 'usr-5',
    name: 'Ananya Iyer',
    email: 'ananya@fintechsecure.org',
    role: 'Compliance Officer',
    status: 'active',
    companyName: 'Fintech Secure Solutions',
    lastActive: '5 hours ago',
    twoFactorEnabled: true,
    voiceMinutesUsed: 95,
    assignedWorkspaces: ['Compliance Audit'],
    createdAt: '2026-02-20'
  },
  {
    id: 'usr-6',
    name: 'Devin Thorne',
    email: 'devin@globalreach.co',
    role: 'Enterprise SDR',
    status: 'suspended',
    companyName: 'GlobalReach Ventures',
    lastActive: '6 days ago',
    twoFactorEnabled: false,
    voiceMinutesUsed: 310,
    assignedWorkspaces: ['US Expansion'],
    createdAt: '2026-01-29'
  }
];

// ── Initial Subscriptions & Billing ────────────────────────────────
export const initialAdminSubscriptions: AdminSubscription[] = [
  {
    id: 'sub-101',
    workspaceName: 'CloudPoint Technologies',
    companyDomain: 'cloudpoint.io',
    planTier: 'Enterprise AI Scale',
    status: 'active',
    billingInterval: 'annual',
    amount: 145000,
    currency: 'INR',
    currentPeriodEnd: '2026-12-31',
    voiceMinutesQuota: 10000,
    voiceMinutesUsed: 4820,
    leadSearchQuota: 5000,
    leadSearchUsed: 3120,
    paymentMethod: { type: 'card', last4: '4242', brand: 'Visa' },
    invoicesCount: 12
  },
  {
    id: 'sub-102',
    workspaceName: 'Amrit Dairy Foods Ltd',
    companyDomain: 'amritdairy.com',
    planTier: 'Growth Professional',
    status: 'active',
    billingInterval: 'monthly',
    amount: 28000,
    currency: 'INR',
    currentPeriodEnd: '2026-10-15',
    voiceMinutesQuota: 3000,
    voiceMinutesUsed: 2150,
    leadSearchQuota: 1500,
    leadSearchUsed: 1240,
    paymentMethod: { type: 'upi', last4: '9820' },
    invoicesCount: 6
  },
  {
    id: 'sub-103',
    workspaceName: 'Apex Logistics & Freight',
    companyDomain: 'apexlogistics.in',
    planTier: 'Growth Professional',
    status: 'active',
    billingInterval: 'monthly',
    amount: 28000,
    currency: 'INR',
    currentPeriodEnd: '2026-10-02',
    voiceMinutesQuota: 3000,
    voiceMinutesUsed: 2890,
    leadSearchQuota: 1500,
    leadSearchUsed: 1480,
    paymentMethod: { type: 'card', last4: '8821', brand: 'Mastercard' },
    invoicesCount: 4
  },
  {
    id: 'sub-104',
    workspaceName: 'Nexus BioHealth Labs',
    companyDomain: 'nexusbio.in',
    planTier: 'Starter Pilot',
    status: 'trialing',
    billingInterval: 'monthly',
    amount: 9500,
    currency: 'INR',
    currentPeriodEnd: '2026-09-28',
    voiceMinutesQuota: 600,
    voiceMinutesUsed: 340,
    leadSearchQuota: 300,
    leadSearchUsed: 190,
    paymentMethod: { type: 'card', last4: '1092', brand: 'Visa' },
    invoicesCount: 1
  },
  {
    id: 'sub-105',
    workspaceName: 'GlobalReach Ventures',
    companyDomain: 'globalreach.co',
    planTier: 'Enterprise AI Scale',
    status: 'past_due',
    billingInterval: 'annual',
    amount: 145000,
    currency: 'INR',
    currentPeriodEnd: '2026-09-18',
    voiceMinutesQuota: 10000,
    voiceMinutesUsed: 9200,
    leadSearchQuota: 5000,
    leadSearchUsed: 4900,
    paymentMethod: { type: 'card', last4: '0019', brand: 'Amex' },
    invoicesCount: 8
  }
];

// ── Initial Campaign Monitors ──────────────────────────────────────
export const initialAdminCampaigns: AdminCampaignMonitor[] = [
  {
    id: 'cmp-1',
    name: 'SharePoint Implementation Outreach Q3',
    ownerCompany: 'CloudPoint Technologies',
    ownerEmail: 'sarah.j@cloudpoint.io',
    type: 'AI Voice Outreach',
    status: 'active',
    healthStatus: 'optimal',
    targetLeads: 450,
    completedCalls: 312,
    connectedRate: 81.4,
    meetingBookingRate: 21.5,
    concurrentVoiceWorkers: 4,
    avgCallDurationSec: 134,
    startedAt: '3 days ago'
  },
  {
    id: 'cmp-2',
    name: 'HoReCa Bulk Milk Supply Procurement',
    ownerCompany: 'Amrit Dairy Foods Ltd',
    ownerEmail: 'rohan@amritdairy.com',
    type: 'AI Voice Outreach',
    status: 'active',
    healthStatus: 'optimal',
    targetLeads: 280,
    completedCalls: 198,
    connectedRate: 76.2,
    meetingBookingRate: 17.8,
    concurrentVoiceWorkers: 2,
    avgCallDurationSec: 112,
    startedAt: '5 days ago'
  },
  {
    id: 'cmp-3',
    name: 'Cold Storage Freight Logistics Re-engagement',
    ownerCompany: 'Apex Logistics & Freight',
    ownerEmail: 'vikram.m@apexlogistics.in',
    type: 'Multichannel Follow-up',
    status: 'active',
    healthStatus: 'warning',
    targetLeads: 520,
    completedCalls: 460,
    connectedRate: 64.1,
    meetingBookingRate: 9.4,
    concurrentVoiceWorkers: 3,
    avgCallDurationSec: 88,
    startedAt: '1 week ago'
  },
  {
    id: 'cmp-4',
    name: 'Healthcare Compliance Discovery Pilot',
    ownerCompany: 'Nexus BioHealth Labs',
    ownerEmail: 'contact@nexusbio.in',
    type: 'Intent Inbound Response',
    status: 'paused',
    healthStatus: 'throttled',
    targetLeads: 150,
    completedCalls: 45,
    connectedRate: 71.0,
    meetingBookingRate: 14.2,
    concurrentVoiceWorkers: 1,
    avgCallDurationSec: 145,
    startedAt: '2 days ago'
  }
];

// ── Voice Usage & Engine Telemetry ─────────────────────────────────
export const initialVoiceUsageMetrics: VoiceUsageMetrics = {
  totalVoiceMinutesMonth: 18450,
  activeLiveCalls: 3,
  avgLatencyMs: 245,
  costPerCallINR: 1.85,
  totalCallsToday: 412,
  engines: [
    {
      name: 'Sarvam AI Primary STT',
      type: 'STT',
      provider: 'Sarvam Cloud (Indian Accents)',
      status: 'healthy',
      latencyMs: 140,
      uptime99: 99.94,
      activeWorkers: 8
    },
    {
      name: 'Faster-Whisper GPU Fallback',
      type: 'STT',
      provider: 'Local RTX 5050 (CUDA float16)',
      status: 'healthy',
      latencyMs: 120,
      uptime99: 100.0,
      activeWorkers: 4
    },
    {
      name: 'Ollama Gemma-3 (4B-IT GPU)',
      type: 'LLM',
      provider: 'Local Ollama Core (99 GPU layers)',
      status: 'healthy',
      latencyMs: 16,
      uptime99: 100.0,
      activeWorkers: 6
    },
    {
      name: 'Kokoro TTS Fast Streamer',
      type: 'TTS',
      provider: 'Local PyTorch Synth',
      status: 'healthy',
      latencyMs: 95,
      uptime99: 99.98,
      activeWorkers: 8
    },
    {
      name: 'SIP Telephony Gateway',
      type: 'SIP Telephony',
      provider: 'Twilio / Exotel Enterprise SIP',
      status: 'healthy',
      latencyMs: 42,
      uptime99: 99.91,
      activeWorkers: 12
    }
  ],
  hourlyUsage: [
    { hour: '06:00', minutes: 12, concurrentCalls: 1 },
    { hour: '08:00', minutes: 45, concurrentCalls: 3 },
    { hour: '10:00', minutes: 110, concurrentCalls: 7 },
    { hour: '12:00', minutes: 140, concurrentCalls: 9 },
    { hour: '14:00', minutes: 165, concurrentCalls: 11 },
    { hour: '16:00', minutes: 130, concurrentCalls: 8 },
    { hour: '18:00', minutes: 85, concurrentCalls: 4 },
    { hour: '20:00', minutes: 30, concurrentCalls: 2 }
  ]
};

// ── Initial Audit Logs ─────────────────────────────────────────────
export const initialAuditLogs: AuditLogEntry[] = [
  {
    id: 'log-901',
    timestamp: '2026-09-20 11:05:14',
    actorName: 'Megh Rana',
    actorEmail: 'megh@vidur.ai',
    actorRole: 'Super Admin',
    action: 'PLATFORM_GPU_OFFLOAD_UPDATED',
    resource: 'backend/config.py',
    details: 'Configured OLLAMA_NUM_GPU=99 and pre-warmed faster-whisper on CUDA.',
    severity: 'info',
    ipAddress: '103.21.144.10'
  },
  {
    id: 'log-902',
    timestamp: '2026-09-20 10:48:22',
    actorName: 'Sarah Jenkins',
    actorEmail: 'sarah.j@cloudpoint.io',
    actorRole: 'Platform Admin',
    action: 'LEADS_CSV_IMPORTED',
    resource: 'Discovery / Calling Queue',
    details: 'Imported 48 commercial prospects from enterprise CSV spreadsheet.',
    severity: 'info',
    ipAddress: '157.48.201.55'
  },
  {
    id: 'log-903',
    timestamp: '2026-09-20 09:14:02',
    actorName: 'System Fraud Shield',
    actorEmail: 'security@vidur.ai',
    actorRole: 'Security Automated Bot',
    action: 'RATE_LIMIT_TRIGGERED',
    resource: 'Telephony Outbound Gateway',
    details: 'Workspace GlobalReach Ventures triggered rapid redial frequency cap.',
    severity: 'warning',
    ipAddress: '198.51.100.44'
  },
  {
    id: 'log-904',
    timestamp: '2026-09-20 08:30:19',
    actorName: 'Rohan Deshmukh',
    actorEmail: 'rohan@amritdairy.com',
    actorRole: 'Sales Ops Lead',
    action: 'CAMPAIGN_WORKERS_SCALED',
    resource: 'Campaign cmp-2',
    details: 'Increased concurrent voice agent workers from 1 to 2.',
    severity: 'info',
    ipAddress: '115.112.89.21'
  },
  {
    id: 'log-905',
    timestamp: '2026-09-19 23:42:10',
    actorName: 'System Auth Guard',
    actorEmail: 'auth-daemon@vidur.ai',
    actorRole: 'Security Daemon',
    action: 'SUSPICIOUS_LOGIN_BLOCKED',
    resource: 'User usr-6 (Devin Thorne)',
    details: '5 failed login attempts from unfamiliar IP in Eastern Europe.',
    severity: 'critical',
    ipAddress: '91.200.12.89'
  }
];

// ── Initial Fraud / Anomaly Alerts ────────────────────────────────
export const initialFraudAlerts: FraudAnomalyAlert[] = [
  {
    id: 'anom-1',
    timestamp: 'Today, 09:14 AM',
    type: 'Rapid Redialing Spike',
    severity: 'high',
    status: 'investigating',
    description: 'Workspace GlobalReach Ventures executed 65 call attempts within 3 minutes on unverified contacts.',
    triggerValue: '21 calls/min',
    threshold: '10 calls/min',
    affectedEntity: 'GlobalReach Ventures (sub-105)',
    recommendedAction: 'Throttle concurrent voice lines to 1 and require captcha verification.'
  },
  {
    id: 'anom-2',
    timestamp: 'Yesterday, 11:42 PM',
    type: 'Credential Stuffing Attempt',
    severity: 'critical',
    status: 'mitigated',
    description: 'Multiple automated login attempts detected against devin@globalreach.co across 14 VPN exit nodes.',
    triggerValue: '5 failed / 10s',
    threshold: '3 failed / min',
    affectedEntity: 'usr-6 (devin@globalreach.co)',
    recommendedAction: 'User suspended automatically and 2FA reset dispatched.'
  },
  {
    id: 'anom-3',
    timestamp: '2 days ago',
    type: 'Abnormal Call Abandonment',
    severity: 'medium',
    status: 'resolved',
    description: 'Cold Storage Freight campaign observed 38% user drop within first 2 seconds due to caller ID reputation.',
    triggerValue: '38% drop rate',
    threshold: '15% drop rate',
    affectedEntity: 'Campaign cmp-3 (Apex Logistics)',
    recommendedAction: 'Rotated outbound DID numbers and enabled STIR/SHAKEN certified carrier attestation.'
  }
];

// ── Initial Platform Config ────────────────────────────────────────
export const initialPlatformConfig: PlatformConfig = {
  activeLlmModel: 'gemma3:4b (Local RTX 5050 CUDA Offload)',
  gpuOffloadEnabled: true,
  gpuLayers: 99,
  whisperGpuWarm: true,
  maxConcurrentCallsGlobal: 24,
  sarvamSttTimeoutSeconds: 4.5,
  autoFraudShieldActive: true,
  auditRetentionDays: 90,
  leadQualityThreshold: 70
};

// ── LocalStorage Keys ──────────────────────────────────────────────
const USERS_KEY = 'vidur_admin_users';
const SUBS_KEY = 'vidur_admin_subscriptions';
const CAMPAIGNS_KEY = 'vidur_admin_campaigns';
const AUDIT_KEY = 'vidur_admin_audit_logs';
const FRAUD_KEY = 'vidur_admin_fraud_alerts';
const CONFIG_KEY = 'vidur_admin_platform_config';

// ── Helper Getters & Mutators ──────────────────────────────────────
export function getAdminUsers(): AdminUser[] {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(USERS_KEY) : null;
    return raw ? JSON.parse(raw) : initialAdminUsers;
  } catch {
    return initialAdminUsers;
  }
}

export function saveAdminUsers(users: AdminUser[]): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
      window.dispatchEvent(new CustomEvent('vidur_admin_updated'));
    }
  } catch {}
}

export function getAdminSubscriptions(): AdminSubscription[] {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(SUBS_KEY) : null;
    return raw ? JSON.parse(raw) : initialAdminSubscriptions;
  } catch {
    return initialAdminSubscriptions;
  }
}

export function saveAdminSubscriptions(subs: AdminSubscription[]): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(SUBS_KEY, JSON.stringify(subs));
      window.dispatchEvent(new CustomEvent('vidur_admin_updated'));
    }
  } catch {}
}

export function getAdminCampaigns(): AdminCampaignMonitor[] {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(CAMPAIGNS_KEY) : null;
    return raw ? JSON.parse(raw) : initialAdminCampaigns;
  } catch {
    return initialAdminCampaigns;
  }
}

export function saveAdminCampaigns(camps: AdminCampaignMonitor[]): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(CAMPAIGNS_KEY, JSON.stringify(camps));
      window.dispatchEvent(new CustomEvent('vidur_admin_updated'));
    }
  } catch {}
}

export function getAuditLogs(): AuditLogEntry[] {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(AUDIT_KEY) : null;
    return raw ? JSON.parse(raw) : initialAuditLogs;
  } catch {
    return initialAuditLogs;
  }
}

export function appendAuditLog(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): void {
  const current = getAuditLogs();
  const newEntry: AuditLogEntry = {
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
    ...entry
  };
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(AUDIT_KEY, JSON.stringify([newEntry, ...current]));
      window.dispatchEvent(new CustomEvent('vidur_admin_updated'));
    }
  } catch {}
}

export function getFraudAlerts(): FraudAnomalyAlert[] {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(FRAUD_KEY) : null;
    return raw ? JSON.parse(raw) : initialFraudAlerts;
  } catch {
    return initialFraudAlerts;
  }
}

export function saveFraudAlerts(alerts: FraudAnomalyAlert[]): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(FRAUD_KEY, JSON.stringify(alerts));
      window.dispatchEvent(new CustomEvent('vidur_admin_updated'));
    }
  } catch {}
}

export function getPlatformConfig(): PlatformConfig {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(CONFIG_KEY) : null;
    return raw ? JSON.parse(raw) : initialPlatformConfig;
  } catch {
    return initialPlatformConfig;
  }
}

export function savePlatformConfig(config: PlatformConfig): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
      window.dispatchEvent(new CustomEvent('vidur_admin_updated'));
    }
  } catch {}
}
