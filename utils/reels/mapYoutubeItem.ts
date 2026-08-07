import type { Video } from '@/types/youtube';

/**
 * Raw feed item shape as returned by the backend's culture-feed / search
 * endpoints. Deliberately permissive: the backend sometimes forwards the
 * YouTube Data API's nested `snippet`/`statistics` shape verbatim, and
 * sometimes flattens it — every field below is optional so both variants
 * satisfy this type without resorting to `any`.
 */
export interface RawYoutubeFeedItem {
  id?: string | { videoId?: string };
  /** Some backend responses flatten the id straight onto the item instead of nesting it under `id`/`id.videoId` — seen on search results specifically. */
  videoId?: string;
  snippet?: {
    title?: string;
    description?: string;
    thumbnails?: { high?: { url?: string } };
    channelId?: string;
    channelTitle?: string;
    publishedAt?: string;
  };
  statistics?: {
    likeCount?: string;
    commentCount?: string;
    viewCount?: string;
  };
  metadata?: {
    channel_title?: string;
    published_at?: string;
  };
  title?: string;
  description?: string;
  thumbnail?: string;
  channelId?: string;
  channelTitle?: string;
  publishedAt?: string;
  likeCount?: string;
  commentCount?: string;
  viewCount?: string;
}

/**
 * Extracts the plain video-id string regardless of which feed-item shape
 * arrived. Checks `id.videoId` (raw YouTube Data API shape), `id` (already
 * flattened), then `videoId` (a third, flatter shape some endpoints use) —
 * in that order, so a valid `item.id` is never overridden by a coincidental
 * `videoId` field. This was previously narrower (id-only) and would filter
 * an item out entirely, not just mis-map it, if the id only existed under
 * `videoId` — the one case a missing/wrong id here silently drops a real result.
 */
export function extractVideoId(item: RawYoutubeFeedItem): string | undefined {
  if (typeof item.id === 'object') return item.id?.videoId || item.videoId;
  return item.id || item.videoId;
}

/**
 * Canonical mapper from a raw YouTube Data API / backend feed item to the
 * app's `Video` shape. Previously duplicated in hooks/useVideos.ts and the
 * old Reels page — extracted here so both can import the same function
 * instead of maintaining copies that can drift apart.
 */
export function mapYoutubeItem(item: RawYoutubeFeedItem): Video {
  const id = extractVideoId(item) ?? '';

  return {
    id,
    title: item.snippet?.title || item.title || 'Untitled',
    description: item.snippet?.description || item.description || '',
    thumbnail:
      item.snippet?.thumbnails?.high?.url ||
      item.thumbnail ||
      `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`,
    channelId: item.snippet?.channelId || item.channelId || '',
    channelTitle:
      item.snippet?.channelTitle ||
      item.channelTitle ||
      item.metadata?.channel_title ||
      'YouTube Channel',
    publishedAt:
      item.snippet?.publishedAt ||
      item.publishedAt ||
      item.metadata?.published_at ||
      new Date().toISOString(),
    videoUrl: `https://www.youtube.com/watch?v=${id}`,
    embedUrl: `https://www.youtube.com/embed/${id}`,
    likeCount: item.statistics?.likeCount || item.likeCount,
    commentCount: item.statistics?.commentCount || item.commentCount,
    viewCount: item.statistics?.viewCount || item.viewCount,
    origin: 'youtube',
  };
}
