export interface UserProfile {
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
}

export interface Workspace {
  id: string;
  name: string;
  type: string;
  plan: string;
  isCurrent?: boolean;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  type: 'signal' | 'call' | 'followup' | 'campaign';
  targetPath: string;
}

export type AIActivityState =
  | 'idle'
  | 'analyzing'
  | 'discovering'
  | 'processing-call'
  | 'preparing-followup';

export interface CommandItem {
  id: string;
  title: string;
  subtitle?: string;
  category: 'Actions' | 'Opportunities' | 'Cadences' | 'Navigation';
  path?: string;
  shortcut?: string;
  actionKey?: string;
  intentScore?: number;
}

export const mockUser: UserProfile = {
  name: 'Neel Agrawal',
  email: 'neel@acmetech.io',
  role: 'Sales Operations Admin',
};

export const mockWorkspaces: Workspace[] = [
  { id: 'ws-1', name: 'Acme Technologies India', type: 'Sales Workspace', plan: 'Enterprise OS', isCurrent: true },
  { id: 'ws-2', name: 'Growth Labs India', type: 'Outbound Operations', plan: 'Pro Agent' },
  { id: 'ws-3', name: 'Enterprise APAC', type: 'Expansion Division', plan: 'Enterprise OS' },
];

export const mockNotifications: NotificationItem[] = [
  {
    id: 'notif-1',
    title: '3 High-Intent Leads Discovered',
    message: 'Public hiring and cloud infrastructure expansion detected for Enterprise SaaS prospects.',
    timestamp: '10m ago',
    isRead: false,
    type: 'signal',
    targetPath: '/leads/discover',
  },
  {
    id: 'notif-2',
    title: 'AI Call Completed',
    message: 'Agent concluded 4m conversation with Rajesh Sharma (VP Ops). Qualified for Q4 procurement.',
    timestamp: '25m ago',
    isRead: false,
    type: 'call',
    targetPath: '/calls/call-101',
  },
  {
    id: 'notif-3',
    title: 'Follow-Up Due in 30 Minutes',
    message: 'Scheduled automated touchpoint reminder for Razorpay opportunity lead.',
    timestamp: '1h ago',
    isRead: false,
    type: 'followup',
    targetPath: '/follow-ups',
  },
  {
    id: 'notif-4',
    title: 'Campaign Completed',
    message: 'Autonomous Q4 Outreach reached 85% qualification target across 140 outbound targets.',
    timestamp: '2h ago',
    isRead: true,
    type: 'campaign',
    targetPath: '/campaigns/cmp-201',
  },
  {
    id: 'notif-5',
    title: 'New Buying Signal Detected',
    message: 'Delhivery registered Series-B expansion trigger (₹180 Cr) with CRM migration flag.',
    timestamp: '4h ago',
    isRead: true,
    type: 'signal',
    targetPath: '/leads/opp-103',
  },
];

export const mockCommandItems: CommandItem[] = [
  // Quick Actions
  { id: 'cmd-act-1', title: 'Start Lead Discovery', subtitle: 'Scan web feeds and job triggers', category: 'Actions', path: '/leads/discover', shortcut: '⌘D' },
  { id: 'cmd-act-2', title: 'Create Campaign Cadence', subtitle: 'Launch autonomous multi-touch workflow', category: 'Actions', path: '/campaigns', shortcut: '⌘N' },
  { id: 'cmd-act-3', title: 'Start AI Voice Call', subtitle: 'Dispatch autonomous voice agent', category: 'Actions', path: '/calls' },
  { id: 'cmd-act-4', title: 'View Keyboard Shortcuts', subtitle: 'Speed up your sales workflow', category: 'Actions', actionKey: 'shortcuts', shortcut: '?' },

  // Opportunities / Accounts
  { id: 'cmd-opp-1', title: 'Razorpay Software', subtitle: 'Head of Sales Ops hired (48h ago)', category: 'Opportunities', path: '/leads/opp-101', intentScore: 94 },
  { id: 'cmd-opp-2', title: 'Freshworks India', subtitle: 'Outbound pipeline expansion signal', category: 'Opportunities', path: '/leads/opp-102', intentScore: 91 },
  { id: 'cmd-opp-3', title: 'Delhivery Logistics', subtitle: 'Series-B ₹180 Cr funding announced', category: 'Opportunities', path: '/leads/opp-103', intentScore: 88 },
  { id: 'cmd-opp-4', title: 'PharmEasy Healthcare', subtitle: 'Migrating legacy CRM platform', category: 'Opportunities', path: '/leads/opp-104', intentScore: 84 },

  // Cadences
  { id: 'cmd-cad-1', title: 'Q4 SaaS Outreach Cadence', subtitle: '85% Qualification rate · 140 Accounts', category: 'Cadences', path: '/campaigns/cmp-201' },
  { id: 'cmd-cad-2', title: 'Mid-Market VP Sales Outreach', subtitle: 'Multi-channel voice + email sequence', category: 'Cadences', path: '/campaigns/cmp-202' },

  // Navigation
  { id: 'cmd-nav-1', title: 'Open Dashboard', subtitle: 'High-signal priority opportunity queue', category: 'Navigation', path: '/dashboard', shortcut: 'B' },
  { id: 'cmd-nav-2', title: 'Search All Leads (Opportunities)', subtitle: '38 active pipeline opportunities', category: 'Navigation', path: '/leads', shortcut: 'L' },
  { id: 'cmd-nav-3', title: 'View Outreach Campaigns', subtitle: '4 active autonomous cadences', category: 'Navigation', path: '/campaigns', shortcut: 'C' },
  { id: 'cmd-nav-4', title: 'AI Voice Calling Hub', subtitle: 'Live dialer & qualification brief', category: 'Navigation', path: '/calls' },
  { id: 'cmd-nav-5', title: 'Pending Follow-ups Queue', subtitle: '12 scheduled touchpoints', category: 'Navigation', path: '/follow-ups', shortcut: 'F' },
  { id: 'cmd-nav-6', title: 'Pipeline Analytics', subtitle: 'Conversion funnels & intent metrics', category: 'Navigation', path: '/analytics' },
  { id: 'cmd-nav-7', title: 'Business Profile & ICP Matrix', subtitle: 'Target profile & competitive intel', category: 'Navigation', path: '/business' },
  { id: 'cmd-nav-8', title: 'Workspace Settings', subtitle: 'Team, subscription & security controls', category: 'Navigation', path: '/settings' },
  { id: 'cmd-nav-9', title: 'Admin Governance Portal', subtitle: 'Global user management & audit logs', category: 'Navigation', path: '/admin' },
];
