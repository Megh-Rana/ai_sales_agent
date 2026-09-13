import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SalesCampaign } from '../../types/campaigns';
import {
  Play,
  Pause,
  ArrowRight,
  PhoneCall,
  Users,
  CheckCircle2,
  CalendarCheck,
  Zap,
} from 'lucide-react';

interface CampaignCardProps {
  campaign: SalesCampaign;
  onToggleStatus?: (campaignId: string) => void;
}

export const CampaignCard: React.FC<CampaignCardProps> = ({ campaign, onToggleStatus }) => {
  const navigate = useNavigate();

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'RUNNING':
        return 'bg-primary-muted text-primary border-primary/40';
      case 'READY':
        return 'bg-success-muted text-success border-success/40';
      case 'PAUSED':
        return 'bg-warning-muted text-warning border-warning/40';
      case 'COMPLETED':
        return 'bg-surface-elevated text-foreground-secondary border-border-strong';
      default:
        return 'bg-surface-elevated text-foreground-tertiary border-border';
    }
  };

  const progressPercentage =
    campaign.targetAudienceCount > 0
      ? Math.min(Math.round((campaign.contactedCount / campaign.targetAudienceCount) * 100), 100)
      : 0;

  return (
    <article className="bg-surface border border-border-strong hover:border-primary/50 rounded-xl p-5 md:p-6 shadow-xs transition-all duration-200 flex flex-col justify-between group">
      <div>
        {/* Header Row: Status Badge + Objective Label + Channel */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center space-x-2">
            <span
              className={`px-2.5 py-0.5 rounded-full text-caption font-bold border tracking-wide uppercase flex items-center space-x-1.5 ${getStatusStyle(
                campaign.status
              )}`}
            >
              {campaign.status === 'RUNNING' && (
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" />
              )}
              <span>{campaign.status}</span>
            </span>
            <span className="px-2 py-0.5 rounded bg-surface-1 border border-border-subtle text-caption font-medium text-foreground-secondary">
              {campaign.objectiveLabel}
            </span>
          </div>

          <div className="flex items-center space-x-2 font-mono text-caption">
            <span className="text-foreground font-bold bg-surface-1 px-2 py-0.5 rounded border border-border-subtle">
              {campaign.estimatedPipelineValue}
            </span>
          </div>
        </div>

        {/* Title */}
        <h3
          onClick={() => navigate(`/campaigns/${campaign.id}`)}
          className="text-h4 font-bold text-foreground tracking-tight mb-4 group-hover:text-primary transition-colors cursor-pointer"
        >
          {campaign.name}
        </h3>

        {/* Progress Bar */}
        <div className="space-y-1.5 mb-5">
          <div className="flex items-center justify-between text-caption">
            <span className="text-foreground-tertiary">Cadence Outreach Progress</span>
            <span className="font-mono font-bold text-foreground">
              {campaign.contactedCount} / {campaign.targetAudienceCount} Leads ({progressPercentage}%)
            </span>
          </div>
          <div className="w-full bg-surface-1 h-2.5 rounded-full overflow-hidden p-0.5 border border-border-subtle">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                campaign.status === 'COMPLETED' ? 'bg-purple-500' : 'bg-primary'
              }`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* 4 Metrics Grid */}
        <div className="grid grid-cols-4 gap-2 text-center text-caption font-mono mb-4 bg-surface-1 p-3 rounded-lg border border-border-subtle">
          <div>
            <span className="text-foreground-tertiary block text-[10px] uppercase">Target</span>
            <span className="font-bold text-foreground">{campaign.targetAudienceCount}</span>
          </div>
          <div>
            <span className="text-foreground-tertiary block text-[10px] uppercase">Contacted</span>
            <span className="font-bold text-primary">{campaign.contactedCount}</span>
          </div>
          <div>
            <span className="text-foreground-tertiary block text-[10px] uppercase">Qualified</span>
            <span className="font-bold text-signal-qualified">{campaign.qualifiedCount}</span>
          </div>
          <div>
            <span className="text-foreground-tertiary block text-[10px] uppercase">Meetings</span>
            <span className="font-bold text-purple-400">{campaign.meetingsBookedCount}</span>
          </div>
        </div>
      </div>

      {/* Footer Controls */}
      <div className="pt-3 border-t border-border-subtle flex items-center justify-between gap-3">
        {onToggleStatus && campaign.status !== 'COMPLETED' && (
          <button
            type="button"
            onClick={() => onToggleStatus(campaign.id)}
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-surface-1 hover:bg-surface-hover text-foreground-secondary hover:text-foreground border border-border-default text-caption font-semibold transition-all focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {campaign.status === 'RUNNING' ? (
              <>
                <Pause className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
                <span>Resume</span>
              </>
            )}
          </button>
        )}

        <button
          type="button"
          onClick={() => navigate(`/campaigns/${campaign.id}`)}
          className="flex-1 inline-flex items-center justify-center space-x-2 py-2 px-4 rounded-lg bg-primary hover:bg-primary-hover text-primary-foreground font-semibold text-caption transition-all shadow-xs focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <span>View Cadence Details</span>
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </article>
  );
};
