import React, { useState, useEffect } from 'react';
import { CampaignObjectiveType, SalesCampaign } from '../../types/campaigns';
import { mockDiscoveredLeads } from '../../data/leads';
import { DiscoveredLead } from '../../types/leads';
import { dataBackboneService } from '../../services/dataBackboneService';
import {
  X,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Target,
  Users,
  PhoneCall,
  Edit3,
} from 'lucide-react';

interface CampaignBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLaunchCampaign: (newCampaign: SalesCampaign) => void;
}

export const CampaignBuilderModal: React.FC<CampaignBuilderModalProps> = ({
  isOpen,
  onClose,
  onLaunchCampaign,
}) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('Q3 High-Intent Requirement Surge');
  const [objective, setObjective] = useState<CampaignObjectiveType>('REQUIREMENT_RESPONSE');
  const [availableLeads, setAvailableLeads] = useState<DiscoveredLead[]>(mockDiscoveredLeads);
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [customHooks, setCustomHooks] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync leads from database
  useEffect(() => {
    let isMounted = true;
    dataBackboneService.getLeads().then((leads) => {
      if (isMounted && leads && leads.length > 0) {
        setAvailableLeads(leads);
        // Default select top 2 real leads from DB
        const topIds = [leads[0]?.id, leads[1]?.id].filter(Boolean) as string[];
        setSelectedLeadIds(topIds);
        setCustomHooks({
          [leads[0]?.id || 'lead-1']: `Noticed ${leads[0]?.companyName} recently posted a requirement for ${leads[0]?.requirement?.slice(0, 50) || 'solutions'}...`,
          [leads[1]?.id || 'lead-2']: `Noticed your company is expanding operations and evaluating sales automation...`,
        });
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  if (!isOpen) return null;

  const toggleLeadSelection = (id: string) => {
    setSelectedLeadIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleHookChange = (id: string, val: string) => {
    setCustomHooks((prev) => ({ ...prev, [id]: val }));
  };

  const handleNext = () => {
    if (step < 5) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleCompleteLaunch = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const campaignTitle = name.trim() || 'New Outreach Campaign';

    const selectedLeads = availableLeads
      .filter((l: DiscoveredLead) => selectedLeadIds.includes(l.id))
      .map((l: DiscoveredLead) => ({
        leadId: l.id,
        companyName: l.companyName,
        contactName: l.decisionMakerContact?.name || l.companyName,
        contactRole: l.decisionMakerContact?.role || 'Executive',
        phone: '+91 98765 43210',
        intentScore: l.intentScore,
        industry: l.industry,
        customOpeningHook:
          customHooks[l.id] || `Hi, calling regarding ${l.companyName}'s current requirement...`,
        customValueProp:
          'Vidur AI handles lead qualification and books demo appointments automatically.',
        status: 'QUEUED' as const,
      }));

    // Post to backend database API
    const created = await dataBackboneService.createCampaign({
      name: campaignTitle,
      objective,
      primary_channel: 'AI_VOICE_CALL',
      status: 'RUNNING',
      estimated_pipeline_value: '₹42.5L',
      lead_ids: selectedLeadIds,
      leads: selectedLeads.map((sl) => ({
        lead_id: sl.leadId,
        custom_opening_hook: sl.customOpeningHook,
        custom_value_prop: sl.customValueProp,
        status: 'QUEUED',
      })),
    });

    if (created) {
      onLaunchCampaign(created);
    } else {
      // Fallback local campaign object preserving the real lead IDs
      const newCamp: SalesCampaign = {
        id: `camp-${Date.now()}`,
        name: campaignTitle,
        objective,
        objectiveLabel:
          objective === 'REQUIREMENT_RESPONSE'
            ? 'Public Requirement Response'
            : objective === 'BOOK_MEETINGS'
            ? 'Meeting Booking'
            : 'ICP Outreach',
        status: 'RUNNING',
        primaryChannel: 'AI_VOICE_CALL',
        targetAudienceCount: selectedLeads.length,
        contactedCount: 0,
        qualifiedCount: 0,
        meetingsBookedCount: 0,
        conversionRate: 0,
        estimatedPipelineValue: '₹42.5L',
        createdAt: new Date().toISOString(),
        startedAt: new Date().toISOString(),
        leads: selectedLeads,
      };
      onLaunchCampaign(newCamp);
    }

    setIsSubmitting(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="bg-surface-0 border border-border-default rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col justify-between">
        {/* Modal Header */}
        <div className="p-5 md:p-6 border-b border-border-subtle flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-primary-muted text-primary border border-primary/30">
              <Target className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h2 id="modal-title" className="text-h3 font-bold text-foreground">
                Create Outreach Campaign
              </h2>
              <p className="text-caption text-foreground-tertiary">
                Step {step} of 5 — {step === 1 && 'Campaign Objective'}
                {step === 2 && 'Target Accounts'}
                {step === 3 && 'Outreach Strategy'}
                {step === 4 && 'Personalization Preview'}
                {step === 5 && 'Review & Launch'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-foreground-tertiary hover:text-foreground hover:bg-surface-hover transition-colors focus:outline-none focus:ring-1 focus:ring-primary"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Modal Body Wizard Content */}
        <div className="p-6 space-y-6 flex-1">
          {/* STEP 1: OBJECTIVE */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-caption font-semibold text-foreground-secondary uppercase tracking-wider mb-1.5">
                  Campaign Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-surface-1 border border-border-default focus:border-primary rounded-lg px-4 py-2.5 text-small text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-caption font-semibold text-foreground-secondary uppercase tracking-wider mb-2">
                  Select Campaign Objective
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    {
                      id: 'REQUIREMENT_RESPONSE',
                      title: 'Public Requirement Response',
                      desc: 'Prioritize leads with public tenders or posted RFPs.',
                    },
                    {
                      id: 'BOOK_MEETINGS',
                      title: 'Book Executive Demos',
                      desc: 'Direct outreach for high-intent lead qualification.',
                    },
                    {
                      id: 'REENGAGE_STALLED',
                      title: 'Re-engage Stalled Deals',
                      desc: 'Target opportunities sitting idle for > 48 hours.',
                    },
                    {
                      id: 'ICP_OUTREACH',
                      title: 'ICP Industry Surge',
                      desc: 'Batch outreach to Technology & SaaS target verticals.',
                    },
                  ].map((obj) => (
                    <div
                      key={obj.id}
                      onClick={() => setObjective(obj.id as CampaignObjectiveType)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        objective === obj.id
                          ? 'bg-primary-muted border-primary text-foreground'
                          : 'bg-surface-1 border-border-subtle text-foreground-secondary hover:border-border-default'
                      }`}
                    >
                      <h4 className="font-bold text-small text-foreground">{obj.title}</h4>
                      <p className="text-caption text-foreground-tertiary mt-1 leading-snug">{obj.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: AUDIENCE SELECTION */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-caption font-semibold text-foreground-secondary uppercase tracking-wider">
                  Target Discovered Leads ({selectedLeadIds.length} Selected)
                </span>
                <span className="text-caption text-primary font-mono font-semibold">
                  Intent Filter: Score &gt; 70
                </span>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {availableLeads.slice(0, 10).map((lead: DiscoveredLead) => {
                  const isSelected = selectedLeadIds.includes(lead.id);
                  return (
                    <div
                      key={lead.id}
                      onClick={() => toggleLeadSelection(lead.id)}
                      className={`p-3 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-primary-muted border-primary/50'
                          : 'bg-surface-1 border-border-subtle hover:border-border-default'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="rounded border-border-default text-primary focus:ring-0"
                        />
                        <div>
                          <h4 className="font-bold text-xs text-foreground">{lead.companyName}</h4>
                          <span className="text-[11px] text-foreground-tertiary">{lead.industry}</span>
                        </div>
                      </div>
                      <span className="text-caption font-mono font-bold text-signal-high bg-signal-high/10 px-2 py-0.5 rounded border border-signal-high/30">
                        Intent: {lead.intentScore}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: STRATEGY & CHANNEL */}
          {step === 3 && (
            <div className="space-y-4">
              <span className="text-caption font-semibold text-foreground-secondary uppercase tracking-wider">
                Select Primary Outreach Channel
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-primary-muted border border-primary rounded-xl p-4 text-foreground">
                  <div className="flex items-center space-x-2 mb-2">
                    <PhoneCall className="w-4 h-4 text-primary" />
                    <h4 className="font-bold text-small">AI Voice Agent Cadence</h4>
                  </div>
                  <p className="text-caption text-foreground-secondary">
                    Autonomous voice calls with real-time sentiment analysis and lead qualification.
                  </p>
                </div>
                <div className="bg-surface-1 border border-border-subtle rounded-xl p-4 text-foreground-tertiary">
                  <div className="flex items-center space-x-2 mb-2">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <h4 className="font-bold text-small text-foreground">Multi-Channel Touchpoint</h4>
                  </div>
                  <p className="text-caption">
                    Combines AI Voice Agent call with follow-up task dispatch.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: PERSONALIZATION PREVIEW */}
          {step === 4 && (
            <div className="space-y-4">
              <span className="text-caption font-semibold text-foreground-secondary uppercase tracking-wider">
                AI Pitch Opening Preview & Editable Hooks
              </span>
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {selectedLeadIds.map((id) => {
                  const lead = availableLeads.find((l: DiscoveredLead) => l.id === id) || mockDiscoveredLeads.find((l: DiscoveredLead) => l.id === id);
                  if (!lead) return null;
                  return (
                    <div key={id} className="bg-surface-1 border border-border-subtle rounded-lg p-3.5 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-foreground">{lead.companyName}</span>
                        <span className="text-[11px] text-primary font-mono flex items-center gap-1">
                          <Edit3 className="w-3 h-3" />
                          Editable Opening Pitch
                        </span>
                      </div>
                      <textarea
                        value={customHooks[id] || ''}
                        onChange={(e) => handleHookChange(id, e.target.value)}
                        rows={2}
                        className="w-full bg-surface-0 border border-border-default rounded p-2 text-xs text-foreground focus:outline-none focus:border-primary"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 5: REVIEW & LAUNCH */}
          {step === 5 && (
            <div className="space-y-4 bg-surface-1 border border-border-default rounded-xl p-5 text-caption text-foreground-secondary">
              <h3 className="font-bold text-small text-foreground mb-2">Campaign Ready for Launch</h3>
              <div className="grid grid-cols-2 gap-3 font-mono">
                <div>
                  <span className="text-foreground-tertiary block">Campaign Name:</span>
                  <span className="font-bold text-foreground">{name}</span>
                </div>
                <div>
                  <span className="text-foreground-tertiary block">Target Audience:</span>
                  <span className="font-bold text-signal-qualified">{selectedLeadIds.length} Accounts</span>
                </div>
                <div>
                  <span className="text-foreground-tertiary block">Primary Channel:</span>
                  <span className="font-bold text-primary">AI Voice Agent Cadence</span>
                </div>
                <div>
                  <span className="text-foreground-tertiary block">Est. Pipeline:</span>
                  <span className="font-bold text-foreground">₹42.5L</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-5 border-t border-border-subtle flex items-center justify-between">
          <button
            type="button"
            onClick={handleBack}
            disabled={step === 1}
            className="inline-flex items-center space-x-1 px-4 py-2 rounded-lg bg-surface-1 text-foreground-secondary hover:text-foreground border border-border-default text-caption font-semibold disabled:opacity-40 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          {step < 5 ? (
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-primary-foreground text-caption font-semibold transition-all shadow-xs"
            >
              <span>Next Step</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleCompleteLaunch}
              disabled={isSubmitting}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-caption font-semibold transition-all shadow-xs disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Launching...' : 'Launch Campaign Now'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
