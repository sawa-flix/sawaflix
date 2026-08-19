'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Smartphone } from 'lucide-react';

// Define the BeforeInstallPromptEvent type
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: Array<string>;
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

// Permanent — set once the app is confirmed installed (native "Install"
// accepted, or the site is being viewed inside the installed app itself)
// so the popup never shows on this device again, even back in the browser.
const INSTALLED_KEY = 'sawaflix_pwa_installed';
// How many times "Maybe Later" (or a declined native prompt) has been hit —
// drives the escalating cooldown below.
const DISMISS_COUNT_KEY = 'sawaflix_pwa_dismiss_count';
// Epoch ms the popup is allowed to show again after a dismissal.
const DISMISSED_UNTIL_KEY = 'sawaflix_pwa_dismissed_until';
const DAY_MS = 24 * 60 * 60 * 1000;
const FIRST_COOLDOWN_DAYS = 7;
const REPEAT_COOLDOWN_DAYS = 30;

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed (running in standalone mode, or
    // launched from the iOS home screen — navigator.standalone is Safari's
    // older but still-necessary signal for that case).
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
      localStorage.setItem(INSTALLED_KEY, 'true');
      return;
    }

    // Installed previously (possibly from a different tab/session on this
    // device) — never show again, permanently.
    if (localStorage.getItem(INSTALLED_KEY) === 'true') {
      setIsInstalled(true);
      return;
    }

    // Still within a previous dismissal's cooldown window.
    const dismissedUntil = Number(localStorage.getItem(DISMISSED_UNTIL_KEY) || '0');
    if (dismissedUntil && Date.now() < dismissedUntil) {
      return;
    }

    // Check if the prompt was already caught globally by the script in layout.tsx
    const globalPrompt = (window as any).deferredPrompt;
    if (globalPrompt) {
      setDeferredPrompt(globalPrompt);
      setTimeout(() => setShowPrompt(true), 1500);
    }

    // Listen for the native install prompt event in case it fires after mount
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show our custom prompt
      setTimeout(() => setShowPrompt(true), 1500);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Fallback: if beforeinstallprompt never fires (dev mode, or already
    // eligible but event consumed), show the prompt after a short delay
    // so users can still see the install experience.
    const fallbackTimer = setTimeout(() => {
      setShowPrompt((current) => {
        // Only show if not already shown by beforeinstallprompt
        if (!current) return true;
        return current;
      });
    }, 2500);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      clearTimeout(fallbackTimer);
    };
  }, []);

  // Escalating cooldown: 7 days after the first dismissal, 30 days after
  // every one after that. Shared by the "Maybe Later" button and a declined
  // native install prompt, so either way of saying no backs off the same.
  const recordDismissal = () => {
    const prevCount = Number(localStorage.getItem(DISMISS_COUNT_KEY) || '0');
    const nextCount = prevCount + 1;
    const cooldownDays = nextCount === 1 ? FIRST_COOLDOWN_DAYS : REPEAT_COOLDOWN_DAYS;
    localStorage.setItem(DISMISS_COUNT_KEY, String(nextCount));
    localStorage.setItem(DISMISSED_UNTIL_KEY, String(Date.now() + cooldownDays * DAY_MS));
  };

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // We have the native prompt — trigger it
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      setShowPrompt(false);
      if (outcome === 'accepted') {
        localStorage.setItem(INSTALLED_KEY, 'true');
        setIsInstalled(true);
      } else {
        recordDismissal();
      }
    } else {
      // If we don't have the prompt, show a sleeker in-app instruction instead of an alert
      // or simply focus the user on the browser's install icon
      const userAgent = window.navigator.userAgent.toLowerCase();
      const isIOS = /iphone|ipad|ipod/.test(userAgent);
      
      if (isIOS) {
        alert('To install: tap the Share icon at the bottom, then "Add to Home Screen"');
      } else {
        alert('To install on Desktop: Look for the Install icon (usually a monitor with a down-arrow or a + sign) on the right side of your address bar, then click "Install".');
        setShowPrompt(false);
      }
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    recordDismissal();
  };

  // Don't render anything if the app is already installed
  if (isInstalled) return null;

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-6 right-6 z-[9999] w-[340px] max-w-[calc(100vw-3rem)] rounded-xl bg-[#111111] border border-[#222222] shadow-2xl p-5 flex flex-col gap-4 overflow-hidden"
        >
          <button 
            onClick={handleDismiss}
            className="absolute top-3 right-3 text-[#666666] hover:text-white transition-colors cursor-pointer"
            aria-label="Dismiss"
          >
            <X size={16} />
          </button>
          
          <div className="flex items-start gap-4 pr-6">
            <div className="w-12 h-12 bg-[#b80000] rounded-lg flex items-center justify-center shrink-0 shadow-sm">
              <Smartphone size={22} className="text-white" />
            </div>
            <div className="flex flex-col pt-0.5">
              <h3 className="text-white font-medium text-base tracking-tight">Get the Sawaflix App</h3>
              <p className="text-[#888888] text-sm mt-1 leading-snug">Install for zero load times and an offline experience.</p>
            </div>
          </div>
          
          <div className="flex gap-3 mt-1">
            <button
              onClick={handleInstallClick}
              className="flex-1 bg-[#b80000] hover:bg-[#a00000] text-white font-medium py-2 px-3 rounded-lg text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download size={16} />
              Install
            </button>
            <button
              onClick={handleDismiss}
              className="flex-1 bg-[#222222] hover:bg-[#333333] text-[#aaaaaa] hover:text-white font-medium py-2 px-3 rounded-lg text-sm transition-colors cursor-pointer"
            >
              Maybe Later
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
