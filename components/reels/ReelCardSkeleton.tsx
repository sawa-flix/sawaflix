'use client';

import { useEffect, useState, useRef } from 'react';
import { MessageCircle, MoreHorizontal, Heart } from 'lucide-react';

/**
 * Skeleton loader for ReelCard that shows the card structure with loading states.
 * Displays action buttons (like, comment, sawai, more) as skeletons while the video loads.
 */
export function ReelCardSkeleton() {
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
    <div className="relative h-full w-full shrink-0 snap-start snap-always overflow-hidden bg-transparent">
      {/* Background - respects theme */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/10 dark:to-white/5" />

      {/* Center Loading Indicator */}
      <div className="absolute inset-0 z-10 flex items-center justify-center">
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
              className="relative h-2 flex-1 overflow-hidden rounded-full border border-black/5 bg-black/10 shadow-inner dark:border-white/5 dark:bg-white/15"
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

      {/* Skeleton Action Buttons - Right Side */}
      <div className="pointer-events-none absolute bottom-10 right-3 z-20 flex flex-col items-center gap-5">
        {/* Like Button Skeleton */}
        <div className="flex flex-col items-center gap-1">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black/40 backdrop-blur-md dark:bg-white/10 animate-pulse">
            <Heart size={28} className="text-white/50" />
          </div>
          <div className="h-3 w-8 rounded bg-black/20 dark:bg-white/20 animate-pulse" />
        </div>

        {/* Comment Button Skeleton */}
        <div className="flex flex-col items-center gap-1">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-black/30 backdrop-blur-md dark:bg-white/10 animate-pulse">
            <MessageCircle size={24} className="text-white/50" />
          </div>
          <div className="h-3 w-6 rounded bg-black/20 dark:bg-white/20 animate-pulse" />
        </div>

        {/* Sawai Button Skeleton */}
        <div className="flex flex-col items-center gap-1">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-black/40 backdrop-blur-md dark:bg-white/10 animate-pulse border border-white/15">
            <div className="w-7 h-7 rounded-full bg-white/20" />
          </div>
          <div className="h-2 w-10 rounded bg-black/20 dark:bg-white/20 animate-pulse" />
        </div>

        {/* More Options Button Skeleton */}
        <div className="flex flex-col items-center gap-1">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-black/30 backdrop-blur-md dark:bg-white/10 animate-pulse">
            <MoreHorizontal size={24} className="text-white/50" />
          </div>
        </div>
      </div>

      {/* Bottom Overlay Skeleton - Creator Info */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-16 z-20 p-4 pb-8">
        <div className="space-y-3">
          {/* Creator Avatar & Name */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-black/40 dark:bg-white/20 animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 rounded bg-black/40 dark:bg-white/20 animate-pulse" />
              <div className="h-3 w-20 rounded bg-black/30 dark:bg-white/15 animate-pulse" />
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <div className="h-3 w-3/4 rounded bg-black/30 dark:bg-white/15 animate-pulse" />
            <div className="h-3 w-1/2 rounded bg-black/30 dark:bg-white/15 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Progress Bar Skeleton */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 h-1 bg-black/20 dark:bg-white/10">
        <div className="h-full w-0 bg-red-500/50" />
      </div>
    </div>
  );
}
