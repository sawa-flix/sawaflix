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
          className="fixed top-16 left-0 right-0 z-[45] mx-auto max-w-7xl px-4 lg:px-8"
        >
          <div className="relative overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] shadow-2xl backdrop-blur-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-[color:var(--primary)]/5 via-transparent to-[color:var(--primary)]/5 opacity-50" />
            <div className="relative px-6 py-4 sm:px-8 sm:py-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  {/* SawaFlix Logo */}
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[color:var(--primary)]/20 to-[color:var(--primary)]/10 p-2 shadow-lg">
                    <div className="relative h-full w-full">
                      <Image
                        src="/logos_and_pwas/headerLogo..png"
                        alt="SawaFlix"
                        fill
                        className="object-contain block [[data-theme=light]_&]:hidden"
                      />
                      <Image
                        src="/logos_and_pwas/sawa.svg"
                        alt="SawaFlix"
                        fill
                        className="object-contain hidden [[data-theme=light]_&]:block"
                      />
                    </div>
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-[color:var(--foreground)] sm:text-xl">
                        Coming Soon: "The Lion's Heart"
                      </h3>
                      <span className="rounded-full bg-[color:var(--primary)]/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[color:var(--primary)]">
                        Premiere
                      </span>
                    </div>
                    <p className="text-sm text-[color:var(--muted-foreground)] sm:text-base">
                      A powerful tale of courage and tradition. Be among the first to watch this epic Cameroonian production.
                    </p>
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="flex gap-2 sm:gap-3">
                        {[
                          { label: 'Days', value: countdown.days },
                          { label: 'Hours', value: countdown.hours },
                          { label: 'Min', value: countdown.minutes },
                          { label: 'Sec', value: countdown.seconds }
                        ].map((item) => (
                          <div key={item.label} className="flex flex-col items-center">
                            <span className="text-xl font-black tabular-nums text-[color:var(--foreground)] sm:text-2xl">
                              {String(item.value).padStart(2, '0')}
                            </span>
                            <span className="text-[9px] font-medium uppercase tracking-wide text-[color:var(--muted-foreground)] sm:text-[10px]">
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
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[color:var(--muted-foreground)] transition-colors hover:bg-[color:var(--surface-hover)] hover:text-[color:var(--foreground)]"
                  aria-label="Dismiss announcement"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
