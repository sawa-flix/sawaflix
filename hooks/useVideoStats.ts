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

export function useVideoStats(videoId: string | null): UseVideoStatsResult {
    const [stats, setStats] = useState<VideoDetails | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchStats = useCallback(async () => {
        if (!videoId) return;

        setLoading(true);
        setError(null);

        try {
            if (isYouTubeId(videoId)) {
                // YouTube external video details
                const details = await youtubeApi.getVideoDetails(videoId);
                setStats(details);
            } else {
                // Native SawaFlix / Admin-uploaded video details from Neon Postgres
                const neonStats = await videoInteractivityService.getStats(videoId);
                if (neonStats) {
                    setStats({
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
                    });
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
        fetchStats();
    }, [fetchStats]);

    return {
        stats,
        loading,
        error,
        refetch: fetchStats  // ✅ Ensure refetch is included
    };
}