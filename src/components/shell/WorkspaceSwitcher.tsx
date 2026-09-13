import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, ChevronDown, Check, Settings } from 'lucide-react';
import { mockWorkspaces, Workspace } from '../../services/mockShellData';
import { useNavigate } from 'react-router-dom';
import { Tooltip } from '../ui/Tooltip';

export interface WorkspaceSwitcherProps {
  isCollapsed?: boolean;
}

export const WorkspaceSwitcher: React.FC<WorkspaceSwitcherProps> = ({ isCollapsed = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [workspaces, setWorkspaces] = useState<Workspace[]>(mockWorkspaces);
  const current = workspaces.find((w) => w.isCurrent) || workspaces[0];
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isOpen && e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleSelect = (id: string) => {
    setWorkspaces((prev) =>
      prev.map((w) => ({
        ...w,
        isCurrent: w.id === id,
      }))
    );
    setIsOpen(false);
  };

  if (isCollapsed) {
    return (
      <div className="px-2 py-2 flex justify-center">
        <Tooltip content={`${current.name} (${current.type})`} position="right">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Switch Workspace"
            className="w-9 h-9 rounded-lg bg-surface-1 border border-border-default flex items-center justify-center text-primary font-bold hover:bg-surface-elevated transition-colors"
          >
            <Building2 className="w-4 h-4 text-primary" />
          </button>
        </Tooltip>
      </div>
    );
  }

  return (
    <div className="relative px-3 py-2">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Switch Workspace"
        className="w-full flex items-center justify-between p-2.5 rounded-lg bg-surface-1 hover:bg-surface-elevated border border-border-subtle hover:border-border-default transition-all duration-150 text-left group select-none"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-md bg-primary-muted border border-primary/30 flex items-center justify-center shrink-0">
            <Building2 className="w-4 h-4 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-small font-semibold text-foreground truncate">{current.name}</div>
            <div className="text-caption text-foreground-tertiary truncate">{current.type}</div>
          </div>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-foreground-tertiary group-hover:text-foreground transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop click dismiss */}
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="absolute left-3 right-3 top-full mt-1 z-50 bg-surface border border-border-strong rounded-xl shadow-2xl p-1.5 space-y-1"
            >
              <div className="px-2.5 py-1 text-[10px] font-mono uppercase font-semibold text-foreground-tertiary">
                Switch Sales Workspace
              </div>

              {workspaces.map((ws) => (
                <button
                  key={ws.id}
                  onClick={() => handleSelect(ws.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-md text-xs transition-colors text-left ${
                    ws.isCurrent
                      ? 'bg-primary-muted text-primary font-semibold'
                      : 'text-foreground-secondary hover:text-foreground hover:bg-surface-hover'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="truncate font-medium text-foreground">{ws.name}</div>
                    <div className="text-[10px] text-foreground-tertiary">{ws.plan} · {ws.type}</div>
                  </div>
                  {ws.isCurrent && <Check className="w-3.5 h-3.5 text-primary shrink-0" />}
                </button>
              ))}

              <div className="pt-1 border-t border-border-subtle flex flex-col gap-0.5">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    navigate('/settings/business');
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs text-foreground-secondary hover:text-foreground hover:bg-surface-hover transition-colors text-left"
                >
                  <Settings className="w-3.5 h-3.5 text-foreground-tertiary" />
                  <span>Workspace Settings</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
