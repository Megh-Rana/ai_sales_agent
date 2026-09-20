export type AdminRole = 'Super Admin' | 'Platform Admin' | 'Sales Ops Lead' | 'Enterprise SDR' | 'Compliance Officer';

export type UserStatus = 'active' | 'suspended' | 'invited' | 'pending_verification';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  status: UserStatus;
  avatarUrl?: string;
  companyName: string;
  lastActive: string;
  twoFactorEnabled: boolean;
  voiceMinutesUsed: number;
  assignedWorkspaces: string[];
  createdAt: string;
}

export type SubscriptionTier = 'Enterprise AI Scale' | 'Growth Professional' | 'Starter Pilot';
export type SubscriptionStatus = 'active' | 'past_due' | 'trialing' | 'canceled';

export interface AdminSubscription {
  id: string;
  workspaceName: string;
  companyDomain: string;
  planTier: SubscriptionTier;
  status: SubscriptionStatus;
  billingInterval: 'monthly' | 'annual';
  amount: number;
  currency: 'INR' | 'USD';
  currentPeriodEnd: string;
  voiceMinutesQuota: number;
  voiceMinutesUsed: number;
  leadSearchQuota: number;
  leadSearchUsed: number;
  paymentMethod: {
    type: 'card' | 'bank_transfer' | 'upi';
    last4: string;
    brand?: string;
  };
  invoicesCount: number;
}

export type CampaignHealth = 'optimal' | 'warning' | 'throttled' | 'paused';

export interface AdminCampaignMonitor {
  id: string;
  name: string;
  ownerCompany: string;
  ownerEmail: string;
  type: 'AI Voice Outreach' | 'Multichannel Follow-up' | 'Intent Inbound Response';
  status: 'active' | 'paused' | 'completed' | 'draft';
  healthStatus: CampaignHealth;
  targetLeads: number;
  completedCalls: number;
  connectedRate: number; // percentage e.g. 78.4%
  meetingBookingRate: number; // percentage e.g. 18.2%
  concurrentVoiceWorkers: number;
  avgCallDurationSec: number;
  startedAt: string;
}

export interface VoiceEngineHealth {
  name: string;
  type: 'STT' | 'LLM' | 'TTS' | 'SIP Telephony';
  provider: string;
  status: 'healthy' | 'degraded' | 'offline';
  latencyMs: number;
  uptime99: number;
  activeWorkers: number;
}

export interface VoiceUsageMetrics {
  totalVoiceMinutesMonth: number;
  activeLiveCalls: number;
  avgLatencyMs: number;
  costPerCallINR: number;
  totalCallsToday: number;
  engines: VoiceEngineHealth[];
  hourlyUsage: Array<{ hour: string; minutes: number; concurrentCalls: number }>;
}

export type AuditSeverity = 'critical' | 'warning' | 'info';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorName: string;
  actorEmail: string;
  actorRole: string;
  action: string;
  resource: string;
  details: string;
  severity: AuditSeverity;
  ipAddress: string;
  userAgent?: string;
}

export type AnomalySeverity = 'critical' | 'high' | 'medium' | 'low';
export type AnomalyStatus = 'open' | 'investigating' | 'mitigated' | 'resolved';

export interface FraudAnomalyAlert {
  id: string;
  timestamp: string;
  type: 'Rapid Redialing Spike' | 'Credential Stuffing Attempt' | 'Unusual API Scrape Rate' | 'Abnormal Call Abandonment' | 'Payment Verification Failure';
  severity: AnomalySeverity;
  status: AnomalyStatus;
  description: string;
  triggerValue: string;
  threshold: string;
  affectedEntity: string;
  recommendedAction: string;
}

export interface PlatformConfig {
  activeLlmModel: string;
  gpuOffloadEnabled: boolean;
  gpuLayers: number;
  whisperGpuWarm: boolean;
  maxConcurrentCallsGlobal: number;
  sarvamSttTimeoutSeconds: number;
  autoFraudShieldActive: boolean;
  auditRetentionDays: number;
  leadQualityThreshold: number;
}
