import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { fadeIn } from '../../motion/presets';

export interface MobileNavigationProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({ isOpen, onClose }) => {
  const location = useLocation();

  useEffect(() => {
    onClose();
  }, [location.pathname]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isOpen && e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation Drawer"
          className="fixed inset-0 z-50 lg:hidden flex"
        >
          {/* Backdrop */}
          <motion.div
            variants={fadeIn}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-xs"
          />

          {/* Mobile Drawer Panel */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-72 bg-surface-0 h-full border-r border-border-default shadow-2xl z-10 flex flex-col"
          >
            <div className="absolute top-3.5 right-3 z-20">
              <button
                type="button"
                onClick={onClose}
                aria-label="Close navigation"
                className="p-1.5 text-foreground-tertiary hover:text-foreground hover:bg-surface-hover rounded-md transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <Sidebar isCollapsed={false} className="w-full border-r-0" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
