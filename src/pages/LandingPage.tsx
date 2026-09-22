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
import { useI18n } from '../i18n/i18nContext';
import { LanguageSelector } from '../components/ui/LanguageSelector';
import { useAuth } from '../context/AuthContext';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useI18n();
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('discovery');

  const handleLaunchWorkstation = (targetPath = '/dashboard') => {
    if (isAuthenticated) {
      navigate(targetPath);
    } else {
      navigate(`/login?redirect=${encodeURIComponent(targetPath)}`);
    }
  };

  return (
    <div className="min-h-screen bg-app text-foreground relative overflow-hidden select-none">
      {/* Background Spotlight Beam */}
      <SpotlightCursor />

      {/* TOP MARKETING BAR */}
      <header className="border-b border-border-subtle bg-surface-0/80 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3 cursor-pointer" onClick={() => handleLaunchWorkstation('/dashboard')}>
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold shadow-md shadow-primary/30">
            <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <div className="text-xs sm:text-small font-extrabold tracking-tight font-mono text-foreground flex items-center gap-2">
              <span>VIDUR</span>
              <span className="text-[9px] sm:text-[10px] bg-pastelPetal/20 text-pastelPetal font-semibold px-1.5 sm:px-2 py-0.5 rounded border border-pastelPetal/40">
                PRO 3.0
              </span>
            </div>
            <div className="text-[10px] sm:text-[11px] text-foreground-tertiary">AI Sales Platform</div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageSelector variant="minimal" />
          <HoverGlowButton
            onClick={() => handleLaunchWorkstation('/dashboard')}
            className="px-3 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-xs text-white bg-thistle hover:bg-thistle/90 rounded-xl font-semibold"
          >
            <span className="hidden sm:inline">Launch Workstation</span>
            <span className="sm:hidden">Launch</span>
            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </HoverGlowButton>
        </div>
      </header>

      {/* HERO SECTION - Clean, minimal, above the fold */}
      <section className="relative min-h-[85vh] flex items-center justify-center px-4 sm:px-6 max-w-6xl mx-auto text-center">
        <ScrollAnimation direction="up">
          <div className="max-w-4xl mx-auto flex flex-col items-center space-y-6 sm:space-y-8">
            <MagicTextReveal
              text={t.landing.heroTitle}
              className="text-2xl sm:text-4xl lg:text-5xl xl:text-6xl text-center justify-center leading-tight font-bold"
            />
            <p className="text-sm sm:text-base lg:text-lg text-foreground-secondary max-w-2xl mx-auto leading-relaxed">
              {t.landing.heroDescription}
            </p>

            {/* HERO CALL TO ACTION */}
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 pt-4">
              <MagneticButton
                onClick={() => handleLaunchWorkstation('/dashboard')}
                className="px-5 sm:px-7 py-3 sm:py-4 text-sm sm:text-base font-bold text-white bg-thistle hover:bg-thistle/90 shadow-xl shadow-thistle/20"
              >
                <span>{t.landing.exploreDashboard}</span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
              </MagneticButton>
            </div>

            {/* Scroll indicator */}
            <div className="pt-8 sm:pt-12 animate-bounce">
              <div className="w-6 h-10 rounded-full border-2 border-border-strong flex items-start justify-center p-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              </div>
            </div>
          </div>
        </ScrollAnimation>
      </section>

      {/* FEATURE INTERACTIVE TABS - Now below fold for clean hero */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 max-w-5xl mx-auto border-t border-border-subtle/60">
        <AnimatedContentReveal direction="up">
          <div className="text-center mb-8 sm:mb-10 space-y-2">
            <h3 className="text-xl sm:text-2xl font-bold text-foreground">{t.landing.interactiveCapabilities}</h3>
            <p className="text-xs sm:text-sm text-foreground-tertiary max-w-xl mx-auto">
              Explore our core capabilities powering autonomous B2B sales
            </p>
          </div>
          <AnimatedTabs
            activeTab={activeTab}
            onChange={setActiveTab}
            tabs={[
              {
                id: 'discovery',
                label: t.landing.capabilities.discovery.title,
                content: (
                  <div className="p-5 sm:p-7 rounded-2xl bg-surface-0 border border-icyBlue/30 text-left space-y-3">
                    <h4 className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-icyBlue" /> {t.landing.capabilities.discovery.heading}
                    </h4>
                    <p className="text-xs sm:text-sm text-foreground-secondary leading-relaxed">
                      {t.landing.capabilities.discovery.description}
                    </p>
                  </div>
                ),
              },
              {
                id: 'calling',
                label: t.landing.capabilities.calling.title,
                content: (
                  <div className="p-5 sm:p-7 rounded-2xl bg-surface-0 border border-pastelPetal/30 text-left space-y-3">
                    <h4 className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
                      <PhoneCall className="w-4 h-4 sm:w-5 sm:h-5 text-pastelPetal" /> {t.landing.capabilities.calling.heading}
                    </h4>
                    <p className="text-xs sm:text-sm text-foreground-secondary leading-relaxed">
                      {t.landing.capabilities.calling.description}
                    </p>
                  </div>
                ),
              },
              {
                id: 'intelligence',
                label: t.landing.capabilities.intelligence.title,
                content: (
                  <div className="p-5 sm:p-7 rounded-2xl bg-surface-0 border border-skyBlue/30 text-left space-y-3">
                    <h4 className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
                      <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-skyBlue" /> {t.landing.capabilities.intelligence.heading}
                    </h4>
                    <p className="text-xs sm:text-sm text-foreground-secondary leading-relaxed">
                      {t.landing.capabilities.intelligence.description}
                    </p>
                  </div>
                ),
              },
            ]}
          />
        </AnimatedContentReveal>
      </section>

      {/* AUTONOMOUS SALES LOOP WORKFLOW */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 max-w-7xl mx-auto border-t border-border-subtle/60">
        <AnimatedContentReveal direction="up">
          <div className="text-center mb-10 sm:mb-14 space-y-2 sm:space-y-3">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">{t.landing.workflow.title}</h2>
            <p className="text-xs sm:text-sm text-foreground-tertiary max-w-2xl mx-auto">
              {t.landing.workflow.subtitle}
            </p>
          </div>

          <AnimatedCardDiagram className="max-w-5xl mx-auto shadow-2xl" />
        </AnimatedContentReveal>
      </section>

      {/* FEATURE CAROUSEL SHOWCASE */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 max-w-7xl mx-auto border-t border-border-subtle/60">
        <AnimatedContentReveal direction="up">
          <div className="text-center mb-10 sm:mb-14 space-y-2 sm:space-y-3">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">{t.landing.features.title}</h2>
            <p className="text-xs sm:text-sm text-foreground-tertiary max-w-2xl mx-auto">
              {t.landing.features.subtitle}
            </p>
          </div>

          <AnimatedFeatureCarousel className="max-w-5xl mx-auto" />
        </AnimatedContentReveal>
      </section>

      {/* CTA FOOTER STRIP */}
      <footer className="py-8 sm:py-12 px-4 sm:px-6 border-t border-border-subtle bg-surface-0 text-center space-y-4">
        <div className="text-xs font-mono text-foreground-tertiary">
          VIDUR AI SALES PLATFORM
        </div>
        <div className="flex flex-wrap justify-center gap-3 sm:gap-4 text-xs text-foreground-secondary">
          <button onClick={() => handleLaunchWorkstation('/dashboard')} className="hover:text-foreground transition-colors">
            {t.navigation.dashboard}
          </button>
          <span>•</span>
          <button onClick={() => handleLaunchWorkstation('/leads/discover')} className="hover:text-foreground transition-colors">
            {t.navigation.leads}
          </button>
          <span>•</span>
          <button onClick={() => handleLaunchWorkstation('/calls')} className="hover:text-foreground transition-colors">
            {t.navigation.calls}
          </button>
          <span>•</span>
          <button onClick={() => handleLaunchWorkstation('/analytics')} className="hover:text-foreground transition-colors">
            {t.navigation.analytics}
          </button>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
