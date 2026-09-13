import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowLeft,
  Flame,
  Zap,
  Building2,
  ChevronDown,
  User,
  ShieldCheck,
} from 'lucide-react';
import { SalesConversationContext } from '../../types/copilot';

interface CopilotHeaderProps {
  context: SalesConversationContext;
  allContexts?: SalesConversationContext[];
  onSelectLead?: (leadId: string) => void;
  showBack?: boolean;
}

export const CopilotHeader: React.FC<CopilotHeaderProps> = ({
  context,
  allContexts = [],
  onSelectLead,
  showBack = true,
}) => {
  const navigate = useNavigate();

  return (
    <div className="bg-surface-0 border-b border-border-default px-6 py-5 space-y-4">
      {/* Top Navigation Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          {showBack && (
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg bg-surface-1 border border-border-subtle hover:bg-surface-hover text-foreground-tertiary hover:text-foreground transition-colors shrink-0"
              aria-label="Go Back"
              title="Go Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}

          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-semibold">
                Conversation Intelligence & Copilot
              </span>
            </div>

            <h1 className="text-h2 font-bold text-foreground tracking-tight flex items-center gap-3 flex-wrap">
              <span>{context.companyName}</span>

              {/* Lead Selector Switcher if multiple contexts available */}
              {allContexts.length > 1 && onSelectLead && (
                <div className="relative inline-block">
                  <select
                    value={context.leadId}
                    onChange={(e) => onSelectLead(e.target.value)}
                    aria-label="Select lead for conversation intelligence"
                    className="text-xs font-mono bg-surface-1 border border-border-subtle rounded-lg px-3 py-1 text-foreground cursor-pointer focus:outline-none focus:border-amber-500/50"
                  >
                    {allContexts.map((ctx) => (
                      <option key={ctx.leadId} value={ctx.leadId}>
                        {ctx.companyName} ({ctx.contactName})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </h1>

            <div className="text-small text-foreground-secondary flex items-center gap-2 mt-0.5 flex-wrap">
              <span className="font-medium text-foreground">{context.contactName}</span>
              <span className="text-border-subtle">•</span>
              <span className="text-foreground-tertiary">{context.contactRole}</span>
              <span className="text-border-subtle">•</span>
              <span className="font-mono text-amber-400 font-medium">{context.estimatedValue}</span>
            </div>
          </div>
        </div>

        {/* Intent Score & Why Now Badge */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="px-3.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-right">
            <div className="text-[10px] font-mono text-amber-400/80 uppercase font-semibold">Intent Gauge</div>
            <div className="text-h3 font-mono font-bold text-amber-400 leading-none mt-0.5">
              {context.intentScore}
              <span className="text-xs font-normal text-foreground-tertiary">/100</span>
            </div>
          </div>
        </div>
      </div>

      {/* WHY NOW BANNER */}
      <div className="p-3.5 rounded-xl bg-surface-1 border border-border-subtle flex items-start justify-between gap-3">
        <div className="flex items-start gap-2 min-w-0">
          <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-mono font-bold text-amber-400 uppercase">
              WHY NOW TRIGGER — {context.whyNowRecency}
            </div>
            <p className="text-small font-medium text-foreground leading-snug mt-0.5">
              {context.whyNowHeadline}
            </p>
          </div>
        </div>

        <span className="text-xs font-mono px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 shrink-0 font-medium">
          {context.primarySignal}
        </span>
      </div>
    </div>
  );
};
