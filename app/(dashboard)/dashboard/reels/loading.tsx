import { ReelLoading } from '@/components/reels/ReelLoading';

/**
 * Route-level loading UI (Next.js App Router convention) — shown while
 * page.tsx's server-side culture-feed fetch is in flight, e.g. right after
 * navigating here from the right sidebar's "open this reel" links.
 */
export default function ReelsLoading() {
  return (
    <div className="h-[calc(100vh-7rem)] min-h-[500px] w-full">
      <ReelLoading />
    </div>
  );
}
