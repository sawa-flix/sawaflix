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

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed (running in standalone mode)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Check if user has already dismissed the prompt recently
    const hasDismissed = localStorage.getItem('sawaflix_pwa_dismissed');
    if (hasDismissed) {
      const dismissDate = new Date(hasDismissed);
      const now = new Date();
      const daysSinceDismissal = (now.getTime() - dismissDate.getTime()) / (1000 * 3600 * 24);
      if (daysSinceDismissal < 14) return;
    }

    // Listen for the native install prompt event
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

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // We have the native prompt — trigger it
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      setShowPrompt(false);
      if (outcome === 'accepted') {
        localStorage.setItem('sawaflix_pwa_installed', 'true');
      }
    } else {
      // No native prompt available — guide the user
      // On Chrome desktop: the install icon is in the address bar
      // On mobile: "Add to Home Screen" in the browser menu
      alert(
        'To install Sawaflix:\n\n' +
        '• Chrome Desktop: Click the install icon (⊕) in the address bar\n' +
        '• Android: Tap the ⋮ menu → "Install app"\n' +
        '• iOS Safari: Tap the share icon → "Add to Home Screen"'
      );
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('sawaflix_pwa_dismissed', new Date().toISOString());
  };

  // Don't render anything if the app is already installed
  if (isInstalled) return null;

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 80, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 80, scale: 0.9 }}
          transition={{ type: 'spring', damping: 25, stiffness: 250, mass: 1.2 }}
          className="fixed bottom-6 left-6 z-[9999] w-[360px] max-w-[calc(100vw-3rem)] rounded-2xl bg-[#0B0E14]/95 backdrop-blur-xl border border-white/10 shadow-2xl p-5 flex flex-col gap-4 overflow-hidden"
          style={{
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 20px rgba(184, 0, 0, 0.15)',
          }}
        >
          {/* Subtle background glow effect */}
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#b80000]/10 to-transparent pointer-events-none" />

          <button 
            onClick={handleDismiss}
            className="absolute top-3 right-3 text-gray-500 hover:text-white hover:bg-white/10 p-1.5 rounded-full transition-all z-20"
            aria-label="Dismiss"
          >
            <X size={16} />
          </button>
          
          <div className="flex items-center gap-4 pr-6 relative z-10">
            <motion.div 
              initial={{ rotate: -10 }}
              animate={{ rotate: 0 }}
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: 'spring', damping: 15 }}
              className="w-14 h-14 bg-gradient-to-br from-[#e60000] to-[#8a0000] rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-[#b80000]/20"
            >
              <Smartphone size={26} className="text-white" />
            </motion.div>
            <div>
              <h3 className="text-white font-bold text-lg leading-tight tracking-tight">Install Sawaflix</h3>
              <p className="text-gray-400 text-sm mt-1 leading-snug">Offline mode, zero load times, and instant access.</p>
            </div>
          </div>
          
          <div className="flex gap-3 mt-1 relative z-10">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleInstallClick}
              className="flex-[3] bg-white text-black font-semibold py-2.5 px-4 rounded-xl text-sm transition-colors flex items-center justify-center gap-2 shadow-lg shadow-white/10 hover:bg-gray-100"
            >
              <Download size={16} className="text-[#b80000]" />
              Get App
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.1)' }}
              whileTap={{ scale: 0.97 }}
              onClick={handleDismiss}
              className="flex-[2] bg-white/5 text-gray-300 font-medium py-2.5 px-4 rounded-xl text-sm transition-all border border-white/5"
            >
              Later
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
