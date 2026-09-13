import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export interface AnimatedTextScrambleProps {
  text: string;
  speed?: number;
  scrambleChars?: string;
  className?: string;
  onComplete?: () => void;
}

export const AnimatedTextScramble: React.FC<AnimatedTextScrambleProps> = ({
  text,
  speed = 30,
  scrambleChars = 'ABCDEFGHJKMNOPQRSTUVWXYZ0123456789!@#$%^&*',
  className = '',
  onComplete,
}) => {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    let iteration = 0;
    const maxIterations = text.length;

    const interval = setInterval(() => {
      setDisplayedText(
        text
          .split('')
          .map((char, index) => {
            if (char === ' ') return ' ';
            if (index < iteration) return text[index];
            return scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
          })
          .join('')
      );

      iteration += 1 / 2;

      if (iteration >= maxIterations) {
        setDisplayedText(text);
        clearInterval(interval);
        if (onComplete) onComplete();
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed, scrambleChars, onComplete]);

  return (
    <motion.span
      initial={{ opacity: 0.7 }}
      animate={{ opacity: 1 }}
      className={`font-mono leading-relaxed ${className}`}
    >
      {displayedText}
    </motion.span>
  );
};

export default AnimatedTextScramble;
