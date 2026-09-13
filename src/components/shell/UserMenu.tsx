import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Building2, Users, CreditCard, ShieldCheck, Keyboard, LogOut, ChevronDown, Sun, Moon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { mockUser } from '../../services/mockShellData';
import { Avatar } from '../ui/Avatar';
import { useTheme } from '../../context/ThemeContext';

export interface UserMenuProps {
  onOpenShortcuts?: () => void;
}

export const UserMenu: React.FC<UserMenuProps> = ({ onOpenShortcuts }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { theme, setTheme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isOpen && e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleNavigate = (path: string) => {
    setIsOpen(false);
    navigate(path);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 rounded-lg hover:bg-surface-hover transition-colors text-left select-none group"
        aria-label="User Account Menu"
      >
        <Avatar type="user" name={mockUser.name} size="sm" />
        <span className="text-small font-medium text-foreground hidden md:inline-block">{mockUser.name}</span>
        <ChevronDown className="w-3.5 h-3.5 text-foreground-tertiary hidden md:inline-block group-hover:text-foreground transition-colors" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 z-50 w-56 bg-surface border border-border-strong rounded-xl shadow-2xl p-1.5 space-y-1"
            >
              {/* User Header */}
              <div className="px-3 py-2 border-b border-border mb-1">
                <div className="text-small font-semibold text-foreground truncate">{mockUser.name}</div>
                <div className="text-caption text-foreground-tertiary truncate">{mockUser.email}</div>
                <div className="mt-1">
                  <span className="text-[10px] font-mono uppercase bg-primary-muted text-primary px-1.5 py-0.2 rounded border border-primary/30 font-semibold">
                    {mockUser.role}
                  </span>
                </div>
              </div>

              {/* Appearance Day / Night Mode Choice Segment */}
              <div className="px-2.5 py-1.5 border-b border-border my-1">
                <div className="text-[10px] font-mono uppercase font-semibold text-foreground-tertiary mb-1.5 flex items-center justify-between">
                  <span>Appearance</span>
                  <span className="text-primary font-bold">{theme === 'light' ? '☀ Day Mode' : '🌙 Night Mode'}</span>
                </div>
                <div className="grid grid-cols-2 gap-1 bg-surface-muted p-1 rounded-lg border border-border">
                  <button
                    onClick={() => setTheme('light')}
                    className={`flex items-center justify-center gap-1.5 py-1 text-xs font-semibold rounded-md transition-all ${
                      theme === 'light'
                        ? 'bg-surface text-foreground shadow-xs border border-border-strong'
                        : 'text-foreground-secondary hover:text-foreground'
                    }`}
                  >
                    <Sun className="w-3.5 h-3.5 text-amber-500" />
                    <span>Day</span>
                  </button>
                  <button
                    onClick={() => setTheme('dark')}
                    className={`flex items-center justify-center gap-1.5 py-1 text-xs font-semibold rounded-md transition-all ${
                      theme === 'dark'
                        ? 'bg-surface text-foreground shadow-xs border border-border-strong'
                        : 'text-foreground-secondary hover:text-foreground'
                    }`}
                  >
                    <Moon className="w-3.5 h-3.5 text-amber-400" />
                    <span>Night</span>
                  </button>
                </div>
              </div>

              <button
                onClick={() => handleNavigate('/settings/profile')}
                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs text-foreground-secondary hover:text-foreground hover:bg-surface-hover transition-colors text-left"
              >
                <User className="w-4 h-4 text-foreground-tertiary shrink-0" />
                <span>My Profile</span>
              </button>

              <button
                onClick={() => handleNavigate('/settings/business')}
                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs text-foreground-secondary hover:text-foreground hover:bg-surface-hover transition-colors text-left"
              >
                <Building2 className="w-4 h-4 text-foreground-tertiary shrink-0" />
                <span>Business Settings</span>
              </button>

              <button
                onClick={() => handleNavigate('/settings/team')}
                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs text-foreground-secondary hover:text-foreground hover:bg-surface-hover transition-colors text-left"
              >
                <Users className="w-4 h-4 text-foreground-tertiary shrink-0" />
                <span>Team & Seats</span>
              </button>

              <button
                onClick={() => handleNavigate('/settings/subscription')}
                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs text-foreground-secondary hover:text-foreground hover:bg-surface-hover transition-colors text-left"
              >
                <CreditCard className="w-4 h-4 text-foreground-tertiary shrink-0" />
                <span>Subscription Plan</span>
              </button>

              <button
                onClick={() => handleNavigate('/settings/security')}
                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs text-foreground-secondary hover:text-foreground hover:bg-surface-hover transition-colors text-left"
              >
                <ShieldCheck className="w-4 h-4 text-foreground-tertiary shrink-0" />
                <span>Security & SSO</span>
              </button>

              {onOpenShortcuts && (
                <button
                  onClick={() => {
                    setIsOpen(false);
                    onOpenShortcuts();
                  }}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs text-foreground-secondary hover:text-foreground hover:bg-surface-hover transition-colors text-left"
                >
                  <span className="flex items-center gap-2.5">
                    <Keyboard className="w-4 h-4 text-foreground-tertiary shrink-0" />
                    <span>Keyboard Shortcuts</span>
                  </span>
                  <span className="text-[10px] font-mono text-foreground-tertiary px-1 py-0.2 bg-surface-1 rounded border border-border-subtle">
                    ?
                  </span>
                </button>
              )}

              <div className="pt-1 border-t border-border-subtle">
                <button
                  onClick={() => handleNavigate('/login')}
                  className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs text-danger hover:bg-danger-muted transition-colors font-medium text-left"
                >
                  <LogOut className="w-4 h-4 shrink-0" />
                  <span>Sign Out</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
