import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, CornerDownLeft, Command, Zap, Target, PhoneCall, LayoutDashboard, Users, CalendarCheck, BarChart3, Briefcase, Settings, ShieldAlert, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { mockCommandItems, CommandItem } from '../../services/mockShellData';
import { scaleIn, fadeIn } from '../../motion/presets';

export interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onActionTrigger?: (actionKey: string) => void;
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({ isOpen, onClose, onActionTrigger }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();
  const listRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);

  const filteredItems = mockCommandItems.filter((item) => {
    const q = query.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      (item.subtitle && item.subtitle.toLowerCase().includes(q)) ||
      item.category.toLowerCase().includes(q)
    );
  });

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (itemRefs.current[selectedIndex]) {
      itemRefs.current[selectedIndex]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [selectedIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < filteredItems.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredItems.length - 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          handleExecute(filteredItems[selectedIndex]);
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex, onClose]);

  const handleExecute = (item: CommandItem) => {
    onClose();
    if (item.path) {
      navigate(item.path);
    } else if (item.actionKey && onActionTrigger) {
      onActionTrigger(item.actionKey);
    }
  };

  const getItemIcon = (item: CommandItem) => {
    if (item.category === 'Actions') {
      if (item.id.includes('act-1')) return <Zap className="w-3.5 h-3.5 text-signal-high" />;
      if (item.id.includes('act-2')) return <Target className="w-3.5 h-3.5 text-primary" />;
      if (item.id.includes('act-3')) return <PhoneCall className="w-3.5 h-3.5 text-signal-qualified" />;
      return <Command className="w-3.5 h-3.5 text-primary" />;
    }
    if (item.category === 'Opportunities') {
      return <Users className="w-3.5 h-3.5 text-signal-high" />;
    }
    if (item.category === 'Cadences') {
      return <Target className="w-3.5 h-3.5 text-signal-qualified" />;
    }
    if (item.path === '/dashboard') return <LayoutDashboard className="w-3.5 h-3.5 text-foreground-tertiary" />;
    if (item.path === '/leads') return <Users className="w-3.5 h-3.5 text-foreground-tertiary" />;
    if (item.path === '/campaigns') return <Target className="w-3.5 h-3.5 text-foreground-tertiary" />;
    if (item.path === '/calls') return <PhoneCall className="w-3.5 h-3.5 text-foreground-tertiary" />;
    if (item.path === '/follow-ups') return <CalendarCheck className="w-3.5 h-3.5 text-foreground-tertiary" />;
    if (item.path === '/analytics') return <BarChart3 className="w-3.5 h-3.5 text-foreground-tertiary" />;
    if (item.path === '/business') return <Briefcase className="w-3.5 h-3.5 text-foreground-tertiary" />;
    if (item.path === '/settings') return <Settings className="w-3.5 h-3.5 text-foreground-tertiary" />;
    if (item.path === '/admin') return <ShieldAlert className="w-3.5 h-3.5 text-foreground-tertiary" />;
    return <Command className="w-3.5 h-3.5 text-foreground-tertiary" />;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-20 px-4">
          {/* Backdrop */}
          <motion.div
            variants={fadeIn}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={onClose}
            className="fixed inset-0 bg-black/60"
          />

          {/* Command Palette Modal */}
          <motion.div
            variants={scaleIn}
            initial="initial"
            animate="animate"
            exit="exit"
            className="relative w-full max-w-xl bg-surface border border-border-strong rounded-xl shadow-2xl z-10 overflow-hidden flex flex-col max-h-[85vh]"
          >
            {/* Input Header */}
            <div className="flex items-center px-4 border-b border-border-subtle shrink-0">
              <Search className="w-4 h-4 text-foreground-tertiary mr-3 shrink-0" />
              <input
                type="text"
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search opportunities, cadences, or type a command..."
                className="w-full bg-transparent text-foreground text-body py-3.5 focus:outline-none placeholder:text-foreground-tertiary"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="p-1 text-foreground-tertiary hover:text-foreground mr-2"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface-elevated text-foreground-tertiary border border-border-subtle select-none">
                ESC
              </span>
            </div>

            {/* Command Results List */}
            <div ref={listRef} className="p-2 overflow-y-auto max-h-[420px] space-y-1">
              {filteredItems.length === 0 ? (
                <div className="py-12 px-6 text-center space-y-2">
                  <div className="text-body font-medium text-foreground">No matching sales records found</div>
                  <p className="text-caption text-foreground-tertiary">
                    No opportunities, cadences, or commands match "{query}". Try searching "Acme", "Cadence", or "Calls".
                  </p>
                </div>
              ) : (
                filteredItems.map((item, idx) => {
                  const isSelected = idx === selectedIndex;
                  return (
                    <button
                      key={item.id}
                      ref={(el) => (itemRefs.current[idx] = el)}
                      onClick={() => handleExecute(item)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs transition-colors text-left ${
                        isSelected
                          ? 'bg-primary-muted text-foreground border border-primary/40 font-medium'
                          : 'text-foreground-secondary hover:bg-surface-hover hover:text-foreground border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="p-1.5 rounded-md bg-surface-elevated text-foreground-tertiary shrink-0">
                          {getItemIcon(item)}
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-foreground truncate">{item.title}</span>
                            {item.intentScore !== undefined && (
                              <span className="px-1.5 py-0.2 text-[10px] font-mono font-bold rounded bg-signal-high-muted text-signal-high border border-signal-high/30">
                                {item.intentScore} Intent
                              </span>
                            )}
                          </div>
                          {item.subtitle && (
                            <div className="text-caption text-foreground-tertiary truncate">{item.subtitle}</div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 ml-3">
                        <span className="text-[10px] font-mono uppercase text-foreground-tertiary px-1.5 py-0.5 rounded bg-surface-1">
                          {item.category}
                        </span>
                        {item.shortcut && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface-elevated text-foreground-tertiary border border-border-subtle">
                            {item.shortcut}
                          </span>
                        )}
                        {isSelected && <CornerDownLeft className="w-3.5 h-3.5 text-primary shrink-0" />}
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Footer hints */}
            <div className="px-4 py-2.5 bg-surface-1 border-t border-border-subtle flex items-center justify-between text-[11px] text-foreground-tertiary shrink-0 select-none">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.2 bg-surface-elevated rounded border border-border-subtle font-mono text-[10px]">↑↓</kbd> Navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.2 bg-surface-elevated rounded border border-border-subtle font-mono text-[10px]">↵</kbd> Execute
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.2 bg-surface-elevated rounded border border-border-subtle font-mono text-[10px]">esc</kbd> Dismiss
                </span>
              </div>
              <div className="font-mono text-primary font-semibold text-[10px] tracking-wide">
                VIDUR PIPELINE SEARCH
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
