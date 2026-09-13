import React from 'react';
import {
  Building2,
  Package,
  Target,
  Globe,
  PhoneCall,
  FileText,
  Edit3,
  CheckCircle2,
  ArrowRight,
  Shield,
  Layers,
} from 'lucide-react';
import { OnboardingFormData, OnboardingStepId } from '../../types/onboarding';
import { Button } from '../ui/Button';

export interface Step9ReviewProps {
  formData: OnboardingFormData;
  onEditStep: (stepId: OnboardingStepId) => void;
  onConfirmAndLaunch: () => void;
  isLaunching: boolean;
}

export const Step9Review: React.FC<Step9ReviewProps> = ({
  formData,
  onEditStep,
  onConfirmAndLaunch,
  isLaunching,
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-subtle pb-4">
        <div className="space-y-1">
          <h3 className="text-h3 font-bold text-foreground tracking-tight">
            Review Agent Calibration & Confirm
          </h3>
          <p className="text-body text-foreground-secondary leading-relaxed">
            Verify your configuration parameters below. You can edit any module before activating your autonomous sales workspace.
          </p>
        </div>

        <Button
          variant="primary"
          size="lg"
          className="shadow-md font-semibold shrink-0"
          rightIcon={<ArrowRight className="w-4 h-4" />}
          isLoading={isLaunching}
          onClick={onConfirmAndLaunch}
        >
          Build Sales Profile
        </Button>
      </div>

      {/* Review Grid: 6 Distinct Functional Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Section 1: Business Basics */}
        <div className="p-4 bg-surface-1/70 border border-border-default rounded-xl space-y-3">
          <div className="flex items-center justify-between border-b border-border-subtle pb-2">
            <div className="flex items-center gap-2 text-foreground font-semibold text-xs">
              <Building2 className="w-3.5 h-3.5 text-primary" />
              <span>Business Basics</span>
            </div>
            <button
              type="button"
              onClick={() => onEditStep(1)}
              className="text-[11px] text-primary hover:text-primary-hover font-medium flex items-center gap-1"
            >
              <Edit3 className="w-3 h-3" />
              <span>Edit</span>
            </button>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-foreground-tertiary">Company Name:</span>
              <span className="font-semibold text-foreground">{formData.business.name || 'Not specified'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground-tertiary">Website:</span>
              <span className="text-foreground font-mono truncate max-w-[200px]">
                {formData.business.website || 'Not specified'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground-tertiary">Industry:</span>
              <span className="text-foreground">{formData.business.industry}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground-tertiary">Size:</span>
              <span className="text-foreground font-mono">{formData.business.companySize} employees</span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground-tertiary">HQ Location:</span>
              <span className="text-foreground">{formData.business.location}</span>
            </div>
          </div>
        </div>

        {/* Section 2: Offerings */}
        <div className="p-4 bg-surface-1/70 border border-border-default rounded-xl space-y-3">
          <div className="flex items-center justify-between border-b border-border-subtle pb-2">
            <div className="flex items-center gap-2 text-foreground font-semibold text-xs">
              <Package className="w-3.5 h-3.5 text-primary" />
              <span>Offerings & Value Proposition ({formData.offerings.length})</span>
            </div>
            <button
              type="button"
              onClick={() => onEditStep(2)}
              className="text-[11px] text-primary hover:text-primary-hover font-medium flex items-center gap-1"
            >
              <Edit3 className="w-3 h-3" />
              <span>Edit</span>
            </button>
          </div>

          <div className="space-y-2 text-xs">
            {formData.offerings.slice(0, 2).map((offering, idx) => (
              <div key={offering.id} className="p-2 bg-surface-1 rounded-lg border border-border-subtle space-y-0.5">
                <div className="font-semibold text-foreground flex items-center justify-between">
                  <span>{offering.name || `Offering #${idx + 1}`}</span>
                  <span className="font-mono text-[10px] text-foreground-tertiary capitalize">
                    {offering.type}
                  </span>
                </div>
                <div className="text-[11px] text-foreground-secondary line-clamp-1">
                  <strong>USP:</strong> {offering.usp || 'No USP provided'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Ideal Customer Profile */}
        <div className="p-4 bg-surface-1/70 border border-border-default rounded-xl space-y-3">
          <div className="flex items-center justify-between border-b border-border-subtle pb-2">
            <div className="flex items-center gap-2 text-foreground font-semibold text-xs">
              <Target className="w-3.5 h-3.5 text-signal-high" />
              <span>Ideal Customer Profile (ICP)</span>
            </div>
            <button
              type="button"
              onClick={() => onEditStep(3)}
              className="text-[11px] text-primary hover:text-primary-hover font-medium flex items-center gap-1"
            >
              <Edit3 className="w-3 h-3" />
              <span>Edit</span>
            </button>
          </div>

          <div className="space-y-2 text-xs">
            <div>
              <div className="text-[10px] uppercase font-mono text-foreground-tertiary">Target Roles</div>
              <div className="flex flex-wrap gap-1 pt-1">
                {formData.idealCustomer.roles.slice(0, 3).map((r) => (
                  <span key={r} className="px-1.5 py-0.5 rounded bg-surface-elevated text-primary text-[11px]">
                    {r}
                  </span>
                ))}
                {formData.idealCustomer.roles.length > 3 && (
                  <span className="text-[10px] text-foreground-tertiary self-center">
                    +{formData.idealCustomer.roles.length - 3} more
                  </span>
                )}
              </div>
            </div>

            <div>
              <div className="text-[10px] uppercase font-mono text-foreground-tertiary">Buying Triggers</div>
              <div className="text-[11px] text-foreground-secondary line-clamp-2 pt-0.5">
                {formData.idealCustomer.buyingTriggers.join(' · ') || 'None selected'}
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Target Market */}
        <div className="p-4 bg-surface-1/70 border border-border-default rounded-xl space-y-3">
          <div className="flex items-center justify-between border-b border-border-subtle pb-2">
            <div className="flex items-center gap-2 text-foreground font-semibold text-xs">
              <Globe className="w-3.5 h-3.5 text-primary" />
              <span>Target Market & Boundaries</span>
            </div>
            <button
              type="button"
              onClick={() => onEditStep(4)}
              className="text-[11px] text-primary hover:text-primary-hover font-medium flex items-center gap-1"
            >
              <Edit3 className="w-3 h-3" />
              <span>Edit</span>
            </button>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-foreground-tertiary">Industries:</span>
              <span className="font-semibold text-foreground">{formData.targetMarket.industries.length} Selected</span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground-tertiary">Geographies:</span>
              <span className="text-foreground font-mono">{formData.targetMarket.regions.length} Active Zones</span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground-tertiary">Min Revenue Threshold:</span>
              <span className="text-foreground font-mono">{formData.targetMarket.revenueThreshold}</span>
            </div>
          </div>
        </div>

        {/* Section 5: Sales Preferences */}
        <div className="p-4 bg-surface-1/70 border border-border-default rounded-xl space-y-3">
          <div className="flex items-center justify-between border-b border-border-subtle pb-2">
            <div className="flex items-center gap-2 text-foreground font-semibold text-xs">
              <PhoneCall className="w-3.5 h-3.5 text-signal-qualified" />
              <span>Sales & Voice Protocol</span>
            </div>
            <button
              type="button"
              onClick={() => onEditStep(5)}
              className="text-[11px] text-primary hover:text-primary-hover font-medium flex items-center gap-1"
            >
              <Edit3 className="w-3 h-3" />
              <span>Edit</span>
            </button>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-foreground-tertiary">Primary Language:</span>
              <span className="font-mono font-semibold text-primary">{formData.salesPreferences.primaryLanguage}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground-tertiary">Agent Demeanor:</span>
              <span className="capitalize text-foreground font-semibold">{formData.salesPreferences.agentDemeanor}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground-tertiary">Calling Hours:</span>
              <span className="text-foreground font-mono">
                {formData.salesPreferences.businessHoursStart} – {formData.salesPreferences.businessHoursEnd}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground-tertiary">DNC Window Enforcement:</span>
              <span className="text-signal-qualified font-mono font-semibold">Active</span>
            </div>
          </div>
        </div>

        {/* Section 6: Knowledge Documents */}
        <div className="p-4 bg-surface-1/70 border border-border-default rounded-xl space-y-3">
          <div className="flex items-center justify-between border-b border-border-subtle pb-2">
            <div className="flex items-center gap-2 text-foreground font-semibold text-xs">
              <FileText className="w-3.5 h-3.5 text-primary" />
              <span>Collateral & Knowledge Sources</span>
            </div>
            <button
              type="button"
              onClick={() => onEditStep(6)}
              className="text-[11px] text-primary hover:text-primary-hover font-medium flex items-center gap-1"
            >
              <Edit3 className="w-3 h-3" />
              <span>Edit</span>
            </button>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-foreground-tertiary">Indexed Documents:</span>
              <span className="font-semibold text-foreground">
                {formData.documents.length > 0 ? `${formData.documents.length} Files Ready` : 'None (Optional)'}
              </span>
            </div>
            {formData.documents.slice(0, 2).map((doc) => (
              <div key={doc.id} className="text-[11px] text-foreground-secondary truncate flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-signal-qualified shrink-0" />
                <span className="truncate">{doc.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom CTA Bar */}
      <div className="p-4 rounded-xl bg-surface-1 border border-border-default flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-0.5">
          <div className="text-body font-semibold text-foreground">Ready to Launch Autonomous Sales OS?</div>
          <div className="text-caption text-foreground-tertiary">
            Confirming will persist your calibrated profile and redirect you to the live sales workspace.
          </div>
        </div>

        <Button
          variant="primary"
          size="lg"
          className="shadow-md font-semibold px-6 justify-center shrink-0"
          rightIcon={<ArrowRight className="w-4 h-4" />}
          isLoading={isLaunching}
          onClick={onConfirmAndLaunch}
        >
          Build Sales Profile
        </Button>
      </div>
    </div>
  );
};
