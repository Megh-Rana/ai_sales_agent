import React from 'react';
import { User, Building2, Layers, CheckCircle2, History, AlertCircle } from 'lucide-react';
import { SalesConversationContext } from '../../types/copilot';

interface ConversationBriefCardProps {
  context: SalesConversationContext;
}

export const ConversationBriefCard: React.FC<ConversationBriefCardProps> = ({ context }) => {
  return (
    <div className="p-5 rounded-xl bg-surface-0 border border-border-default space-y-4">
      <div className="flex items-center justify-between border-b border-border-subtle pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30">
            <Building2 className="w-4 h-4" />
          </div>
          <h2 className="text-h4 font-bold text-foreground tracking-tight">
            1. Conversation Brief & Account Intelligence
          </h2>
        </div>
        <span className="text-caption font-mono text-foreground-tertiary">
          Grounded in verified lead profile
        </span>
      </div>

      {/* Account Overview Narrative */}
      <p className="text-small text-foreground leading-relaxed">
        {context.summaryBrief}
      </p>

      {/* Grid Specs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        {/* Pain Points */}
        <div className="p-3.5 rounded-lg bg-surface-1 border border-border-subtle space-y-2">
          <div className="text-xs font-mono font-bold text-amber-400 uppercase flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>CONFIRMED PAIN POINTS</span>
          </div>
          <div className="space-y-1.5">
            {(context.confirmedPainPoints || []).map((pain, i) => (
              <div key={i} className="flex items-start gap-2 text-small text-foreground-secondary">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span>{pain}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tech Stack & Scale */}
        <div className="p-3.5 rounded-lg bg-surface-1 border border-border-subtle space-y-3">
          <div>
            <div className="text-xs font-mono font-bold text-foreground-tertiary uppercase mb-1.5">
              CONFIRMED TECH STACK
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(context.techStack || []).map((tech, i) => (
                <span
                  key={i}
                  className="text-[11px] font-mono px-2 py-0.5 rounded bg-surface-2 border border-border-subtle text-foreground font-medium"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-border-subtle/60">
            <div className="text-caption font-mono text-foreground-tertiary">Scale & Company Footprint</div>
            <div className="text-small font-semibold text-foreground">{context.scaleInfo}</div>
          </div>
        </div>
      </div>

      {/* Previous Interaction History */}
      {context.lastInteraction && (
        <div className="p-3 rounded-lg bg-surface-1/60 border border-border-subtle flex items-center justify-between text-small">
          <div className="flex items-center gap-2 text-foreground-secondary">
            <History className="w-4 h-4 text-blue-400 shrink-0" />
            <span>
              <strong className="text-foreground">Last Touchpoint ({context.lastInteraction.date}):</strong>{' '}
              {context.lastInteraction.summary}
            </span>
          </div>
          <span className="text-caption font-mono text-foreground-tertiary px-2 py-0.5 bg-surface-2 rounded border border-border-subtle">
            {context.lastInteraction.channel}
          </span>
        </div>
      )}
    </div>
  );
};
