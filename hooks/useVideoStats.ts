// hooks/useVideoStats.ts
import { useState, useEffect, useCallback } from 'react';
import { youtubeApi } from '@/services/youtubeApi';
import type { VideoDetails } from '@/types/youtube';

interface UseVideoStatsResult {
    stats: VideoDetails | null;
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export function useVideoStats(videoId: string | null): UseVideoStatsResult {
    const [stats, setStats] = useState<VideoDetails | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchStats = useCallback(async () => {
        if (!videoId) return;

        setLoading(true);
        setError(null);

        try {
            const details = await youtubeApi.getVideoDetails(videoId);
            setStats(details);
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