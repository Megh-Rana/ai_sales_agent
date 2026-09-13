import React from 'react';
import { motion } from 'framer-motion';

export interface AnimatedContentRevealProps {
  children: React.ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right' | 'scale';
  delay?: number;
  duration?: number;
  className?: string;
}

export const AnimatedContentReveal: React.FC<AnimatedContentRevealProps> = ({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.5,
  className = '',
}) => {
  const getVariants = () => {
    switch (direction) {
      case 'down':
        return { initial: { opacity: 0, y: -24 }, animate: { opacity: 1, y: 0 } };
      case 'left':
        return { initial: { opacity: 0, x: 24 }, animate: { opacity: 1, x: 0 } };
      case 'right':
        return { initial: { opacity: 0, x: -24 }, animate: { opacity: 1, x: 0 } };
      case 'scale':
        return { initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1 } };
      case 'up':
      default:
        return { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 } };
    }
  };

  const variants = getVariants();

  return (
    <motion.div
      initial={variants.initial}
      whileInView={variants.animate}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedContentReveal;
