'use client';

import { useEffect, useState, useRef } from 'react';

/**
 * Minimal buffering state used while the feed or selected reel is starting.
 * Uses the same smooth progress loader from the splash screen.
 */
export function ReelLoading() {
  const [progress, setProgress] = useState(0);
  const [mounted, setMounted] = useState(false);
  const animationFrameRef = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const animatedProgressRef = useRef(0);
  const targetProgressRef = useRef(0);

  useEffect(() => {
    setMounted(true);

    // Simulate loading progress
    intervalRef.current = setInterval(() => {
      if (targetProgressRef.current < 90) {
        targetProgressRef.current = Math.min(90, targetProgressRef.current + Math.random() * 15 + 5);
      }
    }, 200);

    const animate = () => {
      if (animatedProgressRef.current < targetProgressRef.current) {
        animatedProgressRef.current = Math.min(
          targetProgressRef.current,
          animatedProgressRef.current + Math.max(0.5, (targetProgressRef.current - animatedProgressRef.current) * 0.1)
        );
        setProgress(animatedProgressRef.current);
      }
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
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
            aria-valuenow={mounted ? Math.round(progress) : 0}
          >
            <div
              className="h-full rounded-full bg-[#e50914] shadow-[0_0_10px_rgba(229,9,20,0.55)] transition-all duration-300"
              style={{ width: mounted ? `${Math.max(0, Math.min(100, progress))}%` : '0%' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
