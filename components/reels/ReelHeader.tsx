'use client';

import { Volume2, VolumeX } from 'lucide-react';

interface ReelHeaderProps {
  isMuted: boolean;
  onToggleMute: () => void;
}

/**
 * Mute toggle, floating over the top-left of the Reels box. Desktop only —
 * on phones the header renders a compact fullscreen bar (back + search +
 * mute, all floating over the video with no reserved bar space) instead,
 * reading mute state via store/reelsMuteStore.ts the same way search is
 * bridged via store/reelsSearchStore.ts. No back button here on desktop —
 * Reels renders inside the normal dashboard shell (left sidebar, header,
 * browser back all work as on any other page), so a dedicated in-page back
 * control would just duplicate existing navigation.
 */
export function ReelHeader({ isMuted, onToggleMute }: ReelHeaderProps) {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-40 hidden items-start p-4 md:flex">
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
