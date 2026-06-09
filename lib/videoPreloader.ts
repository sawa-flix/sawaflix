/**
 * VideoPreloader — TikTok-style background video pre-fetching engine.
 *
 * This version is HARDENED:
 * - Singleton Lock: Only one preload loop can run at a time globally.
 * - Throttled: Deliberate 3-second delay between every download to respect backend rate limits.
 * - Sequential: Uses a strict for...of loop to ensure zero concurrency during file transfers.
 */

import { BACKEND_URL } from './apiConfig';

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const FEED_CACHE_NAME = 'sawaflix-video-cache';
const METADATA_KEY = 'sawaflix_cached_video_metadata';
const FEED_API_URL = `${BACKEND_URL}/api/videos/feed`;

// Global singleton lock
let isGloballyPreloading = false;

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
export async function startVideoPreload(limit = 20): Promise<void> {
    // Guard: Only run in browser environments with Cache API support
    if (typeof window === 'undefined' || !('caches' in window)) {
        return;
    }

    // Singleton lock: return immediately if already running
    if (isGloballyPreloading) {
        console.log('[VideoPreloader] Preloader already active. Skipping duplicate run.');
        return;
    }

    isGloballyPreloading = true;

    try {
        console.log(`[VideoPreloader] Fetching video feed (limit=${limit})...`);
        const res = await fetch(`${FEED_API_URL}?limit=${limit}`);

        if (!res.ok) {
            console.warn('[VideoPreloader] Feed API returned', res.status);
            isGloballyPreloading = false;
            return;
        }

        const data = await res.json();
        const videos: CachedVideoMeta[] = Array.isArray(data.data) ? data.data : [];

        if (videos.length === 0) {
            console.log('[VideoPreloader] No videos in feed to preload.');
            isGloballyPreloading = false;
            return;
        }

        console.log(`[VideoPreloader] Starting SEQUENTIAL background download of ${videos.length} videos...`);
        const cache = await caches.open(FEED_CACHE_NAME);

        let existingMeta: Record<string, CachedVideoMeta> = {};
        try {
            const stored = localStorage.getItem(METADATA_KEY);
            if (stored) existingMeta = JSON.parse(stored);
        } catch (_) { }

        // Strictly sequential loop
        for (const video of videos) {
            if (!video.videoUrl) continue;

            try {
                // Ensure https to avoid redirects
                if (video.videoUrl.startsWith('http://') && !video.videoUrl.includes('localhost')) {
                    video.videoUrl = video.videoUrl.replace('http://', 'https://');
                }

                const existing = await cache.match(video.videoUrl);
                if (existing) {
                    console.log(`[VideoPreloader] Already cached: ${video.title}`);
                } else {
                    // Start download
                    console.log(`[VideoPreloader] Downloading: ${video.title}`);
                    const proxyRes = await fetch(video.videoUrl, { mode: 'cors' });

                    if (!proxyRes.ok) {
                        const errorMsg = await proxyRes.text().catch(() => 'No error body');
                        console.warn(`[VideoPreloader] Backend Proxy failed (${proxyRes.status}) for ${video.title}:`, errorMsg);
                    } else {
                        // Store the stream. This completes when the whole file is downloaded.
                        await cache.put(video.videoUrl, proxyRes);

                        // Update metadata only on success
                        existingMeta[video.id] = {
                            ...video,
                            cachedAt: Date.now(),
                        };
                        // Save metadata incrementally so we don't lose progress on page refresh
                        localStorage.setItem(METADATA_KEY, JSON.stringify(existingMeta));
                        console.log(`[VideoPreloader] Successfully cached: ${video.title}`);
                    }
                }
            } catch (err) {
                console.warn(`[VideoPreloader] Failed to cache ${video.title}:`, err);
            }

            // MANDATORY THROTTLE: Wait 3 seconds between requests (success OR failure)
            // to respect backend rate limits and prevent "bulky" bursts.
            await delay(3000);
        }

        console.log(`[VideoPreloader] Pre-fetch cycle complete.`);
    } catch (err) {
        console.error('[VideoPreloader] Fatal error during preload:', err);
    } finally {
        isGloballyPreloading = false;
    }
}

/**
 * Read currently cached video metadata from localStorage.
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
