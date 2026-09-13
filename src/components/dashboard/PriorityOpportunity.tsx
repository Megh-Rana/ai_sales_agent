import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronDown, ChevronUp, PhoneCall, Target, ExternalLink, Building2 } from 'lucide-react';
import { Opportunity } from '../../types/sales';
import { SalesStatus } from '../sales/SalesStatus';
import { WhyNow } from './WhyNow';
import { Button } from '../ui/Button';

export interface PriorityOpportunityProps {
  opportunity: Opportunity;
  onCall?: (id: string) => void;
  onCadence?: (id: string) => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

export const PriorityOpportunity: React.FC<PriorityOpportunityProps> = ({
  opportunity,
  onCall,
  onCadence,
  isExpanded = false,
  onToggleExpand,
}) => {
  const navigate = useNavigate();

  const handleRowClick = (e: React.MouseEvent) => {
    // Prevent navigation when clicking interactive buttons
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('a')) {
      return;
    }
    navigate(`/leads/${opportunity.id}`);
  };

  const getScoreBadgeClass = (score: number) => {
    if (score >= 90) return 'bg-signal-high-muted text-signal-high border-signal-high/40';
    if (score >= 80) return 'bg-signal-high-muted text-signal-high border-signal-high/30';
    return 'bg-surface-elevated text-info border-info/30';
  };

  return (
    <div className="border-b border-border-subtle last:border-b-0">
      {/* Desktop / Tablet Row View */}
      <div
        tabIndex={0}
        role="button"
        aria-label={`View account intelligence for ${opportunity.companyName}`}
        onClick={handleRowClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            navigate(`/leads/${opportunity.id}`);
          }
        }}
        className="hidden md:grid md:grid-cols-12 gap-3 p-3.5 sm:px-5 items-center hover:bg-surface-1/70 focus-visible:bg-surface-1 focus-visible:ring-1 focus-visible:ring-primary focus:outline-none transition-colors cursor-pointer group select-none text-xs"
      >
        {/* Col 1: Intent Score & Estimated Value (2 cols) */}
        <div className="col-span-2 flex items-center gap-2.5">
          <span
            className={`px-2.5 py-1 rounded-md font-mono font-bold text-xs border shrink-0 shadow-2xs ${getScoreBadgeClass(
              opportunity.intentScore
            )}`}
          >
            {opportunity.intentScore}
          </span>
          <div className="min-w-0">
            <div className="text-[10px] font-mono uppercase text-foreground-tertiary">
              Intent
            </div>
            <div className="text-[10px] font-mono text-signal-qualified font-semibold truncate">
              {opportunity.estimatedValue}
            </div>
          </div>
        </div>

        {/* Col 2: Account, Status & Stakeholder (4 cols) */}
        <div className="col-span-4 min-w-0 pr-2 space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground truncate group-hover:text-primary transition-colors text-small">
              {opportunity.companyName}
            </span>
            <SalesStatus status={opportunity.salesStatus} />
          </div>
          <div className="text-caption text-foreground-secondary truncate flex items-center gap-1.5">
            <span>{opportunity.contactName} · {opportunity.contactRole}</span>
            <span className="text-foreground-tertiary">({opportunity.industry})</span>
          </div>
        </div>

        {/* Col 3: Why Now / Primary Buying Signal (4 cols) */}
        <div className="col-span-4 min-w-0 pr-2">
          <WhyNow signals={opportunity.buyingSignals} compact />
        </div>

        {/* Col 4: Action & Expand Toggle (2 cols) */}
        <div className="col-span-2 flex items-center justify-end gap-2 shrink-0">
          <Button
            variant="secondary"
            size="sm"
            className="text-[11px] px-2.5 py-1"
            leftIcon={<PhoneCall className="w-3 h-3 text-primary" />}
            onClick={(e) => {
              e.stopPropagation();
              if (onCall) onCall(opportunity.id);
              else navigate('/calls');
            }}
          >
            AI Call
          </Button>

          {onToggleExpand && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpand();
              }}
              className="p-1.5 text-foreground-tertiary hover:text-foreground hover:bg-surface-elevated rounded transition-colors"
              title={isExpanded ? 'Collapse signal breakdown' : 'Expand signal breakdown'}
              aria-label={isExpanded ? 'Collapse signal breakdown' : 'Expand signal breakdown'}
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* Expanded Signal Provenance Breakdown (Desktop) */}
      {isExpanded && (
        <div className="hidden md:block p-3.5 bg-surface-1/40 border-t border-border-subtle/60 pl-14">
          <WhyNow signals={opportunity.buyingSignals} source={opportunity.signalSource} />
        </div>
      )}

      {/* Mobile Card View (< 768px) */}
      <div
        onClick={handleRowClick}
        className="md:hidden p-4 space-y-3 hover:bg-surface-1/60 transition-colors cursor-pointer"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="font-semibold text-foreground text-body truncate">
              {opportunity.companyName}
            </div>
            <div className="text-caption text-foreground-secondary truncate">
              {opportunity.contactName} · {opportunity.contactRole}
            </div>
          </div>
          <span
            className={`px-2 py-0.5 rounded-md font-mono font-bold text-xs border shrink-0 ${getScoreBadgeClass(
              opportunity.intentScore
            )}`}
          >
            {opportunity.intentScore} Intent
          </span>
        </div>

        <div className="bg-surface-1 p-2.5 rounded-lg border border-border-subtle">
          <WhyNow signals={opportunity.buyingSignals} compact />
        </div>

        <div className="flex items-center justify-between gap-2 pt-1">
          <SalesStatus status={opportunity.salesStatus} />
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<PhoneCall className="w-3 h-3 text-primary" />}
              onClick={(e) => {
                e.stopPropagation();
                navigate('/calls');
              }}
            >
              AI Call
            </Button>
            <Button
              variant="ghost"
              size="sm"
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/leads/${opportunity.id}`);
              }}
            >
              View
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
