import React from 'react';
import { motion } from 'framer-motion';

export interface AnimatedCircularProgressProps {
  value: number; // 0 to 100
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
  variant?: 'primary' | 'success' | 'amber' | 'rose';
  className?: string;
}

export const AnimatedCircularProgress: React.FC<AnimatedCircularProgressProps> = ({
  value,
  size = 120,
  strokeWidth = 10,
  label = 'SCORE',
  sublabel,
  variant = 'primary',
  className = '',
}) => {
  const normalizedValue = Math.min(Math.max(0, value), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalizedValue / 100) * circumference;

  const getGradient = () => {
    switch (variant) {
      case 'success':
        return { start: '#10B981', end: '#14B8A6' };
      case 'amber':
        return { start: '#F59E0B', end: '#F97316' };
      case 'rose':
        return { start: '#EF4444', end: '#EC4899' };
      case 'primary':
      default:
        return { start: '#3B82F6', end: '#6366F1' };
    }
  };

  const colors = getGradient();

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <defs>
            <linearGradient id={`circle-gradient-${variant}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={colors.start} />
              <stop offset="100%" stopColor={colors.end} />
            </linearGradient>
          </defs>
          {/* Background Ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            className="text-border-subtle/40 dark:text-surface-elevated"
          />
          {/* Foreground Animated Ring */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={`url(#circle-gradient-${variant})`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
          <motion.span
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-2xl font-bold font-mono text-slate-900 dark:text-foreground leading-none"
          >
            {normalizedValue}
          </motion.span>
          {label && (
            <span className="text-[9px] font-mono uppercase tracking-wider font-bold text-slate-800 dark:text-foreground-tertiary mt-1">
              {label}
            </span>
          )}
        </div>
      </div>
      {sublabel && (
        <span className="text-xs font-semibold text-slate-900 dark:text-foreground-secondary mt-2">{sublabel}</span>
      )}
    </div>
  );
};

export default AnimatedCircularProgress;
