/* eslint-disable @typescript-eslint/no-explicit-any */
// hooks/useVideos.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { youtubeApi } from '@/services/youtubeApi';
import type { Video } from '@/types/youtube';

interface UseVideosResult {
    videos: Video[];
    loading: boolean;
    error: string | null;
    hasMore: boolean;
    loadMore: () => Promise<void>;
    refresh: () => Promise<void>;
    isRefreshing: boolean;
}

export function useVideos(categoryQuery: string): UseVideosResult {
    const [videos, setVideos] = useState<Video[]>([]);
    const [loading, setLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(true);

    // Use refs to track pagination without causing re-renders
    const nextPageTokenRef = useRef<string | null>(null);
    const isLoadingRef = useRef(false);
    const currentCategoryRef = useRef(categoryQuery);

    // Refresh: Reset and fetch first page
    const refresh = useCallback(async () => {
        // Prevent multiple refreshes
        if (isLoadingRef.current) return;

        setIsRefreshing(true);
        setError(null);
        isLoadingRef.current = true;

        try {
            // Reset all state
            setVideos([]);
            nextPageTokenRef.current = null;
            setHasMore(true);
            currentCategoryRef.current = categoryQuery;

            // Fetch first page
            const response = await youtubeApi.searchVideos(categoryQuery, null, 7);

            const rawList = Array.isArray(response) ? response : (response as any).items || [];
            
            if (rawList.length === 0 && !Array.isArray(response)) {
                const apiError = (response as any)?.error?.message || 'No videos found';
                throw new Error(apiError);
            }

            const videoList = rawList.map((item: any) => ({
                id: typeof item.id === 'object' ? item.id.videoId : item.id,
                title: item.snippet?.title || item.title,
                description: item.snippet?.description || item.description,
                thumbnail: item.snippet?.thumbnails?.high?.url || item.thumbnail,
                channelId: item.snippet?.channelId || item.channelId,
                channelTitle: item.snippet?.channelTitle || item.channelTitle,
                publishedAt: item.snippet?.publishedAt || item.publishedAt,
                videoUrl: `https://www.youtube.com/watch?v=${typeof item.id === 'object' ? item.id.videoId : item.id}`,
                embedUrl: `https://www.youtube.com/embed/${typeof item.id === 'object' ? item.id.videoId : item.id}`,
                likeCount: item.statistics?.likeCount || item.likeCount,
                commentCount: item.statistics?.commentCount || item.commentCount,
            }));

            // TikTok Effect: Shuffle the videos so the feed feels fresh and dynamic 
            // every time the user opens the app, even while using the 1-hour cache!
            const shuffledVideos = [...videoList].sort(() => Math.random() - 0.5);

            setVideos(shuffledVideos);
            nextPageTokenRef.current = (response as any).nextPageToken || null;
            setHasMore(!!(response as any).nextPageToken);

            console.log(`[useVideos] Refreshed: ${videoList.length} videos, hasMore: ${!!(response as any).nextPageToken}`);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to refresh videos';
            setError(errorMessage);
            console.error('[useVideos] Refresh failed:', err); // Log the full error object for better debugging
        } finally {
            setIsRefreshing(false);
            isLoadingRef.current = false;
        }
    }, [categoryQuery]);

    // Load more: Append next page
    const loadMore = useCallback(async () => {
        // Don't load if:
        // 1. Already loading
        // 2. No more videos
        // 3. No next page token
        // 4. Category changed during load
        if (isLoadingRef.current) {
            console.log('[useVideos] Already loading, skipping');
            return;
        }

        if (!hasMore) {
            console.log('[useVideos] No more videos, skipping');
            return;
        }

        if (!nextPageTokenRef.current) {
            console.log('[useVideos] No next page token, skipping');
            return;
        }

        if (currentCategoryRef.current !== categoryQuery) {
            console.log('[useVideos] Category changed, skipping loadMore');
            return;
        }

        setLoading(true);
        isLoadingRef.current = true;

        try {
            console.log('[useVideos] Loading more with token:', nextPageTokenRef.current);

            const response = await youtubeApi.searchVideos(
                categoryQuery,
                nextPageTokenRef.current,
                7
            );
            
            const rawList = Array.isArray(response) ? response : (response as any).items || [];

            if (rawList.length === 0 && !Array.isArray(response)) {
                throw new Error('Invalid data received while loading more videos');
            }
            
            const videoList = rawList.map((item: any) => ({
                id: typeof item.id === 'object' ? item.id.videoId : item.id,
                title: item.snippet?.title || item.title,
                description: item.snippet?.description || item.description,
                thumbnail: item.snippet?.thumbnails?.high?.url || item.thumbnail,
                channelId: item.snippet?.channelId || item.channelId,
                channelTitle: item.snippet?.channelTitle || item.channelTitle,
                publishedAt: item.snippet?.publishedAt || item.publishedAt,
                videoUrl: `https://www.youtube.com/watch?v=${typeof item.id === 'object' ? item.id.videoId : item.id}`,
                embedUrl: `https://www.youtube.com/embed/${typeof item.id === 'object' ? item.id.videoId : item.id}`,
                likeCount: item.statistics?.likeCount || item.likeCount,
                commentCount: item.statistics?.commentCount || item.commentCount,
            }));

            setVideos(prev => {
                // Prevent duplicates by checking IDs
                const existingIds = new Set(prev.map(v => v.id));
                const newVideos = videoList.filter(v => !existingIds.has(v.id));
                return [...prev, ...newVideos];
            });

            nextPageTokenRef.current = (response as any).nextPageToken || null;
            setHasMore(!!(response as any).nextPageToken);

            console.log(`[useVideos] Loaded more: ${videoList.length} new videos, hasMore: ${!!(response as any).nextPageToken}`);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to load more videos';
            setError(errorMessage);
            console.error('[useVideos] Load more failed:', err);
        } finally {
            setLoading(false);
            isLoadingRef.current = false;
        }
    }, [categoryQuery, hasMore]);

    // Refresh when category changes
    useEffect(() => {
        console.log('[useVideos] Category changed to:', categoryQuery);
        refresh();
    }, [categoryQuery, refresh]);

    return {
        videos,
        loading,
        error,
        hasMore,
        loadMore,
        refresh,
        isRefreshing,
    };
}