'use client';

import { Share2 } from 'lucide-react';

interface ProfileShareProps {
  title: string;
}

/** Shared share button — native share sheet where supported, clipboard fallback otherwise. */
export function ProfileShare({ title }: ProfileShareProps) {
  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    try {
      if (navigator.share) await navigator.share({ title, url });
      else await navigator.clipboard.writeText(url);
    } catch {
      // user cancelled the native share sheet — not an error
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      aria-label="Share profile"
      className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition-colors hover:bg-white/10"
    >
      <Share2 size={16} />
    </button>
  );
}
