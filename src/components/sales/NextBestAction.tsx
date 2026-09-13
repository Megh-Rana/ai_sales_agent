import React from 'react';
import { ArrowRight, Sparkles, PhoneCall, Calendar, Mail, FileText } from 'lucide-react';
import { Button } from '../ui/Button';

export interface NextBestActionProps {
  actionText: string;
  reasonText: string;
  actionType?: 'call' | 'demo' | 'email' | 'brief';
  ctaLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const NextBestAction: React.FC<NextBestActionProps> = ({
  actionText,
  reasonText,
  actionType = 'call',
  ctaLabel,
  onAction,
  className = '',
}) => {
  const getIcon = () => {
    switch (actionType) {
      case 'call':
        return <PhoneCall className="w-4 h-4 text-primary" />;
      case 'demo':
        return <Calendar className="w-4 h-4 text-signal-high" />;
      case 'email':
        return <Mail className="w-4 h-4 text-info" />;
      default:
        return <FileText className="w-4 h-4 text-signal-qualified" />;
    }
  };

  const getDefaultCtaLabel = () => {
    switch (actionType) {
      case 'call':
        return 'Initiate AI Call';
      case 'demo':
        return 'Schedule Demo';
      case 'email':
        return 'Send Follow-up';
      default:
        return 'Review Brief';
    }
  };

  return (
    <div
      className={`bg-surface-0 border border-primary/40 rounded-xl p-4 sm:p-5 shadow-sm relative overflow-hidden ${className}`}
    >
      {/* Accent left border indicator */}
      <div className="absolute top-0 left-0 bottom-0 w-1 bg-primary" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pl-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-primary-muted shrink-0">{getIcon()}</span>
            <span className="text-caption uppercase font-semibold tracking-wider text-primary">
              Next Best Action
            </span>
          </div>

          <h4 className="text-h4 font-semibold text-foreground">{actionText}</h4>

          <p className="text-body text-foreground-secondary">
            <span className="text-foreground-tertiary font-medium">Reason: </span>
            {reasonText}
          </p>
        </div>

        <div className="shrink-0 self-start sm:self-center pt-2 sm:pt-0">
          <Button
            variant="primary"
            size="md"
            rightIcon={<ArrowRight className="w-4 h-4" />}
            onClick={onAction}
          >
            {ctaLabel || getDefaultCtaLabel()}
          </Button>
        </div>
      </div>
    </div>
  );
};
