import React from 'react';
import { ArrowRight, PhoneCall, FileText, Zap, Clock, Building2, User } from 'lucide-react';
import { Button } from '../ui/Button';
import { useNavigate } from 'react-router-dom';
import { NextBestActionData } from '../../data/dashboard';

export interface NextBestActionHeroProps {
  data: NextBestActionData;
  onDispatchCall?: (oppId: string) => void;
  onPreviewBrief?: (oppId: string) => void;
  onSnooze?: (oppId: string) => void;
  className?: string;
}

export const NextBestAction: React.FC<NextBestActionHeroProps> = ({
  data,
  onDispatchCall,
  onPreviewBrief,
  onSnooze,
  className = '',
}) => {
  const navigate = useNavigate();

  const handleDispatch = () => {
    if (onDispatchCall) {
      onDispatchCall(data.opportunityId);
    } else {
      navigate('/calls');
    }
  };

  const handlePreview = () => {
    if (onPreviewBrief) {
      onPreviewBrief(data.opportunityId);
    } else {
      navigate(`/leads/${data.opportunityId}`);
    }
  };

  return (
    <div
      className={`bg-surface-0 border border-signal-high/30 rounded-xl p-5 sm:p-6 shadow-sm relative overflow-hidden transition-all ${className}`}
    >
      {/* Left accent priority stripe */}
      <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-signal-high" />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 pl-2">
        {/* Left Information Stack */}
        <div className="space-y-2.5 max-w-3xl">
          {/* Priority Meta Tag */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-bold uppercase bg-signal-high-muted text-signal-high border border-signal-high/30">
              <Zap className="w-3 h-3" />
              Priority 1 · Next Best Action
            </span>
            <span className="text-caption font-mono text-foreground-tertiary flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Signal detected {data.signalDiscoveredAt} ({data.signalPlatform})
            </span>
          </div>

          {/* Target Account & Contact */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <button
              onClick={handlePreview}
              className="text-h2 font-bold text-foreground hover:text-primary transition-colors flex items-center gap-2 text-left"
            >
              <Building2 className="w-5 h-5 text-primary shrink-0" />
              <span>{data.companyName}</span>
            </button>
            <span className="px-2 py-0.5 rounded-md font-mono font-bold text-xs bg-signal-high-muted text-signal-high border border-signal-high/40 shrink-0">
              {data.intentScore} Intent (+{data.scoreDelta} 24h)
            </span>
            <span className="text-foreground-tertiary">·</span>
            <div className="flex items-center gap-1.5 text-body text-foreground-secondary">
              <User className="w-3.5 h-3.5 text-foreground-tertiary" />
              <span className="font-semibold text-foreground">{data.contactName}</span>
              <span className="text-foreground-tertiary">({data.contactRole})</span>
            </div>
            <span className="text-foreground-tertiary">·</span>
            <span className="text-caption font-mono text-signal-qualified font-semibold bg-signal-qualified-muted px-2 py-0.5 rounded border border-signal-qualified/30">
              {data.estimatedValue}
            </span>
          </div>

          {/* Trigger Context ("The Why Now") */}
          <div className="text-body text-foreground-secondary leading-relaxed bg-surface-1/60 p-3.5 rounded-lg border border-border-subtle space-y-2">
            <div>
              <span className="font-semibold text-foreground">Why Now: </span>
              {data.urgentReason}
            </div>
            {data.suggestedOpeningHook && (
              <div className="pt-2 border-t border-border-subtle/60 text-caption text-foreground-secondary flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="italic">
                  <span className="font-semibold text-primary not-italic">Recommended Hook: </span>
                  "{data.suggestedOpeningHook}"
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Dominant Action Group */}
        <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-2.5 shrink-0 pl-2 lg:pl-0">
          <Button
            variant="primary"
            size="md"
            className="justify-center shadow-md font-semibold"
            leftIcon={<PhoneCall className="w-4 h-4" />}
            rightIcon={<ArrowRight className="w-4 h-4" />}
            onClick={handleDispatch}
          >
            {data.primaryActionLabel}
          </Button>

          <div className="flex items-center justify-between sm:justify-end gap-2 w-full">
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<FileText className="w-3.5 h-3.5" />}
              onClick={handlePreview}
            >
              Review Pitch Brief
            </Button>
            {onSnooze && (
              <button
                type="button"
                onClick={() => onSnooze(data.opportunityId)}
                className="text-[11px] text-foreground-tertiary hover:text-foreground transition-colors px-2 py-1"
              >
                Snooze 2h
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
