import React, { useEffect, useRef, useState } from 'react';
import { Bot, User, ArrowDown, UserCheck, Radio } from 'lucide-react';
import { TranscriptItem } from '../../types/calls';

export interface LiveTranscriptProps {
  transcript: TranscriptItem[];
  isCallLive: boolean;
  className?: string;
}

export const LiveTranscript: React.FC<LiveTranscriptProps> = ({
  transcript,
  isCallLive,
  className = ''
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isScrolledUp, setIsScrolledUp] = useState(false);
  const lastItemRef = useRef<HTMLDivElement>(null);

  // Monitor scroll position to show/hide "Jump to latest" button
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    // If user has scrolled up more than 70px from bottom
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    setIsScrolledUp(distanceFromBottom > 70);
  };

  // Auto-scroll to latest turn when new items arrive (unless user explicitly scrolled up)
  useEffect(() => {
    if (!isScrolledUp && lastItemRef.current) {
      lastItemRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [transcript, isScrolledUp]);

  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
      setIsScrolledUp(false);
    }
  };

  return (
    <section
      aria-label="Live Call Transcript"
      className={`bg-surface-0 border border-border-default rounded-xl flex flex-col relative overflow-hidden shadow-xs ${className}`}
    >
      {/* Transcript Card Header */}
      <div className="px-4 py-3 sm:px-5 sm:py-3.5 border-b border-border-subtle flex items-center justify-between bg-surface-elevated/40 shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <h2 className="text-xs font-mono font-bold tracking-wider text-foreground uppercase">
            Live Call Transcript
          </h2>
          <span className="text-[11px] font-mono text-foreground-tertiary">
            ({transcript.length} turns)
          </span>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-foreground-tertiary font-mono">
          <span className="hidden sm:inline">Streaming Speech-to-Text</span>
          <span className="w-1.5 h-1.5 rounded-full bg-signal-qualified" />
          <span className="text-signal-qualified font-semibold">Live Feed</span>
        </div>
      </div>

      {/* Transcript Verbatim Container */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        tabIndex={0}
        role="log"
        aria-live="polite"
        aria-relevant="additions text"
        aria-atomic="false"
        className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 scrollbar-thin focus:outline-none focus:ring-1 focus:ring-primary/40"
      >
        {transcript.length === 0 ? (
          <div className="h-56 flex flex-col items-center justify-center text-center text-foreground-tertiary space-y-2 select-none">
            <Radio className="w-8 h-8 text-foreground-tertiary/40 animate-pulse" />
            <p className="text-xs font-medium text-foreground-secondary">Connecting to prospect...</p>
            <p className="text-[11px] text-foreground-tertiary/70 max-w-xs">
              Verbatim spoken dialogue will stream here in real time as the conversation begins.
            </p>
          </div>
        ) : (
          transcript.map((item, index) => {
            const isAI = item.speaker === 'ai_agent';
            const isHumanRep = item.speaker === 'human_rep';
            const isLast = index === transcript.length - 1;

            return (
              <div
                key={item.id}
                ref={isLast ? lastItemRef : undefined}
                className={`transition-all duration-300 ${
                  isLast
                    ? 'p-3.5 rounded-lg bg-surface-elevated/75 border border-border-default/80 shadow-xs ring-1 ring-primary/20 animate-in fade-in slide-in-from-bottom-1 duration-300'
                    : 'p-2.5 rounded-lg hover:bg-surface-elevated/30 transition-colors'
                } ${
                  // Subtle indent for prospect to create distinct conversational alignment
                  !isAI && !isHumanRep ? 'sm:ml-4 border-l-2 border-border-subtle pl-3' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Speaker Role Icon */}
                  <div className="shrink-0 pt-0.5">
                    {isAI ? (
                      <div
                        className="w-7 h-7 rounded-md bg-primary/10 border border-primary/30 flex items-center justify-center text-primary shadow-xs"
                        title="Autonomous AI Sales Agent"
                      >
                        <Bot className="w-4 h-4" />
                      </div>
                    ) : isHumanRep ? (
                      <div
                        className="w-7 h-7 rounded-md bg-signal-high/15 border border-signal-high/40 flex items-center justify-center text-signal-high shadow-xs"
                        title="Human Sales Representative"
                      >
                        <UserCheck className="w-4 h-4" />
                      </div>
                    ) : (
                      <div
                        className="w-7 h-7 rounded-md bg-surface-elevated border border-border-default flex items-center justify-center text-foreground-secondary shadow-xs"
                        title="Prospect"
                      >
                        <User className="w-4 h-4" />
                      </div>
                    )}
                  </div>

                  {/* Speaker Header & Content */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-semibold tracking-tight ${
                            isAI
                              ? 'text-primary'
                              : isHumanRep
                              ? 'text-signal-high font-bold'
                              : 'text-foreground font-bold'
                          }`}
                        >
                          {item.speakerName}
                        </span>

                        <span className="font-mono text-[10px] text-foreground-tertiary">
                          {item.timestamp}
                        </span>

                        {item.sentiment && (
                          <span
                            className={`text-[9px] font-mono uppercase px-1.5 py-0.2 rounded border ${
                              item.sentiment === 'positive' || item.sentiment === 'engaged'
                                ? 'bg-signal-qualified/10 text-signal-qualified border-signal-qualified/20'
                                : item.sentiment === 'skeptical'
                                ? 'bg-signal-high/10 text-signal-high border-signal-high/20'
                                : 'bg-surface-elevated text-foreground-tertiary border-border-subtle'
                            }`}
                          >
                            {item.sentiment}
                          </span>
                        )}
                      </div>

                      {/* Active indicator badge on latest turn */}
                      {isLast && isCallLive && (
                        <div className="flex items-center gap-1 text-[10px] font-mono text-primary font-semibold shrink-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                          <span>ACTIVE TURN</span>
                        </div>
                      )}
                    </div>

                    {/* Verbatim Spoken Transcript Text */}
                    <p
                      className={`text-sm leading-relaxed font-sans select-text break-words ${
                        isLast
                          ? 'text-foreground font-medium'
                          : 'text-foreground-secondary/85'
                      }`}
                    >
                      "{item.text}"
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Floating "Jump to Latest" Button when scrolled up */}
      {isScrolledUp && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <button
            type="button"
            onClick={scrollToBottom}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-primary text-white text-xs font-semibold shadow-md hover:bg-primary-hover transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
            aria-label="Jump to latest spoken message in transcript"
          >
            <ArrowDown className="w-3.5 h-3.5" />
            <span>Jump to latest</span>
          </button>
        </div>
      )}
    </section>
  );
};
