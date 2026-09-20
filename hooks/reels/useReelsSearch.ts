'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { youtubeApi } from '@/services/youtubeApi';
import type { Video, VideoSearchResponse } from '@/types/youtube';
import { mapYoutubeItem, extractVideoId, type RawYoutubeFeedItem } from '@/utils/reels/mapYoutubeItem';

const SEARCH_PAGE_SIZE = 10;
const DEBOUNCE_MS = 500;
const MIN_QUERY_LENGTH = 2;

/** A call that actually failed (network/rate limit) vs. one that genuinely succeeded with zero matches — kept distinct internally so a real typo can trigger one bounded broadened retry without ever doing that on top of a backend failure. */
interface SearchAttempt {
  ok: boolean;
  response: VideoSearchResponse;
}

const FAILED_ATTEMPT: SearchAttempt = { ok: false, response: { items: [], nextPageToken: null } };

async function attemptSearch(query: string, pageToken: string | null): Promise<SearchAttempt> {
  try {
    const response = await youtubeApi.searchVideos(query, pageToken, SEARCH_PAGE_SIZE);
    // The backend can respond 200 with a failure embedded in the body
    // (VideoSearchResponse.error) instead of a real error status — treat
    // that the same as a thrown error, so it can't look like a genuine
    // zero-result search and trigger the broadened fallback for nothing.
    if (response?.error) return FAILED_ATTEMPT;
    return { ok: true, response };
  } catch {
    // Same convention as the home page's search: a failed call (rate limit,
    // backend hiccup, timeout) degrades to zero results instead of throwing,
    // so the raw backend error is never something the user sees.
    return FAILED_ATTEMPT;
  }
}

function toVideos(response: VideoSearchResponse): Video[] {
  const items = (response?.items as unknown as RawYoutubeFeedItem[]) || [];
  return items.filter((item) => !!extractVideoId(item)).map(mapYoutubeItem);
}

interface UseReelsSearchResult {
  query: string;
  setQuery: (value: string) => void;
  clear: () => void;
  isActive: boolean;
  videos: Video[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  retry: () => Promise<void>;
}

/**
 * Reels' own, isolated search — entirely separate pagination (YouTube's
 * pageToken cursor, not the culture feed's page number) and separate
 * loading/error state from useReels, so switching between search and the
 * normal feed can never corrupt either one's position. Debounces locally
 * and calls searchVideosAction through services/youtubeApi.ts, mapping
 * results with the same mapYoutubeItem the culture feed uses.
 *
 * Error handling mirrors the home page's own search (components/Dashboard/
 * Header.tsx): YouTube search is inherently rate-limited/flaky, so a failed
 * request is caught right at the call site and degrades to "no results"
 * instead of surfacing the raw backend error — the same convention already
 * established there, not a new one invented for Reels.
 *
 * Server Actions have no client-abortable request, so "canceling" a stale
 * search means discarding its response when it arrives late (requestIdRef),
 * not actually aborting the in-flight network call. Because that call still
 * costs real YouTube API quota regardless of whether its response gets used,
 * this also guarantees at most one fresh (non-append) search is ever in
 * flight at a time — a second query that lands mid-request is queued and
 * fired the instant the first settles, rather than doubling up requests.
 */
export function useReelsSearch(): UseReelsSearchResult {
  const [query, setQueryState] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  const activeQueryRef = useRef(''); // what the user last settled on — drives dedupe/queueing in setQuery
  const paginationQueryRef = useRef(''); // what actually produced the shown results — may be a broadened query; loadMore/retry use this
  const nextPageTokenRef = useRef<string | null>(null);
  const requestIdRef = useRef(0);
  const isFetchingRef = useRef(false);
  const pendingQueryRef = useRef<string | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runSearch = useCallback(async (q: string, pageToken: string | null, append: boolean) => {
    isFetchingRef.current = true;
    const requestId = ++requestIdRef.current;
    if (!append) setLoading(true);
    setError(null);

    try {
      const { ok, response: initialResponse } = await attemptSearch(q, pageToken);
      if (requestId !== requestIdRef.current) return;

      let response = initialResponse;

      let mapped = toVideos(response);
      let effectiveQuery = q;

      // A genuinely empty result (not a swallowed failure) for a multi-word
      // fresh search is often just one mistyped or overly-specific word —
      // e.g. "cameroon musik" → nothing, "cameroon" → real matches. Try
      // once, dropping the last word, rather than showing "no results" for
      // what's likely a small spelling slip. Bounded to exactly one extra
      // request so a real typo can't turn into a retry storm, and skipped
      // entirely if the original call itself failed (no point adding load
      // to an already-struggling backend).
      if (ok && !append && mapped.length === 0) {
        const words = q.split(/\s+/).filter(Boolean);
        if (words.length > 1) {
          const broadened = words.slice(0, -1).join(' ');
          const fallback = await attemptSearch(broadened, null);
          if (requestId !== requestIdRef.current) return;

          if (fallback.ok) {
            const fallbackMapped = toVideos(fallback.response);
            if (fallbackMapped.length > 0) {
              response = fallback.response;
              mapped = fallbackMapped;
              effectiveQuery = broadened;
            }
          }
        }
      }

      // Pagination continues from whichever query actually produced these
      // results — kept separate from activeQueryRef, which setQuery still
      // needs untouched to correctly dedupe/queue the user's own typing.
      paginationQueryRef.current = effectiveQuery;

      setVideos((prev) => {
        if (!append) return mapped;
        const existingIds = new Set(prev.map((v) => v.id));
        return [...prev, ...mapped.filter((v) => !existingIds.has(v.id))];
      });

      nextPageTokenRef.current = response?.nextPageToken || null;
      setHasMore(!!response?.nextPageToken);

      if (!append && mapped.length === 0) {
        setError('No reels found for this search.');
      }
    } catch (err) {
      // Defensive net only — the network call above already degrades
      // gracefully, so this only fires for a genuine bug elsewhere (e.g. in
      // the mapping code), not for a rate limit or backend failure.
      if (requestId !== requestIdRef.current) return;
      setError(err instanceof Error ? err.message : 'Search failed. Please try again.');
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
      isFetchingRef.current = false;

      // A newer query arrived while this one was in flight — run it now
      // instead of ever letting two fresh searches be in flight at once.
      const next = pendingQueryRef.current;
      pendingQueryRef.current = null;
      if (next && next === activeQueryRef.current) {
        runSearch(next, null, false);
      }
    }
  }, []);

  const setQuery = useCallback((value: string) => {
    setQueryState(value);

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    // Collapse stray double spaces too, not just leading/trailing ones — a
    // formatting slip shouldn't count as a different query from a clean one.
    const trimmed = value.trim().replace(/\s+/g, ' ');
    if (!trimmed || trimmed.length < MIN_QUERY_LENGTH) {
      // Empty or too short to bother searching — restore the culture feed
      // immediately, no need to wait out the debounce.
      requestIdRef.current += 1;
      activeQueryRef.current = '';
      paginationQueryRef.current = '';
      nextPageTokenRef.current = null;
      pendingQueryRef.current = null;
      setIsActive(false);
      setVideos([]);
      setError(null);
      setHasMore(false);
      setLoading(false);
      return;
    }

    debounceTimerRef.current = setTimeout(() => {
      if (trimmed === activeQueryRef.current) return; // identical to the already-active search — skip refetching

      activeQueryRef.current = trimmed;
      setIsActive(true);

      if (isFetchingRef.current) {
        // A search is already in flight — queue this one instead of firing
        // a second concurrent request (each one costs real API quota).
        pendingQueryRef.current = trimmed;
        return;
      }

      nextPageTokenRef.current = null;
      runSearch(trimmed, null, false);
    }, DEBOUNCE_MS);
  }, [runSearch]);

  const clear = useCallback(() => setQuery(''), [setQuery]);

  const loadMore = useCallback(async () => {
    if (!isActive || !hasMore || isFetchingRef.current || !paginationQueryRef.current) return;
    await runSearch(paginationQueryRef.current, nextPageTokenRef.current, true);
  }, [isActive, hasMore, runSearch]);

  const retry = useCallback(async () => {
    if (!activeQueryRef.current || isFetchingRef.current) return;
    nextPageTokenRef.current = null;
    await runSearch(activeQueryRef.current, null, false);
  }, [runSearch]);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, []);

  return { query, setQuery, clear, isActive, videos, loading, error, hasMore, loadMore, retry };
}
