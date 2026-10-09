import { ReelCardSkeleton } from '@/components/reels/ReelCardSkeleton';

/**
 * Route-level loading UI (Next.js App Router convention) — shown while
 * page.tsx's server-side culture-feed fetch is in flight, e.g. right after
 * navigating here from the right sidebar's "open this reel" links.
 */
export default function ReelsLoading() {
  return (
    <div className="relative isolate h-[calc(100vh-7rem)] min-h-[500px] w-full overflow-hidden">
      <ReelCardSkeleton />
    </div>
  );
}
