import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Building2, Bot, PhoneCall, CheckSquare, Zap, ChevronRight } from 'lucide-react';

export interface FeatureItem {
  id: string;
  title: string;
  category: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  stat?: string;
  statLabel?: string;
  bullets: string[];
}

const defaultFeatures: FeatureItem[] = [
  {
    id: 'discovery',
    title: 'AI Lead Discovery Engine',
    category: 'Signal Ingestion',
    description: 'Scans 42 real-time B2B data feeds for funding rounds, leadership hires, tech stack shifts, and active RFP queries.',
    icon: Search,
    stat: '42 Feeds',
    statLabel: 'Real-Time Signals',
    bullets: ['Automatic account qualification', 'Buying intent scoring from 0 to 100', 'Direct decision-maker contact extraction'],
  },
  {
    id: 'company-intel',
    title: 'Company Intelligence Radar',
    category: 'Context Synthesis',
    description: 'Generates comprehensive 360-degree dossiers on target accounts before your sales team makes first contact.',
    icon: Building2,
    stat: '360°',
    statLabel: 'Account Dossier',
    bullets: ['Tech stack detection', 'Hiring velocity tracking', 'Competitor displacement intelligence'],
  },
  {
    id: 'voice-agent',
    title: 'Personalized Voice Agent',
    category: 'Autonomous Calls',
    description: 'Autonomous AI Voice BDR capable of holding sub-500ms conversational phone calls and qualifying prospects.',
    icon: Bot,
    stat: '<500ms',
    statLabel: 'SIP Telemetry Latency',
    bullets: ['Natural objection handling', 'Live transcription & sentiment analysis', 'Direct calendar appointment booking'],
  },
  {
    id: 'call-intel',
    title: 'Call Intelligence Analytics',
    category: 'Conversation Audit',
    description: 'Extracts exact prospect pain points, budget constraints, timeline expectations, and decision hierarchy post-call.',
    icon: PhoneCall,
    stat: '98.4%',
    statLabel: 'Extraction Accuracy',
    bullets: ['Automated Qualification scorecard', 'Objection log matrix', 'CRM field auto-sync'],
  },
  {
    id: 'qualification',
    title: 'Qualification Engine',
    category: 'Pipeline Health',
    description: 'Automated deal scoring model that dynamically adjusts opportunity priority as new interaction signals arrive.',
    icon: CheckSquare,
    stat: '3.4x',
    statLabel: 'Pipeline Velocity',
    bullets: ['Dynamic deal weight adjustment', 'Urgency & timing validation', 'Stalled deal warning alerts'],
  },
  {
    id: 'next-action',
    title: 'Next Best Action Engine',
    category: 'Execution Copilot',
    description: 'Recommends the single highest-leverage outreach step for every sales rep with 1-click execution dispatch.',
    icon: Zap,
    stat: '1-Click',
    statLabel: 'Instant Dispatch',
    bullets: ['Prioritized action queue', 'Tailored email & call briefs', 'Sequence auto-routing'],
  },
];

export interface AnimatedFeatureCarouselProps {
  features?: FeatureItem[];
  className?: string;
  autoPlay?: boolean;
}

export const AnimatedFeatureCarousel: React.FC<AnimatedFeatureCarouselProps> = ({
  features = defaultFeatures,
  className = '',
  autoPlay = true,
}) => {
  const [activeId, setActiveId] = useState<string>(features[0].id);
  const activeFeature = features.find((f) => f.id === activeId) || features[0];

  useEffect(() => {
    if (!autoPlay) return;

    const interval = setInterval(() => {
      setActiveId((currentId) => {
        const idx = features.findIndex((f) => f.id === currentId);
        return features[(idx + 1) % features.length].id;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [features, autoPlay]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Navigation Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {features.map((feat) => {
          const Icon = feat.icon;
          const isActive = feat.id === activeId;

          return (
            <button
              key={feat.id}
              onClick={() => setActiveId(feat.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-102'
                  : 'bg-surface-1 border border-border-default text-foreground-secondary hover:text-foreground hover:bg-surface-2'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{feat.title}</span>
            </button>
          );
        })}
      </div>

      {/* Feature Showcase Card */}
      <div className="p-6 rounded-2xl border border-border-default bg-surface-0 relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeFeature.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center"
          >
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-mono font-semibold">
                <activeFeature.icon className="w-3.5 h-3.5" />
                <span>{activeFeature.category}</span>
              </div>

              <h3 className="text-xl font-bold text-foreground">{activeFeature.title}</h3>
              <p className="text-small text-foreground-secondary leading-relaxed">
                {activeFeature.description}
              </p>

              <div className="space-y-2 pt-2">
                {activeFeature.bullets.map((bullet, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 text-xs text-foreground font-medium">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                    <span>{bullet}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Metric Highlight Panel */}
            <div className="lg:col-span-5 p-5 rounded-xl bg-surface-1 border border-border-subtle flex flex-col justify-center items-center text-center space-y-2 relative group">
              <div className="w-12 h-12 rounded-xl bg-primary/20 border border-primary/40 text-primary flex items-center justify-center mb-1">
                <activeFeature.icon className="w-6 h-6" />
              </div>
              <span className="text-3xl font-extrabold font-mono text-foreground tracking-tight">
                {activeFeature.stat}
              </span>
              <span className="text-caption font-semibold text-foreground-tertiary uppercase tracking-wider">
                {activeFeature.statLabel}
              </span>

              <div className="pt-3 w-full">
                <div className="w-full h-1 bg-surface-2 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-amber-400"
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 5, ease: 'linear' }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AnimatedFeatureCarousel;
