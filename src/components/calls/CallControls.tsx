import React, { useState } from 'react';
import {
  Mic,
  MicOff,
  Pause,
  Play,
  PhoneOff,
  UserCheck,
  AlertTriangle,
  Radio,
  Headphones,
  RotateCcw
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';

export interface CallControlsProps {
  isMuted: boolean;
  isPaused: boolean;
  isHumanTakeover: boolean;
  onToggleMute: () => void;
  onTogglePause: () => void;
  onTakeOver: () => void;
  onEndCall: () => void;
  className?: string;
}

export const CallControls: React.FC<CallControlsProps> = ({
  isMuted,
  isPaused,
  isHumanTakeover,
  onToggleMute,
  onTogglePause,
  onTakeOver,
  onEndCall,
  className = ''
}) => {
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [showTakeoverConfirm, setShowTakeoverConfirm] = useState(false);

  const handleConfirmEnd = () => {
    setShowEndConfirm(false);
    onEndCall();
  };

  const handleTakeoverClick = () => {
    if (isHumanTakeover) {
      // If already in takeover mode, handing back doesn't need confirmation
      onTakeOver();
    } else {
      setShowTakeoverConfirm(true);
    }
  };

  const handleConfirmTakeover = () => {
    setShowTakeoverConfirm(false);
    onTakeOver();
  };

  return (
    <>
      <div className="space-y-2.5">
        {/* Active Human Takeover Banner */}
        {isHumanTakeover && (
          <div
            role="status"
            aria-live="polite"
            className="p-3 rounded-xl bg-signal-high/15 border border-signal-high/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in duration-200"
          >
            <div className="flex items-center gap-2.5 text-xs text-foreground">
              <span className="w-2.5 h-2.5 rounded-full bg-signal-high animate-pulse shrink-0" />
              <div className="space-y-0.5">
                <span className="font-bold text-signal-high tracking-tight">
                  HUMAN REPRESENTATIVE TAKEOVER ACTIVE
                </span>
                <p className="text-foreground-secondary text-[11px]">
                  AI voice muted. Your microphone is bridged live. AI continues transcribing & surfacing signals.
                </p>
              </div>
            </div>

            <Button
              variant="secondary"
              size="sm"
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              onClick={onTakeOver}
              className="text-xs shrink-0 font-medium border-signal-high/30 text-signal-high hover:bg-signal-high/20"
            >
              Hand Back to AI
            </Button>
          </div>
        )}

        {/* Primary Command Bar */}
        <nav
          aria-label="Live Call Controls"
          className={`bg-surface-0 border border-border-default rounded-xl p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3 shadow-sm ${className}`}
        >
          {/* Left: Stream Modifiers */}
          <div className="flex items-center gap-2">
            {/* MUTE TOGGLE */}
            <Button
              variant={isMuted ? 'danger' : 'secondary'}
              size="md"
              leftIcon={isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              onClick={onToggleMute}
              aria-pressed={isMuted}
              title="Toggle Microphone Mute (Shortcut: Space)"
              className="text-xs font-medium"
            >
              <span>{isMuted ? 'Muted' : 'Mute'}</span>
              <kbd className="hidden sm:inline-block ml-1.5 px-1.5 py-0.2 text-[10px] font-mono bg-surface-elevated/60 border border-border-subtle rounded text-foreground-tertiary">
                Space
              </kbd>
            </Button>

            {/* PAUSE / RESUME TOGGLE */}
            <Button
              variant={isPaused ? 'primary' : 'secondary'}
              size="md"
              leftIcon={isPaused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4" />}
              onClick={onTogglePause}
              aria-pressed={isPaused}
              title="Pause/Resume AI Spoken Output (Shortcut: P)"
              className="text-xs font-medium"
            >
              <span>{isPaused ? 'Resume Call' : 'Pause Call'}</span>
              <kbd className="hidden sm:inline-block ml-1.5 px-1.5 py-0.2 text-[10px] font-mono bg-surface-elevated/60 border border-border-subtle rounded text-foreground-tertiary">
                P
              </kbd>
            </Button>
          </div>

          {/* Center: Telecom Quality */}
          <div className="hidden md:flex items-center gap-2 text-xs font-mono text-foreground-tertiary">
            <Radio className="w-3.5 h-3.5 text-signal-qualified" />
            <span>Full-Duplex Voice Engine Active</span>
          </div>

          {/* Right: Human Takeover & Safe End Call */}
          <div className="flex items-center gap-2">
            {/* HUMAN TAKEOVER CONTROL */}
            <Button
              variant="secondary"
              size="md"
              leftIcon={<Headphones className="w-4 h-4 text-signal-high" />}
              onClick={handleTakeoverClick}
              title="Intervene and take over the call as a live sales representative (Shortcut: T)"
              className={`text-xs font-medium border ${
                isHumanTakeover
                  ? 'border-signal-high/50 bg-signal-high/15 text-signal-high font-semibold'
                  : 'border-border-default hover:border-signal-high/40 hover:text-signal-high'
              }`}
            >
              <span>{isHumanTakeover ? 'Rep Controlling Call' : 'Take Over Call'}</span>
              <kbd className="hidden sm:inline-block ml-1.5 px-1.5 py-0.2 text-[10px] font-mono bg-surface-elevated/60 border border-border-subtle rounded text-foreground-tertiary">
                T
              </kbd>
            </Button>

            {/* END CALL BUTTON (Destructive, with safety modal) */}
            <Button
              variant="danger"
              size="md"
              leftIcon={<PhoneOff className="w-4 h-4" />}
              onClick={() => setShowEndConfirm(true)}
              title="Conclude live call session"
              className="text-xs font-semibold px-4 shadow-sm"
            >
              End Call
            </Button>
          </div>
        </nav>
      </div>

      {/* Human Takeover Confirmation Modal */}
      <Modal
        isOpen={showTakeoverConfirm}
        onClose={() => setShowTakeoverConfirm(false)}
        title="Take Over Live Call?"
        maxWidth="md"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3.5 rounded-lg bg-signal-high/10 border border-signal-high/30 flex items-start gap-3">
            <Headphones className="w-5 h-5 text-signal-high shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-foreground">
                You are about to intervene as the live sales representative.
              </p>
              <p className="text-foreground-secondary leading-relaxed">
                The AI agent’s voice will immediately be muted, and your microphone will be bridged directly to the prospect.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-surface-elevated border border-border-subtle space-y-2">
            <span className="text-[10px] font-mono uppercase text-foreground-tertiary font-bold">
              Background Intelligence Continuity:
            </span>
            <ul className="space-y-1 text-foreground-secondary">
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-signal-qualified shrink-0" />
                <span>AI continues real-time speech-to-text transcription.</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-signal-qualified shrink-0" />
                <span>Live buying signals and objections will still be detected on-screen.</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-signal-qualified shrink-0" />
                <span>You can hand control back to the AI at any time.</span>
              </li>
            </ul>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border-subtle">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowTakeoverConfirm(false)}
            >
              Cancel
            </Button>

            <Button
              variant="primary"
              size="md"
              leftIcon={<Headphones className="w-4 h-4" />}
              onClick={handleConfirmTakeover}
              className="font-semibold text-xs px-5 shadow-sm bg-signal-high hover:bg-signal-high/90 text-slate-950 border-signal-high"
            >
              Confirm Takeover
            </Button>
          </div>
        </div>
      </Modal>

      {/* End Call Safety Confirmation Modal */}
      <Modal
        isOpen={showEndConfirm}
        onClose={() => setShowEndConfirm(false)}
        title="End Call Session?"
        maxWidth="sm"
      >
        <div className="space-y-4 text-xs">
          <div className="flex items-start gap-3 p-3.5 rounded-lg bg-surface-elevated border border-border-subtle">
            <AlertTriangle className="w-5 h-5 text-signal-urgent shrink-0 mt-0.5" />
            <p className="text-foreground-secondary leading-relaxed">
              Are you sure you want to conclude this call? The AI voice agent will finalize the dialogue, synthesize the recorded transcript, and generate the executive qualification scorecard.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border-subtle">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowEndConfirm(false)}
            >
              Continue Call
            </Button>
            <Button
              variant="danger"
              size="sm"
              leftIcon={<PhoneOff className="w-3.5 h-3.5" />}
              onClick={handleConfirmEnd}
            >
              Confirm End Call
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};
