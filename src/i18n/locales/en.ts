export const en = {
  common: {
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    cancel: 'Cancel',
    confirm: 'Confirm',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    back: 'Back',
    next: 'Next',
    close: 'Close',
    search: 'Search',
    filter: 'Filter',
    export: 'Export',
    refresh: 'Refresh',
  },
  
  navigation: {
    dashboard: 'Dashboard',
    leads: 'Leads',
    calls: 'AI Calls',
    campaigns: 'Campaigns',
    analytics: 'Analytics',
    opportunities: 'Opportunities',
    copilot: 'Sales Copilot',
    settings: 'Settings',
  },

  landing: {
    heroTitle: 'TURN BUYING INTENT INTO CONVERSATIONS',
    heroDescription: 'Detect real-time B2B buying signals for enterprise targets and deploy autonomous AI Voice BDR agents in sub-500ms phone calls.',
    exploreDashboard: 'Explore Live Dashboard',
    interactiveCapabilities: 'Interactive Capabilities Matrix',
    
    capabilities: {
      discovery: {
        title: 'Signal Discovery',
        heading: 'Real-time Buying Signal Ingestion',
        description: 'Monitors hiring surges, executive changes, technology stack deployments, and website pricing page visits to automatically score target accounts.',
      },
      calling: {
        title: 'Autonomous Voice BDR',
        heading: 'Sub-500ms Conversational Telephony',
        description: 'Executes outbound calls, answers complex technical questions, resolves objections in real-time, and books calendar meetings automatically.',
      },
      intelligence: {
        title: 'Revenue Analytics',
        heading: 'Pipeline Forecast & Conversion Telemetry',
        description: 'Tracks intent scores, call quality metrics, qualification progress, and projected revenue metrics with real-time value updates.',
      },
    },

    workflow: {
      title: 'The 10-Step Autonomous Sales Backbone',
      subtitle: 'Continuous progression from signal discovery to booked executive meeting',
    },

    features: {
      title: 'Enterprise AI Capabilities',
      subtitle: 'Click features to inspect deep telemetry and automated BDR workflows',
    },
  },

  actions: {
    followUpQueue: {
      title: 'Follow-up Dispatch Queue',
      subtitle: 'Pending touchpoints & scheduled task cadences',
      due: 'Due',
      execute: 'Execute Follow-up',
      onSchedule: 'On Schedule',
      active: 'Follow-up dispatch cadence active',
    },
    nextBestAction: {
      title: 'Next Best Action',
      subtitle: 'AI-recommended next step',
    },
    liveSignals: {
      title: 'Live Signal Feed',
      subtitle: 'Real-time buying signals',
    },
  },

  calls: {
    status: {
      preCall: 'Pre-Call',
      connecting: 'Connecting',
      ringing: 'Ringing',
      live: 'Live',
      paused: 'Paused',
      completed: 'Completed',
      failed: 'Failed',
    },
    controls: {
      mute: 'Mute',
      unmute: 'Unmute',
      pause: 'Pause',
      resume: 'Resume',
      takeover: 'Human Takeover',
      endCall: 'End Call',
    },
    aiStatus: 'AI Voice Bot',
    confidence: 'Confidence',
    startCall: 'Start Call',
    viewResults: 'View Results',
    backToLead: 'Back to Lead',
  },

  copilot: {
    title: 'Sales Copilot',
    conversationBrief: 'Conversation Brief & Account Intelligence',
    openingHook: 'Opening Hook',
    talkingPoints: 'Talking Points',
    discoveryQuestions: 'Discovery Questions',
    objectionMatrix: 'Objection Handling Matrix',
    actions: 'Actions',
    painPoints: 'Confirmed Pain Points',
    techStack: 'Confirmed Tech Stack',
    scale: 'Scale & Company Footprint',
    lastTouchpoint: 'Last Touchpoint',
  },

  leads: {
    intentScore: 'Intent Score',
    estimatedValue: 'Estimated Value',
    whyNow: 'Why Now',
    buyingSignals: 'Buying Signals',
    qualification: 'Qualification',
    nextAction: 'Next Action',
  },

  analytics: {
    title: 'Revenue Analytics',
    metrics: 'Key Metrics',
    conversionRate: 'Conversion Rate',
    callPerformance: 'Call Performance',
    pipeline: 'Pipeline',
  },
};

export type TranslationKeys = typeof en;
