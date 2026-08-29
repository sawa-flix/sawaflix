import Image from 'next/image';

/**
 * Compact brand loader for Reels — a small circular Sawaflix logo centered on
 * the feed so the loading state feels native instead of generic.
 */
export function ReelLoading() {
  return (
    <div className="relative flex h-full w-full items-center justify-center bg-[#0B0E14]">
      <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-white/5 shadow-[0_0_24px_rgba(206,17,38,0.18)] backdrop-blur-sm">
        <div className="absolute inset-0 rounded-full bg-red-600/10 animate-pulse" />
        <Image
          src="/logos_and_pwas/loaderLogo.png"
          alt=""
          width={128}
          height={128}
          priority
          className="relative h-12 w-12 animate-[spin_2.2s_linear_infinite] object-contain"
        />
      </div>
    </div>
  );
}
