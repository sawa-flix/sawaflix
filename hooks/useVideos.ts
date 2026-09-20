/* eslint-disable @typescript-eslint/no-explicit-any */
// hooks/useVideos.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { youtubeApi } from '@/services/youtubeApi';
import type { Video } from '@/types/youtube';
import { get, set } from 'idb-keyval';
import { mapYoutubeItem } from '@/utils/reels/mapYoutubeItem';

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

    const nextPageTokenRef = useRef<string | null>(null);
    const isLoadingRef = useRef(false);
    const currentCategoryRef = useRef(categoryQuery);

    const mapYouTubeItem = mapYoutubeItem;

    const mapSawaflixItem = (item: any): Video => ({
        id: item.id,
        title: item.title,
        description: item.description || '',
        thumbnail: item.thumbnail || item.cover_url,
        channelId: 'sawaflix',
        channelTitle: 'Sawaflix',
        publishedAt: item.created_at || item.publishedAt,
        videoUrl: item.videoUrl || item.media_url,
        embedUrl: item.videoUrl || item.media_url,
        likeCount: item.likes || 0,
        commentCount: '0',
        origin: 'sawaflix',
        contentType: item.contentType || item.content_type || (item.media_url?.match(/\.(mp3|wav|ogg|flac|aac)$/i) ? 'music' : 'video')
    });

    const refresh = useCallback(async () => {
        if (isLoadingRef.current) return;

        setIsRefreshing(true);
        setError(null);
        isLoadingRef.current = true;

        const CACHE_KEY = `sawaflix:feed:${categoryQuery.replace(/\s+/g, '_')}`;

        // Always try to load IndexedDB cache first for instant display
        let cachedVideos: Video[] = [];
        try {
            const cachedStr = await get(CACHE_KEY);
            if (cachedStr) {
                const parsed = typeof cachedStr === 'string' ? JSON.parse(cachedStr) : cachedStr;
                if (Array.isArray(parsed) && parsed.length > 0) {
                    cachedVideos = parsed;
                    // Immediately show stale cache — user sees content right away
                    if (videos.length === 0) {
                        setVideos([...cachedVideos].sort(() => Math.random() - 0.5));
                    }
                }
            }
        } catch (e) {
            console.warn('[useVideos] Failed to read from IndexedDB cache', e);
        }

        nextPageTokenRef.current = null;
        setHasMore(true);
        currentCategoryRef.current = categoryQuery;

        let finalVideos: Video[] = [];

        const isDefaultFeed = categoryQuery === 'Cameroon shorts viral 2026' || categoryQuery === 'Cameroon music hits 2026';
        const isMusicQuery = categoryQuery.toLowerCase().includes('music');

        try {
            // If the user is on the default feed (All 237), fetch the fast curated culture feed!
            if (isDefaultFeed) {
                const response = await youtubeApi.getCultureFeed(1, 20);
                const feedList = response.feed || [];
                finalVideos = feedList.map(mapYouTubeItem);
                
                nextPageTokenRef.current = response.pagination?.next_page ? String(response.pagination.next_page) : null;
                setHasMore(!!response.pagination?.next_page);
            } else {
                // Specific category search
                const response = await youtubeApi.searchVideos(categoryQuery, null, 10);
                const rawList = Array.isArray(response) ? response : (response as any).items || [];
                const ytVideos = rawList
                    .filter((item: any) => !!(typeof item.id === 'object' ? item.id.videoId : item.id))
                    .map(mapYouTubeItem);

                let sawaflixVideos: Video[] = [];
                if (isMusicQuery) {
                    try {
                        const sfResponse = await youtubeApi.getUnifiedFeed();
                        sawaflixVideos = (sfResponse.data?.sawaflix || [])
                            .map(mapSawaflixItem)
                            .filter(v => v.contentType === 'music' || v.contentType === 'audio');
                    } catch (e) {
                        console.error('[useVideos] Failed to fetch Sawaflix music:', e);
                    }
                }

                finalVideos = [...ytVideos, ...sawaflixVideos].sort(() => Math.random() - 0.5);

                nextPageTokenRef.current = (response as any).nextPageToken || null;
                setHasMore(!!(response as any).nextPageToken);
            }

            if (finalVideos.length === 0 && cachedVideos.length > 0) {
                // No fresh data but we have cache — shuffle the cache and return it
                finalVideos = [...cachedVideos].sort(() => Math.random() - 0.5);
            }

            if (finalVideos.length === 0) {
                throw new Error('No videos found');
            }

            // Shuffle fresh results before setting them
            const shuffled = [...finalVideos].sort(() => Math.random() - 0.5);
            setVideos(shuffled);
            
            // Save unshuffled to IndexedDB for next time
            try {
                await set(CACHE_KEY, finalVideos);
            } catch (e) {
                console.warn('[useVideos] Failed to save to IndexedDB cache', e);
            }

            console.log(`[useVideos] Refreshed: ${shuffled.length} videos`);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to refresh videos';
            // Only show error if we have NO fallback cache to show
            if (cachedVideos.length === 0) {
                setError(errorMessage);
            } else {
                // Silently use the cache — user still sees content
                const shuffledCache = [...cachedVideos].sort(() => Math.random() - 0.5);
                setVideos(shuffledCache);
            }
            console.error('[useVideos] Refresh failed:', err);
        } finally {
            setIsRefreshing(false);
            isLoadingRef.current = false;
        }
    }, [categoryQuery]);


    const loadMore = useCallback(async () => {
        if (isLoadingRef.current) return;
        if (!hasMore) return;
        if (!nextPageTokenRef.current) return;
        if (currentCategoryRef.current !== categoryQuery) return;

        setLoading(true);
        isLoadingRef.current = true;

        try {
            let newVideos: Video[] = [];
            let nextPageToken: string | null = null;
            let hasMoreResponse = false;

            const isPagePagination = nextPageTokenRef.current && !isNaN(Number(nextPageTokenRef.current));

            if (isPagePagination) {
                const pageNum = Number(nextPageTokenRef.current);
                const response = await youtubeApi.getCultureFeed(pageNum, 20);
                const feedList = response.feed || [];
                newVideos = feedList.map(mapYouTubeItem);
                nextPageToken = response.pagination?.next_page ? String(response.pagination.next_page) : null;
                hasMoreResponse = !!response.pagination?.next_page;
            } else {
                // When infinite scrolling after unified feed, fallback to regular youtube search
                const tokenToUse = nextPageTokenRef.current === 'use-youtube-fallback' ? null : nextPageTokenRef.current;
                const queryToUse = categoryQuery === 'Cameroon music hits 2026' ? 'trending entertainment Cameroon' : categoryQuery;

                const response = await youtubeApi.searchVideos(queryToUse, tokenToUse, 10);
                const rawList = Array.isArray(response) ? response : (response as any).items || [];
                
                newVideos = rawList
                    .filter((item: any) => !!(typeof item.id === 'object' ? item.id.videoId : item.id))
                    .map(mapYouTubeItem);

                nextPageToken = (response as any).nextPageToken || null;
                hasMoreResponse = !!(response as any).nextPageToken;
            }

            setVideos(prev => {
                const existingIds = new Set(prev.map(v => v.id));
                const uniqueNew = newVideos.filter((v: Video) => !existingIds.has(v.id));
                return [...prev, ...uniqueNew];
            });

            nextPageTokenRef.current = nextPageToken;
            setHasMore(hasMoreResponse);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to load more videos';
            setError(errorMessage);
            console.error('[useVideos] Load more failed:', err);
        } finally {
            setLoading(false);
            isLoadingRef.current = false;
        }
    }, [categoryQuery, hasMore]);

    useEffect(() => {
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