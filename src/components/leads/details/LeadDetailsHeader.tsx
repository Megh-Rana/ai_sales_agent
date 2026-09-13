import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PhoneCall,
  ArrowLeft,
  Building2,
  MapPin,
  Users,
  ExternalLink,
  Plus,
  Clock,
  RefreshCw,
  Zap
} from 'lucide-react';
import { DiscoveredLead } from '../../../types/leads';
import { Button } from '../../ui/Button';
import { SalesStatus } from '../../sales/SalesStatus';

export interface LeadDetailsHeaderProps {
  lead: DiscoveredLead;
  onInitiateCall: () => void;
  onAddToCampaign: () => void;
  onFollowUp: () => void;
  onEnrich: () => void;
  isEnriching?: boolean;
}

export const LeadDetailsHeader: React.FC<LeadDetailsHeaderProps> = ({
  lead,
  onInitiateCall,
  onAddToCampaign,
  onFollowUp,
  onEnrich,
  isEnriching = false,
}) => {
  const navigate = useNavigate();

  return (
    <header className="space-y-4">
      {/* Back Navigation Bar & Breadcrumb Anchor */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/leads/discover')}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground-secondary hover:text-foreground transition-colors group focus:outline-none focus:ring-1 focus:ring-primary rounded px-1.5 py-0.5"
          aria-label="Back to Lead Discovery"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Lead Discovery</span>
        </button>

        <div className="flex items-center gap-2 text-caption text-foreground-tertiary">
          <Clock className="w-3 h-3 text-foreground-tertiary" />
          <span>Last activity: <strong className="text-foreground-secondary font-medium">{lead.lastActivity || '24m ago'}</strong></span>
          <span>·</span>
          <span className="font-mono text-[11px] text-foreground-tertiary">ID: {lead.id}</span>
        </div>
      </div>

      {/* Main Header Container */}
      <div className="p-4 sm:p-5 bg-surface-0 border border-border-default rounded-xl shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Left Cluster: Avatar, Title, Metadata */}
          <div className="flex items-start gap-3.5 min-w-0">
            {/* Company Avatar Badge */}
            <div className="w-12 h-12 rounded-xl bg-surface-elevated border border-border-default flex items-center justify-center shrink-0 shadow-inner">
              <span className="text-h3 font-bold text-primary font-mono">
                {lead.companyName.slice(0, 2).toUpperCase()}
              </span>
            </div>

            <div className="space-y-1.5 min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-h2 font-bold text-foreground truncate tracking-tight">
                  {lead.companyName}
                </h1>

                {/* Intent Score Pill */}
                <div
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-mono font-bold border ${
                    lead.intentScore >= 80
                      ? 'bg-signal-high/10 text-signal-high border-signal-high/30'
                      : lead.intentScore >= 50
                      ? 'bg-info/10 text-info border-info/30'
                      : 'bg-surface-elevated text-foreground-tertiary border-border-subtle'
                  }`}
                  title={`Intent Score: ${lead.intentScore}/100`}
                >
                  <Zap className="w-3 h-3 fill-current" />
                  <span>{lead.intentScore} INTENT</span>
                </div>

                <SalesStatus status={lead.status} />

                {lead.estimatedValue && (
                  <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-surface-elevated text-signal-qualified border border-border-subtle">
                    {lead.estimatedValue}
                  </span>
                )}
              </div>

              {/* Metadata row */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-foreground-secondary">
                <span className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-foreground-tertiary" />
                  <span>{lead.industry}</span>
                </span>
                <span className="text-foreground-tertiary">·</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-foreground-tertiary" />
                  <span>{lead.location}</span>
                </span>
                <span className="text-foreground-tertiary">·</span>
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-foreground-tertiary" />
                  <span>{lead.employeeCount} employees</span>
                </span>
                {lead.companyDomain && (
                  <>
                    <span className="text-foreground-tertiary">·</span>
                    <a
                      href={`https://${lead.companyDomain}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-primary hover:text-primary-hover font-medium transition-colors"
                      title={`Visit ${lead.companyDomain}`}
                    >
                      <span>{lead.companyDomain}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right Cluster: Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-border-subtle shrink-0">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={onAddToCampaign}
              className="text-xs"
            >
              Add to Campaign
            </Button>

            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Clock className="w-3.5 h-3.5" />}
              onClick={onFollowUp}
              className="text-xs"
            >
              Follow Up
            </Button>

            <Button
              variant="ghost"
              size="sm"
              leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isEnriching ? 'animate-spin text-primary' : ''}`} />}
              onClick={onEnrich}
              className="text-xs"
              title="Refresh Account Telemetry & Signals"
            >
              {isEnriching ? 'Enriching...' : 'Enrich'}
            </Button>

            {/* Dominant Primary Action: Call Now */}
            <Button
              variant="primary"
              size="md"
              leftIcon={<PhoneCall className="w-4 h-4" />}
              onClick={onInitiateCall}
              className="text-xs font-semibold px-4 shadow-sm"
              title="Initiate Immediate Outbound AI Call"
            >
              Call Now
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
