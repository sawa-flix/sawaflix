import { BACKEND_URL } from '../lib/apiConfig';
import { createClient } from '../utils/supabase/client';

export const favoritesService = {
  async getAuthHeader(includeJson = true) {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    const visitorId = typeof window !== 'undefined' ? localStorage.getItem('sawaflix_visitor_id') : null;
    
    if (!session) {
      throw new Error('User must be logged in to manage favorites');
    }

    const headers: Record<string, string> = {
      'Authorization': `Bearer ${session.access_token}`,
      ...(visitorId ? { 'x-visitor-id': visitorId } : {})
    };

    if (includeJson) {
      headers['Content-Type'] = 'application/json';
    }

    return headers;
  },

  async getFavorites() {
    try {
      const headers = await this.getAuthHeader(false);
      const res = await fetch(`${BACKEND_URL}/api/favorites`, { headers });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to fetch favorites: ${res.status} ${errorText}`);
      }
      return res.json();
    } catch (err) {
      console.error('getFavorites error:', err);
      return [];
    }
  },

  async addFavorite(content: any) {
    let contentId = content.id || content.contentId || content.videoId || content.title;
    if (!contentId) throw new Error('Missing contentId');
    
    // Slugify title if used as ID to avoid URL issues
    contentId = String(contentId).trim().replace(/\s+/g, '-').toLowerCase();

    const headers = await this.getAuthHeader(false);

    const res = await fetch(`${BACKEND_URL}/api/favorites/${encodeURIComponent(contentId)}`, {
      method: 'POST',
      headers
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `API Error: ${res.status}`);
    }
    return res.json();
  },

  async removeFavorite(contentId: string) {
    if (!contentId) throw new Error('Missing contentId');
    const headers = await this.getAuthHeader(false);
    const res = await fetch(`${BACKEND_URL}/api/favorites/${contentId}`, {
      method: 'DELETE',
      headers
    });
    if (!res.ok) throw new Error(`Failed to remove favorite: ${res.status}`);
    return res.json();
  },

  async clearFavorites() {
    const headers = await this.getAuthHeader();
    const res = await fetch(`${BACKEND_URL}/api/favorites`, {
      method: 'DELETE',
      headers
    });
    if (!res.ok) throw new Error('Failed to clear favorites');
    return res.json();
  }
};
