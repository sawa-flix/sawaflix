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
}

export function useSearchHistory(): UseSearchHistoryReturn {
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await searchHistoryService.fetchSearchHistory();
      // Response is an array of history items
      setHistory(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load search history');
      console.error('Error loading search history:', err);
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
    clearHistory
  };
}