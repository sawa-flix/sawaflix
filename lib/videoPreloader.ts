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

                const chunks: Uint8Array[] = [];

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    if (value) {
                        chunks.push(value);
                        loaded += value.length;

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

export async function removeCachedVideo(videoId: string, videoUrl: string) {
    await removeVideoFromIDB(videoId);
}
