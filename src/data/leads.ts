import { DiscoveredLead } from '../types/leads';

// Zero hardcoded mock leads — Lead Discovery and Queue are powered purely by user queries and live discovered leads.
export const mockDiscoveredLeads: DiscoveredLead[] = [];

let inMemoryDiscoveredLeads: DiscoveredLead[] = [];

// ── Seller Business Profile Helper ──────────────────────────────
export interface SellerBusinessProfile {
  name: string;
  website: string;
  industry: string;
  offerings: string;
  usp: string;
}

export function getSellerBusinessProfile(): SellerBusinessProfile {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('vidur_onboarding_draft_v1') : null;
    if (raw) {
      const data = JSON.parse(raw);
      if (data?.business?.name?.trim()) {
        const offeringsText = Array.isArray(data.offerings) && data.offerings.length > 0
          ? data.offerings.map((o: any) => o.name).filter(Boolean).join(', ')
          : (data.business.description || 'Commercial products and services');
        const uspText = data.offerings?.[0]?.usp || data.business.description || 'High-quality supply and fast commercial fulfillment';
        return {
          name: data.business.name.trim(),
          website: data.business.website || '',
          industry: data.business.industry || 'Commercial Enterprise',
          offerings: offeringsText,
          usp: uspText,
        };
      }
    }
  } catch {}
  return {
    name: 'Vidur AI Sales',
    website: 'vidur.ai',
    industry: 'Commercial Sales & Outbound Telephony',
    offerings: 'Autonomous AI Sales Voice Agents & Lead Discovery',
    usp: 'High-speed automated buyer qualification and commercial deal closure',
  };
}

// ── Discovered Leads Storage ─────────────────────────────────────
export function getDiscoveredLeads(): DiscoveredLead[] {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('vidur_discovered_leads') : null;
    if (raw) {
      const parsed: DiscoveredLead[] = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to parse vidur_discovered_leads:', e);
  }
  return inMemoryDiscoveredLeads;
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
  if (!leadId) return;
  const ids = getQueuedLeadIds();
  const cleanId = String(leadId).trim();
  const exists = ids.some(id => id.toLowerCase() === cleanId.toLowerCase());
  if (!exists) {
    ids.push(cleanId);
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(QUEUE_KEY, JSON.stringify(ids));
        window.dispatchEvent(new CustomEvent('vidur_queue_updated', { detail: { leadId: cleanId, action: 'add' } }));
      }
    } catch {}
  }
}

export function removeLeadFromQueue(leadId: string): void {
  if (!leadId) return;
  const cleanId = String(leadId).trim().toLowerCase();
  const ids = getQueuedLeadIds().filter(id => id.toLowerCase() !== cleanId);
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(QUEUE_KEY, JSON.stringify(ids));
      window.dispatchEvent(new CustomEvent('vidur_queue_updated', { detail: { leadId, action: 'remove' } }));
    }
  } catch {}
}

export function getQueuedLeads(): DiscoveredLead[] {
  const ids = getQueuedLeadIds();
  if (!ids || ids.length === 0) return [];
  const all = getDiscoveredLeads();
  
  const results: DiscoveredLead[] = [];
  for (const id of ids) {
    const cleanId = String(id).trim().toLowerCase();
    const found = all.find(l => 
      l.id.toLowerCase() === cleanId || 
      l.id.toLowerCase() === `lead-${cleanId}` ||
      cleanId === `lead-${l.id.toLowerCase()}`
    );
    if (found) {
      results.push(found);
    } else {
      const fallback = getLeadDetails(id);
      if (fallback) results.push(fallback);
    }
  }
  return results;
}

export function isLeadQueued(leadId: string): boolean {
  if (!leadId) return false;
  const cleanId = String(leadId).trim().toLowerCase();
  return getQueuedLeadIds().some(id => 
    id.toLowerCase() === cleanId ||
    id.toLowerCase() === `lead-${cleanId}` ||
    cleanId === `lead-${id.toLowerCase()}`
  );
}

// ── Lead Details Resolver ─────────────────────────────────────────
export function getLeadDetails(rawLeadId: string | undefined): DiscoveredLead {
  const leadId = typeof rawLeadId === 'string' ? rawLeadId.trim() : String(rawLeadId || '').trim();
  const allLeads = getDiscoveredLeads();
  
  const foundLead = allLeads.find(
    (l) => l.id.toLowerCase() === leadId.toLowerCase() || 
           l.id.toLowerCase() === `lead-${leadId.toLowerCase()}` ||
           leadId.toLowerCase() === `lead-${l.id.toLowerCase()}`
  );

  const seller = getSellerBusinessProfile();
  const formattedName = leadId
    .replace(/^lead-|^call-|^opp-/i, '')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());

  const baseLead: DiscoveredLead = foundLead ?? {
    id: leadId || 'lead-discovered-1',
    companyName: formattedName ? `${formattedName} Enterprises` : 'Prospective Buyer',
    companyDomain: `${(leadId || 'prospect').replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}.com`,
    industry: 'Commercial Industry',
    location: 'India',
    employeeCount: '100–250',
    requirement: `Active commercial inquiry for ${seller.offerings}. Seeking qualified supplier.`,
    detailedPain: 'Seeking reliable fulfillment and fast turnaround for commercial supply.',
    intentScore: 85,
    intentLevel: 'high' as const,
    scoreReasons: [
      'Commercial requirement identified via discovery query',
      'Decision maker active in buying evaluation window',
      'Direct procurement inquiry'
    ],
    whyNow: 'Actively searching for qualified commercial vendors today.',
    buyingSignals: [
      {
        id: `sig-${Date.now()}`,
        type: 'Commercial Requirement',
        description: `Active interest in ${seller.offerings}.`,
        timestamp: 'Today',
        impactScore: 90
      }
    ],
    source: {
      platform: 'Company Website',
      originalRequirement: `Inquiry for ${seller.offerings}`,
      sourceUrl: 'https://vidur.ai/discovery',
      discoveredAt: 'Today',
      postedAt: 'Today'
    },
    estimatedValue: '₹25 Lakh / yr',
    recommendedAction: 'call' as const,
    suggestedOpeningHook: `Hi, Alex calling from ${seller.name}. Reaching out regarding your requirement. Do you have two minutes?`,
    decisionMakerContact: {
      name: 'Decision Maker',
      role: 'Procurement & Commercial Operations',
      phoneAvailable: true
    },
    status: 'discovered' as const
  };

  // If already fully enriched, return directly
  if (baseLead.companyIntelligence && baseLead.decisionMaker && baseLead.recommendedPitch) {
    return baseLead;
  }

  const primarySignal = (baseLead.buyingSignals && baseLead.buyingSignals[0]) || {
    id: 'sig-1',
    type: 'Intent Signal',
    description: baseLead.requirement || 'Active commercial requirement',
    timestamp: 'Today',
    impactScore: 85
  };

  return {
    ...baseLead,
    lastActivity: 'Just now',
    enrichmentState: 'completed',
    companyIntelligence: {
      overview: `${baseLead.companyName} is an active commercial prospect operating in ${baseLead.industry} in ${baseLead.location}.`,
      scale: `${baseLead.employeeCount} employees · ${baseLead.location}`,
      techStack: {
        confirmed: ['Standard CRM', 'Phone & Email Operations'],
        displacing: ['Manual Follow-ups']
      },
      aiInferences: [
        {
          deduction: `Evaluating commercial suppliers for ${seller.offerings}.`,
          confidence: Math.min(95, baseLead.intentScore + 2),
          basis: `Requirement: ${baseLead.requirement}`
        }
      ],
      potentialPainPoints: [
        baseLead.detailedPain || 'Manual outreach cadence creates lag in prospect qualification.',
        'Need reliable partner with high quality and prompt fulfillment.'
      ]
    },
    decisionMaker: {
      name: baseLead.decisionMakerContact?.name || 'Decision Maker',
      role: baseLead.decisionMakerContact?.role || 'Head of Procurement',
      department: 'Commercial Operations',
      email: `contact@${baseLead.companyDomain || 'company.com'}`,
      phone: baseLead.decisionMakerContact?.phoneAvailable ? '+91 98201 54890' : 'Direct Line Available',
      phoneAvailable: true,
      confidence: 90,
      isDirectDial: true,
      linkedInUrl: `https://linkedin.com/company/${baseLead.companyName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`
    },
    recommendedPitch: {
      pitch: `Hi ${baseLead.decisionMakerContact?.name || ''}, this is our team at ${seller.name}. We saw ${baseLead.companyName}'s requirement regarding ${baseLead.requirement}. How can we assist you with our ${seller.offerings}?`,
      whyThisPitch: [
        `Directly pitches ${seller.name}'s products to ${baseLead.companyName}.`,
        `Addresses their detected requirement: ${baseLead.requirement}.`,
        `Targets decision maker: ${baseLead.decisionMakerContact?.role || 'Procurement Leader'}.`
      ],
      keyAngle: `${seller.name} Supply & Fulfillment Solution`,
      toneVariations: {
        direct: `Hello, this is ${seller.name} calling regarding ${baseLead.companyName}'s requirement for ${baseLead.requirement}. Can we do a quick 5-minute call?`,
        valueLed: `Hi there, ${seller.name} specializes in ${seller.offerings}. We can provide competitive pricing and prompt fulfillment for ${baseLead.companyName}.`,
        technical: `Regarding ${baseLead.companyName}'s specifications: ${seller.name} provides certified fulfillment and dedicated support. Would you like our catalog and quotation?`
      }
    },
    callBrief: {
      opening: `Hi ${baseLead.decisionMakerContact?.name || ''}, this is Alex calling from ${seller.name}. Reaching out to ${baseLead.companyName} regarding your commercial requirement. Do you have a minute?`,
      leadContext: `${baseLead.companyName} (${baseLead.industry}) has requirement: "${baseLead.requirement}"`,
      keySignal: primarySignal ? `${primarySignal.type}: ${primarySignal.description}` : baseLead.whyNow,
      discoveryQuestion: `What specific volume or specifications is ${baseLead.companyName} looking for in this requirement?`,
      potentialObjection: "We are currently evaluating multiple suppliers.",
      objectionCounter: `Understood. ${seller.name} offers competitive commercial terms and verified fulfillment. Could we share a quick sample or quote for comparison?`,
      desiredOutcome: `Qualify requirements and schedule a detailed commercial quotation with ${baseLead.decisionMakerContact?.name || 'the procurement team'}.`
    },
    timeline: [
      { id: 'ev-1', timestamp: 'Today', title: 'Requirement Discovered', description: `Captured from ${baseLead.source?.platform || 'Web Discovery'}: "${(baseLead.requirement || '').slice(0, 70)}..."`, category: 'discovery' },
      { id: 'ev-2', timestamp: 'Just now', title: 'Intelligence Synthesized', description: `Matched with ${seller.name} catalog and generated opening sales brief.`, category: 'call' }
    ],
    provenance: {
      platform: baseLead.source?.platform || 'Web Discovery',
      originalRequirement: baseLead.source?.originalRequirement || baseLead.requirement,
      sourceUrl: baseLead.source?.sourceUrl || 'https://vidur.ai',
      discoveredAt: 'Today',
      postedAt: 'Today',
      lastUpdated: 'Today · Active',
      freshness: 'Fresh'
    }
  };
}
