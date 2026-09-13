import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Zap, UserCheck, CalendarCheck } from 'lucide-react';

export interface FloatingItem {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  color?: string;
  badge?: string;
}

const defaultItems: FloatingItem[] = [
  { id: '1', title: '94 Intent Score', subtitle: 'ABC Technologies', icon: Sparkles, color: 'text-amber-400', badge: 'HOT' },
  { id: '2', title: '12 Buying Signals', subtitle: 'Acme Corp Surge', icon: Zap, color: 'text-signal-high', badge: 'NEW' },
  { id: '3', title: 'Decision Maker Found', subtitle: 'CRO Sarah Jenkins', icon: UserCheck, color: 'text-primary', badge: 'VERIFIED' },
  { id: '4', title: 'Meeting Booked', subtitle: 'Tomorrow 2:00 PM', icon: CalendarCheck, color: 'text-emerald-400', badge: 'CONFIRMED' },
];

export interface ParallaxFloatingElementsProps {
  items?: FloatingItem[];
  className?: string;
}

export const ParallaxFloatingElements: React.FC<ParallaxFloatingElementsProps> = ({
  items = defaultItems,
  className = '',
}) => {
  return (
    <div className={`grid grid-cols-2 gap-3.5 ${className}`}>
      {items.map((item, index) => {
        const Icon = item.icon;
        const floatDuration = 3 + (index % 3) * 0.8;
        const floatY = [0, -8, 0];

        return (
          <motion.div
            key={item.id}
            animate={{ y: floatY }}
            transition={{
              repeat: Infinity,
              duration: floatDuration,
              ease: 'easeInOut',
            }}
            className="p-3.5 rounded-xl border border-border-default bg-surface-0/90 backdrop-blur-sm shadow-lg flex items-center gap-3 hover:border-primary/40 transition-colors"
          >
            <div className={`w-9 h-9 rounded-lg bg-surface-1 border border-border-subtle flex items-center justify-center shrink-0 ${item.color || 'text-primary'}`}>
              <Icon className="w-4 h-4" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-foreground truncate">{item.title}</span>
                {item.badge && (
                  <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded bg-primary/20 text-primary shrink-0">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[11px] text-foreground-tertiary block truncate">
                {item.subtitle}
              </span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default ParallaxFloatingElements;
