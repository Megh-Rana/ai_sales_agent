import { DiscoveredLead } from '../types/leads';

export const enterpriseDossiers: Record<string, DiscoveredLead> = {
  'opp-101': {
    id: 'opp-101',
    companyName: 'Razorpay Software Private Limited',
    companyDomain: 'razorpay.com',
    industry: 'Fintech · Payments Infrastructure',
    location: 'Bengaluru, Karnataka',
    employeeCount: '2,500+ employees',
    requirement: 'Deploying autonomous outbound calling cadences and CRM signal sync for 25-rep sales floor.',
    detailedPain: 'Manual dialer latency and disconnected phone outreach lead to 38% merchant drop-off during onboarding.',
    intentScore: 94,
    intentLevel: 'high',
    scoreReasons: [
      'Hiring 5 Outbound SDRs & Head of Sales Ops on LinkedIn (48h ago)',
      'Legacy premise dialer contract renewal in 45 days',
      'High ICP fit: ₹200 Cr+ GMV and 25-rep sales floor'
    ],
    whyNow: 'Hiring surge (5 outbound SDRs posted 48h ago) + legacy dialer contract renewal in 45 days.',
    buyingSignals: [
      {
        id: 'sig-101-1',
        type: 'Hiring Surge',
        description: 'Hiring 5 Outbound SDRs and 1 Sales Ops Lead within 48 hours.',
        timestamp: '42m ago',
        impactScore: 95
      },
      {
        id: 'sig-101-2',
        type: 'Contract Renewal',
        description: 'Existing dialer contract expiring in 45 days; actively evaluating modern alternatives.',
        timestamp: '2h ago',
        impactScore: 90
      },
      {
        id: 'sig-101-3',
        type: 'High ICP Fit',
        description: '100% ICP match on employee count, revenue tier (₹200 Cr+), and outbound motion.',
        timestamp: '1d ago',
        impactScore: 94
      }
    ],
    source: {
      platform: 'LinkedIn Jobs & MCA Filings',
      originalRequirement: 'Job listing: Head of Sales Ops & 5 Outbound SDRs (Tech: Salesforce/AI)',
      sourceUrl: 'https://linkedin.com/jobs/view/razorpay-sales-ops',
      discoveredAt: '38m ago',
      postedAt: '48h ago'
    },
    estimatedValue: '₹70,00,000 / yr',
    recommendedAction: 'call',
    suggestedOpeningHook: 'Noticed your team is scaling outbound headcount by 5 SDRs while evaluating modern sales automation ahead of the dialer renewal...',
    decisionMakerContact: {
      name: 'Priya Sharma',
      role: 'VP Sales Operations',
      phoneAvailable: true
    },
    decisionMaker: {
      name: 'Priya Sharma',
      role: 'VP Sales Operations',
      department: 'Revenue Operations & Commercial Strategy',
      email: 'priya.sharma@razorpay.com',
      phone: '+91 98450 12890',
      phoneAvailable: true,
      confidence: 96,
      isDirectDial: true,
      linkedInUrl: 'https://www.linkedin.com/in/priya-sharma-salesops'
    },
    status: 'high-intent',
    lastActivity: '38m ago',
    enrichmentState: 'completed',
    companyIntelligence: {
      overview: 'Razorpay is India\'s premier payments infrastructure and neobanking platform powering millions of online and offline merchants.',
      scale: 'Bengaluru HQ · 2,500+ employees · ₹200 Cr+ Enterprise Tier',
      techStack: {
        confirmed: ['Salesforce CRM', 'AWS Cloud', 'Twilio Voice', 'Segment CDP'],
        displacing: ['Legacy Premise Dialer', 'Manual Outbound Spreadsheets']
      },
      aiInferences: [
        {
          deduction: 'Scaling outbound SDR cadence to meet Q4 enterprise merchant onboarding targets.',
          confidence: 95,
          basis: '5 newly opened SDR requisitions in Bengaluru.'
        },
        {
          deduction: 'Urgent replacement required before 45-day dialer renewal deadline.',
          confidence: 92,
          basis: 'Vendor contract expiration date logged via IT procurement audit.'
        }
      ],
      potentialPainPoints: [
        'Manual dialer lag causes 38% missed connection rates during peak merchant onboarding hours.',
        'High rep overhead spent on un-transcribed call logging in Salesforce.',
        'Sales floor unable to support vernacular multilingual qualification in Tier-2/Tier-3 cities.'
      ]
    },
    recommendedPitch: {
      pitch: 'Hi Priya, noticed your team is scaling outbound headcount by 5 SDRs while evaluating modern sales automation ahead of the dialer renewal. We provide autonomous AI voice agents with native Salesforce sync and sub-400ms latency. Would 10 minutes on Thursday work to compare benchmarks?',
      whyThisPitch: [
        'Directly targets Priya Sharma’s immediate SDR expansion mandate.',
        'Addresses their active dialer contract expiration in 45 days.',
        'Demonstrates native compatibility with their confirmed Salesforce/AWS stack.'
      ],
      keyAngle: 'Autonomous Vernacular Voice Qualification & Native Salesforce Sync',
      toneVariations: {
        direct: 'Priya, saw Razorpay adding 5 SDRs ahead of your dialer renewal. Our AI voice agents qualify inbound merchants in 60s with sub-400ms latency. Let’s do 10 minutes this week.',
        valueLed: 'Hi Priya, other fintech leaders partner with Vidur to eliminate 38% merchant drop-off and automate 25-rep outbound cadences without adding headcounts.',
        technical: 'Regarding Razorpay\'s architecture: our voice agents connect directly to Salesforce and Twilio via WebRTC, delivering 42ms SIP response times and automated transcription.'
      }
    },
    callBrief: {
      opening: 'Hi Priya, noticed your team is scaling outbound headcount by 5 SDRs while evaluating modern sales automation ahead of the dialer renewal...',
      leadContext: 'Razorpay is expanding enterprise merchant acquisition with 25 reps. Manual dialer latency and disconnected phone outreach lead to 38% merchant drop-off.',
      keySignal: 'Hiring surge (5 outbound SDRs posted 48h ago) + legacy dialer contract renewal in 45 days.',
      discoveryQuestion: 'How is your team currently bridging the speed-to-lead gap between merchant sign-ups and first SDR phone touchpoints?',
      potentialObjection: 'We are already deep into renewal conversations with our existing telephony vendor.',
      objectionCounter: 'Understood, Priya. Many fintechs initially felt the same until they saw our autonomous agents achieve sub-400ms conversation latency with direct Salesforce bi-directional sync. Could we show you a 3-minute live test before your renewal locks in?',
      desiredOutcome: 'Schedule a 20-minute tailored technical demo and latency benchmark comparison with Priya and the Sales Ops lead.'
    },
    timeline: [
      { id: 'ev-101-1', timestamp: '48h ago', title: '5 Outbound SDR Roles Posted', description: 'Captured from LinkedIn Jobs: Razorpay hiring 5 Outbound SDRs & Sales Ops Lead.', category: 'discovery' },
      { id: 'ev-101-2', timestamp: '2h ago', title: 'Dialer Contract Expiration Confirmed', description: 'Telemetry detected active telephony vendor contract expiring in 45 days.', category: 'signal' },
      { id: 'ev-101-3', timestamp: '38m ago', title: 'Intent Score Calculated: 94%', description: 'High ICP match + executive buying signals triggered Priority 1 classification.', category: 'enrichment' },
      { id: 'ev-101-4', timestamp: 'Just now', title: 'Sales Brief & Pitch Ready', description: 'Synthesized tailored outbound pitch for Priya Sharma (VP Sales Operations).', category: 'call' }
    ],
    provenance: {
      platform: 'LinkedIn Jobs & MCA Filings',
      originalRequirement: 'Job listing: Head of Sales Ops & 5 Outbound SDRs (Tech: Salesforce/AI)',
      sourceUrl: 'https://linkedin.com/jobs/view/razorpay-sales-ops',
      discoveredAt: '38m ago',
      postedAt: '48h ago',
      lastUpdated: 'Today · Active',
      freshness: 'Fresh (Captured within 48h)'
    },
    website: 'https://razorpay.com',
    jobTitle: 'VP Sales Operations',
    contactEmail: 'priya.sharma@razorpay.com',
    contactPhone: '+91 98450 12890',
    linkedinUrl: 'https://linkedin.com/company/razorpay'
  },

  'opp-102': {
    id: 'opp-102',
    companyName: 'Freshworks Inc.',
    companyDomain: 'freshworks.com',
    industry: 'SaaS · Customer Engagement',
    location: 'Chennai, Tamil Nadu',
    employeeCount: '5,000+ employees',
    requirement: 'Replacing legacy telephony infrastructure with autonomous voice agent integration.',
    detailedPain: 'Legacy SIP dialer creates 1.2-second latency gaps during outbound qualification conversations.',
    intentScore: 91,
    intentLevel: 'high',
    scoreReasons: [
      'Removed legacy telephony tags from production DNS records (1h ago)',
      'CTO published inquiry evaluating automated voice qualification agents (4h ago)',
      'Enterprise SaaS scale with 5,000+ employees'
    ],
    whyNow: 'Decommissioning legacy SIP trunk provider; CTO actively evaluating sub-50ms voice calling API.',
    buyingSignals: [
      {
        id: 'sig-102-1',
        type: 'Tech Migration',
        description: 'Removed legacy telephony tags from production DNS records.',
        timestamp: '1h ago',
        impactScore: 92
      },
      {
        id: 'sig-102-2',
        type: 'Executive Trigger',
        description: 'CTO published inquiry evaluating automated voice qualification agents.',
        timestamp: '4h ago',
        impactScore: 89
      }
    ],
    source: {
      platform: 'BuiltWith & GitHub Feeds',
      originalRequirement: 'Decommissioning legacy SIP trunk provider; seeking AI calling API with compliance.',
      sourceUrl: 'https://builtwith.com/freshworks.com',
      discoveredAt: '1h ago',
      postedAt: '4h ago'
    },
    estimatedValue: '₹90,00,000 / yr',
    recommendedAction: 'call',
    suggestedOpeningHook: 'Arjun, saw Freshworks decommissioning legacy SIP telephony. We deliver sub-50ms voice AI with native CRM sync...',
    decisionMakerContact: {
      name: 'Arjun Mehta',
      role: 'Chief Technology Officer',
      phoneAvailable: true
    },
    decisionMaker: {
      name: 'Arjun Mehta',
      role: 'Chief Technology Officer',
      department: 'Executive Engineering & Architecture',
      email: 'arjun.mehta@freshworks.com',
      phone: '+91 98200 45671',
      phoneAvailable: true,
      confidence: 94,
      isDirectDial: true,
      linkedInUrl: 'https://www.linkedin.com/in/arjun-mehta-cto'
    },
    status: 'qualified',
    lastActivity: '1h ago',
    enrichmentState: 'completed',
    companyIntelligence: {
      overview: 'Freshworks makes modern software for businesses to delight customers and employees across CRM, IT, and customer service.',
      scale: 'Chennai & San Mateo · 5,000+ employees · Public SaaS',
      techStack: {
        confirmed: ['Freshsales CRM', 'AWS Cloud', 'WebRTC Gateway', 'Node.js Microservices'],
        displacing: ['Premise SIP Telephony PBX']
      },
      aiInferences: [
        {
          deduction: 'Transitioning from commodity VoIP trunks to intelligent conversational voice APIs.',
          confidence: 93,
          basis: 'Removal of legacy telephony DNS tags and CTO technical inquiry.'
        }
      ],
      potentialPainPoints: [
        'Legacy SIP dialer creates 1.2-second latency gaps during outbound qualification conversations.',
        'High maintenance overhead on on-premise PBX servers scheduled for 2026 decommission.'
      ]
    },
    recommendedPitch: {
      pitch: 'Hi Arjun, saw Freshworks actively modernizing telephony infrastructure away from legacy SIP PBX. Our sub-50ms voice AI connects natively via WebRTC with direct CRM event streaming. Would 15 minutes be helpful to test live latency on your test number?',
      whyThisPitch: [
        'Directly addresses CTO Arjun Mehta’s infrastructure migration project.',
        'Highlights sub-50ms latency as the key technical differentiator.',
        'Offers a risk-free test call on their own staging environment.'
      ],
      keyAngle: 'Sub-50ms WebRTC Voice Engine & Zero-Maintenance Cloud Telephony',
      toneVariations: {
        direct: 'Arjun, noticed Freshworks retiring legacy SIP trunks. Our AI voice engine delivers sub-50ms latency and native WebRTC. Let’s do a quick architecture benchmark.',
        valueLed: 'Hi Arjun, SaaS engineering leaders choose Vidur to replace clunky telephony stacks with seamless AI calling without handling telecom compliance.',
        technical: 'Regarding Freshworks’ stack: our voice agent runs over low-jitter WebRTC with real-time bidirectional audio streaming and sub-400ms end-to-end turn turnaround.'
      }
    },
    callBrief: {
      opening: 'Hi Arjun, saw Freshworks actively modernizing telephony infrastructure away from legacy SIP PBX...',
      leadContext: 'Freshworks is migrating away from premise PBX. Latency and jitter on current dialer degrade sales rep customer interactions.',
      keySignal: 'Legacy SIP telephony tags removed from production DNS; CTO inquiry published 4h ago.',
      discoveryQuestion: 'What are your primary latency and security benchmarks for the new voice communications architecture?',
      potentialObjection: 'We have internal engineering teams evaluating building an in-house voice layer.',
      objectionCounter: 'Building real-time voice with sub-50ms turn-taking and telecom compliance typically takes 9+ months of dedicated infra engineering. We provide pre-built turnkey APIs that integrate into your Freshsales stack in 2 days.',
      desiredOutcome: 'Schedule an architecture review and live sandbox test with Arjun and the Principal VoIP Architect.'
    },
    timeline: [
      { id: 'ev-102-1', timestamp: '4h ago', title: 'CTO Voice Inquiry Published', description: 'Arjun Mehta published inquiry evaluating low-latency voice APIs.', category: 'discovery' },
      { id: 'ev-102-2', timestamp: '1h ago', title: 'DNS Telephony Tags Retired', description: 'Automated crawler detected removal of legacy PBX tags from freshworks.com.', category: 'signal' },
      { id: 'ev-102-3', timestamp: '30m ago', title: 'Technical Brief Prepared', description: 'Prepared WebRTC architectural specs and latency benchmarks.', category: 'call' }
    ],
    provenance: {
      platform: 'BuiltWith & GitHub Feeds',
      originalRequirement: 'Decommissioning legacy SIP trunk provider; seeking AI calling API with compliance.',
      sourceUrl: 'https://builtwith.com/freshworks.com',
      discoveredAt: '1h ago',
      postedAt: '4h ago',
      lastUpdated: 'Today · Active',
      freshness: 'Fresh (Captured within 4h)'
    },
    website: 'https://freshworks.com',
    jobTitle: 'Chief Technology Officer',
    contactEmail: 'arjun.mehta@freshworks.com',
    contactPhone: '+91 98200 45671',
    linkedinUrl: 'https://linkedin.com/company/freshworks-inc'
  },

  'opp-106': {
    id: 'opp-106',
    companyName: 'Zerodha Broking Limited',
    companyDomain: 'zerodha.com',
    industry: 'Fintech · Brokerage & Capital Markets',
    location: 'Bengaluru, Karnataka',
    employeeCount: '1,500+ employees',
    requirement: 'Integrating low-latency AI voice agent with internal trading support APIs.',
    detailedPain: 'Peak market hours create support phone queues exceeding 8 minutes, frustrating active day traders.',
    intentScore: 92,
    intentLevel: 'high',
    scoreReasons: [
      'Sandbox API testing detected 40+ simulated voice interactions today (1h ago)',
      'Technical diligence completed on sub-50ms voice latency requirements (3h ago)',
      '1,500+ employees with millions of daily retail active traders'
    ],
    whyNow: 'Sandbox API testing detected 40+ simulated voice interactions today; technical diligence underway.',
    buyingSignals: [
      {
        id: 'sig-106-1',
        type: 'API Evaluation Surge',
        description: 'Sandbox API testing detected 40+ simulated voice interactions today.',
        timestamp: '1h ago',
        impactScore: 93
      },
      {
        id: 'sig-106-2',
        type: 'Buying Intent',
        description: 'Technical diligence review completed on sub-50ms voice latency requirements.',
        timestamp: '3h ago',
        impactScore: 91
      }
    ],
    source: {
      platform: 'GitHub & MCA Tech Filings',
      originalRequirement: 'Active engineering evaluation for high-throughput SIP voice automation.',
      sourceUrl: 'https://github.com/zerodhatech',
      discoveredAt: '1h ago',
      postedAt: '3h ago'
    },
    estimatedValue: '₹95,00,000 / yr',
    recommendedAction: 'call',
    suggestedOpeningHook: 'Naveen, saw Zerodha engineering testing high-throughput voice APIs today. Our sub-50ms engine connects directly with Kite...',
    decisionMakerContact: {
      name: 'Naveen Kumar',
      role: 'VP Product & Engineering',
      phoneAvailable: true
    },
    decisionMaker: {
      name: 'Naveen Kumar',
      role: 'VP Product & Engineering',
      department: 'Product Architecture & Platform Engineering',
      email: 'naveen.k@zerodha.com',
      phone: '+91 97400 33219',
      phoneAvailable: true,
      confidence: 95,
      isDirectDial: true,
      linkedInUrl: 'https://www.linkedin.com/in/naveen-kumar-zerodha'
    },
    status: 'qualified',
    lastActivity: '1h ago',
    enrichmentState: 'completed',
    companyIntelligence: {
      overview: 'Zerodha is India\'s largest retail stock broker, pioneering zero-brokerage trading with millions of daily active capital market traders.',
      scale: 'Bengaluru HQ · 1,500+ employees · 1.2 Crore Active Traders',
      techStack: {
        confirmed: ['Kite Core API', 'Go Microservices', 'PostgreSQL', 'Kafka'],
        displacing: ['Manual Outbound Support Queues']
      },
      aiInferences: [
        {
          deduction: 'Evaluating ultra-low latency voice agents to automate high-volume trader authentication and advisory notifications.',
          confidence: 96,
          basis: '40+ simulated sandbox API calls logged from Zerodha engineering subnet.'
        }
      ],
      potentialPainPoints: [
        'Peak market hours create support phone queues exceeding 8 minutes.',
        'Need strictly sub-50ms latency voice synthesis to feel instantaneous to traders.'
      ]
    },
    recommendedPitch: {
      pitch: 'Hi Naveen, noticed Zerodha engineering evaluating voice API performance today. We built a specialized voice engine delivering guaranteed sub-50ms turn-taking latency and direct Kite API authentication. Would 10 minutes be useful to review our Go SDK?',
      whyThisPitch: [
        'Recognizes their sandbox API testing activity.',
        'Addresses Zerodha\'s exacting low-latency and performance standards.',
        'Highlights Go SDK and high-concurrency architecture.'
      ],
      keyAngle: 'Sub-50ms Turnaround & Native Go Microservice Integration',
      toneVariations: {
        direct: 'Naveen, saw Zerodha testing voice APIs. We offer guaranteed sub-50ms latency with native Go SDK support. Let’s do 10 minutes on Thursday.',
        valueLed: 'Hi Naveen, top fintech trading platforms use our voice engine to handle 50,000 peak concurrent market-open calls without human intervention.',
        technical: 'Regarding Kite integration: our API communicates over gRPC/WebRTC, streaming sub-20ms audio chunks with zero GC overhead.'
      }
    },
    callBrief: {
      opening: 'Hi Naveen, noticed Zerodha engineering evaluating voice API performance today...',
      leadContext: 'Zerodha handles extreme morning market volatility spikes. Manual support phone queues cannot scale to millions of concurrent traders.',
      keySignal: '40+ sandbox calls executed in last hour; sub-50ms latency review logged.',
      discoveryQuestion: 'What are your concurrency and audio streaming latency requirements during 9:15 AM market opening spikes?',
      potentialObjection: 'We build everything in-house with Go and self-hosted infrastructure.',
      objectionCounter: 'We completely respect Zerodha’s engineering culture. That is why our engine is designed with an open Go SDK and can deploy on your private VPC with zero data egress.',
      desiredOutcome: 'Secure a technical architecture review and sandbox proof-of-concept with Naveen.'
    },
    timeline: [
      { id: 'ev-106-1', timestamp: '3h ago', title: 'Technical Diligence Logged', description: 'Zerodha security and engineering team reviewed voice API specifications.', category: 'discovery' },
      { id: 'ev-106-2', timestamp: '1h ago', title: '40+ API Calls Detected', description: 'Sandbox telemetry detected 40+ simulated voice interactions.', category: 'signal' },
      { id: 'ev-106-3', timestamp: '20m ago', title: 'Engineering Brief Ready', description: 'Synthesized Go SDK technical brief and private VPC deployment guide.', category: 'call' }
    ],
    provenance: {
      platform: 'GitHub & MCA Tech Filings',
      originalRequirement: 'Active engineering evaluation for high-throughput SIP voice automation.',
      sourceUrl: 'https://github.com/zerodhatech',
      discoveredAt: '1h ago',
      postedAt: '3h ago',
      lastUpdated: 'Today · Active',
      freshness: 'Fresh (Captured within 3h)'
    },
    website: 'https://zerodha.com',
    jobTitle: 'VP Product & Engineering',
    contactEmail: 'naveen.k@zerodha.com',
    contactPhone: '+91 97400 33219',
    linkedinUrl: 'https://linkedin.com/company/zerodha'
  },

  'opp-103': {
    id: 'opp-103',
    companyName: 'PharmEasy (API Holdings)',
    companyDomain: 'pharmeasy.in',
    industry: 'HealthTech · D2C Pharma',
    location: 'Mumbai, Maharashtra',
    employeeCount: '3,000+ employees',
    requirement: 'Autonomous outbound outreach to pharmacy chain decision makers with compliance-grade dialing.',
    detailedPain: 'Outsourced agency dialing achieves only 12% qualification rate with poor compliance tracking.',
    intentScore: 88,
    intentLevel: 'high',
    scoreReasons: [
      'Closed ₹200 Cr Series-D growth round earmarking expansion in pharmacy outbound (3h ago)',
      'Multiple visits from Mumbai IP to Vidur Security & Compliance page (5h ago)',
      '3,000+ employees with nationwide retail distributor expansion mandate'
    ],
    whyNow: 'Series-D ₹200 Cr growth round closed; allocated for commercial GTM expansion in retail pharmacies.',
    buyingSignals: [
      {
        id: 'sig-103-1',
        type: 'Growth Capital',
        description: 'Closed ₹200 Cr Series-D round earmarking expansion in pharmacy outbound.',
        timestamp: '3h ago',
        impactScore: 91
      },
      {
        id: 'sig-103-2',
        type: 'Buyer Intent',
        description: 'Multiple visits from Mumbai IP to Vidur Security & Compliance page.',
        timestamp: '5h ago',
        impactScore: 85
      }
    ],
    source: {
      platform: 'TechCrunch / MCA Filings',
      originalRequirement: 'Series-D ₹200 Cr growth round closed; allocated for commercial GTM expansion.',
      sourceUrl: 'https://techcrunch.com/fundings/pharmeasy-d',
      discoveredAt: '3h ago',
      postedAt: '3h ago'
    },
    estimatedValue: '₹58,00,000 / yr',
    recommendedAction: 'call',
    suggestedOpeningHook: 'Dr. Kavita, congratulations on the ₹200 Cr Series-D round. Are you looking to scale outbound pharmacy network acquisition with automated voice agents?',
    decisionMakerContact: {
      name: 'Dr. Kavita Iyer',
      role: 'Chief Growth Officer',
      phoneAvailable: true
    },
    decisionMaker: {
      name: 'Dr. Kavita Iyer',
      role: 'Chief Growth Officer',
      department: 'Commercial Growth & Retail Expansion',
      email: 'kavita.iyer@pharmeasy.in',
      phone: '+91 98190 77124',
      phoneAvailable: true,
      confidence: 93,
      isDirectDial: true,
      linkedInUrl: 'https://www.linkedin.com/in/dr-kavita-iyer'
    },
    status: 'meeting',
    lastActivity: '3h ago',
    enrichmentState: 'completed',
    companyIntelligence: {
      overview: 'PharmEasy is India\'s leading healthcare platform delivering prescription medicines, diagnostic lab tests, and doctor teleconsultations.',
      scale: 'Mumbai HQ · 3,000+ employees · ₹200 Cr Series-D Expansion',
      techStack: {
        confirmed: ['LeadSquared CRM', 'Exotel Voice', 'MongoDB', 'G Suite Enterprise'],
        displacing: ['Manual Tele-Calling Vendor Agency']
      },
      aiInferences: [
        {
          deduction: 'Capital deployed to recruit 15,000+ independent retail chemist partners across Tier-2/3 cities.',
          confidence: 92,
          basis: 'Series-D prospectus explicitly mentions offline pharmacy network onboarding.'
        }
      ],
      potentialPainPoints: [
        'Outsourced agency dialing achieves only 12% qualification rate with poor compliance tracking.',
        'Retail pharmacist phone contacts require precise appointment scheduling and medical terminology.'
      ]
    },
    recommendedPitch: {
      pitch: 'Hi Dr. Kavita, congratulations on PharmEasy’s Series-D funding. We help healthcare platforms automate partner onboarding calls with compliance-grade AI voice agents in Hindi, Marathi, and English. Could we show you how 3 other health networks doubled their onboarding conversion?',
      whyThisPitch: [
        'References recent Series-D funding growth milestone.',
        'Speaks directly to Dr. Kavita\'s commercial growth mandate.',
        'Emphasizes healthcare compliance and vernacular language capability.'
      ],
      keyAngle: 'Healthcare Compliance & Vernacular Pharmacy Onboarding',
      toneVariations: {
        direct: 'Dr. Kavita, saw the Series-D announcement. We automate retail chemist outreach with compliance-grade AI voice agents. Let’s do 10 minutes this week.',
        valueLed: 'Hi Dr. Kavita, healthcare growth teams use our voice agents to scale merchant acquisition 3x faster than manual call centers at 60% lower cost.',
        technical: 'Regarding HIPAA/telecom compliance: all voice sessions feature encrypted call recording, DND registry scrubbing, and native LeadSquared sync.'
      }
    },
    callBrief: {
      opening: 'Hi Dr. Kavita, congratulations on PharmEasy’s Series-D funding...',
      leadContext: 'PharmEasy is rapidly expanding chemist partner coverage across India. Outsourced call centers suffer high rep attrition and script errors.',
      keySignal: '₹200 Cr Series-D growth round closed; Mumbai IP visits to Vidur security portal.',
      discoveryQuestion: 'How is your growth team currently approaching outreach to thousands of independent retail chemists?',
      potentialObjection: 'We already contracted a tele-calling BPO agency for Q4 onboarding.',
      objectionCounter: 'Understood. Most healthcare brands keep their BPO for escalation, but use our AI voice agent for the first 3 touches to screen for store owner interest and book verified meeting times.',
      desiredOutcome: 'Schedule a 20-minute demonstration with Dr. Kavita and the Partner Acquisition Director.'
    },
    timeline: [
      { id: 'ev-103-1', timestamp: '5h ago', title: 'Compliance Portal Visit', description: 'Visits logged from Mumbai IP evaluating healthcare compliance docs.', category: 'signal' },
      { id: 'ev-103-2', timestamp: '3h ago', title: 'Series-D ₹200 Cr Announced', description: 'Funding wire confirmed growth capital allocation for commercial pharmacy outreach.', category: 'discovery' },
      { id: 'ev-103-3', timestamp: '1h ago', title: 'Meeting Brief Prepared', description: 'Created customized pharmacy acquisition pitch with vernacular sample audio.', category: 'call' }
    ],
    provenance: {
      platform: 'TechCrunch / MCA Filings',
      originalRequirement: 'Series-D ₹200 Cr growth round closed; allocated for commercial GTM expansion.',
      sourceUrl: 'https://techcrunch.com/fundings/pharmeasy-d',
      discoveredAt: '3h ago',
      postedAt: '3h ago',
      lastUpdated: 'Today · Active',
      freshness: 'Fresh (Captured within 3h)'
    },
    website: 'https://pharmeasy.in',
    jobTitle: 'Chief Growth Officer',
    contactEmail: 'kavita.iyer@pharmeasy.in',
    contactPhone: '+91 98190 77124',
    linkedinUrl: 'https://linkedin.com/company/pharmeasy'
  },

  'opp-107': {
    id: 'opp-107',
    companyName: 'Pine Labs Private Limited',
    companyDomain: 'pinelabs.com',
    industry: 'Fintech · Point of Sale & Merchant Commerce',
    location: 'Noida, Uttar Pradesh',
    employeeCount: '4,000+ employees',
    requirement: 'Automating Tier-2 merchant onboarding calls with regional Indian language support.',
    detailedPain: 'BPO call centers have 65% attrition and inconsistent qualification scripts across regional languages.',
    intentScore: 86,
    intentLevel: 'high',
    scoreReasons: [
      'Announced 100,000 merchant target for Q4',
      'Cadence Step 2 due today for Hindi/Tamil onboarding demo',
      '4,000+ employees and nationwide retail POS presence'
    ],
    whyNow: 'Announced 100,000 merchant target; seeking automated voice qualification in Hindi and regional languages.',
    buyingSignals: [
      {
        id: 'sig-107-1',
        type: 'Expansion Catalyst',
        description: '100,000 merchant tier-2 retail expansion drive announced for Q4.',
        timestamp: '3h ago',
        impactScore: 88
      }
    ],
    source: {
      platform: 'Economic Times & Press Releases',
      originalRequirement: 'Announced 100,000 merchant target; seeking automated voice qualification.',
      sourceUrl: 'https://economictimes.indiatimes.com/tech/pinelabs',
      discoveredAt: '3h ago',
      postedAt: '3h ago'
    },
    followUpDue: 'Due in 45 mins',
    followUpTask: 'Execute Cadence Step 2: Hindi/Tamil voice demo delivery to Merchant Ops',
    estimatedValue: '₹64,00,000 / yr',
    recommendedAction: 'followup',
    suggestedOpeningHook: 'Sandeep, following up on Pine Labs’ 100,000 merchant target. We prepared a 2-minute demo of our automated Hindi/Tamil voice onboarding...',
    decisionMakerContact: {
      name: 'Sandeep Patel',
      role: 'Head of Merchant Acquisition',
      phoneAvailable: true
    },
    decisionMaker: {
      name: 'Sandeep Patel',
      role: 'Head of Merchant Acquisition',
      department: 'Merchant Acquiring & Retail Field Ops',
      email: 'sandeep.patel@pinelabs.com',
      phone: '+91 99100 88231',
      phoneAvailable: true,
      confidence: 91,
      isDirectDial: true,
      linkedInUrl: 'https://www.linkedin.com/in/sandeep-patel-pinelabs'
    },
    status: 'follow-up',
    lastActivity: '3h ago',
    enrichmentState: 'completed',
    companyIntelligence: {
      overview: 'Pine Labs is a leading merchant commerce omnichannel platform providing smart POS terminals, payment gateway solutions, and gift card issuance.',
      scale: 'Noida HQ · 4,000+ employees · 500,000+ Merchant Network',
      techStack: {
        confirmed: ['Salesforce CRM', 'Oracle Cloud', 'Asterisk PBX', 'AWS'],
        displacing: ['Third-Party BPO Calling Centers']
      },
      aiInferences: [
        {
          deduction: 'Need automated regional voice calling in Hindi, Tamil, Telugu, and Kannada to hit 100,000 POS merchant target.',
          confidence: 90,
          basis: 'Press release targeting Tier-2 & Tier-3 retail merchant expansion.'
        }
      ],
      potentialPainPoints: [
        'BPO call centers have 65% attrition and inconsistent qualification scripts.',
        'Need native conversational Hindi and South Indian language support for merchant POS activation.'
      ]
    },
    recommendedPitch: {
      pitch: 'Hi Sandeep, following up on our conversation regarding Pine Labs’ 100,000 merchant rollout. Our voice AI conducts natural merchant qualification in Hindi, Tamil, and English with automated CRM logging. Can we share a 2-minute live audio demo today?',
      whyThisPitch: [
        'Follow-up scheduled specifically for Step 2 of the sales cadence.',
        'Demonstrates solution for multilingual regional dialect requirements.',
        'Low friction call-to-action (2-minute audio demo).'
      ],
      keyAngle: 'Native Vernacular Multilingual POS Qualification (Hindi, Tamil, Telugu)',
      toneVariations: {
        direct: 'Sandeep, checking in on the 100K POS rollout. We have Hindi and Tamil voice models ready to demo for your merchant ops team. Let’s connect today.',
        valueLed: 'Hi Sandeep, merchant acquirers using Vidur increase Tier-2 POS activation rates by 42% while cutting call center costs by more than half.',
        technical: 'Regarding telecom integration: our platform supports SIP interconnects with Asterisk and sends structured merchant responses directly into Salesforce.'
      }
    },
    callBrief: {
      opening: 'Hi Sandeep, following up on Pine Labs’ 100,000 merchant target...',
      leadContext: 'Pine Labs is executing aggressive Tier-2 POS terminal distribution. Language barriers with merchant shopkeepers stall phone conversions.',
      keySignal: '100,000 merchant tier-2 retail expansion drive announced for Q4.',
      discoveryQuestion: 'What is your current call completion rate when contacting shopkeepers outside metropolitan tier-1 cities?',
      potentialObjection: 'We already have regional field agents visiting shop owners physically.',
      objectionCounter: 'Field visits cost ₹600 per visit. Our AI voice call pre-qualifies shopkeepers for ₹15, ensuring your field agents only visit merchants who have agreed to POS installation.',
      desiredOutcome: 'Secure approval for a 500-merchant pilot test in Noida and Lucknow.'
    },
    timeline: [
      { id: 'ev-107-1', timestamp: '3h ago', title: '100K Merchant Target Announced', description: 'Pine Labs announced aggressive Q4 merchant acquisition goal.', category: 'discovery' },
      { id: 'ev-107-2', timestamp: '2h ago', title: 'Follow-Up Step Scheduled', description: 'Cadence Step 2: Multi-lingual voice demo scheduled for today.', category: 'signal' },
      { id: 'ev-107-3', timestamp: '30m ago', title: 'Hindi/Tamil Audio Brief Ready', description: 'Synthesized customized retail merchant script samples.', category: 'call' }
    ],
    provenance: {
      platform: 'Economic Times & Press Releases',
      originalRequirement: 'Announced 100,000 merchant target; seeking automated voice qualification.',
      sourceUrl: 'https://economictimes.indiatimes.com/tech/pinelabs',
      discoveredAt: '3h ago',
      postedAt: '3h ago',
      lastUpdated: 'Today · Active',
      freshness: 'Fresh (Captured within 3h)'
    },
    website: 'https://pinelabs.com',
    jobTitle: 'Head of Merchant Acquisition',
    contactEmail: 'sandeep.patel@pinelabs.com',
    contactPhone: '+91 99100 88231',
    linkedinUrl: 'https://linkedin.com/company/pine-labs'
  },

  'opp-104': {
    id: 'opp-104',
    companyName: 'Delhivery Limited',
    companyDomain: 'delhivery.com',
    industry: 'Logistics · Supply Chain',
    location: 'Gurugram, Haryana',
    employeeCount: '10,000+ employees',
    requirement: 'Multi-touch outbound cadence automation across 4 regional distribution hubs.',
    detailedPain: 'Regional dispatch coordinators spend 4.5 hours daily making routine driver scheduling calls, causing dispatch delays.',
    intentScore: 84,
    intentLevel: 'high',
    scoreReasons: [
      'Tier-1 buyer intent score registered on G2 outbound category (5h ago)',
      'Multi-touch outbound cadence automation across 4 regional hubs',
      '10,000+ enterprise logistics employees'
    ],
    whyNow: 'High-frequency comparison between Vidur and legacy dialers logged on G2.',
    buyingSignals: [
      {
        id: 'sig-104-1',
        type: 'G2 Intent Surge',
        description: 'Tier-1 buyer intent score registered on outbound sales automation category.',
        timestamp: '5h ago',
        impactScore: 86
      }
    ],
    source: {
      platform: 'G2 Buyer Intent',
      originalRequirement: 'High-frequency comparison between Vidur and legacy cadence platforms.',
      sourceUrl: 'https://g2.com/buyer-intent/delhivery',
      discoveredAt: '5h ago',
      postedAt: '5h ago'
    },
    followUpDue: 'Due in 22 mins',
    followUpTask: 'Dispatch Touchpoint 3: Reference recent G2 category comparison and benchmarks',
    estimatedValue: '₹1,08,00,000 / yr',
    recommendedAction: 'followup',
    suggestedOpeningHook: 'Rohan, following up on our logistics cadence discussion. I noticed your team evaluating voice automation on G2...',
    decisionMakerContact: {
      name: 'Rohan Kapoor',
      role: 'Head of Enterprise Sales',
      phoneAvailable: true
    },
    decisionMaker: {
      name: 'Rohan Kapoor',
      role: 'Head of Enterprise Sales',
      department: 'Enterprise Logistics & B2B Solutions',
      email: 'rohan.kapoor@delhivery.com',
      phone: '+91 98110 54321',
      phoneAvailable: true,
      confidence: 90,
      isDirectDial: true,
      linkedInUrl: 'https://www.linkedin.com/in/rohan-kapoor-delhivery'
    },
    status: 'follow-up',
    lastActivity: '5h ago',
    enrichmentState: 'completed',
    companyIntelligence: {
      overview: 'Delhivery is India\'s largest fully integrated logistics provider, covering over 18,500 pin codes with express parcel, PTL, and supply chain services.',
      scale: 'Gurugram HQ · 10,000+ employees · ₹1.08 Cr Enterprise ARR',
      techStack: {
        confirmed: ['SAP TMS', 'Geotab Telematics', 'Twilio Voice API', 'PostgreSQL'],
        displacing: ['Manual Hub Dispatch Calling Teams']
      },
      aiInferences: [
        {
          deduction: 'Looking to automate driver exception calls and delivery window confirmations across major hubs.',
          confidence: 88,
          basis: 'G2 buyer intent surge logged from Delhivery network IP range.'
        }
      ],
      potentialPainPoints: [
        'Regional dispatch coordinators spend 4.5 hours daily making routine driver scheduling calls.',
        'Delivery exceptions create detention penalties when updates fail to reach shippers in real time.'
      ]
    },
    recommendedPitch: {
      pitch: 'Hi Rohan, following up on our logistics automation cadence. I noticed your team comparing voice AI platforms on G2 this morning. We integrate directly into SAP TMS to execute 10,000 automated driver and shipper dispatch calls per hour with zero rep lag. Would 10 minutes today be timely?',
      whyThisPitch: [
        'Leverages real-time G2 Buyer Intent surge.',
        'Aligns with scheduled Touchpoint 3 follow-up deadline.',
        'Addresses large-scale distribution hub dispatch volume.'
      ],
      keyAngle: 'Native SAP TMS Dispatch & 10,000 Calls/Hour Elastic Scale',
      toneVariations: {
        direct: 'Rohan, following up on our dispatch discussion. Saw Delhivery on G2 today. Our voice AI automates 10K daily hub calls natively with SAP TMS. Let’s connect for 10 mins.',
        valueLed: 'Hi Rohan, logistics giants partner with Vidur to eliminate 45-minute dock delays and automate 80% of driver exception touchpoints.',
        technical: 'Regarding SAP TMS integration: our webhooks trigger instant automated calls on shipment milestone changes with sub-second response logging.'
      }
    },
    callBrief: {
      opening: 'Hi Rohan, following up on our logistics cadence discussion...',
      leadContext: 'Delhivery operates 4 major hubs handling millions of packages. Phone tag between dispatchers and drivers creates terminal bottlenecks.',
      keySignal: 'G2 buyer intent surge logged 5h ago; Touchpoint 3 follow-up due now.',
      discoveryQuestion: 'How many hours are your regional hub dispatchers currently spending on manual telephone check-ins?',
      potentialObjection: 'We already built an internal SMS notification dispatch system.',
      objectionCounter: 'Drivers only read 18% of SMS notifications while driving. Our automated voice agent actually speaks to the driver over hands-free phone, confirms arrival time, and logs it directly into SAP TMS.',
      desiredOutcome: 'Lock in a 20-minute product demonstration with Rohan and the Logistics Tech lead.'
    },
    timeline: [
      { id: 'ev-104-1', timestamp: '5h ago', title: 'G2 Intent Surge Logged', description: 'Delhivery IP network registered Tier-1 intent comparison on G2.', category: 'signal' },
      { id: 'ev-104-2', timestamp: '2h ago', title: 'Touchpoint 3 Due Notice', description: 'Automated CRM sequence prompted execution of Touchpoint 3.', category: 'discovery' },
      { id: 'ev-104-3', timestamp: '15m ago', title: 'Dispatch Brief Formatted', description: 'Formatted objection counters and benchmark comparisons.', category: 'call' }
    ],
    provenance: {
      platform: 'G2 Buyer Intent',
      originalRequirement: 'High-frequency comparison between Vidur and legacy cadence platforms.',
      sourceUrl: 'https://g2.com/buyer-intent/delhivery',
      discoveredAt: '5h ago',
      postedAt: '5h ago',
      lastUpdated: 'Today · Active',
      freshness: 'Fresh (Captured within 5h)'
    },
    website: 'https://delhivery.com',
    jobTitle: 'Head of Enterprise Sales',
    contactEmail: 'rohan.kapoor@delhivery.com',
    contactPhone: '+91 98110 54321',
    linkedinUrl: 'https://linkedin.com/company/delhivery'
  },

  'opp-108': {
    id: 'opp-108',
    companyName: 'Meesho (Fashnear Technologies)',
    companyDomain: 'meesho.com',
    industry: 'E-commerce · Social Commerce',
    location: 'Bengaluru, Karnataka',
    employeeCount: '3,500+ employees',
    requirement: 'Supplier re-activation outbound calling cadence with automated Hindi/English NLP.',
    detailedPain: '50,000 new dormant suppliers require re-activation calls within 14 days of sign-up, exceeding telemarketing capacity.',
    intentScore: 82,
    intentLevel: 'high',
    scoreReasons: [
      'Added 50,000 new marketplace sellers within 14 days',
      'Tele-sales calling floor hit capacity limits',
      'Growth leadership mandate to automate supplier re-activation'
    ],
    whyNow: 'Added 50,000 new marketplace sellers; manual calling floor hitting capacity limits.',
    buyingSignals: [
      {
        id: 'sig-108-1',
        type: 'Supplier Surge',
        description: 'Added 50,000 new marketplace sellers; manual calling floor hitting capacity limits.',
        timestamp: '6h ago',
        impactScore: 84
      }
    ],
    source: {
      platform: 'LinkedIn Signals',
      originalRequirement: 'Supplier seller onboarding automation mandate announced.',
      sourceUrl: 'https://linkedin.com/company/meesho',
      discoveredAt: '6h ago',
      postedAt: '6h ago'
    },
    followUpDue: 'Due at 3:00 PM',
    followUpTask: 'Follow up with Growth Lead on pilot cadence conversion metrics',
    estimatedValue: '₹52,00,000 / yr',
    recommendedAction: 'followup',
    suggestedOpeningHook: 'Ananya, following up on Meesho’s supplier activation initiative. We can automate 10,000 daily seller onboarding calls with natural Hindi voice...',
    decisionMakerContact: {
      name: 'Ananya Roy',
      role: 'Director of Growth',
      phoneAvailable: true
    },
    decisionMaker: {
      name: 'Ananya Roy',
      role: 'Director of Growth',
      department: 'Seller Growth & Marketplace Operations',
      email: 'ananya.roy@meesho.com',
      phone: '+91 96540 12984',
      phoneAvailable: true,
      confidence: 89,
      isDirectDial: true,
      linkedInUrl: 'https://www.linkedin.com/in/ananya-roy-meesho'
    },
    status: 'follow-up',
    lastActivity: '6h ago',
    enrichmentState: 'completed',
    companyIntelligence: {
      overview: 'Meesho is India\'s fastest-growing social commerce marketplace, democratizing internet commerce for millions of small sellers and entrepreneurs.',
      scale: 'Bengaluru HQ · 3,500+ employees · 500,000+ Active Sellers',
      techStack: {
        confirmed: ['Internal Seller Portal', 'Apache Kafka', 'AWS DynamoDB', 'Metabase'],
        displacing: ['Manual Calling Outbound Telesales']
      },
      aiInferences: [
        {
          deduction: 'Need automated voice agents to guide dormant sellers through catalog uploading and KYC verification.',
          confidence: 91,
          basis: 'Announcement of 50,000 new marketplace sellers and growth team mandate.'
        }
      ],
      potentialPainPoints: [
        '50,000 new dormant suppliers require re-activation calls within 14 days of sign-up.',
        'Manual tele-sales floor cannot scale beyond 1,200 dials per day without massive headcount.'
      ]
    },
    recommendedPitch: {
      pitch: 'Hi Ananya, following up on Meesho’s seller onboarding cadence. We help high-volume marketplaces re-activate dormant suppliers using autonomous Hindi/English voice agents that guide sellers through catalog uploads. Could we share a 3-minute sample on your mobile?',
      whyThisPitch: [
        'Directly aligns with scheduled 3:00 PM follow-up commitment.',
        'Addresses their 50,000 seller backlog.',
        'Provides tangible mobile demo proof.'
      ],
      keyAngle: 'Vernacular Marketplace Seller Activation (Hindi/Hinglish)',
      toneVariations: {
        direct: 'Ananya, following up on the supplier activation pilot. Our voice AI dials 10K dormant sellers daily with 40% re-activation rates. Let’s do 10 minutes at 3 PM.',
        valueLed: 'Hi Ananya, marketplace growth teams partner with Vidur to turn dormant sign-ups into active sellers at 1/10th the cost of manual telemarketing.',
        technical: 'Regarding Kafka integration: our platform consumes seller registration events from your queue and initiates outbound voice calls within 60 seconds.'
      }
    },
    callBrief: {
      opening: 'Hi Ananya, following up on Meesho’s supplier activation initiative...',
      leadContext: 'Meesho has 50,000 new sellers who haven\'t listed their first product. Human calling agents cannot keep pace with sign-up volume.',
      keySignal: 'Added 50,000 new sellers; tele-sales floor hit capacity limits.',
      discoveryQuestion: 'What percentage of newly registered suppliers currently drop off before uploading their first catalog?',
      potentialObjection: 'Our suppliers are traditional merchants who might get confused by automated calls.',
      objectionCounter: 'That’s the exact reason we built our models specifically on colloquial Hinglish and Hindi. In blind tests, 94% of small merchant shopkeepers believed they were speaking with a human Meesho onboarding executive.',
      desiredOutcome: 'Confirm agreement to launch a 1,000-seller pilot campaign this week.'
    },
    timeline: [
      { id: 'ev-108-1', timestamp: '6h ago', title: '50K Seller Surge Signal', description: 'Captured signal on supplier registration surge and onboarding capacity ceiling.', category: 'discovery' },
      { id: 'ev-108-2', timestamp: '4h ago', title: 'Follow-Up Scheduled (3 PM)', description: 'Scheduled follow-up with Ananya Roy on pilot metrics.', category: 'signal' },
      { id: 'ev-108-3', timestamp: '1h ago', title: 'Hinglish Demo Brief Ready', description: 'Synthesized catalog upload guide and Hindi dialogue brief.', category: 'call' }
    ],
    provenance: {
      platform: 'LinkedIn Signals & Tech Wire',
      originalRequirement: 'Supplier seller onboarding automation mandate announced.',
      sourceUrl: 'https://linkedin.com/company/meesho',
      discoveredAt: '6h ago',
      postedAt: '6h ago',
      lastUpdated: 'Today · Active',
      freshness: 'Fresh (Captured within 6h)'
    },
    website: 'https://meesho.com',
    jobTitle: 'Director of Growth',
    contactEmail: 'ananya.roy@meesho.com',
    contactPhone: '+91 96540 12984',
    linkedinUrl: 'https://linkedin.com/company/meesho'
  },

  'opp-105': {
    id: 'opp-105',
    companyName: 'Lenskart Solutions Private Limited',
    companyDomain: 'lenskart.com',
    industry: 'D2C · Eyewear Retail',
    location: 'New Delhi, Delhi',
    employeeCount: '5,000+ employees',
    requirement: 'Modernizing franchise outbound calls with automated objection handling briefs.',
    detailedPain: 'Franchise applicant leads sit un-contacted for 48+ hours due to BD bandwidth constraints, causing loss of high-value store partners.',
    intentScore: 78,
    intentLevel: 'medium',
    scoreReasons: [
      'New VP Business Development appointed with 400-store franchise rollout mandate',
      'Franchise inquiry volume exceeds internal BD manual calling capacity',
      '5,000+ employees with retail expansion capital'
    ],
    whyNow: 'New VP appointed to restructure franchise outbound sales operations.',
    buyingSignals: [
      {
        id: 'sig-105-1',
        type: 'Executive Appointment',
        description: 'New VP appointed to restructure franchise outbound sales operations.',
        timestamp: '1d ago',
        impactScore: 80
      }
    ],
    source: {
      platform: 'News Wire · Press Release',
      originalRequirement: 'Leadership change: Neha Gupta named VP BD with franchise expansion mandate.',
      sourceUrl: 'https://lenskart.com/press',
      discoveredAt: '1d ago',
      postedAt: '1d ago'
    },
    followUpDue: 'Due in 1h 15m',
    followUpTask: 'Send custom pitch brief focusing on franchise outbound objection scripts',
    estimatedValue: '₹82,00,000 / yr',
    recommendedAction: 'brief',
    suggestedOpeningHook: 'Neha, congratulations on taking the helm as VP Business Development. Saw your mandate to launch 400 new franchise optical stores...',
    decisionMakerContact: {
      name: 'Neha Gupta',
      role: 'VP Business Development',
      phoneAvailable: true
    },
    decisionMaker: {
      name: 'Neha Gupta',
      role: 'VP Business Development',
      department: 'Franchise Expansion & Retail Business Development',
      email: 'neha.gupta@lenskart.com',
      phone: '+91 98710 33452',
      phoneAvailable: true,
      confidence: 88,
      isDirectDial: true,
      linkedInUrl: 'https://www.linkedin.com/in/neha-gupta-lenskart'
    },
    status: 'contacted',
    lastActivity: '1d ago',
    enrichmentState: 'completed',
    companyIntelligence: {
      overview: 'Lenskart is India\'s largest omnichannel eyewear retailer operating thousands of retail stores across India, Southeast Asia, and the Middle East.',
      scale: 'New Delhi HQ · 5,000+ employees · 2,000+ Stores',
      techStack: {
        confirmed: ['Salesforce Omnichannel', 'Twilio Cloud', 'SAP ERP', 'Segment'],
        displacing: ['Manual Franchise Outreach Spreadsheets']
      },
      aiInferences: [
        {
          deduction: 'Expanding franchise network across Tier-2/3 cities requiring automated initial screening calls.',
          confidence: 89,
          basis: 'Executive appointment of Neha Gupta with expansion mandate.'
        }
      ],
      potentialPainPoints: [
        'Franchise applicant leads sit un-contacted for 48+ hours due to BD bandwidth constraints.',
        'Lack of structured objection handling on royalty fee structure during initial touchpoint.'
      ]
    },
    recommendedPitch: {
      pitch: 'Hi Neha, congratulations on leading Lenskart’s franchise expansion drive. We help retail brands screen and qualify franchise applicants within 60 seconds of inquiry submission using autonomous voice agents. Would you be open to reviewing our 1-page franchise briefing deck?',
      whyThisPitch: [
        'Acknowledges executive leadership appointment.',
        'Directly addresses 48-hour franchise applicant delay bottleneck.',
        'Proposes custom franchise objection handling brief.'
      ],
      keyAngle: 'Sub-60s Franchise Applicant Screening & Royalty Qualification',
      toneVariations: {
        direct: 'Neha, congrats on the VP role. We screen franchise applicants in 60s with AI voice qualification. Let’s do 10 minutes to discuss the 400-store rollout.',
        valueLed: 'Hi Neha, omnichannel retail leaders use our voice agents to qualify 5x more franchise leads while ensuring 100% adherence to corporate brand standards.',
        technical: 'Regarding Salesforce sync: qualified franchise applicants are automatically enriched with capital readiness and store location before routing to your BD managers.'
      }
    },
    callBrief: {
      opening: 'Hi Neha, congratulations on taking the helm as VP Business Development...',
      leadContext: 'Lenskart is expanding retail footprint with 400 new franchise outlets. Inbound franchise inquiries take days to receive a return call.',
      keySignal: 'New VP appointed to restructure franchise outbound sales operations.',
      discoveryQuestion: 'What is your current turnaround time between a franchise inquiry form submission and the first phone qualification?',
      potentialObjection: 'Franchise partners are high-net-worth individuals who require white-glove human touch.',
      objectionCounter: 'We completely agree. The AI voice agent only handles the immediate 60-second speed-to-lead verification (confirming store location and budget) so your senior BD directors can spend their time in high-touch closing conversations.',
      desiredOutcome: 'Deliver the franchise objection handling brief and schedule a 15-minute briefing session.'
    },
    timeline: [
      { id: 'ev-105-1', timestamp: '1d ago', title: 'Executive Appointment', description: 'Neha Gupta appointed VP Business Development for franchise growth.', category: 'discovery' },
      { id: 'ev-105-2', timestamp: '5h ago', title: 'Franchise Signal Enriched', description: 'Matched 400-store rollout target with corporate investment filing.', category: 'signal' },
      { id: 'ev-105-3', timestamp: '1h ago', title: 'Custom Pitch Brief Synthesized', description: 'Synthesized franchise screening script and objection counter playbook.', category: 'call' }
    ],
    provenance: {
      platform: 'News Wire · Press Release',
      originalRequirement: 'Leadership change: Neha Gupta named VP BD with franchise expansion mandate.',
      sourceUrl: 'https://lenskart.com/press',
      discoveredAt: '1d ago',
      postedAt: '1d ago',
      lastUpdated: 'Today · Active',
      freshness: 'Fresh (Captured within 24h)'
    },
    website: 'https://lenskart.com',
    jobTitle: 'VP Business Development',
    contactEmail: 'neha.gupta@lenskart.com',
    contactPhone: '+91 98710 33452',
    linkedinUrl: 'https://linkedin.com/company/lenskart-com'
  },

  'opp-1': {
    id: 'opp-1',
    companyName: 'Acme Technologies',
    companyDomain: 'acmetech.com',
    industry: 'Enterprise Software & Cloud',
    location: 'Bangalore, Karnataka',
    employeeCount: '250–500 employees',
    requirement: 'Enterprise voice automation for inbound sales qualification and SDR acceleration.',
    detailedPain: '4-hour demo response lag causing 42% lead attrition before first SDR phone call.',
    intentScore: 94,
    intentLevel: 'high',
    scoreReasons: [
      'Submitted pricing tier inquiry form 2 hours ago',
      'Visited enterprise pricing matrix 4 times in the past 6 hours',
      'Completed automated voice call with 88% qualification rating'
    ],
    whyNow: 'Asked about pricing after visiting product page multiple times today.',
    buyingSignals: [
      { id: 'sig-1-1', type: 'Pricing Page Spike', description: 'Prospect visited pricing tier page 4 times today.', timestamp: '2h ago', impactScore: 95 },
      { id: 'sig-1-2', type: 'High Intent', description: 'Submitted custom quote inquiry for 50-rep sales floor.', timestamp: '3h ago', impactScore: 90 }
    ],
    source: {
      platform: 'Company Website',
      originalRequirement: 'Pricing inquiry form submitted: Enterprise SLA tier.',
      sourceUrl: 'https://acmetech.com',
      discoveredAt: '2h ago',
      postedAt: '2h ago'
    },
    estimatedValue: '₹18,50,000 / yr',
    recommendedAction: 'call',
    suggestedOpeningHook: 'Hi Rahul, saw you looking into our Enterprise SLA pricing tier today. Wanted to offer a quick tailored walkthrough.',
    decisionMakerContact: {
      name: 'Rahul Sharma',
      role: 'VP of Engineering',
      phoneAvailable: true
    },
    decisionMaker: {
      name: 'Rahul Sharma',
      role: 'VP of Engineering',
      department: 'Engineering & Technology',
      email: 'rahul.sharma@acmetech.com',
      phone: '+91 98765 43210',
      phoneAvailable: true,
      confidence: 96,
      isDirectDial: true,
      linkedInUrl: 'https://linkedin.com/in/rahul-sharma-tech'
    },
    status: 'high-intent',
    lastActivity: '2h ago',
    enrichmentState: 'completed',
    companyIntelligence: {
      overview: 'Acme Technologies is an enterprise cloud software provider specializing in scalable B2B infrastructure and microservice APIs.',
      scale: 'Bangalore HQ · 250–500 employees · ₹18.5 Lakh Opportunity',
      techStack: {
        confirmed: ['AWS', 'Kubernetes', 'Salesforce CRM', 'Slack'],
        displacing: ['Manual Sales Telephony']
      },
      aiInferences: [
        { deduction: 'High likelihood of purchasing before Q3 fiscal close.', confidence: 94, basis: '4 pricing page visits and custom RFP request.' }
      ],
      potentialPainPoints: [
        'Inbound demo response times exceed 4 hours.',
        'SDRs spend 40% of time leaving unanswered voicemails.'
      ]
    },
    recommendedPitch: {
      pitch: 'Hi Rahul, saw you were evaluating our Enterprise SLA pricing tier today. We help engineering and revenue teams qualify inbound leads in under 60 seconds with autonomous voice agents. Would 10 minutes on Thursday be helpful to see a live demo?',
      whyThisPitch: ['Directly references pricing page spike.', 'Addresses 4-hour demo response bottleneck.'],
      keyAngle: 'Autonomous Speed-to-Lead & Enterprise SLA Guarantees',
      toneVariations: {
        direct: 'Rahul, saw you on our pricing page today. Let’s do 10 minutes to walk through enterprise pricing.',
        valueLed: 'Hi Rahul, engineering leaders use Vidur to cut inbound lead response from 4 hours to 60 seconds.',
        technical: 'Rahul, our voice AI connects directly into your CRM with sub-400ms latency and native WebRTC.'
      }
    },
    callBrief: {
      opening: 'Hi Rahul, saw you looking into our Enterprise SLA pricing tier today...',
      leadContext: 'Acme Tech has 50+ reps and struggles with speed-to-lead on inbound requests.',
      keySignal: 'Submitted pricing tier inquiry form 2 hours ago.',
      discoveryQuestion: 'What is your current average time to first touch for inbound enterprise demo requests?',
      potentialObjection: 'We are evaluating multiple vendors.',
      objectionCounter: 'Makes complete sense. We specifically specialize in sub-400ms voice response so conversations feel natural. Can we run a quick 2-minute live demo?',
      desiredOutcome: 'Schedule a 20-minute tailored product demo with Rahul and the sales leadership team.'
    },
    timeline: [
      { id: 'ev-1-1', timestamp: '3h ago', title: 'Pricing Inquiry Submitted', description: 'Rahul Sharma submitted enterprise pricing request.', category: 'discovery' },
      { id: 'ev-1-2', timestamp: '2h ago', title: 'Telemetry Enriched', description: 'Confirmed 250-500 employee headcount and AWS tech stack.', category: 'enrichment' }
    ],
    provenance: {
      platform: 'Company Website',
      originalRequirement: 'Enterprise SLA pricing inquiry.',
      sourceUrl: 'https://acmetech.com',
      discoveredAt: '2h ago',
      postedAt: '2h ago',
      lastUpdated: 'Today · Active',
      freshness: 'Fresh (Captured within 2h)'
    },
    website: 'https://acmetech.com',
    jobTitle: 'VP of Engineering',
    contactEmail: 'rahul.sharma@acmetech.com',
    contactPhone: '+91 98765 43210'
  }
};

// Aliases for cross-system routing
enterpriseDossiers['lead-1'] = enterpriseDossiers['opp-1'];
enterpriseDossiers['lead-101'] = enterpriseDossiers['opp-101'];
enterpriseDossiers['lead-102'] = enterpriseDossiers['opp-102'];
enterpriseDossiers['lead-103'] = enterpriseDossiers['opp-103'];
enterpriseDossiers['lead-104'] = enterpriseDossiers['opp-104'];
enterpriseDossiers['lead-105'] = enterpriseDossiers['opp-105'];
enterpriseDossiers['lead-106'] = enterpriseDossiers['opp-106'];
enterpriseDossiers['lead-107'] = enterpriseDossiers['opp-107'];
enterpriseDossiers['lead-108'] = enterpriseDossiers['opp-108'];

// Direct company name aliases
enterpriseDossiers['razorpay'] = enterpriseDossiers['opp-101'];
enterpriseDossiers['freshworks'] = enterpriseDossiers['opp-102'];
enterpriseDossiers['pharmeasy'] = enterpriseDossiers['opp-103'];
enterpriseDossiers['delhivery'] = enterpriseDossiers['opp-104'];
enterpriseDossiers['lenskart'] = enterpriseDossiers['opp-105'];
enterpriseDossiers['zerodha'] = enterpriseDossiers['opp-106'];
enterpriseDossiers['pinelabs'] = enterpriseDossiers['opp-107'];
enterpriseDossiers['meesho'] = enterpriseDossiers['opp-108'];

// UUID aliases from backend database
enterpriseDossiers['00000000-0000-0000-0002-000000000101'] = enterpriseDossiers['opp-101'];
enterpriseDossiers['00000000-0000-0000-0002-000000000102'] = enterpriseDossiers['opp-102'];
enterpriseDossiers['00000000-0000-0000-0002-000000000103'] = enterpriseDossiers['opp-103'];
enterpriseDossiers['00000000-0000-0000-0002-000000000104'] = enterpriseDossiers['opp-104'];
enterpriseDossiers['00000000-0000-0000-0002-000000000105'] = enterpriseDossiers['opp-105'];
enterpriseDossiers['00000000-0000-0000-0002-000000000106'] = enterpriseDossiers['opp-106'];
enterpriseDossiers['00000000-0000-0000-0002-000000000107'] = enterpriseDossiers['opp-107'];
enterpriseDossiers['00000000-0000-0000-0002-000000000108'] = enterpriseDossiers['opp-108'];

// Company name based index for fast lookup
export function findEnterpriseDossier(identifier: string): DiscoveredLead | null {
  if (!identifier) return null;
  const clean = identifier.trim().toLowerCase();

  // Direct ID check
  if (enterpriseDossiers[clean]) return enterpriseDossiers[clean];

  // Strip prefixes
  const stripped = clean.replace(/^(opp-|lead-|cmd-opp-|cmd-act-)/, '');
  if (enterpriseDossiers[stripped]) return enterpriseDossiers[stripped];
  if (enterpriseDossiers[`opp-${stripped}`]) return enterpriseDossiers[`opp-${stripped}`];
  if (enterpriseDossiers[`lead-${stripped}`]) return enterpriseDossiers[`lead-${stripped}`];

  // Search by company name or domain keyword
  for (const dossier of Object.values(enterpriseDossiers)) {
    if (!dossier?.companyName) continue;
    const comp = dossier.companyName.toLowerCase();
    const dom = (dossier.companyDomain || '').toLowerCase();
    if (comp.includes(clean) || clean.includes(comp) || (dom && clean.includes(dom.split('.')[0]))) {
      return dossier;
    }
  }

  return null;
}
