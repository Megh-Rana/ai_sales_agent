import {
  CallSession,
  CallState,
  AudioStatus,
  TranscriptItem,
  IntelligenceEvent,
  QualificationDimension,
  QualificationStatus,
  CurrentObjective,
  CallLanguage
} from '../types/calls';
import { getLeadDetails, mockDiscoveredLeads } from './leads';

export interface ScriptProgressionStep {
  stepIndex: number;
  atSeconds: number;
  audioStatus: AudioStatus;
  transcriptItem: TranscriptItem;
  intelligenceEvent?: IntelligenceEvent;
  qualificationUpdate?: {
    dimension: 'Need' | 'Pain Point' | 'Timeline' | 'Budget' | 'Decision Maker' | 'Current Solution' | 'Implementation Readiness';
    status: QualificationStatus;
    detail: string;
    evidence: string;
  };
  objectiveUpdate?: CurrentObjective;
}

export const INITIAL_QUALIFICATION_DIMENSIONS: Record<string, QualificationDimension> = {
  Need: {
    dimension: 'Need',
    label: 'Business Need',
    status: 'discovering',
    detail: 'Automated outbound dispatch & freight tracking'
  },
  'Pain Point': {
    dimension: 'Pain Point',
    label: 'Operational Pain',
    status: 'discovering',
    detail: 'Driver dwell times & terminal bottleneck'
  },
  Timeline: {
    dimension: 'Timeline',
    label: 'Decision Timeline',
    status: 'unknown',
    detail: 'Not discussed yet'
  },
  Budget: {
    dimension: 'Budget',
    label: 'Budget Authority',
    status: 'unknown',
    detail: 'Not discussed yet'
  },
  'Decision Maker': {
    dimension: 'Decision Maker',
    label: 'Stakeholders',
    status: 'discovering',
    detail: 'David Reynolds (VP Ops) identified'
  },
  'Current Solution': {
    dimension: 'Current Solution',
    label: 'Current Tech Stack',
    status: 'unknown',
    detail: 'Not discussed yet'
  },
  'Implementation Readiness': {
    dimension: 'Implementation Readiness',
    label: 'Integration Feasibility',
    status: 'unknown',
    detail: 'Not discussed yet'
  }
};

export const ACME_CALL_SCRIPT_STEPS: ScriptProgressionStep[] = [
  // 1. Opening Hook
  {
    stepIndex: 1,
    atSeconds: 3,
    audioStatus: 'ai_speaking',
    transcriptItem: {
      id: 'tx-1',
      speaker: 'ai_agent',
      speakerName: 'Marcus (Vidur AI)',
      text: "Hello David, Marcus calling with Vidur AI. I'm reaching out regarding Acme's recent RFP on the Transport Exchange for automating freight dispatch operations. Did I catch you with two minutes?",
      timestamp: '00:03',
      sentiment: 'neutral',
      isFinal: true
    },
    objectiveUpdate: {
      goal: 'Confirm RFP receipt and verify current dispatch workflow bottleneck.',
      suggestedQuestion: 'How is Acme currently handling driver dispatch notifications across regional hubs?',
      strategyNote: 'Acknowledge RFP submission within 24 hours to capitalize on active vendor review window.'
    }
  },

  // 2. Prospect Response — Requirement Confirmation
  {
    stepIndex: 2,
    atSeconds: 12,
    audioStatus: 'prospect_speaking',
    transcriptItem: {
      id: 'tx-2',
      speaker: 'prospect',
      speakerName: 'David Reynolds',
      text: "Hey Marcus, yeah, I have a few minutes before our dock operations sync. Yes, we published that RFP yesterday. We're running 1,200 regional deliveries daily and our dispatch coordinators are completely overwhelmed on the phones.",
      timestamp: '00:12',
      sentiment: 'engaged',
      isFinal: true
    },
    intelligenceEvent: {
      id: 'intel-1',
      type: 'qualification',
      title: 'QUALIFICATION SIGNAL: Volume Confirmed',
      description: 'Prospect confirmed 1,200 regional deliveries daily and overloaded phone dispatch staff.',
      quote: 'We are running 1,200 regional deliveries daily and dispatch coordinators are overwhelmed.',
      timestamp: '00:14',
      dimension: 'Need',
      impactScore: 92,
      whyItMatters: 'Confirms high dispatch run rate justifying enterprise tier solution.'
    },
    qualificationUpdate: {
      dimension: 'Need',
      status: 'confirmed',
      detail: 'Automate dispatch for 1,200 daily regional freight deliveries',
      evidence: 'RFP confirmed; staff overwhelmed with manual calls'
    },
    objectiveUpdate: {
      goal: 'Quantify operational delay and financial impact from driver dwell time.',
      suggestedQuestion: 'How much delay does the phone tag cause at terminal docks, and what is the impact on missed appointment windows?',
      strategyNote: 'Probe for detention fee penalties and delivery miss rates.'
    }
  },

  // 3. AI Digs into Pain Point
  {
    stepIndex: 3,
    atSeconds: 22,
    audioStatus: 'ai_speaking',
    transcriptItem: {
      id: 'tx-3',
      speaker: 'ai_agent',
      speakerName: 'Marcus (Vidur AI)',
      text: "Understood. Many 3PL leaders we speak with find that manual dispatcher phone tag leads to 30 to 45-minute driver dwell bottlenecks and steep detention fees. Is that delay what triggered the RFP?",
      timestamp: '00:22',
      sentiment: 'neutral',
      isFinal: true
    }
  },

  // 4. Prospect Confirms Concrete Pain Point
  {
    stepIndex: 4,
    atSeconds: 34,
    audioStatus: 'prospect_speaking',
    transcriptItem: {
      id: 'tx-4',
      speaker: 'prospect',
      speakerName: 'David Reynolds',
      text: "That's hit the nail on the head. Our dispatchers spend nearly 4 hours every morning just verifying driver check-ins and appointment gates. We have a 14% missed appointment window rate right now, and detention penalties are eroding our carrier margins.",
      timestamp: '00:34',
      sentiment: 'engaged',
      isFinal: true
    },
    intelligenceEvent: {
      id: 'intel-2',
      type: 'buying_signal',
      title: 'BUYING SIGNAL: 14% Missed Delivery Windows',
      description: 'Carrier detention penalties eroding profit margins; 4 hours/day lost to manual phone tag.',
      quote: '14% missed appointment window rate... detention penalties eroding carrier margins.',
      timestamp: '00:36',
      dimension: 'Pain Point',
      impactScore: 96,
      whyItMatters: 'Quantifiable commercial pain and direct executive margin loss.'
    },
    qualificationUpdate: {
      dimension: 'Pain Point',
      status: 'confirmed',
      detail: '14% missed appointment rate + heavy carrier detention fees',
      evidence: 'Dispatchers losing 4 hours/day to manual driver check-in calls'
    },
    objectiveUpdate: {
      goal: 'Discover target deployment timeline and go-live urgency.',
      suggestedQuestion: 'When does Acme need the autonomous voice dispatch system operational across the distribution hubs?',
      strategyNote: 'Tie urgency to Q4 seasonal freight peak to lock in vendor review date.'
    }
  },

  // 5. AI Questions Timeline
  {
    stepIndex: 5,
    atSeconds: 46,
    audioStatus: 'ai_speaking',
    transcriptItem: {
      id: 'tx-5',
      speaker: 'ai_agent',
      speakerName: 'Marcus (Vidur AI)',
      text: "That margin drain adds up fast on 1,200 runs. When is Acme targeting to have the automated dispatch system live across your Midwest distribution hubs?",
      timestamp: '00:46',
      sentiment: 'neutral',
      isFinal: true
    }
  },

  // 6. Prospect Reveals Hard Timeline
  {
    stepIndex: 6,
    atSeconds: 56,
    audioStatus: 'prospect_speaking',
    transcriptItem: {
      id: 'tx-6',
      speaker: 'prospect',
      speakerName: 'David Reynolds',
      text: "We need this live before our Q4 freight volume spike hits in late October. The selection committee convenes this Friday, and we want vendor contracts executed by end of month.",
      timestamp: '00:56',
      sentiment: 'engaged',
      isFinal: true
    },
    intelligenceEvent: {
      id: 'intel-3',
      type: 'buying_signal',
      title: 'BUYING SIGNAL: Urgent Q4 Go-Live Deadline',
      description: 'Vendor selection committee meets this Friday; contracts to be signed by end of month for late October go-live.',
      quote: 'We need this live before our Q4 volume spike in late October. Committee convenes this Friday.',
      timestamp: '00:58',
      dimension: 'Timeline',
      impactScore: 98,
      whyItMatters: 'Indicates imminent vendor procurement evaluation and urgent Q4 timeline.'
    },
    qualificationUpdate: {
      dimension: 'Timeline',
      status: 'confirmed',
      detail: 'Late October go-live; vendor selection this Friday',
      evidence: 'Must deploy before Q4 holiday volume surge'
    },
    objectiveUpdate: {
      goal: 'Uncover current tech stack constraints and handle potential integration friction.',
      suggestedQuestion: 'What transportation management system (TMS) and telematics are your dispatchers using today?',
      strategyNote: 'Address integration fears before they become blockers.'
    }
  },

  // 7. Prospect Raises Integration Objection
  {
    stepIndex: 7,
    atSeconds: 70,
    audioStatus: 'prospect_speaking',
    transcriptItem: {
      id: 'tx-7',
      speaker: 'prospect',
      speakerName: 'David Reynolds',
      text: "One critical hurdle: we operate SAP TMS and Geotab ELDs across all fleet units. Our legacy Avaya system couldn't talk to them. We cannot risk 3 months of downtime or brittle custom API coding.",
      timestamp: '01:10',
      sentiment: 'skeptical',
      isFinal: true
    },
    intelligenceEvent: {
      id: 'intel-4',
      type: 'objection',
      title: 'OBJECTION: Integration Downtime Risk',
      description: 'Prospect concerned about legacy Avaya replacement and integration complexity with SAP TMS & Geotab.',
      quote: 'We cannot risk 3 months of downtime or brittle custom API coding with SAP TMS.',
      timestamp: '01:12',
      dimension: 'Implementation Readiness',
      impactScore: 88,
      whyItMatters: 'Integration hesitation must be resolved immediately with certified TMS connectors.'
    },
    qualificationUpdate: {
      dimension: 'Current Solution',
      status: 'confirmed',
      detail: 'SAP TMS + Geotab ELD; displacing legacy Avaya PBX',
      evidence: 'Avaya PBX lacks modern webhook connectors'
    },
    objectiveUpdate: {
      goal: 'Counter integration objection with certified SAP & Geotab connectors and fast deployment proof.',
      suggestedQuestion: 'Would it help to see our pre-built SAP TMS certified connector documentation?',
      strategyNote: 'Highlight sub-second event syncing and zero-downtime deployment history.'
    }
  },

  // 8. AI Counters Objection
  {
    stepIndex: 8,
    atSeconds: 84,
    audioStatus: 'ai_speaking',
    transcriptItem: {
      id: 'tx-8',
      speaker: 'ai_agent',
      speakerName: 'Marcus (Vidur AI)',
      text: "That is completely reasonable, David. Vidur features certified plug-and-play connectors for SAP TMS and Geotab out of the box with sub-second bi-directional dispatch updates. In fact, Midwest Freight went live with 850 trucks in just 11 business days with zero driver disruption.",
      timestamp: '01:24',
      sentiment: 'positive',
      isFinal: true
    }
  },

  // 9. Prospect Receptive & Shares Budget / Stakeholders
  {
    stepIndex: 9,
    atSeconds: 98,
    audioStatus: 'prospect_speaking',
    transcriptItem: {
      id: 'tx-9',
      speaker: 'prospect',
      speakerName: 'David Reynolds',
      text: "Eleven business days? That's night and day compared to what our telecom provider estimated. The budget is already approved in our Q3 modernization capex. On my side, Elena Vance, our VP of IT, will need to review the security architecture.",
      timestamp: '01:38',
      sentiment: 'engaged',
      isFinal: true
    },
    intelligenceEvent: {
      id: 'intel-5',
      type: 'qualification',
      title: 'QUALIFICATION: Approved Budget & Dual Stakeholder',
      description: 'Budget ring-fenced under Q3 capex. Decision makers confirmed as David Reynolds (Ops) & Elena Vance (IT).',
      quote: 'Budget is already approved in our Q3 modernization capex... Elena Vance, VP of IT will review security.',
      timestamp: '01:40',
      dimension: 'Budget',
      impactScore: 94,
      whyItMatters: 'Dual authority confirmed with pre-approved capex budget.'
    },
    qualificationUpdate: {
      dimension: 'Budget',
      status: 'confirmed',
      detail: 'Approved in Q3 Modernization Capex',
      evidence: 'Budget allocated for automated voice dispatch'
    },
    objectiveUpdate: {
      goal: 'Secure technical architecture demo with David Reynolds and Elena Vance.',
      suggestedQuestion: 'Would Thursday at 2:00 PM Central work for a 20-minute technical architecture walkthrough?',
      strategyNote: 'Propose specific date/time before the Friday committee meeting.'
    }
  },

  // 10. AI Proposes Closing Meeting
  {
    stepIndex: 10,
    atSeconds: 112,
    audioStatus: 'ai_speaking',
    transcriptItem: {
      id: 'tx-10',
      speaker: 'ai_agent',
      speakerName: 'Marcus (Vidur AI)',
      text: "Excellent. Since the committee meets this Friday, let's set up a 20-minute technical walkthrough with our Enterprise Logistics Solutions Architect this Thursday at 2:00 PM Central. We'll show live SAP TMS dispatching and hand over the SOC2 packet for Elena. Does that work?",
      timestamp: '01:52',
      sentiment: 'positive',
      isFinal: true
    }
  },

  // 11. Prospect Accepts Demo Booking
  {
    stepIndex: 11,
    atSeconds: 125,
    audioStatus: 'prospect_speaking',
    transcriptItem: {
      id: 'tx-11',
      speaker: 'prospect',
      speakerName: 'David Reynolds',
      text: "Thursday at 2 PM Central works well. Send the calendar invitation to d.reynolds@acmelogistics.com and copy elena.vance@acmelogistics.com. Include the Midwest Freight case study if you have it.",
      timestamp: '02:05',
      sentiment: 'engaged',
      isFinal: true
    },
    intelligenceEvent: {
      id: 'intel-6',
      type: 'interest',
      title: 'INTEREST: 20-Min Architecture Demo Confirmed',
      description: 'Calendar invite requested for Thursday 2:00 PM Central. Elena Vance (VP IT) added to invite.',
      quote: 'Thursday at 2 PM Central works well. Send the invite to d.reynolds@acmelogistics.com.',
      timestamp: '02:07',
      dimension: 'Decision Maker',
      impactScore: 99,
      whyItMatters: 'Next best action achieved: High-value enterprise architecture walkthrough booked.'
    },
    qualificationUpdate: {
      dimension: 'Decision Maker',
      status: 'confirmed',
      detail: 'David Reynolds (VP Ops) & Elena Vance (VP IT)',
      evidence: 'Both invited to Thursday 2 PM architecture demo'
    },
    objectiveUpdate: {
      goal: 'Confirm email addresses, wrap up professionally, and dispatch calendar invite.',
      suggestedQuestion: 'Great, dispatching the calendar invite and case study now. Have a productive dock operations sync!',
      strategyNote: 'Conclude call cleanly without dragging.'
    }
  },

  // 12. AI Concludes Call
  {
    stepIndex: 12,
    atSeconds: 135,
    audioStatus: 'ai_speaking',
    transcriptItem: {
      id: 'tx-12',
      speaker: 'ai_agent',
      speakerName: 'Marcus (Vidur AI)',
      text: "Calendar invite and case study are on their way to both of you now. Looking forward to speaking Thursday at 2 PM, David. Have a great sync!",
      timestamp: '02:15',
      sentiment: 'positive',
      isFinal: true
    },
    qualificationUpdate: {
      dimension: 'Implementation Readiness',
      status: 'confirmed',
      detail: 'Certified SAP TMS / Geotab connectors accepted',
      evidence: 'Architecture brief requested for IT review'
    }
  }
];

export function buildDynamicScriptForLead(leadId: string): ScriptProgressionStep[] {
  const lead = getLeadDetails(leadId);
  if (!lead) return ACME_CALL_SCRIPT_STEPS;

  if (lead.id === 'lead-101') {
    return ACME_CALL_SCRIPT_STEPS;
  }

  const company = lead.companyName;
  const contact = lead.decisionMakerContact?.name || lead.decisionMaker?.name || 'there';
  const role = lead.decisionMakerContact?.role || lead.decisionMaker?.role || 'Leader';
  const req = lead.requirement;
  const whyNow = lead.whyNow;

  return [
    {
      stepIndex: 1,
      atSeconds: 3,
      audioStatus: 'ai_speaking',
      transcriptItem: {
        id: `tx-${lead.id}-1`,
        speaker: 'ai_agent',
        speakerName: 'Marcus (Vidur AI)',
        text: `Hello ${contact}, Marcus calling with Vidur AI. I'm reaching out regarding ${company}'s active initiative around ${lead.industry.toLowerCase()} automation. Did I catch you with a brief minute?`,
        timestamp: '00:03',
        sentiment: 'neutral',
        isFinal: true
      },
      objectiveUpdate: {
        goal: `Verify ${company}'s current priority around ${lead.industry.toLowerCase()} requirements.`,
        suggestedQuestion: `How is your team currently approaching: "${req.slice(0, 60)}..."?`,
        strategyNote: `Trigger context: ${whyNow}`
      }
    },
    {
      stepIndex: 2,
      atSeconds: 12,
      audioStatus: 'prospect_speaking',
      transcriptItem: {
        id: `tx-${lead.id}-2`,
        speaker: 'prospect',
        speakerName: contact,
        text: `Hi Marcus. Yes, we are actively looking into this right now. Our current operations are struggling to keep up with manual workflows. What does your platform do differently?`,
        timestamp: '00:12',
        sentiment: 'engaged',
        isFinal: true
      },
      intelligenceEvent: {
        id: `intel-${lead.id}-1`,
        type: 'qualification',
        title: `QUALIFICATION: Active Evaluation Confirmed`,
        description: `${company} confirmed operational priority: "${req.slice(0, 70)}..."`,
        quote: `We are actively looking into this right now. Manual workflows are lagging.`,
        timestamp: '00:14',
        dimension: 'Need',
        impactScore: 90
      },
      qualificationUpdate: {
        dimension: 'Need',
        status: 'confirmed',
        detail: req.slice(0, 80),
        evidence: 'Prospect confirmed active evaluation'
      },
      objectiveUpdate: {
        goal: 'Identify core operational bottleneck and quantifiable cost.',
        suggestedQuestion: 'What is the biggest operational hurdle your team faces with the current approach?',
        strategyNote: 'Isolate root cause of delays.'
      }
    },
    {
      stepIndex: 3,
      atSeconds: 24,
      audioStatus: 'ai_speaking',
      transcriptItem: {
        id: `tx-${lead.id}-3`,
        speaker: 'ai_agent',
        speakerName: 'Marcus (Vidur AI)',
        text: `We specialize in autonomous AI agents that identify high-intent accounts and engage them with sub-second voice interactions. What is the biggest operational drag you are experiencing right now?`,
        timestamp: '00:24',
        sentiment: 'neutral',
        isFinal: true
      }
    },
    {
      stepIndex: 4,
      atSeconds: 36,
      audioStatus: 'prospect_speaking',
      transcriptItem: {
        id: `tx-${lead.id}-4`,
        speaker: 'prospect',
        speakerName: contact,
        text: `Mainly lead turnaround time and repetitive qualification calls. Our team spends hours on manual outreach instead of closing high-value discussions.`,
        timestamp: '00:36',
        sentiment: 'engaged',
        isFinal: true
      },
      intelligenceEvent: {
        id: `intel-${lead.id}-2`,
        type: 'buying_signal',
        title: 'BUYING SIGNAL: Manual Outreach Bottleneck',
        description: 'Repetitive qualification calls consuming valuable bandwidth.',
        quote: 'Our team spends hours on manual outreach instead of closing deals.',
        timestamp: '00:38',
        dimension: 'Pain Point',
        impactScore: 94
      },
      qualificationUpdate: {
        dimension: 'Pain Point',
        status: 'confirmed',
        detail: 'Turnaround latency and repetitive qualification overhead',
        evidence: 'Prospect shared direct pain regarding manual calling'
      },
      objectiveUpdate: {
        goal: 'Qualify project implementation timeline and evaluation milestones.',
        suggestedQuestion: 'What target timeframe are you working toward for rolling out a solution?',
        strategyNote: 'Confirm urgent evaluation window.'
      }
    },
    {
      stepIndex: 5,
      atSeconds: 48,
      audioStatus: 'ai_speaking',
      transcriptItem: {
        id: `tx-${lead.id}-5`,
        speaker: 'ai_agent',
        speakerName: 'Marcus (Vidur AI)',
        text: `That is the exact problem we eliminate. When is ${company} targeting to have an automated pipeline solution in place?`,
        timestamp: '00:48',
        sentiment: 'neutral',
        isFinal: true
      }
    },
    {
      stepIndex: 6,
      atSeconds: 60,
      audioStatus: 'prospect_speaking',
      transcriptItem: {
        id: `tx-${lead.id}-6`,
        speaker: 'prospect',
        speakerName: contact,
        text: `Ideally by next quarter. We have leadership review scheduled in two weeks. Do you have benchmark results for companies in ${lead.industry}?`,
        timestamp: '01:00',
        sentiment: 'engaged',
        isFinal: true
      },
      intelligenceEvent: {
        id: `intel-${lead.id}-3`,
        type: 'interest',
        title: `INTEREST: Industry Benchmarks Requested`,
        description: `Leadership review scheduled in 2 weeks; target rollout next quarter.`,
        quote: `Ideally next quarter. Leadership review in two weeks.`,
        timestamp: '01:02',
        dimension: 'Timeline',
        impactScore: 95
      },
      qualificationUpdate: {
        dimension: 'Timeline',
        status: 'confirmed',
        detail: 'Target rollout next quarter; review in 2 weeks',
        evidence: 'Leadership presentation scheduled'
      },
      objectiveUpdate: {
        goal: 'Propose a tailored 15-minute briefing demo.',
        suggestedQuestion: 'How about a concise 15-minute demo to review peer benchmarks and live voice agents?',
        strategyNote: 'Anchor demo before their leadership review.'
      }
    },
    {
      stepIndex: 7,
      atSeconds: 72,
      audioStatus: 'ai_speaking',
      transcriptItem: {
        id: `tx-${lead.id}-7`,
        speaker: 'ai_agent',
        speakerName: 'Marcus (Vidur AI)',
        text: `Yes, we have verified benchmark case studies showing a 65% reduction in CAC. Let's do a 15-minute briefing this Thursday afternoon to show you the live system and share the data before your leadership sync. How does 3 PM look?`,
        timestamp: '01:12',
        sentiment: 'positive',
        isFinal: true
      }
    },
    {
      stepIndex: 8,
      atSeconds: 84,
      audioStatus: 'prospect_speaking',
      transcriptItem: {
        id: `tx-${lead.id}-8`,
        speaker: 'prospect',
        speakerName: contact,
        text: `Thursday at 3 PM works for me. Send the calendar link and the benchmark deck to my email. Looking forward to it.`,
        timestamp: '01:24',
        sentiment: 'engaged',
        isFinal: true
      },
      intelligenceEvent: {
        id: `intel-${lead.id}-4`,
        type: 'interest',
        title: 'INTEREST: Discovery Demo Booked',
        description: `Prospect agreed to Thursday 3 PM briefing.`,
        quote: `Thursday at 3 PM works for me. Send the calendar link.`,
        timestamp: '01:26',
        dimension: 'Decision Maker',
        impactScore: 98
      },
      qualificationUpdate: {
        dimension: 'Decision Maker',
        status: 'confirmed',
        detail: `${contact} (${role})`,
        evidence: 'Direct dial stakeholder confirmed demo'
      }
    },
    {
      stepIndex: 9,
      atSeconds: 94,
      audioStatus: 'ai_speaking',
      transcriptItem: {
        id: `tx-${lead.id}-9`,
        speaker: 'ai_agent',
        speakerName: 'Marcus (Vidur AI)',
        text: `You got it, ${contact}. Invitation is sent. Speak with you Thursday at 3 PM!`,
        timestamp: '01:34',
        sentiment: 'positive',
        isFinal: true
      }
    }
  ];
}

export function createMockCallSession(
  leadId: string,
  customCallId?: string,
  language: CallLanguage = 'English'
): CallSession {
  const lead = getLeadDetails(leadId) || mockDiscoveredLeads[0];
  const callId = customCallId || `call-${lead.id.replace('lead-', '')}`;

  const decisionMaker = lead.decisionMakerContact?.name || lead.decisionMaker?.name || 'David Reynolds';
  const role = lead.decisionMakerContact?.role || lead.decisionMaker?.role || 'Operations Leader';
  const phone = lead.decisionMaker?.phone || '+1 (312) 555-0184';

  return {
    callId,
    leadId: lead.id,
    companyName: lead.companyName,
    companyDomain: lead.companyDomain,
    contactName: decisionMaker,
    contactRole: role,
    contactPhone: phone,
    language,
    status: 'PRE_CALL',
    audioStatus: 'idle',
    duration: 0,
    isMuted: false,
    isHumanTakeover: false,
    primaryOutcome: 'Discovery Architecture Demo Scheduled (Thursday 2:00 PM Central)',
    currentObjective: {
      goal: `Verify ${lead.companyName}'s active requirement and confirm dispatch bottleneck.`,
      suggestedQuestion: `How is your team currently handling ${lead.industry.toLowerCase()} touchpoints and qualification?`,
      strategyNote: `Direct reference to trigger signal: ${lead.whyNow}`
    },
    transcript: [],
    intelligenceEvents: [],
    qualification: JSON.parse(JSON.stringify(INITIAL_QUALIFICATION_DIMENSIONS))
  };
}
