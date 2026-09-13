import React from 'react';
import { PhoneCall, Clock, Languages, Shield, Sliders, CalendarCheck, Check } from 'lucide-react';
import { SalesPreferencesData, VoiceLanguage, AgentDemeanor } from '../../types/onboarding';
import { Select } from '../ui/Select';
import { Input } from '../ui/Input';

export interface Step5SalesPreferencesProps {
  data: SalesPreferencesData;
  onChange: (updated: Partial<SalesPreferencesData>) => void;
  errors: Record<string, string>;
}

const PRIMARY_LANGUAGES: { value: VoiceLanguage; label: string }[] = [
  { value: 'en-US', label: 'English (US Enterprise Neutral)' },
  { value: 'en-GB', label: 'English (UK Professional)' },
  { value: 'en-IN', label: 'English (Indian Professional)' },
  { value: 'hi-IN', label: 'Hindi (Conversational Business / हिंदी)' },
  { value: 'hinglish', label: 'Hinglish (Metro Sales Hybrid)' },
  { value: 'gu-IN', label: 'Gujarati (Commercial / ગુજરાતી)' },
];

const SECONDARY_LANGUAGES: { value: VoiceLanguage; label: string }[] = [
  { value: 'en-US', label: 'English (US)' },
  { value: 'hi-IN', label: 'Hindi (हिंदी)' },
  { value: 'hinglish', label: 'Hinglish' },
  { value: 'gu-IN', label: 'Gujarati (ગુજરાતી)' },
];

const DEMEANOR_OPTIONS: { value: AgentDemeanor; title: string; desc: string; sampleQuote: string }[] = [
  {
    value: 'consultative',
    title: 'Consultative & Analytical',
    desc: 'Measured cadence, ROI-centric framing, patient objection handling suited for C-suite buyers.',
    sampleQuote: '"Looking at your current multi-facility volume, where do you see the biggest margin leakage?"',
  },
  {
    value: 'direct',
    title: 'Direct & High-Velocity',
    desc: 'Concise value hook in <15s, fast disqualification, focused on booking 15-min discovery calls.',
    sampleQuote: '"We helped Acme cut warehouse cycle counts by 72%. Do you have 10 minutes this Thursday?"',
  },
  {
    value: 'advisory',
    title: 'Technical & Advisory',
    desc: 'Deep architecture empathy, listens for integration constraints, positions technical audits.',
    sampleQuote: '"Many COOs we speak with struggle with SAP manifest mismatches. How are you handling that today?"',
  },
];

const TIMEZONE_OPTIONS = [
  { value: 'America/New_York', label: 'Eastern Time (ET) · US & Canada' },
  { value: 'America/Chicago', label: 'Central Time (CT) · US & Canada' },
  { value: 'America/Denver', label: 'Mountain Time (MT) · US & Canada' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT) · US & Canada' },
  { value: 'Europe/London', label: 'GMT / BST · United Kingdom' },
  { value: 'Europe/Berlin', label: 'Central European Time (CET) · Germany, France' },
  { value: 'Asia/Kolkata', label: 'India Standard Time (IST) · India' },
  { value: 'Asia/Dubai', label: 'Gulf Standard Time (GST) · UAE, GCC' },
  { value: 'Asia/Singapore', label: 'Singapore Time (SGT) · APAC' },
];

export const Step5SalesPreferences: React.FC<Step5SalesPreferencesProps> = ({
  data,
  onChange,
  errors,
}) => {
  const toggleSecondaryLanguage = (lang: VoiceLanguage) => {
    const exists = data.supportedLanguages.includes(lang);
    const updated = exists
      ? data.supportedLanguages.filter((l) => l !== lang)
      : [...data.supportedLanguages, lang];
    onChange({ supportedLanguages: updated });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h3 className="text-h3 font-bold text-foreground tracking-tight">
          Sales & Calling Protocol
        </h3>
        <p className="text-body text-foreground-secondary leading-relaxed">
          Configure how your autonomous agent speaks, when calls are placed, and compliance safeguards.
        </p>
      </div>

      {/* Section 1: Language Configuration */}
      <div className="space-y-4 p-4 bg-surface-1/60 rounded-xl border border-border-default">
        <div className="flex items-center gap-2 text-foreground font-semibold text-body">
          <Languages className="w-4 h-4 text-primary" />
          <span>Voice Synthesis & Language Engines</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Primary Voice Agent Language"
            options={PRIMARY_LANGUAGES}
            value={data.primaryLanguage}
            onChange={(e) => onChange({ primaryLanguage: e.target.value as VoiceLanguage })}
            helperText="Sets the default acoustic model, phoneme timing, and vernacular sales idioms."
          />

          <div className="space-y-1.5">
            <label className="block text-caption font-medium text-foreground-secondary">
              Multilingual Fallback Detection
            </label>
            <div className="flex flex-wrap gap-2 pt-1">
              {SECONDARY_LANGUAGES.map((lang) => {
                const isSelected = data.supportedLanguages.includes(lang.value);
                return (
                  <button
                    key={lang.value}
                    type="button"
                    onClick={() => toggleSecondaryLanguage(lang.value)}
                    className={`px-3 py-1.5 rounded-lg border text-xs transition-all ${
                      isSelected
                        ? 'bg-primary-muted text-primary border-primary/40 font-semibold'
                        : 'bg-surface-1 text-foreground-secondary border-border-subtle hover:border-border-default hover:text-foreground'
                    }`}
                  >
                    {isSelected ? `✓ ${lang.label}` : `+ ${lang.label}`}
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-foreground-tertiary">
              Agent detects when prospect switches languages and seamlessly shifts dialect.
            </p>
          </div>
        </div>
      </div>

      {/* Section 2: Agent Persona & Demeanor */}
      <div className="space-y-2.5">
        <label className="block text-caption font-medium text-foreground-secondary">
          Agent Conversation Demeanor <span className="text-signal-urgent">*</span>
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {DEMEANOR_OPTIONS.map((dem) => {
            const isSelected = data.agentDemeanor === dem.value;
            return (
              <button
                key={dem.value}
                type="button"
                onClick={() => onChange({ agentDemeanor: dem.value })}
                className={`p-3.5 rounded-xl border text-left transition-all space-y-1.5 flex flex-col justify-between ${
                  isSelected
                    ? 'bg-primary-muted border-primary text-foreground shadow-xs'
                    : 'bg-surface-1 border-border-subtle hover:border-border-default text-foreground-secondary'
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                      {dem.title}
                    </span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-primary shrink-0" />}
                  </div>
                  <p className="text-[11px] text-foreground-tertiary leading-relaxed">{dem.desc}</p>
                  <div className="pt-1 text-[10px] italic text-foreground-secondary bg-surface-elevated/40 p-2 rounded border border-border-subtle">
                    <span className="not-italic font-semibold text-primary">Sample Delivery: </span>
                    {dem.sampleQuote}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Section 3: Calling Windows & Timezone */}
      <div className="space-y-4 p-4 bg-surface-1/60 rounded-xl border border-border-default">
        <div className="flex items-center gap-2 text-foreground font-semibold text-body">
          <Clock className="w-4 h-4 text-signal-high" />
          <span>Telephony Calling Windows & Compliance</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select
            label="Prospect Local Timezone"
            options={TIMEZONE_OPTIONS}
            value={data.timezone}
            onChange={(e) => onChange({ timezone: e.target.value })}
          />

          <Input
            label="Earliest Dialing Time"
            type="time"
            value={data.businessHoursStart}
            onChange={(e) => onChange({ businessHoursStart: e.target.value })}
          />

          <Input
            label="Latest Dialing Time"
            type="time"
            value={data.businessHoursEnd}
            onChange={(e) => onChange({ businessHoursEnd: e.target.value })}
          />
        </div>

        {/* DNC Compliance & Max Touches */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-border-subtle text-xs">
          <label className="flex items-center gap-2 text-foreground-secondary cursor-pointer">
            <input
              type="checkbox"
              checked={data.enforceDncWindows}
              onChange={(e) => onChange({ enforceDncWindows: e.target.checked })}
              className="rounded border-border-default text-primary focus:ring-primary w-4 h-4 bg-surface-elevated"
            />
            <span>Strictly enforce Do-Not-Call (DNC) and regional quiet hours</span>
          </label>

          <div className="flex items-center gap-2">
            <span className="text-foreground-tertiary">Max automated touches:</span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => onChange({ maxTouches: count })}
                  className={`w-6 h-6 rounded text-xs font-mono font-bold transition-all ${
                    data.maxTouches === count
                      ? 'bg-primary text-primary-foreground shadow-2xs'
                      : 'bg-surface-elevated text-foreground-tertiary hover:text-foreground'
                  }`}
                >
                  {count}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
