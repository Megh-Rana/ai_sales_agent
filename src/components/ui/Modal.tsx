import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { scaleIn, fadeIn } from '../../motion/presets';
import { Button } from './Button';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  maxWidth = 'md',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            variants={fadeIn}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={onClose}
            className="fixed inset-0 bg-black/60"
          />

          {/* Modal Container */}
          <motion.div
            variants={scaleIn}
            initial="initial"
            animate="animate"
            exit="exit"
            className={`relative w-full ${maxWidthClasses[maxWidth]} bg-surface border border-border-strong rounded-xl shadow-2xl z-10 flex flex-col max-h-[90vh] overflow-hidden`}
          >
            {/* Header */}
            {title && (
              <div className="flex items-start justify-between p-5 border-b border-border-subtle shrink-0">
                <div>
                  <h3 className="text-h3 font-semibold text-foreground">{title}</h3>
                  {subtitle && <p className="text-caption mt-0.5">{subtitle}</p>}
                </div>
                <Button variant="ghost" size="sm" onClick={onClose} className="p-1 text-foreground-tertiary">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}

            {/* Body */}
            <div className="p-5 overflow-y-auto flex-1">{children}</div>

            {/* Footer */}
            {footer && (
              <div className="flex items-center justify-end gap-3 p-4 bg-surface-1 border-t border-border-subtle shrink-0">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
