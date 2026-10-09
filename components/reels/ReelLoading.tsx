'use client';

import { useEffect, useState } from 'react';

/**
 * Minimal buffering state used while the feed or selected reel is starting.
 * Uses the same smooth progress loader from the splash screen.
 */
export function ReelLoading() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let animatedProgress = 0;
    let targetProgress = 0;
    let frameId: number;
    let intervalId: ReturnType<typeof setInterval>;

    // Simulate loading progress
    intervalId = setInterval(() => {
      if (targetProgress < 90) {
        targetProgress = Math.min(90, targetProgress + Math.random() * 15 + 5);
      }
    }, 200);

    const animate = () => {
      if (animatedProgress < targetProgress) {
        animatedProgress = Math.min(
          targetProgress,
          animatedProgress + Math.max(0.5, (targetProgress - animatedProgress) * 0.1)
        );
        setProgress(animatedProgress);
      }
      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);

    return () => {
      clearInterval(intervalId);
      cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <div
      role="status"
      aria-label="Loading reel"
      className="absolute inset-0 z-10 flex items-center justify-center"
    >
      <div className="w-full max-w-xs px-6">
        <div className="flex items-center gap-2">
          <span
            className="flex h-4 w-4 items-center justify-center rounded-full bg-[#E50914] shadow-[0_0_12px_rgba(229,9,20,0.45)]"
            aria-hidden="true"
          >
            <svg viewBox="0 0 24 24" className="ml-[1px] h-2.5 w-2.5 fill-white" aria-hidden="true">
              <path d="M8 5.5v13l9-6.5-9-6.5Z" />
            </svg>
          </span>
          <div
            className="relative h-2 flex-1 overflow-hidden rounded-full border border-black/5 bg-black/10 shadow-inner dark:bg-white/15"
            role="progressbar"
            aria-label="Reel loading progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress)}
          >
            <div
              className="h-full rounded-full bg-[#e50914] shadow-[0_0_10px_rgba(229,9,20,0.55)] transition-all duration-300"
              style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
