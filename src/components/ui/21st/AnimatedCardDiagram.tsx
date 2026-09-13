import React from 'react';
import { motion } from 'framer-motion';
import { Search, Database, Target, PhoneCall, CheckCircle2, Calendar } from 'lucide-react';

export interface WorkflowNode {
  id: string;
  label: string;
  sublabel?: string;
  icon: React.ComponentType<{ className?: string }>;
  status?: 'completed' | 'active' | 'pending';
}

const defaultNodes: WorkflowNode[] = [
  { id: 'discover', label: 'DISCOVER', sublabel: '42 Feeds', icon: Search, status: 'completed' },
  { id: 'enrich', label: 'ENRICH', sublabel: 'Tech & Funding', icon: Database, status: 'completed' },
  { id: 'score', label: 'SCORE', sublabel: 'Intent Signal 94', icon: Target, status: 'completed' },
  { id: 'call', label: 'CALL', sublabel: 'AI Voice Agent', icon: PhoneCall, status: 'active' },
  { id: 'qualify', label: 'QUALIFY', sublabel: 'BANT Framework', icon: CheckCircle2, status: 'pending' },
  { id: 'meeting', label: 'MEETING', sublabel: 'Calendar Booked', icon: Calendar, status: 'pending' },
];

export interface AnimatedCardDiagramProps {
  nodes?: WorkflowNode[];
  className?: string;
}

export const AnimatedCardDiagram: React.FC<AnimatedCardDiagramProps> = ({
  nodes = defaultNodes,
  className = '',
}) => {
  return (
    <div className={`p-5 rounded-xl border border-border-default bg-surface-0 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-small font-bold text-foreground flex items-center gap-2">
            <span>Autonomous Sales Loop Workflow</span>
            <span className="text-[10px] font-mono uppercase bg-primary/20 text-primary px-2 py-0.5 rounded font-semibold border border-primary/30">
              Live Flow
            </span>
          </h4>
          <p className="text-caption text-foreground-tertiary">
            Real-time pipeline progression from signal discovery to booked meeting
          </p>
        </div>
      </div>

      <div className="relative overflow-x-auto pb-2 scrollbar-none">
        <div className="flex items-center justify-between min-w-[640px] relative z-10 px-2 py-3">
          {nodes.map((node, index) => {
            const Icon = node.icon;
            const isLast = index === nodes.length - 1;

            return (
              <React.Fragment key={node.id}>
                {/* Workflow Node */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex flex-col items-center group cursor-pointer"
                >
                  <div
                    className={`w-11 h-11 rounded-xl border flex items-center justify-center transition-all duration-300 relative ${
                      node.status === 'completed'
                        ? 'bg-primary/10 border-primary/40 text-primary shadow-xs shadow-primary/20'
                        : node.status === 'active'
                        ? 'bg-amber-500/20 border-amber-500/60 text-amber-400 animate-pulse shadow-md shadow-amber-500/30'
                        : 'bg-surface-1 border-border-subtle text-foreground-tertiary'
                    }`}
                  >
                    <Icon className="w-5 h-5 group-hover:scale-110 transition-transform" />

                    {node.status === 'active' && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-400 border-2 border-surface-0 animate-ping" />
                    )}
                  </div>

                  <span className="text-[11px] font-bold tracking-wider uppercase font-mono mt-2 text-foreground">
                    {node.label}
                  </span>
                  {node.sublabel && (
                    <span className="text-[10px] text-foreground-tertiary text-center truncate max-w-[90px]">
                      {node.sublabel}
                    </span>
                  )}
                </motion.div>

                {/* Connecting Line with Animated Beam */}
                {!isLast && (
                  <div className="flex-1 mx-2 relative h-1 flex items-center justify-center">
                    <div className="w-full h-0.5 bg-border-default rounded-full overflow-hidden relative">
                      <motion.div
                        className="absolute top-0 bottom-0 w-1/2 bg-gradient-to-r from-transparent via-primary to-transparent"
                        animate={{
                          x: ['-100%', '200%'],
                        }}
                        transition={{
                          repeat: Infinity,
                          duration: 2.2,
                          ease: 'linear',
                          delay: index * 0.3,
                        }}
                      />
                    </div>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AnimatedCardDiagram;
