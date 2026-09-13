import React, { useMemo } from 'react';
import { AudioStatus } from '../../types/calls';
import { Volume2, VolumeX, Mic, Pause } from 'lucide-react';

export interface CallWaveformProps {
  status: AudioStatus;
  isMuted?: boolean;
  className?: string;
}

export const CallWaveform: React.FC<CallWaveformProps> = ({
  status,
  isMuted = false,
  className = ''
}) => {
  // 28 compact vertical bars for calm, high-density visualization
  const barCount = 28;

  // Deterministic heights per audio state
  const bars = useMemo(() => {
    return Array.from({ length: barCount }, (_, i) => {
      const position = i / (barCount - 1);
      // Bell-curve distribution
      const bell = Math.sin(position * Math.PI);

      let heightPercent = 18; // quiet baseline
      let animationDuration = 1.6;
      let delay = (i % 5) * 0.15;

      if (isMuted || status === 'paused') {
        heightPercent = 10;
      } else if (status === 'ai_speaking') {
        // Controlled, calm voice cadence from AI
        const variance = Math.sin(i * 0.9) * 20;
        heightPercent = Math.max(16, Math.min(80, bell * 55 + variance + 15));
        animationDuration = 0.8 + (i % 4) * 0.14;
      } else if (status === 'prospect_speaking') {
        // Natural human vocal response
        const variance = Math.cos(i * 0.8) * 18;
        heightPercent = Math.max(18, Math.min(85, bell * 60 + variance + 12));
        animationDuration = 0.9 + (i % 4) * 0.12;
      } else if (status === 'listening') {
        // Subdued resting baseline waiting for speech
        heightPercent = Math.max(14, bell * 22 + 10);
        animationDuration = 1.8;
      } else if (status === 'processing') {
        // Subtle rhythm
        heightPercent = Math.max(16, bell * 28 + 12);
        animationDuration = 1.2;
      }

      return {
        id: i,
        heightPercent,
        animationDuration,
        delay
      };
    });
  }, [status, isMuted, barCount]);

  // Restrained enterprise theme
  const getTheme = () => {
    if (isMuted) {
      return {
        bar: 'bg-signal-urgent/50',
        text: 'Microphone Muted',
        textColor: 'text-signal-urgent'
      };
    }
    switch (status) {
      case 'ai_speaking':
        return {
          bar: 'bg-primary',
          text: 'AI Agent Speaking',
          textColor: 'text-primary'
        };
      case 'prospect_speaking':
        return {
          bar: 'bg-signal-qualified',
          text: 'Prospect Speaking',
          textColor: 'text-signal-qualified'
        };
      case 'listening':
        return {
          bar: 'bg-foreground-tertiary/40',
          text: 'Listening...',
          textColor: 'text-foreground-tertiary'
        };
      case 'processing':
        return {
          bar: 'bg-sky-400/60',
          text: 'Evaluating response...',
          textColor: 'text-sky-400'
        };
      case 'paused':
        return {
          bar: 'bg-border-default',
          text: 'Audio Stream Paused',
          textColor: 'text-foreground-tertiary'
        };
      default:
        return {
          bar: 'bg-border-subtle',
          text: 'Line Active',
          textColor: 'text-foreground-tertiary'
        };
    }
  };

  const theme = getTheme();

  return (
    <div
      className={`bg-surface-0 border border-border-default rounded-xl px-4 py-2.5 flex items-center justify-between gap-4 select-none ${className}`}
      role="region"
      aria-label="Audio stream activity waveform"
    >
      {/* State Label Pill */}
      <div className="flex items-center gap-2 shrink-0">
        <div className={`p-1.5 rounded-md bg-surface-elevated border border-border-subtle ${theme.textColor}`}>
          {isMuted ? (
            <VolumeX className="w-3.5 h-3.5" />
          ) : status === 'paused' ? (
            <Pause className="w-3.5 h-3.5" />
          ) : status === 'ai_speaking' ? (
            <Volume2 className="w-3.5 h-3.5" />
          ) : (
            <Mic className="w-3.5 h-3.5" />
          )}
        </div>
        <span className={`text-xs font-medium tracking-tight ${theme.textColor}`}>
          {theme.text}
        </span>
      </div>

      {/* Audio Waveform Track */}
      <div
        className="flex items-center justify-center gap-[3px] h-7 flex-1 max-w-sm px-2"
        aria-hidden="true"
      >
        {bars.map((bar) => {
          const isAnimated =
            !isMuted &&
            status !== 'paused' &&
            status !== 'idle';

          return (
            <div
              key={bar.id}
              className="w-[2.5px] sm:w-[3px] rounded-full transition-all duration-300"
              style={{
                height: `${bar.heightPercent}%`,
                animation: isAnimated
                  ? `subtleWavePulse ${bar.animationDuration}s ease-in-out ${bar.delay}s infinite alternate`
                  : 'none'
              }}
            >
              <div className={`w-full h-full rounded-full ${theme.bar}`} />
            </div>
          );
        })}
      </div>

      {/* Telephony Connection Quality Tag */}
      <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-mono text-foreground-tertiary shrink-0">
        <span className="w-1.5 h-1.5 rounded-full bg-signal-qualified" />
        <span>48kHz HD Audio</span>
      </div>

      <style>{`
        @keyframes subtleWavePulse {
          0% {
            transform: scaleY(0.6);
          }
          100% {
            transform: scaleY(1.0);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .subtleWavePulse {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
};
