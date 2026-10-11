import { getUnifiedFeedAction } from '@/app/actions/youtube';
import { saveVideoToIDB, getVideoFromIDB, getAllOfflineVideosMeta, removeVideoFromIDB, isVideoOffline } from './offlineStorage';

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

let isGloballyPreloading = false;

export async function startVideoPreload(limit = 20): Promise<void> {
    if (typeof window === 'undefined') return;

    if (isGloballyPreloading) {
        console.log('[VideoPreloader] Preloader already active. Skipping duplicate run.');
        return;
    }

    isGloballyPreloading = true;

    try {
        console.log(`[VideoPreloader] Fetching unified feed from Supabase...`);
        // Call the server action to get the Supabase feed
        const feedData = await getUnifiedFeedAction();
        
        if (!feedData || !Array.isArray(feedData)) {
            console.log('[VideoPreloader] No videos returned from unified feed.');
            isGloballyPreloading = false;
            return;
        }

        console.log(`[VideoPreloader] Starting SEQUENTIAL IndexedDB download of ${feedData.length} videos...`);

        // Filter only videos that have valid playback URLs
        const validVideos = feedData.filter(v => v.videoUrl);

        for (const video of validVideos) {
            // Check if already in IndexedDB
            const isOffline = await isVideoOffline(video.id);
            if (isOffline) {
                console.log(`[VideoPreloader] Already cached in IDB: ${video.title}`);
                continue;
            }

            console.log(`[VideoPreloader] Downloading to IDB: ${video.title}`);
            try {
                // Ensure https
                if (video.videoUrl.startsWith('http://') && !video.videoUrl.includes('localhost')) {
                    video.videoUrl = video.videoUrl.replace('http://', 'https://');
                }

                // Fetch the video blob
                const proxyRes = await fetch(video.videoUrl, { mode: 'cors' });

                if (!proxyRes.ok) {
                    console.warn(`[VideoPreloader] Failed to fetch (${proxyRes.status}) for "${video.title}"`);
                    continue; // Skip this one, try the next
                }

                const contentLength = proxyRes.headers.get('content-length');
                const total = contentLength ? parseInt(contentLength, 10) : 0;
                let loaded = 0;
                let lastPercent = -1;

                // Create a readable stream to track download progress
                const reader = proxyRes.body?.getReader();
                if (!reader) {
                    console.warn('[VideoPreloader] Cannot read response body for', video.title);
                    continue;
                }

                const chunks: BlobPart[] = [];

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    if (value) {
                        const array = value instanceof Uint8Array ? value : new Uint8Array(value);
                        const buffer = array.buffer.slice(array.byteOffset, array.byteOffset + array.byteLength);
                        chunks.push(buffer);
                        loaded += array.length;

                        if (total) {
                            const percent = Math.floor((loaded / total) * 100);
                            // Emit event every 5% to update UI smoothly
                            if (percent >= lastPercent + 5 || percent === 100) {
                                lastPercent = percent;
                                window.dispatchEvent(new CustomEvent('video-download-progress', {
                                    detail: {
                                        id: video.id,
                                        progress: percent,
                                        loaded,
                                        total
                                    }
                                }));
                                console.log(`[VideoPreloader] 📥 ${video.title}: ${percent}%`);
                            }
                        }
                    }
                }

                // Download complete, construct Blob and save to IndexedDB
                const blob = new Blob(chunks, { type: proxyRes.headers.get('content-type') || 'video/mp4' });
                
                await saveVideoToIDB({
                    id: video.id,
                    title: video.title,
                    thumbnail: video.thumbnail || '',
                    videoUrl: video.videoUrl,
                    category: video.category || 'Video',
                    cachedAt: Date.now()
                }, blob);

                // Tell the UI the download finished 100%
                window.dispatchEvent(new CustomEvent('video-download-progress', {
                    detail: { id: video.id, progress: 100, complete: true }
                }));

                console.log(`[VideoPreloader] ✅ Successfully saved to IDB: ${video.title}`);

            } catch (err) {
                console.error(`[VideoPreloader] Network error for "${video.title}":`, err);
            }

            // Throttle between downloads
            await delay(2000);
        }

        console.log(`[VideoPreloader] IndexedDB Pre-fetch cycle complete.`);
    } catch (err) {
        console.error('[VideoPreloader] Fatal error during preload:', err);
    } finally {
        isGloballyPreloading = false;
    }
}

// Map the old cache methods to the new IDB methods so other components don't break
export async function getCachedVideoMetadata() {
    return await getAllOfflineVideosMeta();
}

export async function removeCachedVideo(videoId: string, videoUrl?: string) {
    await removeVideoFromIDB(videoId);
}

/**
 * Downloads a specific video (e.g. Movie) to IndexedDB for offline in-app watching.
 * Emits 'video-download-progress' custom event for reactive UI updates.
 */
export async function downloadVideoById(
    video: {
        id: string;
        title: string;
        thumbnail?: string;
        videoUrl?: string;
        category?: string;
        duration?: string;
    },
    onProgress?: (percent: number) => void
): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    const alreadyOffline = await isVideoOffline(video.id);
    if (alreadyOffline) {
        onProgress?.(100);
        return true;
    }

    // Determine target URL for fetching the media stream
    const targetUrl = video.videoUrl && (video.videoUrl.startsWith('http://') || video.videoUrl.startsWith('https://'))
        ? video.videoUrl
        : `/api/videos/proxy?videoId=${encodeURIComponent(video.id)}`;

    try {
        const response = await fetch(targetUrl, { mode: 'cors' });
        if (!response.ok) {
            throw new Error(`Failed to download stream: HTTP ${response.status}`);
        }

        const contentLength = response.headers.get('content-length');
        const total = contentLength ? parseInt(contentLength, 10) : 0;
        let loaded = 0;
        let lastPercent = -1;

        const reader = response.body?.getReader();
        if (!reader) {
            // Fallback if readable stream is not available
            const blob = await response.blob();
            await saveVideoToIDB({
                id: video.id,
                title: video.title,
                thumbnail: video.thumbnail || '',
                videoUrl: targetUrl,
                category: video.category || 'Movie',
                duration: video.duration,
                cachedAt: Date.now()
            }, blob);
            onProgress?.(100);
            window.dispatchEvent(new CustomEvent('video-download-progress', {
                detail: { id: video.id, progress: 100, complete: true }
            }));
            return true;
        }

        const chunks: BlobPart[] = [];
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            if (value) {
                const array = value instanceof Uint8Array ? value : new Uint8Array(value);
                const buffer = array.buffer.slice(array.byteOffset, array.byteOffset + array.byteLength);
                chunks.push(buffer);
                loaded += array.length;

                if (total) {
                    const percent = Math.min(99, Math.floor((loaded / total) * 100));
                    if (percent >= lastPercent + 2 || percent === 99) {
                        lastPercent = percent;
                        onProgress?.(percent);
                        window.dispatchEvent(new CustomEvent('video-download-progress', {
                            detail: {
                                id: video.id,
                                progress: percent,
                                loaded,
                                total
                            }
                        }));
                    }
                }
            }
        }

        const blob = new Blob(chunks, { type: response.headers.get('content-type') || 'video/mp4' });
        await saveVideoToIDB({
            id: video.id,
            title: video.title,
            thumbnail: video.thumbnail || '',
            videoUrl: targetUrl,
            category: video.category || 'Movie',
            duration: video.duration,
            cachedAt: Date.now()
        }, blob);

        onProgress?.(100);
        window.dispatchEvent(new CustomEvent('video-download-progress', {
            detail: { id: video.id, progress: 100, complete: true }
        }));

        return true;
    } catch (error) {
        console.error(`[VideoPreloader] Failed to download video ${video.id}:`, error);
        window.dispatchEvent(new CustomEvent('video-download-error', {
            detail: { id: video.id, error }
        }));
        throw error;
    }
}

