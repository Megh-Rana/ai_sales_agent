import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ExtendedFollowUpItem } from '../../data/mockFollowUps';
import {
  PhoneCall,
  CalendarCheck,
  Send,
  Building2,
  Zap,
  ArrowRight,
  Clock,
  CheckCircle2,
  ChevronRight,
  Target,
  User,
} from 'lucide-react';

interface FollowUpCardProps {
  item: ExtendedFollowUpItem;
  isSelected?: boolean;
  onSelect: (item: ExtendedFollowUpItem) => void;
  onComplete: (id: string) => void;
  onReschedule: (item: ExtendedFollowUpItem) => void;
}

export const FollowUpCard: React.FC<FollowUpCardProps> = ({
  item,
  isSelected = false,
  onSelect,
  onComplete,
  onReschedule,
}) => {
  const navigate = useNavigate();

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-signal-high/10 text-signal-high border-signal-high/30';
      case 'MEDIUM':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      default:
        return 'bg-surface-elevated text-foreground-tertiary border-border-subtle';
    }
  };

  const getTimingBadge = (timing: string) => {
    switch (timing) {
      case 'DUE_NOW':
        return { label: 'Due Now', style: 'bg-red-500/10 text-red-400 border-red-500/30' };
      case 'DUE_TODAY':
        return { label: 'Due Today', style: 'bg-amber-500/10 text-amber-400 border-amber-500/30' };
      case 'OVERDUE':
        return { label: 'Overdue', style: 'bg-red-500/20 text-red-400 border-red-500/40' };
      case 'WAITING':
        return { label: 'Waiting for Prospect', style: 'bg-purple-500/10 text-purple-400 border-purple-500/30' };
      default:
        return { label: 'Upcoming', style: 'bg-blue-500/10 text-blue-400 border-blue-500/30' };
    }
  };

  const timingInfo = getTimingBadge(item.timingLabel);

  return (
    <article
      onClick={() => onSelect(item)}
      className={`bg-surface-0 border rounded-xl p-5 shadow-xs transition-all duration-200 cursor-pointer space-y-4 group ${
        isSelected
          ? 'border-primary ring-1 ring-primary bg-primary-muted/20'
          : 'border-border-default hover:border-border-strong'
      }`}
    >
      {/* Top Meta Bar: Priority + Timing + Campaign attribution + Value */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <span
            className={`px-2.5 py-0.5 rounded-full text-caption font-bold border tracking-wide uppercase flex items-center space-x-1 ${getPriorityStyle(
              item.priority
            )}`}
          >
            {item.priority === 'HIGH' && <Zap className="w-3 h-3 fill-current" />}
            <span>{item.priority} Priority</span>
          </span>

          <span
            className={`px-2 py-0.5 rounded text-caption font-mono font-medium border ${timingInfo.style}`}
          >
            {timingInfo.label}
          </span>
        </div>

        {item.dealValue && (
          <span className="text-caption font-mono font-bold text-foreground bg-surface-1 px-2.5 py-0.5 rounded border border-border-subtle">
            {item.dealValue}
          </span>
        )}
      </div>

      {/* WHO: Lead Company & Decision Maker */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center space-x-2">
            <Building2 className="w-4 h-4 text-foreground-tertiary shrink-0" />
            <h3
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/leads/${item.leadId}`);
              }}
              className="text-h4 font-bold text-foreground group-hover:text-primary transition-colors truncate cursor-pointer"
            >
              {item.companyName}
            </h3>
            {item.intentScore && (
              <span className="text-caption font-mono font-bold text-signal-high bg-signal-high/10 px-2 py-0.2 rounded border border-signal-high/30 shrink-0">
                {item.intentScore} INTENT
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2 text-caption text-foreground-secondary pl-6">
            <User className="w-3.5 h-3.5 text-foreground-tertiary shrink-0" />
            <span className="font-semibold text-foreground">{item.contactName}</span>
            <span className="text-foreground-tertiary">·</span>
            <span className="text-foreground-tertiary truncate">{item.contactRole}</span>
          </div>
        </div>

        <ChevronRight className="w-5 h-5 text-foreground-tertiary group-hover:text-foreground group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
      </div>

      {/* Campaign Context Tag if present */}
      {item.campaignName && (
        <div className="flex items-center space-x-1.5 text-caption text-primary font-mono bg-primary-muted/40 px-2.5 py-1 rounded-md border border-primary/20">
          <Target className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Campaign: {item.campaignName}</span>
        </div>
      )}

      {/* WHY NOW: Rationale Banner */}
      <div className="p-3 bg-surface-1 border border-border-subtle rounded-lg space-y-1">
        <div className="text-[10px] font-mono uppercase font-bold text-foreground-tertiary flex items-center space-x-1">
          <Clock className="w-3 h-3 text-amber-400" />
          <span>Why Contact Now?</span>
        </div>
        <p className="text-caption text-foreground leading-snug font-medium">
          {item.reason}
        </p>
      </div>

      {/* WHAT HAPPENED: Previous Interaction */}
      {item.previousInteraction && (
        <div className="text-caption text-foreground-tertiary flex items-center space-x-1.5 pt-0.5">
          <span className="font-semibold text-foreground-secondary">Last Touch:</span>
          <span className="truncate">{item.previousInteraction}</span>
        </div>
      )}

      {/* Actions Row */}
      <div
        className="pt-3 border-t border-border-subtle flex items-center justify-between gap-2"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => onComplete(item.id)}
            className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-surface-1 hover:bg-surface-hover text-foreground-secondary hover:text-foreground border border-border-default text-caption font-semibold transition-colors focus:outline-none focus:ring-1 focus:ring-primary"
            title="Mark Follow-up as Completed"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-signal-qualified" />
            <span>Complete</span>
          </button>

          <button
            type="button"
            onClick={() => onReschedule(item)}
            className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-surface-1 hover:bg-surface-hover text-foreground-tertiary hover:text-foreground border border-border-subtle text-caption font-medium transition-colors"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Reschedule</span>
          </button>
        </div>

        {/* Dominant Call CTA */}
        <button
          type="button"
          onClick={() => navigate(`/calls/call-${item.leadId}?leadId=${item.leadId}`)}
          className="inline-flex items-center space-x-1.5 px-4 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-primary-foreground text-caption font-semibold shadow-xs transition-all focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <PhoneCall className="w-3.5 h-3.5" />
          <span>Call Now</span>
        </button>
      </div>
    </article>
  );
};
