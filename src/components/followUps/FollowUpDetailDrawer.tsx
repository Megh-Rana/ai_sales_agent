import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ExtendedFollowUpItem } from '../../data/mockFollowUps';
import {
  X,
  Building2,
  User,
  PhoneCall,
  Zap,
  CheckCircle2,
  Clock,
  Send,
  MessageSquare,
  FileText,
  CalendarCheck,
  Target,
  ExternalLink,
} from 'lucide-react';

interface FollowUpDetailDrawerProps {
  item: ExtendedFollowUpItem | null;
  onClose: () => void;
  onCompleteOutcome: (id: string, outcome: string) => void;
}

export const FollowUpDetailDrawer: React.FC<FollowUpDetailDrawerProps> = ({
  item,
  onClose,
  onCompleteOutcome,
}) => {
  const navigate = useNavigate();
  const [selectedOutcome, setSelectedOutcome] = useState('MEETING_BOOKED');
  const [customNote, setCustomNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!item) return null;

  const handleSaveOutcome = () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    onCompleteOutcome(item.id, selectedOutcome);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-xs animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawer-title"
    >
      <div className="bg-surface-0 border-l border-border-default w-full max-w-xl h-full overflow-y-auto shadow-2xl flex flex-col justify-between p-6 space-y-6">
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-border-subtle pb-4">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center space-x-2">
              <Building2 className="w-5 h-5 text-primary" />
              <h2 id="drawer-title" className="text-h3 font-bold text-foreground truncate">
                {item.companyName}
              </h2>
              <span className="text-caption font-mono font-bold text-signal-high bg-signal-high/10 px-2 py-0.5 rounded border border-signal-high/30">
                {item.intentScore} INTENT
              </span>
            </div>
            <p className="text-caption text-foreground-tertiary">
              Follow-up Intelligence & Execution Drawer
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close drawer"
            className="p-2 rounded-lg text-foreground-tertiary hover:text-foreground hover:bg-surface-hover transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body Content */}
        <div className="space-y-6 flex-1">
          {/* Key Prospect Card */}
          <div className="p-4 bg-surface-1 border border-border-subtle rounded-xl space-y-2">
            <div className="flex items-center justify-between text-caption">
              <span className="font-semibold text-foreground flex items-center space-x-1.5">
                <User className="w-4 h-4 text-foreground-tertiary" />
                <span>{item.contactName}</span>
              </span>
              <span className="text-foreground-tertiary font-mono">{item.contactRole}</span>
            </div>

            <div className="flex items-center justify-between text-caption text-foreground-secondary pt-1 border-t border-border-subtle">
              <span>Industry: <strong>{item.industry}</strong></span>
              <span className="font-mono text-signal-qualified font-bold">{item.dealValue}</span>
            </div>
          </div>

          {/* AI Recommended Action & Suggested Pitch Script */}
          <div className="p-4 bg-primary-muted/30 border border-primary/30 rounded-xl space-y-3">
            <div className="flex items-center space-x-2 text-primary font-bold text-caption uppercase tracking-wider font-mono">
              <Zap className="w-4 h-4 fill-current" />
              <span>AI Next Best Action Recommendation</span>
            </div>
            <h4 className="font-bold text-small text-foreground">{item.title}</h4>
            <p className="text-caption text-foreground-secondary leading-relaxed font-medium">
              {item.reason}
            </p>

            {item.suggestedPitch && (
              <div className="mt-3 p-3 bg-surface-0 border border-border-default rounded-lg space-y-1">
                <span className="text-[10px] font-mono uppercase text-foreground-tertiary font-bold block">
                  Suggested Call Pitch Script:
                </span>
                <p className="text-caption text-foreground italic leading-relaxed">
                  "{item.suggestedPitch}"
                </p>
              </div>
            )}
          </div>

          {/* Unified Sales Activity Timeline */}
          <div className="space-y-3">
            <h3 className="text-caption font-bold text-foreground uppercase tracking-wider font-mono">
              Unified Activity Timeline
            </h3>

            <div className="space-y-3 relative pl-4 border-l-2 border-border-subtle text-caption">
              <div className="relative">
                <div className="w-2.5 h-2.5 rounded-full bg-primary absolute -left-[21px] top-1" />
                <div className="text-foreground font-semibold">AI Voice Agent Call Session</div>
                <div className="text-foreground-tertiary text-[11px]">
                  {item.previousInteraction}
                </div>
              </div>

              {item.campaignName && (
                <div className="relative">
                  <div className="w-2.5 h-2.5 rounded-full bg-purple-500 absolute -left-[21px] top-1" />
                  <div className="text-foreground font-semibold">Outreach Campaign Touchpoint</div>
                  <div className="text-foreground-tertiary text-[11px]">
                    Enrolled in: {item.campaignName}
                  </div>
                </div>
              )}

              <div className="relative">
                <div className="w-2.5 h-2.5 rounded-full bg-signal-high absolute -left-[21px] top-1" />
                <div className="text-foreground font-semibold">Buying Signal Triggered</div>
                <div className="text-foreground-tertiary text-[11px]">
                  Intent score surged to {item.intentScore} (Public Telematics RFP posted).
                </div>
              </div>
            </div>
          </div>

          {/* Outcome Logger Form */}
          <div className="p-4 bg-surface-1 border border-border-default rounded-xl space-y-3">
            <h3 className="text-caption font-bold text-foreground uppercase tracking-wider font-mono">
              Log Follow-Up Outcome
            </h3>

            <div className="grid grid-cols-2 gap-2 text-caption font-semibold">
              {[
                { id: 'MEETING_BOOKED', label: 'Meeting Booked' },
                { id: 'PROPOSAL_SENT', label: 'Proposal Sent' },
                { id: 'RETRY_REQUIRED', label: 'Needs Follow-up' },
                { id: 'NOT_INTERESTED', label: 'Disqualified' },
              ].map((oc) => (
                <button
                  key={oc.id}
                  type="button"
                  onClick={() => setSelectedOutcome(oc.id)}
                  className={`p-2.5 rounded-lg border text-left transition-colors ${
                    selectedOutcome === oc.id
                      ? 'bg-primary-muted border-primary text-foreground'
                      : 'bg-surface-0 border-border-subtle text-foreground-tertiary hover:border-border-default'
                  }`}
                >
                  {oc.label}
                </button>
              ))}
            </div>

            <textarea
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              placeholder="Add optional notes regarding meeting details or deal status..."
              rows={2}
              className="w-full bg-surface-0 border border-border-default rounded-lg p-2.5 text-caption text-foreground focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        {/* Drawer Footer Actions */}
        <div className="pt-4 border-t border-border-subtle flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigate(`/leads/${item.leadId}`)}
            className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-lg bg-surface-1 text-foreground hover:bg-surface-hover border border-border-default text-caption font-semibold transition-colors"
          >
            <span>View Full Lead 360</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={handleSaveOutcome}
            disabled={isSubmitting}
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-caption font-semibold transition-all shadow-xs disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4 text-white" />
            <span className="text-white">{isSubmitting ? 'Saving...' : 'Save & Complete'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
