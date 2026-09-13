import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mockCampaignsData } from '../data/mockCampaigns';
import { CampaignCadenceProgress } from '../components/campaigns/CampaignCadenceProgress';
import {
  ArrowLeft,
  Target,
  PhoneCall,
  UserCheck,
  CheckCircle2,
  Clock,
  Building2,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';

export const CampaignDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const campaign =
    mockCampaignsData.find((c) => c.id === id) || mockCampaignsData[0];

  return (
    <div className="space-y-8 select-none pb-16">
      {/* HEADER BAR */}
      <div className="bg-surface-0 border border-border-default rounded-xl p-5 md:p-6 shadow-xs">
        <div className="flex items-center space-x-2 text-caption text-foreground-tertiary mb-3">
          <button
            type="button"
            onClick={() => navigate('/campaigns')}
            className="hover:text-foreground flex items-center space-x-1 font-semibold transition-colors focus:outline-none focus:ring-1 focus:ring-primary rounded px-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Campaigns</span>
          </button>
          <span>/</span>
          <span className="text-foreground font-bold truncate max-w-[200px]">
            {campaign.name}
          </span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2.5">
              <h1 className="text-h2 font-bold text-foreground tracking-tight">
                {campaign.name}
              </h1>
              <span className="px-2.5 py-0.5 text-caption font-bold rounded-full bg-primary-muted text-primary border border-primary/30">
                {campaign.status}
              </span>
            </div>
            <p className="text-small text-foreground-secondary">
              Objective: <span className="text-foreground font-semibold">{campaign.objectiveLabel}</span>
            </p>
          </div>

          <div className="flex items-center space-x-3 font-mono text-caption">
            <div className="bg-surface-1 border border-border-subtle px-3 py-1.5 rounded-lg">
              <span className="text-foreground-tertiary block text-[10px]">Target Leads:</span>
              <span className="text-foreground font-bold">{campaign.targetAudienceCount}</span>
            </div>
            <div className="bg-surface-1 border border-border-subtle px-3 py-1.5 rounded-lg">
              <span className="text-foreground-tertiary block text-[10px]">Est. Value:</span>
              <span className="text-signal-qualified font-bold">{campaign.estimatedPipelineValue}</span>
            </div>
          </div>
        </div>
      </div>

      {/* CADENCE OUTREACH SEQUENCE VISUALIZER */}
      <CampaignCadenceProgress />

      {/* CAMPAIGN TARGET LEAD QUEUE TABLE */}
      <section aria-label="Campaign Target Leads Queue" className="space-y-4">
        <div className="flex items-center justify-between border-b border-border-subtle pb-2.5">
          <div className="flex items-center space-x-2">
            <div className="p-1 rounded bg-primary-muted text-primary border border-primary/30">
              <UserCheck className="w-4 h-4" aria-hidden="true" />
            </div>
            <h2 className="text-caption font-bold text-foreground tracking-tight uppercase font-mono">
              Campaign Target Lead Queue ({campaign.leads.length})
            </h2>
          </div>
          <span className="text-caption text-foreground-tertiary font-mono">
            Lead-by-Lead Telemetry & Outreach Hooks
          </span>
        </div>

        <div className="bg-surface-0 border border-border-default rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-caption">
              <thead>
                <tr className="border-b border-border-subtle bg-surface-1 text-foreground-tertiary font-mono">
                  <th className="py-3 px-4 font-semibold">Lead Company</th>
                  <th className="py-3 px-4 font-semibold">Contact Person</th>
                  <th className="py-3 px-4 font-semibold text-center">Intent</th>
                  <th className="py-3 px-4 font-semibold">Personalized Hook</th>
                  <th className="py-3 px-4 font-semibold text-center">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {campaign.leads.map((lead) => (
                  <tr key={lead.leadId} className="hover:bg-surface-hover transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-foreground">
                      <div className="flex items-center space-x-2">
                        <Building2 className="w-3.5 h-3.5 text-foreground-tertiary" />
                        <span>{lead.companyName}</span>
                      </div>
                      <span className="text-[10px] text-foreground-tertiary font-normal block pl-5">
                        {lead.industry}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-foreground-secondary">
                      <span className="font-semibold text-foreground block">{lead.contactName}</span>
                      <span className="text-[10px] text-foreground-tertiary">{lead.contactRole}</span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-signal-high">
                      {lead.intentScore}
                    </td>
                    <td className="py-3.5 px-4 text-foreground-secondary max-w-[280px]">
                      <p className="line-clamp-2 leading-relaxed text-[11px]">
                        {lead.customOpeningHook}
                      </p>
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          lead.status === 'QUALIFIED'
                            ? 'bg-signal-qualified/10 text-signal-qualified border-signal-qualified/30'
                            : lead.status === 'CONTACTED'
                            ? 'bg-primary-muted text-primary border-primary/30'
                            : 'bg-surface-elevated text-foreground-tertiary border-border-subtle'
                        }`}
                      >
                        {lead.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => navigate('/calls')}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 rounded bg-primary hover:bg-primary-hover text-primary-foreground text-caption font-semibold shadow-xs transition-all focus:outline-none focus:ring-1 focus:ring-primary"
                      >
                        <PhoneCall className="w-3 h-3" />
                        <span>Call</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CampaignDetail;
