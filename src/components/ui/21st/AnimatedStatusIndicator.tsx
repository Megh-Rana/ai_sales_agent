import React from 'react';
import { motion } from 'framer-motion';

export type AIStatusType = 'idle' | 'ready' | 'connecting' | 'listening' | 'thinking' | 'speaking' | 'completed' | 'error';

export interface AnimatedStatusIndicatorProps {
  status: AIStatusType;
  label?: string;
  className?: string;
}

export const AnimatedStatusIndicator: React.FC<AnimatedStatusIndicatorProps> = ({
  status,
  label,
  className = '',
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'ready':
      case 'completed':
        return 'bg-emerald-400 text-emerald-400';
      case 'speaking':
      case 'listening':
        return 'bg-primary text-primary';
      case 'thinking':
      case 'connecting':
        return 'bg-amber-400 text-amber-400';
      case 'error':
        return 'bg-rose-400 text-rose-400';
      case 'idle':
      default:
        return 'bg-slate-400 text-slate-400';
    }
  };

  const getStatusLabel = () => {
    if (label) return label;
    return status.toUpperCase();
  };

  const colorClass = getStatusColor();

  return (
    <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-surface-1 border border-border-default text-xs font-mono font-bold ${className}`}>
      <div className="relative flex items-center justify-center w-2.5 h-2.5">
        {(status === 'speaking' || status === 'listening' || status === 'thinking') && (
          <motion.span
            animate={{ scale: [1, 1.8, 1], opacity: [0.7, 0, 0.7] }}
            transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
            className={`absolute inset-0 rounded-full ${colorClass.split(' ')[0]}`}
          />
        )}
        <span className={`w-2 h-2 rounded-full ${colorClass.split(' ')[0]}`} />
      </div>

      <span className="text-foreground tracking-wider">{getStatusLabel()}</span>
    </div>
  );
};

export default AnimatedStatusIndicator;
