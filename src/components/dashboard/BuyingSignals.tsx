import React from 'react';
import { Zap, Briefcase, Cpu, DollarSign, Search, ArrowRight, ExternalLink } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();

  const defaultSignals: BuyingSignalItem[] = [
    {
      id: 'bs-101',
      opportunityId: 'opp-101',
      companyName: 'Razorpay',
      type: 'Hiring Surge',
      description: 'Hiring 5 Outbound SDRs & Head of Sales Ops; legacy dialer contract renewal in 45 days.',
      timestamp: '42m ago',
      impactScore: 95,
    },
    {
      id: 'bs-102',
      opportunityId: 'opp-102',
      companyName: 'Freshworks',
      type: 'Tech Migration',
      description: 'Legacy telephony provider decommissioned; evaluating sub-50ms AI voice calling API.',
      timestamp: '1h ago',
      impactScore: 92,
    },
    {
      id: 'bs-103',
      opportunityId: 'opp-103',
      companyName: 'PharmEasy',
      type: 'Growth Capital',
      description: 'Series-D ₹200 Cr round closed; evaluating compliance-grade outbound AI voice qualification.',
      timestamp: '3h ago',
      impactScore: 91,
    },
    {
      id: 'bs-104',
      opportunityId: 'opp-104',
      companyName: 'Delhivery',
      type: 'Intent Surge',
      description: 'Category comparison surge logged on G2 matrix; multi-touch distribution hub evaluation.',
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
        {items.map((item) => {
          const targetUrl = item.opportunityId ? `/leads/${item.opportunityId}` : '/leads';
          return (
            <div
              key={item.id}
              onClick={() => navigate(targetUrl)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  navigate(targetUrl);
                }
              }}
              className="p-2.5 rounded-lg bg-surface-1/60 hover:bg-surface-1 border border-border-subtle hover:border-border-default transition-all cursor-pointer text-xs space-y-1 group"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="p-1 rounded bg-surface-elevated shrink-0">
                    {getSignalIcon(item.type)}
                  </span>
                  <Link
                    to={targetUrl}
                    onClick={(e) => e.stopPropagation()}
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
          );
        })}
      </div>
    </div>
  );
};
