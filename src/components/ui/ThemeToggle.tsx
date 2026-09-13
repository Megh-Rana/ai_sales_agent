import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { motion } from 'framer-motion';

export interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '', showLabel = false }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`relative inline-flex items-center gap-2 p-1.5 rounded-lg bg-surface-1 hover:bg-surface-elevated border border-border-subtle hover:border-border-default text-foreground-secondary hover:text-foreground transition-all duration-200 select-none shadow-xs group focus:outline-none focus:ring-2 focus:ring-primary ${className}`}
      title={theme === 'dark' ? 'Switch to Day Mode (Light)' : 'Switch to Night Mode (Dark)'}
      aria-label={theme === 'dark' ? 'Switch to Day Mode' : 'Switch to Night Mode'}
    >
      <div className="relative w-4 h-4 flex items-center justify-center shrink-0">
        <motion.div
          initial={false}
          animate={{
            scale: theme === 'dark' ? 1 : 0,
            rotate: theme === 'dark' ? 0 : 90,
            opacity: theme === 'dark' ? 1 : 0,
          }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 flex items-center justify-center text-amber-400"
        >
          <Moon className="w-4 h-4" />
        </motion.div>

        <motion.div
          initial={false}
          animate={{
            scale: theme === 'light' ? 1 : 0,
            rotate: theme === 'light' ? 0 : -90,
            opacity: theme === 'light' ? 1 : 0,
          }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 flex items-center justify-center text-amber-500"
        >
          <Sun className="w-4 h-4" />
        </motion.div>
      </div>

      {showLabel && (
        <span className="text-xs font-medium text-foreground-secondary group-hover:text-foreground transition-colors">
          {theme === 'dark' ? 'Night' : 'Day'}
        </span>
      )}
    </button>
  );
};
