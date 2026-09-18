import { DiscoveredLead } from '../types/leads';

export const mockDiscoveredLeads: DiscoveredLead[] = [
  {
    id: 'lead-101',
    companyName: 'Acme Logistics Solutions',
    companyDomain: 'acmelogistics.com',
    industry: 'Logistics & 3PL',
    location: 'Chicago, IL',
    employeeCount: '250–500',
    requirement: 'Seeking AI-assisted route optimization and automated outbound voice dispatch to handle 1,200 daily regional freight deliveries.',
    detailedPain: 'Legacy manual dispatching creates 45-minute driver idle bottlenecks and 14% missed delivery appointment windows.',
    intentScore: 94,
    intentLevel: 'high',
    scoreReasons: [
      'Published formal RFP on regional transport exchange (18h ago)',
      'Hiring 3 Outbound Freight Operations Coordinators',
      'Decommissioning legacy telephony vendor contract',
    ],
    whyNow: 'Formal RFP posted 18h ago; vendor selection committee convenes this Friday.',
    buyingSignals: [
      {
        id: 'sig-101-1',
        type: 'RFP Published',
        description: 'Vendor RFP #LOG-2026-09 issued on Transport Exchange portal.',
        timestamp: '18h ago',
        impactScore: 95,
      },
      {
        id: 'sig-101-2',
        type: 'Hiring Surge',
        description: '3 Freight Dispatch Manager positions opened on LinkedIn.',
        timestamp: '1d ago',
        impactScore: 88,
      },
      {
        id: 'sig-101-3',
        type: 'Tech Migration',
        description: 'Decommissioning legacy premise PBX in favor of cloud AI calling.',
        timestamp: '2d ago',
        impactScore: 92,
      },
    ],
    source: {
      platform: 'IndiaMART',
      originalRequirement: 'Urgent: Looking for AI-integrated fleet dispatch and outbound driver telephony automation platform.',
      sourceUrl: 'https://mock.indiamart.com/inquiries/rfp-acme-7729',
      discoveredAt: 'Today · 08:30',
      postedAt: '18 hours ago',
    },
    estimatedValue: '₹40 Lakh / yr',
    recommendedAction: 'call',
    suggestedOpeningHook: 'Hi David, saw Acme just issued the regional dispatch RFP. Are you looking to eliminate driver wait-times ahead of the Q4 surge?',
    decisionMakerContact: {
      name: 'David Reynolds',
      role: 'VP of Transportation & Logistics',
      phoneAvailable: true,
    },
    status: 'high-intent',
  },
  {
    id: 'lead-102',
    companyName: 'CloudScale Telephony Systems',
    companyDomain: 'cloudscalesystems.io',
    industry: 'B2B SaaS',
    location: 'Austin, TX',
    employeeCount: '100–250',
    requirement: 'Evaluating autonomous voice AI agents to handle Tier-1 inbound qualification and warm SDR appointment booking.',
    detailedPain: 'Inbound demo request response times exceed 4 hours, leading to a 42% prospect drop-off before first touch.',
    intentScore: 92,
    intentLevel: 'high',
    scoreReasons: [
      'Category comparison surge logged on G2 Voice AI Cadences matrix',
      'Series-A funding (₹115 Cr) closed with commercial go-to-market mandate',
      'VP of Growth recruited from Twilio in last 30 days',
    ],
    whyNow: 'G2 Buyer Intent surge logged 4 hours ago across 8 employee IP addresses.',
    buyingSignals: [
      {
        id: 'sig-102-1',
        type: 'G2 Buyer Surge',
        description: 'High research intent detected on Outbound Voice AI & Dialer software.',
        timestamp: '4h ago',
        impactScore: 94,
      },
      {
        id: 'sig-102-2',
        type: 'Funding Round',
        description: 'Closed ₹115 Cr Series-A led by Scale Ventures to build outbound sales org.',
        timestamp: '3d ago',
        impactScore: 90,
      },
    ],
    source: {
      platform: 'G2 Crowd',
      originalRequirement: 'Category Comparison: Evaluating Vidur vs. Legacy SalesLoft dialer for real-time latency and CRM sync.',
      sourceUrl: 'https://mock.g2.com/intent/buyer-alert-cloudscale-441',
      discoveredAt: 'Today · 09:45',
      postedAt: '4 hours ago',
    },
    estimatedValue: '₹52 Lakh / yr',
    recommendedAction: 'call',
    suggestedOpeningHook: 'Hi Sarah, noticed your team evaluating voice AI cadences this morning. How are you tackling inbound speed-to-lead following the Series-A?',
    decisionMakerContact: {
      name: 'Sarah Jenkins',
      role: 'VP of Growth & Sales Ops',
      phoneAvailable: true,
    },
    status: 'high-intent',
  },
  {
    id: 'lead-103',
    companyName: 'Apex Dynamics Robotics',
    companyDomain: 'apexdynamics.de',
    industry: 'Industrial Automation',
    location: 'Stuttgart, Germany',
    employeeCount: '500–1,000',
    requirement: 'Need automated sales outreach to European tier-1 automotive suppliers for new collaborative industrial robotic arms.',
    detailedPain: 'Inside sales team struggling to penetrate German automotive engineering divisions with generic email templates.',
    intentScore: 89,
    intentLevel: 'high',
    scoreReasons: [
      'New production facility announced in Saxony (₹260 Cr investment)',
      'Product launch announced on LinkedIn for Cobot Series 6',
      'Actively hiring 6 multilingual Enterprise Account Executives',
    ],
    whyNow: 'Product launch press release published yesterday; actively scaling sales cadences.',
    buyingSignals: [
      {
        id: 'sig-103-1',
        type: 'Facility Expansion',
        description: 'New 80,000 sq ft smart manufacturing facility opened in Leipzig.',
        timestamp: '1d ago',
        impactScore: 91,
      },
      {
        id: 'sig-103-2',
        type: 'Hiring Surge',
        description: 'Recruiting Head of Outbound Sales and 5 Field BDRs.',
        timestamp: '2d ago',
        impactScore: 86,
      },
    ],
    source: {
      platform: 'LinkedIn',
      originalRequirement: 'Looking for B2B outbound cadence platform with native German & English language synthesis.',
      sourceUrl: 'https://mock.linkedin.com/posts/apex-industrial-gtm-2026',
      discoveredAt: 'Yesterday · 16:15',
      postedAt: '1 day ago',
    },
    estimatedValue: '₹68 Lakh / yr',
    recommendedAction: 'call',
    suggestedOpeningHook: 'Guten Tag Marcus, congratulations on the Leipzig facility expansion. Are you equipping your new outbound team with automated voice discovery?',
    decisionMakerContact: {
      name: 'Marcus Weber',
      role: 'Chief Commercial Officer',
      phoneAvailable: true,
    },
    status: 'high-intent',
  },
  {
    id: 'lead-104',
    companyName: 'Nexus Health Systems',
    companyDomain: 'nexushealth.org',
    industry: 'Healthcare & Life Sciences',
    location: 'Boston, MA',
    employeeCount: '1,000+',
    requirement: 'Seeking HIPAA-compliant automated patient intake qualification and specialist referral reminder telephony.',
    detailedPain: 'Clinical staff spending 22 hours per week on manual appointment re-confirmation phone calls.',
    intentScore: 86,
    intentLevel: 'high',
    scoreReasons: [
      'Published public notice for digital patient engagement software',
      'Chief Medical Information Officer appointed 60 days ago',
    ],
    whyNow: 'Hospital board approved Q3 patient engagement modernization budget.',
    buyingSignals: [
      {
        id: 'sig-104-1',
        type: 'RFP Published',
        description: 'Public healthcare trust RFP for conversational voice IVR automation.',
        timestamp: '1d ago',
        impactScore: 88,
      },
    ],
    source: {
      platform: 'RFP Portal',
      originalRequirement: 'RFP-HC-882: Seeking secure automated voice reminder and intake dialer with EHR integration.',
      sourceUrl: 'https://mock.healthcare-rfp.gov/notices/882-nexus',
      discoveredAt: 'Yesterday · 11:20',
      postedAt: '1 day ago',
    },
    estimatedValue: '₹90 Lakh / yr',
    recommendedAction: 'brief',
    suggestedOpeningHook: 'Hello Dr. Patel, saw the hospital trust published the intake automation RFP. We specialize in HIPAA-compliant voice appointment qualification.',
    decisionMakerContact: {
      name: 'Dr. Anita Patel',
      role: 'Chief Medical Information Officer',
      phoneAvailable: false,
    },
    status: 'qualified',
  },
  {
    id: 'lead-105',
    companyName: 'SwiftFreight Global 3PL',
    companyDomain: 'swiftfreight-logistics.com',
    industry: 'Logistics & 3PL',
    location: 'Atlanta, GA',
    employeeCount: '250–500',
    requirement: 'Looking to replace legacy broker cold-calling cadences with autonomous voice qualification agents.',
    detailedPain: 'Manual freight broker outbound calls average 85 dials a day with only 4.8% live connect rate.',
    intentScore: 85,
    intentLevel: 'high',
    scoreReasons: [
      'Pricing requested on competitor comparison site',
      'Freight volume up 34% quarter-over-quarter',
    ],
    whyNow: 'Pricing matrix requested 22 hours ago; competitor contract up for renewal next month.',
    buyingSignals: [
      {
        id: 'sig-105-1',
        type: 'Pricing Requested',
        description: 'Requested price tier breakdown on Outbound Voice Agent solutions.',
        timestamp: '22h ago',
        impactScore: 89,
      },
    ],
    source: {
      platform: 'IndiaMART',
      originalRequirement: 'Need pricing and demo for AI sales dialer to book carrier loads.',
      sourceUrl: 'https://mock.indiamart.com/inquiries/swiftfreight-882',
      discoveredAt: 'Today · 06:10',
      postedAt: '22 hours ago',
    },
    estimatedValue: '₹45 Lakh / yr',
    recommendedAction: 'call',
    suggestedOpeningHook: 'Hi Jason, noticed your inquiry into automated freight qualification. Are you aiming to ramp load booking capacity before Q4?',
    decisionMakerContact: {
      name: 'Jason Vance',
      role: 'Director of Carrier Procurement',
      phoneAvailable: true,
    },
    status: 'high-intent',
  },
  {
    id: 'lead-106',
    companyName: 'MediCore Diagnostic Labs',
    companyDomain: 'medicorelabs.com',
    industry: 'Healthcare & Life Sciences',
    location: 'San Diego, CA',
    employeeCount: '100–250',
    requirement: 'Evaluating outbound appointment reminder agents to eliminate 18% no-show rate for specialized MRI and CT scans.',
    detailedPain: 'Unfilled MRI slots cost the imaging center an estimated ₹2,00,000 per missed scanner hour.',
    intentScore: 78,
    intentLevel: 'medium',
    scoreReasons: [
      '3 negative reviews left by patients regarding phone wait times',
      'Evaluating conversational voice software on tech blogs',
    ],
    whyNow: 'Patient wait-time complaints escalated to clinic executive committee.',
    buyingSignals: [
      {
        id: 'sig-106-1',
        type: 'Incumbent Churn',
        description: 'Patient wait-time complaints logged on public portal regarding legacy answering service.',
        timestamp: '2d ago',
        impactScore: 82,
      },
    ],
    source: {
      platform: 'TechStack',
      originalRequirement: 'Evaluating modern voice AI APIs to automate clinic appointments.',
      sourceUrl: 'https://mock.techstack-radar.com/reports/medicore-voip',
      discoveredAt: '2 days ago',
      postedAt: '2 days ago',
    },
    estimatedValue: '₹32 Lakh / yr',
    recommendedAction: 'call',
    suggestedOpeningHook: 'Hi Elena, saw MediCore is modernizing patient intake workflows. We help imaging centers cut scanner idle time with autonomous SMS and voice confirmations.',
    decisionMakerContact: {
      name: 'Elena Rostova',
      role: 'Director of Clinic Operations',
      phoneAvailable: true,
    },
    status: 'contacted',
  },
  {
    id: 'lead-107',
    companyName: 'Titan Industrial Machining',
    companyDomain: 'titanmachining.co.uk',
    industry: 'Industrial Automation',
    location: 'Birmingham, UK',
    employeeCount: '50–100',
    requirement: 'Seeking automated outreach cadences to pitch CNC precision tooling contracts to aerospace manufacturers.',
    detailedPain: 'Founder and 1 sales manager currently conducting all outbound outreach manually.',
    intentScore: 74,
    intentLevel: 'medium',
    scoreReasons: [
      'AS9100 Aerospace Quality Certification awarded last week',
      'Actively pursuing UK aerospace supply chain subcontracts',
    ],
    whyNow: 'Certification approved last week, unlocking tier-1 aerospace bids.',
    buyingSignals: [
      {
        id: 'sig-107-1',
        type: 'Certification Milestone',
        description: 'Received AS9100 Rev D aerospace precision supplier accreditation.',
        timestamp: '3d ago',
        impactScore: 76,
      },
    ],
    source: {
      platform: 'LinkedIn',
      originalRequirement: 'Announcing AS9100 approval: seeking outbound GTM partner to connect with Airbus & Rolls Royce tier-1 procurement.',
      sourceUrl: 'https://mock.linkedin.com/posts/titan-as9100-announcement',
      discoveredAt: '3 days ago',
      postedAt: '3 days ago',
    },
    estimatedValue: '₹25 Lakh / yr',
    recommendedAction: 'campaign',
    suggestedOpeningHook: 'Hello Arthur, congratulations on securing the AS9100 aerospace certification. Are you currently building targeted outbound cadences into aerospace procurement leads?',
    decisionMakerContact: {
      name: 'Arthur Pendelton',
      role: 'Managing Director',
      phoneAvailable: true,
    },
    status: 'discovered',
  },
  {
    id: 'lead-108',
    companyName: 'Datablox Analytics',
    companyDomain: 'datablox.io',
    industry: 'B2B SaaS',
    location: 'San Francisco, CA',
    employeeCount: '50–100',
    requirement: 'Looking for AI outbound sales system to qualify inbound signups and re-engage dormant trial users.',
    detailedPain: 'Self-serve product trial has 8,000 signups/month, but sales team only touches the top 2% of accounts.',
    intentScore: 72,
    intentLevel: 'medium',
    scoreReasons: [
      'Job posting for Head of Sales Development published 4 days ago',
      'Product Hunt launch generated 2,000 trial signups in 48 hours',
    ],
    whyNow: 'Trial signup backlog growing faster than SDR team capacity.',
    buyingSignals: [
      {
        id: 'sig-108-1',
        type: 'Hiring Surge',
        description: 'Opened Head of SDR and 4 Inbound Specialist roles.',
        timestamp: '4d ago',
        impactScore: 78,
      },
    ],
    source: {
      platform: 'Job Board',
      originalRequirement: 'Job posting mentions requirement to deploy automated dialers and conversational AI tools.',
      sourceUrl: 'https://mock.job-board.com/postings/datablox-head-sdr',
      discoveredAt: '4 days ago',
      postedAt: '4 days ago',
    },
    estimatedValue: '₹35 Lakh / yr',
    recommendedAction: 'campaign',
    suggestedOpeningHook: 'Hi Chloe, saw your team hiring for the SDR expansion following the launch. We help SaaS teams automatically qualify dormant product signups via voice AI.',
    decisionMakerContact: {
      name: 'Chloe Bennett',
      role: 'VP of Product-Led Growth',
      phoneAvailable: true,
    },
    status: 'discovered',
  },
  {
    id: 'lead-109',
    companyName: 'Veloce Warehousing Systems',
    companyDomain: 'veloce-systems.com',
    industry: 'Logistics & 3PL',
    location: 'Dallas, TX',
    employeeCount: '500–1,000',
    requirement: 'Need automated inventory exception alerting and supplier rescheduling telephony integration.',
    detailedPain: 'Suppliers arrive with manifest discrepancies, creating 3-hour dock delays and ₹65,000 demurrage charges.',
    intentScore: 71,
    intentLevel: 'medium',
    scoreReasons: [
      '3 new regional fulfillment centers opened in Texas and Arizona',
      'Evaluating supply chain automation solutions',
    ],
    whyNow: 'Regional DC expansion launched last week.',
    buyingSignals: [
      {
        id: 'sig-109-1',
        type: 'Facility Expansion',
        description: 'Added 450,000 sq ft cross-dock facility in Fort Worth.',
        timestamp: '5d ago',
        impactScore: 75,
      },
    ],
    source: {
      platform: 'LinkedIn',
      originalRequirement: 'Looking for dock scheduling and automated supplier touchpoint software.',
      sourceUrl: 'https://mock.linkedin.com/posts/veloce-ft-worth-crossdock',
      discoveredAt: '5 days ago',
      postedAt: '5 days ago',
    },
    estimatedValue: '₹55 Lakh / yr',
    recommendedAction: 'brief',
    suggestedOpeningHook: 'Hi Robert, saw the announcement for the new Fort Worth cross-dock. Are you managing supplier arrival exceptions with automated outbound calls?',
    decisionMakerContact: {
      name: 'Robert Sterling',
      role: 'VP of Distribution Operations',
      phoneAvailable: false,
    },
    status: 'discovered',
  },
  {
    id: 'lead-110',
    companyName: 'OmniPack Global Packaging',
    companyDomain: 'omnipack-global.com',
    industry: 'Industrial Automation',
    location: 'Chicago, IL',
    employeeCount: '250–500',
    requirement: 'Evaluating automated outbound lead qualification to discover contract packaging buyers in FMCG and food brands.',
    detailedPain: 'Cold email open rates have declined from 24% to 9% over past 6 months.',
    intentScore: 68,
    intentLevel: 'medium',
    scoreReasons: [
      'New sustainable packaging line launched',
      'VP of Commercial Sales hired from International Paper',
    ],
    whyNow: 'Commercial team mandated to win 20 new contract packaging accounts in Q4.',
    buyingSignals: [
      {
        id: 'sig-110-1',
        type: 'Product Launch',
        description: 'Launched 100% biodegradable corrugated food packaging line.',
        timestamp: '6d ago',
        impactScore: 70,
      },
    ],
    source: {
      platform: 'IndiaMART',
      originalRequirement: 'Inquiry: Looking for B2B lead generation service for sustainable packaging.',
      sourceUrl: 'https://mock.indiamart.com/inquiries/omnipack-fmcg-992',
      discoveredAt: '6 days ago',
      postedAt: '6 days ago',
    },
    estimatedValue: '₹30 Lakh / yr',
    recommendedAction: 'campaign',
    suggestedOpeningHook: 'Hi Gregory, saw OmniPack launched the biodegradable packaging series. How are your sales reps cutting through the noise with consumer brand procurement teams?',
    decisionMakerContact: {
      name: 'Gregory Scott',
      role: 'VP Commercial Sales',
      phoneAvailable: true,
    },
    status: 'discovered',
  },
  {
    id: 'lead-111',
    companyName: 'BioVanguard Pharmaceuticals',
    companyDomain: 'biovanguard.ch',
    industry: 'Healthcare & Life Sciences',
    location: 'Basel, Switzerland',
    employeeCount: '1,000+',
    requirement: 'Looking for autonomous voice agents to handle patient clinical trial adherence and phase-3 follow-up questionnaires.',
    detailedPain: 'Trial participant drop-out rate reached 28% due to inconsistent clinical coordinator phone check-ins.',
    intentScore: 65,
    intentLevel: 'medium',
    scoreReasons: [
      'Phase-3 oncology trial enrollment initiated across 14 EU sites',
      'Regulatory audit required strict patient contact logs',
    ],
    whyNow: 'Trial coordinator team overwhelmed by participant call volume.',
    buyingSignals: [
      {
        id: 'sig-111-1',
        type: 'Clinical Trial Milestone',
        description: 'Initiated Phase-3 international oncology clinical trial.',
        timestamp: '1w ago',
        impactScore: 68,
      },
    ],
    source: {
      platform: 'Crunchbase',
      originalRequirement: 'Grant funding awarded for decentralized clinical trial operations.',
      sourceUrl: 'https://mock.crunchbase.com/organizations/biovanguard-series-b',
      discoveredAt: '7 days ago',
      postedAt: '7 days ago',
    },
    estimatedValue: '₹1.1 Cr / yr',
    recommendedAction: 'brief',
    suggestedOpeningHook: 'Dear Dr. Keller, congratulations on launching the Phase-3 oncology trial. Are you deploying automated voice check-ins to safeguard patient trial adherence?',
    decisionMakerContact: {
      name: 'Dr. Lucas Keller',
      role: 'Head of Clinical Operations',
      phoneAvailable: false,
    },
    status: 'discovered',
  },
  {
    id: 'lead-112',
    companyName: 'Kestrel Fleet Telematics',
    companyDomain: 'kestrel-fleet.co.uk',
    industry: 'Logistics & 3PL',
    location: 'London, UK',
    employeeCount: '50–100',
    requirement: 'Seeking voice AI outreach to fleet managers for ELD compliance and video dashcam subscriptions.',
    detailedPain: 'UK regulatory mandate requiring HGV direct vision standard compliance taking effect in 90 days.',
    intentScore: 64,
    intentLevel: 'medium',
    scoreReasons: [
      'Regulatory compliance deadline approaching for fleet operators',
      'Marketing campaign driving inbound leads with low phone response rates',
    ],
    whyNow: '90-day countdown to regional vision safety standards enforcement.',
    buyingSignals: [
      {
        id: 'sig-112-1',
        type: 'Regulatory Trigger',
        description: 'TfL Direct Vision Standard compliance enforcement begins soon.',
        timestamp: '1w ago',
        impactScore: 66,
      },
    ],
    source: {
      platform: 'LinkedIn',
      originalRequirement: 'Urgent need for outbound SDR dialer to contact transport fleet operators before deadline.',
      sourceUrl: 'https://mock.linkedin.com/posts/kestrel-hgv-deadline-2026',
      discoveredAt: '1 week ago',
      postedAt: '1 week ago',
    },
    estimatedValue: '₹28 Lakh / yr',
    recommendedAction: 'call',
    suggestedOpeningHook: 'Hi Simon, with the DVS compliance deadline 90 days out, are your sales reps able to contact all transport managers in your database in time?',
    decisionMakerContact: {
      name: 'Simon Clarke',
      role: 'Commercial Director',
      phoneAvailable: true,
    },
    status: 'discovered',
  },
  {
    id: 'lead-113',
    companyName: 'Apex Cloud Security',
    companyDomain: 'apexcloudsec.com',
    industry: 'B2B SaaS',
    location: 'San Jose, CA',
    employeeCount: '50–100',
    requirement: 'Exploring AI sales dialers to prospect CISOs and IT Directors for cloud workload protection.',
    detailedPain: 'SDR team reports 2% connect rate on manual outbound calling lists.',
    intentScore: 48,
    intentLevel: 'low',
    scoreReasons: [
      'Early stage exploratory intent',
      'No formal budget allocated in public filings',
    ],
    whyNow: 'Evaluating tools for next fiscal year planning.',
    buyingSignals: [
      {
        id: 'sig-113-1',
        type: 'Tech Stack Radar',
        description: 'Installed trial tracking tag on competitive website.',
        timestamp: '2w ago',
        impactScore: 50,
      },
    ],
    source: {
      platform: 'TechStack',
      originalRequirement: 'General inquiry into modern sales engagement tooling.',
      sourceUrl: 'https://mock.techstack-radar.com/eval/apex-cloud-sec',
      discoveredAt: '2 weeks ago',
      postedAt: '2 weeks ago',
    },
    estimatedValue: '₹20 Lakh / yr',
    recommendedAction: 'campaign',
    suggestedOpeningHook: 'Hi Nathan, saw Apex Cloud is mapping out sales tooling for upcoming quarters. Would it be helpful to see a 5-minute benchmark of AI connect rates?',
    decisionMakerContact: {
      name: 'Nathan Brooks',
      role: 'Director of Business Development',
      phoneAvailable: true,
    },
    status: 'discovered',
  },
  {
    id: 'lead-114',
    companyName: 'Starlight Medical Supplies',
    companyDomain: 'starlightmed.com',
    industry: 'Healthcare & Life Sciences',
    location: 'Dallas, TX',
    employeeCount: '20–50',
    requirement: 'Evaluating automated order re-ordering telephony for regional dental clinics.',
    detailedPain: 'Dental office managers forget to reorder consumables until supplies run dry.',
    intentScore: 46,
    intentLevel: 'low',
    scoreReasons: [
      'Owner inquired on business forum about automated voice reminders',
    ],
    whyNow: 'Routine inventory cycle review.',
    buyingSignals: [
      {
        id: 'sig-114-1',
        type: 'Forum Ingestion',
        description: 'Posted question on B2B distribution forum regarding voice reorder bots.',
        timestamp: '2w ago',
        impactScore: 48,
      },
    ],
    source: {
      platform: 'Job Board',
      originalRequirement: 'Looking for recommendation: simple voice bot to remind clinics to restock gloves and sterilizer.',
      sourceUrl: 'https://mock.forum.com/dental-distributors/threads/9912',
      discoveredAt: '2 weeks ago',
      postedAt: '2 weeks ago',
    },
    estimatedValue: '₹15 Lakh / yr',
    recommendedAction: 'followup',
    suggestedOpeningHook: 'Hello Kevin, saw your note on dental re-order automation. We help suppliers automate recurring consumable re-orders via AI phone check-ins.',
    decisionMakerContact: {
      name: 'Kevin Vance',
      role: 'Owner & General Manager',
      phoneAvailable: true,
    },
    status: 'discovered',
  },
  {
    id: 'lead-115',
    companyName: 'Precision Cold Chain Logistics',
    companyDomain: 'precisioncoldchain.in',
    industry: 'Logistics & 3PL',
    location: 'Mumbai, India',
    employeeCount: '100–250',
    requirement: 'Looking for temperature breach escalation and automated driver verification telephony system.',
    detailedPain: 'Temperature alerts currently sent via email often sit unread by night dispatchers for up to 3 hours.',
    intentScore: 91,
    intentLevel: 'high',
    scoreReasons: [
      'Published urgent vendor inquiry on IndiaMART 6 hours ago',
      'Cold chain pharmaceutical logistics client mandated phone escalation compliance',
    ],
    whyNow: 'Urgent inquiry posted 6 hours ago to fulfill pharmaceutical client audit requirement.',
    buyingSignals: [
      {
        id: 'sig-115-1',
        type: 'Urgent Requirement',
        description: 'Posted urgent need for automated phone escalation dialer on IndiaMART.',
        timestamp: '6h ago',
        impactScore: 96,
      },
    ],
    source: {
      platform: 'IndiaMART',
      originalRequirement: 'Immediate Requirement: Need voice broadcast and interactive phone response dialer for refrigerated truck alerts.',
      sourceUrl: 'https://mock.indiamart.com/inquiries/precision-coldchain-alert-661',
      discoveredAt: 'Today · 10:15',
      postedAt: '6 hours ago',
    },
    estimatedValue: '₹35 Lakh / yr',
    recommendedAction: 'call',
    suggestedOpeningHook: 'Namaste Rajesh, saw Precision Cold Chain posted an immediate need for driver phone alerts. We can deploy automated emergency voice escalation in 24 hours.',
    decisionMakerContact: {
      name: 'Rajesh Sharma',
      role: 'VP Operations & Fleet Safety',
      phoneAvailable: true,
    },
    status: 'high-intent',
  },
  {
    id: 'lead-116',
    companyName: 'Redwood Robotic Palletizers',
    companyDomain: 'redwoodrobotics.com',
    industry: 'Industrial Automation',
    location: 'San Jose, CA',
    employeeCount: '50–100',
    requirement: 'Seeking autonomous voice qualification agent to follow up on G2 intent leads and webinar attendees.',
    detailedPain: '800 inbound leads from recent robotics demo webinar sitting untouched for 2 weeks.',
    intentScore: 88,
    intentLevel: 'high',
    scoreReasons: [
      'Webinar attendee list requires immediate qualification',
      'Director of Marketing hired from ABB Robotics',
    ],
    whyNow: 'Post-webinar lead decay: 800 leads going cold without automated follow-up.',
    buyingSignals: [
      {
        id: 'sig-116-1',
        type: 'Webinar Lead Surge',
        description: 'Host demo webinar logged 800+ tier-1 manufacturing attendees.',
        timestamp: '1d ago',
        impactScore: 90,
      },
    ],
    source: {
      platform: 'LinkedIn',
      originalRequirement: 'Seeking sales automation partner to qualify 800 industrial demo signups.',
      sourceUrl: 'https://mock.linkedin.com/posts/redwood-webinar-followup',
      discoveredAt: 'Yesterday · 14:20',
      postedAt: '1 day ago',
    },
    estimatedValue: '₹38 Lakh / yr',
    recommendedAction: 'call',
    suggestedOpeningHook: 'Hi Laura, congratulations on the robotics webinar turnout. How is your team currently qualifying the 800 attendees before interest cools down?',
    decisionMakerContact: {
      name: 'Laura Campbell',
      role: 'Director of Growth Marketing',
      phoneAvailable: true,
    },
    status: 'high-intent',
  },
  {
    id: 'lead-117',
    companyName: 'OmniFlow Inventory Cloud',
    companyDomain: 'omniflowcloud.io',
    industry: 'B2B SaaS',
    location: 'New York, NY',
    employeeCount: '50–100',
    requirement: 'Evaluating automated voice appointment setting for multi-channel e-commerce inventory sync platform.',
    detailedPain: 'Outbound SDR team booking meetings at ₹70,000 cost-per-meeting with legacy dialer.',
    intentScore: 84,
    intentLevel: 'high',
    scoreReasons: [
      'Cost-per-meeting metric flagged as unsustainable by leadership',
      'Actively comparing Vidur vs. Orum on G2',
    ],
    whyNow: 'Quarterly sales review mandated a 50% cut in customer acquisition cost.',
    buyingSignals: [
      {
        id: 'sig-117-1',
        type: 'Pricing Requested',
        description: 'Requested enterprise pricing on autonomous B2B dialing platforms.',
        timestamp: '1d ago',
        impactScore: 87,
      },
    ],
    source: {
      platform: 'G2 Crowd',
      originalRequirement: 'Evaluating modern voice AI agents to replace high CAC manual outbound cadences.',
      sourceUrl: 'https://mock.g2.com/intent/buyer-alert-omniflow-771',
      discoveredAt: 'Yesterday · 18:00',
      postedAt: '1 day ago',
    },
    estimatedValue: '₹46 Lakh / yr',
    recommendedAction: 'call',
    suggestedOpeningHook: 'Hi Jordan, noticed your team evaluating voice AI to lower outbound meeting costs. We help B2B SaaS teams cut CAC by 65% with autonomous discovery calls.',
    decisionMakerContact: {
      name: 'Jordan Rivera',
      role: 'Head of Outbound Sales',
      phoneAvailable: true,
    },
    status: 'high-intent',
  },
  {
    id: 'lead-118',
    companyName: 'Genesis Health Diagnostic Network',
    companyDomain: 'genesishealth.co.uk',
    industry: 'Healthcare & Life Sciences',
    location: 'Manchester, UK',
    employeeCount: '250–500',
    requirement: 'Looking for NHS trust approved voice communication agent for outpatient pre-procedure instructions.',
    detailedPain: '14% of colonoscopy and endoscopy procedures cancelled on arrival due to improper fasting preparation.',
    intentScore: 83,
    intentLevel: 'high',
    scoreReasons: [
      'NHS trust quality audit flagged cancellation waste (₹3.6 Cr/year loss)',
      'Clinical director mandated phone-based pre-procedure checklist',
    ],
    whyNow: 'Hospital trust audit findings published; corrective action plan due in 30 days.',
    buyingSignals: [
      {
        id: 'sig-118-1',
        type: 'Audit Mandate',
        description: 'Internal audit flagged £380,000 in preventable endoscopy cancellation costs.',
        timestamp: '2d ago',
        impactScore: 88,
      },
    ],
    source: {
      platform: 'RFP Portal',
      originalRequirement: 'Tender: Patient automated telephony compliance reminder service for Manchester hospital network.',
      sourceUrl: 'https://mock.nhs-tenders.gov.uk/notices/genesis-8839',
      discoveredAt: '2 days ago',
      postedAt: '2 days ago',
    },
    estimatedValue: '₹80 Lakh / yr',
    recommendedAction: 'brief',
    suggestedOpeningHook: 'Dear Dr. Wright, saw the Trust audit on procedure cancellation rates. We deploy automated interactive voice calls to ensure patients complete exact fasting protocols.',
    decisionMakerContact: {
      name: 'Dr. Evelyn Wright',
      role: 'Clinical Director of Endoscopy Services',
      phoneAvailable: false,
    },
    status: 'qualified',
  },
  {
    id: 'lead-119',
    companyName: 'Zenith Logistics Hub',
    companyDomain: 'zenithlogistics.in',
    industry: 'Logistics & 3PL',
    location: 'Bengaluru, India',
    employeeCount: '250–500',
    requirement: 'Seeking automated carrier freight broker verification and spot load booking dialer.',
    detailedPain: 'Brokers spend 3 hours every morning calling 50+ truck fleet owners to confirm load availability.',
    intentScore: 81,
    intentLevel: 'high',
    scoreReasons: [
      'Inquiry posted on IndiaMART freight board 1 day ago',
      'Expanding inter-state transit routes from Bangalore to Delhi',
    ],
    whyNow: 'Inter-state transit route launched yesterday.',
    buyingSignals: [
      {
        id: 'sig-119-1',
        type: 'RFP Published',
        description: 'Requirement posted for automated carrier load matching telephone software.',
        timestamp: '1d ago',
        impactScore: 85,
      },
    ],
    source: {
      platform: 'IndiaMART',
      originalRequirement: 'Looking for automatic telephone calling system to contact truck fleet owners in Hindi and English.',
      sourceUrl: 'https://mock.indiamart.com/inquiries/zenith-carrier-4421',
      discoveredAt: 'Yesterday · 12:45',
      postedAt: '1 day ago',
    },
    estimatedValue: '₹32 Lakh / yr',
    recommendedAction: 'call',
    suggestedOpeningHook: 'Namaste Sanjay, saw Zenith is expanding North-South carrier routes. We can deploy Hindi & English voice agents to call fleet owners and book loads automatically.',
    decisionMakerContact: {
      name: 'Sanjay Nair',
      role: 'Head of Carrier Relations',
      phoneAvailable: true,
    },
    status: 'high-intent',
  },
  {
    id: 'lead-120',
    companyName: 'AeroCranes Industrial',
    companyDomain: 'aerocranes.com',
    industry: 'Industrial Automation',
    location: 'Detroit, MI',
    employeeCount: '100–250',
    requirement: 'Evaluating outbound sales service to pitch heavy gantry crane maintenance contracts to automotive assembly plants.',
    detailedPain: 'Inside sales team reliant on cold emails with a 1.2% reply rate from plant managers.',
    intentScore: 61,
    intentLevel: 'medium',
    scoreReasons: [
      'New VP of Service Sales recruited from Konecranes',
      'Actively exploring telemarketing and voice automation alternatives',
    ],
    whyNow: 'Leadership team shifting focus toward recurring preventative maintenance contracts.',
    buyingSignals: [
      {
        id: 'sig-120-1',
        type: 'Executive Churn',
        description: 'Appointed former Konecranes leader to drive service revenue.',
        timestamp: '1w ago',
        impactScore: 65,
      },
    ],
    source: {
      platform: 'LinkedIn',
      originalRequirement: 'Exploring AI outbound voice solutions to book plant manager walkthroughs.',
      sourceUrl: 'https://mock.linkedin.com/posts/aerocranes-service-expansion',
      discoveredAt: '1 week ago',
      postedAt: '1 week ago',
    },
    estimatedValue: '₹40 Lakh / yr',
    recommendedAction: 'campaign',
    suggestedOpeningHook: 'Hi Bradley, saw you recently joined AeroCranes to scale maintenance contracts. How are you approaching outreach to busy automotive plant managers?',
    decisionMakerContact: {
      name: 'Bradley Cooper',
      role: 'VP Service Sales',
      phoneAvailable: true,
    },
    status: 'discovered',
  },
];

let inMemoryDiscoveredLeads: DiscoveredLead[] = [];

export function getDiscoveredLeads(): DiscoveredLead[] {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('vidur_discovered_leads') : null;
    if (raw) {
      const parsed: DiscoveredLead[] = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const existingIds = new Set(mockDiscoveredLeads.map((l) => l.id.toLowerCase()));
        const uniqueDynamic = parsed.filter((l) => !existingIds.has(l.id.toLowerCase()));
        return [...uniqueDynamic, ...mockDiscoveredLeads];
      }
    }
  } catch (e) {
    console.error('Failed to parse vidur_discovered_leads:', e);
  }
  return [...inMemoryDiscoveredLeads, ...mockDiscoveredLeads];
}

export function saveDiscoveredLeads(leads: DiscoveredLead[]): void {
  inMemoryDiscoveredLeads = leads;
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem('vidur_discovered_leads', JSON.stringify(leads));
    }
  } catch (e) {
    console.error('Failed to save vidur_discovered_leads:', e);
  }
}

export function registerDiscoveredLead(lead: DiscoveredLead): void {
  const current = getDiscoveredLeads();
  const exists = current.some((l) => l.id.toLowerCase() === lead.id.toLowerCase());
  if (!exists) {
    saveDiscoveredLeads([lead, ...current]);
  }
}

export function getLeadDetails(rawLeadId: string | undefined): DiscoveredLead | null {
  if (!rawLeadId) return null;
  const leadId = rawLeadId.trim();
  const allLeads = getDiscoveredLeads();
  const baseLead = allLeads.find(
    (l) => l.id.toLowerCase() === leadId.toLowerCase() || l.id.toLowerCase() === `lead-${leadId.toLowerCase()}`
  );

  if (!baseLead) return null;

  // If already fully enriched (e.g. from website discovery), return directly
  if (baseLead.companyIntelligence && baseLead.decisionMaker && baseLead.recommendedPitch) {
    return baseLead;
  }

  // Custom detailed data for flagship leads
  if (baseLead.id === 'lead-101') {
    return {
      ...baseLead,
      lastActivity: '18m ago',
      enrichmentState: 'completed',
      companyIntelligence: {
        overview: 'Mid-market freight brokerage and 3PL distributor managing regional carrier networks across the Midwest.',
        scale: '3 Regional Distribution Hubs · 1,200 Daily Dispatch Runs',
        techStack: {
          confirmed: ['SAP TMS (Enterprise Transportation)', 'Geotab Telematics & ELD', 'Twilio Voice API', 'Slack Ops'],
          displacing: ['Premise Avaya PBX (End-of-Life 2026)']
        },
        aiInferences: [
          {
            deduction: 'Likely replacing legacy dispatch phone staff with autonomous AI voice workflows.',
            confidence: 94,
            basis: 'Published RFP on Transport Exchange and 3 open Freight Coordinator roles.'
          },
          {
            deduction: 'Q4 volume surge is the hard deadline forcing immediate vendor selection.',
            confidence: 91,
            basis: 'Historical carrier freight volume spikes 38% between October and December.'
          },
          {
            deduction: 'High cost sensitivity regarding driver idle fines at regional distribution docks.',
            confidence: 87,
            basis: 'Detailed pain points cited 14% missed appointment windows with detention fees.'
          }
        ],
        potentialPainPoints: [
          'Manual phone dispatching creates 45-minute driver wait-times at terminal docks.',
          '14% missed delivery appointment windows due to dispatcher phone tag.',
          'High driver turnover exacerbated by communication delays during inclement weather.'
        ]
      },
      decisionMaker: {
        name: baseLead.decisionMakerContact?.name || 'David Reynolds',
        role: baseLead.decisionMakerContact?.role || 'VP of Transportation & Logistics',
        department: 'Fleet Operations & Regional Carrier Dispatch',
        email: 'd.reynolds@acmelogistics.com',
        phone: '+1 (312) 555-0184',
        phoneAvailable: true,
        confidence: 98,
        isDirectDial: true,
        linkedInUrl: 'https://mock.linkedin.com/in/david-reynolds-logistics'
      },
      recommendedPitch: {
        pitch: "Hi David, I saw Acme just issued the regional dispatch RFP yesterday. Most VPs of Logistics we speak with are trying to eliminate driver wait-times before the Q4 volume surge without hiring an army of manual dispatchers. Are you open to seeing how automated outbound dispatch handles 1,200 daily routes with zero rep lag?",
        whyThisPitch: [
          'References active RFP #LOG-2026-09 published on Transport Exchange.',
          'Directly addresses their verified 1,200 daily dispatch run volume.',
          'Aligns with David Reynolds’ immediate operational mandate to eliminate dock bottlenecks.'
        ],
        keyAngle: 'Autonomous Driver Dispatch & Sub-400ms Voice Latency',
        toneVariations: {
          direct: "David, saw RFP #LOG-2026-09 yesterday. We automate outbound voice dispatch for 1,200+ daily freight runs. Let’s do 10 minutes on Thursday before your committee convenes Friday.",
          valueLed: "Hi David, noticed Acme issued the dispatch RFP. Other mid-market 3PLs use our voice AI to cut dock idle times by 45 minutes without adding dispatch headcount. Worth comparing benchmarks?",
          technical: "David, regarding Acme’s RFP: our voice agents connect natively into SAP TMS and Geotab, executing 1,200 dispatch calls per hour with zero driver latency. Can we send the architectural brief?"
        }
      },
      callBrief: {
        opening: "Hi David, I noticed Acme just issued the regional dispatch RFP on Transport Exchange. Are you evaluating voice automation ahead of the Q4 surge?",
        leadContext: "Acme manages 1,200 regional daily freight deliveries. Manual dispatch creates 45-minute dock delays and 14% missed appointment windows.",
        keySignal: "RFP #LOG-2026-09 issued 18h ago; vendor selection committee convenes this Friday.",
        discoveryQuestion: "What percentage of delivery exceptions are currently caused by manual phone tag between dispatchers and contracted drivers?",
        potentialObjection: "We already have an active RFP process running; submit documentation through the exchange portal.",
        objectionCounter: "Understood, David. We are submitting formal specs through the portal today. We called because three other carriers added our sub-400ms voice latency metric to their vendor scorecard. Can we send that 1-page comparison?",
        desiredOutcome: "Secure a 20-minute live demonstration with David Reynolds and the RFP evaluation committee before Friday."
      },
      timeline: [
        { id: 'ev-1', timestamp: 'Today · 08:30', title: 'Requirement Discovered', description: 'Urgent RFP #LOG-2026-09 captured from IndiaMART Transport Exchange feed.', category: 'discovery' },
        { id: 'ev-2', timestamp: 'Today · 08:32', title: 'Company Telemetry Enriched', description: 'Matched domain acmelogistics.com; confirmed SAP TMS, Geotab, and 3 regional hubs.', category: 'enrichment' },
        { id: 'ev-3', timestamp: 'Today · 08:35', title: 'Intent Score Calculated', description: 'Calculated 94 / 100 (High Intent) based on RFP urgency and 3 open dispatch roles.', category: 'signal' },
        { id: 'ev-4', timestamp: 'Today · 08:40', title: 'Decision Maker Verified', description: 'Verified David Reynolds (VP Transportation) with 98% phone confidence rating.', category: 'enrichment' },
        { id: 'ev-5', timestamp: 'Today · 08:42', title: 'Sales Brief & Pitch Synthesized', description: 'Synthesized customized Q4 dispatch pitch and committee objection handbook.', category: 'call' }
      ],
      provenance: {
        platform: baseLead.source.platform,
        originalRequirement: baseLead.source.originalRequirement,
        sourceUrl: baseLead.source.sourceUrl,
        discoveredAt: baseLead.source.discoveredAt,
        postedAt: baseLead.source.postedAt,
        lastUpdated: 'Today · 08:42 AM',
        freshness: 'Fresh (Captured 18 hours ago)'
      }
    };
  }

  if (baseLead.id === 'lead-102') {
    return {
      ...baseLead,
      lastActivity: '42m ago',
      enrichmentState: 'completed',
      companyIntelligence: {
        overview: 'High-growth cloud communications provider offering enterprise telephony APIs and contact center integrations.',
        scale: 'Austin HQ · 100–250 employees · ₹115 Cr Series-A funding',
        techStack: {
          confirmed: ['HubSpot CRM', 'Segment CDP', 'Twilio Voice', 'Intercom'],
          displacing: ['Legacy SalesLoft outbound dialer']
        },
        aiInferences: [
          {
            deduction: 'Evaluating Vidur vs. SalesLoft due to G2 buyer matrix comparison surges.',
            confidence: 96,
            basis: '8 employee IP addresses accessed G2 Voice AI comparison page 4 hours ago.'
          },
          {
            deduction: 'Aggressive inbound SDR speed-to-lead expansion mandate tied to Series-A capital.',
            confidence: 90,
            basis: 'New VP of Growth hired from Twilio within last 30 days.'
          }
        ],
        potentialPainPoints: [
          'Inbound demo request response times exceed 4 hours, causing 42% prospect drop-off.',
          'SDR team overburdened with manual qualification calls for low-tier inbound leads.',
          'Legacy dialer lacks real-time sub-second CRM transcription sync.'
        ]
      },
      decisionMaker: {
        name: baseLead.decisionMakerContact?.name || 'Sarah Jenkins',
        role: baseLead.decisionMakerContact?.role || 'VP of Growth & Sales Ops',
        department: 'Growth Marketing & Revenue Operations',
        email: 's.jenkins@cloudscalesystems.io',
        phone: '+1 (512) 555-0192',
        phoneAvailable: true,
        confidence: 95,
        isDirectDial: true,
        linkedInUrl: 'https://mock.linkedin.com/in/sarah-jenkins-growth'
      },
      recommendedPitch: {
        pitch: "Hi Sarah, noticed your team evaluating voice AI cadences this morning. How are you tackling inbound speed-to-lead following the Series-A? We help B2B SaaS teams qualify inbound demo requests within 60 seconds with autonomous voice agents.",
        whyThisPitch: [
          'Directly references G2 Buyer Intent spike logged across their IP range.',
          'Connects to the ₹115 Cr Series-A commercial go-to-market mandate.',
          'Solves their 4-hour inbound demo drop-off bottleneck.'
        ],
        keyAngle: 'Sub-60s Inbound Voice Qualification & Real-Time CRM Booking',
        toneVariations: {
          direct: "Sarah, saw CloudScale evaluating voice AI cadences today. We cut inbound response time from 4 hours to 60 seconds. Let's do 10 minutes this week.",
          valueLed: "Hi Sarah, congrats on the Series-A. Other SaaS growth leaders use our voice agents to recapture 42% of lost demo requests within 1 minute of form submission.",
          technical: "Sarah, saw your G2 evaluation between Vidur and legacy dialers. Our platform delivers native HubSpot sync and sub-400ms voice latency. Want to see the benchmark?"
        }
      },
      callBrief: {
        opening: "Hi Sarah, noticed CloudScale evaluating voice AI cadences on G2 this morning. Are you aiming to solve inbound speed-to-lead?",
        leadContext: "Series-A funded B2B SaaS with 4-hour demo response lag causing 42% lead attrition before first touch.",
        keySignal: "G2 Buyer Intent surge logged 4h ago; ₹115 Cr Series-A closed with GTM mandate.",
        discoveryQuestion: "What is your current average time between a website demo request submission and an SDR's first outbound dial?",
        potentialObjection: "We are currently trialing a competing voice agent solution.",
        objectionCounter: "That makes complete sense. Most teams we work with evaluated them first, but switched when latency exceeded 1.2s. Our sub-400ms voice engine feels like an authentic human SDR. Can we run a live test together?",
        desiredOutcome: "Book a 20-minute product architecture and latency test session with Sarah and her lead SDR manager."
      },
      timeline: [
        { id: 'ev-1', timestamp: 'Today · 09:45', title: 'G2 Buyer Surge Detected', description: 'Detected 8 IP hits comparing Vidur vs. SalesLoft on G2 buyer intent matrix.', category: 'signal' },
        { id: 'ev-2', timestamp: 'Today · 09:48', title: 'Executive Recruiter Signal', description: 'Matched VP Growth recruitment from Twilio with Series-A capital deployment.', category: 'enrichment' },
        { id: 'ev-3', timestamp: 'Today · 09:50', title: 'Intent Score Calculated', description: 'Calculated 92 / 100 (High Intent) based on active category comparison.', category: 'signal' },
        { id: 'ev-4', timestamp: 'Today · 09:55', title: 'Decision Maker Verified', description: 'Verified Sarah Jenkins (VP Growth & Sales Ops) direct dial phone.', category: 'enrichment' }
      ],
      provenance: {
        platform: baseLead.source.platform,
        originalRequirement: baseLead.source.originalRequirement,
        sourceUrl: baseLead.source.sourceUrl,
        discoveredAt: baseLead.source.discoveredAt,
        postedAt: baseLead.source.postedAt,
        lastUpdated: 'Today · 09:55 AM',
        freshness: 'Fresh (Captured 4 hours ago)'
      }
    };
  }

  // Dynamic enrichment for all other realistic leads
  const primarySignal = baseLead.buyingSignals[0];
  const techConfirmed = baseLead.industry.includes('SaaS')
    ? ['Salesforce CRM', 'Outreach.io', 'ZoomInfo', 'AWS']
    : baseLead.industry.includes('Healthcare')
    ? ['Epic EHR', 'Twilio Healthcare', 'Cisco Call Manager']
    : baseLead.industry.includes('Manufacturing') || baseLead.industry.includes('Robotics')
    ? ['SAP ERP', 'Siemens PLM', 'Microsoft Teams Phone']
    : ['HubSpot CRM', 'VoIP PBX', 'Google Workspace'];

  return {
    ...baseLead,
    lastActivity: '1h ago',
    enrichmentState: 'completed',
    companyIntelligence: {
      overview: `${baseLead.companyName} is an active commercial enterprise operating within the ${baseLead.industry} sector in ${baseLead.location}.`,
      scale: `${baseLead.employeeCount} employees · ${baseLead.location} Operations`,
      techStack: {
        confirmed: techConfirmed,
        displacing: ['Manual Outreach & Legacy Spreadsheets']
      },
      aiInferences: [
        {
          deduction: `Actively evaluating automated commercial solutions to address ${baseLead.industry.toLowerCase()} operational bottlenecks.`,
          confidence: Math.min(95, baseLead.intentScore + 2),
          basis: `Detected intent signals: ${baseLead.scoreReasons[0] || 'Published industry requirement'}.`
        },
        {
          deduction: 'Current sales or operational workflow is creating quantifiable margin or cycle-time loss.',
          confidence: 88,
          basis: baseLead.detailedPain || 'Documented operational delay in customer touchpoints.'
        }
      ],
      potentialPainPoints: [
        baseLead.detailedPain || 'Manual outreach cadence creates significant lag in prospect qualification.',
        'High labor overhead allocated to repetitive customer qualification phone calls.',
        'Lack of real-time intent telemetry leading to unprioritized outbound calling queues.'
      ]
    },
    decisionMaker: {
      name: baseLead.decisionMakerContact?.name || 'Commercial Executive',
      role: baseLead.decisionMakerContact?.role || 'Head of Commercial Operations',
      department: 'Sales & Business Development',
      email: `contact@${baseLead.companyDomain || 'company.com'}`,
      phone: baseLead.decisionMakerContact?.phoneAvailable ? '+1 (555) 019-4820' : 'Switchboard Available Only',
      phoneAvailable: !!baseLead.decisionMakerContact?.phoneAvailable,
      confidence: baseLead.decisionMakerContact?.phoneAvailable ? 92 : 65,
      isDirectDial: !!baseLead.decisionMakerContact?.phoneAvailable,
      linkedInUrl: `https://mock.linkedin.com/company/${baseLead.companyName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`
    },
    recommendedPitch: {
      pitch: baseLead.suggestedOpeningHook,
      whyThisPitch: [
        `Directly acknowledges their detected trigger: ${baseLead.whyNow}.`,
        `Addresses verified commercial pain: ${baseLead.detailedPain || baseLead.requirement}.`,
        `Targets decision maker role: ${baseLead.decisionMakerContact?.role || 'Commercial Leader'}.`
      ],
      keyAngle: `Automated ${baseLead.industry} Touchpoint Acceleration`,
      toneVariations: {
        direct: `Hello, noticed ${baseLead.companyName}'s active requirement regarding ${baseLead.industry.toLowerCase()} automation. We streamline outbound sales touchpoints with sub-second AI voice agents. Do you have 10 minutes this week?`,
        valueLed: `Hi there, saw ${baseLead.companyName}'s recent initiative. Other leaders in ${baseLead.industry} partner with us to eliminate qualification delays and boost meeting conversions. Worth a brief walkthrough?`,
        technical: `Regarding ${baseLead.companyName}'s requirement: our voice AI integrates directly with standard CRMs to automate touchpoint workflows with zero latency. Can we share the technical brief?`
      }
    },
    callBrief: {
      opening: baseLead.suggestedOpeningHook,
      leadContext: `${baseLead.companyName} is in ${baseLead.industry} (${baseLead.employeeCount} employees) seeking: "${baseLead.requirement}"`,
      keySignal: primarySignal ? `${primarySignal.type}: ${primarySignal.description}` : baseLead.whyNow,
      discoveryQuestion: `How is your team currently handling ${baseLead.industry.toLowerCase()} qualification and outbound touchpoints?`,
      potentialObjection: "We are currently reviewing multiple potential approaches and vendors.",
      objectionCounter: "That makes total sense. We specifically specialize in autonomous sub-second voice agents that integrate directly into existing systems without workflow disruption. Would 5 minutes on Thursday be helpful to compare benchmarks?",
      desiredOutcome: `Secure a 20-minute discovery demo with ${baseLead.decisionMakerContact?.name || 'the leadership team'}.`
    },
    timeline: [
      { id: 'ev-1', timestamp: baseLead.source.discoveredAt, title: 'Requirement Discovered', description: `Captured from ${baseLead.source.platform}: "${baseLead.requirement.slice(0, 70)}..."`, category: 'discovery' },
      { id: 'ev-2', timestamp: '1h ago', title: 'Company Telemetry Enriched', description: `Enriched ${baseLead.companyName} firmographics: ${baseLead.employeeCount} employees in ${baseLead.location}.`, category: 'enrichment' },
      { id: 'ev-3', timestamp: '45m ago', title: 'Intent Score Calculated', description: `Intent score calculated at ${baseLead.intentScore} / 100 (${baseLead.intentLevel.toUpperCase()} INTENT).`, category: 'signal' },
      { id: 'ev-4', timestamp: '30m ago', title: 'Sales Brief & Pitch Ready', description: 'Synthesized personalized opening script and call preparation dossier.', category: 'call' }
    ],
    provenance: {
      platform: baseLead.source.platform,
      originalRequirement: baseLead.source.originalRequirement,
      sourceUrl: baseLead.source.sourceUrl,
      discoveredAt: baseLead.source.discoveredAt,
      postedAt: baseLead.source.postedAt,
      lastUpdated: 'Today · Active',
      freshness: 'Fresh (Captured within 24h)'
    }
  };
}

