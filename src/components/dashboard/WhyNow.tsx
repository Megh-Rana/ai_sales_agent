import React from 'react';
import { ExternalLink, Zap, Briefcase, Cpu, DollarSign, Search, CheckCircle2 } from 'lucide-react';
import { BuyingSignal, SignalSource } from '../../types/sales';

export interface WhyNowProps {
  signals: BuyingSignal[];
  source?: SignalSource;
  compact?: boolean;
  className?: string;
}

export const WhyNow: React.FC<WhyNowProps> = ({
  signals,
  source,
  compact = false,
  className = '',
}) => {
  const getSignalIcon = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes('hiring') || t.includes('job') || t.includes('recruiting')) {
      return <Briefcase className="w-3.5 h-3.5 text-info" />;
    }
    if (t.includes('funding') || t.includes('capital') || t.includes('round')) {
      return <DollarSign className="w-3.5 h-3.5 text-signal-qualified" />;
    }
    if (t.includes('tech') || t.includes('crm') || t.includes('telephony') || t.includes('migration')) {
      return <Cpu className="w-3.5 h-3.5 text-signal-high" />;
    }
    if (t.includes('intent') || t.includes('g2') || t.includes('search')) {
      return <Search className="w-3.5 h-3.5 text-signal-high" />;
    }
    return <Zap className="w-3.5 h-3.5 text-primary" />;
  };

  if (compact) {
    const primarySignal = signals[0];
    if (!primarySignal) return <span className="text-caption text-foreground-tertiary">No signals recorded</span>;

    return (
      <div className={`flex items-center gap-2 min-w-0 ${className}`}>
        <span className="p-1 rounded bg-surface-1 shrink-0">
          {getSignalIcon(primarySignal.type)}
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-small font-medium text-foreground truncate">
            {primarySignal.description}
          </div>
          <div className="text-[10px] font-mono text-foreground-tertiary truncate">
            {primarySignal.type} · {primarySignal.timestamp}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-2 p-3 bg-surface-1 rounded-lg border border-border-subtle ${className}`}>
      <div className="flex items-center justify-between gap-2 border-b border-border-subtle/80 pb-1.5">
        <div className="text-[11px] font-mono uppercase font-bold text-signal-high flex items-center gap-1.5">
          <Zap className="w-3 h-3" />
          <span>Why Now? Buying Signal Breakdown</span>
        </div>
        {source?.sourceUrl && (
          <a
            href={source.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-primary hover:text-primary-hover font-medium flex items-center gap-1"
          >
            <span>{source.platform}</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>

      <div className="space-y-1.5 pt-0.5">
        {signals.map((sig) => (
          <div key={sig.id} className="flex items-start gap-2 text-xs">
            <span className="mt-0.5 shrink-0">{getSignalIcon(sig.type)}</span>
            <div className="flex-1 min-w-0">
              <span className="text-foreground-secondary">{sig.description}</span>
              <span className="text-[10px] font-mono text-foreground-tertiary ml-1.5">
                ({sig.timestamp})
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
