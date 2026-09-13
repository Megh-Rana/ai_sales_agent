import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PhoneCall, Sparkles, Clock, CheckCircle2, ArrowRight } from 'lucide-react';
import { ActiveConversationItem } from '../../types/commandCenter';

interface ActiveConversationsCardProps {
  conversations: ActiveConversationItem[];
}

export const ActiveConversationsCard: React.FC<ActiveConversationsCardProps> = ({ conversations }) => {
  const navigate = useNavigate();

  return (
    <div className="p-5 rounded-xl bg-surface-0 border border-border-default space-y-4">
      <div className="flex items-center justify-between border-b border-border-subtle pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30">
            <PhoneCall className="w-4 h-4" />
          </div>
          <h3 className="text-h4 font-bold text-foreground tracking-tight">
            Active Conversation Preparation & Voice Workbench
          </h3>
        </div>
        <span className="text-caption font-mono text-foreground-tertiary">
          Real-time AI Calling Telemetry
        </span>
      </div>

      <div className="space-y-3">
        {(conversations || []).map((conv) => (
          <div
            key={conv.id}
            className="p-4 rounded-xl bg-surface-1 border border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/30">
                  {conv.status}
                </span>
                <span className="text-caption font-mono text-amber-400 font-semibold">
                  Intent Score: {conv.intentScore}/100
                </span>
              </div>

              <div className="text-small font-bold text-foreground">
                {conv.companyName} — <span className="font-normal text-foreground-secondary">{conv.contactName} ({conv.contactRole})</span>
              </div>

              <p className="text-small text-foreground-secondary italic">
                "{conv.lastUtteranceOrHook}"
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate(`/copilot/${conv.leadId}`)}
              className="px-3.5 py-1.5 text-xs font-semibold text-foreground bg-surface-2 border border-border-subtle hover:bg-surface-hover rounded-lg transition-colors shrink-0 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Open Copilot</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
