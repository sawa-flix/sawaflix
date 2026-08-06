import type { Video } from '@/types/youtube';

/**
 * One-shot client-side handoff for "open this specific reel" links (e.g.
 * the right sidebar's category list) that navigate to /dashboard/reels?id=.
 * The Reels page's deep-link mechanism can only scroll to a video that's
 * already in its initial list — the sidebar's videos come from a different
 * query than the culture feed, so they usually aren't there. Stashing the
 * full Video object here (already fetched client-side by the sidebar) lets
 * ReelsFeed prepend it locally instead of requiring a second server fetch
 * just to look it up by id.
 *
 * In-memory only (survives client-side navigation, not a page reload) — a
 * reload/bookmark of the same URL falls back to the existing behavior of
 * scrolling to the id within the fetched feed, or showing the feed from the
 * top if it isn't there.
 */
let pendingVideo: Video | null = null;

export function stashReelForHandoff(video: Video) {
  pendingVideo = video;
}

export function consumeReelHandoff(): Video | null {
  const video = pendingVideo;
  pendingVideo = null;
  return video;
}
