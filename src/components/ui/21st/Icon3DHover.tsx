import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';

export interface Icon3DHoverProps {
  children: React.ReactNode;
  className?: string;
}

export const Icon3DHover: React.FC<Icon3DHoverProps> = ({ children, className = '' }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    setRotateX(-y * 0.25);
    setRotateY(x * 0.25);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ rotateX, rotateY }}
      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
      style={{ transformStyle: 'preserve-3d', perspective: 600 }}
      className={`inline-flex items-center justify-center transition-shadow ${className}`}
    >
      <div style={{ transform: 'translateZ(12px)' }}>{children}</div>
    </motion.div>
  );
};

export default Icon3DHover;
