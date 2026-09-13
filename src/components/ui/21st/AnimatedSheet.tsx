import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export interface AnimatedSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  side?: 'right' | 'left' | 'bottom';
  className?: string;
}

export const AnimatedSheet: React.FC<AnimatedSheetProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  side = 'right',
  className = '',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isOpen && e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const getVariants = () => {
    switch (side) {
      case 'left':
        return { initial: { x: '-100%' }, animate: { x: 0 }, exit: { x: '-100%' } };
      case 'bottom':
        return { initial: { y: '100%' }, animate: { y: 0 }, exit: { y: '100%' } };
      case 'right':
      default:
        return { initial: { x: '100%' }, animate: { x: 0 }, exit: { x: '100%' } };
    }
  };

  const getPositionClass = () => {
    switch (side) {
      case 'left':
        return 'top-0 left-0 bottom-0 w-full max-w-md';
      case 'bottom':
        return 'bottom-0 left-0 right-0 max-h-[85vh] rounded-t-2xl';
      case 'right':
      default:
        return 'top-0 right-0 bottom-0 w-full max-w-md';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120] overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
          />

          {/* Drawer Container */}
          <motion.div
            variants={getVariants()}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className={`fixed ${getPositionClass()} bg-surface-0 border-l border-border-default shadow-2xl flex flex-col z-10 ${className}`}
          >
            {/* Header */}
            {(title || description) && (
              <div className="px-5 py-4 border-b border-border-subtle flex items-start justify-between">
                <div>
                  {title && <h3 className="text-h3 font-bold text-foreground">{title}</h3>}
                  {description && <p className="text-xs text-foreground-tertiary mt-0.5">{description}</p>}
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-foreground-tertiary hover:text-foreground hover:bg-surface-1 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Body */}
            <div className="p-5 flex-1 overflow-y-auto">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AnimatedSheet;
