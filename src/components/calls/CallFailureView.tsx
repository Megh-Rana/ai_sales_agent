import React from 'react';
import {
  PhoneMissed,
  RotateCcw,
  Calendar,
  ArrowLeft,
  Building2,
  User,
  PhoneOff
} from 'lucide-react';
import { Button } from '../ui/Button';

export interface CallFailureViewProps {
  type: 'FAILED' | 'NO_ANSWER';
  reason?: string;
  companyName: string;
  contactName: string;
  contactPhone: string;
  onRetry: () => void;
  onScheduleFollowUp: () => void;
  onBackToLead: () => void;
}

export const CallFailureView: React.FC<CallFailureViewProps> = ({
  type,
  reason,
  companyName,
  contactName,
  contactPhone,
  onRetry,
  onScheduleFollowUp,
  onBackToLead
}) => {
  const isNoAnswer = type === 'NO_ANSWER';

  return (
    <div
      aria-live="assertive"
      className="bg-surface-0 border border-border-default rounded-xl p-6 sm:p-8 max-w-lg mx-auto shadow-sm space-y-6 text-center animate-in fade-in duration-200"
    >
      {/* Restrained status badge */}
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto border shadow-xs ${
          isNoAnswer
            ? 'bg-surface-elevated border-border-default text-foreground-secondary'
            : 'bg-surface-elevated border-border-default text-foreground-secondary'
        }`}
      >
        {isNoAnswer ? (
          <PhoneMissed className="w-6 h-6 text-amber-400" />
        ) : (
          <PhoneOff className="w-6 h-6 text-foreground-tertiary" />
        )}
      </div>

      {/* Header Copy */}
      <div className="space-y-1.5">
        <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-foreground-tertiary">
          {isNoAnswer ? 'Telephony Outcome · No Answer' : 'Telephony Outcome · Connection Interrupted'}
        </span>
        <h1 className="text-h3 font-bold text-foreground">
          {isNoAnswer ? 'Prospect Did Not Answer' : 'Call Could Not Be Completed'}
        </h1>
        <p className="text-xs text-foreground-secondary max-w-sm mx-auto leading-relaxed">
          {isNoAnswer
            ? `${contactName} was unavailable after multiple rings. The opportunity remains active.`
            : reason || 'Carrier SIP route timed out. The telephony gateway has released the line.'}
        </p>
      </div>

      {/* Contact Summary Box */}
      <div className="p-3.5 rounded-xl bg-surface-elevated border border-border-subtle text-left space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-3.5 h-3.5 text-foreground-tertiary" />
            <span className="font-bold text-foreground">{companyName}</span>
          </div>
          <span className="font-mono text-foreground-secondary">{contactPhone}</span>
        </div>

        <div className="flex items-center gap-1.5 text-foreground-secondary pt-2 border-t border-border-subtle/70">
          <User className="w-3.5 h-3.5 text-foreground-tertiary" />
          <span>{contactName}</span>
        </div>
      </div>

      {/* Recommended Next Step Box */}
      <div className="p-3 rounded-lg bg-surface-elevated/50 border border-border-subtle text-left space-y-1">
        <span className="text-[10px] font-mono uppercase text-foreground-tertiary font-bold">
          Recommended Next Step
        </span>
        <p className="text-xs text-foreground-secondary leading-relaxed">
          {isNoAnswer
            ? 'Schedule an autonomous follow-up touchpoint in 2 hours or dispatch a personalized email hook.'
            : 'Retry dialing the contact or review contact direct-dial routing in Lead Details.'}
        </p>
      </div>

      {/* Pragmatic Sales Action Buttons */}
      <div className="pt-2 border-t border-border-subtle flex flex-col sm:flex-row items-center justify-center gap-2.5">
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
          variant="secondary"
          size="md"
          leftIcon={<Calendar className="w-4 h-4 text-signal-high" />}
          onClick={onScheduleFollowUp}
          className="w-full sm:w-auto text-xs"
        >
          Schedule Follow-up
        </Button>

        <Button
          variant="primary"
          size="md"
          leftIcon={<RotateCcw className="w-4 h-4" />}
          onClick={onRetry}
          className="w-full sm:w-auto text-xs font-semibold px-4"
        >
          Retry Call
        </Button>
      </div>
    </div>
  );
};
