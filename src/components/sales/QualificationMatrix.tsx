import React from 'react';
import { CheckCircle2, XCircle, HelpCircle } from 'lucide-react';

export interface QualificationItem {
  key: 'budget' | 'authority' | 'need' | 'timeline';
  label: string;
  status: 'verified' | 'unverified' | 'failed';
  detail: string;
}

export interface QualificationMatrixProps {
  items?: QualificationItem[];
  className?: string;
}

export const QualificationMatrix: React.FC<QualificationMatrixProps> = ({
  items = [
    { key: 'budget', label: 'Budget Qualified', status: 'verified', detail: 'Approved ₹15L–25L ARR allocation for Q4' },
    { key: 'authority', label: 'Decision Authority', status: 'verified', detail: 'Spoke directly with VP of Sales Operations' },
    { key: 'need', label: 'Urgent Pain / Need', status: 'verified', detail: 'Manual outreach failing SLA targets by 40%' },
    { key: 'timeline', label: 'Buying Timeline', status: 'verified', detail: 'Implementation required before Nov 15th' },
  ],
  className = '',
}) => {
  const getStatusIcon = (status: QualificationItem['status']) => {
    switch (status) {
      case 'verified':
        return <CheckCircle2 className="w-4 h-4 text-signal-qualified shrink-0" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-signal-urgent shrink-0" />;
      default:
        return <HelpCircle className="w-4 h-4 text-foreground-tertiary shrink-0" />;
    }
  };

  return (
    <div className={`bg-surface-0 border border-border-default rounded-xl p-4 sm:p-5 ${className}`}>
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-border-subtle">
        <h4 className="text-h4 font-semibold text-foreground">Sales Criteria Qualification Matrix</h4>
        <span className="text-caption font-mono uppercase text-signal-qualified bg-signal-qualified-muted px-2 py-0.5 rounded border border-signal-qualified/30 font-medium">
          4/4 Qualified
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {items.map((item) => (
          <div
            key={item.key}
            className="p-3 bg-surface-1 border border-border-subtle rounded-lg flex items-start gap-2.5"
          >
            <span className="mt-0.5">{getStatusIcon(item.status)}</span>
            <div className="space-y-0.5 min-w-0">
              <div className="text-small font-medium text-foreground">{item.label}</div>
              <div className="text-caption text-foreground-secondary line-clamp-2">{item.detail}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
