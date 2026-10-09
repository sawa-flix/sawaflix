'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

export default function AnnouncementBanner() {
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // Check if announcement was dismissed
  useEffect(() => {
    const dismissed = localStorage.getItem('sawaflix-announcement-dismissed');
    if (!dismissed) {
      setShowAnnouncement(true);
    }
  }, []);

  // Countdown timer
  useEffect(() => {
    const targetDate = new Date('2026-11-01T00:00:00').getTime();
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        clearInterval(timer);
        return;
      }

      setCountdown({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleDismiss = () => {
    setShowAnnouncement(false);
    localStorage.setItem('sawaflix-announcement-dismissed', 'true');
  };

  return (
    <AnimatePresence>
      {showAnnouncement && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="fixed top-[4.5rem] left-0 right-0 z-[45] mx-auto max-w-7xl px-4 lg:px-8 scale-90"
        >
          <div className="relative overflow-hidden rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] shadow-lg backdrop-blur-sm">
            <div className="relative px-5 py-3 sm:px-6 sm:py-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  {/* SawaFlix Loader Logo */}
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[color:var(--surface-hover)] p-2">
                    <div className="relative h-full w-full">
                      <Image
                        src="/logos_and_pwas/loaderLogo.png"
                        alt="SawaFlix"
                        fill
                        sizes="40px"
                        className="object-contain"
                      />
                    </div>
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-[color:var(--foreground)] sm:text-lg">
                        Coming Soon: "The Lion's Heart"
                      </h3>
                      <span className="rounded-full bg-[color:var(--primary)]/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[color:var(--primary)]">
                        Premiere
                      </span>
                    </div>
                    <p className="text-xs text-[color:var(--muted-foreground)] sm:text-sm">
                      A powerful tale of courage and tradition. Be among the first to watch this epic Cameroonian production.
                    </p>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="flex gap-2">
                        {[
                          { label: 'Days', value: countdown.days },
                          { label: 'Hours', value: countdown.hours },
                          { label: 'Min', value: countdown.minutes },
                          { label: 'Sec', value: countdown.seconds }
                        ].map((item) => (
                          <div key={item.label} className="flex flex-col items-center">
                            <span className="text-lg font-black tabular-nums text-[color:var(--foreground)] sm:text-xl">
                              {String(item.value).padStart(2, '0')}
                            </span>
                            <span className="text-[8px] font-medium uppercase tracking-wide text-[color:var(--muted-foreground)] sm:text-[9px]">
                              {item.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleDismiss}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[color:var(--muted-foreground)] transition-colors hover:bg-[color:var(--surface-hover)] hover:text-[color:var(--foreground)]"
                  aria-label="Dismiss announcement"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
