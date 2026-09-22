import React from 'react';
import {
  PhoneCall,
  Languages,
  Target,
  ShieldCheck,
  Check,
  Building2,
  User,
  Radio,
  Zap
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { CallLanguage } from '../../types/calls';

export interface CallConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedLanguage: CallLanguage) => void;
  companyName: string;
  contactName: string;
  contactRole: string;
  objective: string;
  whyNow?: string;
  selectedLanguage: CallLanguage;
  onLanguageChange: (lang: CallLanguage) => void;
}

const AVAILABLE_LANGUAGES: CallLanguage[] = ['English', 'Hindi', 'Gujarati', 'Hinglish'];

export const CallConfirmationModal: React.FC<CallConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  companyName,
  contactName,
  contactRole,
  objective,
  whyNow,
  selectedLanguage,
  onLanguageChange
}) => {
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

        {/* Compliance Assurance Note */}
        <div className="flex items-center gap-2 pt-1 text-[11px] text-foreground-tertiary">
          <ShieldCheck className="w-3.5 h-3.5 text-signal-qualified shrink-0" />
          <span>Call recorded & transcribed under enterprise governance standards.</span>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border-subtle">
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
            onClick={() => onConfirm(selectedLanguage)}
            className="font-semibold text-xs px-5 shadow-sm"
          >
            Start AI Call
          </Button>
        </div>
      </div>
    </Modal>
  );
};
