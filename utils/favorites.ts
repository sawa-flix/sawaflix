export interface FavoriteItem {
  id: string;
  contentId: string;
  type?: string;
  title?: string;
  thumbnail?: string;
}

const MAX_FAVORITES = 12;
const MAX_ID_LENGTH = 120;
const MAX_TITLE_LENGTH = 100;
const MAX_THUMBNAIL_LENGTH = 180;

export function compactFavorites(value: unknown): FavoriteItem[] {
  if (!Array.isArray(value)) return [];

  const compacted: FavoriteItem[] = [];
  const seenIds = new Set<string>();

  for (const entry of value) {
    if (!entry || typeof entry !== 'object') continue;

    const item = entry as Record<string, unknown>;
    const rawId = item.contentId || item.id || item.videoId || item.title;
    if (typeof rawId !== 'string' && typeof rawId !== 'number') continue;

    const id = String(rawId).trim().replace(/\s+/g, '-').toLowerCase().slice(0, MAX_ID_LENGTH);
    if (!id || seenIds.has(id)) continue;
    seenIds.add(id);

    const title = typeof item.title === 'string' ? item.title.slice(0, MAX_TITLE_LENGTH) : '';
    const thumbnailValue = item.thumbnail || item.poster || item.image;
    const thumbnail = typeof thumbnailValue === 'string'
      ? thumbnailValue.slice(0, MAX_THUMBNAIL_LENGTH)
      : '';
    const type = typeof item.type === 'string' ? item.type.slice(0, 24) : 'video';

    compacted.push({ id, contentId: id, type, title, thumbnail });
    if (compacted.length >= MAX_FAVORITES) break;
  }

  return compacted;
}