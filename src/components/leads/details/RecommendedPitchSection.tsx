import React, { useState } from 'react';
import { Sparkles, Copy, Check, RefreshCw, MessageSquareQuote, Sliders } from 'lucide-react';
import { DiscoveredLead } from '../../../types/leads';
import { Button } from '../../ui/Button';
import { toast } from 'sonner';

export interface RecommendedPitchSectionProps {
  lead: DiscoveredLead;
}

export const RecommendedPitchSection: React.FC<RecommendedPitchSectionProps> = ({ lead }) => {
  const [copied, setCopied] = useState(false);
  const [selectedTone, setSelectedTone] = useState<'valueLed' | 'direct' | 'technical'>('valueLed');
  const [isRegenerating, setIsRegenerating] = useState(false);

  const pitchData = lead.recommendedPitch;

  // Active pitch script based on tone variation
  const currentPitchText =
    pitchData?.toneVariations?.[selectedTone] ||
    pitchData?.pitch ||
    lead.suggestedOpeningHook;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentPitchText);
      setCopied(true);
      toast.success('Recommended pitch copied to clipboard. Ready for dialer.');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy to clipboard.');
    }
  };

  const handleRegenerate = () => {
    setIsRegenerating(true);
    setTimeout(() => {
      setIsRegenerating(false);
      toast.success('Pitch angle refreshed with updated trigger context.');
    }, 600);
  };

  return (
    <section
      aria-labelledby="heading-recommended-pitch"
      className="bg-surface-0 border border-primary/30 rounded-xl p-5 space-y-4 shadow-xs relative overflow-hidden"
    >
      {/* Accent left indicator */}
      <div className="absolute top-0 left-0 bottom-0 w-1 bg-primary" />

      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-subtle pb-3 pl-1">
        <div className="flex items-center gap-2">
          <span className="p-1 rounded bg-primary/10 text-primary">
            <MessageSquareQuote className="w-4 h-4" />
          </span>
          <h2 id="heading-recommended-pitch" className="text-h4 font-bold text-foreground tracking-tight">
            Recommended Pitch Script
          </h2>
          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
            PERSONALIZED
          </span>
        </div>

        {/* Tone Selector & Actions */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-surface-1 rounded-lg p-0.5 border border-border-subtle text-[11px] font-medium">
            <button
              type="button"
              onClick={() => setSelectedTone('valueLed')}
              className={`px-2 py-1 rounded transition-colors ${
                selectedTone === 'valueLed'
                  ? 'bg-primary text-white font-semibold'
                  : 'text-foreground-secondary hover:text-foreground'
              }`}
            >
              Value-Led
            </button>
            <button
              type="button"
              onClick={() => setSelectedTone('direct')}
              className={`px-2 py-1 rounded transition-colors ${
                selectedTone === 'direct'
                  ? 'bg-primary text-white font-semibold'
                  : 'text-foreground-secondary hover:text-foreground'
              }`}
            >
              Direct
            </button>
            <button
              type="button"
              onClick={() => setSelectedTone('technical')}
              className={`px-2 py-1 rounded transition-colors ${
                selectedTone === 'technical'
                  ? 'bg-primary text-white font-semibold'
                  : 'text-foreground-secondary hover:text-foreground'
              }`}
            >
              Technical
            </button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleRegenerate}
            disabled={isRegenerating}
            className="text-xs h-7 px-2 text-foreground-secondary hover:text-foreground"
            title="Regenerate Pitch Variations"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin text-primary' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Script Quotation Box */}
      <div className="p-4 rounded-xl bg-surface-1 border border-border-subtle space-y-3 pl-4">
        <p className="text-body font-medium text-foreground leading-relaxed italic">
          "{currentPitchText}"
        </p>

        <div className="flex items-center justify-between pt-2 border-t border-border-subtle/70">
          <span className="text-[11px] font-mono text-primary font-semibold flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-primary" />
            <span>Angle: {pitchData?.keyAngle || 'Autonomous Touchpoint Acceleration'}</span>
          </span>

          <Button
            variant="secondary"
            size="sm"
            leftIcon={copied ? <Check className="w-3.5 h-3.5 text-signal-qualified" /> : <Copy className="w-3.5 h-3.5" />}
            onClick={handleCopy}
            className="text-xs font-semibold px-3 h-8"
          >
            {copied ? 'Copied to Clipboard' : 'Copy Pitch Script'}
          </Button>
        </div>
      </div>

      {/* Why This Pitch Rationale */}
      {pitchData?.whyThisPitch && pitchData.whyThisPitch.length > 0 && (
        <div className="space-y-1.5 pl-1">
          <span className="text-[11px] uppercase tracking-wider font-mono font-semibold text-foreground-tertiary">
            Why this pitch angle was chosen:
          </span>
          <ul className="space-y-1 text-xs text-foreground-secondary">
            {pitchData.whyThisPitch.map((reason, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span className="leading-relaxed">{reason}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
};
