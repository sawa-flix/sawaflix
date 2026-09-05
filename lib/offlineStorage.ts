import { get, set, del, keys, entries } from 'idb-keyval';

export interface OfflineVideoMeta {
  id: string;
  title: string;
  thumbnail: string;
  videoUrl: string; // Original URL
  category?: string;
  duration?: string;
  cachedAt: number;
}

export interface OfflineVideoData {
  meta: OfflineVideoMeta;
  blob: Blob;
}

/**
 * Saves a video Blob and its metadata to IndexedDB.
 */
export async function saveVideoToIDB(meta: OfflineVideoMeta, blob: Blob): Promise<void> {
  const data: OfflineVideoData = { meta, blob };
  await set(`video_${meta.id}`, data);
}

/**
 * Retrieves a video Blob and metadata from IndexedDB by ID.
 */
export async function getVideoFromIDB(id: string): Promise<OfflineVideoData | undefined> {
  return await get(`video_${id}`);
}

/**
 * Retrieves ONLY the metadata for all offline videos (for the UI list).
 */
export async function getAllOfflineVideosMeta(): Promise<OfflineVideoMeta[]> {
  try {
    const allEntries = await entries();
    return allEntries
      .filter(([key]) => typeof key === 'string' && key.startsWith('video_'))
      .map(([_, value]) => (value as OfflineVideoData).meta)
      .sort((a, b) => b.cachedAt - a.cachedAt);
  } catch (err) {
    console.error('Error getting offline videos:', err);
    return [];
  }
}

/**
 * Removes a video from IndexedDB by ID.
 */
export async function removeVideoFromIDB(id: string): Promise<void> {
  await del(`video_${id}`);
}

/**
 * Checks if a video is already downloaded.
 */
export async function isVideoOffline(id: string): Promise<boolean> {
  const meta = await get(`video_${id}`);
  return !!meta;
}

/**
 * Helper to get a fast local object URL for a cached video Blob.
 * NOTE: Caller must revoke the URL with URL.revokeObjectURL() when done!
 */
export async function getOfflineVideoObjectURL(id: string): Promise<string | null> {
  const data = await getVideoFromIDB(id);
  if (!data) return null;
  return URL.createObjectURL(data.blob);
}
