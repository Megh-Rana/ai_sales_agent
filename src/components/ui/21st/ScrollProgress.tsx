import React from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';

export interface ScrollProgressProps {
  className?: string;
  color?: string;
}

export const ScrollProgress: React.FC<ScrollProgressProps> = ({
  className = '',
  color = '#F59E0B',
}) => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      className={`fixed top-0 left-0 right-0 h-1 z-50 origin-left ${className}`}
      style={{ scaleX, backgroundColor: color }}
    />
  );
};

export default ScrollProgress;
