import React from 'react';
import { motion } from 'framer-motion';

export interface AnimatedBadgeProps {
  label: string;
  variant?: 'hot' | 'qualified' | 'urgent' | 'calling' | 'neutral';
  pulse?: boolean;
  className?: string;
}

export const AnimatedBadge: React.FC<AnimatedBadgeProps> = ({
  label,
  variant = 'hot',
  pulse = false,
  className = '',
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'hot':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'qualified':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'urgent':
        return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
      case 'calling':
        return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
      case 'neutral':
      default:
        return 'bg-surface-elevated text-foreground-secondary border-border-subtle';
    }
  };

  return (
    <motion.span
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      className={`relative inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border select-none ${getVariantStyles()} ${className}`}
    >
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-current" />
        </span>
      )}
      <span>{label}</span>
    </motion.span>
  );
};

export default AnimatedBadge;
