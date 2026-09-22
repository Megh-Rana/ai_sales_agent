import React from 'react';
import { Search } from 'lucide-react';
import { Breadcrumbs } from './Breadcrumbs';
import { NotificationCenter } from './NotificationCenter';
import { UserMenu } from './UserMenu';
import { ThemeToggle } from '../ui/ThemeToggle';
import { LanguageSelector } from '../ui/LanguageSelector';

import { useI18n } from '../../i18n/i18nContext';

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
  const { t } = useI18n();
  const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);

  return (
    <header className="h-14 sm:h-16 bg-surface border-b border-border-strong px-3 sm:px-6 flex items-center justify-between gap-2 sm:gap-3 sticky top-0 z-50 shrink-0 select-none">
      {/* Left: Breadcrumbs */}
      <div className="flex items-center gap-2 min-w-0 overflow-hidden">
        <Breadcrumbs />
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {/* Global Search Command Trigger Button */}
        <button
          type="button"
          onClick={onOpenSearch}
          className="flex items-center gap-1.5 sm:gap-2.5 px-2 sm:px-3 py-1.5 bg-surface-elevated hover:bg-surface-hover border border-border hover:border-border-strong rounded-lg text-xs text-foreground-tertiary hover:text-foreground transition-all duration-150 shadow-xs group"
          title={`${t.topbar?.searchTooltip || 'Search commands'} (${isMac ? '⌘K' : 'Ctrl K'})`}
          aria-label="Open Command Palette"
        >
          <Search className="w-3.5 h-3.5 text-foreground-tertiary group-hover:text-primary transition-colors shrink-0" />
          <span className="hidden md:inline-block">{t.topbar?.searchPlaceholder || 'Search or command...'}</span>
          <span className="hidden sm:inline-block text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface-muted text-foreground-tertiary border border-border shrink-0">
            {isMac ? '⌘K' : 'Ctrl K'}
          </span>
        </button>

        {/* Global Day / Night Theme Toggle */}
        <ThemeToggle />

        {/* UI Language Selector */}
        <LanguageSelector variant="minimal" />

        {/* Notifications Popover */}
        <NotificationCenter />

        {/* User Profile Menu */}
        <UserMenu onOpenShortcuts={onOpenShortcuts} />
      </div>
    </header>
  );
};
