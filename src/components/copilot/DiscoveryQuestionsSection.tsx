import React from 'react';
import { HelpCircle, Copy, Check, ArrowUpRight } from 'lucide-react';
import { DiscoveryQuestion } from '../../types/copilot';
import { toast } from 'sonner';

interface DiscoveryQuestionsSectionProps {
  questions: DiscoveryQuestion[];
}

export const DiscoveryQuestionsSection: React.FC<DiscoveryQuestionsSectionProps> = ({ questions }) => {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const handleCopy = (q: DiscoveryQuestion) => {
    navigator.clipboard.writeText(q.question);
    setCopiedId(q.id);
    toast.success('Discovery question copied!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="p-5 rounded-xl bg-surface-0 border border-border-default space-y-4">
      <div className="flex items-center justify-between border-b border-border-subtle pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
            <HelpCircle className="w-4 h-4" />
          </div>
          <h2 className="text-h4 font-bold text-foreground tracking-tight">
            4. Strategic Discovery Questions ({(questions || []).length})
          </h2>
        </div>
        <span className="text-caption font-mono text-foreground-tertiary">
          Designed to qualify opportunity fit & timeline
        </span>
      </div>

      <div className="space-y-3">
        {(questions || []).map((dq) => (
          <div
            key={dq.id}
            className="p-4 rounded-xl bg-surface-1 border border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                  {dq.category}
                </span>
                <span className="text-caption text-foreground-tertiary">
                  Expected Insight: {dq.expectedInsight}
                </span>
              </div>

              <div className="text-small font-bold text-foreground">
                "{dq.question}"
              </div>

              <div className="text-caption text-foreground-secondary">
                <strong className="text-foreground-tertiary">Why Ask:</strong> {dq.whyAsk}
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleCopy(dq)}
              className="px-3 py-1.5 text-xs font-medium text-foreground bg-surface-2 border border-border-subtle hover:bg-surface-hover rounded-lg transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
            >
              {copiedId === dq.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedId === dq.id ? 'Copied' : 'Copy Question'}</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
