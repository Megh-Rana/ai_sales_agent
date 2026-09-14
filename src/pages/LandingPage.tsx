import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MagicTextReveal,
  AnimatedFeatureCarousel,
  MagneticButton,
  HoverGlowButton,
  ScrollAnimation,
  AnimatedCardDiagram,
  SpotlightCursor,
  AnimatedTabs,
  AnimatedContentReveal,
  AnimatedHoverPreview,
} from '../components/ui/21st';
import { Bot, ArrowRight, PhoneCall, Sparkles, CheckCircle2 } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('discovery');

  return (
    <div className="min-h-screen bg-app text-foreground relative overflow-hidden select-none">
      {/* Background Spotlight Beam */}
      <SpotlightCursor />

      {/* TOP MARKETING BAR */}
      <header className="border-b border-border-subtle bg-surface-0/80 backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold shadow-md shadow-primary/30">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="text-small font-extrabold tracking-tight font-mono text-foreground flex items-center gap-2">
              <span>VIDUR</span>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 font-semibold px-2 py-0.5 rounded border border-amber-500/30">
                PRO 3.0
              </span>
            </div>
            <div className="text-[11px] text-foreground-tertiary">AI Sales Platform</div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <HoverGlowButton
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 text-xs text-black bg-amber-400 hover:bg-amber-300 rounded-xl"
          >
            <span>Launch Workstation</span>
            <ArrowRight className="w-4 h-4" />
          </HoverGlowButton>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative pt-16 pb-20 px-6 max-w-7xl mx-auto text-center space-y-8">
        <ScrollAnimation direction="up">
          <div className="max-w-4xl mx-auto flex flex-col items-center">
            <MagicTextReveal
              text="TURN BUYING INTENT INTO CONVERSATIONS"
              className="text-3xl sm:text-5xl lg:text-6xl text-center justify-center leading-tight mb-4"
            />
            <p className="text-small sm:text-body text-foreground-secondary max-w-2xl mx-auto leading-relaxed">
              Detect real-time B2B buying signals for enterprise targets like{' '}
              <AnimatedHoverPreview
                data={{
                  name: 'Acme Technologies',
                  industry: 'Enterprise SaaS',
                  employees: '2,500+',
                  intentScore: 96,
                  recentSignal: 'Downloaded Enterprise AI Whitepaper',
                  decisionMaker: 'Sarah Jenkins',
                  role: 'VP Engineering',
                }}
              >
                Acme Corp
              </AnimatedHoverPreview>{' '}
              and deploy autonomous AI Voice BDR agents in sub-500ms phone calls.
            </p>
          </div>
        </ScrollAnimation>

        {/* HERO CALL TO ACTIONS */}
        <ScrollAnimation direction="up" delay={0.1}>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <MagneticButton
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3.5 text-sm font-bold text-black bg-amber-400 hover:bg-amber-300 shadow-xl shadow-amber-500/20"
            >
              <span>Explore Live Dashboard</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </MagneticButton>
          </div>
        </ScrollAnimation>
      </section>

      {/* FEATURE INTERACTIVE TABS */}
      <section className="py-12 px-6 max-w-5xl mx-auto border-t border-border-subtle/60">
        <AnimatedContentReveal direction="up">
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-foreground">Interactive Capabilities Matrix</h3>
          </div>
          <AnimatedTabs
            activeTab={activeTab}
            onChange={setActiveTab}
            tabs={[
              {
                id: 'discovery',
                label: 'Signal Discovery',
                content: (
                  <div className="p-6 rounded-2xl bg-surface-0 border border-border-default text-left space-y-2">
                    <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Real-time Buying Signal Ingestion
                    </h4>
                    <p className="text-xs text-foreground-secondary leading-relaxed">
                      Monitors hiring surges, executive changes, technology stack deployments, and website pricing page visits to automatically score target accounts.
                    </p>
                  </div>
                ),
              },
              {
                id: 'calling',
                label: 'Autonomous Voice BDR',
                content: (
                  <div className="p-6 rounded-2xl bg-surface-0 border border-border-default text-left space-y-2">
                    <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                      <PhoneCall className="w-4 h-4 text-amber-400" /> Sub-500ms Conversational Telephony
                    </h4>
                    <p className="text-xs text-foreground-secondary leading-relaxed">
                      Executes outbound calls, answers complex technical questions, resolves objections in real-time, and books calendar meetings automatically.
                    </p>
                  </div>
                ),
              },
              {
                id: 'intelligence',
                label: 'Revenue Analytics',
                content: (
                  <div className="p-6 rounded-2xl bg-surface-0 border border-border-default text-left space-y-2">
                    <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-blue-400" /> Pipeline Forecast & Conversion Telemetry
                    </h4>
                    <p className="text-xs text-foreground-secondary leading-relaxed">
                      Tracks intent scores, call quality metrics, qualification progress, and projected revenue metrics with real-time value updates.
                    </p>
                  </div>
                ),
              },
            ]}
          />
        </AnimatedContentReveal>
      </section>

      {/* AUTONOMOUS SALES LOOP WORKFLOW */}
      <section className="py-16 px-6 max-w-7xl mx-auto border-t border-border-subtle/60">
        <AnimatedContentReveal direction="up">
          <div className="text-center mb-10 space-y-2">
            <h2 className="text-2xl font-bold text-foreground">The 10-Step Autonomous Sales Backbone</h2>
            <p className="text-caption text-foreground-tertiary">
              Continuous progression from signal discovery to booked executive meeting
            </p>
          </div>

          <AnimatedCardDiagram className="max-w-5xl mx-auto shadow-2xl" />
        </AnimatedContentReveal>
      </section>

      {/* FEATURE CAROUSEL SHOWCASE */}
      <section className="py-16 px-6 max-w-7xl mx-auto border-t border-border-subtle/60">
        <AnimatedContentReveal direction="up">
          <div className="text-center mb-10 space-y-2">
            <h2 className="text-2xl font-bold text-foreground">Enterprise AI Capabilities</h2>
            <p className="text-caption text-foreground-tertiary">
              Click features to inspect deep telemetry and automated BDR workflows
            </p>
          </div>

          <AnimatedFeatureCarousel className="max-w-5xl mx-auto" />
        </AnimatedContentReveal>
      </section>

      {/* CTA FOOTER STRIP */}
      <footer className="py-12 px-6 border-t border-border-subtle bg-surface-0 text-center space-y-4">
        <div className="text-xs font-mono text-foreground-tertiary">
          VIDUR AI SALES PLATFORM
        </div>
        <div className="flex justify-center gap-4 text-xs text-foreground-secondary">
          <button onClick={() => navigate('/dashboard')} className="hover:text-foreground">
            Dashboard
          </button>
          <span>•</span>
          <button onClick={() => navigate('/leads/discover')} className="hover:text-foreground">
            Lead Discovery
          </button>
          <span>•</span>
          <button onClick={() => navigate('/calls')} className="hover:text-foreground">
            AI Sales Agent
          </button>
          <span>•</span>
          <button onClick={() => navigate('/analytics')} className="hover:text-foreground">
            Analytics
          </button>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
