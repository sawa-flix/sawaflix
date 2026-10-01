import { getCategoryReelsAction, getCultureFeedAction } from '@/app/actions/youtube';
import type { Video } from '@/types/youtube';
import { mapYoutubeItem, extractVideoId, type RawYoutubeFeedItem } from '@/utils/reels/mapYoutubeItem';
import { ReelsFeed } from '@/components/reels/ReelsFeed';

interface ReelsPageProps {
  searchParams: Promise<{ id?: string; cat?: string }>;
}

/**
 * Server Component: fetches the first page of the same YouTube culture feed
 * SawaFlix.jsx's default dashboard feed uses (getCultureFeedAction), so the
 * first reel renders with no client-side round trip. Pagination beyond page
 * 1 is owned by useReels inside ReelsFeed.
 */
export default async function ReelsPage({ searchParams }: ReelsPageProps) {
  const resolvedSearchParams = await searchParams;
  const { id: initialVideoId, cat: rawCategoryId } = resolvedSearchParams ?? {};
  const categoryId = rawCategoryId && rawCategoryId !== 'all' ? rawCategoryId : undefined;

  let videos: Video[] = [];
  let hasMore = false;
  let nextPageToken: string | null = null;

  try {
    const response = categoryId
      ? await getCategoryReelsAction(categoryId, null, 20)
      : await getCultureFeedAction(1, 20);
    const feedList: RawYoutubeFeedItem[] = response?.feed || [];
    videos = feedList
      .filter((item) => !!extractVideoId(item))
      .map(mapYoutubeItem);
    hasMore = !!response?.pagination?.next_page;
    nextPageToken = categoryId && response?.pagination?.next_page ? String(response.pagination.next_page) : null;
  } catch (error) {
    console.error("[ReelsPage] Failed to fetch initial feed:", error);
  }

  return (
    // On phones this is genuinely fullscreen (h-dvh): DashboardWrapper gives
    // Reels zero header offset and zero padding below md, since Header
    // itself renders transparent there (floating back/search/mute over the
    // video, no reserved bar). dvh (not vh) accounts for mobile browser
    // chrome so this doesn't over/under-shoot the real visible viewport.
    //
    // At md+ it's sized to the dashboard's own content area instead: the
    // shared <main> is h-[calc(100vh-4rem)] (header), and DashboardWrapper
    // gives this route pb-4 instead of every other page's pb-40 (that 10rem
    // is trailing scroll space for flowing content — a fixed-height video
    // panel doesn't need it). 2rem top + 1rem bottom padding remains, so
    // 100vh - 7rem is what's actually available there.
    <div className="relative h-dvh md:h-[calc(100vh-7rem)] min-h-[500px] w-full">
      <ReelsFeed
        key={`${categoryId ?? 'feed'}:${initialVideoId ?? 'start'}`}
        initialVideos={videos}
        initialHasMore={hasMore}
        initialVideoId={initialVideoId}
        initialNextPageToken={nextPageToken}
        categoryId={categoryId}
      />
    </div>
  );
}
