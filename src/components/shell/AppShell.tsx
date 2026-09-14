import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { TopBar } from './TopBar';
import { GlobalSearch } from './GlobalSearch';
import { KeyboardShortcutsModal } from './KeyboardShortcutsModal';
import { PageContainer } from './PageContainer';
import { SpotlightCursor, AnimatedDock } from '../ui/21st';

export interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore shortcut listeners if focused in an input/textarea element
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      // Cmd+K / Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
        return;
      }

      // Single Key Shortcuts (when no modifier key is pressed)
      if (!e.metaKey && !e.ctrlKey && !e.altKey) {
        const key = e.key.toLowerCase();
        if (key === 'b') {
          e.preventDefault();
          navigate('/dashboard');
        } else if (key === 'l') {
          e.preventDefault();
          navigate('/leads');
        } else if (key === 'c') {
          e.preventDefault();
          navigate('/campaigns');
        } else if (key === 'f') {
          e.preventDefault();
          navigate('/follow-ups');
        } else if (e.key === '?') {
          e.preventDefault();
          setShortcutsOpen(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col overflow-hidden">
      {/* Top Header */}
      <TopBar
        onOpenSearch={() => setSearchOpen(true)}
        onOpenMobileNav={() => {}}
        onOpenShortcuts={() => setShortcutsOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 overflow-y-auto pb-20">
        <PageContainer key={location.pathname}>{children}</PageContainer>
      </div>

      {/* Global Command Palette */}
      <GlobalSearch
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onActionTrigger={(actionKey) => {
          if (actionKey === 'shortcuts') {
            setShortcutsOpen(true);
          }
        }}
      />

      {/* Keyboard Shortcuts Help Modal */}
      <KeyboardShortcutsModal isOpen={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />

      {/* Ambient Spotlight Cursor & Navigation Dock */}
      <SpotlightCursor />
      <AnimatedDock />
    </div>
  );
};

