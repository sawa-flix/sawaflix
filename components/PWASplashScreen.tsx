'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

const SESSION_KEY = 'sawaflix:splash-shown:v1';
const LOAD_TIMEOUT_MS = 20_000;
const APP_READY_EVENT = 'sawaflix:app-ready';

export default function PWASplashScreen() {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [timedOut, setTimedOut] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const targetProgressRef = useRef(0);
  const reducedMotionRef = useRef(false);

  useEffect(() => {
    try {
      if (window.sessionStorage.getItem(SESSION_KEY) === '1') {
        setVisible(false);
        return;
      }
    } catch {
      // The splash still works when storage is unavailable.
    }

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    reducedMotionRef.current = motionQuery.matches;
    setReducedMotion(motionQuery.matches);
    const onMotionChange = (event: MediaQueryListEvent) => {
      reducedMotionRef.current = event.matches;
      setReducedMotion(event.matches);
    };
    motionQuery.addEventListener('change', onMotionChange);

    let disposed = false;
    let completed = false;
    let imageCount = 0;
    let settledImages = 0;
    let animationFrame = 0;
    let fadeTimer = 0;
    let hideTimer = 0;
    const trackedImages = new WeakSet<HTMLImageElement>();

    const updateTarget = () => {
      if (disposed || completed) return;
      const domReady = document.readyState !== 'loading';
      const imageRatio = imageCount > 0 ? settledImages / imageCount : domReady ? 1 : 0;
      const fontsReady = !('fonts' in document) || document.fonts.status === 'loaded';
      targetProgressRef.current = Math.min(90, (domReady ? 24 : 8) + imageRatio * 50 + (fontsReady ? 16 : 0));
    };

    const trackImage = (image: HTMLImageElement) => {
      if (trackedImages.has(image)) return;
      trackedImages.add(image);
      imageCount += 1;
      if (image.complete) {
        settledImages += 1;
        updateTarget();
        return;
      }
      const settle = () => {
        settledImages += 1;
        image.removeEventListener('load', settle);
        image.removeEventListener('error', settle);
        updateTarget();
      };
      image.addEventListener('load', settle, { once: true });
      image.addEventListener('error', settle, { once: true });
      updateTarget();
    };

    Array.from(document.images).forEach(trackImage);
    const imageObserver = new MutationObserver((records) => {
      records.forEach((record) => record.addedNodes.forEach((node) => {
        if (!(node instanceof HTMLElement)) return;
        if (node instanceof HTMLImageElement) trackImage(node);
        node.querySelectorAll('img').forEach(trackImage);
      }));
    });
    imageObserver.observe(document.documentElement, { childList: true, subtree: true });

    const finish = () => {
      if (disposed || completed) return;
      completed = true;
      setTimedOut(false);
      targetProgressRef.current = 100;
      try {
        window.sessionStorage.setItem(SESSION_KEY, '1');
      } catch {
        // Continue without session persistence when storage is blocked.
      }
      fadeTimer = window.setTimeout(() => {
        if (disposed) return;
        setFading(true);
        hideTimer = window.setTimeout(() => {
          if (!disposed) setVisible(false);
        }, reducedMotionRef.current ? 0 : 280);
      }, reducedMotionRef.current ? 0 : 120);
    };

    const onDomReady = () => updateTarget();
    document.addEventListener('DOMContentLoaded', onDomReady);
    window.addEventListener('load', finish, { once: true });
    window.addEventListener(APP_READY_EVENT, finish, { once: true });
    void document.fonts?.ready.then(updateTarget);

    const timeout = window.setTimeout(() => {
      if (!disposed && !completed) setTimedOut(true);
    }, LOAD_TIMEOUT_MS);

    if (document.readyState === 'complete') {
      updateTarget();
      animationFrame = window.requestAnimationFrame(() => {
        targetProgressRef.current = 90;
        finish();
      });
    } else {
      updateTarget();
    }

    const animate = () => {
      if (disposed) return;
      setProgress((current) => {
        const target = targetProgressRef.current;
        if (current >= target) return current;
        if (reducedMotionRef.current) return target;
        return Math.min(target, current + Math.max(0.2, (target - current) * 0.07));
      });
      animationFrame = window.requestAnimationFrame(animate);
    };
    animationFrame = window.requestAnimationFrame(animate);

    return () => {
      disposed = true;
      imageObserver.disconnect();
      window.clearTimeout(timeout);
      window.clearTimeout(fadeTimer);
      window.clearTimeout(hideTimer);
      window.cancelAnimationFrame(animationFrame);
      document.removeEventListener('DOMContentLoaded', onDomReady);
      window.removeEventListener('load', finish);
      window.removeEventListener(APP_READY_EVENT, finish);
      motionQuery.removeEventListener('change', onMotionChange);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[999999] flex flex-col items-center justify-center bg-[color:var(--background)] px-6 text-[color:var(--foreground)] ${reducedMotion ? '' : 'transition-opacity duration-300'} ${fading ? 'opacity-0' : 'opacity-100'}`}
      role="status"
      aria-label={timedOut ? 'SawaFlix is taking longer than expected to load' : 'Loading SawaFlix'}
      aria-live="polite"
    >
      <div className="flex w-full max-w-xs flex-col items-center">
        <Image
          src="/logos_and_pwas/android-chrome-512x512.png"
          alt="SawaFlix"
          width={512}
          height={512}
          priority
          className={`mb-9 h-24 w-24 object-contain sm:h-28 sm:w-28 ${reducedMotion ? '' : 'animate-[splash-arrive_.45s_ease-out_both]'}`}
        />
        <div className="w-full">
          <div
            className="h-[3px] w-full overflow-hidden rounded-full bg-[color:var(--surface-hover)]"
            role="progressbar"
            aria-label="App loading progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress)}
          >
            <div
              className={`h-full rounded-full bg-[#E50914] ${reducedMotion ? '' : 'transition-[width] duration-150 ease-out'}`}
              style={{ width: `${Math.min(100, progress)}%` }}
            />
          </div>
          {timedOut && (
            <div className="mt-5 text-center">
              <p className="text-xs text-[color:var(--muted-foreground)]">SawaFlix is taking longer than expected.</p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-3 rounded-lg bg-[color:var(--foreground)] px-4 py-2 text-xs font-bold text-[color:var(--background)] transition-opacity hover:opacity-80"
              >
                Retry loading
              </button>
            </div>
          )}
        </div>
      </div>
      <style jsx global>{`
        @keyframes splash-arrive { from { opacity: 0; transform: translateY(5px) scale(.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important; scroll-behavior: auto !important; } }
      `}</style>
    </div>
  );
}
