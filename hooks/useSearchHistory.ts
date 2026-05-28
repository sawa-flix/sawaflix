import { useState, useEffect, useCallback } from 'react';
import { searchHistoryService } from '@/services/searchHistory';

interface SearchHistoryItem {
  id: string;
  user_id: string;
  search_query: string;
  searched_at: string;
}

interface UseSearchHistoryReturn {
  history: SearchHistoryItem[];
  loading: boolean;
  error: string | null;
  loadHistory: () => Promise<void>;
  removeHistoryItem: (id: string) => Promise<void>;
  clearHistory: () => Promise<void>;
  saveHistoryItem: (query: string) => Promise<void>;
}

export function useSearchHistory(): UseSearchHistoryReturn {
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadHistory = useCallback(async () => {
    try {
      console.log('[useSearchHistory] Starting loadHistory...');
      setLoading(true);
      setError(null);
      const data = await searchHistoryService.fetchSearchHistory();
      console.log('[useSearchHistory] Received data:', data);
      // Response is an array of history items
      setHistory(Array.isArray(data) ? data : []);
      console.log('[useSearchHistory] History set to:', Array.isArray(data) ? data : []);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load search history';
      setError(errorMsg);
      console.error('[useSearchHistory] ERROR loading search history:', err);
      console.error('[useSearchHistory] Error message:', errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  const removeHistoryItem = useCallback(async (id: string) => {
    try {
      setError(null);
      await searchHistoryService.deleteSearchHistoryItem(id);
      // Optimistically update UI
      setHistory(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete history item');
      console.error('Error deleting history item:', err);
      // Reload history on error to sync with backend
      await loadHistory();
    }
  }, [loadHistory]);

  const clearHistory = useCallback(async () => {
    try {
      setError(null);
      await searchHistoryService.clearSearchHistory();
      // Optimistically clear UI
      setHistory([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear search history');
      console.error('Error clearing search history:', err);
      // Reload history on error to sync with backend
      await loadHistory();
    }
  }, [loadHistory]);

  const saveHistoryItem = useCallback(async (query: string) => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;

    try {
      setError(null);
      const savedItem = await searchHistoryService.saveSearchHistoryItem(trimmedQuery);
      setHistory(prev => {
        const filtered = prev.filter(item => item.search_query.toLowerCase() !== trimmedQuery.toLowerCase());
        const newHistory = [
          savedItem || {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
            user_id: 'local',
            search_query: trimmedQuery,
            searched_at: new Date().toISOString()
          },
          ...filtered
        ];
        return newHistory.slice(0, 20);
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save history item');
      console.error('[useSearchHistory] Error saving history item:', err);
    }
  }, []);

  // Auto-load history on mount
  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  return {
    history,
    loading,
    error,
    loadHistory,
    removeHistoryItem,
    clearHistory,
    saveHistoryItem
  };
}