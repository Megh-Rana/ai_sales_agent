import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Sparkles, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type?: 'success' | 'info' | 'warning' | 'error';
  badge?: string;
}

export interface AnimatedToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
  className?: string;
}

export const AnimatedToast: React.FC<AnimatedToastProps> = ({
  toasts,
  onDismiss,
  className = '',
}) => {
  const getIcon = (type?: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />;
      case 'info':
      default:
        return <Sparkles className="w-4 h-4 text-primary shrink-0" />;
    }
  };

  return (
    <div className={`fixed bottom-6 right-6 z-[130] space-y-2.5 max-w-sm w-full pointer-events-none ${className}`}>
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="pointer-events-auto p-4 rounded-xl bg-surface-0 border border-border-default shadow-2xl flex items-start gap-3 relative overflow-hidden"
          >
            {getIcon(toast.type)}

            <div className="flex-1 min-w-0 pr-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-foreground truncate">{toast.title}</span>
                {toast.badge && (
                  <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded bg-primary/20 text-primary shrink-0">
                    {toast.badge}
                  </span>
                )}
              </div>
              {toast.description && (
                <p className="text-[11px] text-foreground-secondary leading-snug mt-0.5">
                  {toast.description}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              className="text-foreground-tertiary hover:text-foreground p-0.5 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default AnimatedToast;
