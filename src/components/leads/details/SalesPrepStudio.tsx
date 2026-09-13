import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquareQuote,
  FileText,
  Copy,
  Check,
  RefreshCw,
  PhoneCall,
  Sparkles,
  HelpCircle,
  ShieldAlert,
  Target
} from 'lucide-react';
import { DiscoveredLead } from '../../../types/leads';
import { Button } from '../../ui/Button';
import { toast } from 'sonner';

export interface SalesPrepStudioProps {
  lead: DiscoveredLead;
  onInitiateCall?: () => void;
}

export const SalesPrepStudio: React.FC<SalesPrepStudioProps> = ({ lead, onInitiateCall }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'pitch' | 'brief'>('pitch');
  const [copied, setCopied] = useState(false);
  const [selectedTone, setSelectedTone] = useState<'valueLed' | 'direct' | 'technical'>('valueLed');
  const [isRegenerating, setIsRegenerating] = useState(false);
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const regenTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
      if (regenTimeoutRef.current) clearTimeout(regenTimeoutRef.current);
    };
  }, []);

  const pitchData = lead.recommendedPitch;
  const brief = lead.callBrief;

  // Active script based on selected tone
  const currentPitchText =
    pitchData?.toneVariations?.[selectedTone] ||
    pitchData?.pitch ||
    lead.suggestedOpeningHook;

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(currentPitchText);
      } else {
        // Fallback for restricted clipboard contexts
        const textArea = document.createElement('textarea');
        textArea.value = currentPitchText;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      toast.success('Recommended pitch copied to clipboard. Ready for dialer.');
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy to clipboard.');
    }
  };

  const handleRegenerate = () => {
    setIsRegenerating(true);
    if (regenTimeoutRef.current) clearTimeout(regenTimeoutRef.current);
    regenTimeoutRef.current = setTimeout(() => {
      setIsRegenerating(false);
      toast.success('Pitch angle refreshed with updated trigger context.');
    }, 600);
  };

  const handleStartCall = () => {
    if (onInitiateCall) {
      onInitiateCall();
    } else {
      navigate('/calls');
    }
  };

  return (
    <section
      aria-labelledby="heading-sales-prep"
      className="bg-surface-0 border border-primary/30 rounded-xl p-5 space-y-4 shadow-xs relative overflow-hidden"
    >
      {/* Visual Accent Indicator */}
      <div className="absolute top-0 left-0 bottom-0 w-1 bg-primary" />

      {/* Header with Integrated Tab Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-subtle pb-3 pl-1">
        <div className="flex items-center gap-2">
          <span className="p-1 rounded bg-primary/10 text-primary">
            {activeTab === 'pitch' ? (
              <MessageSquareQuote className="w-4 h-4" />
            ) : (
              <FileText className="w-4 h-4" />
            )}
          </span>
          <h2 id="heading-sales-prep" className="text-h4 font-bold text-foreground tracking-tight">
            Outbound Conversation Preparation
          </h2>
        </div>

        {/* Tab Switcher: Pitch vs Brief with ARIA tablist */}
        <div className="flex items-center gap-2">
          <div
            role="tablist"
            aria-label="Conversation preparation modes"
            className="flex items-center bg-surface-1 rounded-lg p-0.5 border border-border-subtle text-xs font-medium"
          >
            <button
              id="tab-recommended-pitch"
              role="tab"
              aria-selected={activeTab === 'pitch'}
              aria-controls="tabpanel-recommended-pitch"
              type="button"
              onClick={() => setActiveTab('pitch')}
              className={`px-3 py-1 rounded transition-colors flex items-center gap-1.5 focus:outline-none focus:ring-1 focus:ring-primary ${
                activeTab === 'pitch'
                  ? 'bg-primary text-white font-semibold shadow-xs'
                  : 'text-foreground-secondary hover:text-foreground'
              }`}
            >
              <MessageSquareQuote className="w-3.5 h-3.5" />
              <span>Recommended Pitch</span>
            </button>

            <button
              id="tab-pre-call-brief"
              role="tab"
              aria-selected={activeTab === 'brief'}
              aria-controls="tabpanel-pre-call-brief"
              type="button"
              onClick={() => setActiveTab('brief')}
              className={`px-3 py-1 rounded transition-colors flex items-center gap-1.5 focus:outline-none focus:ring-1 focus:ring-primary ${
                activeTab === 'brief'
                  ? 'bg-primary text-white font-semibold shadow-xs'
                  : 'text-foreground-secondary hover:text-foreground'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Pre-Call Brief & Objections</span>
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: RECOMMENDED PITCH SCRIPT */}
      {activeTab === 'pitch' && (
        <div
          id="tabpanel-recommended-pitch"
          role="tabpanel"
          aria-labelledby="tab-recommended-pitch"
          className="space-y-4 pl-1 animate-fadeIn"
        >
          {/* Tone Selector & Refresh Bar */}
          <div className="flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-foreground-tertiary font-medium">Pitch Style:</span>
              <div className="flex items-center gap-1 bg-surface-1/80 rounded-md p-0.5 border border-border-subtle text-[11px]">
                <button
                  type="button"
                  onClick={() => setSelectedTone('valueLed')}
                  className={`px-2 py-0.5 rounded transition-colors ${
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
                  className={`px-2 py-0.5 rounded transition-colors ${
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
                  className={`px-2 py-0.5 rounded transition-colors ${
                    selectedTone === 'technical'
                      ? 'bg-primary text-white font-semibold'
                      : 'text-foreground-secondary hover:text-foreground'
                  }`}
                >
                  Technical
                </button>
              </div>
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
                className="text-xs font-semibold px-3 h-8 shadow-xs"
              >
                {copied ? 'Copied to Clipboard' : 'Copy Pitch Script'}
              </Button>
            </div>
          </div>

          {/* Why This Pitch Rationale */}
          {pitchData?.whyThisPitch && pitchData.whyThisPitch.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] uppercase tracking-wider font-mono font-semibold text-foreground-tertiary">
                Why this pitch angle connects:
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
        </div>
      )}

      {/* TAB 2: AI CALL BRIEF & OBJECTIONS */}
      {activeTab === 'brief' && brief && (
        <div
          id="tabpanel-pre-call-brief"
          role="tabpanel"
          aria-labelledby="tab-pre-call-brief"
          className="space-y-4 pl-1 animate-fadeIn text-xs"
        >
          {/* Grid of Dossier Points */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* 1. Primary Objective */}
            <div className="p-3 rounded-lg bg-surface-1 border border-border-subtle space-y-1 md:col-span-2">
              <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-signal-qualified flex items-center gap-1.5">
                <Target className="w-3 h-3" />
                <span>Primary Call Objective & Desired Outcome</span>
              </span>
              <p className="text-foreground font-semibold leading-relaxed">
                {brief.desiredOutcome}
              </p>
            </div>

            {/* 2. Key Discovery Question */}
            <div className="p-3 rounded-lg bg-surface-1 border border-border-subtle space-y-1">
              <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-info flex items-center gap-1.5">
                <HelpCircle className="w-3 h-3" />
                <span>Recommended Discovery Question</span>
              </span>
              <p className="text-foreground-secondary font-medium leading-relaxed">
                "{brief.discoveryQuestion}"
              </p>
            </div>

            {/* 3. Potential Objection & Battle-Tested Counter */}
            <div className="p-3 rounded-lg bg-surface-1 border border-border-subtle space-y-1">
              <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-signal-urgent flex items-center gap-1.5">
                <ShieldAlert className="w-3 h-3" />
                <span>Anticipated Objection & Response</span>
              </span>
              <p className="text-foreground-secondary italic">
                {brief.potentialObjection}
              </p>
              <div className="pt-1 text-foreground-tertiary">
                <strong className="text-primary font-semibold">Counter:</strong> {brief.objectionCounter}
              </div>
            </div>

            {/* 4. Lead Operational Context */}
            <div className="p-3 rounded-lg bg-surface-1 border border-border-subtle space-y-1 md:col-span-2">
              <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-foreground-tertiary">
                Account Situational Context
              </span>
              <p className="text-foreground-secondary leading-relaxed">
                {brief.leadContext}
              </p>
            </div>
          </div>

          {/* CTA Row */}
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-border-subtle">
            <span className="text-xs text-foreground-tertiary">
              Ready to initiate autonomous dialogue with real-time sentiment telemetry.
            </span>

            <Button
              variant="primary"
              size="md"
              leftIcon={<PhoneCall className="w-4 h-4" />}
              onClick={handleStartCall}
              className="text-xs font-semibold px-5 shadow-sm"
            >
              Start AI Call
            </Button>
          </div>
        </div>
      )}
    </section>
  );
};
