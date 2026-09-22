import React from 'react';
import {
  PhoneCall,
  ArrowRight,
  ExternalLink,
  Clock,
  Building2,
  MapPin,
  Users,
  UserCheck,
  Phone,
  MessageSquareQuote,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DiscoveredLead } from '../../types/leads';
import { Button } from '../ui/Button';
import { IntentScore } from '../sales/IntentScore';
import { SignalSourceBadge } from '../sales/SignalSourceBadge';

export interface PriorityOpportunityCardProps {
  lead: DiscoveredLead;
  onCall?: (leadId: string) => void;
  onAddToPipeline?: (lead: DiscoveredLead) => void;
  className?: string;
}

export const PriorityOpportunityCard: React.FC<PriorityOpportunityCardProps> = ({
  lead,
  onCall,
  onAddToPipeline,
  className = '',
}) => {
  const navigate = useNavigate();

  const handleCall = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onCall) {
      onCall(lead.id);
    } else {
      navigate('/calls');
    }
  };

  const handleView = () => {
    navigate(`/leads/${lead.id}`);
  };

  const primarySignal = lead.buyingSignals[0];

  return (
    <div
      onClick={handleView}
      tabIndex={0}
      role="article"
      aria-label={`Priority Opportunity: ${lead.companyName}, Intent Score ${lead.intentScore}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter') handleView();
      }}
      className={`p-4 sm:p-5 bg-surface border border-signal-high/30 hover:border-signal-high/70 rounded-xl space-y-3.5 transition-colors duration-150 relative group shadow-xs cursor-pointer select-none focus:outline-none focus:ring-1 focus:ring-primary min-w-0 h-auto flex flex-col justify-between ${className}`}
    >
      {/* Top Priority Accent Strip */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-signal-high" />

      <div className="space-y-3.5 min-w-0 flex-1">
        {/* Row 1: Company Header, Meta, Value & Intent Score */}
        <div className="flex items-start justify-between gap-3 pt-0.5 min-w-0">
          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors truncate max-w-[220px] sm:max-w-none">
                {lead.companyName}
              </h3>
              {lead.estimatedValue && (
                <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-surface-subtle text-signal-qualified border border-border-subtle shrink-0">
                  {lead.estimatedValue}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-foreground-tertiary">
              <span className="flex items-center gap-1 shrink-0">
                <Building2 className="w-3 h-3 text-foreground-tertiary" />
                <span>{lead.industry}</span>
              </span>
              <span className="shrink-0">·</span>
              <span className="flex items-center gap-1 shrink-0">
                <MapPin className="w-3 h-3 text-foreground-tertiary" />
                <span>{lead.location}</span>
              </span>
              {lead.employeeCount && (
                <>
                  <span className="shrink-0">·</span>
                  <span className="flex items-center gap-1 shrink-0">
                    <Users className="w-3 h-3 text-foreground-tertiary" />
                    <span>{lead.employeeCount}</span>
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Intent Score Badge */}
          <div className="shrink-0">
            <IntentScore
              score={lead.intentScore}
              level={lead.intentLevel}
              expandable={false}
              className="text-xs py-1 px-2.5"
            />
          </div>
        </div>

        {/* Row 2: Active Commercial Requirement */}
        <div className="p-2.5 bg-surface-subtle rounded-lg border border-border-subtle text-xs space-y-1.5 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="text-[10px] font-mono uppercase tracking-wider text-primary font-semibold flex items-center gap-1">
              <span>Active Commercial Need</span>
            </div>
            {lead.is_inferred_from_hiring || lead.signal_type === 'inferred_hiring_signal' || lead.source?.platform?.toLowerCase().includes('job') || lead.source?.platform?.toLowerCase().includes('hiring') ? (
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/15 text-purple-400 border border-purple-500/30 shrink-0"
                title={lead.inferred_need_basis || "Business need inferred from active job recruitment"}
              >
                <Sparkles className="w-3 h-3 text-purple-400" />
                <span>Inferred from Hiring Signal</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shrink-0">
                <span>Direct Requirement</span>
              </span>
            )}
          </div>
          <p className="text-foreground-secondary leading-relaxed text-xs font-medium line-clamp-2 break-words">
            "{lead.requirement}"
          </p>
        </div>

        {/* Row 3: WHO to Contact (Key Decision Maker) */}
        {lead.decisionMakerContact && (
          <div className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-lg bg-surface-subtle border border-border-subtle text-xs min-w-0">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div className="w-6 h-6 rounded-full bg-surface flex items-center justify-center text-[10px] font-bold text-foreground border border-border shrink-0">
                <UserCheck className="w-3.5 h-3.5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5 min-w-0">
                  <span className="font-semibold text-foreground text-xs truncate">
                    {lead.decisionMakerContact.name}
                  </span>
                  <span className="text-[10px] text-foreground-tertiary truncate">
                    ({lead.decisionMakerContact.role})
                  </span>
                </div>
              </div>
            </div>
            {lead.decisionMakerContact.phoneAvailable && (
              <span className="inline-flex items-center gap-1 text-[10px] text-signal-qualified font-mono shrink-0 bg-signal-qualified-muted px-1.5 py-0.5 rounded border border-signal-qualified/30">
                <Phone className="w-2.5 h-2.5" />
                Direct Line
              </span>
            )}
          </div>
        )}

        {/* Row 4: WHY NOW (Urgency Reason) & Top Signal Trigger */}
        <div className="space-y-1.5 text-xs min-w-0">
          <div className="flex items-start gap-1.5 text-[11px] bg-signal-high-muted/50 p-2 rounded border border-signal-high/20 min-w-0">
            <Clock className="w-3.5 h-3.5 text-signal-high shrink-0 mt-0.5" />
            <div className="leading-snug min-w-0 flex-1">
              <span className="font-bold text-signal-high font-mono uppercase text-[10px] mr-1">Why Now:</span>
              <span className="text-foreground-secondary break-words">{lead.whyNow}</span>
            </div>
          </div>

          {primarySignal && (
            <div className="flex items-center justify-between gap-2 text-[11px] text-foreground-tertiary pt-0.5 px-0.5 min-w-0">
              <span className="flex items-center gap-1 text-foreground-secondary truncate font-medium min-w-0 flex-1">
                <TrendingUp className="w-3 h-3 text-signal-qualified shrink-0" />
                <span className="truncate">{primarySignal.type}: {primarySignal.description}</span>
              </span>
              <span className="font-mono text-[10px] text-primary shrink-0">
                +{primarySignal.impactScore}%
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Row 5: Source Ingestion Provenance & Actions Footer */}
      <div className="pt-3 mt-3 border-t border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 min-w-0 w-full">
        <div className="flex items-center gap-2 min-w-0 max-w-full">
          <SignalSourceBadge
            source={lead.source}
            companyName={lead.companyName}
            companyDomain={lead.companyDomain}
            requirement={lead.requirement}
          />
        </div>

        <div className="flex items-center gap-2 justify-end shrink-0 w-full sm:w-auto">
          <Button
            variant="secondary"
            size="sm"
            className="text-xs h-8 px-3 font-medium border border-border hover:bg-surface-hover shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              onAddToPipeline?.(lead);
            }}
          >
            Queue
          </Button>

          <Button
            variant="primary"
            size="sm"
            className="text-xs h-8 px-3.5 font-medium bg-primary text-primary-foreground hover:bg-primary-hover shrink-0"
            onClick={handleCall}
            leftIcon={<PhoneCall className="w-3.5 h-3.5 text-primary-foreground" />}
          >
            AI Call
          </Button>
        </div>
      </div>
    </div>
  );
};
