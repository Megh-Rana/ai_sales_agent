import React from 'react';
import { LiveSignalEvent } from '../../types/actions';
import { Radio, ExternalLink } from 'lucide-react';

interface LiveSignalFeedCardProps {
  signals: LiveSignalEvent[];
}

export const LiveSignalFeedCard: React.FC<LiveSignalFeedCardProps> = ({ signals }) => {
  return (
    <div className="bg-surface border border-border-strong rounded-xl p-5 md:p-6 shadow-sm flex flex-col justify-between h-full">
      <div>
        {/* Card Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-primary-muted text-primary border border-primary/30">
              <Radio className="w-4 h-4 animate-pulse" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">Live Signal Stream</h2>
              <p className="text-xs text-foreground-secondary">
                Real-time buying signal events & intent triggers
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-medium text-primary bg-primary-muted px-2.5 py-1 rounded-md border border-primary/30 flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
            <span>Live Stream</span>
          </span>
        </div>

        {/* Signal Event Feed */}
        <div className="space-y-3 mb-4">
          {signals.map((sig) => (
            <div
              key={sig.id}
              className="bg-surface-elevated border border-border hover:border-border-strong rounded-lg p-3 transition-all duration-150 space-y-1"
            >
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-foreground">{sig.companyName}</span>
                  <span className="text-[10px] text-foreground-tertiary font-mono">({sig.sourceLabel})</span>
                </div>
                <span className="text-[10px] font-mono text-foreground-tertiary">{sig.timestamp}</span>
              </div>

              <p className="text-xs text-foreground-secondary leading-snug">{sig.signalTitle}</p>

              <div className="flex items-center justify-between pt-1 text-[11px] font-mono">
                <span className="text-warning font-semibold">
                  Impact Score: {sig.impactScore}/100
                </span>
                <span className="text-foreground-tertiary flex items-center space-x-0.5 hover:text-primary transition-colors cursor-pointer">
                  <span>View Signal</span>
                  <ExternalLink className="w-3 h-3" aria-hidden="true" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-3 border-t border-border text-xs text-foreground-tertiary flex items-center justify-between">
        <span>Signal Telemetry Stream Nominal</span>
        <span className="text-primary font-semibold font-mono">4 Events Captured</span>
      </div>
    </div>
  );
};
