/**
 * VideoPreloader — TikTok-style background video pre-fetching engine.
 *
 * When called, this module hits the backend /api/videos/feed endpoint to get
 * a list of the latest Cloudinary video URLs, then downloads each one
 * CONSECUTIVELY (not in parallel) into the Service Worker's 'sawaflix-video-cache'.
 *
 * This means:
 * - Videos are available INSTANTLY from cache on next play.
 * - Consecutive downloads avoid crashing the browser main thread on mobile.
 * - The user can go offline and still watch the pre-fetched content.
 */

import { BACKEND_URL } from './apiConfig';

const FEED_CACHE_NAME = 'sawaflix-video-cache';
const METADATA_KEY = 'sawaflix_cached_video_metadata';
// Point to the dedicated backend proxy route that returns MP4 surrogate urls
const FEED_API_URL = `${BACKEND_URL}/api/videos/feed`;

export interface CachedVideoMeta {
    id: string;
    title: string;
    thumbnail: string;
    videoUrl: string;
    category?: string;
    duration?: string;
    cachedAt: number;
}

/**
 * Fetch the feed from the backend and pre-cache each video file into the
 * Service Worker cache. Saves metadata to localStorage so the Downloads
 * page can look up titles and thumbnails later.
 */
export async function startVideoPreload(limit = 50): Promise<void> {
    // Guard: Only run in browser environments with Cache API support
    if (typeof window === 'undefined' || !('caches' in window)) {
        console.log('[VideoPreloader] Caches API unsupported. Skipping.');
        return;
    }

    try {
        console.log(`[VideoPreloader] Fetching video feed (limit=${limit})...`);

        const res = await fetch(`${FEED_API_URL}?limit=${limit}`, {
            headers: { 'Cache-Control': 'no-cache' }, // Always get a fresh feed list
        });

        if (!res.ok) {
            console.warn('[VideoPreloader] Feed API returned', res.status);
            return;
        }

        const data = await res.json();
        const videos: CachedVideoMeta[] = Array.isArray(data.data) ? data.data : [];

        if (videos.length === 0) {
            console.log('[VideoPreloader] No videos in feed to preload.');
            return;
        }

        console.log(`[VideoPreloader] Starting background download of ${videos.length} videos...`);
        const cache = await caches.open(FEED_CACHE_NAME);

        // Load existing metadata so we can merge rather than overwrite
        let existingMeta: Record<string, CachedVideoMeta> = {};
        try {
            const stored = localStorage.getItem(METADATA_KEY);
            if (stored) existingMeta = JSON.parse(stored);
        } catch (_) { }

        // Download each video CONSECUTIVELY to be lightweight on memory + CPU
        for (const video of videos) {
            if (!video.videoUrl) continue;

            try {
                // Check if already cached to avoid redundant downloads
                const existing = await cache.match(video.videoUrl);
                if (existing) {
                    console.log(`[VideoPreloader] Already cached: ${video.title}`);
                } else {
                    console.log(`[VideoPreloader] Downloading: ${video.title}`);
                    await cache.add(new Request(video.videoUrl, { mode: 'cors' }));
                }

                // Store metadata so the Downloads page can display title + thumbnail
                existingMeta[video.id] = {
                    ...video,
                    cachedAt: Date.now(),
                };
            } catch (err) {
                // A single video failing (e.g., CORS, removed from Cloudinary) should not
                // stop the rest from downloading
                console.warn(`[VideoPreloader] Failed to cache ${video.title}:`, err);
            }
        }

        // Persist metadata for the Downloads page to read
        localStorage.setItem(METADATA_KEY, JSON.stringify(existingMeta));
        console.log(`[VideoPreloader] Pre-fetch complete. ${Object.keys(existingMeta).length} videos available offline.`);
    } catch (err) {
        console.error('[VideoPreloader] Fatal error during preload:', err);
    }
}

/**
 * Read currently cached video metadata from localStorage.
 * Used by the Downloads page to render the offline video list.
 */
export function getCachedVideoMetadata(): CachedVideoMeta[] {
    if (typeof window === 'undefined') return [];
    try {
        const stored = localStorage.getItem(METADATA_KEY);
        if (!stored) return [];
        return Object.values(JSON.parse(stored)) as CachedVideoMeta[];
    } catch (_) {
        return [];
    }
}

/**
 * Remove a specific video from the SW cache and the metadata store.
 */
export async function removeCachedVideo(videoId: string, videoUrl: string): Promise<void> {
    try {
        const cache = await caches.open(FEED_CACHE_NAME);
        await cache.delete(videoUrl);

        const stored = localStorage.getItem(METADATA_KEY);
        if (stored) {
            const meta = JSON.parse(stored);
            delete meta[videoId];
            localStorage.setItem(METADATA_KEY, JSON.stringify(meta));
        }
    } catch (err) {
        console.error('[VideoPreloader] Failed to remove cached video:', err);
    }
}
