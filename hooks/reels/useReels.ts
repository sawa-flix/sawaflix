'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { getCategoryReelsAction, getCultureFeedAction } from '@/app/actions/youtube';
import type { Video } from '@/types/youtube';
import { mapYoutubeItem, extractVideoId, type RawYoutubeFeedItem } from '@/utils/reels/mapYoutubeItem';

const PAGE_SIZE = 20;

interface UseReelsOptions {
  initialVideos?: Video[];
  initialPage?: number;
  initialHasMore?: boolean;
  initialNextPageToken?: string | null;
  categoryId?: string;
}

interface UseReelsResult {
  videos: Video[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  retry: () => Promise<void>;
}

/**
 * Owns the Reels feed's data lifecycle end-to-end: initial load, pagination,
 * and retry. Calls the existing getCultureFeedAction server action directly
 * — the same one the deleted Reels page and SawaFlix.jsx's default feed both
 * used — so this introduces no second API layer.
 */
export function useReels({
  initialVideos = [],
  initialPage = 1,
  initialHasMore = true,
  initialNextPageToken = null,
  categoryId,
}: UseReelsOptions = {}): UseReelsResult {
  const [videos, setVideos] = useState<Video[]>(initialVideos);
  const [loading, setLoading] = useState(initialVideos.length === 0);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(initialHasMore);

  const pageRef = useRef<number | string>(initialPage);
  const nextPageTokenRef = useRef<string | null>(initialNextPageToken);
  const isFetchingRef = useRef(false);

  const fetchPage = useCallback(async (page: number | string, append: boolean) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    if (!append) setLoading(true);
    setError(null);

    try {
      const response = categoryId
        ? await getCategoryReelsAction(categoryId, append ? String(page) : null, PAGE_SIZE)
        : await getCultureFeedAction(Number(page), PAGE_SIZE);
      const feedList: RawYoutubeFeedItem[] = response?.feed || [];
      const mapped: Video[] = feedList.filter((item) => !!extractVideoId(item)).map(mapYoutubeItem);

      setVideos((prev) => {
        if (!append) return mapped;
        const existingIds = new Set(prev.map((v) => v.id));
        return [...prev, ...mapped.filter((v) => !existingIds.has(v.id))];
      });

      setHasMore(!!response?.pagination?.next_page);
      nextPageTokenRef.current = response?.pagination?.next_page ? String(response.pagination.next_page) : null;
      pageRef.current = categoryId ? (response?.pagination?.next_page || '') : Number(page);

      if (!append && mapped.length === 0) {
        setError('No reels found right now.');
      }
    } catch (err) {
      // Never surface the raw backend/YouTube error text (e.g. a quota
      // message) to the user — same convention as the search hook and the
      // home page's own search. Log the real cause, show a friendly one.
      console.error('[useReels] fetchPage failed:', err);
      setError('Reels are temporarily unavailable. Please try again in a moment.');
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [categoryId]);

  // The SSR fetch in page.tsx can come back empty (e.g. the backend was
  // mid-cold-start and getCultureFeedAction's built-in fallback returned an
  // empty feed rather than throwing). Without this, `loading` would stay
  // true forever: the infinite-scroll sentinel only renders once
  // videos.length > 0, and the retry button only renders once `error` is
  // set — neither condition was ever reached, so nothing could recover.
  useEffect(() => {
    if (initialVideos.length === 0) {
      fetchPage(initialPage, false);
    }
    // Intentionally mount-only — subsequent fetches go through loadMore/retry.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadMore = useCallback(async () => {
    if (isFetchingRef.current || !hasMore) return;
    if (categoryId) {
      if (!nextPageTokenRef.current) return;
      await fetchPage(nextPageTokenRef.current, true);
      return;
    }
    await fetchPage(Number(pageRef.current) + 1, true);
  }, [categoryId, fetchPage, hasMore]);

  const retry = useCallback(async () => {
    await fetchPage(categoryId ? '' : initialPage, false);
  }, [categoryId, fetchPage, initialPage]);

  return { videos, loading, error, hasMore, loadMore, retry };
}
