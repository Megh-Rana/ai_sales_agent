import React from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';

export interface TimelineItem {
  id: string;
  time: string;
  title: string;
  description?: string;
  badge?: string;
  icon?: React.ReactNode;
  status?: 'completed' | 'active' | 'pending';
}

export interface AnimatedTimelineProps {
  items: TimelineItem[];
  className?: string;
}

export const AnimatedTimeline: React.FC<AnimatedTimelineProps> = ({ items, className = '' }) => {
  return (
    <div className={`relative pl-6 space-y-6 ${className}`}>
      {/* Animated Connector Line */}
      <motion.div
        className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-gradient-to-b from-primary via-indigo-500/40 to-border-subtle"
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        style={{ originY: 0 }}
      />

      {items.map((item, index) => (
        <motion.div
          key={item.id || index}
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
          className="relative flex items-start gap-4 group"
        >
          {/* Node Icon/Dot */}
          <div className="absolute -left-6 top-0.5 flex items-center justify-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 + 0.1 }}
              className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] ${
                item.status === 'active'
                  ? 'bg-primary text-white border-primary shadow-sm shadow-primary/30 ring-2 ring-primary/20'
                  : item.status === 'completed'
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                  : 'bg-surface-elevated text-foreground-tertiary border-border-subtle'
              }`}
            >
              {item.icon || <Clock className="w-3 h-3" />}
            </motion.div>
          </div>

          {/* Card Content */}
          <div className="flex-1 rounded-xl border border-border-subtle/80 bg-surface-0 p-3.5 hover:border-border-default transition-all shadow-xs">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-xs font-semibold text-foreground">{item.title}</span>
              <span className="text-[11px] font-mono text-foreground-tertiary shrink-0">{item.time}</span>
            </div>
            {item.description && (
              <p className="text-xs text-foreground-secondary leading-relaxed">{item.description}</p>
            )}
            {item.badge && (
              <span className="mt-2 inline-block px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-primary/10 text-primary border border-primary/20">
                {item.badge}
              </span>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default AnimatedTimeline;
