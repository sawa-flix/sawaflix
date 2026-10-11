'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from '@/lib/i18n/TranslationProvider';
import { X, Languages } from 'lucide-react';

export function LanguageDetectionBanner() {
  const { locale, setLocale } = useTranslations();
  const [showBanner, setShowBanner] = useState(false);
  const [suggestedLocale, setSuggestedLocale] = useState<'en' | 'fr' | null>(null);

  useEffect(() => {
    // Check if user has already dismissed the banner
    const dismissed = localStorage.getItem('language-banner-dismissed');
    if (dismissed === 'true') return;

    // Detect browser language
    const browserLang = navigator.language.toLowerCase();
    let detected: 'en' | 'fr' | null = null;

    // Check for French
    if (browserLang.startsWith('fr')) {
      detected = 'fr';
    }
    // Check for English
    else if (browserLang.startsWith('en')) {
      detected = 'en';
    }

    // Show banner if detected language differs from current locale
    if (detected && detected !== locale) {
      setSuggestedLocale(detected);
      setShowBanner(true);
    }
  }, [locale]);

  const handleSwitch = () => {
    if (suggestedLocale) {
      setLocale(suggestedLocale);
      setShowBanner(false);
      localStorage.setItem('language-banner-dismissed', 'true');
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('language-banner-dismissed', 'true');
  };

  if (!showBanner || !suggestedLocale) return null;

  const messages = {
    en: {
      text: 'Would you like to switch to English?',
      switch: 'Switch to English',
      dismiss: 'No, thanks'
    },
    fr: {
      text: 'Voulez-vous passer au français ?',
      switch: 'Passer au français',
      dismiss: 'Non, merci'
    }
  };

  const message = messages[suggestedLocale];

  return (
    <div className="fixed top-16 left-1/2 z-[100] w-full max-w-md -translate-x-1/2 px-4 animate-in slide-in-from-top-5 duration-300">
      <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] p-4 shadow-lg backdrop-blur-md">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-500/20">
            <Languages className="h-5 w-5 text-blue-500" />
          </div>

          <div className="flex-1">
            <p className="text-sm font-medium text-[color:var(--foreground)] mb-3">
              {message.text}
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSwitch}
                className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-600"
              >
                {message.switch}
              </button>

              <button
                onClick={handleDismiss}
                className="rounded-lg px-4 py-2 text-sm font-medium text-[color:var(--muted-foreground)] transition-colors hover:bg-[color:var(--surface-hover)]"
              >
                {message.dismiss}
              </button>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            className="flex-shrink-0 rounded-lg p-1 text-[color:var(--muted-foreground)] transition-colors hover:bg-[color:var(--surface-hover)] hover:text-[color:var(--foreground)]"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
