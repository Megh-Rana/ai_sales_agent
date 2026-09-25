import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Flame,
  Zap,
  CheckCircle2,
  Clock,
  PhoneCall,
  Mail,
  CalendarCheck,
  Building2,
  User,
  ArrowRight,
  ExternalLink,
  Sparkles,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { SalesOpportunity } from '../../types/opportunities';
import { toast } from 'sonner';

interface OpportunityDetailDrawerProps {
  opportunity: SalesOpportunity | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateState: (oppId: string, newState: SalesOpportunity['state']) => void;
}

export const OpportunityDetailDrawer: React.FC<OpportunityDetailDrawerProps> = ({
  opportunity,
  isOpen,
  onClose,
  onUpdateState,
}) => {
  const navigate = useNavigate();
  const [outcome, setOutcome] = useState<string>('');
  const [isSubmittingOutcome, setIsSubmittingOutcome] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    setOutcome('');
    setIsSubmittingOutcome(false);
  }, [opportunity?.id]);

  if (!isOpen || !opportunity) return null;

  const handleRecordOutcome = (selectedOutcome: string) => {
    setOutcome(selectedOutcome);
    setIsSubmittingOutcome(true);
    setTimeout(() => {
      setIsSubmittingOutcome(false);
      onUpdateState(opportunity.id, 'waiting');
      toast.success(`Outcome logged: "${selectedOutcome}". State updated.`);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end transition-opacity">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Opportunity detail for ${opportunity.companyName}`}
        className="w-full max-w-2xl bg-surface-0 border-l border-border-default h-full flex flex-col shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-200"
      >
        {/* Drawer Header */}
        <div className="p-5 border-b border-border-default flex items-center justify-between sticky top-0 bg-surface-0 z-10">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-semibold text-amber-950 dark:text-amber-300 px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/30">
              OPPORTUNITY DETAILS
            </span>
            <span className="text-xs font-mono text-foreground-tertiary">
              ID: {opportunity.id}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-foreground-tertiary hover:text-foreground hover:bg-surface-hover rounded-lg transition-colors"
            aria-label="Close detail pane"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Main Body */}
        <div className="p-6 space-y-6 flex-1">
          {/* SECTION 1: WHO - Lead Profile Context */}
          <div className="p-4 rounded-xl bg-surface-1 border border-border-subtle space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-h3 font-bold text-foreground flex items-center gap-2">
                  <span>{opportunity.companyName}</span>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      navigate(`/leads/${opportunity.leadId}`);
                    }}
                    className="text-foreground-tertiary hover:text-primary transition-colors"
                    title="View Full Lead 360 Profile"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </h2>
                <div className="text-small text-foreground-secondary mt-0.5">
                  {opportunity.industry} • {opportunity.location}
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs font-mono text-foreground-tertiary">INTENT SCORE</div>
                <div className="text-h3 font-mono font-bold text-amber-400">
                  {opportunity.intentScore}
                  <span className="text-xs text-foreground-tertiary">/100</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border-subtle/60 text-small">
              <div>
                <div className="text-caption text-foreground-tertiary">Key Contact</div>
                <div className="font-semibold text-foreground">{opportunity.contactName}</div>
                <div className="text-caption text-foreground-secondary">{opportunity.contactRole}</div>
              </div>

              <div>
                <div className="text-caption text-foreground-tertiary">Annual Contract Value</div>
                <div className="font-mono font-semibold text-amber-400">{opportunity.estimatedValue}</div>
                <div className="text-caption text-foreground-secondary">
                  {opportunity.phoneAvailable ? 'Direct Dial Verified' : 'Email Only'}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: WHY NOW - Trigger & Evidence */}
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-400 uppercase">
                <Zap className="w-4 h-4" />
                <span>WHY NOW — VERIFIED TRIGGER</span>
              </div>
              <span className="text-caption font-mono text-foreground-tertiary">
                {opportunity.whyNow.recencyLabel}
              </span>
            </div>

            <h4 className="text-small font-bold text-foreground leading-snug">
              "{opportunity.whyNow.headline}"
            </h4>

            <div className="space-y-1.5 pt-2">
              <div className="text-caption font-mono text-foreground-tertiary uppercase">Supporting Evidence</div>
              {(opportunity.whyNow.evidence || []).map((ev, i) => (
                <div key={i} className="flex items-start gap-2 text-small text-foreground-secondary">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{ev}</span>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 3: SIGNALS SUMMARY */}
          <div className="space-y-2">
            <h3 className="text-xs font-mono font-bold uppercase text-foreground-tertiary">
              Active Intelligence Signals ({(opportunity.signals || []).length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {(opportunity.signals || []).map((sig) => (
                <div key={sig.id} className="p-3 rounded-lg bg-surface-1 border border-border-subtle flex items-center justify-between">
                  <div>
                    <div className="text-small font-semibold text-foreground">{sig.title}</div>
                    <div className="text-caption text-foreground-tertiary">{sig.category} • {sig.recency}</div>
                  </div>
                  <span className="text-xs font-mono font-semibold text-amber-400">
                    +{sig.impactScore}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 4: TIMELINE */}
          <div className="space-y-2">
            <h3 className="text-xs font-mono font-bold uppercase text-foreground-tertiary">
              Opportunity Activity Timeline
            </h3>
            <div className="p-4 rounded-xl bg-surface-1 border border-border-subtle space-y-3">
              {(opportunity.timeline || []).map((event, idx) => (
                <div key={event.id} className="flex items-start gap-3 relative pb-3 last:pb-0 last:border-0 border-b border-border-subtle/40">
                  <div className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between text-caption text-foreground-tertiary font-mono">
                      <span>{event.title}</span>
                      <span>{event.timestamp}</span>
                    </div>
                    <p className="text-small text-foreground mt-0.5">{event.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 5: RECOMMENDED & NEXT BEST ACTION */}
          <div className="p-4 rounded-xl bg-surface-1 border border-border-subtle space-y-4">
            <div>
              <div className="text-xs font-mono font-bold text-amber-400 uppercase">
                RECOMMENDED SALES ACTION
              </div>
              <div className="text-h4 font-bold text-foreground mt-1">
                {opportunity.recommendedAction.label}
              </div>
              {opportunity.recommendedAction.suggestedOpening && (
                <p className="text-small text-foreground-secondary italic mt-1 bg-surface-2/40 p-2.5 rounded border border-border-subtle">
                  "{opportunity.recommendedAction.suggestedOpening}"
                </p>
              )}
            </div>

            {/* Next Best Action Prediction */}
            {opportunity.nextBestAction && (
              <div className="p-3 rounded-lg bg-surface-2/60 border border-border-subtle space-y-1">
                <div className="flex items-center justify-between text-caption font-mono text-foreground-tertiary">
                  <span className="flex items-center gap-1 text-blue-400">
                    <Sparkles className="w-3.5 h-3.5" />
                    NEXT BEST ACTION PREDICTION
                  </span>
                  <span>{opportunity.nextBestAction.recommendedTiming}</span>
                </div>
                <div className="text-small font-semibold text-foreground">
                  {opportunity.nextBestAction.headline}
                </div>
              </div>
            )}

            {/* ACTION BUTTONS */}
            <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate(`/copilot/${opportunity.leadId}`);
                }}
                className="w-full sm:flex-1 py-2.5 px-4 bg-surface-2 hover:bg-surface-hover text-amber-400 font-semibold rounded-lg text-small border border-amber-500/30 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Prepare Conversation (Copilot)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate(opportunity.recommendedAction.route);
                }}
                className="w-full sm:flex-1 py-2.5 px-4 bg-amber-400 hover:bg-amber-300 text-black font-semibold rounded-lg text-small transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Execute Action</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* SECTION 6: RECORD OUTCOME */}
          <div className="p-4 rounded-xl bg-surface-1 border border-border-subtle space-y-3">
            <h3 className="text-xs font-mono font-bold uppercase text-foreground-tertiary">
              Record Opportunity Action Outcome
            </h3>

            <div className="grid grid-cols-2 gap-2">
              {['Interested', 'Meeting Booked', 'Follow-Up Scheduled', 'Not Interested'].map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => handleRecordOutcome(opt)}
                  disabled={isSubmittingOutcome}
                  className={`py-2 px-3 text-xs font-medium rounded-lg border transition-colors flex items-center justify-center gap-1.5 ${
                    outcome === opt
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-semibold'
                      : 'bg-surface-0 text-foreground border-border-subtle hover:bg-surface-hover'
                  }`}
                >
                  {outcome === opt && <Check className="w-3.5 h-3.5 text-amber-400" />}
                  <span>{opt}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
