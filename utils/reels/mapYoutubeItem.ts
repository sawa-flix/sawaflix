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
export function mapYoutubeItem(item: any): Video {
  // If this item is an admin reel or has a native media/video URL
  if (
    item.origin === 'sawaflix' ||
    item.source_type === 'admin_upload' ||
    (item.media_url && !item.media_url.includes('youtube.com') && !item.media_url.includes('youtu.be')) ||
    (item.video_url && !item.video_url.includes('youtube.com') && !item.video_url.includes('youtu.be')) ||
    (item.videoUrl && !item.videoUrl.includes('youtube.com') && !item.videoUrl.includes('youtu.be'))
  ) {
    return mapSawaflixItem(item);
  }

  const id = extractVideoId(item) ?? '';

  return {
    id,
    title: item.snippet?.title || item.title || 'Untitled',
    description: item.snippet?.description || item.description || '',
    thumbnail:
      item.snippet?.thumbnails?.high?.url ||
      item.thumbnail ||
      (id ? `https://i.ytimg.com/vi/${id}/maxresdefault.jpg` : 'https://i.ibb.co/WWhx2c0g/sawaflixmusic-cover.png'),
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
    videoUrl: item.videoUrl || item.video_url || (id ? `https://www.youtube.com/watch?v=${id}` : ''),
    embedUrl: item.embedUrl || item.embed_url || (id ? `https://www.youtube.com/embed/${id}` : ''),
    likeCount: item.statistics?.likeCount || item.likeCount,
    commentCount: item.statistics?.commentCount || item.commentCount,
    viewCount: item.statistics?.viewCount || item.viewCount,
    origin: item.origin || 'youtube',
    contentType: item.contentType,
  };
}

/**
 * Maps an admin-uploaded video (from Cloudflare R2 / Supabase contents / Sawaflix-Admin-Backend)
 * to the unified Video shape used by the Reels feed and cards.
 */
export function mapSawaflixItem(item: any): Video {
  const id = String(item.id || item._id || item.videoId || '');
  const mediaUrl = item.media_url || item.video_url || item.videoUrl || item.media_path || '';
  const thumb = item.thumbnail_url || item.cover_url || item.thumbnail || (item.snippet?.thumbnails?.high?.url) || 'https://i.ibb.co/WWhx2c0g/sawaflixmusic-cover.png';

  return {
    id,
    title: item.title || item.snippet?.title || 'SawaFlix Reel',
    description: item.description || item.snippet?.description || '',
    thumbnail: thumb,
    channelId: item.creator_id || item.channelId || 'sawaflix_admin',
    channelTitle: item.author_name || item.channelTitle || item.metadata?.channel_title || 'SawaFlix Creator',
    publishedAt: item.created_at || item.createdAt || item.publishedAt || new Date().toISOString(),
    videoUrl: mediaUrl,
    embedUrl: mediaUrl,
    likeCount: item.likes_count ? String(item.likes_count) : (item.statistics?.likeCount || item.likeCount || '328'),
    commentCount: item.comments_count ? String(item.comments_count) : (item.statistics?.commentCount || item.commentCount || '42'),
    viewCount: item.views_count ? String(item.views_count) : (item.statistics?.viewCount || item.viewCount || '1.4K'),
    origin: 'sawaflix',
    contentType: 'reel',
  };
}

