import React from 'react';
import { CheckCircle2, Radar, Sparkles } from 'lucide-react';

interface OpportunityEmptyStateProps {
  type?: 'all' | 'urgent' | 'warming';
  onResetFilters?: () => void;
}

export const OpportunityEmptyState: React.FC<OpportunityEmptyStateProps> = ({
  type = 'all',
  onResetFilters,
}) => {
  let title = "You're all caught up.";
  let description = "No active opportunities match your current filter parameters.";
  let Icon = CheckCircle2;

  if (type === 'urgent') {
    title = "No urgent opportunities right now.";
    description = "All high-priority buying signals and follow-ups have been addressed.";
    Icon = CheckCircle2;
  } else if (type === 'warming') {
    title = "No new opportunities are warming up yet.";
    description = "Signal discovery engine will automatically highlight prospects when intent surges.";
    Icon = Sparkles;
  }

  return (
    <div className="p-12 text-center rounded-xl bg-surface-0 border border-border-default space-y-4 my-6 max-w-lg mx-auto">
      <div className="w-12 h-12 rounded-full bg-surface-1 border border-border-subtle flex items-center justify-center mx-auto text-amber-400">
        <Icon className="w-6 h-6" />
      </div>

      <div className="space-y-1">
        <h3 className="text-h3 font-bold text-foreground">{title}</h3>
        <p className="text-small text-foreground-tertiary">{description}</p>
      </div>

      {onResetFilters && (
        <button
          type="button"
          onClick={onResetFilters}
          className="px-4 py-2 text-xs font-semibold text-foreground bg-surface-1 border border-border-subtle hover:bg-surface-hover rounded-lg transition-colors inline-flex items-center gap-2"
        >
          <Radar className="w-3.5 h-3.5 text-amber-400" />
          <span>Reset Filters</span>
        </button>
      )}
    </div>
  );
};
