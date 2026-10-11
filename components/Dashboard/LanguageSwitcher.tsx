'use client';

import React, { useState } from 'react';
import { useTranslations } from '../../lib/i18n/TranslationProvider';
import { Globe } from 'lucide-react';

export const LanguageSwitcher = () => {
  const { locale, setLocale } = useTranslations();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
  ];

  const currentLanguage = languages.find(lang => lang.code === locale) || languages[0];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-[color:var(--foreground)] transition-colors hover:bg-[color:var(--surface-hover)]"
        aria-label="Change language"
      >
        <Globe size={18} />
        <span className="hidden sm:inline">{currentLanguage.flag}</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full z-50 mt-2 w-48 overflow-hidden rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] shadow-xl">
            {languages.map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => {
                  setLocale(lang.code as 'en' | 'fr');
                  setIsOpen(false);
                }}
                className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition-colors hover:bg-[color:var(--surface-hover)] ${
                  locale === lang.code
                    ? 'bg-[color:var(--surface-hover)] font-semibold text-[color:var(--foreground)]'
                    : 'text-[color:var(--muted-foreground)]'
                }`}
              >
                <span className="text-2xl">{lang.flag}</span>
                <span>{lang.name}</span>
                {locale === lang.code && (
                  <span className="ml-auto text-[color:var(--primary)]">✓</span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

