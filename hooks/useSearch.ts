import { useState, useCallback, useRef } from "react";

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const MAX_CACHE_SIZE = 20;

export default function useSearch(searchFunction, debounceMs = 300, enableCache = true) {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);
  const [nextPageToken, setNextPageToken] = useState(null);
  const [currentQuery, setCurrentQuery] = useState("");
  const debounceRef = useRef(null);
  const cacheRef = useRef(new Map());

  const cleanExpiredCache = useCallback(() => {
    const now = Date.now();
    const validEntries = new Map();

    for (const [key, value] of cacheRef.current) {
      if (now - value.timestamp < CACHE_TTL) {
        validEntries.set(key, value);
      }
    }

    cacheRef.current = validEntries;
  }, []);

  const enforceCacheSize = useCallback(() => {
    if (cacheRef.current.size > MAX_CACHE_SIZE) {
      const entries = Array.from(cacheRef.current.entries());
      // Sort by timestamp (oldest first) and keep only the most recent MAX_CACHE_SIZE
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      const toKeep = entries.slice(-MAX_CACHE_SIZE);
      cacheRef.current = new Map(toKeep);
    }
  }, []);

  const search = useCallback(async (query) => {
    const trimmedQuery = query.trim();

    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Clear results immediately for empty queries
    if (!trimmedQuery) {
      setResults([]);
      setError(null);
      setNextPageToken(null);
      setCurrentQuery("");
      return;
    }

    const cacheKey = trimmedQuery.toLowerCase();

    // Check cache first (after cleaning expired entries)
    if (enableCache) {
      cleanExpiredCache();
      if (cacheRef.current.has(cacheKey)) {
        const cachedResult = cacheRef.current.get(cacheKey);
        setResults(cachedResult.results);
        setNextPageToken(cachedResult.nextPageToken);
        setCurrentQuery(trimmedQuery);
        setError(null);
        return;
      }
    }

    // Debounce the search
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await searchFunction(trimmedQuery);

        // Handle response shape: { items: [...], nextPageToken, ... }
        const items = data?.items || data || [];
        const processedResults = Array.isArray(items) ? items : [];
        
        const resultData = {
          results: processedResults,
          nextPageToken: data?.nextPageToken || null,
          timestamp: Date.now()
        };
        
        // Cache the results
        if (enableCache) {
          cacheRef.current.set(cacheKey, resultData);
          enforceCacheSize();
        }
        
        setResults(processedResults);
        setNextPageToken(data?.nextPageToken || null);
        setCurrentQuery(trimmedQuery);
      } catch (error) {
        console.error('[useSearch] Error:', error);
        setError(error.message || 'Search failed');
        setResults([]);
        setNextPageToken(null);
        setCurrentQuery("");
      } finally {
        setLoading(false);
      }
    }, debounceMs);
  }, [searchFunction, debounceMs, enableCache, cleanExpiredCache, enforceCacheSize]);

  const loadMore = useCallback(async () => {
    if (!nextPageToken || loading || !currentQuery) return;

    setLoading(true);
    try {
      const data = await searchFunction(currentQuery, nextPageToken);
      
      const items = data?.items || [];
      const newResults = Array.isArray(items) ? items : [];
      const updatedResults = [...results, ...newResults];
      const nextToken = data?.nextPageToken || null;
      const cacheKey = currentQuery.toLowerCase();

      setResults(updatedResults);
      setNextPageToken(nextToken);

      if (enableCache && cacheRef.current.has(cacheKey)) {
        cacheRef.current.set(cacheKey, {
          results: updatedResults,
          nextPageToken: nextToken,
          timestamp: Date.now()
        });
        enforceCacheSize();
      }
    } catch (error) {
      console.error('[useSearch] Load more error:', error);
      setError(error.message || 'Failed to load more results');
    } finally {
      setLoading(false);
    }
  }, [nextPageToken, loading, currentQuery, results, searchFunction, enableCache, enforceCacheSize]);

  const clearCache = useCallback(() => {
    cacheRef.current.clear();
  }, []);

  return {
    loading,
    results,
    error,
    search,
    loadMore,
    hasMore: !!nextPageToken,
    clearCache,
  };
}