import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface TabItem {
  id: string;
  label: string;
  badge?: string | number;
  icon?: React.ComponentType<{ className?: string }>;
  content: React.ReactNode;
}

export interface AnimatedTabsProps {
  tabs: TabItem[];
  defaultTabId?: string;
  activeTab?: string;
  activeTabId?: string;
  onChange?: (tabId: string) => void;
  className?: string;
}

export const AnimatedTabs: React.FC<AnimatedTabsProps> = ({
  tabs,
  defaultTabId,
  activeTab,
  activeTabId,
  onChange,
  className = '',
}) => {
  const controlledId = activeTab || activeTabId;
  const [internalId, setInternalId] = useState<string>(defaultTabId || tabs[0]?.id || '');
  const activeId = controlledId !== undefined ? controlledId : internalId;

  const currentTab = tabs.find((t) => t.id === activeId) || tabs[0];

  const handleSelect = (id: string) => {
    setInternalId(id);
    if (onChange) onChange(id);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Sliding Pill Tab Bar */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-surface-1 border border-border-default overflow-x-auto scrollbar-none justify-center">
        {tabs.map((tab) => {
          const isActive = tab.id === activeId;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => handleSelect(tab.id)}
              className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer select-none whitespace-nowrap ${
                isActive ? 'text-primary-foreground' : 'text-foreground-secondary hover:text-foreground'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTabPill"
                  className="absolute inset-0 rounded-lg bg-primary shadow-xs z-0"
                  transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                />
              )}

              <span className="relative z-10 flex items-center gap-1.5">
                {Icon && <Icon className="w-3.5 h-3.5" />}
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-surface-elevated text-foreground-tertiary'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tab Panel Content Cross-fade */}
      <div className="relative min-h-[100px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTab?.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
          >
            {currentTab?.content}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AnimatedTabs;
