import React from 'react';
import { useNavigate } from 'react-router-dom';
import { NextBestActionItem } from '../../types/actions';
import {
  PhoneCall,
  FileText,
  Clock,
  ArrowRight,
  Sparkles,
  Building2,
  UserCheck,
  XCircle,
} from 'lucide-react';

interface NextBestActionCardProps {
  action: NextBestActionItem;
  onExecuteAction?: (action: NextBestActionItem) => void;
  onDismissAction?: (actionId: string) => void;
}

export const NextBestActionCard: React.FC<NextBestActionCardProps> = ({
  action,
  onExecuteAction,
  onDismissAction,
}) => {
  const navigate = useNavigate();

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
        return 'bg-danger/15 text-danger border-danger/40 font-bold';
      case 'HIGH':
        return 'bg-babyPink/15 text-babyPink border-babyPink/40 font-bold';
      case 'MEDIUM':
        return 'bg-skyBlue/15 text-skyBlue border-skyBlue/40 font-semibold';
      default:
        return 'bg-surface-elevated text-foreground-secondary border-border font-medium';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'CALL':
        return <PhoneCall className="w-4 h-4 text-thistle" aria-hidden="true" />;
      case 'PITCH':
        return <FileText className="w-4 h-4 text-thistle" aria-hidden="true" />;
      case 'FOLLOW_UP':
        return <Clock className="w-4 h-4 text-babyPink" aria-hidden="true" />;
      default:
        return <Sparkles className="w-4 h-4 text-icyBlue" aria-hidden="true" />;
    }
  };

  const handlePrimaryClick = () => {
    if (onExecuteAction) {
      onExecuteAction(action);
    }
    if (action.primaryActionTarget) {
      navigate(action.primaryActionTarget);
    }
  };

  const handleSecondaryClick = () => {
    if (action.primaryActionTarget) {
      navigate(action.primaryActionTarget);
    }
  };

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDismissAction) {
      onDismissAction(action.id);
    }
  };

  return (
    <article className="bg-surface border border-thistle/20 hover:border-thistle/50 rounded-xl p-4 md:p-5 shadow-sm transition-all duration-200 flex flex-col justify-between group">
      <div className="space-y-4">
        {/* Header Row: Priority Badge + Category */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${getPriorityStyle(
                action.priority
              )}`}
            >
              {action.priority}
            </span>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-thistle/10 border border-thistle/30 text-xs font-semibold text-thistle">
              {getCategoryIcon(action.category)}
              <span>{action.category}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs flex-wrap">
            <span className="text-foreground font-bold bg-babyPink/10 px-2.5 py-1 rounded-lg border border-babyPink/30 text-babyPink">
              {action.intentScore}/100
            </span>
            <span className="text-foreground font-bold bg-surface-elevated px-2.5 py-1 rounded-lg border border-border">
              {action.estimatedValue}
            </span>
          </div>
        </div>

        {/* Company & Action Title */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-foreground-secondary flex-wrap">
            <Building2 className="w-3.5 h-3.5 text-foreground-tertiary" aria-hidden="true" />
            <span className="font-bold text-foreground">{action.companyName}</span>
            <span className="text-border">•</span>
            <span>{action.industry}</span>
          </div>
          <h3 className="text-base font-bold text-foreground leading-snug group-hover:text-thistle transition-colors">
            {action.title}
          </h3>
          <p className="text-xs text-foreground-secondary leading-relaxed">
            {action.requirementSummary}
          </p>
        </div>

        {/* Contact Info Row */}
        <div className="flex items-center gap-2 text-xs text-foreground-secondary bg-surface-elevated p-3 rounded-lg border border-border/50">
          <UserCheck className="w-3.5 h-3.5 text-thistle" aria-hidden="true" />
          <span className="font-semibold text-foreground">{action.contactName}</span>
          <span className="text-foreground-tertiary">• {action.contactRole}</span>
        </div>

        {/* "WHY NOW?" Signal Rationale Box */}
        <div className="bg-icyBlue/5 border border-icyBlue/25 rounded-lg p-3.5 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="font-bold text-icyBlue flex items-center gap-1.5 uppercase tracking-wider text-xs">
              <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Why Now?</span>
            </span>
            <span className="text-xs font-mono text-danger font-bold">
              {action.whyNow.timeframe}
            </span>
          </div>
          <p className="text-sm font-semibold text-foreground leading-snug">
            {action.whyNow.headline}
          </p>

          <ul className="space-y-1.5 pt-2 border-t border-icyBlue/20">
            {action.whyNow.evidence.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-foreground-secondary">
                <span className="text-success font-bold leading-none mt-0.5">✓</span>
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* CTA Execution Row */}
      <div className="pt-4 border-t border-border/50 flex items-center gap-2">
        <button
          type="button"
          onClick={handlePrimaryClick}
          className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-thistle hover:bg-thistle/90 text-white font-bold text-sm transition-all shadow-sm"
        >
          <span>{action.primaryActionLabel}</span>
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </button>

        {onDismissAction && (
          <button
            type="button"
            onClick={handleDismiss}
            aria-label={`Dismiss action for ${action.companyName}`}
            className="p-3 rounded-xl bg-surface-elevated hover:bg-surface-hover text-foreground-tertiary hover:text-foreground border border-border transition-all"
            title="Dismiss Action"
          >
            <XCircle className="w-4 h-4" aria-hidden="true" />
          </button>
        )}
      </div>
    </article>
  );
};
