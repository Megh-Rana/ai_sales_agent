import React from 'react';
import { Search, Zap, PhoneCall, Sparkles, CheckCircle2 } from 'lucide-react';
import { ActivityItemData } from '../../types/sales';

export interface ActivityTimelineProps {
  items?: ActivityItemData[];
  className?: string;
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({
  items = [
    { id: '1', timestamp: '10:42 AM', title: 'Opportunity Discovered', description: 'Public requirement posted on hiring portal', category: 'discovery' },
    { id: '2', timestamp: '10:44 AM', title: 'Company Enriched', description: 'Pulled stack telemetry: Salesforce, Outreach.io', category: 'enrichment' },
    { id: '3', timestamp: '10:46 AM', title: 'Buying Signal Detected', description: 'High Intent Score generated: 94 / 100', category: 'signal' },
    { id: '4', timestamp: '10:49 AM', title: 'AI Call Initiated', description: 'Agent connected with VP of Sales Ops', category: 'call' },
    { id: '5', timestamp: '10:53 AM', title: 'Prospect Marked Interested', description: 'Lead Qualified. Demo requested for Thursday', category: 'status' },
  ],
  className = '',
}) => {
  const getCategoryIcon = (cat: ActivityItemData['category']) => {
    switch (cat) {
      case 'discovery':
        return <Search className="w-3.5 h-3.5 text-info" />;
      case 'enrichment':
        return <Sparkles className="w-3.5 h-3.5 text-primary" />;
      case 'signal':
        return <Zap className="w-3.5 h-3.5 text-signal-high" />;
      case 'call':
        return <PhoneCall className="w-3.5 h-3.5 text-primary" />;
      case 'status':
        return <CheckCircle2 className="w-3.5 h-3.5 text-signal-qualified" />;
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {items.map((item, idx) => (
        <div key={item.id} className="relative flex items-start gap-3 pl-2">
          {/* Vertical Timeline Line */}
          {idx < items.length - 1 && (
            <div className="absolute left-[19px] top-6 bottom-0 w-0.5 bg-border-subtle" />
          )}

          {/* Node Icon */}
          <div className="relative z-10 w-7 h-7 rounded-full bg-surface-1 border border-border-default flex items-center justify-center shrink-0">
            {getCategoryIcon(item.category)}
          </div>

          {/* Content */}
          <div className="flex-1 pb-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-foreground">{item.title}</span>
              <span className="font-mono text-foreground-tertiary">{item.timestamp}</span>
            </div>
            <p className="text-caption text-foreground-secondary mt-0.5">{item.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
