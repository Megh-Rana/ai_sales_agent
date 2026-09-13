import React, { useState, useEffect } from 'react';
import { ShieldAlert, ChevronRight, Copy, Check, CornerDownRight } from 'lucide-react';
import { ObjectionItem } from '../../types/copilot';
import { toast } from 'sonner';

interface ObjectionMatrixProps {
  objections: ObjectionItem[];
}

export const ObjectionMatrix: React.FC<ObjectionMatrixProps> = ({ objections }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(objections[0]?.category || 'Price');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (objections && objections.length > 0) {
      setSelectedCategory(objections[0].category);
    }
  }, [objections]);

  const activeObjection = objections.find((o) => o.category === selectedCategory) || objections[0];

  const handleCopy = (obj: ObjectionItem) => {
    navigator.clipboard.writeText(obj.suggestedResponse);
    setCopiedId(obj.id);
    toast.success(`Copied counter for ${obj.category} objection!`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="p-5 rounded-xl bg-surface-0 border border-border-default space-y-4">
      <div className="flex items-center justify-between border-b border-border-subtle pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-red-500/10 text-red-400 border border-red-500/30">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <h2 className="text-h4 font-bold text-foreground tracking-tight">
            5. Objection Handling Playbooks
          </h2>
        </div>
        <span className="text-caption font-mono text-foreground-tertiary">
          Grounded counter-strategies & pivots
        </span>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {objections.map((obj) => (
          <button
            key={obj.id}
            type="button"
            onClick={() => setSelectedCategory(obj.category)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
              selectedCategory === obj.category
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-semibold shadow-xs'
                : 'bg-surface-1 text-foreground-tertiary border-border-subtle hover:text-foreground hover:bg-surface-hover'
            }`}
          >
            <span>{obj.category} Objection</span>
          </button>
        ))}
      </div>

      {/* Active Objection Content Box */}
      {activeObjection && (
        <div className="p-4 rounded-xl bg-surface-1 border border-border-subtle space-y-4">
          <div className="space-y-1">
            <div className="text-caption font-mono text-red-400 uppercase">
              Likely Prospect Objection
            </div>
            <div className="text-small font-bold text-foreground italic">
              "{activeObjection.objection}"
            </div>
          </div>

          {/* Suggested Response */}
          <div className="p-3.5 rounded-lg bg-surface-2/60 border border-border-subtle space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-amber-400 uppercase">
                RECOMMENDED RESPONSE
              </span>
              <button
                type="button"
                onClick={() => handleCopy(activeObjection)}
                className="px-2.5 py-1 text-xs font-medium text-foreground bg-surface-0 border border-border-subtle hover:bg-surface-hover rounded transition-colors inline-flex items-center gap-1 cursor-pointer"
              >
                {copiedId === activeObjection.id ? (
                  <Check className="w-3 h-3 text-emerald-400" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
                <span>{copiedId === activeObjection.id ? 'Copied' : 'Copy Counter'}</span>
              </button>
            </div>

            <p className="text-small font-semibold text-foreground leading-relaxed">
              "{activeObjection.suggestedResponse}"
            </p>
          </div>

          {/* Contextual Rationale & Discovery Pivot */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-small pt-1">
            <div className="p-3 rounded-lg bg-surface-0 border border-border-subtle">
              <div className="text-caption font-mono text-foreground-tertiary">Strategic Rationale</div>
              <div className="text-foreground mt-0.5">{activeObjection.reasoning}</div>
            </div>

            <div className="p-3 rounded-lg bg-surface-0 border border-border-subtle">
              <div className="text-caption font-mono text-amber-400 flex items-center gap-1">
                <CornerDownRight className="w-3 h-3 text-amber-400" />
                <span>Follow-Up Discovery Pivot</span>
              </div>
              <div className="text-foreground font-medium mt-0.5">"{activeObjection.discoveryPivot}"</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
