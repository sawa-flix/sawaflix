/**
 * Small, Reels-specific presentation helpers. Count formatting already has a
 * shared home (utils/formatCount.ts) and is imported directly where needed —
 * it does not belong here.
 */

/** Pulls `#hashtag` tokens out of a title/description for display under the caption. */
export function extractHashtags(text: string | undefined | null): string[] {
  if (!text) return [];
  const matches = text.match(/#[\p{L}0-9_]+/gu);
  if (!matches) return [];
  return Array.from(new Set(matches)).slice(0, 5);
}

/** Relative "time ago" for a video's publishedAt — no shared version of this exists yet. */
export function formatRelativeTime(dateString: string | undefined | null): string {
  if (!dateString) return '';
  const then = new Date(dateString).getTime();
  if (Number.isNaN(then)) return '';

  const diffMs = Date.now() - then;
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

/** Deterministic creator-avatar fallback for channels with no real avatar in the feed payload. */
export function creatorAvatarUrl(channelTitle: string | undefined | null): string {
  const seed = encodeURIComponent(channelTitle || 'SawaFlix');
  return `https://api.dicebear.com/7.x/initials/svg?seed=${seed}`;
}
