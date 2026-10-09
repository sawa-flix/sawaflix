import { ReelCardSkeleton } from '@/components/reels/ReelCardSkeleton';

/**
 * Route-level loading UI (Next.js App Router convention) — shown while
 * page.tsx's server-side culture-feed fetch is in flight, e.g. right after
 * navigating here from the right sidebar's "open this reel" links.
 */
export default function ReelsLoading() {
  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <div className="relative h-full w-full snap-y snap-mandatory overflow-hidden scroll-smooth
                   lg:h-full lg:w-auto lg:aspect-[9/16] lg:max-h-full
                   lg:rounded-[1.75rem] lg:ring-1 lg:ring-[color:var(--border)] lg:shadow-[0_25px_80px_-20px_rgba(0,0,0,0.85)]">
        <ReelCardSkeleton />
      </div>
    </div>
  );
}
