import React from 'react';
import { Target, Copy, Check } from 'lucide-react';
import { TalkingPoint } from '../../types/copilot';
import { toast } from 'sonner';

interface TalkingPointsSectionProps {
  points: TalkingPoint[];
}

export const TalkingPointsSection: React.FC<TalkingPointsSectionProps> = ({ points }) => {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const handleCopy = (pt: TalkingPoint) => {
    navigator.clipboard.writeText(pt.suggestedPhrasing);
    setCopiedId(pt.id);
    toast.success(`Copied angle: "${pt.angle}"`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="p-5 rounded-xl bg-surface-0 border border-border-default space-y-4">
      <div className="flex items-center justify-between border-b border-border-subtle pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30">
            <Target className="w-4 h-4" />
          </div>
          <h2 className="text-h4 font-bold text-foreground tracking-tight">
            3. Key Talking Points & Value Angles ({(points || []).length})
          </h2>
        </div>
        <span className="text-caption font-mono text-foreground-tertiary">
          Tied to confirmed prospect pain points
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {(points || []).map((pt) => (
          <div
            key={pt.id}
            className="p-4 rounded-xl bg-surface-1 border border-border-subtle hover:border-border-default transition-all space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-amber-400 uppercase">
                  {pt.angle}
                </span>
              </div>

              <p className="text-small font-semibold text-foreground">
                "{pt.suggestedPhrasing}"
              </p>

              <div className="text-caption font-mono text-foreground-tertiary pt-1 border-t border-border-subtle/50">
                {pt.basis}
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleCopy(pt)}
              className="w-full py-1.5 px-3 text-xs font-medium text-foreground-secondary hover:text-foreground bg-surface-2 border border-border-subtle hover:bg-surface-hover rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              {copiedId === pt.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedId === pt.id ? 'Copied Phrasing' : 'Copy Phrasing'}</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
