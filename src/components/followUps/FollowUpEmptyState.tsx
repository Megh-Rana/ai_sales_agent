import React from 'react';
import { CalendarCheck, Plus } from 'lucide-react';

interface FollowUpEmptyStateProps {
  onOpenScheduleModal: () => void;
}

export const FollowUpEmptyState: React.FC<FollowUpEmptyStateProps> = ({ onOpenScheduleModal }) => {
  return (
    <div className="bg-surface-0 border border-border-default rounded-xl p-8 md:p-12 text-center space-y-4 max-w-lg mx-auto shadow-xs">
      <div className="w-12 h-12 rounded-xl bg-primary-muted text-primary border border-primary/30 flex items-center justify-center mx-auto">
        <CalendarCheck className="w-6 h-6" aria-hidden="true" />
      </div>

      <div className="space-y-1">
        <h3 className="text-h3 font-bold text-foreground">No Follow-ups Due Right Now</h3>
        <p className="text-caption text-foreground-secondary leading-relaxed">
          Your follow-up sales sequence is up to date. New actionable follow-ups will surface automatically as prospects engage with outreach campaigns.
        </p>
      </div>

      <button
        type="button"
        onClick={onOpenScheduleModal}
        className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-primary-foreground text-caption font-semibold transition-all shadow-xs"
      >
        <Plus className="w-4 h-4" />
        <span>Schedule Custom Follow-up</span>
      </button>
    </div>
  );
};
