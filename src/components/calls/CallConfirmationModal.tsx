import React, { useState, useEffect } from 'react';
import {
  PhoneCall,
  Phone,
  Languages,
  Target,
  ShieldCheck,
  Check,
  Building2,
  User,
  Radio,
  Zap,
  Clock,
  AlertTriangle,
  Mail,
  Sparkles,
  RotateCcw
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { CallLanguage } from '../../types/calls';
import { getProspectTimezone, getCallingWindowStatus } from '../../utils/timezoneUtils';

export interface CallConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedLanguage: CallLanguage, callMode?: 'browser' | 'twilio_pstn', phoneNumber?: string) => void;
  companyName: string;
  contactName: string;
  contactRole: string;
  location?: string;
  phone?: string;
  objective: string;
  whyNow?: string;
  selectedLanguage: CallLanguage;
  onLanguageChange: (lang: CallLanguage) => void;
  currentPitch?: string;
  isGeneratingPitch?: boolean;
  onRegeneratePitch?: () => void;
  onOpenEmailModal?: () => void;
}

const AVAILABLE_LANGUAGES: CallLanguage[] = ['English', 'Hindi', 'Gujarati', 'Marathi'];

export const CallConfirmationModal: React.FC<CallConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  companyName,
  contactName,
  contactRole,
  location,
  phone,
  objective,
  whyNow,
  selectedLanguage,
  onLanguageChange,
  currentPitch,
  isGeneratingPitch,
  onRegeneratePitch,
  onOpenEmailModal
}) => {
  const [overrideRestricted, setOverrideRestricted] = useState(false);
  const [callMode, setCallMode] = useState<'browser' | 'twilio_pstn'>('twilio_pstn');
  const [targetPhone, setTargetPhone] = useState(phone || '+918320441189');

  useEffect(() => {
    if (phone) {
      setTargetPhone(phone);
    } else {
      setTargetPhone('+918320441189');
    }
  }, [phone]);

  // Timezone and Calling Window Evaluation
  const prospectTimezone = getProspectTimezone(location, phone);
  const callingWindow = getCallingWindowStatus(prospectTimezone);
  const isRestricted = callingWindow.status === 'restricted';
  const canLaunchCall = !isRestricted || overrideRestricted;
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Pre-Flight Call Confirmation"
      maxWidth="md"
    >
      <div className="space-y-4 text-xs">
        {/* Pre-Flight Structured Overview Card */}
        <div className="p-4 rounded-xl bg-surface-elevated border border-border-subtle space-y-3">
          {/* WHO */}
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-0.5">
              <span className="text-[10px] font-mono uppercase text-foreground-tertiary font-bold tracking-wider">
                WHO IS BEING CALLED
              </span>
              <div className="text-sm font-bold text-foreground">
                {companyName}
              </div>
              <p className="text-foreground-secondary">
                {contactName} · <span className="text-foreground-tertiary">{contactRole}</span>
              </p>
              {/* Prospect Local Time Display */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-foreground-secondary">
                <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
                <span>
                  Prospect Local Time: <strong className="text-foreground font-mono">{callingWindow.localTimeFormatted}</strong> ({callingWindow.timezoneAbbr})
                </span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-semibold ${callingWindow.badgeClass}`}>
                  {callingWindow.label}
                </span>
              </div>
            </div>

            <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/25 flex items-center justify-center text-primary font-mono font-bold text-xs shrink-0">
              {companyName.slice(0, 2).toUpperCase()}
            </div>
          </div>

          <div className="h-px bg-border-subtle/80" />

          {/* MODE & WHY */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase text-foreground-tertiary font-bold flex items-center gap-1">
                <Radio className="w-3 h-3 text-signal-qualified" />
                Call Mode
              </span>
              <p className="text-foreground font-medium">
                Outbound AI Discovery & Qualification
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase text-foreground-tertiary font-bold flex items-center gap-1">
                <Zap className="w-3 h-3 text-signal-high" />
                Trigger Reason
              </span>
              <p className="text-foreground-secondary line-clamp-2">
                {whyNow || 'High buying intent signal detected'}
              </p>
            </div>
          </div>

          <div className="h-px bg-border-subtle/80" />

          {/* OBJECTIVE */}
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase text-foreground-tertiary font-bold flex items-center gap-1">
              <Target className="w-3 h-3 text-primary" />
              Strategic Objective
            </span>
            <p className="text-foreground-secondary leading-relaxed font-medium">
              {objective}
            </p>
          </div>
        </div>

        {/* Restricted Window Compliance Warning */}
        {isRestricted && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 space-y-2 text-xs animate-fade-in">
            <div className="flex items-start gap-2 text-red-400 font-semibold">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>Quiet Hours Notice: Calling Outside Standard Hours</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              {callingWindow.reason} Calling now risks low answer rate or non-compliance with outreach quiet hours.
            </p>
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-red-500/20">
              <label className="flex items-center gap-2 cursor-pointer text-slate-200 text-[11px] select-none">
                <input
                  type="checkbox"
                  checked={overrideRestricted}
                  onChange={(e) => setOverrideRestricted(e.target.checked)}
                  className="rounded border-slate-700 text-primary focus:ring-primary h-3.5 w-3.5"
                />
                <span className="font-medium">Override warning and proceed with call</span>
              </label>
              {onOpenEmailModal && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenEmailModal();
                  }}
                  className="text-primary hover:underline text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Send Pitch Email Instead</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Telephony Route & Carrier Selection */}
        <div className="space-y-2">
          <label className="text-[10px] font-mono uppercase text-foreground-tertiary font-bold flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <PhoneCall className="w-3.5 h-3.5 text-primary" />
              <span>Telephony Carrier Routing</span>
            </span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              Twilio Elastic SIP Trunk Active
            </span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setCallMode('twilio_pstn')}
              className={`p-3 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
                callMode === 'twilio_pstn'
                  ? 'bg-primary/10 border-primary shadow-xs ring-1 ring-primary'
                  : 'bg-surface-elevated border-border-subtle text-foreground-secondary hover:text-foreground hover:border-border-default'
              }`}
            >
              <div className="flex items-center justify-between w-full pb-1">
                <span className="font-bold text-xs text-foreground flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-emerald-400" />
                  Twilio PSTN Dialing
                </span>
                {callMode === 'twilio_pstn' && <Check className="w-3.5 h-3.5 text-primary stroke-[2.5]" />}
              </div>
              <p className="text-[11px] text-foreground-tertiary">
                Dials <span className="font-mono text-foreground-secondary font-medium">{targetPhone || phone || '+918320441189'}</span> via Twilio carrier trunk with live Answering Machine Detection (AMD).
              </p>
              <div className="pt-2 text-[10px] font-mono text-primary flex items-center gap-1">
                <span>⚡ Voice & AI: Internal Sarvam Bulbul + Ollama</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setCallMode('browser')}
              className={`p-3 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
                callMode === 'browser'
                  ? 'bg-primary/10 border-primary shadow-xs ring-1 ring-primary'
                  : 'bg-surface-elevated border-border-subtle text-foreground-secondary hover:text-foreground hover:border-border-default'
              }`}
            >
              <div className="flex items-center justify-between w-full pb-1">
                <span className="font-bold text-xs text-foreground flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-signal-high" />
                  Browser Voice Agent
                </span>
                {callMode === 'browser' && <Check className="w-3.5 h-3.5 text-primary stroke-[2.5]" />}
              </div>
              <p className="text-[11px] text-foreground-tertiary">
                Direct interactive voice conversation using your computer microphone and speaker.
              </p>
              <div className="pt-2 text-[10px] font-mono text-primary flex items-center gap-1">
                <span>⚡ Voice & AI: Internal Sarvam Bulbul + Ollama</span>
              </div>
            </button>
          </div>

          {callMode === 'twilio_pstn' && (
            <div className="p-3 rounded-lg bg-surface-elevated/80 border border-primary/20 space-y-1.5 animate-fade-in">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold text-foreground flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-primary" />
                  <span>Target Phone Number to Ring</span>
                </label>
                <span className="text-[10px] font-mono text-foreground-tertiary">
                  E.164 format (with country code)
                </span>
              </div>
              <input
                type="tel"
                value={targetPhone}
                onChange={(e) => setTargetPhone(e.target.value)}
                placeholder="+918320441189"
                className="w-full bg-surface border border-border-subtle rounded-md px-3 py-1.5 text-xs font-mono text-foreground placeholder:text-foreground-tertiary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
              <p className="text-[10px] text-foreground-tertiary">
                Enter your mobile number to test an incoming call directly on your real phone.
              </p>
            </div>
          )}
        </div>

        {/* Spoken Language Selection */}
        <div className="space-y-2">
          <label className="text-[10px] font-mono uppercase text-foreground-tertiary font-bold flex items-center gap-1.5">
            <Languages className="w-3.5 h-3.5 text-foreground-tertiary" />
            <span>Spoken Conversation Language</span>
          </label>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {AVAILABLE_LANGUAGES.map((lang) => {
              const isSelected = selectedLanguage === lang;
              return (
                <button
                  key={lang}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => onLanguageChange(lang)}
                  className={`p-2.5 rounded-lg border text-center font-medium transition-all flex items-center justify-center gap-1.5 text-xs select-none cursor-pointer ${
                    isSelected
                      ? 'bg-primary text-primary-foreground border-primary font-semibold shadow-xs ring-2 ring-primary/20'
                      : 'bg-surface-elevated border-border-subtle text-foreground-secondary hover:text-foreground hover:border-border-default hover:bg-surface-hover'
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 shrink-0 stroke-[2.5]" />}
                  <span className="truncate">{lang}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Opening Pitch Preview for Selected Language */}
        <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/20 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-primary font-bold tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
              Initial Spoken Pitch ({selectedLanguage})
            </span>
            <div className="flex items-center gap-2">
              {onOpenEmailModal && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenEmailModal();
                  }}
                  className="text-[10px] font-mono text-slate-300 hover:text-white flex items-center gap-1 cursor-pointer bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700"
                  title="Send this pitch via email"
                >
                  <Mail className="w-3 h-3 text-primary" />
                  <span>Email Pitch</span>
                </button>
              )}
              {onRegeneratePitch && (
                <button
                  type="button"
                  onClick={onRegeneratePitch}
                  disabled={isGeneratingPitch}
                  className="text-[10px] font-mono text-primary hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  <RotateCcw className={`w-3 h-3 ${isGeneratingPitch ? 'animate-spin' : ''}`} />
                  <span>{isGeneratingPitch ? 'Generating...' : 'Regenerate'}</span>
                </button>
              )}
            </div>
          </div>
          <p className="text-foreground text-xs leading-relaxed italic font-serif">
            {isGeneratingPitch ? (
              <span className="text-foreground-secondary animate-pulse">Generating personalized opening pitch in {selectedLanguage} using Ollama...</span>
            ) : (
              `"${currentPitch || 'Loading dynamic pitch...'}"`
            )}
          </p>
        </div>

        {/* Compliance Assurance Note */}
        <div className="flex items-center gap-2 pt-1 text-[11px] text-foreground-tertiary">
          <ShieldCheck className="w-3.5 h-3.5 text-signal-qualified shrink-0" />
          <span>Call recorded & transcribed under enterprise governance standards.</span>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-border-subtle">
          <div>
            {onOpenEmailModal && (
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<Mail className="w-3.5 h-3.5 text-primary" />}
                onClick={() => {
                  onClose();
                  onOpenEmailModal();
                }}
                className="text-xs"
              >
                Send Email Instead
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="secondary"
              size="sm"
              onClick={onClose}
            >
              Cancel
            </Button>

            <Button
              variant="primary"
              size="md"
              leftIcon={<PhoneCall className="w-4 h-4" />}
              disabled={!canLaunchCall}
              onClick={() => onConfirm(selectedLanguage, callMode, targetPhone)}
              className="font-semibold text-xs px-5 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              title={!canLaunchCall ? 'Calling is restricted during prospect quiet hours. Please check override checkbox.' : 'Launch autonomous voice call'}
            >
              {callMode === 'twilio_pstn' ? 'Dial Phone via Twilio' : 'Start Browser AI Call'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
