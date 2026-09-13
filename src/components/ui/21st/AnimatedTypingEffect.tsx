import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export interface AnimatedTypingEffectProps {
  text: string;
  speed?: number; // ms per character
  cursor?: boolean;
  className?: string;
  onComplete?: () => void;
}

export const AnimatedTypingEffect: React.FC<AnimatedTypingEffectProps> = ({
  text,
  speed = 25,
  cursor = true,
  className = '',
  onComplete,
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    setDisplayedText('');
    setIsDone(false);
    let index = 0;

    const timer = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1));
        index++;
      } else {
        setIsDone(true);
        clearInterval(timer);
        if (onComplete) onComplete();
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed, onComplete]);

  return (
    <span className={`inline-block font-sans leading-relaxed ${className}`}>
      {displayedText}
      {cursor && !isDone && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ repeat: Infinity, duration: 0.7 }}
          className="inline-block ml-0.5 font-semibold text-primary"
        >
          |
        </motion.span>
      )}
    </span>
  );
};

export default AnimatedTypingEffect;
