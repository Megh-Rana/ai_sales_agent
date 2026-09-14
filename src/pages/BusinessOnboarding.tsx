import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Zap,
  Target,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  FileCheck,
  RotateCcw,
  Layers,
} from 'lucide-react';
import {
  OnboardingFormData,
  OnboardingStepId,
  GeneratedBusinessProfile,
} from '../types/onboarding';
import {
  initialOnboardingData,
  sampleB2BProfileData,
  generateMockAIProfile,
  ONBOARDING_STEPS,
} from '../data/mockOnboarding';
import { OnboardingProgress } from '../components/onboarding/OnboardingProgress';
import { Step1BusinessBasics } from '../components/onboarding/Step1BusinessBasics';
import { Step2ProductsServices } from '../components/onboarding/Step2ProductsServices';
import { Step3IdealCustomer } from '../components/onboarding/Step3IdealCustomer';
import { Step4TargetMarket } from '../components/onboarding/Step4TargetMarket';
import { Step5SalesPreferences } from '../components/onboarding/Step5SalesPreferences';
import { Step6Documents } from '../components/onboarding/Step6Documents';
import { Step7AIUnderstanding } from '../components/onboarding/Step7AIUnderstanding';
import { Step8IntelligenceProfile } from '../components/onboarding/Step8IntelligenceProfile';
import { Step9Review } from '../components/onboarding/Step9Review';
import { Button } from '../components/ui/Button';

const STORAGE_KEY = 'vidur_onboarding_draft_v1';

export const BusinessOnboarding: React.FC = () => {
  const navigate = useNavigate();

  // Master Centralized State
  const [formData, setFormData] = useState<OnboardingFormData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback on corrupt storage
    }
    return initialOnboardingData;
  });

  const [currentStep, setCurrentStep] = useState<OnboardingStepId>(1);
  const [maxStepReached, setMaxStepReached] = useState<OnboardingStepId>(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);

  // Auto-scroll to top when advancing steps
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  // Auto-persist draft to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    } catch {
      // ignore storage quota errors
    }
  }, [formData]);

  // Update max reached step
  useEffect(() => {
    if (currentStep > maxStepReached) {
      setMaxStepReached(currentStep);
    }
  }, [currentStep, maxStepReached]);

  // One-click demo template filler
  const handleLoadSample = () => {
    setFormData(sampleB2BProfileData);
    setErrors({});
  };

  const handleResetForm = () => {
    setFormData(initialOnboardingData);
    setCurrentStep(1);
    setMaxStepReached(1);
    setErrors({});
    localStorage.removeItem(STORAGE_KEY);
  };

  // Step Validation logic
  const validateCurrentStep = (): boolean => {
    const errs: Record<string, string> = {};

    if (currentStep === 1) {
      if (!formData.business.name.trim()) errs.name = 'Business name is required.';
      if (!formData.business.website.trim()) {
        errs.website = 'Website URL is required.';
      } else if (!formData.business.website.startsWith('http')) {
        errs.website = 'Enter a valid URL starting with http:// or https://';
      }
      if (!formData.business.industry.trim()) errs.industry = 'Please select your industry.';
      if (!formData.business.location.trim()) errs.location = 'Headquarters location is required.';
      if (formData.business.operatingRegions.length === 0) {
        errs.operatingRegions = 'Select at least one operating region.';
      }
      if (!formData.business.description.trim()) {
        errs.description = 'Executive description is required.';
      }
    } else if (currentStep === 2) {
      if (formData.offerings.length === 0) {
        errs.offerings = 'Please add at least one product or service offering.';
      } else {
        formData.offerings.forEach((off, idx) => {
          if (!off.name.trim()) errs[`offering_${idx}_name`] = 'Offering name is required.';
          if (!off.customerProblem.trim())
            errs[`offering_${idx}_problem`] = 'Customer problem is required.';
          if (!off.usp.trim()) errs[`offering_${idx}_usp`] = 'USP is required.';
        });
      }
    } else if (currentStep === 3) {
      if (formData.idealCustomer.companySizes.length === 0) {
        errs.companySizes = 'Select at least one company size tier.';
      }
      if (formData.idealCustomer.roles.length === 0) {
        errs.roles = 'Specify at least one target decision-maker role.';
      }
      if (formData.idealCustomer.painPoints.length === 0) {
        errs.painPoints = 'Provide at least one customer pain point.';
      }
      if (formData.idealCustomer.buyingTriggers.length === 0) {
        errs.buyingTriggers = 'Select at least one high-momentum buying trigger.';
      }
    } else if (currentStep === 4) {
      if (formData.targetMarket.industries.length === 0) {
        errs.industries = 'Select at least one target industry.';
      }
      if (formData.targetMarket.regions.length === 0) {
        errs.regions = 'Select at least one target geography.';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (!validateCurrentStep()) return;

    if (currentStep === 6) {
      // Transitioning from documents to AI understanding
      setCurrentStep(7);
    } else if (currentStep < 9) {
      setCurrentStep((prev) => (prev + 1) as OnboardingStepId);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as OnboardingStepId);
    }
  };

  const handleJumpToStep = (step: OnboardingStepId) => {
    if (step <= maxStepReached || step <= currentStep) {
      setCurrentStep(step);
    }
  };

  // Completion of Step 7 AI Understanding
  const handleAISynthesisComplete = () => {
    const generated = generateMockAIProfile(formData);
    setFormData((prev) => ({ ...prev, aiProfile: generated }));
    setCurrentStep(8);
  };

  // Step 9 Confirmation
  const handleConfirmAndLaunch = () => {
    setIsLaunching(true);
    setTimeout(() => {
      setIsLaunching(false);
      navigate('/dashboard');
    }, 900);
  };

  // Derived preview calculations for right sidebar
  const currentOffering = formData.offerings[0];
  const primaryRole = formData.idealCustomer.roles[0] || 'Operations Leader';
  const primaryTrigger = formData.idealCustomer.buyingTriggers[0] || 'Facility expansion or leadership change';

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 select-none">
      {/* Top Application Context Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-subtle pb-4">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="font-mono text-primary font-bold text-xs uppercase tracking-wider">
              VIDUR AUTONOMOUS SALES PLATFORM
            </span>
            <span>·</span>
            <span className="text-xs text-foreground-tertiary">Agent Setup Wizard</span>
          </div>
          <h1 className="text-h2 font-bold text-foreground tracking-tight">
            Configure Your Autonomous Sales Agent
          </h1>
        </div>

        {/* Action Shortcuts */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleLoadSample}
            className="text-xs px-2.5 py-1 rounded-md bg-surface-1 text-foreground-secondary hover:text-foreground border border-border-subtle hover:border-border-default transition-colors flex items-center gap-1.5"
            title="Load sample B2B robotics company profile"
          >
            <Sparkles className="w-3.5 h-3.5 text-signal-high" />
            <span>Load Sample Profile</span>
          </button>
          <button
            type="button"
            onClick={handleResetForm}
            className="text-xs p-1.5 rounded-md text-foreground-tertiary hover:text-signal-urgent hover:bg-surface-elevated transition-colors"
            title="Reset form"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Persistent Linear Progress Indicator */}
      <OnboardingProgress
        currentStep={currentStep}
        maxStepReached={maxStepReached}
        onSelectStep={handleJumpToStep}
      />

      {/* Asymmetrical Layout Shell */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form Workbench (Step Viewport) */}
        <div
          className={`${
            currentStep === 7 || currentStep === 8 || currentStep === 9
              ? 'lg:col-span-12'
              : 'lg:col-span-8'
          } p-6 bg-surface-0 border border-border-default rounded-xl shadow-xs space-y-6`}
        >
          {/* Mobile Collapsible Live Calibration Bar (< 1024px) */}
          {currentStep <= 6 && (
            <div className="lg:hidden p-3 bg-surface-1 rounded-xl border border-border-default space-y-2">
              <button
                type="button"
                onClick={() => setMobilePreviewOpen((prev) => !prev)}
                className="w-full flex items-center justify-between text-xs text-foreground font-semibold"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-signal-high animate-pulse" />
                  <span>Live Agent Calibration ({formData.business.name || 'Your Agent'})</span>
                </div>
                <span className="text-[11px] text-primary font-mono font-normal">
                  {mobilePreviewOpen ? 'Hide ▲' : 'Peek ▼'}
                </span>
              </button>

              {mobilePreviewOpen && (
                <div className="pt-2 border-t border-border-subtle space-y-2 text-xs">
                  <div className="p-2.5 rounded bg-surface-elevated/70 border border-border-subtle italic text-[11px] text-foreground-secondary leading-relaxed">
                    "{formData.business.name ? `Hi David, calling from ${formData.business.name}. ` : 'Hi David, '}
                    Saw you're scaling operations at {formData.targetMarket.industries[0] || 'your facility'}..."
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-foreground-tertiary">
                    <div>Persona: <strong className="text-foreground">{primaryRole}</strong></div>
                    <div>Dialect: <strong className="text-primary font-mono">{formData.salesPreferences.primaryLanguage}</strong></div>
                  </div>
                </div>
              )}
            </div>
          )}

          {currentStep === 1 && (
            <Step1BusinessBasics
              data={formData.business}
              onChange={(up) =>
                setFormData((prev) => ({ ...prev, business: { ...prev.business, ...up } }))
              }
              errors={errors}
            />
          )}

          {currentStep === 2 && (
            <Step2ProductsServices
              offerings={formData.offerings}
              onChange={(offerings) => setFormData((prev) => ({ ...prev, offerings }))}
              errors={errors}
            />
          )}

          {currentStep === 3 && (
            <Step3IdealCustomer
              data={formData.idealCustomer}
              onChange={(up) =>
                setFormData((prev) => ({
                  ...prev,
                  idealCustomer: { ...prev.idealCustomer, ...up },
                }))
              }
              errors={errors}
            />
          )}

          {currentStep === 4 && (
            <Step4TargetMarket
              data={formData.targetMarket}
              onChange={(up) =>
                setFormData((prev) => ({
                  ...prev,
                  targetMarket: { ...prev.targetMarket, ...up },
                }))
              }
              errors={errors}
            />
          )}

          {currentStep === 5 && (
            <Step5SalesPreferences
              data={formData.salesPreferences}
              onChange={(up) =>
                setFormData((prev) => ({
                  ...prev,
                  salesPreferences: { ...prev.salesPreferences, ...up },
                }))
              }
              errors={errors}
            />
          )}

          {currentStep === 6 && (
            <Step6Documents
              documents={formData.documents}
              onChange={(documents) => setFormData((prev) => ({ ...prev, documents }))}
              errors={errors}
            />
          )}

          {currentStep === 7 && (
            <Step7AIUnderstanding
              businessName={formData.business.name}
              onComplete={handleAISynthesisComplete}
            />
          )}

          {currentStep === 8 && (
            <Step8IntelligenceProfile
              profile={formData.aiProfile || generateMockAIProfile(formData)}
              companyName={formData.business.name || 'Your Company'}
              onProceedToReview={() => setCurrentStep(9)}
              onRecalibrate={() => setCurrentStep(7)}
            />
          )}

          {currentStep === 9 && (
            <Step9Review
              formData={formData}
              onEditStep={handleJumpToStep}
              onConfirmAndLaunch={handleConfirmAndLaunch}
              isLaunching={isLaunching}
            />
          )}

          {/* Form Step Navigation Footer (Steps 1 through 6) */}
          {currentStep <= 6 && (
            <div className="pt-6 border-t border-border-subtle flex items-center justify-between gap-3">
              <Button
                variant="secondary"
                size="md"
                disabled={currentStep === 1}
                onClick={handleBack}
                leftIcon={<ArrowLeft className="w-4 h-4" />}
              >
                Back
              </Button>

              <div className="flex items-center gap-3">
                <span className="text-[11px] font-mono text-foreground-tertiary hidden sm:inline-block">
                  All changes auto-saved
                </span>

                <Button
                  variant="primary"
                  size="md"
                  onClick={handleNext}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  {currentStep === 6 ? 'Start AI Calibration' : 'Save & Continue'}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Sticky Live Agent Calibration Preview (Steps 1 to 6) */}
        {currentStep <= 6 && (
          <aside className="lg:col-span-4 space-y-4 sticky top-6">
            <div className="p-5 bg-surface-0 border border-border-default rounded-xl space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-border-subtle pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-signal-high animate-pulse" />
                  <span className="text-body font-bold text-foreground">Live Agent Calibration</span>
                </div>
                <span className="font-mono text-[10px] text-primary uppercase font-bold bg-primary-muted px-2 py-0.5 rounded border border-primary/30">
                  Real-Time
                </span>
              </div>

              {/* Dynamic Simulated Opening Hook */}
              <div className="space-y-1.5 p-3 rounded-lg bg-surface-1 border border-border-subtle text-xs">
                <div className="text-[10px] font-mono uppercase text-foreground-tertiary flex items-center gap-1">
                  <Zap className="w-3 h-3 text-signal-high" />
                  <span>Synthesized Voice Opening Hook</span>
                </div>
                <p className="text-caption text-foreground-secondary leading-relaxed italic">
                  "{formData.business.name ? `Hi David, calling from ${formData.business.name}. ` : 'Hi David, '}
                  Saw you're scaling operations at {formData.targetMarket.industries[0] || 'your facility'}. Are you still handling{' '}
                  {currentOffering?.customerProblem ? currentOffering.customerProblem.toLowerCase() : 'manual workflows'} internally?"
                </p>
              </div>

              {/* ICP Matching Target Spec */}
              <div className="space-y-2 text-xs">
                <div className="text-[10px] font-mono uppercase text-foreground-tertiary">
                  Target Account Archetype
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-foreground-tertiary">Target Persona:</span>
                    <span className="font-semibold text-foreground truncate max-w-[150px]">
                      {primaryRole}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground-tertiary">Primary Trigger:</span>
                    <span className="text-signal-high font-medium truncate max-w-[150px]">
                      {primaryTrigger}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground-tertiary">Dialing Dialect:</span>
                    <span className="font-mono text-primary font-semibold">
                      {formData.salesPreferences.primaryLanguage}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground-tertiary">Collateral Indexed:</span>
                    <span className="text-foreground font-mono">
                      {formData.documents.length} Files Ready
                    </span>
                  </div>
                </div>
              </div>

              {/* Ready State */}
              <div className="p-3 bg-surface-1/60 rounded-lg border border-border-subtle flex items-center gap-2.5 text-xs text-foreground-secondary">
                <ShieldCheck className="w-4 h-4 text-signal-qualified shrink-0" />
                <span>
                  Telemetry ready. Complete step 6 to initiate autonomous profile compilation.
                </span>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};

export default BusinessOnboarding;
