import { BACKEND_URL } from "@/lib/apiConfig";
import { createClient } from "@/utils/supabase/client";

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
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    const url = new URL(`${BACKEND_URL}/search`);
    if (limit !== 20) {
      url.searchParams.set('limit', limit.toString());
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch search history');
    }

    return await response.json();
  },

  /**
   * Delete a specific search history item
   * DELETE /search/{id}
   */
  async deleteSearchHistoryItem(id: string) {
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
  },

  /**
   * Clear all search history
   * DELETE /search
   */
  async clearSearchHistory() {
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
  }
};