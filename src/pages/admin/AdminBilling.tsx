import React, { useState } from 'react';
import { CreditCard, Calculator, ArrowRight, CheckCircle2, DollarSign } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const AdminBilling: React.FC = () => {
  const [tier, setTier] = useState<'Starter' | 'Growth' | 'Enterprise'>('Growth');
  const [voiceMinutes, setVoiceMinutes] = useState<number>(1250);
  const [contacts, setContacts] = useState<number>(3200);
  const [crmIntegrations, setCrmIntegrations] = useState<number>(2);

  const PRICING = {
    Starter: {
      base: 99.0,
      incMin: 200,
      incCont: 500,
      overMin: 0.15,
      overCont: 0.05,
      incCrm: 1,
      extraCrm: 25.0,
    },
    Growth: {
      base: 299.0,
      incMin: 1000,
      incCont: 2500,
      overMin: 0.12,
      overCont: 0.03,
      incCrm: 3,
      extraCrm: 20.0,
    },
    Enterprise: {
      base: 799.0,
      incMin: 5000,
      incCont: 15000,
      overMin: 0.09,
      overCont: 0.02,
      incCrm: 999,
      extraCrm: 0.0,
    },
  };

  const currentPricing = PRICING[tier];

  // Calculations
  const baseCharge = currentPricing.base;
  const overageMin = Math.max(0, voiceMinutes - currentPricing.incMin);
  const minCharge = overageMin * currentPricing.overMin;

  const overageCont = Math.max(0, contacts - currentPricing.incCont);
  const contCharge = overageCont * currentPricing.overCont;

  const extraCrm = Math.max(0, crmIntegrations - currentPricing.incCrm);
  const crmCharge = extraCrm * currentPricing.extraCrm;

  const totalDue = baseCharge + minCharge + contCharge + crmCharge;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border-subtle">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-h1 font-bold text-foreground tracking-tight">Usage-Based Billing Calculator</h1>
            <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-semibold bg-amber-400/15 text-amber-400 border border-amber-400/30">
              Metered Engine
            </span>
          </div>
          <p className="text-body text-foreground-secondary">
            Compute metered charges per client tier (voice minutes, enriched contacts & CRM connectors).
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Interactive Controls */}
        <div className="lg:col-span-2 p-6 rounded-xl bg-surface-0 border border-border-subtle space-y-6 shadow-xs">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground">Select Subscription Tier</label>
            <div className="grid grid-cols-3 gap-2">
              {(['Starter', 'Growth', 'Enterprise'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTier(t)}
                  className={`py-2.5 px-3 rounded-xl text-xs font-semibold transition-all border ${
                    tier === t
                      ? 'bg-primary text-white border-primary shadow-sm'
                      : 'bg-surface-1 text-foreground-secondary hover:text-foreground border-border-subtle'
                  }`}
                >
                  {t} Plan
                </button>
              ))}
            </div>
          </div>

          {/* Voice Minutes Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-foreground">Voice Minutes Consumed</span>
              <span className="font-mono text-primary font-bold">{voiceMinutes.toLocaleString()} mins</span>
            </div>
            <input
              type="range"
              min={0}
              max={6000}
              step={50}
              value={voiceMinutes}
              onChange={(e) => setVoiceMinutes(Number(e.target.value))}
              className="w-full accent-primary cursor-pointer"
            />
            <div className="text-[11px] text-foreground-tertiary flex justify-between">
              <span>Included: {currentPricing.incMin} mins</span>
              <span>Overage rate: ${currentPricing.overMin.toFixed(2)}/min</span>
            </div>
          </div>

          {/* Contacts Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-foreground">Enriched Prospect Contacts</span>
              <span className="font-mono text-primary font-bold">{contacts.toLocaleString()} contacts</span>
            </div>
            <input
              type="range"
              min={0}
              max={20000}
              step={100}
              value={contacts}
              onChange={(e) => setContacts(Number(e.target.value))}
              className="w-full accent-primary cursor-pointer"
            />
            <div className="text-[11px] text-foreground-tertiary flex justify-between">
              <span>Included: {currentPricing.incCont.toLocaleString()} contacts</span>
              <span>Overage rate: ${currentPricing.overCont.toFixed(2)}/contact</span>
            </div>
          </div>

          {/* CRM Integrations */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-foreground">Connected CRM Platforms</span>
              <span className="font-mono text-primary font-bold">{crmIntegrations} connectors</span>
            </div>
            <input
              type="number"
              min={1}
              max={10}
              value={crmIntegrations}
              onChange={(e) => setCrmIntegrations(Number(e.target.value))}
              className="w-32 px-3 py-1.5 rounded-lg bg-surface-1 border border-border-subtle text-xs text-foreground font-mono focus:outline-none focus:border-primary"
            />
            <div className="text-[11px] text-foreground-tertiary">
              Included: {currentPricing.incCrm} CRM. Extra fee: ${currentPricing.extraCrm.toFixed(2)}/connector.
            </div>
          </div>
        </div>

        {/* Right: Calculated Invoice Breakdown */}
        <div className="p-6 rounded-xl bg-surface-0 border border-border-subtle space-y-6 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-border-subtle pb-3">
              <Calculator className="w-4 h-4 text-primary" />
              <h3 className="font-bold text-sm text-foreground">Invoice Summary ({tier})</h3>
            </div>

            <div className="space-y-2 text-xs divide-y divide-border-subtle">
              <div className="flex justify-between pt-1">
                <span className="text-foreground-secondary">Base Subscription:</span>
                <span className="font-mono font-medium text-foreground">${baseCharge.toFixed(2)}</span>
              </div>

              <div className="flex justify-between pt-2">
                <div>
                  <div className="text-foreground-secondary">Voice Minutes Overage:</div>
                  <div className="text-[10px] text-foreground-tertiary">
                    {overageMin} mins × ${currentPricing.overMin.toFixed(2)}
                  </div>
                </div>
                <span className="font-mono font-medium text-foreground">${minCharge.toFixed(2)}</span>
              </div>

              <div className="flex justify-between pt-2">
                <div>
                  <div className="text-foreground-secondary">Contacts Overage:</div>
                  <div className="text-[10px] text-foreground-tertiary">
                    {overageCont} contacts × ${currentPricing.overCont.toFixed(2)}
                  </div>
                </div>
                <span className="font-mono font-medium text-foreground">${contCharge.toFixed(2)}</span>
              </div>

              <div className="flex justify-between pt-2">
                <div>
                  <div className="text-foreground-secondary">CRM Integration Overage:</div>
                  <div className="text-[10px] text-foreground-tertiary">
                    {extraCrm} extra × ${currentPricing.extraCrm.toFixed(2)}
                  </div>
                </div>
                <span className="font-mono font-medium text-foreground">${crmCharge.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-border-subtle space-y-2">
            <div className="flex justify-between items-baseline">
              <span className="text-xs font-bold text-foreground uppercase tracking-wider">Total Due:</span>
              <span className="text-2xl font-bold font-mono text-signal-qualified">
                ${totalDue.toFixed(2)}
              </span>
            </div>
            <div className="text-[10px] font-mono text-foreground-tertiary text-right">
              Currency: USD · Monthly Billing Cycle
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default AdminBilling;
