import { SalesConversationContext } from '../types/copilot';

export const mockCopilotContexts: SalesConversationContext[] = [
  {
    id: 'copilot-1',
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
    whyNowHeadline: 'Prospect asked about pricing tier after visiting product page 4 times today.',
    whyNowRecency: '2 hours ago',
    primarySignal: 'Pricing Inquiry & Intent Surge (+22 pts)',

    summaryBrief: 'Acme Technologies is scaling their 50+ rep engineering and operations team. Rahul confirmed high interest in AI call automation and workflow SLA guarantees during automated voice qualification.',
    confirmedPainPoints: [
      'Manual SDR qualification overhead',
      'Inconsistent lead follow-up SLA (>4 hour delay)',
      'High cost per qualified enterprise lead'
    ],
    techStack: ['HubSpot CRM', 'AWS Cloud', 'Twilio Voice'],
    scaleInfo: '250-500 employees • ₹120 Cr ARR',

    openingHook: {
      hook: 'Hi Rahul, saw you were reviewing our Enterprise SLA tier earlier today. Wanted to offer a tailored walkthrough of our multi-channel voice automation setup.',
      rationale: 'References pricing form inquiry submitted 2h ago and matches his VP role focus on SLA guarantees.',
      citation: 'Based on Pricing Inquiry Form submission (2 hours ago)',
      tone: 'direct'
    },

    talkingPoints: [
      {
        id: 'tp-1',
        angle: 'Sub-Minute Inbound Lead SLA',
        description: 'Auto-qualify inbound lead inquiries within 60 seconds of form submission.',
        basis: 'Based on current 4h SLA delay reported in discovery',
        suggestedPhrasing: 'Our autonomous voice agent reaches inbound leads in under 60 seconds, lifting connect rates by 3.2x.'
      },
      {
        id: 'tp-2',
        angle: 'HubSpot & CRM Sync Integrity',
        description: 'Native bi-directional sync writes call transcripts and sentiment directly to deal timelines.',
        basis: 'Confirmed tech stack: HubSpot CRM',
        suggestedPhrasing: 'Every call transcript and intent score automatically syncs to your existing HubSpot deal pipeline.'
      },
      {
        id: 'tp-3',
        angle: 'Enterprise SLA & Security',
        description: 'Dedicated SOC-2 Compliant infrastructure with custom telephony fallback.',
        basis: 'VP of Engineering security criteria',
        suggestedPhrasing: 'We guarantee 99.9% uptime with SOC-2 data isolation tailored for cloud engineering teams.'
      }
    ],

    discoveryQuestions: [
      {
        id: 'dq-1',
        category: 'Need',
        question: 'What is your current average response time for inbound pricing inquiries?',
        whyAsk: 'Highlights operational delay and quantifies value of instant voice dispatch.',
        expectedInsight: 'Confirms current SLA bottlenecks (usually 2-6 hours).'
      },
      {
        id: 'dq-2',
        category: 'Timeline',
        question: 'Are you aiming to deploy automated qualification ahead of the upcoming Q4 push?',
        whyAsk: 'Establishes deployment urgency.',
        expectedInsight: 'Determines if buy-in is immediate or next quarter.'
      },
      {
        id: 'dq-3',
        category: 'Decision Maker',
        question: 'Who else on the CRO or Sales Ops side will be evaluating the platform demo?',
        whyAsk: 'Identifies multi-stakeholder approval chain early.',
        expectedInsight: 'Surfaces CRO or VP Sales involvement.'
      }
    ],

    objections: [
      {
        id: 'obj-1',
        category: 'Price',
        objection: 'The enterprise package seems higher than traditional dialer software.',
        suggestedResponse: 'Unlike static dialers, Vidur replaces manual SDR triage hours completely, yielding positive ROI within the first 30 days.',
        reasoning: 'Focus on full-time SDR cost replacement rather than comparing line-item dialer software fees.',
        discoveryPivot: 'What is your current monthly cost per qualified pipeline opportunity?'
      },
      {
        id: 'obj-2',
        category: 'Timing',
        objection: 'We are in the middle of a sprint release, can we connect next month?',
        suggestedResponse: 'Understood. Since setup takes under 30 minutes with our HubSpot connector, we can run a zero-friction pilot without dev work.',
        reasoning: 'Addresses developer bandwidth concern.',
        discoveryPivot: 'If our team handles 100% of integration setup, would a 15-min demo next Tuesday fit?'
      },
      {
        id: 'obj-3',
        category: 'Competitor',
        objection: 'We are currently looking at Competitor X.',
        suggestedResponse: 'Competitor X handles outbound email cadences well, but Vidur is built ground-up for real-time AI voice qualification and live intent triggers.',
        reasoning: 'Highlights autonomous voice agent differentiation.',
        discoveryPivot: 'Does Competitor X provide real-time voice call qualification in Hindi & English?'
      }
    ],

    lastInteraction: {
      date: '2 hours ago',
      channel: 'Website Calculator & AI Call Qualification',
      summary: 'Voice bot scored 88% qualification rating; Rahul confirmed 50+ rep team size.'
    },

    nextBestAction: {
      label: 'Launch AI Voice Call to Rahul',
      targetRoute: '/calls?leadId=lead-1',
      actionType: 'call'
    }
  },

  {
    id: 'copilot-2',
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
    whyNowHeadline: 'Prospect replied positively to Follow-Up email asking for custom HIPAA deployment quote.',
    whyNowRecency: '3 hours ago',
    primarySignal: 'Positive Email Reply & Compliance Request',

    summaryBrief: 'Apex Healthtech is expanding patient onboarding across 12 cities. Priya requested explicit healthcare compliance guarantees and pricing schedules.',
    confirmedPainPoints: [
      'Patient appointment booking drop-off',
      'HIPAA / Healthcare data privacy requirements',
      'Manual call center staffing bottlenecks'
    ],
    techStack: ['Salesforce Health Cloud', 'AWS Telehealth', 'Exotel'],
    scaleInfo: '100-250 employees • Telemedicine Provider',

    openingHook: {
      hook: 'Hi Priya, received your reply regarding custom healthcare deployment packages. Attached is our HIPAA compliance whitepaper and healthcare case study.',
      rationale: 'Direct response to her email query 3 hours ago.',
      citation: 'Based on Positive Email Reply (3 hours ago)',
      tone: 'value-led'
    },

    talkingPoints: [
      {
        id: 'tp-21',
        angle: 'HIPAA & Healthcare Data Isolation',
        description: 'End-to-end encrypted voice logs with patient data redactions.',
        basis: 'Confirmed healthcare sector requirement',
        suggestedPhrasing: 'All call recordings and patient transcripts undergo automatic PII redaction to maintain strict healthcare compliance.'
      },
      {
        id: 'tp-22',
        angle: '24/7 Autonomous Patient Scheduling',
        description: 'Voice bots handle patient intake calls round-the-clock without human intervention.',
        basis: 'Pain point: Call center staffing bottlenecks',
        suggestedPhrasing: 'Our AI voice agent manages after-hours patient inquiries, eliminating missed appointments.'
      }
    ],

    discoveryQuestions: [
      {
        id: 'dq-21',
        category: 'Need',
        question: 'How many patient intake calls does your team process daily during peak hours?',
        whyAsk: 'Quantifies daily call volume for custom capacity pricing.',
        expectedInsight: 'Confirms 1,000+ daily patient touchpoints.'
      }
    ],

    objections: [
      {
        id: 'obj-21',
        category: 'Existing Solution',
        objection: 'We already use a call center vendor in Mumbai.',
        suggestedResponse: 'Vidur works alongside your existing call center to handle overflow and after-hours triage automatically.',
        reasoning: 'Position as zero-disruption overflow tier.',
        discoveryPivot: 'What percentage of after-hours patient calls currently go unanswered?'
      }
    ],

    lastInteraction: {
      date: '3 hours ago',
      channel: 'Email Reply',
      summary: 'Priya requested compliance documentation and pricing schedule.'
    },

    nextBestAction: {
      label: 'Send Healthcare Proposal',
      targetRoute: '/follow-ups?leadId=lead-2',
      actionType: 'email'
    }
  }
];
