import React from 'react';
import {
  PhoneCall,
  PhoneForwarded,
  MicOff,
  UserCheck,
  Languages,
  ShieldCheck,
  Building2,
  ExternalLink
} from 'lucide-react';
import { CallSession } from '../../types/calls';
import { AIStatus } from '../ai/AIStatus';
import { AIState } from '../../types/sales';

export interface CallHeaderProps {
  session: CallSession;
  formatDuration: (seconds: number) => string;
  onOpenTakeoverModal?: () => void;
}

export const CallHeader: React.FC<CallHeaderProps> = ({
  session,
  formatDuration,
}) => {
  // Map CallState & AudioStatus to standard AIStatus AIState
  const getAIStateMapping = (): { state: AIState; customText: string } => {
    if (session.status === 'PAUSED') {
      return { state: 'idle', customText: 'Call Paused' };
    }
    if (session.status === 'CONNECTING') {
      return { state: 'calling', customText: 'Connecting to Contact...' };
    }
    if (session.status === 'RINGING') {
      return { state: 'calling', customText: 'Ringing Prospect Device...' };
    }
    if (session.status === 'COMPLETING') {
      return { state: 'thinking', customText: 'Synthesizing Call Telemetry...' };
    }
    if (session.status === 'COMPLETED') {
      return { state: 'completed', customText: 'Conversation Complete' };
    }
    if (session.status === 'FAILED' || session.status === 'NO_ANSWER') {
      return { state: 'error', customText: session.status === 'NO_ANSWER' ? 'No Answer' : 'Connection Failed' };
    }

    // Live conversation sub-states
    switch (session.audioStatus) {
      case 'ai_speaking':
        return { state: 'responding', customText: 'AI Agent Speaking' };
      case 'prospect_speaking':
        return { state: 'listening', customText: 'Prospect Speaking' };
      case 'listening':
        return { state: 'listening', customText: 'Listening to Prospect...' };
      case 'processing':
        return { state: 'thinking', customText: 'Formulating Response...' };
      default:
        return { state: 'idle', customText: 'Active Line' };
    }
  };

  const aiStatusInfo = getAIStateMapping();

  return (
    <header className="bg-surface-0 border border-border-default rounded-xl p-4 sm:p-5 shadow-xs transition-all">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Company & Contact Identification */}
        <div className="flex items-start gap-3.5 min-w-0">
          <div className="w-11 h-11 rounded-xl bg-surface-elevated border border-border-default flex items-center justify-center shrink-0 font-mono text-h3 font-bold text-primary shadow-inner">
            {session.companyName.slice(0, 2).toUpperCase()}
          </div>

          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-h3 font-bold text-foreground truncate tracking-tight">
                {session.companyName}
              </h1>

              {session.companyDomain && (
                <a
                  href={`https://${session.companyDomain}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:inline-flex items-center gap-1 text-xs text-foreground-tertiary hover:text-primary transition-colors"
                  title={`Visit ${session.companyDomain}`}
                >
                  <span>{session.companyDomain}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}

              {/* Status Badge */}
              <AIStatus state={aiStatusInfo.state} customText={aiStatusInfo.customText} />
            </div>

            {/* Contact Details Row */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-foreground-secondary">
              <span className="font-medium text-foreground">{session.contactName}</span>
              <span className="text-foreground-tertiary">·</span>
              <span>{session.contactRole}</span>
              <span className="text-foreground-tertiary">·</span>
              <span className="font-mono text-foreground-tertiary">{session.contactPhone}</span>
            </div>
          </div>
        </div>

        {/* Right: Telephony Status, Live Timer, Language & Takeover Flags */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-border-subtle">
          {/* Muted Flag */}
          {session.isMuted && (
            <div
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-signal-urgent/10 border border-signal-urgent/30 text-signal-urgent text-xs font-semibold animate-pulse"
              role="status"
              aria-label="Microphone Muted"
            >
              <MicOff className="w-3.5 h-3.5" />
              <span>MUTED</span>
            </div>
          )}

          {/* Human Takeover Flag */}
          {session.isHumanTakeover && (
            <div
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-signal-high/15 border border-signal-high/35 text-signal-high text-xs font-semibold"
              role="status"
              aria-label="Human Sales Rep in Control"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>HUMAN REP TAKEOVER</span>
            </div>
          )}

          {/* Language Indicator */}
          <div
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface-elevated border border-border-subtle text-xs text-foreground-secondary font-medium"
            title={`Conversation Language: ${session.language}`}
          >
            <Languages className="w-3.5 h-3.5 text-foreground-tertiary" />
            <span>{session.language}</span>
          </div>

          {/* Call Duration Counter */}
          <div
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border font-mono text-sm font-bold tracking-wider ${
              session.status === 'LIVE'
                ? 'bg-primary/10 border-primary/30 text-primary-hover shadow-xs'
                : session.status === 'PAUSED'
                ? 'bg-signal-high/10 border-signal-high/30 text-signal-high'
                : 'bg-surface-elevated border-border-subtle text-foreground-tertiary'
            }`}
            aria-label={`Call duration: ${formatDuration(session.duration)}`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                session.status === 'LIVE'
                  ? 'bg-emerald-400 animate-pulse'
                  : session.status === 'PAUSED'
                  ? 'bg-amber-400'
                  : 'bg-slate-500'
              }`}
            />
            <span>{formatDuration(session.duration)}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
