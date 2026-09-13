import React from 'react';
import { Plus, Trash2, Package, Sparkles, DollarSign, AlertCircle, ShieldCheck } from 'lucide-react';
import { ProductOffering, PricingModel } from '../../types/onboarding';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';

export interface Step2ProductsServicesProps {
  offerings: ProductOffering[];
  onChange: (offerings: ProductOffering[]) => void;
  errors: Record<string, string>;
}

const PRICING_OPTIONS = [
  { value: 'subscription', label: 'Subscription (SaaS / Annual Recurring)' },
  { value: 'usage', label: 'Usage / Consumption Based' },
  { value: 'fixed', label: 'Fixed Project / Contract' },
  { value: 'enterprise', label: 'Custom Enterprise Quoting' },
];

const OFFERING_TYPES = [
  { value: 'product', label: 'Software / Product' },
  { value: 'service', label: 'Professional Service' },
  { value: 'platform', label: 'Managed Platform / Hardware' },
  { value: 'advisory', label: 'Advisory / Consulting' },
];

export const Step2ProductsServices: React.FC<Step2ProductsServicesProps> = ({
  offerings,
  onChange,
  errors,
}) => {
  const handleAddOffering = () => {
    const newOffering: ProductOffering = {
      id: `offering-${Date.now()}`,
      name: '',
      type: 'product',
      description: '',
      customerProblem: '',
      usp: '',
      pricingModel: 'subscription',
      priceRange: '',
    };
    onChange([...offerings, newOffering]);
  };

  const handleRemoveOffering = (index: number) => {
    if (offerings.length <= 1) return;
    const updated = offerings.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleUpdateOffering = (index: number, fields: Partial<ProductOffering>) => {
    const updated = offerings.map((item, i) => (i === index ? { ...item, ...fields } : item));
    onChange(updated);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <h3 className="text-h3 font-bold text-foreground tracking-tight">
            Products & Value Propositions
          </h3>
          <p className="text-body text-foreground-secondary leading-relaxed">
            Detail the specific offerings your AI sales agent will qualify and pitch to prospects.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={handleAddOffering}
          leftIcon={<Plus className="w-3.5 h-3.5 text-primary" />}
        >
          Add Offering
        </Button>
      </div>

      {errors.offerings && (
        <div className="p-3 rounded-lg bg-signal-urgent-muted text-signal-urgent border border-signal-urgent/30 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errors.offerings}</span>
        </div>
      )}

      {/* Offerings Repeater List */}
      <div className="space-y-4">
        {offerings.map((offering, idx) => (
          <div
            key={offering.id}
            className="p-5 bg-surface-1/70 border border-border-default rounded-xl space-y-4 relative group"
          >
            {/* Card Top Indicator & Remove */}
            <div className="flex items-center justify-between gap-3 border-b border-border-subtle pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded bg-surface-elevated text-primary border border-border-subtle">
                  <Package className="w-4 h-4" />
                </span>
                <span className="text-body font-semibold text-foreground">
                  Offering #{idx + 1} {offering.name ? `· ${offering.name}` : ''}
                </span>
              </div>

              {offerings.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveOffering(idx)}
                  className="text-foreground-tertiary hover:text-signal-urgent transition-colors p-1 rounded hover:bg-surface-elevated"
                  title="Remove this offering"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Row 1: Name & Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Offering Name"
                required
                placeholder="e.g., AeroScan Inventory Quad v3"
                value={offering.name}
                onChange={(e) => handleUpdateOffering(idx, { name: e.target.value })}
                error={errors[`offering_${idx}_name`]}
              />

              <Select
                label="Offering Type"
                options={OFFERING_TYPES}
                value={offering.type}
                onChange={(e) =>
                  handleUpdateOffering(idx, {
                    type: e.target.value as ProductOffering['type'],
                  })
                }
              />
            </div>

            {/* Row 2: Customer Problem Solved */}
            <Textarea
              label="Primary Customer Problem Solved"
              required
              rows={2}
              placeholder="What urgent operational pain or metric shortfall does this solve for the buyer?"
              value={offering.customerProblem}
              onChange={(e) => handleUpdateOffering(idx, { customerProblem: e.target.value })}
              error={errors[`offering_${idx}_problem`]}
              helperText="The sales agent uses this to articulate relevance in the opening pitch hook."
            />

            {/* Row 3: Unique Selling Proposition (USP) vs Competitors */}
            <Textarea
              label="Unique Selling Proposition (USP) & Edge"
              required
              rows={2}
              placeholder="Why should the prospect buy from you instead of incumbents or manual processes?"
              value={offering.usp}
              onChange={(e) => handleUpdateOffering(idx, { usp: e.target.value })}
              error={errors[`offering_${idx}_usp`]}
              helperText="Supplies the agent with counter-objection talking points during calls."
            />

            {/* Row 4: Pricing Model & Indicative Range */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Pricing Model"
                options={PRICING_OPTIONS}
                value={offering.pricingModel}
                onChange={(e) =>
                  handleUpdateOffering(idx, {
                    pricingModel: e.target.value as PricingModel,
                  })
                }
              />

              <Input
                label="Price Range Indicator (Optional)"
                placeholder="e.g., $25,000 / year or $2,500 / month"
                leftIcon={<DollarSign className="w-4 h-4 text-foreground-tertiary" />}
                value={offering.priceRange || ''}
                onChange={(e) => handleUpdateOffering(idx, { priceRange: e.target.value })}
                helperText="Helps the agent verify prospect budget fit during qualification."
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
