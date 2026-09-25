import { SalesOpportunity } from '../types/opportunities';

export const mockOpportunities: SalesOpportunity[] = [
  {
    id: 'opp-1',
    leadId: 'lead-1',
    companyName: 'Acme Technologies',
    companyDomain: 'acmetech.com',
    industry: 'Enterprise Software & Cloud',
    location: 'Bangalore, KA',
    contactName: 'Rahul Sharma',
    contactRole: 'VP of Engineering',
    contactPhone: '+918320441189',
    contactEmail: 'meghrana2007@gmail.com',
    phoneAvailable: true,

    intentScore: 94,
    estimatedValue: '₹18,50,000 / yr',
    priority: 'HIGH',
    type: 'BUYING_SIGNAL',
    state: 'action_required',
    isEmerging: false,

    whyNow: {
      headline: 'Asked about pricing after visiting product page multiple times today.',
      evidence: [
        'Prospect submitted pricing tier inquiry form 2 hours ago',
        'Visited enterprise pricing matrix 4 times in the past 6 hours',
        'Completed automated AI voice call with 88% qualification rating',
        'Intent score surged from 72 to 94 (+22 points today)'
      ],
      recencyLabel: '2 hours ago',
      timestamp: '2026-09-13T10:15:00Z',
    },

    signals: [
      {
        id: 'sig-101',
        title: 'Pricing Page Spike',
        category: 'High Intent',
        recency: '2 hours ago',
        impactScore: 95,
      },
      {
        id: 'sig-102',
        title: 'Positive Campaign Response',
        category: 'Outreach',
        recency: 'Today',
        impactScore: 90,
      },
      {
        id: 'sig-103',
        title: 'RFP Intent Detected',
        category: 'Market Signal',
        recency: 'Yesterday',
        impactScore: 88,
      },
    ],

    recommendedAction: {
      label: 'Call Rahul Today',
      actionType: 'call',
      route: '/calls/call-101',
      suggestedOpening: 'Hi Rahul, saw you were looking into our Enterprise SLA pricing tier. Wanted to offer a quick tailored walkthrough.',
    },

    nextBestAction: {
      headline: 'Schedule customized enterprise platform demonstration',
      recommendedTiming: 'Within 4 hours',
      targetAction: 'Schedule Demo',
    },

    campaignId: 'camp-1',
    campaignName: 'Q3 Enterprise AI Automation Outbound',
    followUpDate: 'Today',

    timeline: [
      {
        id: 'tl-1',
        timestamp: '2 hours ago',
        title: 'Pricing Inquiry Submitted',
        description: 'Rahul requested enterprise pricing details via public pricing calculator.',
        type: 'response',
      },
      {
        id: 'tl-2',
        timestamp: '3 hours ago',
        title: 'AI Qualification Call Completed',
        description: 'Voice bot confirmed 50+ rep sales team size and active budget cycle.',
        type: 'call',
      },
      {
        id: 'tl-3',
        timestamp: 'Yesterday',
        title: 'Intent Surge Triggered',
        description: '4 executives viewed product specs concurrently.',
        type: 'intent',
      },
    ],

    updatedAt: '2026-09-13T10:15:00Z',
  },

  {
    id: 'opp-2',
    leadId: 'lead-2',
    companyName: 'Apex Healthtech',
    companyDomain: 'apexhealth.io',
    industry: 'Healthcare & Telemedicine',
    location: 'Mumbai, MH',
    contactName: 'Priya Mehta',
    contactRole: 'Head of Operations',
    contactPhone: '+91 98200 11223',
    contactEmail: 'p.mehta@apexhealth.io',
    phoneAvailable: true,

    intentScore: 89,
    estimatedValue: '₹24,00,000 / yr',
    priority: 'HIGH',
    type: 'HOT_OPPORTUNITY',
    state: 'action_required',
    isEmerging: false,

    whyNow: {
      headline: 'Prospect replied positively to Follow-Up email asking for custom deployment quote.',
      evidence: [
        'Replied to outbound sequence step 2 with positive intent',
        'Requested HIPAA compliance specification document',
        'Follow-up schedule trigger marked as urgent due today'
      ],
      recencyLabel: '3 hours ago',
      timestamp: '2026-09-13T09:30:00Z',
    },

    signals: [
      {
        id: 'sig-201',
        title: 'Positive Response Received',
        category: 'Outreach',
        recency: '3 hours ago',
        impactScore: 92,
      },
      {
        id: 'sig-202',
        title: 'Security Whitepaper Download',
        category: 'Content',
        recency: 'Today',
        impactScore: 84,
      },
    ],

    recommendedAction: {
      label: 'Send Proposal & Specs',
      actionType: 'email',
      route: '/follow-ups/fu-201',
      suggestedOpening: 'Priya, attached is our custom healthcare deployment package and compliance overview.',
    },

    nextBestAction: {
      headline: 'Schedule security review call with CTO',
      recommendedTiming: 'By tomorrow 2 PM',
      targetAction: 'Schedule Call',
    },

    campaignId: 'camp-2',
    campaignName: 'Healthcare Tech Decision Makers',
    followUpDate: 'Today',

    timeline: [
      {
        id: 'tl-21',
        timestamp: '3 hours ago',
        title: 'Positive Email Reply',
        description: 'Priya requested HIPAA compliance breakdown and pricing schedule.',
        type: 'response',
      },
      {
        id: 'tl-22',
        timestamp: '1 day ago',
        title: 'Follow-Up Scheduled',
        description: 'Auto-sequence scheduled follow-up based on high email open rate.',
        type: 'followup',
      },
    ],

    updatedAt: '2026-09-13T09:30:00Z',
  },

  {
    id: 'opp-3',
    leadId: 'lead-3',
    companyName: 'Nexus Global Systems',
    companyDomain: 'nexusglobal.com',
    industry: 'Financial Technology',
    location: 'Hyderabad, TS',
    contactName: 'Vikram Verma',
    contactRole: 'Director of Business Development',
    contactPhone: '+91 97110 55443',
    contactEmail: 'v.verma@nexusglobal.com',
    phoneAvailable: true,

    intentScore: 86,
    estimatedValue: '₹32,00,000 / yr',
    priority: 'HIGH',
    type: 'FOLLOW_UP_DUE',
    state: 'action_required',
    isEmerging: false,

    whyNow: {
      headline: 'Overdue follow-up for high-intent lead after pitch call yesterday.',
      evidence: [
        'Completed 14-minute call yesterday with overall positive outcome',
        'Promised action item: Send competitor comparison matrix',
        'Follow-up due date was 9:00 AM today (overdue by 3 hours)'
      ],
      recencyLabel: 'Today',
      timestamp: '2026-09-13T08:00:00Z',
    },

    signals: [
      {
        id: 'sig-301',
        title: 'Follow-up Overdue',
        category: 'Workflow',
        recency: '3 hours ago',
        impactScore: 89,
      },
      {
        id: 'sig-302',
        title: 'High Qualification Rating',
        category: 'Call Outcome',
        recency: 'Yesterday',
        impactScore: 87,
      },
    ],

    recommendedAction: {
      label: 'Complete Follow-Up Action',
      actionType: 'followup',
      route: '/follow-ups/fu-301',
      suggestedOpening: 'Vikram, following up on our call yesterday with the benchmark report you requested.',
    },

    nextBestAction: {
      headline: 'Send benchmark report and propose closing call date',
      recommendedTiming: 'Immediate',
      targetAction: 'Send Email',
    },

    followUpDate: 'Today (Overdue)',

    timeline: [
      {
        id: 'tl-31',
        timestamp: 'Yesterday',
        title: 'Discovery Call Completed',
        description: 'Vikram confirmed interest in switching from existing legacy vendor.',
        type: 'call',
      },
      {
        id: 'tl-32',
        timestamp: '2 days ago',
        title: 'Demo Requested',
        description: 'Inbound lead form submitted on website.',
        type: 'intent',
      },
    ],

    updatedAt: '2026-09-13T08:00:00Z',
  },

  {
    id: 'opp-4',
    leadId: 'lead-4',
    companyName: 'Zenith Logistics',
    companyDomain: 'zenithlogistics.in',
    industry: 'Supply Chain & Freight',
    location: 'Gurugram, HR',
    contactName: 'Karan Patel',
    contactRole: 'VP Operations',
    contactPhone: '+91 99000 88776',
    contactEmail: 'karan@zenithlogistics.in',
    phoneAvailable: true,

    intentScore: 78,
    estimatedValue: '₹14,00,000 / yr',
    priority: 'MEDIUM',
    type: 'ENGAGEMENT_SPIKE',
    state: 'warming',
    isEmerging: true,

    whyNow: {
      headline: 'Engagement spike detected: 3 team members viewed product demo video today.',
      evidence: [
        'Multiple IP addresses from Zenith Logistics watched 80% of product demo',
        'LinkedIn page visits by 2 logistics managers in past 24 hours',
        'Intent score increased from 58 to 78 (+20 points)'
      ],
      recencyLabel: 'Today',
      timestamp: '2026-09-13T07:15:00Z',
    },

    signals: [
      {
        id: 'sig-401',
        title: 'Multi-user Video Engagement',
        category: 'Website Activity',
        recency: 'Today',
        impactScore: 79,
      },
      {
        id: 'sig-402',
        title: 'LinkedIn Company Profile Visit',
        category: 'Social Intent',
        recency: '1 day ago',
        impactScore: 72,
      },
    ],

    recommendedAction: {
      label: 'Add to Outreach Cadence',
      actionType: 'campaign',
      route: '/campaigns/camp-1',
      suggestedOpening: 'Karan, noticed your team exploring our logistics route automation module. Happy to share a quick case study.',
    },

    nextBestAction: {
      headline: 'Enroll in Operations Executive Outbound Sequence',
      recommendedTiming: 'Today',
      targetAction: 'Enroll Cadence',
    },

    campaignId: 'camp-1',
    campaignName: 'Supply Chain Automation Cadence',

    timeline: [
      {
        id: 'tl-41',
        timestamp: 'Today',
        title: 'Video Demo Views Recorded',
        description: '3 unique sessions logged on demo video page.',
        type: 'engagement',
      },
    ],

    updatedAt: '2026-09-13T07:15:00Z',
  },

  {
    id: 'opp-5',
    leadId: 'lead-5',
    companyName: 'CloudScale Infotech',
    companyDomain: 'cloudscale.co',
    industry: 'SaaS Infrastructure',
    location: 'Pune, MH',
    contactName: 'Ananya Iyer',
    contactRole: 'Chief Technology Officer',
    contactPhone: '+91 98450 33445',
    contactEmail: 'ananya@cloudscale.co',
    phoneAvailable: true,

    intentScore: 75,
    estimatedValue: '₹22,50,000 / yr',
    priority: 'MEDIUM',
    type: 'HIGH_INTENT',
    state: 'warming',
    isEmerging: true,

    whyNow: {
      headline: 'Hiring spike: Posted 6 new roles for DevOps & Sales Operations.',
      evidence: [
        'Public job posting signal detected on LinkedIn 1 day ago',
        'Matches Ideal Customer Profile criteria for scaling sales team',
        'Tech stack analysis confirms displacement opportunity for legacy CRM'
      ],
      recencyLabel: 'Yesterday',
      timestamp: '2026-09-12T16:45:00Z',
    },

    signals: [
      {
        id: 'sig-501',
        title: 'Hiring Intent Surge',
        category: 'Job Board Signal',
        recency: 'Yesterday',
        impactScore: 76,
      },
      {
        id: 'sig-502',
        title: 'Tech Stack Match',
        category: 'Enrichment',
        recency: '2 days ago',
        impactScore: 74,
      },
    ],

    recommendedAction: {
      label: 'View Lead Intelligence',
      actionType: 'lead',
      route: '/leads/lead-5',
      suggestedOpening: 'Ananya, congrats on expanding the engineering team! Our platform helps scale sales momentum automatically.',
    },

    nextBestAction: {
      headline: 'Initiate personalized multi-channel outreach',
      recommendedTiming: 'This week',
      targetAction: 'Start Outreach',
    },

    timeline: [
      {
        id: 'tl-51',
        timestamp: 'Yesterday',
        title: 'Job Board Signal Captured',
        description: 'Detected 6 new postings for Sales Ops and DevOps engineers.',
        type: 'intent',
      },
    ],

    updatedAt: '2026-09-12T16:45:00Z',
  },

  {
    id: 'opp-6',
    leadId: 'lead-6',
    companyName: 'FinServe Digital',
    companyDomain: 'finserve.in',
    industry: 'Banking & Financial Services',
    location: 'Delhi NCR',
    contactName: 'Rajesh Nambiar',
    contactRole: 'VP Digital Transformation',
    contactPhone: '+91 98112 99001',
    contactEmail: 'rnambiar@finserve.in',
    phoneAvailable: true,

    intentScore: 82,
    estimatedValue: '₹45,00,000 / yr',
    priority: 'HIGH',
    type: 'MEETING_OPPORTUNITY',
    state: 'action_required',
    isEmerging: false,

    whyNow: {
      headline: 'Meeting opportunity: Prospect requested calendar link during AI voice discovery call.',
      evidence: [
        'AI Voice Call bot successfully handled objection regarding security standards',
        'Prospect explicitly stated: "Send me your calendar for next Tuesday"',
        'High value account (₹45L annual potential)'
      ],
      recencyLabel: '4 hours ago',
      timestamp: '2026-09-13T08:30:00Z',
    },

    signals: [
      {
        id: 'sig-601',
        title: 'Calendar Request Recorded',
        category: 'Voice Qualification',
        recency: '4 hours ago',
        impactScore: 94,
      },
      {
        id: 'sig-602',
        title: 'High Value Enterprise Lead',
        category: 'ICP Fit',
        recency: 'Today',
        impactScore: 90,
      },
    ],

    recommendedAction: {
      label: 'Send Calendar Booking Link',
      actionType: 'message',
      route: '/calls/call-601/results',
      suggestedOpening: 'Rajesh, here is my calendar link to lock in our technical deep-dive for next Tuesday.',
    },

    nextBestAction: {
      headline: 'Send calendar invite and prepare executive brief',
      recommendedTiming: 'Within 2 hours',
      targetAction: 'Schedule Meeting',
    },

    timeline: [
      {
        id: 'tl-61',
        timestamp: '4 hours ago',
        title: 'AI Voice Call Outcome: Interested',
        description: 'Rajesh agreed to 30-min architecture review next week.',
        type: 'call',
      },
    ],

    updatedAt: '2026-09-13T08:30:00Z',
  },

  {
    id: 'opp-7',
    leadId: 'lead-7',
    companyName: 'OmniRetail India',
    companyDomain: 'omniretail.co.in',
    industry: 'E-commerce & Retail',
    location: 'Bengaluru, KA',
    contactName: 'Sanjay Dutt',
    contactRole: 'Chief Revenue Officer',
    contactPhone: '+91 97400 66778',
    contactEmail: 'sanjay@omniretail.co.in',
    phoneAvailable: true,

    intentScore: 71,
    estimatedValue: '₹16,00,000 / yr',
    priority: 'MEDIUM',
    type: 'RE_ENGAGEMENT',
    state: 'warming',
    isEmerging: true,

    whyNow: {
      headline: 'Dormant prospect re-engaged: Re-opened proposal document sent last month.',
      evidence: [
        'Document tracking alert: Proposal PDF opened 3 times today by CRO',
        'Dormant for 28 days after initial budget hold',
        'Re-engagement signal score: 71/100'
      ],
      recencyLabel: '5 hours ago',
      timestamp: '2026-09-13T07:00:00Z',
    },

    signals: [
      {
        id: 'sig-701',
        title: 'Proposal Views Re-activated',
        category: 'Document Intelligence',
        recency: '5 hours ago',
        impactScore: 78,
      },
    ],

    recommendedAction: {
      label: 'Send Re-engagement Check-in',
      actionType: 'email',
      route: '/leads/lead-7',
      suggestedOpening: 'Sanjay, hope Q3 is going well! Noticed you were revisiting our proposal and wanted to check if any questions came up.',
    },

    nextBestAction: {
      headline: 'Send friendly check-in email referencing updated Q4 promotion',
      recommendedTiming: 'Today',
      targetAction: 'Send Check-in',
    },

    timeline: [
      {
        id: 'tl-71',
        timestamp: '5 hours ago',
        title: 'Proposal Document Opened',
        description: 'Sanjay spent 4 minutes viewing section 3 (Pricing & ROI).',
        type: 'engagement',
      },
    ],

    updatedAt: '2026-09-13T07:00:00Z',
  },
];
