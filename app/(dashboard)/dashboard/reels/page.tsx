import { getCultureFeedAction } from '@/app/actions/youtube';
import type { Video } from '@/types/youtube';
import { mapYoutubeItem, extractVideoId, type RawYoutubeFeedItem } from '@/utils/reels/mapYoutubeItem';
import { ReelsFeed } from '@/components/reels/ReelsFeed';

interface ReelsPageProps {
  searchParams: Promise<{ id?: string }>;
}

/**
 * Server Component: fetches the first page of the same YouTube culture feed
 * SawaFlix.jsx's default dashboard feed uses (getCultureFeedAction), so the
 * first reel renders with no client-side round trip. Pagination beyond page
 * 1 is owned by useReels inside ReelsFeed.
 */
export default async function ReelsPage({ searchParams }: ReelsPageProps) {
  const { id: initialVideoId } = await searchParams;

  let videos: Video[] = [];
  let hasMore = false;

  try {
    const response = await getCultureFeedAction(1, 20);
    const feedList: RawYoutubeFeedItem[] = response?.feed || [];
    videos = feedList.filter((item) => !!extractVideoId(item)).map(mapYoutubeItem);
    hasMore = !!response?.pagination?.next_page;
  } catch (error) {
    console.error('[ReelsPage] Failed to fetch initial feed:', error);
  }

  return (
    // Sized to the dashboard's own content area, not the browser viewport:
    // the shared <main> is h-[calc(100vh-4rem)] (header), and DashboardWrapper
    // gives this route pb-4 instead of every other page's pb-40 (that 10rem
    // is trailing scroll space for flowing content — a fixed-height video
    // panel doesn't need it). 2rem top + 1rem bottom padding remains, so
    // 100vh - 7rem is what's actually available here.
    <div className="h-[calc(100vh-7rem)] min-h-[500px] w-full">
      <ReelsFeed initialVideos={videos} initialHasMore={hasMore} initialVideoId={initialVideoId} />
    </div>
  );
}
