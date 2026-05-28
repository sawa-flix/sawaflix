import { BACKEND_URL } from "@/lib/apiConfig";
import { createClient } from "@/utils/supabase/client";

const STORAGE_KEY = 'sawaflix_search_history';
const MAX_HISTORY_ITEMS = 20;

function getLocalHistory() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn('[searchHistoryService] localStorage parse failed:', error);
    return [];
  }
}

function setLocalHistory(history) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, MAX_HISTORY_ITEMS)));
  } catch (error) {
    console.warn('[searchHistoryService] localStorage write failed:', error);
  }
}

function createHistoryItem(query) {
  const trimmedQuery = query.trim();
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    user_id: 'local',
    search_query: trimmedQuery,
    searched_at: new Date().toISOString(),
  };
}

/**
 * Search History Service
 * Handles API calls for search history management
 */
export const searchHistoryService = {
  /**
   * Fetch user's search history
   * GET /search
   */
  async fetchSearchHistory(limit = 20) {
    try {
      console.log('[searchHistoryService] fetchSearchHistory called with limit:', limit);
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      console.log('[searchHistoryService] Supabase session:', session ? 'YES (authenticated)' : 'NO (not authenticated)');
      console.log('[searchHistoryService] Token present:', token ? 'YES' : 'NO');

      const url = new URL(`${BACKEND_URL}/search`);
      if (limit !== 20) {
        url.searchParams.set('limit', limit.toString());
      }

      console.log('[searchHistoryService] Making request to:', url.toString());

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('[searchHistoryService] API Error:', errorData);
        throw new Error(errorData.error || 'Failed to fetch search history');
      }

      const data = await response.json();
      console.log('[searchHistoryService] Success! Data:', data);
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.warn('[searchHistoryService] Backend unavailable, using local search history fallback:', err);
      return getLocalHistory().slice(0, limit);
    }
  },

  async saveSearchHistoryItem(query) {
    if (!query?.trim()) return null;

    const item = createHistoryItem(query);
    const history = getLocalHistory();
    const existing = history.filter((historyItem) => historyItem.search_query.toLowerCase() !== item.search_query.toLowerCase());
    const updatedHistory = [item, ...existing].slice(0, MAX_HISTORY_ITEMS);
    setLocalHistory(updatedHistory);

    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      await fetch(`${BACKEND_URL}/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ search_query: item.search_query })
      });
    } catch (err) {
      console.warn('[searchHistoryService] Backend save unavailable, continuing with local history:', err);
    }

    return item;
  },

  /**
   * Delete a specific search history item
   * DELETE /search/{id}
   */
  async deleteSearchHistoryItem(id: string) {
    // Always delete from localStorage first (optimistic delete)
    const history = getLocalHistory().filter((item) => item.id !== id);
    setLocalHistory(history);

    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const response = await fetch(`${BACKEND_URL}/search/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete search history item');
      }

      return await response.json();
    } catch (err) {
      console.warn('[searchHistoryService] Backend delete failed or unavailable, already deleted from local history:', err);
      return { success: true };
    }
  },

  /**
   * Clear all search history
   * DELETE /search
   */
  async clearSearchHistory() {
    // Always clear localStorage first (optimistic clear)
    setLocalHistory([]);

    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const response = await fetch(`${BACKEND_URL}/search`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to clear search history');
      }

      return await response.json();
    } catch (err) {
      console.warn('[searchHistoryService] Backend clear failed or unavailable, already cleared local history:', err);
      return { success: true };
    }
  }
};