'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

export default function PWASplashScreen() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Determine if running as installed PWA or initial page visit
    const isStandalone =
      typeof window !== 'undefined' &&
      (window.matchMedia('(display-mode: standalone)').matches ||
       (window.navigator as unknown as { standalone?: boolean }).standalone === true);

    // Keep splash visible briefly for smooth app launch transition
    const displayDuration = isStandalone ? 1200 : 700;

    const timer = setTimeout(() => {
      setIsVisible(false);
    }, displayDuration);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="pwa-splash-screen"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: 'easeInOut' }}
          className="fixed inset-0 z-[999999] flex flex-col items-center justify-center bg-white select-none pointer-events-auto"
          aria-hidden="true"
        >
          <div className="flex flex-col items-center justify-center gap-5">
            {/* App Logo */}
            <motion.div
              initial={{ scale: 0.88, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-white shadow-[0_10px_35px_rgba(0,0,0,0.08)] border border-zinc-100 flex items-center justify-center p-3.5 overflow-hidden"
            >
              <Image
                src="/logos_and_pwas/android-chrome-192x192.png"
                alt="sawaFlix"
                width={192}
                height={192}
                className="w-full h-full object-contain"
                priority
              />
            </motion.div>

            {/* Dark Text Label "sawaFlix" */}
            <motion.div
              initial={{ y: 8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.45, delay: 0.1, ease: 'easeOut' }}
              className="flex flex-col items-center gap-1.5 text-center"
            >
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B0E14] tracking-tight font-sans">
                sawaFlix
              </h1>
              <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-[0.25em]">
                Authentic Culture & Entertainment
              </p>
            </motion.div>

            {/* Subtle Progress Bar */}
            <div className="w-28 h-1 bg-zinc-100 rounded-full overflow-hidden mt-4">
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
                className="w-1/2 h-full bg-[#0B0E14] rounded-full"
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
