export type CompanySizeTier = '1-10' | '11-50' | '51-200' | '201-1000' | '1000+';

export type PricingModel = 'subscription' | 'usage' | 'fixed' | 'enterprise';

export type AgentDemeanor = 'consultative' | 'direct' | 'advisory';

export type VoiceLanguage =
  | 'en-US'
  | 'en-GB'
  | 'en-IN'
  | 'hi-IN'
  | 'mr-IN'
  | 'gu-IN';

export interface BusinessBasicsData {
  name: string;
  website: string;
  description: string;
  industry: string;
  companySize: CompanySizeTier;
  location: string;
  operatingRegions: string[];
}

export interface ProductOffering {
  id: string;
  name: string;
  type: 'product' | 'service' | 'platform' | 'advisory';
  description: string;
  customerProblem: string;
  usp: string;
  pricingModel: PricingModel;
  priceRange?: string;
}

export interface IdealCustomerData {
  industries: string[];
  companySizes: CompanySizeTier[];
  locations: string[];
  roles: string[];
  painPoints: string[];
  buyingTriggers: string[];
}

export interface TargetMarketData {
  industries: string[];
  regions: string[];
  excludedRegions?: string[];
  preferredCompanySizes: CompanySizeTier[];
  revenueThreshold: string;
  customerSegments: string[];
}

export interface SalesPreferencesData {
  primaryLanguage: VoiceLanguage;
  supportedLanguages: VoiceLanguage[];
  agentDemeanor: AgentDemeanor;
  leadSources: string[];
  callingPreference: 'aggressive' | 'standard' | 'cautious';
  followUpPreference: 'daily' | 'alternate' | 'weekly';
  businessHoursStart: string;
  businessHoursEnd: string;
  timezone: string;
  enforceDncWindows: boolean;
  maxTouches: number;
}

export interface KnowledgeDocument {
  id: string;
  name: string;
  sizeBytes: number;
  type: string;
  category: 'brochure' | 'pricing' | 'presentation' | 'faq' | 'documentation';
  uploadProgress: number;
  status: 'uploading' | 'ready' | 'error';
  uploadedAt: string;
  errorMessage?: string;
}

export interface GeneratedBusinessProfile {
  businessSummary: string;
  idealCustomer: string;
  coreProblems: string[];
  buyingSignals: string[];
  bestFitCustomers: string[];
  recommendedSalesApproach: string;
  confidenceScore: number;
  estimatedMonthlySignals: number;
  generatedAt: string;
}

export interface OnboardingFormData {
  business: BusinessBasicsData;
  offerings: ProductOffering[];
  idealCustomer: IdealCustomerData;
  targetMarket: TargetMarketData;
  salesPreferences: SalesPreferencesData;
  documents: KnowledgeDocument[];
  aiProfile?: GeneratedBusinessProfile;
}

export type OnboardingStepId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export interface OnboardingStepMeta {
  id: OnboardingStepId;
  name: string;
  shortLabel: string;
  description: string;
  category: 'identity' | 'offerings' | 'icp' | 'market' | 'sales' | 'knowledge' | 'ai' | 'review';
}
