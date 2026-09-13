import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { GlobalSearch } from './GlobalSearch';
import { MobileNavigation } from './MobileNavigation';
import { KeyboardShortcutsModal } from './KeyboardShortcutsModal';
import { PageContainer } from './PageContainer';
import { SpotlightCursor, AnimatedDock } from '../ui/21st';

export interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('vidur_sidebar_collapsed') === 'true';
  });

  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('vidur_sidebar_collapsed', String(next));
      return next;
    });
  };

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
    <div className="min-h-screen bg-background text-foreground flex overflow-hidden">
      {/* Desktop Persistent Sidebar */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
        className="hidden lg:flex"
      />

      {/* Mobile Navigation Drawer */}
      <MobileNavigation isOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* Top Header */}
        <TopBar
          onOpenSearch={() => setSearchOpen(true)}
          onOpenMobileNav={() => setMobileNavOpen(true)}
          onOpenShortcuts={() => setShortcutsOpen(true)}
        />

        {/* Page Content Container */}
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

      {/* 21st.dev Ambient Spotlight Cursor & Quick Dock */}
      <SpotlightCursor />
      <AnimatedDock />
    </div>
  );
};
