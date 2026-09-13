import React from 'react';
import { PhoneCall, PhoneOff, Radio, User, Building2, MapPin } from 'lucide-react';
import { Button } from '../ui/Button';
import { CallState } from '../../types/calls';

export interface CallConnectingViewProps {
  status: CallState; // 'CONNECTING' | 'RINGING'
  companyName: string;
  contactName: string;
  contactRole: string;
  contactPhone: string;
  location?: string;
  connectingStageText: string;
  onCancelCall: () => void;
}

export const CallConnectingView: React.FC<CallConnectingViewProps> = ({
  status,
  companyName,
  contactName,
  contactRole,
  contactPhone,
  location,
  connectingStageText,
  onCancelCall
}) => {
  const isRinging = status === 'RINGING';

  return (
    <div
      aria-live="assertive"
      aria-label="Call connection status"
      className="bg-surface-0 border border-border-default rounded-xl p-8 sm:p-10 text-center max-w-lg mx-auto shadow-sm flex flex-col items-center justify-center space-y-6 animate-in fade-in duration-200"
    >
      {/* Calm, realistic telephony connection indicator (Zero AI orb or bouncing ping) */}
      <div className="relative flex items-center justify-center w-20 h-20">
        <span
          className={`absolute inset-0 rounded-full transition-colors duration-500 ${
            isRinging ? 'bg-signal-high/10' : 'bg-primary/10'
          }`}
        />
        <span className="absolute inset-2 rounded-full bg-surface-elevated border border-border-default shadow-xs" />

        <div
          className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center text-white shadow-xs transition-colors duration-500 ${
            isRinging ? 'bg-signal-high' : 'bg-primary'
          }`}
        >
          <PhoneCall className="w-5 h-5" />
        </div>
      </div>

      {/* Primary Status Text */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-center gap-1.5 text-xs font-mono font-bold tracking-wider uppercase text-foreground-secondary">
          <span
            className={`w-2 h-2 rounded-full ${
              isRinging ? 'bg-signal-high animate-pulse' : 'bg-primary animate-pulse'
            }`}
          />
          <span>{isRinging ? 'Ringing Prospect' : 'Connecting Call'}</span>
        </div>

        <h2 className="text-h3 font-bold text-foreground">
          {connectingStageText}
        </h2>

        <p className="text-xs text-foreground-tertiary font-mono">
          {isRinging ? 'Waiting for contact to answer...' : 'Allocating local telephony route...'}
        </p>
      </div>

      {/* Target Prospect Card */}
      <div className="w-full p-4 rounded-xl bg-surface-elevated border border-border-subtle text-left space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-foreground-tertiary" />
            <span className="text-xs font-bold text-foreground">{companyName}</span>
          </div>
          {location && (
            <div className="flex items-center gap-1 text-[11px] text-foreground-tertiary">
              <MapPin className="w-3 h-3" />
              <span>{location}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border-subtle/70 text-xs">
          <div className="flex items-center gap-1.5 text-foreground-secondary">
            <User className="w-3.5 h-3.5 text-foreground-tertiary" />
            <span className="font-medium text-foreground">{contactName}</span>
            <span className="text-foreground-tertiary">({contactRole})</span>
          </div>
          <span className="font-mono text-primary font-semibold">{contactPhone}</span>
        </div>
      </div>

      {/* Direct dial carrier route */}
      <div className="flex items-center gap-3 text-[11px] font-mono text-foreground-tertiary">
        <span className="flex items-center gap-1.5">
          <Radio className="w-3 h-3 text-signal-qualified" />
          <span>Tier-1 Carrier Network</span>
        </span>
        <span>·</span>
        <span>Target Connect: &lt; 10s</span>
      </div>

      {/* Cancel Action */}
      <div className="pt-1">
        <Button
          variant="secondary"
          size="md"
          leftIcon={<PhoneOff className="w-4 h-4 text-signal-urgent" />}
          onClick={onCancelCall}
          className="text-xs font-medium"
        >
          Cancel Call
        </Button>
      </div>
    </div>
  );
};
