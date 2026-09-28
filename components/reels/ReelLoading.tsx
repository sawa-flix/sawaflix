import Image from 'next/image';

/**
 * Compact brand loader for Reels — a small circular Sawaflix logo centered on
 * the feed so the loading state feels native instead of generic.
 */
export function ReelLoading() {
  return (
    <div className="relative z-10 flex h-full w-full items-center justify-center bg-[color:var(--background)]/95 backdrop-blur-sm">
      <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] shadow-[0_0_24px_rgba(206,17,38,0.18)] backdrop-blur-sm">
        <div className="absolute inset-0 rounded-full bg-[color:var(--primary-soft)] animate-pulse" />
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
