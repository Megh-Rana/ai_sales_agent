import { TranslationKeys } from './en';

export const hi: TranslationKeys = {
  common: {
    loading: 'लोड हो रहा है...',
    error: 'त्रुटि',
    success: 'सफलता',
    cancel: 'रद्द करें',
    confirm: 'पुष्टि करें',
    save: 'सहेजें',
    delete: 'हटाएं',
    edit: 'संपादित करें',
    back: 'वापस',
    next: 'आगे',
    close: 'बंद करें',
    search: 'खोजें',
    filter: 'फ़िल्टर',
    export: 'निर्यात',
    refresh: 'रीफ्रेश',
  },
  
  navigation: {
    dashboard: 'डैशबोर्ड',
    leads: 'लीड्स और खाते',
    calls: 'AI वॉइस एजेंट कॉल्स',
    campaigns: 'आउटरीच कैडेंस',
    analytics: 'पाइपलाइन विश्लेषण',
    opportunities: 'अवसर रडार',
    copilot: 'सेल्स कोपायलट',
    settings: 'सेटिंग्स',
    commandCenter: 'राजस्व कमांड सेंटर',
    followUps: 'फॉलो-अप कतार',
    actions: 'सेल्स एक्शन सेंटर',
    discoverSignals: 'इरादे संकेत खोजें',
    businessProfile: 'व्यावसायिक प्रोफ़ाइल',
    sectionOverview: 'सिंहावलोकन',
    sectionSalesOps: 'बिक्री संचालन',
    sectionIntelligence: 'इंटेलिजेंस',
    sectionWorkspace: 'कार्यक्षेत्र',
    sectionAdmin: 'प्रशासन',
  },

  landing: {
    heroTitle: 'खरीद इरादे को बातचीत में बदलें',
    heroDescription: 'एंटरप्राइज लक्ष्यों के लिए रियल-टाइम B2B खरीद संकेत का पता लगाएं और 500ms से कम फोन कॉल में स्वायत्त AI वॉइस BDR एजेंट तैनात करें।',
    exploreDashboard: 'लाइव डैशबोर्ड देखें',
    interactiveCapabilities: 'इंटरैक्टिव क्षमता मैट्रिक्स',
    
    capabilities: {
      discovery: {
        title: 'सिग्नल खोज',
        heading: 'रियल-टाइम खरीद सिग्नल प्राप्ति',
        description: 'भर्ती वृद्धि, कार्यकारी परिवर्तन, प्रौद्योगिकी स्टैक तैनाती, और वेबसाइट मूल्य निर्धारण पृष्ठ विज़िट की निगरानी करता है ताकि लक्षित खातों को स्वचालित रूप से स्कोर किया जा सके।',
      },
      calling: {
        title: 'स्वायत्त वॉइस BDR',
        heading: '500ms से कम वार्तालाप टेलीफोनी',
        description: 'आउटबाउंड कॉल निष्पादित करता है, जटिल तकनीकी प्रश्नों का उत्तर देता है, रियल-टाइम में आपत्तियों को हल करता है, और कैलेंडर बैठकों को स्वचालित रूप से बुक करता है।',
      },
      intelligence: {
        title: 'राजस्व विश्लेषण',
        heading: 'पाइपलाइन पूर्वानुमान और रूपांतरण टेलीमेट्री',
        description: 'रियल-टाइम मूल्य अपडेट के साथ इरादे के स्कोर, कॉल गुणवत्ता मेट्रिक्स, योग्यता प्रगति, और अनुमानित राजस्व मेट्रिक्स को ट्रैक करता है।',
      },
    },

    workflow: {
      title: '10-चरण स्वायत्त बिक्री रीढ़',
      subtitle: 'सिग्नल खोज से लेकर बुक किए गए कार्यकारी बैठक तक निरंतर प्रगति',
    },

    features: {
      title: 'एंटरप्राइज AI क्षमताएं',
      subtitle: 'गहन टेलीमेट्री और स्वचालित BDR वर्कफ़्लो का निरीक्षण करने के लिए सुविधाओं पर क्लिक करें',
    },
  },

  actions: {
    followUpQueue: {
      title: 'फॉलो-अप डिस्पैच कतार',
      subtitle: 'लंबित टचपॉइंट और अनुसूचित कार्य केडेंस',
      due: 'देय',
      execute: 'फॉलो-अप निष्पादित करें',
      onSchedule: 'समय पर',
      active: 'फॉलो-अप डिस्पैच केडेंस सक्रिय',
    },
    nextBestAction: {
      title: 'अगली सर्वोत्तम कार्रवाई',
      subtitle: 'AI-अनुशंसित अगला कदम',
    },
    liveSignals: {
      title: 'लाइव सिग्नल फीड',
      subtitle: 'रियल-टाइम खरीद संकेत',
    },
  },

  calls: {
    status: {
      preCall: 'कॉल-पूर्व',
      connecting: 'कनेक्ट हो रहा है',
      ringing: 'रिंग हो रहा है',
      live: 'लाइव',
      paused: 'रोका गया',
      completed: 'पूर्ण',
      failed: 'विफल',
    },
    controls: {
      mute: 'म्यूट',
      unmute: 'अनम्यूट',
      pause: 'रोकें',
      resume: 'फिर से शुरू करें',
      takeover: 'मानव टेकओवर',
      endCall: 'कॉल समाप्त करें',
    },
    aiStatus: 'AI वॉइस बॉट',
    confidence: 'विश्वास',
    startCall: 'कॉल शुरू करें',
    viewResults: 'परिणाम देखें',
    backToLead: 'लीड पर वापस जाएं',
  },

  copilot: {
    title: 'सेल्स कोपायलट',
    conversationBrief: 'बातचीत संक्षिप्त और खाता खुफिया',
    openingHook: 'शुरुआती हुक',
    talkingPoints: 'बात करने के बिंदु',
    discoveryQuestions: 'खोज प्रश्न',
    objectionMatrix: 'आपत्ति हैंडलिंग मैट्रिक्स',
    actions: 'कार्रवाई',
    painPoints: 'पुष्ट दर्द बिंदु',
    techStack: 'पुष्ट तकनीकी स्टैक',
    scale: 'पैमाना और कंपनी पदचिह्न',
    lastTouchpoint: 'अंतिम टचपॉइंट',
  },

  leads: {
    intentScore: 'इरादा स्कोर',
    estimatedValue: 'अनुमानित मूल्य',
    whyNow: 'अभी क्यों',
    buyingSignals: 'खरीद संकेत',
    qualification: 'योग्यता',
    nextAction: 'अगली कार्रवाई',
  },

  topbar: {
    searchPlaceholder: 'खोजें या कमांड दें...',
    searchTooltip: 'कमांड खोजें',
    overviewDashboard: 'अवलोकन डैशबोर्ड',
  },

  dashboard: {
    title: 'सेल्स वर्कस्पेस',
    filterAll: 'सभी उच्च इरादा',
    filterCallReady: 'कॉल के लिए तैयार',
    filterFollowup: 'फॉलो-अप देय',
    scanSignals: 'खरीद संकेत स्कैन करें',
    pipelineSnapshot: 'पाइपलाइन स्नैपशॉट',
    recentActivity: 'हाल की गतिविधि',
    buyingSignals: 'खरीद संकेत',
  },

  analytics: {
    title: 'सेल्स एनालिटिक्स',
    subtitle: 'समझें कि आपकी बिक्री पाइपलाइन और वॉइस कॉल रूपांतरण को क्या गति दे रहा है।',
    badge: 'इंटेलिजेंस',
    exportPdf: 'पीडीएफ निर्यात करें',
    refresh: 'रिफ्रेश',
    today: 'आज',
    days7: '7 दिन',
    days30: '30 दिन',
    days90: '90 दिन',
    custom: 'कस्टम',
    state: 'स्थिति',
    metrics: 'प्रमुख मेट्रिक्स',
    conversionRate: 'रूपांतरण दर',
    callPerformance: 'कॉल प्रदर्शन',
    pipeline: 'पाइपलाइन',
    funnelTitle: 'स्वायत्त बिक्री रूपांतरण फ़नल',
    intentDistribution: 'खाता इरादा वितरण',
    conversionMetrics: 'रूपांतरण और गति टेलीमेट्री',
  },
};
