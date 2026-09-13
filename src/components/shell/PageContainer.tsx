import React from 'react';
import { motion } from 'framer-motion';
import { pageTransition } from '../../motion/presets';

export interface PageContainerProps {
  children: React.ReactNode;
  maxWidth?: 'full' | '7xl' | '6xl' | '5xl';
  className?: string;
}

export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  maxWidth = '7xl',
  className = '',
}) => {
  const maxWidthClasses = {
    full: 'max-w-full',
    '7xl': 'max-w-7xl',
    '6xl': 'max-w-6xl',
    '5xl': 'max-w-5xl',
  };

  return (
    <motion.main
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      className={`w-full ${maxWidthClasses[maxWidth]} mx-auto p-4 sm:p-6 lg:p-8 space-y-6 ${className}`}
    >
      {children}
    </motion.main>
  );
};
