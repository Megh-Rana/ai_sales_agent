import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, PhoneCall, UserCheck, Building, Sparkles, ArrowRight, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export interface CommandItem {
  id: string;
  label: string;
  category: 'Leads' | 'Actions' | 'Navigation' | 'AI Calling';
  shortcut?: string;
  icon?: React.ReactNode;
  action: () => void;
}

export interface AnimatedCommandMenuProps {
  isOpen: boolean;
  onClose: () => void;
  commands?: CommandItem[];
}

export const AnimatedCommandMenu: React.FC<AnimatedCommandMenuProps> = ({
  isOpen,
  onClose,
  commands,
}) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const defaultCommands: CommandItem[] = [
    {
      id: 'ai-call',
      label: 'Start AI Sales Calling Session',
      category: 'AI Calling',
      shortcut: '⌘ Shift C',
      icon: <PhoneCall className="w-4 h-4 text-emerald-400" />,
      action: () => {
        navigate('/ai-calling');
        onClose();
      },
    },
    {
      id: 'lead-disc',
      label: 'Discover High Intent Leads',
      category: 'Leads',
      shortcut: '⌘ L',
      icon: <UserCheck className="w-4 h-4 text-blue-400" />,
      action: () => {
        navigate('/leads');
        onClose();
      },
    },
    {
      id: 'company-res',
      label: 'Run Company Intelligence Research',
      category: 'Actions',
      shortcut: '⌘ R',
      icon: <Building className="w-4 h-4 text-purple-400" />,
      action: () => {
        navigate('/opportunities');
        onClose();
      },
    },
    {
      id: 'analytics',
      label: 'Open Revenue Analytics Dashboard',
      category: 'Navigation',
      shortcut: '⌘ A',
      icon: <Sparkles className="w-4 h-4 text-amber-400" />,
      action: () => {
        navigate('/analytics');
        onClose();
      },
    },
  ];

  const activeCommands = commands || defaultCommands;

  const filteredCommands = activeCommands.filter(
    (c) =>
      c.label.toLowerCase().includes(query.toLowerCase()) ||
      c.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Dialog Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-xl bg-surface-0 border border-border-default rounded-2xl shadow-2xl overflow-hidden z-10"
          >
            {/* Search Header */}
            <div className="flex items-center px-4 py-3.5 border-b border-border-subtle gap-3">
              <Search className="w-5 h-5 text-foreground-tertiary shrink-0" />
              <input
                type="text"
                autoFocus
                placeholder="Type a command or search leads, actions, calls..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-transparent text-foreground placeholder-foreground-tertiary text-sm outline-none font-medium"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="p-1 hover:bg-surface-1 rounded text-foreground-tertiary"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface-elevated text-foreground-tertiary border border-border-subtle shrink-0">
                ESC
              </span>
            </div>

            {/* Results List */}
            <div className="max-h-80 overflow-y-auto p-2 space-y-1">
              {filteredCommands.length === 0 ? (
                <div className="p-8 text-center text-xs text-foreground-tertiary">
                  No commands matching "{query}"
                </div>
              ) : (
                filteredCommands.map((cmd) => (
                  <button
                    key={cmd.id}
                    onClick={cmd.action}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-primary/10 hover:text-primary transition-all text-left group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-1.5 rounded-lg bg-surface-1 group-hover:bg-primary/20 shrink-0">
                        {cmd.icon || <Sparkles className="w-4 h-4 text-primary" />}
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-semibold text-foreground group-hover:text-primary block truncate">
                          {cmd.label}
                        </span>
                        <span className="text-[10px] font-mono text-foreground-tertiary block">
                          {cmd.category}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {cmd.shortcut && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface-1 text-foreground-tertiary border border-border-subtle group-hover:border-primary/30">
                          {cmd.shortcut}
                        </span>
                      )}
                      <ArrowRight className="w-3.5 h-3.5 text-foreground-tertiary group-hover:text-primary group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </button>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2 bg-surface-1/40 border-t border-border-subtle text-[11px] text-foreground-tertiary flex items-center justify-between">
              <span>Navigation tip: use arrow keys or click to select</span>
              <span className="font-mono text-[10px]">Vidur Platform v3.0</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AnimatedCommandMenu;
