import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building, Sparkles, User, TrendingUp, CheckCircle2 } from 'lucide-react';

export interface HoverPreviewData {
  name: string;
  industry?: string;
  employees?: string;
  intentScore?: number;
  recentSignal?: string;
  decisionMaker?: string;
  role?: string;
}

export interface AnimatedHoverPreviewProps {
  children: React.ReactNode;
  data: HoverPreviewData;
  className?: string;
}

export const AnimatedHoverPreview: React.FC<AnimatedHoverPreviewProps> = ({
  children,
  data,
  className = '',
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`relative inline-block ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Trigger Link/Element */}
      <span className="underline decoration-primary/40 underline-offset-4 font-semibold text-foreground hover:text-primary transition-colors cursor-pointer">
        {children}
      </span>

      {/* Popover Preview Card */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute left-0 bottom-full mb-2 w-72 bg-surface-0 border border-border-default rounded-2xl shadow-2xl p-4 z-50 pointer-events-none"
          >
            <div className="flex items-start justify-between gap-2 pb-3 border-b border-border-subtle">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-primary" />
                  <span className="text-xs font-bold text-foreground truncate">{data.name}</span>
                </div>
                {data.industry && (
                  <span className="text-[10px] text-foreground-tertiary block mt-0.5">
                    {data.industry} {data.employees ? `• ${data.employees}` : ''}
                  </span>
                )}
              </div>
              {data.intentScore !== undefined && (
                <div className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono font-bold shrink-0">
                  {data.intentScore}% INTENT
                </div>
              )}
            </div>

            <div className="pt-3 space-y-2 text-xs">
              {data.recentSignal && (
                <div className="flex items-start gap-2 text-foreground-secondary">
                  <TrendingUp className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span className="text-[11px] leading-tight">
                    <strong className="text-foreground font-semibold">Signal:</strong> {data.recentSignal}
                  </span>
                </div>
              )}

              {data.decisionMaker && (
                <div className="flex items-center gap-2 text-foreground-secondary">
                  <User className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span className="text-[11px] truncate">
                    <strong className="text-foreground font-semibold">Contact:</strong> {data.decisionMaker}{' '}
                    {data.role ? `(${data.role})` : ''}
                  </span>
                </div>
              )}

              <div className="pt-1 flex items-center gap-1 text-[10px] font-mono text-emerald-400 font-medium">
                <CheckCircle2 className="w-3 h-3" />
                <span>AI Verified Opportunity</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AnimatedHoverPreview;
