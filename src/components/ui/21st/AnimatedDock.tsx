import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { PhoneCall, Search, Zap, Bot, BarChart2, LayoutDashboard, CalendarCheck, Target } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export interface DockItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  badge?: string;
  matchPaths?: string[];
}

const defaultDockItems: DockItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', matchPaths: ['/dashboard', '/command-center'] },
  { id: 'opportunities', label: 'Opportunities', icon: Target, path: '/opportunities', matchPaths: ['/opportunities'] },
  { id: 'discover', label: 'Leads', icon: Search, path: '/leads/discover', matchPaths: ['/leads'] },
  { id: 'call', label: 'AI Calls', icon: PhoneCall, path: '/calls', matchPaths: ['/calls'] },
  { id: 'copilot', label: 'Copilot', icon: Bot, path: '/copilot', matchPaths: ['/copilot'] },
  { id: 'actions', label: 'Actions', icon: Zap, path: '/actions', badge: '4', matchPaths: ['/actions'] },
  { id: 'followups', label: 'Follow-ups', icon: CalendarCheck, path: '/follow-ups', matchPaths: ['/follow-ups'] },
  { id: 'analytics', label: 'Analytics', icon: BarChart2, path: '/analytics', matchPaths: ['/analytics'] },
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
  const location = useLocation();

  const isItemActive = (item: DockItem): boolean => {
    const currentPath = location.pathname;
    if (item.matchPaths) {
      return item.matchPaths.some((mp) => currentPath.startsWith(mp));
    }
    return currentPath.startsWith(item.path);
  };

  return (
    <div
      onMouseMove={(e) => mouseX.set(e.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className={`fixed bottom-0 left-0 right-0 z-40 flex items-center justify-center px-2 py-2 sm:bottom-4 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:px-0 sm:py-0 ${className}`}
    >
      <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2 rounded-2xl bg-surface-0/95 backdrop-blur-md border border-border-default shadow-2xl shadow-black/50 max-w-[100vw] overflow-x-auto scrollbar-none">
        <div className="hidden sm:flex items-center gap-1.5 pr-2 border-r border-border-subtle shrink-0">
          <span className="text-[11px] font-mono font-bold text-foreground tracking-wider uppercase">
            VIDUR
          </span>
        </div>

        <div className="flex items-center gap-1 sm:gap-1.5">
          {items.map((item) => (
            <DockIcon
              key={item.id}
              item={item}
              mouseX={mouseX}
              isActive={isItemActive(item)}
              onClick={() => navigate(item.path)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

function DockIcon({
  item,
  mouseX,
  isActive,
  onClick,
}: {
  item: DockItem;
  mouseX: any;
  isActive: boolean;
  onClick: () => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);

  const distance = useTransform(mouseX, (val: number) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  // Smaller on mobile (36px base), larger on desktop (40px base, 56px on hover)
  const widthSync = useTransform(distance, [-150, 0, 150], [36, 48, 36]);
  const width = useSpring(widthSync, { mass: 0.1, stiffness: 150, damping: 12 });

  const Icon = item.icon;

  return (
    <motion.button
      ref={ref}
      style={{ width, height: width }}
      onClick={onClick}
      className={`relative rounded-xl flex items-center justify-center transition-colors group cursor-pointer shrink-0 ${
        isActive
          ? 'bg-amber-400 text-black font-bold shadow-md shadow-amber-500/30'
          : 'bg-surface-1 border border-border-subtle text-foreground-secondary hover:text-foreground hover:bg-surface-2'
      }`}
    >
      <Icon className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform" />

      {item.badge && !isActive && (
        <span className="absolute -top-1 -right-1 px-1 sm:px-1.5 py-0.5 text-[8px] sm:text-[9px] font-mono font-bold bg-signal-urgent text-white rounded-full">
          {item.badge}
        </span>
      )}

      {/* Active indicator dot */}
      {isActive && (
        <motion.span
          layoutId="dockActiveIndicator"
          className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-amber-400"
          transition={{ type: 'spring', stiffness: 350, damping: 28 }}
        />
      )}

      {/* Tooltip on Hover - hidden on mobile */}
      <span className="hidden sm:block absolute -top-9 left-1/2 -translate-x-1/2 px-2.5 py-1 text-[11px] font-semibold text-foreground bg-surface-0 border border-border-default rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-lg">
        {item.label}
      </span>
    </motion.button>
  );
}

export default AnimatedDock;
