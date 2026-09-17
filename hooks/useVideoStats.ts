import { useState, useEffect, useCallback } from 'react';
import { youtubeApi } from '@/services/youtubeApi';
import { videoInteractivityService } from '@/services/videoInteractivityService';
import type { VideoDetails } from '@/types/youtube';

interface UseVideoStatsResult {
    stats: VideoDetails | null;
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

const isYouTubeId = (id: string) => /^[A-Za-z0-9_-]{11}$/.test(id);

// ─── Module-level in-memory cache ───────────────────────────────────────────
// Persists across reel navigation within the same session so the user's
// like state is never lost when scrolling away and coming back.
const statsCache = new Map<string, VideoDetails>();

export function useVideoStats(videoId: string | null): UseVideoStatsResult {
    // Hydrate immediately from cache if available so the UI never flickers
    // back to "0 likes / not liked" when the user returns to a reel.
    const [stats, setStats] = useState<VideoDetails | null>(
        () => (videoId ? statsCache.get(videoId) ?? null : null)
    );
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchStats = useCallback(async () => {
        if (!videoId) return;

        setLoading(true);
        setError(null);

        try {
            if (isYouTubeId(videoId)) {
                // YouTube video: fetch both YouTube details AND Neon stats in
                // parallel, then merge so the like button reflects our own DB.
                const [ytResult, neonResult] = await Promise.allSettled([
                    youtubeApi.getVideoDetails(videoId),
                    videoInteractivityService.getStats(videoId),
                ]);

                const yt = ytResult.status === 'fulfilled' ? ytResult.value : null;
                const neon = neonResult.status === 'fulfilled' ? neonResult.value : null;

                const merged: VideoDetails = {
                    id: videoId,
                    title: yt?.title ?? '',
                    // YouTube counts are authoritative for display totals
                    viewCount: yt?.viewCount ?? '0',
                    commentCount: yt?.commentCount ?? '0',
                    duration: yt?.duration ?? '',
                    publishedAt: yt?.publishedAt ?? '',
                    channelId: yt?.channelId,
                    channelTitle: yt?.channelTitle,
                    // Add our Neon like count on top of YouTube's for a combined tally
                    likeCount: String(
                        (parseInt(yt?.likeCount ?? '0', 10) || 0) +
                        (neon?.likesCount ?? 0)
                    ),
                    // Our DB is authoritative for "did THIS user like it?"
                    isLiked: neon?.isLikedByUser ?? yt?.isLiked ?? false,
                    sharesCount: neon?.sharesCount,
                    downloadsCount: neon?.downloadsCount,
                    interactors: neon?.interactors,
                };

                statsCache.set(videoId, merged);
                setStats(merged);
            } else {
                // Native SawaFlix / Cloudflare video — Neon is the single source
                const neonStats = await videoInteractivityService.getStats(videoId);
                if (neonStats) {
                    const result: VideoDetails = {
                        id: videoId,
                        title: '',
                        viewCount: String(neonStats.viewsCount ?? 0),
                        likeCount: String(neonStats.likesCount ?? 0),
                        commentCount: String(neonStats.commentsCount ?? 0),
                        duration: '',
                        publishedAt: '',
                        isLiked: Boolean(neonStats.isLikedByUser),
                        sharesCount: neonStats.sharesCount,
                        downloadsCount: neonStats.downloadsCount,
                        interactors: neonStats.interactors,
                    };
                    statsCache.set(videoId, result);
                    setStats(result);
                }
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch stats';
            setError(errorMessage);
            console.error('[useVideoStats] Error:', errorMessage);
        } finally {
            setLoading(false);
        }
    }, [videoId]);

    useEffect(() => {
        if (!videoId) return;
        // If cached, show immediately; still refresh in background
        if (statsCache.has(videoId)) {
            setStats(statsCache.get(videoId)!);
        }
        fetchStats();
    }, [videoId, fetchStats]);

    return {
        stats,
        loading,
        error,
        refetch: fetchStats,
    };
}

/**
 * Patch the in-memory cache after an optimistic like toggle so navigating
 * away and back shows the correct liked state without a server round-trip.
 */
export function patchStatsCache(videoId: string, patch: Partial<VideoDetails>) {
    const existing = statsCache.get(videoId);
    if (existing) {
        statsCache.set(videoId, { ...existing, ...patch });
    }
}
