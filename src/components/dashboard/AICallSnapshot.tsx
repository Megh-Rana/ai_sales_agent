import React from 'react';
import { PhoneCall, CheckCircle2, Clock, ArrowRight, ShieldCheck, FileText, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AICallSnapshotData } from '../../data/dashboard';
import { Button } from '../ui/Button';

export interface AICallSnapshotProps {
  call: AICallSnapshotData;
  className?: string;
}

export const AICallSnapshot: React.FC<AICallSnapshotProps> = ({ call, className = '' }) => {
  const navigate = useNavigate();

  return (
    <div className={`bg-surface-0 border border-border-default rounded-xl p-4 sm:p-5 space-y-3.5 shadow-xs ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-border-subtle pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-primary-muted text-primary border border-primary/30">
            <PhoneCall className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-body font-semibold text-foreground">Latest AI Voice Agent Call</h4>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-signal-qualified-muted text-signal-qualified border border-signal-qualified/30">
                BANT Qualified
              </span>
            </div>
            <div className="text-[11px] text-foreground-tertiary">Autonomous dialogue completed {call.completedAt}</div>
          </div>
        </div>

        <span className="text-[11px] font-mono text-foreground-tertiary hidden sm:inline-block">
          Duration: {call.duration}
        </span>
      </div>

      {/* Target Account & Contact */}
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-0.5">
          <div className="font-semibold text-foreground text-body">
            {call.companyName}
          </div>
          <div className="text-caption text-foreground-secondary">
            {call.contactName} · {call.contactRole}
          </div>
        </div>

        <div className="text-right shrink-0">
          <div className="text-xs font-mono font-bold text-signal-qualified">
            {call.sentimentScore}% Positive
          </div>
          <div className="text-[10px] text-foreground-tertiary">Sentiment Arc</div>
        </div>
      </div>

      {/* BANT Qualification Grid */}
      <div className="grid grid-cols-4 gap-1.5 p-2 bg-surface-1 rounded-lg border border-border-subtle text-center text-[11px]">
        <div className="space-y-0.5">
          <div className="text-[10px] font-mono uppercase text-foreground-tertiary">Budget</div>
          <div className="font-semibold text-signal-qualified flex items-center justify-center gap-1">
            <CheckCircle2 className="w-3 h-3 shrink-0" />
            <span className="truncate">$40K</span>
          </div>
        </div>
        <div className="space-y-0.5">
          <div className="text-[10px] font-mono uppercase text-foreground-tertiary">Authority</div>
          <div className="font-semibold text-signal-qualified flex items-center justify-center gap-1">
            <CheckCircle2 className="w-3 h-3 shrink-0" />
            <span className="truncate">Decision</span>
          </div>
        </div>
        <div className="space-y-0.5">
          <div className="text-[10px] font-mono uppercase text-foreground-tertiary">Need</div>
          <div className="font-semibold text-signal-qualified flex items-center justify-center gap-1">
            <CheckCircle2 className="w-3 h-3 shrink-0" />
            <span className="truncate">Immediate</span>
          </div>
        </div>
        <div className="space-y-0.5">
          <div className="text-[10px] font-mono uppercase text-foreground-tertiary">Timeline</div>
          <div className="font-semibold text-signal-qualified flex items-center justify-center gap-1">
            <CheckCircle2 className="w-3 h-3 shrink-0" />
            <span className="truncate">Q4</span>
          </div>
        </div>
      </div>

      {/* Takeaway & Objection Breakdown */}
      <div className="space-y-2 text-xs">
        <div className="p-2.5 rounded-lg bg-surface-1/60 border border-border-subtle space-y-1">
          <div className="font-semibold text-foreground">Executive Takeaway:</div>
          <p className="text-caption text-foreground-secondary leading-relaxed">
            {call.keyTakeaway}
          </p>
        </div>

        <div className="flex items-start gap-2 p-2 rounded-lg bg-surface-1/30 text-[11px] text-foreground-tertiary">
          <AlertCircle className="w-3.5 h-3.5 text-signal-high shrink-0 mt-0.5" />
          <span><strong className="text-foreground-secondary">Key Objection:</strong> {call.primaryObjection}</span>
        </div>
      </div>

      {/* Primary Action Button */}
      <Button
        variant="secondary"
        size="sm"
        className="w-full justify-center"
        leftIcon={<FileText className="w-3.5 h-3.5" />}
        rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
        onClick={() => navigate('/calls/call-101/results')}
      >
        Review Audio Transcript & Call Brief
      </Button>
    </div>
  );
};
