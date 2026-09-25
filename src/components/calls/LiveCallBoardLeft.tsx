import React from 'react';
import {
  Building2,
  User,
  Mail,
  Phone,
  Briefcase,
  Bot,
  Languages,
  Clock,
  MessageSquare,
  Activity,
  Zap,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { CallSession, CallLanguage } from '../../types/calls';
import { DiscoveredLead } from '../../types/leads';

export interface LiveCallBoardLeftProps {
  session: CallSession;
  lead?: DiscoveredLead | null;
  formatDuration: (seconds: number) => string;
  onLanguageChange?: (lang: CallLanguage) => void;
  className?: string;
}

export const LiveCallBoardLeft: React.FC<LiveCallBoardLeftProps> = ({
  session,
  lead,
  formatDuration,
  onLanguageChange,
  className = ''
}) => {
  // Resolve current lead details directly from active session and resolved lead object
  const contactName = session.contactName || lead?.decisionMakerContact?.name || (lead as any)?.contactName || 'Prospect Contact';
  const contactRole = session.contactRole || lead?.decisionMakerContact?.role || (lead as any)?.contactRole || 'Decision Maker';
  const companyName = session.companyName || lead?.companyName || 'Target Enterprise';
  const contactEmail =
    session.contactEmail ||
    (lead as any)?.decisionMaker?.email ||
    `${contactName.toLowerCase().replace(/[^a-z0-9]/g, '.')}@${companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`;
  const contactPhone = session.contactPhone || (lead as any)?.decisionMaker?.phone || '+91 98765 43210';
  const leadStatus = session.leadStatus || (lead?.status === 'high-intent' ? 'High Intent Discovery' : lead?.status) || 'Open Discovery';
  const agentName = session.agentName || 'Alex';
  const agentCompany = session.agentCompany || 'Bilur AI';

  // Map call lifecycle status to user-friendly badge
  const getCallStatusBadge = () => {
    switch (session.status) {
      case 'LIVE':
        return { label: 'Active', bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 animate-pulse' };
      case 'CONNECTING':
        return { label: 'Connecting', bg: 'bg-sky-500/10 text-sky-400 border-sky-500/30 animate-pulse' };
      case 'RINGING':
        return { label: 'Ringing', bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30 animate-pulse' };
      case 'PAUSED':
        return { label: 'Paused', bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30' };
      case 'COMPLETING':
        return { label: 'Ending...', bg: 'bg-purple-500/10 text-purple-400 border-purple-500/30 animate-pulse' };
      case 'COMPLETED':
        return { label: 'Ended', bg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40' };
      case 'FAILED':
      case 'NO_ANSWER':
        return { label: 'Failed', bg: 'bg-rose-500/10 text-rose-400 border-rose-500/30' };
      default:
        return { label: 'Ready', bg: 'bg-surface-elevated text-foreground-secondary border-border-subtle' };
    }
  };

  const statusBadge = getCallStatusBadge();
  const prospectTurns = session.transcript.filter(t => t.speaker === 'prospect').length;
  const agentTurns = session.transcript.filter(t => t.speaker === 'ai_agent').length;

  return (
    <aside
      aria-label="Live Call Board"
      className={`space-y-4 ${className}`}
    >
      {/* 1. CURRENT LEAD / PROSPECT INFORMATION */}
      <section className="bg-surface-0 border border-border-default rounded-xl p-4 sm:p-5 shadow-xs space-y-3.5">
        <div className="flex items-center justify-between pb-2.5 border-b border-border-subtle">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-primary" />
            <h2 className="text-xs font-mono font-bold tracking-wider text-foreground uppercase">
              Current Lead Profile
            </h2>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 font-semibold">
            {leadStatus}
          </span>
        </div>

        {/* Lead Account & Contact Details */}
        <div className="space-y-2 text-xs">
          <div>
            <span className="text-[10px] font-mono uppercase text-foreground-tertiary block">Target Company</span>
            <span className="text-body font-bold text-foreground block truncate">{companyName}</span>
          </div>

          <div>
            <span className="text-[10px] font-mono uppercase text-foreground-tertiary block">Decision Maker</span>
            <div className="flex items-center gap-1.5 font-medium text-foreground">
              <User className="w-3.5 h-3.5 text-foreground-tertiary shrink-0" />
              <span className="truncate">{contactName}</span>
            </div>
            <span className="text-[11px] text-foreground-secondary ml-5 block truncate">
              {contactRole}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-mono uppercase text-foreground-tertiary block">Email Address</span>
            <div className="flex items-center gap-1.5 text-foreground-secondary font-mono text-[11px] truncate">
              <Mail className="w-3.5 h-3.5 text-foreground-tertiary shrink-0" />
              <span className="truncate">{contactEmail}</span>
            </div>
          </div>

          <div>
            <span className="text-[10px] font-mono uppercase text-foreground-tertiary block">Phone Number</span>
            <div className="flex items-center gap-1.5 text-foreground-secondary font-mono text-[11px]">
              <Phone className="w-3.5 h-3.5 text-foreground-tertiary shrink-0" />
              <span>{contactPhone}</span>
            </div>
          </div>

          {lead?.industry && (
            <div>
              <span className="text-[10px] font-mono uppercase text-foreground-tertiary block">Industry</span>
              <span className="text-foreground-secondary text-[11px]">{lead.industry}</span>
            </div>
          )}

          {lead?.whyNow && (
            <div className="pt-2 border-t border-border-subtle/70">
              <span className="text-[10px] font-mono uppercase text-primary font-bold flex items-center gap-1">
                <Zap className="w-3 h-3 text-primary" />
                Active Trigger / Signal
              </span>
              <p className="text-[11px] text-foreground-secondary leading-relaxed mt-1">
                {lead.whyNow}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* 2. REAL-TIME CALL TELEMETRY & LIVE STATE */}
      <section className="bg-surface-0 border border-border-default rounded-xl p-4 sm:p-5 shadow-xs space-y-3.5">
        <div className="flex items-center justify-between pb-2.5 border-b border-border-subtle">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <h2 className="text-xs font-mono font-bold tracking-wider text-foreground uppercase">
              Call Telemetry
            </h2>
          </div>
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-bold ${statusBadge.bg}`}>
            {statusBadge.label}
          </span>
        </div>

        <div className="space-y-3 text-xs">
          {/* AI Representation */}
          <div className="p-2.5 rounded-lg bg-surface-elevated/70 border border-border-subtle space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase text-foreground-tertiary">AI Sales Agent</span>
              <span className="text-[10px] font-mono text-emerald-400 font-semibold">Autonomous</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-primary/10 border border-primary/30 flex items-center justify-center text-primary shrink-0">
                <Bot className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <span className="font-bold text-foreground block truncate">{agentName}</span>
                <span className="text-[10px] text-foreground-secondary block truncate">
                  Representing <strong className="text-foreground">{agentCompany}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Active Spoken Language (Reactive Selector) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-mono uppercase text-foreground-tertiary flex items-center gap-1">
                <Languages className="w-3.5 h-3.5 text-primary" />
                Response Language
              </span>
              <span className="text-[10px] font-mono text-primary font-bold">Dynamic</span>
            </div>
            <div className="relative">
              <select
                value={session.language}
                onChange={(e) => onLanguageChange?.(e.target.value as CallLanguage)}
                disabled={session.status === 'COMPLETED' || session.status === 'FAILED'}
                className="w-full bg-surface-elevated border border-border-subtle hover:border-primary/50 rounded-lg px-2.5 py-1.5 text-xs text-foreground font-medium outline-hidden transition-colors cursor-pointer disabled:cursor-not-allowed"
                aria-label="Active Response Language"
              >
                <option value="English">English</option>
                <option value="Hindi">Hindi (हिंदी)</option>
                <option value="Gujarati">Gujarati (ગુજરાતી)</option>
                <option value="Marathi">Marathi (मराठी)</option>
              </select>
            </div>
            <p className="text-[10px] text-foreground-tertiary mt-1">
              Mid-call switches update the AI's next spoken response seamlessly.
            </p>
          </div>

          {/* Duration & Spoken Turns Counter */}
          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border-subtle/70">
            <div className="p-2 rounded-lg bg-surface-elevated/40 border border-border-subtle">
              <span className="text-[10px] font-mono uppercase text-foreground-tertiary flex items-center gap-1">
                <Clock className="w-3 h-3 text-primary" />
                Duration
              </span>
              <span className="text-sm font-mono font-bold text-foreground block mt-0.5">
                {formatDuration(session.duration)}
              </span>
            </div>

            <div className="p-2 rounded-lg bg-surface-elevated/40 border border-border-subtle">
              <span className="text-[10px] font-mono uppercase text-foreground-tertiary flex items-center gap-1">
                <MessageSquare className="w-3 h-3 text-primary" />
                Turns
              </span>
              <span className="text-sm font-mono font-bold text-foreground block mt-0.5">
                {session.transcript.length}{' '}
                <span className="text-[10px] font-normal text-foreground-tertiary">
                  ({agentTurns}A / {prospectTurns}P)
                </span>
              </span>
            </div>
          </div>
        </div>
      </section>
    </aside>
  );
};
