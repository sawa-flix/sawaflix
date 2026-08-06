'use client';

import { Volume2, VolumeX } from 'lucide-react';

interface ReelHeaderProps {
  isMuted: boolean;
  onToggleMute: () => void;
}

/**
 * Mute toggle, floating over the top-left of the Reels box. Search used to
 * live here too, but now lives in the shared dashboard top navbar instead
 * (components/Dashboard/Header.tsx's ReelsSearchBar) — see
 * store/reelsSearchStore.ts for how ReelsFeed bridges its search state up
 * there. No back button here — Reels renders inside the normal dashboard
 * shell (left sidebar, header, browser back all work as on any other
 * page), so a dedicated in-page back control would just duplicate existing
 * navigation.
 */
export function ReelHeader({ isMuted, onToggleMute }: ReelHeaderProps) {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-40 flex items-start p-4">
      <button
        type="button"
        onClick={onToggleMute}
        aria-label={isMuted ? 'Unmute' : 'Mute'}
        aria-pressed={!isMuted}
        className="pointer-events-auto flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-black/40 text-white backdrop-blur-md transition-colors hover:bg-white/20"
      >
        {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
      </button>
    </div>
  );
}
