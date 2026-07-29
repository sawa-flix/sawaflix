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
    <div className="h-dvh w-full">
      <ReelsFeed initialVideos={videos} initialHasMore={hasMore} initialVideoId={initialVideoId} />
    </div>
  );
}
