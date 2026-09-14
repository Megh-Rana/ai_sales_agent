import React, { useState } from 'react';
import { Target, Users, Zap, Plus, X, Check, Building2, Flame } from 'lucide-react';
import { IdealCustomerData, CompanySizeTier } from '../../types/onboarding';

export interface Step3IdealCustomerProps {
  data: IdealCustomerData;
  onChange: (updated: Partial<IdealCustomerData>) => void;
  errors: Record<string, string>;
}

const COMPANY_SIZE_TIERS: { value: CompanySizeTier; label: string; desc: string }[] = [
  { value: '1-10', label: 'Micro (1–10)', desc: 'Seed & Early Founders' },
  { value: '11-50', label: 'Small (11–50)', desc: 'Early Growth Stage' },
  { value: '51-200', label: 'Mid-Market (51–200)', desc: 'Core Scaled Operations' },
  { value: '201-1000', label: 'Upper Mid (201–1,000)', desc: 'Regional Enterprise' },
  { value: '1000+', label: 'Enterprise (1,000+)', desc: 'Global Strategic Accounts' },
];

const PRESET_JOB_ROLES = [
  'VP of Operations',
  'VP of Supply Chain',
  'Director of Logistics',
  'Chief Operating Officer',
  'Head of Procurement',
  'Warehouse General Manager',
  'VP Sales / Revenue',
  'Director of IT / Systems',
];

const PRESET_PAIN_POINTS = [
  'Manual inventory audits & spreadsheet errors',
  'High staff turnover and rising operational labor spend',
  'Slow lead qualification and delayed prospect response times',
  'Legacy software integration hurdles and disconnected data silos',
  'Missed customer SLAs due to operational friction',
];

const PRESET_BUYING_TRIGGERS = [
  'New facility or warehouse expansion announced',
  'Key leadership transition (VP/Director hired in past 90 days)',
  'Public mention of supply chain or automation initiatives',
  'RFP or vendor evaluation notice published',
  'Negative reviews or migration away from legacy incumbents',
  'Recent capital expenditure or growth funding announced',
];

export const Step3IdealCustomer: React.FC<Step3IdealCustomerProps> = ({
  data,
  onChange,
  errors,
}) => {
  const [customRole, setCustomRole] = useState('');
  const [customPain, setCustomPain] = useState('');

  const toggleSize = (size: CompanySizeTier) => {
    const exists = data.companySizes.includes(size);
    const updated = exists
      ? data.companySizes.filter((s) => s !== size)
      : [...data.companySizes, size];
    onChange({ companySizes: updated });
  };

  const toggleRole = (role: string) => {
    const exists = data.roles.includes(role);
    const updated = exists ? data.roles.filter((r) => r !== role) : [...data.roles, role];
    onChange({ roles: updated });
  };

  const handleAddCustomRole = () => {
    const trimmed = customRole.trim();
    if (trimmed && !data.roles.includes(trimmed)) {
      onChange({ roles: [...data.roles, trimmed] });
      setCustomRole('');
    }
  };

  const handleRemoveRole = (role: string) => {
    onChange({ roles: data.roles.filter((r) => r !== role) });
  };

  const toggleTrigger = (trigger: string) => {
    const exists = data.buyingTriggers.includes(trigger);
    const updated = exists
      ? data.buyingTriggers.filter((t) => t !== trigger)
      : [...data.buyingTriggers, trigger];
    onChange({ buyingTriggers: updated });
  };

  const handleAddCustomPain = () => {
    const trimmed = customPain.trim();
    if (trimmed && !data.painPoints.includes(trimmed)) {
      onChange({ painPoints: [...data.painPoints, trimmed] });
      setCustomPain('');
    }
  };

  const handleRemovePain = (pain: string) => {
    onChange({ painPoints: data.painPoints.filter((p) => p !== pain) });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h3 className="text-h3 font-bold text-foreground tracking-tight">
          Ideal Customer Profile (ICP)
        </h3>
        <p className="text-body text-foreground-secondary leading-relaxed">
          Define the exact accounts, decision-maker personas, and timing signals that yield the highest conversion.
        </p>
      </div>

      {/* Section 1: Target Organization Tiers */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-caption font-medium text-foreground-secondary">
            Target Organization Tiers <span className="text-signal-urgent">*</span>
          </label>
          <span className="text-[11px] text-foreground-tertiary">Select target customer sizes</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {COMPANY_SIZE_TIERS.map((tier) => {
            const isSelected = data.companySizes.includes(tier.value);
            return (
              <button
                key={tier.value}
                type="button"
                onClick={() => toggleSize(tier.value)}
                className={`p-3 rounded-lg border text-left transition-all flex items-start justify-between gap-2 ${
                  isSelected
                    ? 'bg-primary-muted border-primary text-foreground shadow-xs'
                    : 'bg-surface-1 border-border-subtle hover:border-border-default text-foreground-secondary'
                }`}
              >
                <div className="space-y-0.5 min-w-0">
                  <div className={`text-xs font-semibold ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                    {tier.label}
                  </div>
                  <div className="text-[11px] text-foreground-tertiary truncate">{tier.desc}</div>
                </div>
                <div
                  className={`w-4 h-4 rounded flex items-center justify-center text-[10px] shrink-0 border ${
                    isSelected
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'border-border-default'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3" />}
                </div>
              </button>
            );
          })}
        </div>
        {errors.companySizes && (
          <p className="text-caption text-signal-urgent">{errors.companySizes}</p>
        )}
      </div>

      {/* Section 2: Target Decision-Maker Roles */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="block text-caption font-medium text-foreground-secondary">
            Target Decision-Maker Titles & Roles <span className="text-signal-urgent">*</span>
          </label>
          <span className="text-[11px] text-foreground-tertiary">Who signs the deal?</span>
        </div>

        {/* Selected Roles Chips */}
        <div className="flex flex-wrap gap-2 p-3 bg-surface-1 rounded-xl border border-border-default min-h-[52px]">
          {data.roles.length === 0 && (
            <span className="text-caption text-foreground-tertiary italic">
              Select or type titles below (e.g., VP of Logistics, COO)...
            </span>
          )}
          {data.roles.map((role) => (
            <span
              key={role}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-surface-elevated text-primary border border-primary/30"
            >
              <span>{role}</span>
              <button
                type="button"
                onClick={() => handleRemoveRole(role)}
                className="text-foreground-tertiary hover:text-signal-urgent transition-colors"
                title="Remove role"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>

        {/* Preset Suggestions & Custom Input */}
        <div className="space-y-2">
          <div className="flex flex-wrap gap-1.5">
            {PRESET_JOB_ROLES.map((preset) => {
              const isSelected = data.roles.includes(preset);
              return (
                <button
                  key={preset}
                  type="button"
                  onClick={() => toggleRole(preset)}
                  className={`text-[11px] px-2.5 py-1 rounded-md border transition-all ${
                    isSelected
                      ? 'bg-primary-muted text-primary border-primary/40 font-semibold'
                      : 'bg-surface-1 text-foreground-secondary border-border-subtle hover:border-border-default hover:text-foreground'
                  }`}
                >
                  {isSelected ? `✓ ${preset}` : `+ ${preset}`}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="text"
              placeholder="Add custom role title..."
              value={customRole}
              onChange={(e) => setCustomRole(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddCustomRole();
                }
              }}
              className="flex-1 bg-surface-1 border border-border-subtle rounded-lg px-3 py-1.5 text-xs text-foreground placeholder:text-foreground-tertiary focus:outline-none focus:border-primary"
            />
            <button
              type="button"
              onClick={handleAddCustomRole}
              disabled={!customRole.trim()}
              className="px-3 py-1.5 rounded-lg bg-surface-elevated border border-border-default text-xs font-medium text-foreground hover:bg-surface-2 transition-colors disabled:opacity-40"
            >
              Add Title
            </button>
          </div>
        </div>
        {errors.roles && <p className="text-caption text-signal-urgent">{errors.roles}</p>}
      </div>

      {/* Section 3: Operational Pain Points */}
      <div className="space-y-2.5">
        <label className="block text-caption font-medium text-foreground-secondary">
          Customer Pain Points & Operational Shortfalls <span className="text-signal-urgent">*</span>
        </label>
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {data.painPoints.map((pain) => (
              <span
                key={pain}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs bg-surface-1 text-foreground-secondary border border-border-subtle"
              >
                <span>{pain}</span>
                <button
                  type="button"
                  onClick={() => handleRemovePain(pain)}
                  className="text-foreground-tertiary hover:text-signal-urgent transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {PRESET_PAIN_POINTS.map((preset) => {
              const isSelected = data.painPoints.includes(preset);
              return (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    if (isSelected) {
                      handleRemovePain(preset);
                    } else {
                      onChange({ painPoints: [...data.painPoints, preset] });
                    }
                  }}
                  className={`text-[11px] px-2.5 py-1 rounded-md border transition-all ${
                    isSelected
                      ? 'bg-signal-qualified-muted text-signal-qualified border-signal-qualified/40 font-semibold'
                      : 'bg-surface-1 text-foreground-secondary border-border-subtle hover:border-border-default hover:text-foreground'
                  }`}
                >
                  {isSelected ? `✓ ${preset}` : `+ ${preset}`}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="text"
              placeholder="e.g., Inaccurate warehouse stock counts leading to delayed shipments..."
              value={customPain}
              onChange={(e) => setCustomPain(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddCustomPain();
                }
              }}
              className="flex-1 bg-surface-1 border border-border-subtle rounded-lg px-3 py-1.5 text-xs text-foreground placeholder:text-foreground-tertiary focus:outline-none focus:border-primary"
            />
            <button
              type="button"
              onClick={handleAddCustomPain}
              disabled={!customPain.trim()}
              className="px-3 py-1.5 rounded-lg bg-surface-elevated border border-border-default text-xs font-medium text-foreground hover:bg-surface-2 transition-colors disabled:opacity-40"
            >
              Add Pain Point
            </button>
          </div>
        </div>
        {errors.painPoints && <p className="text-caption text-signal-urgent">{errors.painPoints}</p>}
      </div>

      {/* Section 4: High-Velocity Buying Triggers */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="block text-caption font-medium text-foreground-secondary flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-signal-high" />
            <span>High-Intent Buying Triggers</span> <span className="text-signal-urgent">*</span>
          </label>
          <span className="text-[11px] text-foreground-tertiary">Triggers that spike intent score to 80+</span>
        </div>

        <div className="space-y-2">
          {PRESET_BUYING_TRIGGERS.map((trigger) => {
            const isSelected = data.buyingTriggers.includes(trigger);
            return (
              <div
                key={trigger}
                onClick={() => toggleTrigger(trigger)}
                className={`p-3 rounded-lg border text-xs cursor-pointer transition-all flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'bg-signal-high-muted border-signal-high/40 text-foreground font-medium shadow-2xs'
                    : 'bg-surface-1 border-border-subtle text-foreground-secondary hover:border-border-default hover:text-foreground'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Zap className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-signal-high' : 'text-foreground-tertiary'}`} />
                  <span className="truncate">{trigger}</span>
                </div>
                <div
                  className={`w-4 h-4 rounded flex items-center justify-center text-[10px] shrink-0 border ${
                    isSelected
                      ? 'bg-signal-high text-background border-signal-high font-bold'
                      : 'border-border-default'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3" />}
                </div>
              </div>
            );
          })}
        </div>
        {errors.buyingTriggers && (
          <p className="text-caption text-signal-urgent">{errors.buyingTriggers}</p>
        )}
      </div>
    </div>
  );
};
