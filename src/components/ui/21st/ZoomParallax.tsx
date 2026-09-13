import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export interface ZoomParallaxProps {
  children?: React.ReactNode;
  className?: string;
}

export const ZoomParallax: React.FC<ZoomParallaxProps> = ({ children, className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const scale1 = useTransform(scrollYProgress, [0, 1], [1, 2.5]);
  const scale2 = useTransform(scrollYProgress, [0, 1], [0.8, 1.8]);
  const scale3 = useTransform(scrollYProgress, [0, 1], [0.6, 1.2]);
  const opacity = useTransform(scrollYProgress, [0, 0.8, 1], [1, 0.8, 0]);

  return (
    <div ref={containerRef} className={`relative h-[160vh] ${className}`}>
      <div className="sticky top-0 h-screen overflow-hidden flex items-center justify-center">
        {/* Layer 1: Background Grid & Scale */}
        <motion.div style={{ scale: scale1, opacity }} className="absolute inset-0 flex items-center justify-center">
          <div className="w-[80vw] h-[60vh] rounded-3xl border border-primary/20 bg-gradient-to-b from-primary/10 via-surface-0 to-surface-0 blur-xs" />
        </motion.div>

        {/* Layer 2: Midground Content */}
        <motion.div style={{ scale: scale2 }} className="absolute z-10 w-full max-w-4xl px-4 text-center">
          {children}
        </motion.div>

        {/* Layer 3: Foreground Floating Accent */}
        <motion.div style={{ scale: scale3 }} className="absolute z-20 pointer-events-none">
          <div className="w-[300px] h-[300px] rounded-full bg-blue-500/10 blur-3xl" />
        </motion.div>
      </div>
    </div>
  );
};

export default ZoomParallax;
