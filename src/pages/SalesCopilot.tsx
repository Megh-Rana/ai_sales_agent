import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mockCopilotContexts } from '../data/mockCopilotData';
import { SalesConversationContext, CopilotOutcomeType } from '../types/copilot';
import { CopilotHeader } from '../components/copilot/CopilotHeader';
import { ConversationBriefCard } from '../components/copilot/ConversationBriefCard';
import { OpeningHookCard } from '../components/copilot/OpeningHookCard';
import { TalkingPointsSection } from '../components/copilot/TalkingPointsSection';
import { DiscoveryQuestionsSection } from '../components/copilot/DiscoveryQuestionsSection';
import { ObjectionMatrix } from '../components/copilot/ObjectionMatrix';
import { CopilotActionPanel } from '../components/copilot/CopilotActionPanel';
import { Sparkles, MessageSquare, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { useI18n } from '../i18n/i18nContext';

import { getLeadDetails } from '../data/leads';

function getCopilotContextForLead(targetLeadId: string): SalesConversationContext | null {
  const existing = mockCopilotContexts.find(c => c.leadId === targetLeadId || c.id === targetLeadId);
  if (existing) return existing;

  const lead = getLeadDetails(targetLeadId);
  if (!lead) return null;

  return {
    id: `copilot-${lead.id}`,
    leadId: lead.id,
    companyName: lead.companyName,
    companyDomain: lead.companyDomain || `${lead.companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
    industry: lead.industry,
    location: lead.location,
    contactName: lead.decisionMakerContact?.name || lead.decisionMaker?.name || 'Rahul Sharma',
    contactRole: lead.decisionMakerContact?.role || lead.decisionMaker?.role || 'Decision Maker',
    contactPhone: lead.decisionMaker?.phone || '+91 98765 43210',
    contactEmail: lead.decisionMaker?.email || 'contact@domain.com',
    phoneAvailable: lead.decisionMakerContact?.phoneAvailable ?? true,

    intentScore: lead.intentScore,
    estimatedValue: lead.estimatedValue,
    whyNowHeadline: lead.whyNow,
    whyNowRecency: '2 hours ago',
    primarySignal: lead.buyingSignals[0]?.type || 'Intent Surge',

    summaryBrief: lead.companyIntelligence?.overview || lead.requirement,
    confirmedPainPoints: lead.companyIntelligence?.potentialPainPoints || (lead.detailedPain ? [lead.detailedPain] : ['Manual lead qualification overhead']),
    techStack: lead.companyIntelligence?.techStack?.confirmed || ['HubSpot CRM', 'AWS Cloud'],
    scaleInfo: lead.employeeCount ? `${lead.employeeCount} employees` : 'Enterprise',

    openingHook: {
      hook: lead.suggestedOpeningHook || `Hi ${lead.decisionMakerContact?.name || 'there'}, noticed your intent signal around ${lead.industry}. Wanted to share how we accelerate qualification.`,
      rationale: `References verified intent signal for ${lead.companyName}.`,
      citation: `Based on ${lead.source.platform} feed (${lead.source.postedAt})`,
      tone: 'direct'
    },

    talkingPoints: [
      {
        id: `tp-${lead.id}-1`,
        angle: `Sub-60s Response in ${lead.industry}`,
        description: `Automate initial touchpoints within 60s of requirement signal.`,
        basis: `Solves: ${lead.detailedPain || 'Manual outreach lag'}`,
        suggestedPhrasing: `Our autonomous voice agent reaches out in under 60s to capture high commercial intent.`
      },
      {
        id: `tp-${lead.id}-2`,
        angle: 'CRM & Pipeline Integration',
        description: 'Bi-directional sync writes call transcripts directly to deal pipeline.',
        basis: `Integrates into existing tech stack`,
        suggestedPhrasing: 'Every call transcript and intent score automatically syncs to your sales workflow.'
      }
    ],

    discoveryQuestions: [
      {
        id: `dq-${lead.id}-1`,
        category: 'Need',
        question: `What is your current response time when high-intent signals occur in ${lead.industry}?`,
        whyAsk: 'Highlights response latency.',
        expectedInsight: 'Confirms manual bottleneck.'
      }
    ],

    objections: [
      {
        id: `obj-${lead.id}-1`,
        category: 'Price',
        objection: 'How does the ROI compare to traditional outreach?',
        suggestedResponse: 'Vidur replaces manual triage hours completely, delivering positive ROI within 30 days.',
        reasoning: 'Focus on speed and conversion lift.',
        discoveryPivot: 'What is your current cost per qualified opportunity?'
      }
    ],

    lastInteraction: {
      date: lead.source.postedAt,
      channel: lead.source.platform,
      summary: `Signal discovered on ${lead.source.platform}: ${lead.requirement.slice(0, 80)}...`
    },

    nextBestAction: {
      label: `Launch AI Voice Call to ${lead.decisionMakerContact?.name || lead.companyName}`,
      targetRoute: `/calls?leadId=${lead.id}`,
      actionType: 'call'
    }
  };
}

export const SalesCopilot: React.FC = () => {
  const { leadId } = useParams<{ leadId?: string }>();
  const navigate = useNavigate();
  const { t } = useI18n();
  const [contexts] = useState<SalesConversationContext[]>(mockCopilotContexts);
  const [selectedLeadId, setSelectedLeadId] = useState<string>(leadId || mockCopilotContexts[0].leadId);

  useEffect(() => {
    if (leadId) {
      setSelectedLeadId(leadId);
    }
  }, [leadId]);

  const activeContext = leadId
    ? getCopilotContextForLead(leadId)
    : (getCopilotContextForLead(selectedLeadId) || contexts[0]);

  const handleSelectLead = (newLeadId: string) => {
    setSelectedLeadId(newLeadId);
    navigate(`/copilot/${newLeadId}`);
  };

  const handleRecordOutcome = (targetLeadId: string, outcome: CopilotOutcomeType) => {
    if (activeContext) {
      toast.success(`Updated conversation outcome record for ${activeContext.companyName}.`);
    }
  };

  if (!activeContext) {
    return (
      <div className="min-h-[60vh] bg-background text-foreground p-6 sm:p-8 text-center flex flex-col items-center justify-center">
        <AlertTriangle className="w-10 h-10 text-amber-400 mb-3" />
        <h2 className="text-xl sm:text-2xl font-bold mb-2">No Context Found</h2>
        <p className="text-sm text-foreground-tertiary mt-1 max-w-md">
          The requested lead was not found. Select a lead from your pipeline to launch Sales Copilot.
        </p>
        <button
          type="button"
          onClick={() => navigate('/leads/discover')}
          className="mt-6 px-5 py-2.5 bg-primary text-white font-semibold rounded-xl text-sm hover:bg-primary-hover transition-colors"
        >
          Select a lead
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col pb-20">
      {/* COPILOT HEADER */}
      <CopilotHeader
        context={activeContext}
        allContexts={contexts}
        onSelectLead={handleSelectLead}
      />

      {/* COPILOT WORKSPACE MAIN BODY - More breathing room */}
      <main className="flex-1 px-4 sm:px-6 py-6 sm:py-8 max-w-6xl w-full mx-auto space-y-6 sm:space-y-8">
        {/* SECTION 1: BRIEF */}
        <ConversationBriefCard context={activeContext} />

        {/* SECTION 2: OPENING HOOK */}
        <OpeningHookCard openingHook={activeContext.openingHook} />

        {/* SECTION 3: TALKING POINTS */}
        <TalkingPointsSection points={activeContext.talkingPoints} />

        {/* SECTION 4: DISCOVERY QUESTIONS */}
        <DiscoveryQuestionsSection questions={activeContext.discoveryQuestions} />

        {/* SECTION 5: OBJECTIONS */}
        <ObjectionMatrix objections={activeContext.objections} />

        {/* SECTION 6: ACTIONS */}
        <CopilotActionPanel
          context={activeContext}
          onRecordOutcome={handleRecordOutcome}
        />
      </main>
    </div>
  );
};
