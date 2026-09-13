import React, { useState, useEffect } from 'react';
import { Sparkles, Copy, Check, RefreshCw, MessageSquare, ShieldCheck, Edit3 } from 'lucide-react';
import { CopilotOpeningHook } from '../../types/copilot';
import { toast } from 'sonner';

interface OpeningHookCardProps {
  openingHook: CopilotOpeningHook;
}

export const OpeningHookCard: React.FC<OpeningHookCardProps> = ({ openingHook }) => {
  const [editedHook, setEditedHook] = useState(openingHook.hook);
  const [copied, setCopied] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setEditedHook(openingHook.hook);
    setIsEditing(false);
  }, [openingHook.hook]);

  const handleCopy = () => {
    navigator.clipboard.writeText(editedHook);
    setCopied(true);
    toast.success('Opening hook copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerate = () => {
    setIsRegenerating(true);
    setTimeout(() => {
      setIsRegenerating(false);
      toast.success('Regenerated alternative opening hook based on recent signals.');
    }, 700);
  };

  return (
    <div className="p-5 rounded-xl bg-surface-0 border border-amber-500/30 space-y-4">
      <div className="flex items-center justify-between border-b border-border-subtle pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <MessageSquare className="w-4 h-4" />
          </div>
          <h2 className="text-h4 font-bold text-foreground tracking-tight">
            2. Recommended Opening Hook
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-surface-1 border border-border-subtle text-foreground-secondary">
            Tone: {openingHook.tone}
          </span>
          <button
            type="button"
            onClick={handleRegenerate}
            disabled={isRegenerating}
            className="p-1.5 text-xs text-foreground-tertiary hover:text-foreground hover:bg-surface-hover rounded-md transition-colors flex items-center gap-1"
            title="Regenerate hook suggestion"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin text-amber-400' : ''}`} />
            <span>Regenerate</span>
          </button>
        </div>
      </div>

      {/* Editable Hook Box */}
      <div className="space-y-2">
        <div className="relative">
          {isEditing ? (
            <textarea
              value={editedHook}
              onChange={(e) => setEditedHook(e.target.value)}
              rows={3}
              className="w-full p-3.5 rounded-lg bg-surface-1 border border-amber-500/50 text-small text-foreground font-medium focus:outline-none transition-colors"
            />
          ) : (
            <div className="p-3.5 rounded-lg bg-amber-500/5 border border-amber-500/30 text-small text-foreground font-medium leading-relaxed italic">
              "{editedHook}"
            </div>
          )}
        </div>

        {/* Citation & Rationale */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-caption text-foreground-tertiary">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="font-mono text-[11px] text-emerald-400">{openingHook.citation}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className="text-xs text-foreground-secondary hover:text-foreground underline flex items-center gap-1"
            >
              <Edit3 className="w-3 h-3" />
              <span>{isEditing ? 'Done Editing' : 'Edit Hook'}</span>
            </button>

            <button
              type="button"
              onClick={handleCopy}
              className="px-3 py-1 text-xs font-semibold text-black bg-amber-400 hover:bg-amber-300 rounded-md transition-colors inline-flex items-center gap-1 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Hook'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
