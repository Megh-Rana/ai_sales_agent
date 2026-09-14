import React from 'react';
import { User, Building2, Layers, CheckCircle2, History, AlertCircle } from 'lucide-react';
import { SalesConversationContext } from '../../types/copilot';

interface ConversationBriefCardProps {
  context: SalesConversationContext;
}

export const ConversationBriefCard: React.FC<ConversationBriefCardProps> = ({ context }) => {
  return (
    <div className="p-5 sm:p-6 rounded-xl bg-surface-0 border border-skyBlue/20 space-y-5">
      <div className="flex items-center justify-between pb-4 border-b border-border-subtle">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-skyBlue/10 text-skyBlue border border-skyBlue/30">
            <Building2 className="w-4 h-4" />
          </div>
          <h2 className="text-lg font-bold text-foreground tracking-tight">
            Account Intelligence
          </h2>
        </div>
        <span className="text-xs font-mono text-foreground-tertiary">
          Verified Profile
        </span>
      </div>

      {/* Account Overview Narrative - More breathing room */}
      <p className="text-sm text-foreground leading-relaxed">
        {context.summaryBrief}
      </p>

      {/* Grid Specs - Cleaner layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Pain Points */}
        <div className="p-4 rounded-xl bg-babyPink/5 border border-babyPink/20 space-y-3">
          <div className="text-xs font-semibold text-babyPink uppercase flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>Pain Points</span>
          </div>
          <div className="space-y-2">
            {(context.confirmedPainPoints || []).map((pain, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-foreground-secondary">
                <CheckCircle2 className="w-4 h-4 text-babyPink shrink-0 mt-0.5" />
                <span className="leading-relaxed">{pain}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tech Stack & Scale */}
        <div className="p-4 rounded-xl bg-icyBlue/5 border border-icyBlue/20 space-y-3">
          <div>
            <div className="text-xs font-semibold text-icyBlue uppercase mb-2">
              Tech Stack
            </div>
            <div className="flex flex-wrap gap-2">
              {(context.techStack || []).map((tech, i) => (
                <span
                  key={i}
                  className="text-xs font-medium px-2.5 py-1 rounded-lg bg-surface border border-icyBlue/30 text-foreground"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-icyBlue/20">
            <div className="text-xs text-foreground-tertiary mb-1">Company Scale</div>
            <div className="text-sm font-semibold text-foreground">{context.scaleInfo}</div>
          </div>
        </div>
      </div>

      {/* Previous Interaction History - Simplified */}
      {context.lastInteraction && (
        <div className="p-3.5 rounded-xl bg-surface-elevated/50 border border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-2.5 text-foreground-secondary min-w-0">
            <History className="w-4 h-4 text-skyBlue shrink-0" />
            <span className="leading-relaxed">
              <strong className="text-foreground font-semibold">Last: {context.lastInteraction.date}</strong> — {context.lastInteraction.summary}
            </span>
          </div>
          <span className="text-xs font-mono text-foreground-tertiary px-2.5 py-1 bg-surface rounded-lg border border-border-subtle shrink-0">
            {context.lastInteraction.channel}
          </span>
        </div>
      )}
    </div>
  );
};
