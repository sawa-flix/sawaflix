'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download } from 'lucide-react';
import Image from 'next/image';

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
    // launched from an iOS home screen — navigator.standalone is Safari's
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

    // Do not wait for the browser's install event to appear. Some browsers
    // never fire `beforeinstallprompt`, but the app still benefits from a
    // clear, branded install CTA when it is otherwise eligible.
    const globalPrompt = (window as any).deferredPrompt;
    if (globalPrompt) {
      setDeferredPrompt(globalPrompt);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    const showTimer = setTimeout(() => setShowPrompt(true), 1500);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      clearTimeout(showTimer);
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
      // We have the native prompt — trigger it.
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
      return;
    }

    // If the browser does not expose a native install event, keep the experience
    // self-contained and quietly close the prompt rather than forcing a system
    // alert popup that users often ignore.
    setShowPrompt(false);
    recordDismissal();
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
          className="fixed bottom-5 right-5 z-[9999] w-[340px] max-w-[calc(100vw-2rem)] rounded-md bg-[#11151c]/95 border border-white/10 shadow-2xl p-5 flex flex-col gap-4 overflow-hidden backdrop-blur-xl"
        >
          <button 
            onClick={handleDismiss}
            className="absolute top-3.5 right-3.5 text-zinc-500 hover:text-white transition-colors cursor-pointer"
            aria-label="Dismiss"
          >
            <X size={16} />
          </button>
          
          <div className="flex items-center gap-3.5 pr-5">
            <div className="w-12 h-12 rounded-md bg-[#0B0E14] border border-white/10 flex items-center justify-center shrink-0 shadow-md p-1.5 overflow-hidden">
              <Image 
                src="/logos_and_pwas/android-chrome-192x192.png" 
                alt="SawaFlix App" 
                width={192} 
                height={192} 
                className="h-full w-full object-contain" 
                priority
              />
            </div>
            <div className="flex flex-col">
              <h3 className="text-white font-semibold text-[13px] tracking-tight">Install SawaFlix App</h3>
              <p className="text-zinc-400 text-[11px] mt-0.5 leading-snug">Add to your home screen for smooth playback and offline culture.</p>
            </div>
          </div>

          <div className="h-px bg-white/5" />
          
          <div className="flex gap-3 justify-end">
            <button
              onClick={handleDismiss}
              className="px-5 py-2 bg-white/10 hover:bg-white/15 text-zinc-200 hover:text-white font-medium text-xs rounded-md transition-all cursor-pointer active:scale-[0.97]"
            >
              Maybe Later
            </button>
            <button
              onClick={handleInstallClick}
              className="px-5 py-2 bg-white hover:bg-zinc-100 text-[#0B0E14] font-bold text-xs rounded-md transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.97] shadow-sm"
            >
              <Download size={13} />
              Install
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
