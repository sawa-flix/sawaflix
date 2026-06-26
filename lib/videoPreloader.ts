/**
 * VideoPreloader — TikTok-style background video pre-fetching engine.
 *
 * This version is HARDENED:
 * - Singleton Lock: Only one preload loop can run at a time globally.
 * - Throttled: Deliberate 3-second delay between every download to respect backend rate limits.
 * - Sequential: Uses a strict for...of loop to ensure zero concurrency during file transfers.
 * - Early Abort: Stops after 3 consecutive proxy failures (e.g. YouTube 429 rate-limiting).
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
 *
 * Aborts early if MAX_CONSECUTIVE_FAILURES consecutive proxy failures occur
 * (e.g. YouTube 429 rate-limit hitting yt-dlp on the backend).
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

        // Track consecutive failures — if the backend proxy is down (yt-dlp rate-limited
        // by YouTube HTTP 429), abort early to avoid spamming 400 errors.
        let consecutiveFailures = 0;
        const MAX_CONSECUTIVE_FAILURES = 3;

        // Strictly sequential loop
        for (const video of videos) {
            if (!video.videoUrl) continue;

            // Abort if backend proxy appears to be rate-limited / down
            if (consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
                console.warn(
                    `[VideoPreloader] ⚠️ Aborting preload: ${MAX_CONSECUTIVE_FAILURES} consecutive proxy failures detected. ` +
                    `The backend yt-dlp may be rate-limited by YouTube (HTTP 429). Will retry on next session.`
                );
                break;
            }

            try {
                // Ensure https to avoid redirects
                if (video.videoUrl.startsWith('http://') && !video.videoUrl.includes('localhost')) {
                    video.videoUrl = video.videoUrl.replace('http://', 'https://');
                }

                const existing = await cache.match(video.videoUrl);
                if (existing) {
                    console.log(`[VideoPreloader] Already cached: ${video.title}`);
                    consecutiveFailures = 0; // Reset on success
                } else {
                    // Start download
                    console.log(`[VideoPreloader] Downloading: ${video.title}`);
                    const proxyRes = await fetch(video.videoUrl, { mode: 'cors' });

                    if (!proxyRes.ok) {
                        consecutiveFailures++;
                        // Only log the status code — not the full yt-dlp error body — to reduce console noise
                        console.warn(
                            `[VideoPreloader] Proxy failed (${proxyRes.status}) for "${video.title}" ` +
                            `[failure ${consecutiveFailures}/${MAX_CONSECUTIVE_FAILURES}]`
                        );
                    } else {
                        consecutiveFailures = 0; // Reset on success
                        
                        // Monitor progress using a TransformStream before putting in Cache
                        const contentLength = proxyRes.headers.get('content-length');
                        const total = contentLength ? parseInt(contentLength, 10) : 0;
                        let loaded = 0;
                        let lastLogPercent = -1;

                        const ts = new TransformStream({
                            transform(chunk, controller) {
                                loaded += chunk.length;
                                if (total) {
                                    const percent = Math.floor((loaded / total) * 10) * 10;
                                    if (percent > lastLogPercent) {
                                        console.log(`[VideoPreloader] 📥 ${video.title}: ${percent}% (${(loaded / 1024 / 1024).toFixed(1)}MB / ${(total / 1024 / 1024).toFixed(1)}MB)`);
                                        lastLogPercent = percent;
                                    }
                                } else if (loaded % (1024 * 1024 * 2) === 0) { // Log every ~2MB if no total size
                                    console.log(`[VideoPreloader] 📥 ${video.title}: ${(loaded / 1024 / 1024).toFixed(1)}MB downloaded...`);
                                }
                                controller.enqueue(chunk);
                            }
                        });

                        const responseToCache = new Response(proxyRes.body?.pipeThrough(ts), {
                            headers: proxyRes.headers,
                            status: proxyRes.status,
                            statusText: proxyRes.statusText
                        });

                        // Store the stream. This completes when the whole file is downloaded.
                        await cache.put(video.videoUrl, responseToCache);

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
                consecutiveFailures++;
                console.warn(`[VideoPreloader] Network error for "${video.title}" [failure ${consecutiveFailures}/${MAX_CONSECUTIVE_FAILURES}]`);
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
