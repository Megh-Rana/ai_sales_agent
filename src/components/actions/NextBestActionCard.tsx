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
        return 'bg-danger-muted text-danger border-danger/40';
      case 'HIGH':
        return 'bg-warning-muted text-warning border-warning/40';
      case 'MEDIUM':
        return 'bg-primary-muted text-primary border-primary/40';
      default:
        return 'bg-surface-elevated text-foreground-secondary border-border';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'CALL':
        return <PhoneCall className="w-4 h-4 text-primary" aria-hidden="true" />;
      case 'PITCH':
        return <FileText className="w-4 h-4 text-primary" aria-hidden="true" />;
      case 'FOLLOW_UP':
        return <Clock className="w-4 h-4 text-warning" aria-hidden="true" />;
      default:
        return <Sparkles className="w-4 h-4 text-success" aria-hidden="true" />;
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
    <article className="bg-surface border border-border-strong hover:border-primary/50 rounded-xl p-5 md:p-6 shadow-sm transition-all duration-200 flex flex-col justify-between group">
      <div>
        {/* Header Row: Priority Badge + Category + Intent Score + Value */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center space-x-2">
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold border tracking-wide uppercase ${getPriorityStyle(
                action.priority
              )}`}
            >
              {action.priority} PRIORITY
            </span>
            <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded bg-surface-elevated border border-border text-xs font-medium text-foreground-secondary">
              {getCategoryIcon(action.category)}
              <span>{action.category}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2 font-mono text-xs">
            <span className="text-warning font-bold bg-warning-muted px-2 py-0.5 rounded border border-warning/30">
              Intent: {action.intentScore}/100
            </span>
            <span className="text-foreground font-bold bg-surface-elevated px-2 py-0.5 rounded border border-border">
              {action.estimatedValue}
            </span>
          </div>
        </div>

        {/* Company & Action Title */}
        <div className="space-y-1 mb-3">
          <div className="flex items-center space-x-2 text-xs text-foreground-secondary">
            <Building2 className="w-3.5 h-3.5 text-foreground-tertiary" aria-hidden="true" />
            <span className="font-semibold text-foreground">{action.companyName}</span>
            <span>•</span>
            <span>{action.industry}</span>
          </div>
          <h3 className="text-base font-bold text-foreground tracking-tight group-hover:text-primary transition-colors">
            {action.title}
          </h3>
          <p className="text-xs text-foreground-secondary leading-relaxed">
            {action.requirementSummary}
          </p>
        </div>

        {/* Contact Info Row */}
        <div className="flex items-center space-x-2 text-xs text-foreground-secondary mb-4 bg-surface-elevated p-2 rounded-lg border border-border">
          <UserCheck className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
          <span className="font-medium text-foreground">{action.contactName}</span>
          <span>({action.contactRole})</span>
        </div>

        {/* "WHY NOW?" Signal Rationale Box */}
        <div className="bg-surface-elevated border border-border rounded-lg p-3.5 mb-5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-warning flex items-center space-x-1 uppercase tracking-wider text-[10px]">
              <Sparkles className="w-3 h-3 text-warning" aria-hidden="true" />
              <span>Why Now?</span>
            </span>
            <span className="text-[11px] font-mono text-danger font-semibold">
              {action.whyNow.timeframe}
            </span>
          </div>
          <p className="text-xs font-semibold text-foreground">
            {action.whyNow.headline}
          </p>

          <ul className="space-y-1 pt-1 border-t border-border">
            {action.whyNow.evidence.map((item, idx) => (
              <li key={idx} className="flex items-start space-x-1.5 text-[11px] text-foreground-secondary">
                <span className="text-success font-bold text-xs leading-none">✓</span>
                <span className="leading-snug">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* CTA Execution Row */}
      <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={handlePrimaryClick}
          className="flex-1 inline-flex items-center justify-center space-x-2 py-2.5 px-4 rounded-lg bg-primary hover:bg-primary-hover text-primary-foreground font-semibold text-xs transition-all shadow-sm"
        >
          <span>{action.primaryActionLabel}</span>
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </button>

        {action.secondaryActionLabel && (
          <button
            type="button"
            onClick={handleSecondaryClick}
            className="px-3 py-2.5 rounded-lg bg-surface-elevated hover:bg-surface-hover text-foreground-secondary hover:text-foreground border border-border text-xs font-semibold transition-all hidden sm:inline-flex"
          >
            {action.secondaryActionLabel}
          </button>
        )}

        {onDismissAction && (
          <button
            type="button"
            onClick={handleDismiss}
            aria-label={`Dismiss action for ${action.companyName}`}
            className="p-2.5 rounded-lg bg-surface-elevated hover:bg-surface-hover text-foreground-tertiary hover:text-foreground border border-border transition-all"
            title="Dismiss Action"
          >
            <XCircle className="w-4 h-4" aria-hidden="true" />
          </button>
        )}
      </div>
    </article>
  );
};
