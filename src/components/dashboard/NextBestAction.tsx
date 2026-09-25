import React from 'react';
import { ArrowRight, PhoneCall, FileText, Zap, Clock, Building2, User } from 'lucide-react';
import { Button } from '../ui/Button';
import { useNavigate } from 'react-router-dom';
import { NextBestActionData } from '../../data/dashboard';
import { SpotlightCard, AnimatedTooltip, HoverGlowButton } from '../ui/21st';

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
    <SpotlightCard
      spotlightColor="rgba(205, 180, 219, 0.12)"
      className={`border-thistle/30 p-4 sm:p-5 shadow-sm relative overflow-hidden transition-all ${className}`}
    >
      {/* Left accent priority stripe */}
      <div className="absolute top-0 left-0 bottom-0 w-1 bg-thistle" />

      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 pl-3">
        {/* Left Information Stack - Cleaner hierarchy */}
        <div className="space-y-3 max-w-3xl flex-1">
          {/* Priority Meta Tag - Simplified */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-thistle/10 text-primary dark:text-thistle border border-thistle/30">
              <Zap className="w-3.5 h-3.5" />
              PRIORITY 1
            </span>
            <span className="text-xs font-mono text-foreground-tertiary flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {data.signalDiscoveredAt}
            </span>
          </div>

          {/* Target Account & Contact - Better spacing */}
          <div className="space-y-2">
            <button
              onClick={handlePreview}
              className="text-xl font-bold text-foreground hover:text-thistle transition-colors flex items-center gap-2.5 text-left"
            >
              <Building2 className="w-5 h-5 text-thistle shrink-0" />
              <span>{data.companyName}</span>
            </button>
            
            <div className="flex flex-wrap items-center gap-2">
              <AnimatedTooltip score={data.intentScore}>
                <span className="px-2.5 py-1 rounded-lg font-mono font-bold text-xs bg-thistle/15 text-primary dark:text-thistle border border-thistle/40 shrink-0 cursor-pointer">
                  {data.intentScore} Intent
                </span>
              </AnimatedTooltip>
              
              <div className="flex items-center gap-1.5 text-sm text-foreground-secondary">
                <User className="w-3.5 h-3.5 text-foreground-tertiary" />
                <span className="font-semibold text-foreground">{data.contactName}</span>
                <span className="text-foreground-tertiary">• {data.contactRole}</span>
              </div>
              
              <span className="text-xs font-mono text-success font-bold bg-success/10 px-2.5 py-1 rounded-lg border border-success/30">
                {data.estimatedValue}
              </span>
            </div>
          </div>

          {/* Trigger Context ("The Why Now") - Cleaner design */}
          <div className="text-sm text-foreground leading-relaxed bg-icyBlue/5 p-3.5 rounded-xl border border-icyBlue/20 space-y-2">
            <div>
              <span className="font-bold text-icyBlue text-xs uppercase tracking-wide">Why Now: </span>
              <span className="text-foreground-secondary">{data.urgentReason}</span>
            </div>
            {data.suggestedOpeningHook && (
              <div className="pt-2 border-t border-icyBlue/20 text-xs text-foreground-secondary">
                <span className="font-semibold text-thistle">Hook: </span>
                <span className="italic">"{data.suggestedOpeningHook}"</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Dominant Action Group - Better alignment */}
        <div className="flex flex-col items-stretch gap-2.5 shrink-0 min-w-[200px]">
          <Button
            variant="primary"
            size="md"
            className="justify-center shadow-sm font-bold bg-thistle hover:bg-thistle/90 text-white"
            leftIcon={<PhoneCall className="w-4 h-4" />}
            rightIcon={<ArrowRight className="w-4 h-4" />}
            onClick={handleDispatch}
          >
            {data.primaryActionLabel}
          </Button>

          <Button
            variant="secondary"
            size="sm"
            leftIcon={<FileText className="w-3.5 h-3.5" />}
            onClick={handlePreview}
            className="text-xs"
          >
            Review Brief
          </Button>
        </div>
      </div>
    </SpotlightCard>
  );
};
