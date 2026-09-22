import {
  OnboardingFormData,
  OnboardingStepMeta,
  GeneratedBusinessProfile,
} from '../types/onboarding';

export const ONBOARDING_STEPS: OnboardingStepMeta[] = [
  {
    id: 1,
    name: 'Business Basics',
    shortLabel: 'Basics',
    description: 'Establish the operational baseline for your autonomous sales agent.',
    category: 'identity',
  },
  {
    id: 2,
    name: 'Products & Services',
    shortLabel: 'Offerings',
    description: 'Detail the specific products and value propositions your agent will pitch.',
    category: 'offerings',
  },
  {
    id: 3,
    name: 'Ideal Customer',
    shortLabel: 'ICP',
    description: 'Define high-conversion buyer personas, organization tiers, and pain points.',
    category: 'icp',
  },
  {
    id: 4,
    name: 'Target Market',
    shortLabel: 'Market',
    description: 'Configure geographic boundaries, industry sectors, and account filters.',
    category: 'market',
  },
  {
    id: 5,
    name: 'Sales Preferences',
    shortLabel: 'Sales Protocol',
    description: 'Configure agent voice language, communication tone, and calling windows.',
    category: 'sales',
  },
  {
    id: 6,
    name: 'Knowledge / Documents',
    shortLabel: 'Documents',
    description: 'Upload product decks, pricing sheets, and FAQs to ground agent responses.',
    category: 'knowledge',
  },
  {
    id: 7,
    name: 'AI Understanding',
    shortLabel: 'AI Synthesis',
    description: 'Autonomous calibration pipeline synthesizing your business sales parameters.',
    category: 'ai',
  },
  {
    id: 8,
    name: 'Business Intelligence Profile',
    shortLabel: 'AI Profile',
    description: 'Executive blueprint of your autonomous sales strategy and buying signals.',
    category: 'ai',
  },
  {
    id: 9,
    name: 'Review & Confirm',
    shortLabel: 'Review',
    description: 'Verify your configuration and activate your autonomous sales workspace.',
    category: 'review',
  },
];

export const initialOnboardingData: OnboardingFormData = {
  business: {
    name: '',
    website: '',
    description: '',
    industry: 'B2B SaaS',
    companySize: '11-50',
    location: '',
    operatingRegions: ['North America'],
  },
  offerings: [
    {
      id: 'offering-1',
      name: '',
      type: 'product',
      description: '',
      customerProblem: '',
      usp: '',
      pricingModel: 'subscription',
      priceRange: '₹8 Lakh - ₹40 Lakh / year',
    },
  ],
  idealCustomer: {
    industries: ['Logistics & Supply Chain', 'B2B SaaS'],
    companySizes: ['51-200', '201-1000'],
    locations: ['North America', 'Western Europe'],
    roles: ['VP of Operations', 'Director of Supply Chain'],
    painPoints: ['Manual inventory cycle counts', 'High warehouse labor turnover'],
    buyingTriggers: [
      'New warehouse or facility expansion announced',
      'Key leadership transition (VP/Director hired in past 90 days)',
    ],
  },
  targetMarket: {
    industries: ['3PL & Warehousing', 'Cold Chain Distribution', 'E-Commerce Logistics'],
    regions: ['North America', 'Western Europe'],
    preferredCompanySizes: ['51-200', '201-1000'],
    revenueThreshold: '>₹10 Cr ARR',
    customerSegments: ['Mid-Market Enterprises', 'Fast-Growing 3PL Providers'],
  },
  salesPreferences: {
    primaryLanguage: 'en-US',
    supportedLanguages: ['en-US', 'hi-IN'],
    agentDemeanor: 'consultative',
    leadSources: ['Inbound Signal Radar', 'Executive Job Boards', 'Tech Stack Migration Feeds'],
    callingPreference: 'standard',
    followUpPreference: 'alternate',
    businessHoursStart: '09:00',
    businessHoursEnd: '18:00',
    timezone: 'America/New_York',
    enforceDncWindows: true,
    maxTouches: 3,
  },
  documents: [],
};

export const sampleB2BProfileData: OnboardingFormData = {
  business: {
    name: 'Veloce Robotics',
    website: 'https://veloce-robotics.ai',
    description:
      'We manufacture AI-guided autonomous aerial scanners that automate warehouse inventory auditing, eliminating manual cycle counts and reducing stock shrinkage by up to 84%.',
    industry: 'Industrial Automation & Robotics',
    companySize: '51-200',
    location: 'Austin, TX',
    operatingRegions: ['North America', 'Western Europe'],
  },
  offerings: [
    {
      id: 'offering-1',
      name: 'AeroScan Inventory Quad v3',
      type: 'product',
      description:
        'Self-navigating indoor drone hardware equipped with LiDAR and optical barcode recognition for high-bay pallet scanning.',
      customerProblem:
        'Warehouses spend 180+ labor hours every month on manual cherry-picker inventory audits with a 4.2% human error rate.',
      usp:
        'Zero fixed facility markers required; scans 10,000 pallet locations per hour and pushes real-time reconciliation to SAP WMS.',
      pricingModel: 'subscription',
      priceRange: '₹30 Lakh / facility / year',
    },
    {
      id: 'offering-2',
      name: 'Veloce WMS Sync Engine',
      type: 'platform',
      description:
        'Real-time cloud analytics layer reconciling physical inventory with enterprise ERPs and notifying supervisors of misplaced stock.',
      customerProblem:
        'Phantom stockouts and mismatch between ERP records and physical warehouse racks leading to missed SLA shipments.',
      usp:
        'Pre-built bi-directional connectors for SAP EWM, Manhattan Associates, and Blue Yonder deployed in under 48 hours.',
      pricingModel: 'usage',
      priceRange: '₹1,00,000 / month',
    },
  ],
  idealCustomer: {
    industries: ['3PL & Warehousing', 'Cold Chain Distribution', 'Automotive Logistics'],
    companySizes: ['51-200', '201-1000', '1000+'],
    locations: ['North America', 'Western Europe'],
    roles: [
      'VP of Logistics & Supply Chain',
      'Director of Warehouse Operations',
      'Chief Operating Officer',
      'General Manager - Fulfillment',
    ],
    painPoints: [
      'Excessive labor spend on monthly inventory cycle counts',
      'Safety hazards from workers operating scissor lifts in high-bay aisles',
      'Shipping delays caused by misplaced pallet inventories',
    ],
    buyingTriggers: [
      'New warehouse facility expansion or greenfield DC opening',
      'Executive leadership change in supply chain or warehouse operations',
      'Public mention of supply chain automation or robotics initiatives',
    ],
  },
  targetMarket: {
    industries: ['Contract Logistics (3PL)', 'Pharmaceutical Distribution', 'E-Commerce Fulfillment'],
    regions: ['North America (US & Canada)', 'Western Europe (UK, Germany, Benelux)'],
    excludedRegions: ['Restricted Military Facilities'],
    preferredCompanySizes: ['51-200', '201-1000'],
    revenueThreshold: '>₹200 Cr Annual Revenue',
    customerSegments: ['High-volume Distribution Centers', 'Omni-channel 3PLs'],
  },
  salesPreferences: {
    primaryLanguage: 'en-US',
    supportedLanguages: ['en-US', 'hi-IN', 'mr-IN'],
    agentDemeanor: 'consultative',
    leadSources: ['Supply Chain Job Postings', 'Warehouse Expansion Permits', 'G2 Category Intent'],
    callingPreference: 'standard',
    followUpPreference: 'alternate',
    businessHoursStart: '09:00',
    businessHoursEnd: '17:30',
    timezone: 'America/Chicago',
    enforceDncWindows: true,
    maxTouches: 3,
  },
  documents: [
    {
      id: 'doc-1',
      name: 'Veloce_AeroScan_Enterprise_Deck_2026.pdf',
      sizeBytes: 4280000,
      type: 'application/pdf',
      category: 'presentation',
      uploadProgress: 100,
      status: 'ready',
      uploadedAt: '2 mins ago',
    },
    {
      id: 'doc-2',
      name: 'Warehouse_ROI_Calculator_Matrix.xlsx',
      sizeBytes: 1120000,
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      category: 'pricing',
      uploadProgress: 100,
      status: 'ready',
      uploadedAt: '1 min ago',
    },
  ],
};

export function generateMockAIProfile(data: OnboardingFormData): GeneratedBusinessProfile {
  const primaryOffering = data.offerings[0] || {
    name: 'Enterprise Core Solution',
    customerProblem: 'Operational friction and legacy manual workflows',
    usp: 'Automated intelligence and rapid enterprise integration',
  };

  const companyName = data.business.name || 'Your Company';
  const targetIndustry = data.idealCustomer.industries[0] || data.business.industry || 'B2B Enterprise';
  const primaryPain = data.idealCustomer.painPoints[0] || primaryOffering.customerProblem || 'Inefficient manual operations';
  const primaryTrigger = data.idealCustomer.buyingTriggers[0] || 'Leadership churn or facility expansion';

  return {
    businessSummary: `${companyName} delivers high-value solutions in the ${targetIndustry} space, specializing in ${primaryOffering.name || 'core offerings'} designed to overcome ${primaryPain.toLowerCase()}.`,
    idealCustomer: `Mid-market and enterprise organizations in ${targetIndustry} with ${data.idealCustomer.companySizes.join(', ') || '50–500'} employees, led by ${data.idealCustomer.roles.slice(0, 2).join(' and ') || 'Operations leaders'}.`,
    coreProblems: data.idealCustomer.painPoints.length > 0
      ? data.idealCustomer.painPoints
      : [
          primaryPain,
          'High operational overhead and friction across legacy manual workflows',
          'Inability to scale touchpoints without linearly expanding headcount',
        ],
    buyingSignals: data.idealCustomer.buyingTriggers.length > 0
      ? data.idealCustomer.buyingTriggers
      : [
          primaryTrigger,
          'Job postings for SDR, Sales Operations, and Supply Chain leaders in last 48h',
          'Technology migration or replacement of legacy vendor contracts',
        ],
    bestFitCustomers: [
      `High-growth ${targetIndustry} accounts operating in ${data.targetMarket.regions.join(', ') || 'target regions'}`,
      `Organizations experiencing ${primaryTrigger.toLowerCase()}`,
      `Companies with verified budget allocation threshold (${data.targetMarket.revenueThreshold || '>₹10 Cr ARR'})`,
    ],
    recommendedSalesApproach: `Lead with measurable ROI and speed-to-value: address ${primaryPain.toLowerCase()} within the first 20 seconds. Highlight ${primaryOffering.usp || 'proven automated efficiency'} before positioning a live 15-minute operational audit.`,
    confidenceScore: 94,
    estimatedMonthlySignals: 148,
    generatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
}
