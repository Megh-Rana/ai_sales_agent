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
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-elevated hover:bg-surface-hover border border-border-strong transition-colors text-xs font-semibold text-foreground shadow-xs"
          aria-label="Select language"
          aria-expanded={isOpen}
        >
          <Globe className="w-3.5 h-3.5 text-primary shrink-0" />
          <span className="font-bold tracking-wide">{currentLanguage?.code.toUpperCase()}</span>
        </button>

        {isOpen && (
          <div className="absolute right-0 top-full mt-2 w-52 bg-surface border border-border-strong rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200 divide-y divide-border-subtle">
            <div className="p-1.5">
              {languages.map((lang) => {
                const isSelected = language === lang.code;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => handleLanguageChange(lang.code)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-xs transition-colors ${
                      isSelected
                        ? 'bg-primary/15 text-primary font-bold border border-primary/30'
                        : 'text-foreground hover:bg-surface-hover'
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="font-semibold text-foreground">{lang.nativeName}</span>
                      <span className={`text-[10px] ${isSelected ? 'text-primary font-medium' : 'text-foreground-secondary'}`}>
                        {lang.name}
                      </span>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-primary shrink-0" />}
                  </button>
                );
              })}
            </div>
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
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-elevated hover:bg-surface-hover border border-border-strong transition-all text-sm font-semibold text-foreground shadow-xs"
        aria-label="Select language"
        aria-expanded={isOpen}
      >
        <Globe className="w-4 h-4 text-primary shrink-0" />
        <span className="font-medium text-foreground">{currentLanguage?.nativeName}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-surface border border-border-strong rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="px-3 py-2 border-b border-border bg-surface-subtle">
            <p className="text-[11px] font-bold text-foreground-secondary uppercase tracking-wider">
              Select Language
            </p>
          </div>
          <div className="p-1.5 space-y-0.5">
            {languages.map((lang) => {
              const isSelected = language === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 text-left text-sm rounded-lg transition-all ${
                    isSelected
                      ? 'bg-primary/15 text-primary font-bold border border-primary/30'
                      : 'text-foreground hover:bg-surface-hover'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="font-semibold text-foreground">{lang.nativeName}</span>
                    <span className={`text-xs ${isSelected ? 'text-primary font-medium' : 'text-foreground-secondary'}`}>
                      {lang.name}
                    </span>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-primary shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
