import React from 'react';
import { Zap, Briefcase, Cpu, DollarSign, Search, ArrowRight, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface BuyingSignalItem {
  id: string;
  opportunityId?: string;
  companyName: string;
  type: string;
  description: string;
  timestamp: string;
  impactScore: number;
  sourceUrl?: string;
}

export interface BuyingSignalsProps {
  signals?: BuyingSignalItem[];
  className?: string;
}

export const BuyingSignals: React.FC<BuyingSignalsProps> = ({ signals, className = '' }) => {
  const defaultSignals: BuyingSignalItem[] = [
    {
      id: 'bs-1',
      opportunityId: 'opp-101',
      companyName: 'Acme Technologies',
      type: 'Hiring Surge',
      description: '5 Outbound SDR positions opened in past 48h; Sales Ops lead recruited.',
      timestamp: '42m ago',
      impactScore: 95,
    },
    {
      id: 'bs-2',
      opportunityId: 'opp-102',
      companyName: 'CloudScale Systems',
      type: 'Tech Migration',
      description: 'Legacy telephony provider decommissioned; evaluating AI dialers.',
      timestamp: '1h ago',
      impactScore: 92,
    },
    {
      id: 'bs-3',
      opportunityId: 'opp-103',
      companyName: 'Nexus Health AI',
      type: 'Growth Capital',
      description: 'Series-B funding round (₹24M) announced with commercial GTM focus.',
      timestamp: '3h ago',
      impactScore: 91,
    },
    {
      id: 'bs-4',
      opportunityId: 'opp-104',
      companyName: 'Apex Dynamics',
      type: 'G2 Intent Surge',
      description: 'Category comparison surge logged on Voice AI Cadences matrix.',
      timestamp: '5h ago',
      impactScore: 86,
    },
  ];

  const items = signals || defaultSignals;

  const getSignalIcon = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes('hiring')) return <Briefcase className="w-3.5 h-3.5 text-info" />;
    if (t.includes('capital') || t.includes('funding')) return <DollarSign className="w-3.5 h-3.5 text-signal-qualified" />;
    if (t.includes('tech') || t.includes('migration')) return <Cpu className="w-3.5 h-3.5 text-signal-high" />;
    return <Zap className="w-3.5 h-3.5 text-primary" />;
  };

  return (
    <div className={`bg-surface-0 border border-border-default rounded-xl p-4 sm:p-5 space-y-3.5 shadow-xs ${className}`}>
      <div className="flex items-center justify-between gap-2 border-b border-border-subtle pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-surface-1 text-signal-high border border-border-subtle">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-body font-semibold text-foreground">Live Buying Signals Stream</h4>
            <div className="text-[11px] text-foreground-tertiary">Real-time intent telemetry ingested from 42 feeds</div>
          </div>
        </div>
        <Link
          to="/leads/discover"
          className="text-xs text-primary hover:text-primary-hover font-medium flex items-center gap-1"
        >
          <span>Radar</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="space-y-2.5">
        {items.map((item) => (
          <div
            key={item.id}
            className="p-2.5 rounded-lg bg-surface-1/60 hover:bg-surface-1 border border-border-subtle hover:border-border-default transition-colors text-xs space-y-1 group"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="p-1 rounded bg-surface-elevated shrink-0">
                  {getSignalIcon(item.type)}
                </span>
                <Link
                  to={item.opportunityId ? `/leads/${item.opportunityId}` : '/leads'}
                  className="font-semibold text-foreground group-hover:text-primary transition-colors truncate"
                >
                  {item.companyName}
                </Link>
                <span className="text-[10px] font-mono text-foreground-tertiary shrink-0">
                  · {item.type}
                </span>
              </div>
              <span className="text-[10px] font-mono text-foreground-tertiary shrink-0">
                {item.timestamp}
              </span>
            </div>
            <p className="text-caption text-foreground-secondary leading-relaxed pl-6">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
