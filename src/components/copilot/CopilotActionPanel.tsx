import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PhoneCall, Mail, CalendarCheck, Check, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { SalesConversationContext, CopilotOutcomeType } from '../../types/copilot';
import { toast } from 'sonner';

interface CopilotActionPanelProps {
  context: SalesConversationContext;
  onRecordOutcome?: (leadId: string, outcome: CopilotOutcomeType) => void;
}

export const CopilotActionPanel: React.FC<CopilotActionPanelProps> = ({
  context,
  onRecordOutcome,
}) => {
  const navigate = useNavigate();
  const [selectedOutcome, setSelectedOutcome] = useState<CopilotOutcomeType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setSelectedOutcome(null);
    setIsSubmitting(false);
  }, [context.leadId]);

  const handleOutcomeClick = (outcome: CopilotOutcomeType, label: string) => {
    setSelectedOutcome(outcome);
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      if (onRecordOutcome) {
        onRecordOutcome(context.leadId, outcome);
      }
      toast.success(`Logged conversation outcome: "${label}". Next Best Action updated.`);
    }, 600);
  };

  return (
    <div className="p-5 rounded-xl bg-surface-0 border border-border-default space-y-4">
      <div className="flex items-center justify-between border-b border-border-subtle pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <Sparkles className="w-4 h-4" />
          </div>
          <h2 className="text-h4 font-bold text-foreground tracking-tight">
            6. Next Best Action & Conversation Execution
          </h2>
        </div>
        <span className="text-caption font-mono text-foreground-tertiary">
          1-Click Action Dispatch & Outcome Logging
        </span>
      </div>

      {/* Recommended Action Card */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-surface-1 to-surface-1 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="text-xs font-mono font-bold text-amber-400 uppercase">
            RECOMMENDED ACTION
          </div>
          <div className="text-h4 font-bold text-foreground">
            {context.nextBestAction.label}
          </div>
          <div className="text-caption text-foreground-tertiary">
            Target Lead: {context.contactName} ({context.companyName})
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate(context.nextBestAction.targetRoute)}
          className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-black font-semibold rounded-lg text-small transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <PhoneCall className="w-4 h-4" />
          <span>Dispatch Voice Call</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Record Outcome Loop Buttons */}
      <div className="space-y-2 pt-2">
        <div className="text-xs font-mono font-bold uppercase text-foreground-tertiary">
          Record Post-Conversation Outcome
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            type="button"
            onClick={() => handleOutcomeClick('QUALIFIED_INTERESTED', 'Qualified Interested')}
            disabled={isSubmitting}
            className={`py-2 px-3 text-xs font-medium rounded-lg border transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
              selectedOutcome === 'QUALIFIED_INTERESTED'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-semibold'
                : 'bg-surface-1 text-foreground border-border-subtle hover:bg-surface-hover'
            }`}
          >
            {selectedOutcome === 'QUALIFIED_INTERESTED' && <Check className="w-3.5 h-3.5 text-emerald-400" />}
            <span>Qualified Interested</span>
          </button>

          <button
            type="button"
            onClick={() => handleOutcomeClick('MEETING_BOOKED', 'Meeting Booked')}
            disabled={isSubmitting}
            className={`py-2 px-3 text-xs font-medium rounded-lg border transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
              selectedOutcome === 'MEETING_BOOKED'
                ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 font-semibold'
                : 'bg-surface-1 text-foreground border-border-subtle hover:bg-surface-hover'
            }`}
          >
            {selectedOutcome === 'MEETING_BOOKED' && <Check className="w-3.5 h-3.5 text-indigo-400" />}
            <span>Meeting Booked</span>
          </button>

          <button
            type="button"
            onClick={() => handleOutcomeClick('FOLLOW_UP_SCHEDULED', 'Follow-Up Scheduled')}
            disabled={isSubmitting}
            className={`py-2 px-3 text-xs font-medium rounded-lg border transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
              selectedOutcome === 'FOLLOW_UP_SCHEDULED'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-semibold'
                : 'bg-surface-1 text-foreground border-border-subtle hover:bg-surface-hover'
            }`}
          >
            {selectedOutcome === 'FOLLOW_UP_SCHEDULED' && <Check className="w-3.5 h-3.5 text-amber-400" />}
            <span>Follow-Up Scheduled</span>
          </button>

          <button
            type="button"
            onClick={() => handleOutcomeClick('NOT_INTERESTED', 'Not Interested')}
            disabled={isSubmitting}
            className={`py-2 px-3 text-xs font-medium rounded-lg border transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
              selectedOutcome === 'NOT_INTERESTED'
                ? 'bg-surface-2 text-foreground-tertiary border-border-subtle'
                : 'bg-surface-1 text-foreground-secondary border-border-subtle hover:bg-surface-hover'
            }`}
          >
            {selectedOutcome === 'NOT_INTERESTED' && <Check className="w-3.5 h-3.5" />}
            <span>Not Interested</span>
          </button>
        </div>
      </div>
    </div>
  );
};
