import { CallResultData } from '../types/callResults';

export const mockCallResultsMap: Record<string, CallResultData> = {
  // 1. PRIMARY FLAGSHIP DEMO CASE: ACME MANUFACTURING (QUALIFIED)
  'call-101': {
    callId: 'call-101',
    leadId: 'lead-101',
    companyName: 'Acme Manufacturing',
    companyDomain: 'acmemanufacturing.com',
    contactName: 'Rahul Shah',
    contactRole: 'Operations Director',
    contactPhone: '+91 98201 55432',
    industry: 'Industrial Equipment & Manufacturing',
    location: 'Pune, Maharashtra',
    outcome: 'QUALIFIED',
    outcomeExplanation: 'Strong buying intent identified with active 30-day timeline and pricing requested.',
    supportingIndicators: [
      'Timeline confirmed: 30-day deployment window',
      'Pricing requested for 12-member sales team',
      'Decision maker involved: Direct authority over sales operations'
    ],
    nextBestAction: {
      action: 'Schedule a product demo within 48 hours',
      whyNow: 'Rahul confirmed a 30-day implementation timeline and asked about pricing for his 12-member team.',
      confidence: 87,
      evidence: [
        '30-day evaluation timeline confirmed during call',
        'Pricing structure explicitly requested for team',
        'Direct authority over sales operations toolchain'
      ],
      targetTimeframe: 'Within 48 hours'
    },
    summary:
      'Acme Manufacturing currently manages lead follow-up manually across CRM and spreadsheets. Rahul is evaluating automation to reduce response delays and improve follow-up consistency. He confirmed a 30-day evaluation timeline and requested pricing. His primary concern is implementation effort. A product demo is recommended as the next step.',
    qualification: [
      {
        key: 'Need',
        label: 'Business Need',
        value: 'Sales automation to eliminate manual follow-up delays',
        status: 'confirmed',
        sourceNote: 'Confirmed during call',
        evidenceQuote: 'We mostly manage it manually across spreadsheets and lose 2-3 days on initial responses.',
        turnId: 'turn-3'
      },
      {
        key: 'Budget',
        label: 'Budget',
        value: '₹1.5–2.5 Lakhs annually discussed',
        status: 'confirmed',
        sourceNote: 'Confirmed during call',
        evidenceQuote: 'We have budget set aside for quarterly tech upgrades if the ROI is proven.',
        turnId: 'turn-7'
      },
      {
        key: 'Timeline',
        label: 'Timeline',
        value: '30 days',
        status: 'confirmed',
        sourceNote: 'Confirmed during call',
        evidenceQuote: 'We want to have the system in place within 30 days before our seasonal rush.',
        turnId: 'turn-5'
      },
      {
        key: 'Decision Maker',
        label: 'Decision Maker',
        value: 'Rahul Shah (Ops) + Managing Director sign-off',
        status: 'confirmed',
        sourceNote: 'Confirmed during call',
        evidenceQuote: 'I run sales operations. Once I evaluate the demo, our Managing Director signs off.',
        turnId: 'turn-7'
      },
      {
        key: 'Current Solution',
        label: 'Current Solution',
        value: 'Manual CRM + spreadsheets',
        status: 'inferred',
        sourceNote: 'AI inferred from operational description',
        evidenceQuote: 'Our reps manually copy data into spreadsheets and send WhatsApp notes.',
        turnId: 'turn-3'
      },
      {
        key: 'Urgency',
        label: 'Urgency',
        value: 'High',
        status: 'confirmed',
        sourceNote: 'Confirmed during call',
        evidenceQuote: 'Our lead turnaround is hurting our quarterly close rate significantly.',
        turnId: 'turn-5'
      },
      {
        key: 'Use Case',
        label: 'Use Case',
        value: 'Lead follow-up automation & SDR cadence',
        status: 'confirmed',
        sourceNote: 'Confirmed during call',
        evidenceQuote: 'Autonomous discovery calls and automated appointment qualification.',
        turnId: 'turn-3'
      },
      {
        key: 'Decision Process',
        label: 'Decision Process',
        value: 'Operations Director technical review + Founder capex approval',
        status: 'inferred',
        sourceNote: 'AI inferred from organizational role',
        evidenceQuote: 'I review technical feasibility first, then present capex to executive committee.',
        turnId: 'turn-7'
      }
    ],
    buyingSignals: [
      {
        id: 'sig-1',
        title: 'Pricing requested',
        importance: 'high',
        category: 'Commercial Intent',
        evidenceQuote: 'Can you send pricing for the full 12-member team?',
        whyItMatters: 'Direct request for commercial proposal signals active evaluation and procurement readiness.',
        timestamp: '03:15',
        turnId: 'turn-9'
      },
      {
        id: 'sig-2',
        title: 'Timeline confirmed',
        importance: 'high',
        category: 'Project Urgency',
        evidenceQuote: 'We want to have the system in place within 30 days before our seasonal rush.',
        whyItMatters: 'Defined 30-day go-live window eliminates pipeline stagnation and creates actionable closing momentum.',
        timestamp: '01:52',
        turnId: 'turn-5'
      },
      {
        id: 'sig-3',
        title: 'Decision maker involved',
        importance: 'medium',
        category: 'Stakeholder Authority',
        evidenceQuote: 'I run operations. Once I evaluate the demo, our Managing Director signs off.',
        turnId: 'turn-7',
        whyItMatters: 'Speaks directly with budget stakeholder, minimizing multi-layered consensus friction.',
        timestamp: '02:40'
      }
    ],
    objections: [
      {
        id: 'obj-1',
        category: 'Implementation',
        concern: 'Implementation time: Concern regarding downtime or disruption during rep transition.',
        riskLevel: 'medium',
        prospectQuote: 'How long would implementation take? We cannot afford a month of rep downtime.',
        aiResponseOpportunity: 'Lead with a lightweight onboarding plan and implementation timeline benchmark (deploy in under 7 days with zero workflow disruption).',
        resolutionStatus: 'resolved',
        turnId: 'turn-6'
      }
    ],
    keyStatements: [
      {
        id: 'stmt-1',
        statement: 'Implementation time is our biggest concern; our reps cannot be blocked during sales hours.',
        speaker: 'Rahul Shah',
        salesMeaning: 'High operational risk sensitivity; rep productivity must be protected during onboarding.',
        impact: 'concern',
        timestamp: '02:18',
        turnId: 'turn-6'
      },
      {
        id: 'stmt-2',
        statement: 'Can you send pricing for the full 12-member team?',
        speaker: 'Rahul Shah',
        salesMeaning: 'Direct buyer inquiry for multi-seat commercial agreement.',
        impact: 'positive',
        timestamp: '03:15',
        turnId: 'turn-9'
      },
      {
        id: 'stmt-3',
        statement: 'We want to improve lead follow-up turnaround within the next month.',
        speaker: 'Rahul Shah',
        salesMeaning: 'Hard 30-day timeline milestone established for vendor evaluation.',
        impact: 'positive',
        timestamp: '01:52',
        turnId: 'turn-5'
      }
    ],
    intelligenceChanges: [
      {
        metric: 'Intent Score',
        before: '72 / 100',
        after: '86 / 100',
        rationale: '+14 pts: Confirmed 30-day timeline, commercial pricing requested, and operational authority verified.',
        direction: 'up'
      },
      {
        metric: 'Decision Timeline',
        before: 'Unknown',
        after: '30 days',
        rationale: 'Rahul verified hard rollout requirement before seasonal Q4 volume spike.',
        direction: 'up'
      },
      {
        metric: 'Decision Maker',
        before: 'Unconfirmed',
        after: 'Confirmed',
        rationale: 'Direct operational buyer identified with clear sign-off protocol.',
        direction: 'up'
      },
      {
        metric: 'Opportunity Urgency',
        before: 'Medium',
        after: 'High',
        rationale: 'Documented revenue loss from multi-day manual response delays.',
        direction: 'up'
      }
    ],
    transcript: [
      {
        id: 'turn-1',
        speaker: 'ai_agent',
        speakerName: 'Marcus (Vidur AI)',
        text: "Hello Rahul, Marcus calling with Vidur AI. I'm reaching out regarding Acme Manufacturing's focus on accelerating lead qualification. Did I catch you with two minutes?",
        timestamp: '00:03'
      },
      {
        id: 'turn-2',
        speaker: 'prospect',
        speakerName: 'Rahul Shah',
        text: "Hi Marcus, yes, I have a few minutes before my production sync. What is this regarding?",
        timestamp: '00:15'
      },
      {
        id: 'turn-3',
        speaker: 'ai_agent',
        speakerName: 'Marcus (Vidur AI)',
        text: "We specialize in autonomous voice sales agents for industrial manufacturers. Can you share how your team currently handles new buyer inquiries and outbound qualification?",
        timestamp: '00:26',
        marker: 'QUALIFICATION',
        markerLabel: 'Need & Current Solution Probed'
      },
      {
        id: 'turn-4',
        speaker: 'prospect',
        speakerName: 'Rahul Shah',
        text: "We mostly manage it manually across spreadsheets and our legacy CRM. Our reps lose 2 to 3 days on initial responses and follow-ups fall through the cracks.",
        timestamp: '00:44'
      },
      {
        id: 'turn-5',
        speaker: 'ai_agent',
        speakerName: 'Marcus (Vidur AI)',
        text: "That lag is very common. What timeframe is Acme looking at to eliminate those response bottlenecks?",
        timestamp: '01:02',
        marker: 'BUYING_SIGNAL',
        markerLabel: '30-Day Timeline Confirmed'
      },
      {
        id: 'turn-6',
        speaker: 'prospect',
        speakerName: 'Rahul Shah',
        text: "We want to have the system in place within 30 days before our seasonal rush. But implementation time is our biggest concern; our reps cannot afford a month of downtime.",
        timestamp: '01:28',
        marker: 'OBJECTION',
        markerLabel: 'Implementation Downtime Concern'
      },
      {
        id: 'turn-7',
        speaker: 'ai_agent',
        speakerName: 'Marcus (Vidur AI)',
        text: "Completely understood. We deploy plug-and-play in under 7 business days without rep workflow disruption. Beside yourself, who else evaluates the technical onboarding?",
        timestamp: '01:54',
        marker: 'DECISION_MAKER',
        markerLabel: 'Decision Maker & Process Identified'
      },
      {
        id: 'turn-8',
        speaker: 'prospect',
        speakerName: 'Rahul Shah',
        text: "I run operations. Once I evaluate the demo, our Managing Director signs off. We have budget set aside for quarterly tech upgrades if the ROI is proven.",
        timestamp: '02:22'
      },
      {
        id: 'turn-9',
        speaker: 'ai_agent',
        speakerName: 'Marcus (Vidur AI)',
        text: "Understood. How about a 20-minute tailored walkthrough this Thursday at 3 PM to show the live agent on your industrial workflow?",
        timestamp: '02:48'
      },
      {
        id: 'turn-10',
        speaker: 'prospect',
        speakerName: 'Rahul Shah',
        text: "Thursday at 3 works. Can you send pricing for the full 12-member team along with the calendar link? Looking forward to it.",
        timestamp: '03:15',
        marker: 'BUYING_SIGNAL',
        markerLabel: 'Pricing & Demo Requested'
      }
    ],
    metadata: {
      callId: 'call-101',
      duration: '8m 42s',
      callTime: 'Today · 2:15 PM IST',
      agent: 'Marcus (Vidur AI Voice Engine)',
      direction: 'Outbound',
      phone: '+91 98201 55432',
      attemptNumber: 1,
      recordingStatus: 'Available (48kHz HD Audio)',
      telephonyCodec: 'Opus Fullband / WebRTC',
      carrierLatency: '32ms (Tier-1 Direct SIP)'
    },
    status: 'ready'
  },

  // 2. INTERESTED SCENARIO: CLOUDSCALE SYSTEMS
  'call-102': {
    callId: 'call-102',
    leadId: 'lead-102',
    companyName: 'CloudScale Systems',
    companyDomain: 'cloudscalesystems.com',
    contactName: 'Sarah Jenkins',
    contactRole: 'VP Infrastructure',
    contactPhone: '+1 (415) 555-0199',
    industry: 'Enterprise Cloud & DevOps',
    location: 'San Francisco, CA',
    outcome: 'INTERESTED',
    outcomeExplanation: 'High interest in autonomous qualification, but requested technical architecture documentation prior to booking a live demo.',
    supportingIndicators: [
      'Technical architecture questions raised',
      'SOC2 compliance verification requested',
      'Evaluation scheduled for next fiscal sprint'
    ],
    nextBestAction: {
      action: 'Send SOC2 compliance packet and technical brief',
      whyNow: 'Sarah requested technical verification before circulating the proposal to IT security.',
      confidence: 82,
      evidence: [
        'Security packet explicitly requested by VP Infrastructure',
        'Technical evaluation pending security review'
      ],
      targetTimeframe: 'Today by 5:00 PM'
    },
    summary:
      'Sarah Jenkins confirmed CloudScale is evaluating solutions to automate outbound prospect qualification. She showed strong interest in voice agent latency benchmarks. Next step is to provide security architecture documentation before scheduling a technical demo.',
    qualification: [
      { key: 'Need', label: 'Business Need', value: 'Outbound DevOps lead qualification', status: 'confirmed', sourceNote: 'Confirmed during call' },
      { key: 'Budget', label: 'Budget', value: 'Enterprise allocation pending Q4', status: 'inferred', sourceNote: 'AI inferred' },
      { key: 'Timeline', label: 'Timeline', value: '45–60 days', status: 'confirmed', sourceNote: 'Confirmed during call' },
      { key: 'Decision Maker', label: 'Decision Maker', value: 'Sarah Jenkins (VP) + CISO sign-off', status: 'confirmed', sourceNote: 'Confirmed during call' },
      { key: 'Current Solution', label: 'Current Solution', value: 'Manual SDR phone queue', status: 'confirmed', sourceNote: 'Confirmed during call' },
      { key: 'Urgency', label: 'Urgency', value: 'Medium', status: 'confirmed', sourceNote: 'Confirmed during call' },
      { key: 'Use Case', label: 'Use Case', value: 'Automated infrastructure qualification', status: 'confirmed', sourceNote: 'Confirmed during call' },
      { key: 'Decision Process', label: 'Decision Process', value: 'Security review followed by 30-day proof of concept', status: 'inferred', sourceNote: 'AI inferred' }
    ],
    buyingSignals: [
      { id: 'sig-102-1', title: 'Technical architecture inquiry', importance: 'high', category: 'Technical Intent', evidenceQuote: 'What is the end-to-end audio packet roundtrip latency?', whyItMatters: 'Engineering deep-dive indicates serious evaluation.', timestamp: '02:10' }
    ],
    objections: [
      { id: 'obj-102-1', category: 'Technical complexity', concern: 'Strict SOC2 compliance requirements for voice data.', riskLevel: 'medium', aiResponseOpportunity: 'Share encrypted zero-data-retention compliance documentation.', resolutionStatus: 'partially_resolved' }
    ],
    keyStatements: [
      { id: 'stmt-102-1', statement: 'Send over the security brief and I will review it with our CISO.', speaker: 'Sarah Jenkins', salesMeaning: 'Security gatekeeper must clear before demo.', impact: 'neutral', timestamp: '03:40' }
    ],
    intelligenceChanges: [
      { metric: 'Intent Score', before: '68 / 100', after: '79 / 100', rationale: '+11 pts: Confirmed technical evaluation and security review underway.', direction: 'up' }
    ],
    transcript: [],
    metadata: {
      callId: 'call-102',
      duration: '5m 12s',
      callTime: 'Yesterday · 4:30 PM EST',
      agent: 'Marcus (Vidur AI Voice Engine)',
      direction: 'Outbound',
      phone: '+1 (415) 555-0199',
      attemptNumber: 1,
      recordingStatus: 'Available'
    },
    status: 'ready'
  },

  // 3. FOLLOW-UP SCENARIO: BIOHEALTH DIAGNOSTICS
  'call-103': {
    callId: 'call-103',
    leadId: 'lead-103',
    companyName: 'BioHealth Diagnostic Networks',
    contactName: 'Dr. Rajiv Mehta',
    contactRole: 'Chief Medical Informatics Officer',
    contactPhone: '+91 94250 88214',
    industry: 'Healthcare & Clinical Diagnostics',
    location: 'Bangalore, Karnataka',
    outcome: 'FOLLOW_UP',
    outcomeExplanation: 'Strong clinical interest voiced, but requested follow-up next Tuesday following hospital board meeting.',
    supportingIndicators: [
      'Agreed re-connect date: Next Tuesday at 11:00 AM IST',
      'Board meeting pending capex sign-off',
      'Clinical trial patient scheduling use-case verified'
    ],
    nextBestAction: {
      action: 'Set priority calendar follow-up for Tuesday 11:00 AM',
      whyNow: 'Dr. Mehta requested reconnecting immediately after the monthly hospital capex board meeting.',
      confidence: 85,
      evidence: ['Explicit callback request for Tuesday 11 AM'],
      targetTimeframe: 'Tuesday, 11:00 AM IST'
    },
    summary:
      'Dr. Rajiv Mehta expressed interest in automating patient appointment re-confirmations to reduce hospital no-show rates. He is in hospital rounds and requested a follow-up discussion next Tuesday following his department capex meeting.',
    qualification: [
      { key: 'Need', label: 'Business Need', value: 'Reduce 22% clinical patient appointment no-shows', status: 'confirmed', sourceNote: 'Confirmed during call' },
      { key: 'Budget', label: 'Budget', value: 'Hospital board review next Tuesday', status: 'inferred', sourceNote: 'AI inferred' },
      { key: 'Timeline', label: 'Timeline', value: 'Q1 2027 rollout', status: 'confirmed', sourceNote: 'Confirmed during call' },
      { key: 'Decision Maker', label: 'Decision Maker', value: 'Dr. Rajiv Mehta + Hospital Board', status: 'confirmed', sourceNote: 'Confirmed during call' },
      { key: 'Current Solution', label: 'Current Solution', value: 'Clinical nursing desk manual calls', status: 'confirmed', sourceNote: 'Confirmed during call' },
      { key: 'Urgency', label: 'Urgency', value: 'Medium', status: 'confirmed', sourceNote: 'Confirmed during call' },
      { key: 'Use Case', label: 'Use Case', value: 'Automated medical reminder outbound calls', status: 'confirmed', sourceNote: 'Confirmed during call' },
      { key: 'Decision Process', label: 'Decision Process', value: 'Board capex approval', status: 'inferred', sourceNote: 'AI inferred' }
    ],
    buyingSignals: [
      { id: 'sig-103-1', title: 'Specific callback time provided', importance: 'high', category: 'Engagement', evidenceQuote: 'Call me Tuesday at 11 AM right after our board review.', whyItMatters: 'Specific date and hour indicates authentic buyer receptivity.', timestamp: '01:45' }
    ],
    objections: [],
    keyStatements: [
      { id: 'stmt-103-1', statement: 'Our nursing desk spends 20 hours a week on appointment phone tag.', speaker: 'Dr. Rajiv Mehta', salesMeaning: 'Quantifiable operational labor waste confirmed.', impact: 'positive', timestamp: '01:10' }
    ],
    intelligenceChanges: [
      { metric: 'Intent Score', before: '74 / 100', after: '81 / 100', rationale: '+7 pts: Strong clinical use-case and agreed callback date verified.', direction: 'up' }
    ],
    transcript: [],
    metadata: {
      callId: 'call-103',
      duration: '3m 48s',
      callTime: 'Today · 11:15 AM IST',
      agent: 'Marcus (Vidur AI Voice Engine)',
      direction: 'Outbound',
      phone: '+91 94250 88214',
      attemptNumber: 1,
      recordingStatus: 'Available'
    },
    status: 'ready'
  },

  // 4. NO ANSWER SCENARIO: FINEDGE PAYMENTS
  'call-104': {
    callId: 'call-104',
    leadId: 'lead-104',
    companyName: 'FinEdge Payments',
    contactName: 'Kavita Iyer',
    contactRole: 'Head of Merchant Operations',
    contactPhone: '+91 98110 33419',
    industry: 'Fintech & Payment Gateway',
    location: 'Mumbai, Maharashtra',
    outcome: 'NO_ANSWER',
    outcomeExplanation: 'No conversation completed. Outbound call rang 5 times without voicemail connection.',
    supportingIndicators: [
      'Call attempt 1 of 3 exhausted',
      'Carrier line active and healthy',
      'Direct-dial verified'
    ],
    nextBestAction: {
      action: 'Schedule automated retry dial in 2 hours',
      whyNow: 'First dial attempt unanswered during peak operational window; retry recommended during afternoon lull.',
      confidence: 90,
      evidence: ['Carrier line active', 'Direct dial verified on IndiaMART'],
      targetTimeframe: 'Today at 4:30 PM IST'
    },
    summary:
      'Outbound call initiated to Kavita Iyer. The phone rang for 28 seconds without answer or voicemail routing. Opportunity remains open with intent score preserved.',
    qualification: [
      { key: 'Need', label: 'Business Need', value: 'Merchant onboarding verification calls', status: 'not_discussed', sourceNote: 'Not discussed' },
      { key: 'Budget', label: 'Budget', value: 'Not discussed', status: 'not_discussed', sourceNote: 'Not discussed' },
      { key: 'Timeline', label: 'Timeline', value: 'Not discussed', status: 'not_discussed', sourceNote: 'Not discussed' },
      { key: 'Decision Maker', label: 'Decision Maker', value: 'Kavita Iyer (Unreached)', status: 'unknown', sourceNote: 'Not discussed' },
      { key: 'Current Solution', label: 'Current Solution', value: 'Manual operations desk', status: 'inferred', sourceNote: 'Inferred from profile' },
      { key: 'Urgency', label: 'Urgency', value: 'Medium', status: 'unknown', sourceNote: 'Not discussed' },
      { key: 'Use Case', label: 'Use Case', value: 'Merchant KYC phone verification', status: 'inferred', sourceNote: 'Inferred from profile' },
      { key: 'Decision Process', label: 'Decision Process', value: 'Not discussed', status: 'not_discussed', sourceNote: 'Not discussed' }
    ],
    buyingSignals: [],
    objections: [],
    keyStatements: [],
    intelligenceChanges: [
      { metric: 'Intent Score', before: '65 / 100', after: '65 / 100', rationale: 'No change: Contact unreachable on first attempt.', direction: 'neutral' }
    ],
    transcript: [],
    metadata: {
      callId: 'call-104',
      duration: '0m 28s',
      callTime: 'Today · 1:45 PM IST',
      agent: 'Marcus (Vidur AI Voice Engine)',
      direction: 'Outbound',
      phone: '+91 98110 33419',
      attemptNumber: 1,
      recordingStatus: 'No Audio Captured'
    },
    status: 'ready'
  },

  // 5. FAILED SCENARIO: AEROCRANES (CARRIER DROP)
  'call-105': {
    callId: 'call-105',
    leadId: 'lead-105',
    companyName: 'AeroCranes Engineering',
    contactName: 'Bradley Cooper',
    contactRole: 'VP Service Sales',
    contactPhone: '+1 (312) 555-0144',
    industry: 'Heavy Machinery & Cranes',
    location: 'Detroit, MI',
    outcome: 'FAILED',
    outcomeExplanation: 'Call could not be completed due to carrier SIP trunk route timeout.',
    supportingIndicators: [
      'Telephony carrier error code: SIP 504 Gateway Timeout',
      'Line dropped at 00:08 before audio bridge established',
      'Alternative secondary switchboard available'
    ],
    nextBestAction: {
      action: 'Retry dial via secondary telecommunications trunk',
      whyNow: 'Technical carrier routing failure rather than prospect rejection; secondary route available.',
      confidence: 88,
      evidence: ['SIP 504 Gateway Timeout detected', 'Direct carrier switchboard alive'],
      targetTimeframe: 'Immediate retry'
    },
    summary:
      'Outbound call failed during telephony SIP route handoff. No prospect audio was bridged. Technical recovery recommended via secondary SIP gateway.',
    qualification: [
      { key: 'Need', label: 'Business Need', value: 'Crane maintenance contract outreach', status: 'not_discussed', sourceNote: 'Not discussed' },
      { key: 'Budget', label: 'Budget', value: 'Not discussed', status: 'not_discussed', sourceNote: 'Not discussed' },
      { key: 'Timeline', label: 'Timeline', value: 'Not discussed', status: 'not_discussed', sourceNote: 'Not discussed' },
      { key: 'Decision Maker', label: 'Decision Maker', value: 'Bradley Cooper', status: 'unknown', sourceNote: 'Not discussed' },
      { key: 'Current Solution', label: 'Current Solution', value: 'Not discussed', status: 'not_discussed', sourceNote: 'Not discussed' },
      { key: 'Urgency', label: 'Urgency', value: 'Not discussed', status: 'not_discussed', sourceNote: 'Not discussed' },
      { key: 'Use Case', label: 'Use Case', value: 'Not discussed', status: 'not_discussed', sourceNote: 'Not discussed' },
      { key: 'Decision Process', label: 'Decision Process', value: 'Not discussed', status: 'not_discussed', sourceNote: 'Not discussed' }
    ],
    buyingSignals: [],
    objections: [],
    keyStatements: [],
    intelligenceChanges: [
      { metric: 'Intent Score', before: '58 / 100', after: '58 / 100', rationale: 'No change: Telephony gateway dropped before connection.', direction: 'neutral' }
    ],
    transcript: [],
    metadata: {
      callId: 'call-105',
      duration: '0m 08s',
      callTime: 'Today · 10:05 AM EST',
      agent: 'Marcus (Vidur AI Voice Engine)',
      direction: 'Outbound',
      phone: '+1 (312) 555-0144',
      attemptNumber: 1,
      recordingStatus: 'Failed / No Audio'
    },
    status: 'ready',
    failureReason: 'Carrier SIP Trunk Gateway Timeout (SIP 504). Route released.'
  }
};

export function getCallResultData(rawCallId: string | undefined): CallResultData {
  if (!rawCallId) return mockCallResultsMap['call-101'];
  const cleanId = rawCallId.trim().toLowerCase();

  if (mockCallResultsMap[cleanId]) {
    return mockCallResultsMap[cleanId];
  }

  // Support lead-style IDs (e.g. call-lead-101 -> call-101)
  const normalized = cleanId.replace('lead-', '');
  if (mockCallResultsMap[normalized]) {
    return mockCallResultsMap[normalized];
  }

  // Fallback to primary flagship Acme Manufacturing
  return mockCallResultsMap['call-101'];
}
