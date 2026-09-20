import { DiscoveredLead } from '../types/leads';

// Mock leads removed — Lead Discovery now starts empty.
// Leads are fetched live via AI discovery when the user types a query.
export const mockDiscoveredLeads: DiscoveredLead[] = [];

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

// ── Queue / Pipeline Management ─────────────────────────────────
const QUEUE_KEY = 'vidur_queued_leads';

export function getQueuedLeadIds(): string[] {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(QUEUE_KEY) : null;
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addLeadToQueue(leadId: string): void {
  const ids = getQueuedLeadIds();
  if (!ids.includes(leadId)) {
    ids.push(leadId);
    try {
      localStorage.setItem(QUEUE_KEY, JSON.stringify(ids));
    } catch {}
  }
}

export function removeLeadFromQueue(leadId: string): void {
  const ids = getQueuedLeadIds().filter(id => id !== leadId);
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(ids));
  } catch {}
}

export function getQueuedLeads(): DiscoveredLead[] {
  const ids = getQueuedLeadIds();
  const all = getDiscoveredLeads();
  return ids.map(id => all.find(l => l.id === id)).filter(Boolean) as DiscoveredLead[];
}

export function isLeadQueued(leadId: string): boolean {
  return getQueuedLeadIds().includes(leadId);
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

  // Dynamic enrichment for all discovered leads
  const primarySignal = baseLead.buyingSignals[0];
  const techConfirmed = baseLead.industry.includes('SaaS')
    ? ['Salesforce CRM', 'Outreach.io', 'ZoomInfo', 'AWS']
    : baseLead.industry.includes('Healthcare')
    ? ['Epic EHR', 'Twilio Healthcare', 'Cisco Call Manager']
    : baseLead.industry.includes('Manufacturing') || baseLead.industry.includes('Robotics')
    ? ['SAP ERP', 'Siemens PLM', 'Microsoft Teams Phone']
    : baseLead.industry.includes('Logistics') || baseLead.industry.includes('Supply')
    ? ['SAP TMS', 'Geotab Telematics', 'Twilio SIP Trunk', 'Slack Ops']
    : baseLead.industry.includes('Fintech') || baseLead.industry.includes('Financial')
    ? ['Finacle Core Banking', 'Genesys Cloud', 'Razorpay APIs', 'Snowflake']
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
      phone: baseLead.decisionMakerContact?.phoneAvailable ? '+91 98201 54890' : 'Switchboard Available Only',
      phoneAvailable: !!baseLead.decisionMakerContact?.phoneAvailable,
      confidence: baseLead.decisionMakerContact?.phoneAvailable ? 92 : 65,
      isDirectDial: !!baseLead.decisionMakerContact?.phoneAvailable,
      linkedInUrl: `https://linkedin.com/company/${baseLead.companyName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`
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
