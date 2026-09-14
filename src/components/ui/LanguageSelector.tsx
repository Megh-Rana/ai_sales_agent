import React, { useState, useRef, useEffect } from 'react';
import { Globe, Check } from 'lucide-react';
import { useI18n } from '../../i18n/i18nContext';
import { languages, Language } from '../../i18n/locales';

interface LanguageSelectorProps {
  className?: string;
  variant?: 'default' | 'minimal';
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ 
  className = '', 
  variant = 'default' 
}) => {
  const { language, setLanguage } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentLanguage = languages.find((l) => l.code === language);

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    setIsOpen(false);
  };

  if (variant === 'minimal') {
    return (
      <div className={`relative ${className}`} ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-elevated hover:bg-surface-hover border border-border transition-colors text-xs font-medium text-foreground"
          aria-label="Select language"
          aria-expanded={isOpen}
        >
          <Globe className="w-3.5 h-3.5" />
          <span className="font-semibold">{currentLanguage?.code.toUpperCase()}</span>
        </button>

        {isOpen && (
          <div className="absolute right-0 top-full mt-2 w-48 bg-surface border border-border-strong rounded-xl shadow-lg overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            {languages.map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => handleLanguageChange(lang.code)}
                className={`w-full flex items-center justify-between px-4 py-2.5 text-left text-xs transition-colors ${
                  language === lang.code
                    ? 'bg-primary/10 text-primary'
                    : 'text-foreground hover:bg-surface-hover'
                }`}
              >
                <div className="flex flex-col">
                  <span className="font-semibold">{lang.nativeName}</span>
                  <span className="text-[10px] text-foreground-tertiary">{lang.name}</span>
                </div>
                {language === lang.code && <Check className="w-4 h-4" />}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-elevated hover:bg-surface-hover border border-border transition-all text-sm font-medium text-foreground"
        aria-label="Select language"
        aria-expanded={isOpen}
      >
        <Globe className="w-4 h-4" />
        <span>{currentLanguage?.nativeName}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-surface border border-border-strong rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-2 border-b border-border">
            <p className="text-xs font-semibold text-foreground-tertiary uppercase tracking-wide px-2">
              Select Language
            </p>
          </div>
          <div className="p-1">
            {languages.map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => handleLanguageChange(lang.code)}
                className={`w-full flex items-center justify-between px-3 py-2.5 text-left text-sm rounded-lg transition-all ${
                  language === lang.code
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-foreground hover:bg-surface-hover'
                }`}
              >
                <div className="flex flex-col">
                  <span className="font-medium">{lang.nativeName}</span>
                  <span className="text-xs text-foreground-tertiary">{lang.name}</span>
                </div>
                {language === lang.code && <Check className="w-4 h-4" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
