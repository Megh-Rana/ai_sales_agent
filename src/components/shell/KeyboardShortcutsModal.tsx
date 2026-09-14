import React from 'react';
import { Modal } from '../ui/Modal';

export interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({ isOpen, onClose }) => {
  const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
  const modKey = isMac ? '⌘' : 'Ctrl';

  const shortcuts = [
    { key: `${modKey} + K`, description: 'Open Global Search & Command Palette', category: 'General' },
    { key: 'Esc', description: 'Close active popovers, command palette, or modal', category: 'General' },
    { key: '?', description: 'Open this Keyboard Shortcuts cheat sheet', category: 'General' },
    { key: 'B', description: 'Jump to Overview Dashboard', category: 'Navigation' },
    { key: 'L', description: 'Jump to Opportunities (Leads)', category: 'Navigation' },
    { key: 'C', description: 'Jump to Outreach Cadences (Campaigns)', category: 'Navigation' },
    { key: 'F', description: 'Jump to Follow-ups Queue', category: 'Navigation' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Keyboard Shortcuts"
      subtitle="Rapidly navigate the Vidur AI Sales Platform without leaving your keyboard"
    >
      <div className="space-y-2.5">
        {shortcuts.map((sc, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between p-2.5 bg-surface-1 border border-border-subtle rounded-lg text-xs hover:border-border-default transition-colors"
          >
            <span className="text-foreground-secondary">{sc.description}</span>
            <kbd className="font-mono font-bold px-2 py-1 bg-surface-elevated text-primary rounded border border-border-default shadow-xs text-[11px]">
              {sc.key}
            </kbd>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-3 border-t border-border-subtle text-[11px] text-foreground-tertiary text-center">
        Shortcuts are disabled while typing in text inputs or forms.
      </div>
    </Modal>
  );
};
