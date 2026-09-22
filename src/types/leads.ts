import { IntentLevel, SalesStatusType } from './sales';

export interface LeadBuyingSignal {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  impactScore: number;
}

export interface LeadSignalSource {
  platform: 'IndiaMART' | 'LinkedIn' | 'G2 Crowd' | 'RFP Portal' | 'TechStack' | 'Job Board' | 'Crunchbase' | 'X (Twitter)' | 'Company Website' | 'Company Website RFP' | 'Public B2B RFP Directories' | 'Freelance Job Boards' | 'Job Board (Hiring Signal)' | string;
  originalRequirement: string;
  sourceUrl: string;
  discoveredAt: string;
  postedAt: string;
}

export interface LeadCompanyIntelligence {
  overview: string;
  scale: string;
  techStack: {
    confirmed: string[];
    displacing?: string[];
  };
  aiInferences: Array<{
    deduction: string;
    confidence: number;
    basis: string;
  }>;
  potentialPainPoints: string[];
}

export interface LeadDecisionMaker {
  name: string;
  role: string;
  department: string;
  email: string;
  phone: string;
  phoneAvailable: boolean;
  confidence: number;
  isDirectDial: boolean;
  linkedInUrl?: string;
}

export interface LeadRecommendedPitch {
  pitch: string;
  whyThisPitch: string[];
  keyAngle: string;
  toneVariations?: {
    direct: string;
    valueLed: string;
    technical: string;
  };
}

export interface LeadCallBrief {
  opening: string;
  leadContext: string;
  keySignal: string;
  discoveryQuestion: string;
  potentialObjection: string;
  objectionCounter: string;
  desiredOutcome: string;
}

export interface LeadActivityEvent {
  id: string;
  timestamp: string;
  title: string;
  description: string;
  category: 'discovery' | 'enrichment' | 'signal' | 'call' | 'status';
  status?: string;
}

export interface LeadProvenance {
  platform: string;
  originalRequirement: string;
  sourceUrl: string;
  discoveredAt: string;
  postedAt: string;
  lastUpdated: string;
  freshness: string;
}

export interface DiscoveredLead {
  id: string;
  companyName: string;
  companyDomain?: string;
  industry: string;
  location: string;
  employeeCount: string;

  // Requirement & Buying Intent
  requirement: string;
  detailedPain?: string;
  intentScore: number;
  intentLevel: IntentLevel;
  scoreReasons: string[];

  // Timing & Provenance
  whyNow: string;
  buyingSignals: LeadBuyingSignal[];
  source: LeadSignalSource;

  // Economics & Recommended Action
  estimatedValue: string;
  recommendedAction: 'call' | 'brief' | 'campaign' | 'followup';
  suggestedOpeningHook: string;
  decisionMakerContact?: {
    name: string;
    role: string;
    phoneAvailable: boolean;
  };
  status: SalesStatusType;

  // Extended Lead Intelligence Fields
  lastActivity?: string;
  enrichmentState?: 'completed' | 'in-progress' | 'partial';
  companyIntelligence?: LeadCompanyIntelligence;
  decisionMaker?: LeadDecisionMaker;
  recommendedPitch?: LeadRecommendedPitch;
  callBrief?: LeadCallBrief;
  timeline?: LeadActivityEvent[];
  provenance?: LeadProvenance;
  website?: string;
  jobTitle?: string;
  linkedinUrl?: string;
  contactEmail?: string;
  contactPhone?: string;
  companySize?: string;
  signal_type?: 'direct_requirement' | 'inferred_hiring_signal';
  is_inferred_from_hiring?: boolean;
  inferred_need_basis?: string;
}

export type SortOption = 'intent' | 'freshness' | 'value';

export interface DiscoveryFilterState {
  query: string;
  intentLevel: 'all' | 'high' | 'medium' | 'low';
  freshness: 'today' | '3d' | '7d' | '30d' | 'all';
  industries: string[];
  locations: string[];
  signalTypes: string[];
  sources: string[];
  companySize?: string;
  companySizes: string[];
  sortBy: SortOption;
}

export interface SavedSegment {
  id: string;
  name: string;
  description?: string;
  filters: DiscoveryFilterState;
  leadCount: number;
  createdAt: string;
  updatedAt?: string;
}
