import React from 'react';
import { Search, Menu, Keyboard } from 'lucide-react';
import { Breadcrumbs } from './Breadcrumbs';
import { AIActivityIndicator } from './AIActivityIndicator';
import { NotificationCenter } from './NotificationCenter';
import { UserMenu } from './UserMenu';
import { ThemeToggle } from '../ui/ThemeToggle';

export interface TopBarProps {
  onOpenSearch: () => void;
  onOpenMobileNav: () => void;
  onOpenShortcuts: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  onOpenSearch,
  onOpenMobileNav,
  onOpenShortcuts,
}) => {
  const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);

  return (
    <header className="h-16 bg-surface border-b border-border-strong px-4 sm:px-6 flex items-center justify-between gap-3 sticky top-0 z-50 shrink-0 select-none">
      {/* Left: Mobile Menu Trigger + Breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileNav}
          className="lg:hidden p-2 text-foreground-secondary hover:text-foreground hover:bg-surface-hover rounded-md transition-colors"
          title="Open Navigation"
          aria-label="Open Mobile Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <Breadcrumbs />
      </div>

      {/* Center / Right Controls */}
      <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
        {/* Global Search Command Trigger Button */}
        <button
          type="button"
          onClick={onOpenSearch}
          className="flex items-center gap-2.5 px-3 py-1.5 bg-surface-elevated hover:bg-surface-hover border border-border hover:border-border-strong rounded-lg text-xs text-foreground-tertiary hover:text-foreground transition-all duration-150 shadow-xs group"
          title={`Search commands (${isMac ? '⌘K' : 'Ctrl K'})`}
          aria-label="Open Command Palette"
        >
          <Search className="w-3.5 h-3.5 text-foreground-tertiary group-hover:text-primary transition-colors shrink-0" />
          <span className="hidden sm:inline-block">Search or command...</span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface-muted text-foreground-tertiary border border-border shrink-0">
            {isMac ? '⌘K' : 'Ctrl K'}
          </span>
        </button>

        {/* Global Day / Night Theme Toggle */}
        <ThemeToggle />

        {/* Global AI Activity Indicator */}
        <AIActivityIndicator />

        {/* Notifications Popover */}
        <NotificationCenter />

        {/* User Profile Menu */}
        <UserMenu onOpenShortcuts={onOpenShortcuts} />
      </div>
    </header>
  );
};
