import { Opportunity, BuyingSignal, ActivityItemData } from '../types/sales';

export interface NextBestActionData {
  opportunityId: string;
  companyName: string;
  industry: string;
  contactName: string;
  contactRole: string;
  intentScore: number;
  scoreDelta: number;
  urgentReason: string;
  suggestedOpeningHook: string;
  primaryActionLabel: string;
  primaryActionType: 'call' | 'demo' | 'email' | 'brief';
  signalPlatform: string;
  signalDiscoveredAt: string;
  estimatedValue: string;
}

export interface PipelineSnapshotMetric {
  id: string;
  label: string;
  value: string;
  trend: 'up' | 'down' | 'neutral';
  trendValue: string;
  context: string;
  isAccent?: boolean;
}

export interface SalesFunnelStage {
  id: string;
  name: string;
  count: number;
  conversionRate: string;
  value: string;
}

export interface AICallSnapshotData {
  id: string;
  opportunityId: string;
  companyName: string;
  contactName: string;
  contactRole: string;
  duration: string;
  completedAt: string;
  telephonyStatus: string;
  latencyMs: number;
  sentimentScore: number;
  qualificationStatus: 'QUALIFIED' | 'NEEDS_FOLLOW_UP' | 'DISQUALIFIED';
  qualificationCriteria: {
    budget: boolean;
    authority: boolean;
    need: boolean;
    timeline: boolean;
  };
  keyTakeaway: string;
  primaryObjection: string;
  recommendedNextStep: string;
}

export interface FollowUpItem {
  id: string;
  opportunityId: string;
  companyName: string;
  contactName: string;
  contactRole: string;
  actionType: 'call' | 'email' | 'linkedin';
  description: string;
  dueText: string;
  isUrgent: boolean;
  intentScore: number;
}

export interface DashboardData {
  workspace: {
    name: string;
    division: string;
    shiftBriefing: string;
  };
  metrics: PipelineSnapshotMetric[];
  nextBestAction: NextBestActionData;
  priorityOpportunities: Opportunity[];
  funnelStages: SalesFunnelStage[];
  recentAICall: AICallSnapshotData;
  urgentFollowUps: FollowUpItem[];
  recentActivities: ActivityItemData[];
}

export const mockDashboardData: DashboardData = {
  workspace: {
    name: 'Vidur Technologies',
    division: 'Enterprise Outbound',
    shiftBriefing: '4 high-intent signals detected in last 24h requiring action · 1 urgent follow-up due in <30m',
  },
  metrics: [
    {
      id: 'metric-signals',
      label: 'Active Buying Signals',
      value: '142',
      trend: 'up',
      trendValue: '+14% vs yesterday',
      context: 'Scanned across 42 B2B feeds',
      isAccent: false,
    },
    {
      id: 'metric-high-intent',
      label: 'High-Intent Opportunities',
      value: '18',
      trend: 'up',
      trendValue: '+3 new accounts',
      context: 'Score ≥ 80 threshold',
      isAccent: true,
    },
    {
      id: 'metric-ai-calls',
      label: 'AI Calls Dispatched',
      value: '28',
      trend: 'up',
      trendValue: '62% Qualified',
      context: 'Avg duration: 3.8 mins',
      isAccent: false,
    },
    {
      id: 'metric-pipeline-value',
      label: 'Active Pipeline Touched',
      value: '₹3.6 Cr',
      trend: 'up',
      trendValue: '4.2d avg cycle',
      context: 'Weighted opportunity value',
      isAccent: false,
    },
  ],
  nextBestAction: {
    opportunityId: 'opp-101',
    companyName: 'Razorpay',
    industry: 'Fintech · Payments Infrastructure',
    contactName: 'Priya Sharma',
    contactRole: 'VP Sales Operations',
    intentScore: 94,
    scoreDelta: 14,
    urgentReason: 'Hiring surge (5 outbound SDRs posted 48h ago) + legacy dialer contract renewal in 45 days.',
    suggestedOpeningHook: 'Noticed your team is scaling outbound headcount by 5 SDRs while evaluating modern sales automation...',
    primaryActionLabel: 'Dispatch AI Voice Call',
    primaryActionType: 'call',
    signalPlatform: 'LinkedIn Jobs & MCA Filings',
    signalDiscoveredAt: '38m ago',
    estimatedValue: '₹70 Lakh ARR',
  },
  priorityOpportunities: [
    {
      id: 'opp-101',
      companyName: 'Razorpay',
      companyDomain: 'razorpay.com',
      industry: 'Fintech · Payments Infrastructure',
      employeeCount: '2500+',
      location: 'Bengaluru, Karnataka',
      requirement: 'Deploying autonomous outbound calling cadences and CRM signal sync for 25-rep sales floor.',
      intentScore: 94,
      intentLevel: 'high',
      salesStatus: 'high-intent',
      callReady: true,
      estimatedValue: '₹70,00,000',
      contactName: 'Priya Sharma',
      contactRole: 'VP Sales Operations',
      lastTouchpoint: '42m ago',
      signalSource: {
        platform: 'LinkedIn Jobs',
        discoveredAt: '42m ago',
        originalRequirement: 'Job listing: Head of Sales Ops & 5 Outbound SDRs (Tech: Salesforce/AI)',
        sourceUrl: 'https://linkedin.com/jobs/view/94021',
      },
      buyingSignals: [
        {
          id: 'sig-101-1',
          type: 'Hiring Surge',
          description: 'Hiring 5 Outbound SDRs and 1 Sales Ops Lead within 48 hours.',
          timestamp: '42m ago',
          impactScore: 95,
        },
        {
          id: 'sig-101-2',
          type: 'Contract Renewal',
          description: 'Existing dialer contract expiring; evaluating alternatives.',
          timestamp: '2h ago',
          impactScore: 90,
        },
        {
          id: 'sig-101-3',
          type: 'High ICP Fit',
          description: '100% ICP match on employee count, revenue tier (₹200 Cr+), and outbound motion.',
          timestamp: '1d ago',
          impactScore: 94,
        },
      ],
    },
    {
      id: 'opp-102',
      companyName: 'Freshworks',
      companyDomain: 'freshworks.com',
      industry: 'SaaS · Customer Engagement',
      employeeCount: '5000+',
      location: 'Chennai, Tamil Nadu',
      requirement: 'Replacing legacy telephony infrastructure with autonomous voice agent integration.',
      intentScore: 91,
      intentLevel: 'high',
      salesStatus: 'qualified',
      callReady: true,
      estimatedValue: '₹90,00,000',
      contactName: 'Arjun Mehta',
      contactRole: 'Chief Technology Officer',
      lastTouchpoint: '1h ago',
      signalSource: {
        platform: 'BuiltWith & GitHub Feeds',
        discoveredAt: '1h ago',
        originalRequirement: 'Decommissioning legacy SIP trunk provider; seeking AI calling API with compliance.',
        sourceUrl: 'https://builtwith.com/freshworks.com',
      },
      buyingSignals: [
        {
          id: 'sig-102-1',
          type: 'Tech Migration',
          description: 'Removed legacy telephony tags from production DNS records.',
          timestamp: '1h ago',
          impactScore: 92,
        },
        {
          id: 'sig-102-2',
          type: 'Executive Trigger',
          description: 'CTO published inquiry evaluating automated voice qualification agents.',
          timestamp: '4h ago',
          impactScore: 89,
        },
      ],
    },
    {
      id: 'opp-106',
      companyName: 'Zerodha',
      companyDomain: 'zerodha.com',
      industry: 'Fintech · Brokerage & Capital Markets',
      employeeCount: '1500+',
      location: 'Bengaluru, Karnataka',
      requirement: 'Integrating low-latency AI voice agent with internal trading support APIs.',
      intentScore: 92,
      intentLevel: 'high',
      salesStatus: 'qualified',
      callReady: true,
      estimatedValue: '₹95,00,000',
      contactName: 'Naveen Kumar',
      contactRole: 'VP Product & Engineering',
      lastTouchpoint: '1h ago',
      signalSource: {
        platform: 'GitHub & MCA Tech Filings',
        discoveredAt: '1h ago',
        originalRequirement: 'Active engineering evaluation for high-throughput SIP voice automation.',
        sourceUrl: 'https://github.com/zerodhatech',
      },
      buyingSignals: [
        {
          id: 'sig-106-1',
          type: 'API Evaluation Surge',
          description: 'Sandbox API testing detected 40+ simulated voice interactions today.',
          timestamp: '1h ago',
          impactScore: 93,
        },
        {
          id: 'sig-106-2',
          type: 'Buying Intent',
          description: 'Technical diligence review completed on sub-50ms voice latency requirements.',
          timestamp: '3h ago',
          impactScore: 91,
        },
      ],
    },
    {
      id: 'opp-103',
      companyName: 'PharmEasy',
      companyDomain: 'pharmeasy.in',
      industry: 'HealthTech · D2C Pharma',
      employeeCount: '3000+',
      location: 'Mumbai, Maharashtra',
      requirement: 'Autonomous outbound outreach to pharmacy chain decision makers with compliance-grade dialing.',
      intentScore: 88,
      intentLevel: 'high',
      salesStatus: 'meeting',
      callReady: true,
      estimatedValue: '₹58,00,000',
      contactName: 'Dr. Kavita Iyer',
      contactRole: 'Chief Growth Officer',
      lastTouchpoint: '3h ago',
      signalSource: {
        platform: 'TechCrunch / MCA Filings',
        discoveredAt: '3h ago',
        originalRequirement: 'Series-D ₹200 Cr growth round closed; allocated for commercial GTM expansion.',
        sourceUrl: 'https://techcrunch.com/fundings/pharmeasy-d',
      },
      buyingSignals: [
        {
          id: 'sig-103-1',
          type: 'Growth Capital',
          description: 'Closed ₹200 Cr Series-D round earmarking expansion in pharmacy outbound.',
          timestamp: '3h ago',
          impactScore: 91,
        },
        {
          id: 'sig-103-2',
          type: 'Buyer Intent',
          description: 'Multiple visits from Mumbai IP to Vidur Security & Compliance page.',
          timestamp: '5h ago',
          impactScore: 85,
        },
      ],
    },
    {
      id: 'opp-107',
      companyName: 'Pine Labs',
      companyDomain: 'pinelabs.com',
      industry: 'Fintech · Point of Sale & Merchant Commerce',
      employeeCount: '4000+',
      location: 'Noida, Uttar Pradesh',
      requirement: 'Automating Tier-2 merchant onboarding calls with regional Indian language support.',
      intentScore: 86,
      intentLevel: 'high',
      salesStatus: 'follow-up',
      followUpDue: 'Due in 45 mins',
      followUpTask: 'Execute Cadence Step 2: Hindi/Tamil voice demo delivery to Merchant Ops',
      estimatedValue: '₹64,00,000',
      contactName: 'Sandeep Patel',
      contactRole: 'Head of Merchant Acquisition',
      lastTouchpoint: '3h ago',
      signalSource: {
        platform: 'Economic Times & Press Releases',
        discoveredAt: '3h ago',
        originalRequirement: 'Announced 100,000 merchant target; seeking automated voice qualification.',
        sourceUrl: 'https://economictimes.indiatimes.com/tech/pinelabs',
      },
      buyingSignals: [
        {
          id: 'sig-107-1',
          type: 'Expansion Catalyst',
          description: '100,000 merchant tier-2 retail expansion drive announced for Q4.',
          timestamp: '3h ago',
          impactScore: 88,
        },
      ],
    },
    {
      id: 'opp-104',
      companyName: 'Delhivery',
      companyDomain: 'delhivery.com',
      industry: 'Logistics · Supply Chain',
      employeeCount: '10000+',
      location: 'Gurugram, Haryana',
      requirement: 'Multi-touch outbound cadence automation across 4 regional distribution hubs.',
      intentScore: 84,
      intentLevel: 'high',
      salesStatus: 'follow-up',
      followUpDue: 'Due in 22 mins',
      followUpTask: 'Dispatch Touchpoint 3: Reference recent G2 category comparison and benchmarks',
      estimatedValue: '₹1,08,00,000',
      contactName: 'Rohan Kapoor',
      contactRole: 'Head of Enterprise Sales',
      lastTouchpoint: '5h ago',
      signalSource: {
        platform: 'G2 Buyer Intent',
        discoveredAt: '5h ago',
        originalRequirement: 'High-frequency comparison between Vidur and legacy cadence platforms.',
        sourceUrl: 'https://g2.com/buyer-intent/delhivery',
      },
      buyingSignals: [
        {
          id: 'sig-104-1',
          type: 'G2 Intent Surge',
          description: 'Tier-1 buyer intent score registered on outbound sales automation category.',
          timestamp: '5h ago',
          impactScore: 86,
        },
      ],
    },
    {
      id: 'opp-108',
      companyName: 'Meesho',
      companyDomain: 'meesho.com',
      industry: 'E-commerce · Social Commerce',
      employeeCount: '3500+',
      location: 'Bengaluru, Karnataka',
      requirement: 'Supplier re-activation outbound calling cadence with automated Hindi/English NLP.',
      intentScore: 82,
      intentLevel: 'high',
      salesStatus: 'follow-up',
      followUpDue: 'Due at 3:00 PM',
      followUpTask: 'Follow up with Growth Lead on pilot cadence conversion metrics',
      estimatedValue: '₹52,00,000',
      contactName: 'Ananya Roy',
      contactRole: 'Director of Growth',
      lastTouchpoint: '6h ago',
      signalSource: {
        platform: 'LinkedIn Signals',
        discoveredAt: '6h ago',
        originalRequirement: 'Supplier seller onboarding automation mandate announced.',
      },
      buyingSignals: [
        {
          id: 'sig-108-1',
          type: 'Supplier Surge',
          description: 'Added 50,000 new marketplace sellers; manual calling floor hitting capacity limits.',
          timestamp: '6h ago',
          impactScore: 84,
        },
      ],
    },
    {
      id: 'opp-105',
      companyName: 'Lenskart',
      companyDomain: 'lenskart.com',
      industry: 'D2C · Eyewear Retail',
      employeeCount: '5000+',
      location: 'New Delhi, Delhi',
      requirement: 'Modernizing franchise outbound calls with automated objection handling briefs.',
      intentScore: 78,
      intentLevel: 'medium',
      salesStatus: 'contacted',
      followUpDue: 'Due in 1h 15m',
      followUpTask: 'Send custom pitch brief focusing on franchise outbound objection scripts',
      estimatedValue: '₹82,00,000',
      contactName: 'Neha Gupta',
      contactRole: 'VP Business Development',
      lastTouchpoint: '1d ago',
      signalSource: {
        platform: 'News Wire · Press Release',
        discoveredAt: '1d ago',
        originalRequirement: 'Leadership change: Neha Gupta named VP BD with franchise expansion mandate.',
      },
      buyingSignals: [
        {
          id: 'sig-105-1',
          type: 'Executive Appointment',
          description: 'New VP appointed to restructure franchise outbound sales operations.',
          timestamp: '1d ago',
          impactScore: 80,
        },
      ],
    },
  ],
  funnelStages: [
    { id: 'fn-1', name: 'Signals Detected', count: 142, conversionRate: '100%', value: '₹21 Cr' },
    { id: 'fn-2', name: 'High-Intent Qualified', count: 38, conversionRate: '26.7%', value: '₹10.5 Cr' },
    { id: 'fn-3', name: 'AI Cadence Dispatched', count: 24, conversionRate: '63.1%', value: '₹6.9 Cr' },
    { id: 'fn-4', name: 'Meetings Booked', count: 11, conversionRate: '45.8%', value: '₹3.6 Cr' },
  ],
  recentAICall: {
    id: 'call-snap-razorpay',
    opportunityId: 'opp-101',
    companyName: 'Razorpay Software',
    contactName: 'Priya Sharma',
    contactRole: 'VP Sales Operations',
    duration: '2m 28s',
    completedAt: '14m ago',
    telephonyStatus: 'Completed (SIP 38ms)',
    latencyMs: 38,
    sentimentScore: 94,
    qualificationStatus: 'QUALIFIED',
    qualificationCriteria: {
      budget: true,
      authority: true,
      need: true,
      timeline: true,
    },
    keyTakeaway: 'Confirmed evaluation for 25-rep sales floor to solve manual logging delays. Demo scheduled for Thursday at 2:00 PM.',
    primaryObjection: 'Inquired on Tier-2 regional network latency and Salesforce bidirectional sync reliability.',
    recommendedNextStep: 'Send calendar invitation for Thursday 2:00 PM and Salesforce technical architecture memo.',
  },
  urgentFollowUps: [
    {
      id: 'fu-1',
      opportunityId: 'opp-104',
      companyName: 'Delhivery',
      contactName: 'Rohan Kapoor',
      contactRole: 'Head of Enterprise Sales',
      actionType: 'linkedin',
      description: 'Dispatch Touchpoint 3: Reference recent G2 category comparison and outbound agent benchmarks.',
      dueText: 'Due in 22 mins',
      isUrgent: true,
      intentScore: 84,
    },
    {
      id: 'fu-2',
      opportunityId: 'opp-105',
      companyName: 'Lenskart',
      contactName: 'Neha Gupta',
      contactRole: 'VP Business Dev',
      actionType: 'email',
      description: 'Send custom pitch brief focusing on franchise outbound objection scripts.',
      dueText: 'Due in 1h 15m',
      isUrgent: false,
      intentScore: 78,
    },
    {
      id: 'fu-3',
      opportunityId: 'opp-102',
      companyName: 'Freshworks',
      contactName: 'Arjun Mehta',
      contactRole: 'CTO',
      actionType: 'call',
      description: 'Follow-up call to review telephony SIP latency architecture & compliance docs.',
      dueText: 'Due in 3h 30m',
      isUrgent: false,
      intentScore: 91,
    },
    {
      id: 'fu-4',
      opportunityId: 'opp-101',
      companyName: 'Razorpay',
      contactName: 'Priya Sharma',
      contactRole: 'VP Sales Ops',
      actionType: 'email',
      description: 'Confirm 5 SDR onboarding trial parameters for next week.',
      dueText: 'Due at 4:30 PM',
      isUrgent: false,
      intentScore: 94,
    },
  ],
  recentActivities: [
    {
      id: 'act-1',
      timestamp: '18m ago',
      title: 'AI Voice Call Concluded · Qualified',
      description: 'Autonomous voice agent completed 3m 42s call with Dr. Kavita Iyer (PharmEasy). Demo meeting confirmed.',
      category: 'call',
      status: 'Qualified',
    },
    {
      id: 'act-2',
      timestamp: '42m ago',
      title: 'High-Intent Signal Detected',
      description: 'Razorpay posted 5 Outbound SDR positions; matched active dialer contract renewal flag.',
      category: 'signal',
      status: 'Score 94',
    },
    {
      id: 'act-3',
      timestamp: '1h ago',
      title: 'DNS Telemetry Enriched',
      description: 'Freshworks decommissioned legacy telephony DNS records; verified CTO LinkedIn activity.',
      category: 'enrichment',
      status: 'Enriched',
    },
    {
      id: 'act-4',
      timestamp: '2h ago',
      title: 'Buying Intent Surge Captured',
      description: 'Delhivery logged 4 repeat visits on G2 B2B Voice AI category matrix.',
      category: 'signal',
      status: 'High Intent',
    },
    {
      id: 'act-5',
      timestamp: '3h ago',
      title: 'Autonomous Cadence Triggered',
      description: 'Step 2 follow-up email dispatched to Neha Gupta (Lenskart) with personalized franchise brief.',
      category: 'status',
      status: 'Dispatched',
    },
  ],
};
