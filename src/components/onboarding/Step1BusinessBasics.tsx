import React from 'react';
import { Building2, Globe, MapPin, Users, Briefcase, HelpCircle } from 'lucide-react';
import { BusinessBasicsData, CompanySizeTier } from '../../types/onboarding';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Select } from '../ui/Select';

export interface Step1BusinessBasicsProps {
  data: BusinessBasicsData;
  onChange: (updated: Partial<BusinessBasicsData>) => void;
  errors: Record<string, string>;
}

const INDUSTRY_OPTIONS = [
  { value: 'B2B SaaS', label: 'B2B SaaS & Cloud Software' },
  { value: 'Logistics & Supply Chain', label: 'Logistics, Supply Chain & 3PL' },
  { value: 'Industrial Automation & Robotics', label: 'Industrial Automation & Robotics' },
  { value: 'Healthcare & Life Sciences', label: 'Healthcare & Life Sciences' },
  { value: 'Fintech & Financial Services', label: 'Fintech & Financial Services' },
  { value: 'Cybersecurity & Infrastructure', label: 'Cybersecurity & Infrastructure' },
  { value: 'E-Commerce Infrastructure', label: 'E-Commerce Infrastructure' },
  { value: 'Professional & Legal Services', label: 'Professional & Advisory Services' },
];

const COMPANY_SIZE_OPTIONS: { value: CompanySizeTier; label: string }[] = [
  { value: '1-10', label: '1–10' },
  { value: '11-50', label: '11–50' },
  { value: '51-200', label: '51–200' },
  { value: '201-1000', label: '201–1,000' },
  { value: '1000+', label: '1,000+' },
];

const AVAILABLE_REGIONS = [
  'North America',
  'Western Europe',
  'UK & Ireland',
  'India & South Asia',
  'Southeast Asia',
  'Middle East (GCC)',
  'Australia / ANZ',
  'Global / Remote',
];

export const Step1BusinessBasics: React.FC<Step1BusinessBasicsProps> = ({
  data,
  onChange,
  errors,
}) => {
  const toggleRegion = (region: string) => {
    const exists = data.operatingRegions.includes(region);
    const updated = exists
      ? data.operatingRegions.filter((r) => r !== region)
      : [...data.operatingRegions, region];
    onChange({ operatingRegions: updated });
  };

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div className="space-y-1">
        <h3 className="text-h3 font-bold text-foreground tracking-tight">
          Business Basics & Identity
        </h3>
        <p className="text-body text-foreground-secondary leading-relaxed">
          Teach your sales agent what your company is called, how it is structured, and where it operates.
        </p>
      </div>

      <div className="space-y-4">
        {/* Row 1: Company Name & Website */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-semibold text-primary bg-primary-muted px-1.5 py-0.2 rounded border border-primary/20">
                Agent Caller ID
              </span>
            </div>
            <Input
              label="Business Name"
              required
              placeholder="e.g., Veloce Robotics"
              leftIcon={<Building2 className="w-4 h-4 text-foreground-tertiary" />}
              value={data.name}
              onChange={(e) => onChange({ name: e.target.value })}
              error={errors.name}
              helperText="Used in agent voice greetings and outreach headers."
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-semibold text-signal-qualified bg-signal-qualified-muted px-1.5 py-0.2 rounded border border-signal-qualified/20">
                Web Telemetry Crawl
              </span>
            </div>
            <Input
              label="Company Website"
              required
              type="url"
              placeholder="https://veloce-robotics.ai"
              leftIcon={<Globe className="w-4 h-4 text-foreground-tertiary" />}
              value={data.website}
              onChange={(e) => onChange({ website: e.target.value })}
              error={errors.website}
              helperText="Agent references your site to enrich solution pitches."
            />
          </div>
        </div>

        {/* Row 2: Industry Vertical & HQ Location */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-semibold text-signal-high bg-signal-high-muted px-1.5 py-0.2 rounded border border-signal-high/20">
                Domain Lexicon Model
              </span>
            </div>
            <Select
              label="Primary Industry"
              required
              options={INDUSTRY_OPTIONS}
              value={data.industry}
              onChange={(e) => onChange({ industry: e.target.value })}
              error={errors.industry}
              helperText="Calibrates domain-specific vocabulary and objections."
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-semibold text-foreground-tertiary bg-surface-elevated px-1.5 py-0.2 rounded border border-border-subtle">
                Timezone Baseline
              </span>
            </div>
            <Input
              label="Headquarters Location"
              required
              placeholder="e.g., Austin, TX / Bengaluru, KA"
              leftIcon={<MapPin className="w-4 h-4 text-foreground-tertiary" />}
              value={data.location}
              onChange={(e) => onChange({ location: e.target.value })}
              error={errors.location}
              helperText="Provides geographic context during prospect conversations."
            />
          </div>
        </div>

        {/* Row 3: Company Size */}
        <div className="space-y-1.5">
          <label className="block text-caption font-medium text-foreground-secondary">
            Company Size (Employees) <span className="text-signal-urgent">*</span>
          </label>
          <div className="grid grid-cols-5 gap-2">
            {COMPANY_SIZE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => onChange({ companySize: opt.value })}
                className={`p-2.5 rounded-lg border text-xs font-mono font-semibold transition-all text-center ${
                  data.companySize === opt.value
                    ? 'bg-primary-muted text-primary border-primary/50 shadow-xs'
                    : 'bg-surface-1 text-foreground-secondary border-border-subtle hover:border-border-default hover:text-foreground'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {errors.companySize && (
            <p className="text-caption text-signal-urgent">{errors.companySize}</p>
          )}
        </div>

        {/* Row 4: Operating Regions */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-caption font-medium text-foreground-secondary">
              Active Operating Regions <span className="text-signal-urgent">*</span>
            </label>
            <span className="text-[11px] text-foreground-tertiary">Select all that apply</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_REGIONS.map((region) => {
              const isSelected = data.operatingRegions.includes(region);
              return (
                <button
                  key={region}
                  type="button"
                  onClick={() => toggleRegion(region)}
                  className={`px-3 py-1.5 rounded-lg border text-xs transition-all ${
                    isSelected
                      ? 'bg-surface-elevated text-primary border-primary font-semibold shadow-2xs'
                      : 'bg-surface-1 text-foreground-secondary border-border-subtle hover:border-border-default hover:text-foreground'
                  }`}
                >
                  {isSelected ? `✓ ${region}` : `+ ${region}`}
                </button>
              );
            })}
          </div>
          {errors.operatingRegions && (
            <p className="text-caption text-signal-urgent">{errors.operatingRegions}</p>
          )}
        </div>

        {/* Row 5: Business Description */}
        <Textarea
          label="Executive Description / Pitch Baseline"
          required
          rows={3}
          placeholder="Briefly explain what your company builds or delivers, and what primary value you create for clients..."
          value={data.description}
          onChange={(e) => onChange({ description: e.target.value })}
          error={errors.description}
          helperText="Your sales agent extracts core terminology and value claims from this description."
        />
      </div>
    </div>
  );
};
