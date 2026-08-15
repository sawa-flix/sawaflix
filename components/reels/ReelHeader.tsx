'use client';

import { Volume2, VolumeX } from 'lucide-react';

interface ReelHeaderProps {
  isMuted: boolean;
  onToggleMute: () => void;
}

/**
 * Mute toggle, floating over the top-right of the Reels box. No back
 * button here — Reels renders inside the normal dashboard shell now (left
 * sidebar, header, browser back all work as on any other page), so a
 * dedicated in-page back control would just duplicate existing navigation.
 */
export function ReelHeader({ isMuted, onToggleMute }: ReelHeaderProps) {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-40 flex items-center justify-end p-4">
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
