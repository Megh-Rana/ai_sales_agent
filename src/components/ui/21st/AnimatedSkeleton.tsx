import React from 'react';
import { motion } from 'framer-motion';

export interface AnimatedSkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
  height?: string | number;
  width?: string | number;
  count?: number;
}

export const AnimatedSkeleton: React.FC<AnimatedSkeletonProps> = ({
  className = '',
  variant = 'text',
  height,
  width,
  count = 1,
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'circular':
        return 'rounded-full';
      case 'card':
        return 'rounded-xl border border-border-subtle/50';
      case 'rectangular':
        return 'rounded-lg';
      case 'text':
      default:
        return 'rounded';
    }
  };

  const skeletons = Array.from({ length: count });

  return (
    <div className={`space-y-2 w-full ${className}`}>
      {skeletons.map((_, i) => (
        <div
          key={i}
          style={{
            height: height ? height : variant === 'text' ? '1rem' : undefined,
            width: width ? width : '100%',
          }}
          className={`relative overflow-hidden bg-surface-1/60 dark:bg-surface-elevated/40 ${getVariantClasses()}`}
        >
          <motion.div
            className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 dark:via-white/5 to-transparent"
            animate={{
              translateX: ['-100%', '100%'],
            }}
            transition={{
              repeat: Infinity,
              duration: 1.5,
              ease: 'easeInOut',
              delay: i * 0.1,
            }}
          />
        </div>
      ))}
    </div>
  );
};

export default AnimatedSkeleton;
