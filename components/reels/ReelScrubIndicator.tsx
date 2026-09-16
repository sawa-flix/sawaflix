'use client';

import { motion } from 'framer-motion';
import { formatDuration } from '@/utils/reels/reelHelpers';

interface ReelScrubIndicatorProps {
  currentTime: number;
  duration: number;
}

/** Floating timestamp + progress bar shown while press-and-hold scrubbing. */
export function ReelScrubIndicator({ currentTime, duration }: ReelScrubIndicatorProps) {
  const percent = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.92 }}
      transition={{ duration: 0.15 }}
      className="pointer-events-none absolute inset-x-0 top-1/2 z-30 flex -translate-y-1/2 flex-col items-center gap-3 px-10"
    >
      <div className="rounded-full bg-black/70 px-4 py-2 backdrop-blur-md">
        <span className="text-sm font-bold tabular-nums text-white">
          {formatDuration(currentTime)} <span className="text-white/50">/ {formatDuration(duration)}</span>
        </span>
      </div>
      <div className="h-1 w-full max-w-[220px] overflow-hidden rounded-full bg-white/25">
        <div className="h-full bg-white transition-none" style={{ width: `${percent}%` }} />
      </div>
    </motion.div>
  );
}
