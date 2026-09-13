import React from 'react';
import { motion } from 'framer-motion';

export interface MagicTextRevealProps {
  text: string;
  className?: string;
  delay?: number;
  highlightWords?: string[];
}

export const MagicTextReveal: React.FC<MagicTextRevealProps> = ({
  text,
  className = '',
  delay = 0.2,
  highlightWords = ['CONVERSATIONS', 'BUYING INTENT', 'VIDUR'],
}) => {
  const words = text.split(' ');

  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: delay * i },
    }),
  };

  const child = {
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        type: 'spring',
        damping: 18,
        stiffness: 100,
      },
    },
    hidden: {
      opacity: 0,
      y: 20,
      filter: 'blur(8px)',
    },
  };

  return (
    <motion.h1
      className={`font-extrabold tracking-tight flex flex-wrap gap-x-3 gap-y-1 ${className}`}
      variants={container}
      initial="hidden"
      animate="visible"
    >
      {words.map((word, index) => {
        const cleanWord = word.replace(/[^a-zA-Z]/g, '');
        const isHighlight = highlightWords.some(
          (hw) => hw.toLowerCase() === cleanWord.toLowerCase()
        );

        return (
          <motion.span
            key={index}
            variants={child}
            className={`inline-block ${
              isHighlight
                ? 'bg-gradient-to-r from-amber-400 via-primary to-blue-400 bg-clip-text text-transparent drop-shadow-sm'
                : 'text-foreground'
            }`}
          >
            {word}
          </motion.span>
        );
      })}
    </motion.h1>
  );
};

export default MagicTextReveal;
