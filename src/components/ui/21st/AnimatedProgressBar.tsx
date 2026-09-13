import React from 'react';
import { motion } from 'framer-motion';

export interface AnimatedProgressBarProps {
  value: number; // 0 - 100
  max?: number;
  label?: string;
  showPercentage?: boolean;
  color?: 'primary' | 'success' | 'warning' | 'info' | 'accent';
  height?: number;
  className?: string;
}

export const AnimatedProgressBar: React.FC<AnimatedProgressBarProps> = ({
  value,
  max = 100,
  label,
  showPercentage = true,
  color = 'primary',
  height = 8,
  className = '',
}) => {
  const percentage = Math.min(Math.max(0, Math.round((value / max) * 100)), 100);

  const getColorClasses = () => {
    switch (color) {
      case 'success':
        return 'bg-gradient-to-r from-emerald-500 to-teal-400';
      case 'warning':
        return 'bg-gradient-to-r from-amber-500 to-orange-400';
      case 'info':
        return 'bg-gradient-to-r from-blue-500 to-indigo-400';
      case 'accent':
        return 'bg-gradient-to-r from-purple-500 to-pink-500';
      case 'primary':
      default:
        return 'bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400';
    }
  };

  return (
    <div className={`w-full space-y-1.5 ${className}`}>
      {(label || showPercentage) && (
        <div className="flex items-center justify-between text-xs">
          {label && <span className="font-medium text-foreground-secondary">{label}</span>}
          {showPercentage && <span className="font-mono font-semibold text-foreground">{percentage}%</span>}
        </div>
      )}
      <div
        className="w-full rounded-full bg-surface-1 dark:bg-surface-elevated overflow-hidden relative"
        style={{ height }}
      >
        <motion.div
          className={`h-full rounded-full ${getColorClasses()} relative`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
        </motion.div>
      </div>
    </div>
  );
};

export default AnimatedProgressBar;
