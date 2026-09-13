import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { PhoneCall, Search, Zap, Bot, BarChart2, ShieldCheck, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export interface DockItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  badge?: string;
  isPrimary?: boolean;
}

const defaultDockItems: DockItem[] = [
  { id: 'call', label: 'AI Voice Call', icon: PhoneCall, path: '/calls', isPrimary: true },
  { id: 'discover', label: 'Lead Discovery', icon: Search, path: '/leads/discover' },
  { id: 'copilot', label: 'Sales Copilot', icon: Bot, path: '/copilot' },
  { id: 'actions', label: 'Next Best Action', icon: Zap, path: '/actions', badge: '4' },
  { id: 'analytics', label: 'Revenue Analytics', icon: BarChart2, path: '/analytics' },
];

export interface AnimatedDockProps {
  items?: DockItem[];
  className?: string;
}

export const AnimatedDock: React.FC<AnimatedDockProps> = ({
  items = defaultDockItems,
  className = '',
}) => {
  const mouseX = useMotionValue(Infinity);
  const navigate = useNavigate();

  return (
    <div
      onMouseMove={(e) => mouseX.set(e.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className={`fixed bottom-5 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-surface-0/90 backdrop-blur-md border border-border-default shadow-2xl shadow-black/50 ${className}`}
    >
      <div className="flex items-center gap-1.5 pr-2 border-r border-border-subtle shrink-0">
        <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
        <span className="text-[11px] font-mono font-bold text-foreground tracking-wider uppercase">
          VIDUR DOCK
        </span>
      </div>

      <div className="flex items-center gap-2">
        {items.map((item) => (
          <DockIcon key={item.id} item={item} mouseX={mouseX} onClick={() => navigate(item.path)} />
        ))}
      </div>
    </div>
  );
};

function DockIcon({
  item,
  mouseX,
  onClick,
}: {
  item: DockItem;
  mouseX: any;
  onClick: () => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);

  const distance = useTransform(mouseX, (val: number) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  const widthSync = useTransform(distance, [-150, 0, 150], [40, 56, 40]);
  const width = useSpring(widthSync, { mass: 0.1, stiffness: 150, damping: 12 });

  const Icon = item.icon;

  return (
    <motion.button
      ref={ref}
      style={{ width, height: width }}
      onClick={onClick}
      className={`relative rounded-xl flex items-center justify-center transition-colors group cursor-pointer ${
        item.isPrimary
          ? 'bg-amber-400 text-black font-bold shadow-md shadow-amber-500/20 hover:bg-amber-300'
          : 'bg-surface-1 border border-border-subtle text-foreground-secondary hover:text-foreground hover:bg-surface-2'
      }`}
    >
      <Icon className="w-5 h-5 group-hover:scale-110 transition-transform" />

      {item.badge && (
        <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-[9px] font-mono font-bold bg-signal-urgent text-white rounded-full">
          {item.badge}
        </span>
      )}

      {/* Tooltip on Hover */}
      <span className="absolute -top-9 left-1/2 -translate-x-1/2 px-2.5 py-1 text-[11px] font-semibold text-foreground bg-surface-0 border border-border-default rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-lg">
        {item.label}
      </span>
    </motion.button>
  );
}

export default AnimatedDock;
