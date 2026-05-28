import { useState, useEffect, useCallback, useRef } from 'react';
import { getWeightedFeedAction } from '@/app/actions/feed';
import type { Video } from '@/types/youtube';

interface UseWeightedFeedResult {
  videos: Video[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  isRefreshing: boolean;
}

export function useWeightedFeed(): UseWeightedFeedResult {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  const isLoadingRef = useRef(false);
  const CACHE_KEY = 'sawaflix:weighted:feed';

  const mapFeedItemToVideo = (item: any): Video => {
    const isYT = item.origin === 'youtube';
    return {
      id: item.id,
      title: item.title,
      description: item.description || '',
      thumbnail: item.thumbnail || item.cover_url || '',
      channelId: item.channelId || (isYT ? 'youtube' : 'sawaflix'),
      channelTitle: item.channelTitle || (isYT ? 'YouTube' : 'Sawaflix'),
      publishedAt: item.publishedAt || item.created_at || new Date().toISOString(),
      videoUrl: item.videoUrl || (isYT ? `https://www.youtube.com/watch?v=${item.id}` : item.media_url),
      embedUrl: item.embedUrl || (isYT ? `https://www.youtube.com/embed/${item.id}` : item.media_url),
      likeCount: item.likeCount || item.likes || 0,
      commentCount: item.commentCount || 0,
      origin: item.origin || 'sawaflix',
      tier: item.tier // preserve tier info for debug/stats tracking
    };
  };

  const refresh = useCallback(async () => {
    if (isLoadingRef.current) return;

    setIsRefreshing(true);
    setError(null);
    isLoadingRef.current = true;

    try {
      // 1. Try loading cached feed for instant UI paint
      if (videos.length === 0) {
        try {
          const cachedStr = localStorage.getItem(CACHE_KEY);
          if (cachedStr) {
            const parsed = JSON.parse(cachedStr);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setVideos(parsed);
            }
          }
        } catch {}
      }

      // 2. Fetch fresh weighted feed from Server Action
      const response = await getWeightedFeedAction();
      const rawList = response.data || [];
      const mapped = rawList.map(mapFeedItemToVideo);

      if (mapped.length > 0) {
        setVideos(mapped);
        // Sync cache
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify(mapped));
        } catch {}
      } else if (videos.length === 0) {
        throw new Error('No weighted feed content available.');
      }

      console.log(`[useWeightedFeed] Successfully loaded ${mapped.length} interleaved algorithm items`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh weighted feed';
      setError(errorMessage);
      console.error('[useWeightedFeed] Refresh failed:', err);
    } finally {
      setIsRefreshing(false);
      isLoadingRef.current = false;
    }
  }, [videos.length]);

  const loadMore = useCallback(async () => {
    // Pagination offset will trigger on scroll.
    setHasMore(false);
  }, []);

  useEffect(() => {
    refresh();
  }, []);

  return {
    videos,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
    isRefreshing
  };
}
