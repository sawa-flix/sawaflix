'use client';

import { ChevronLeft, Volume2, VolumeX } from 'lucide-react';

interface ReelHeaderProps {
  title?: string;
  isMuted: boolean;
  onToggleMute: () => void;
  onBack: () => void;
}

/**
 * One persistent header for the whole Reels page — back button, title,
 * global mute toggle. The old implementation duplicated a watermark/mute
 * button on every single card; since only one card is ever visible at a
 * time in a fullscreen swipe feed, a single page-level header is simpler
 * and removes that duplication.
 */
export function ReelHeader({ title = 'Reels', isMuted, onToggleMute, onBack }: ReelHeaderProps) {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-40 flex items-center justify-between p-4">
      <button
        type="button"
        onClick={onBack}
        aria-label="Back to dashboard"
        className="pointer-events-auto flex items-center gap-1.5 rounded-full bg-black/40 px-3 py-2 text-xs font-bold uppercase tracking-widest text-white/80 backdrop-blur-md transition-colors hover:bg-white/10 hover:text-white"
      >
        <ChevronLeft size={16} />
        {title}
      </button>

      <button
        type="button"
        onClick={onToggleMute}
        aria-label={isMuted ? 'Unmute' : 'Mute'}
        aria-pressed={!isMuted}
        className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/40 text-white backdrop-blur-md transition-colors hover:bg-white/20"
      >
        {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
      </button>
    </div>
  );
}
