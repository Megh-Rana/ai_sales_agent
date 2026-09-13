import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Sparkles } from 'lucide-react';

export interface AnimatedTextCycleProps {
  phrases?: string[];
  intervalMs?: number;
  className?: string;
  autoPlay?: boolean;
}

const defaultPhrases = [
  'AI is researching the target company context...',
  'AI is analyzing high-intent buying signals...',
  'AI is scoring BANT qualification requirements...',
  'AI is preparing a personalized executive pitch...',
  'AI Sales Agent is ready to initiate live session.',
];

export const AnimatedTextCycle: React.FC<AnimatedTextCycleProps> = ({
  phrases = defaultPhrases,
  intervalMs = 3000,
  className = '',
  autoPlay = true,
}) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!autoPlay || phrases.length <= 1) return;

    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % phrases.length);
    }, intervalMs);

    return () => clearInterval(timer);
  }, [phrases, intervalMs, autoPlay]);

  return (
    <div
      className={`flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-1/80 border border-primary/20 text-xs font-medium text-foreground ${className}`}
    >
      <div className="relative flex items-center justify-center shrink-0">
        <Bot className="w-4 h-4 text-primary animate-pulse" />
        <Sparkles className="w-2.5 h-2.5 text-amber-400 absolute -top-1 -right-1" />
      </div>

      <div className="relative overflow-hidden h-5 flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -15, opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="absolute inset-0 flex items-center truncate text-foreground-secondary"
          >
            <span>{phrases[index]}</span>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AnimatedTextCycle;
