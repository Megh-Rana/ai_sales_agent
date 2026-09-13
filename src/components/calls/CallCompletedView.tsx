import React from 'react';
import {
  CheckCircle2,
  Clock,
  Zap,
  TrendingUp,
  FileText,
  ArrowLeft,
  Calendar,
  Check,
  ArrowRight
} from 'lucide-react';
import { CallSession } from '../../types/calls';
import { Button } from '../ui/Button';

export interface CallCompletedViewProps {
  session: CallSession;
  formatDuration: (seconds: number) => string;
  onViewResults: () => void;
  onBackToLead: () => void;
}

export const CallCompletedView: React.FC<CallCompletedViewProps> = ({
  session,
  formatDuration,
  onViewResults,
  onBackToLead
}) => {
  const qualificationItems = Object.values(session.qualification);
  const confirmedCount = qualificationItems.filter((q) => q.status === 'confirmed').length;
  const totalCount = qualificationItems.length;

  return (
    <div
      aria-live="polite"
      className="bg-surface-0 border border-border-default rounded-xl p-6 sm:p-8 max-w-2xl mx-auto shadow-sm space-y-6 animate-in fade-in duration-200"
    >
      {/* Calm Executive Header */}
      <div className="text-center space-y-1.5">
        <div className="w-12 h-12 rounded-xl bg-signal-qualified/10 border border-signal-qualified/25 flex items-center justify-center text-signal-qualified mx-auto shadow-xs">
          <CheckCircle2 className="w-6 h-6" />
        </div>

        <span className="text-[10px] font-mono font-bold tracking-widest text-signal-qualified uppercase">
          Autonomous Call Concluded
        </span>
        <h1 className="text-h2 font-bold text-foreground">
          Conversation Complete
        </h1>
        <p className="text-xs text-foreground-secondary max-w-md mx-auto">
          Spoken dialogue transcribed and sales qualification synthesized for{' '}
          <strong className="text-foreground">{session.companyName}</strong>.
        </p>
      </div>

      {/* Primary Outcome Highlight Card */}
      <div className="p-4 rounded-xl bg-signal-qualified/5 border border-signal-qualified/25 space-y-1.5">
        <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase text-signal-qualified">
          <Calendar className="w-4 h-4" />
          <span>Primary Call Outcome</span>
        </div>
        <p className="text-sm font-bold text-foreground leading-snug">
          {session.primaryOutcome || 'Technical Architecture Walkthrough Demo Scheduled'}
        </p>
        <p className="text-xs text-foreground-secondary">
          Follow-up calendar invite dispatched to {session.contactName} ({session.contactRole}).
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="p-3 rounded-lg bg-surface-elevated border border-border-subtle space-y-1">
          <span className="text-[10px] font-mono uppercase text-foreground-tertiary flex items-center justify-center gap-1">
            <Clock className="w-3 h-3" /> Duration
          </span>
          <p className="text-sm font-bold font-mono text-foreground">
            {formatDuration(session.duration)}
          </p>
        </div>

        <div className="p-3 rounded-lg bg-surface-elevated border border-border-subtle space-y-1">
          <span className="text-[10px] font-mono uppercase text-foreground-tertiary flex items-center justify-center gap-1">
            <TrendingUp className="w-3 h-3" /> Qualification
          </span>
          <p className="text-sm font-bold font-mono text-signal-qualified">
            {confirmedCount}/{totalCount} Confirmed
          </p>
        </div>

        <div className="p-3 rounded-lg bg-surface-elevated border border-border-subtle space-y-1">
          <span className="text-[10px] font-mono uppercase text-foreground-tertiary flex items-center justify-center gap-1">
            <Zap className="w-3 h-3" /> Signals
          </span>
          <p className="text-sm font-bold font-mono text-signal-high">
            {session.intelligenceEvents.length} Detected
          </p>
        </div>
      </div>

      {/* Verified BANT Attributes */}
      <div className="space-y-2">
        <span className="text-[10px] font-mono font-bold uppercase text-foreground-tertiary">
          Verified Qualification Summary
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {qualificationItems.map((dim) => {
            const isConfirmed = dim.status === 'confirmed';
            return (
              <div
                key={dim.dimension}
                className={`p-2.5 rounded-lg border flex items-start gap-2 ${
                  isConfirmed
                    ? 'bg-surface-elevated/70 border-signal-qualified/20 text-foreground'
                    : 'bg-surface-elevated/30 border-border-subtle text-foreground-tertiary'
                }`}
              >
                {isConfirmed ? (
                  <Check className="w-3.5 h-3.5 text-signal-qualified shrink-0 mt-0.5" />
                ) : (
                  <span className="w-3.5 h-3.5 rounded-full border border-border-default shrink-0 mt-0.5 inline-block" />
                )}
                <div className="min-w-0 flex-1">
                  <span className="font-semibold block">{dim.label}</span>
                  {dim.detail && (
                    <span className="text-[11px] text-foreground-secondary line-clamp-1">
                      {dim.detail}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Next Best Action Card */}
      <div className="p-3.5 rounded-xl bg-surface-elevated border border-border-subtle flex items-center justify-between gap-3 text-xs">
        <div className="space-y-0.5">
          <span className="text-[10px] font-mono uppercase text-primary font-bold">
            Next Best Action
          </span>
          <p className="text-foreground font-medium">
            Review technical architecture brief and confirm demo invite with Elena Vance (VP IT).
          </p>
        </div>
        <ArrowRight className="w-4 h-4 text-primary shrink-0" />
      </div>

      {/* Actions */}
      <div className="pt-2 border-t border-border-subtle flex flex-col sm:flex-row items-center justify-between gap-3">
        <Button
          variant="secondary"
          size="md"
          leftIcon={<ArrowLeft className="w-4 h-4" />}
          onClick={onBackToLead}
          className="w-full sm:w-auto text-xs"
        >
          Back to Lead
        </Button>

        <Button
          variant="primary"
          size="lg"
          leftIcon={<FileText className="w-4 h-4" />}
          onClick={onViewResults}
          className="w-full sm:w-auto text-xs font-semibold px-6 shadow-sm"
        >
          View Call Results
        </Button>
      </div>
    </div>
  );
};
