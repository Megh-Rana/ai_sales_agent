import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Code2, Users, DollarSign, Zap, UserCheck, ShieldAlert } from 'lucide-react';

export interface SlideTab {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  content: React.ReactNode;
}

export interface AnimatedSlideshowProps {
  tabs?: SlideTab[];
  className?: string;
}

const defaultTabs: SlideTab[] = [
  {
    id: 'overview',
    label: 'Overview',
    icon: Building2,
    content: (
      <div className="space-y-3">
        <h4 className="text-small font-bold text-foreground">ABC Technologies Enterprise Dossier</h4>
        <p className="text-xs text-foreground-secondary leading-relaxed">
          High-growth B2B SaaS enterprise with 450+ employees operating in Cloud Security & AI Workflow Automation. Primary headquarters in San Francisco, CA.
        </p>
        <div className="grid grid-cols-2 gap-2 pt-2">
          <div className="p-2.5 rounded-lg bg-surface-1 border border-border-subtle text-xs">
            <span className="text-foreground-tertiary block">Annual Revenue</span>
            <span className="font-mono font-bold text-foreground">₹120 Cr ($15M ARR)</span>
          </div>
          <div className="p-2.5 rounded-lg bg-surface-1 border border-border-subtle text-xs">
            <span className="text-foreground-tertiary block">Employee Growth</span>
            <span className="font-mono font-bold text-signal-qualified">+24% YoY</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'tech',
    label: 'Technology Stack',
    icon: Code2,
    content: (
      <div className="space-y-3">
        <h4 className="text-small font-bold text-foreground">Infrastructure & Software Stack</h4>
        <div className="flex flex-wrap gap-2 pt-1">
          {['AWS Cloud', 'Kubernetes', 'React / Next.js', 'Salesforce CRM', 'HubSpot', 'Snowflake', 'Datadog'].map(
            (tech, i) => (
              <span key={i} className="px-2.5 py-1 rounded-md bg-primary/10 border border-primary/30 text-primary text-xs font-mono font-semibold">
                {tech}
              </span>
            )
          )}
        </div>
        <p className="text-xs text-foreground-tertiary">
          Detected 3 major software contract renewals occurring within the next 60 days.
        </p>
      </div>
    ),
  },
  {
    id: 'hiring',
    label: 'Hiring Signals',
    icon: Users,
    content: (
      <div className="space-y-3">
        <h4 className="text-small font-bold text-foreground">Active Recruitment Expansion</h4>
        <p className="text-xs text-foreground-secondary">
          14 active job listings detected across Sales Engineering, Security Architecture, and Enterprise Account Executive roles.
        </p>
        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
          <span className="font-bold block">Key Leadership Hire Signal:</span>
          VP of Revenue Operations hired 12 days ago from Datadog. High intent for pipeline tooling upgrade.
        </div>
      </div>
    ),
  },
  {
    id: 'funding',
    label: 'Funding History',
    icon: DollarSign,
    content: (
      <div className="space-y-3">
        <h4 className="text-small font-bold text-foreground">Capital Raised & Backers</h4>
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs p-2 rounded bg-surface-1 border border-border-subtle">
            <span className="font-semibold text-foreground">Series B Round ($35M)</span>
            <span className="font-mono text-signal-qualified font-bold">Closed Jan 2026</span>
          </div>
          <div className="flex justify-between items-center text-xs p-2 rounded bg-surface-1 border border-border-subtle">
            <span className="text-foreground-secondary">Lead Investors</span>
            <span className="text-foreground font-medium">Sequoia Capital & Accel Partners</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'buying-signals',
    label: 'Buying Signals',
    icon: Zap,
    content: (
      <div className="space-y-3">
        <h4 className="text-small font-bold text-foreground">Active Telemetry Triggers</h4>
        <div className="space-y-1.5">
          {['Downloaded AI Sales Automation Whitepaper (3x)', 'Visited Pricing & Integration Docs twice today', 'Engineering VP searched B2B Voice AI Solutions on LinkedIn'].map(
            (signal, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs text-foreground font-medium p-2 rounded bg-surface-1">
                <Zap className="w-3.5 h-3.5 text-signal-high shrink-0" />
                <span>{signal}</span>
              </div>
            )
          )}
        </div>
      </div>
    ),
  },
  {
    id: 'decision-makers',
    label: 'Decision Makers',
    icon: UserCheck,
    content: (
      <div className="space-y-2">
        <h4 className="text-small font-bold text-foreground">Identified Stakeholders</h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 rounded bg-surface-1 border border-border-subtle">
            <div className="font-bold text-foreground">Sarah Jenkins</div>
            <div className="text-foreground-tertiary">Chief Revenue Officer</div>
            <div className="text-primary font-mono text-[10px] mt-1">Primary Decision Maker</div>
          </div>
          <div className="p-2.5 rounded bg-surface-1 border border-border-subtle">
            <div className="font-bold text-foreground">Michael Vance</div>
            <div className="text-foreground-tertiary">VP of Sales Ops</div>
            <div className="text-signal-high font-mono text-[10px] mt-1">Technical Champion</div>
          </div>
        </div>
      </div>
    ),
  },
];

export const AnimatedSlideshow: React.FC<AnimatedSlideshowProps> = ({
  tabs = defaultTabs,
  className = '',
}) => {
  const [activeTabId, setActiveTabId] = useState(tabs[0].id);
  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];

  return (
    <div className={`p-5 rounded-xl border border-border-default bg-surface-0 ${className}`}>
      {/* Slideshow Tab Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-4 border-b border-border-subtle scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.id === activeTabId;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTabId(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                  : 'text-foreground-secondary hover:text-foreground hover:bg-surface-1'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Slide Content View */}
      <div className="min-h-[160px] relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            {activeTab.content}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AnimatedSlideshow;
