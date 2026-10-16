import { createClient } from '../utils/supabase/client';
import { compactFavorites, type FavoriteItem } from '../utils/favorites';

export type { FavoriteItem } from '../utils/favorites';

export const favoritesService = {
  async getFavorites(): Promise<FavoriteItem[]> {
    try {
      const supabase = createClient();
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        console.error('getFavorites: not logged in or error', error);
        return [];
      }

      const original = user.user_metadata?.favorites || [];
      const favorites = compactFavorites(original);
      if (JSON.stringify(original) !== JSON.stringify(favorites)) {
        const { error: updateError } = await supabase.auth.updateUser({ data: { favorites } });
        if (updateError) console.warn('Could not compact saved favorites in auth metadata:', updateError.message);
      }
      return favorites;
    } catch (err) {
      console.error('getFavorites error:', err);
      return [];
    }
  },

  async addFavorite(content: Record<string, unknown>): Promise<FavoriteItem[]> {
    try {
      const supabase = createClient();
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) {
        throw new Error('User must be logged in to manage favorites');
      }

      const rawContentId = content.id || content.contentId || content.videoId || content.title;
      if (!rawContentId) throw new Error('Missing contentId');
      
      // Slugify title if used as ID to avoid URL issues
      const contentId = String(rawContentId).trim().replace(/\s+/g, '-').toLowerCase();

      const currentFavorites = compactFavorites(user.user_metadata?.favorites);
      
      // Prevent duplicates
      if (currentFavorites.some(f => f.contentId === contentId || f.id === contentId)) {
        return currentFavorites;
      }

      const newFavorite: FavoriteItem = {
        id: contentId,
        contentId: contentId,
        title: typeof content.title === 'string' ? content.title : '',
        thumbnail: typeof (content.thumbnail || content.poster) === 'string' ? String(content.thumbnail || content.poster) : '',
        type: typeof content.type === 'string' ? content.type : 'video',
      };

      const updatedFavorites = compactFavorites([...currentFavorites, newFavorite]);

      const { data: updatedUser, error: updateError } = await supabase.auth.updateUser({
        data: { favorites: updatedFavorites }
      });

      if (updateError) {
        throw new Error(`Failed to update favorites: ${updateError.message}`);
      }

      return compactFavorites(updatedUser.user.user_metadata.favorites);
    } catch (err) {
      console.error('addFavorite error:', err);
      throw err;
    }
  },

  async removeFavorite(contentId: string): Promise<FavoriteItem[]> {
    if (!contentId) throw new Error('Missing contentId');
    
    try {
      const supabase = createClient();
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) {
        throw new Error('User must be logged in to manage favorites');
      }

      const currentFavorites = compactFavorites(user.user_metadata?.favorites);
      const updatedFavorites = compactFavorites(currentFavorites.filter(f => f.contentId !== contentId && f.id !== contentId));

      const { data: updatedUser, error: updateError } = await supabase.auth.updateUser({
        data: { favorites: updatedFavorites }
      });

      if (updateError) {
        throw new Error(`Failed to update favorites: ${updateError.message}`);
      }

      return compactFavorites(updatedUser.user.user_metadata.favorites);
    } catch (err) {
      console.error('removeFavorite error:', err);
      throw err;
    }
  },

  async clearFavorites(): Promise<FavoriteItem[]> {
    try {
      const supabase = createClient();
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) {
        throw new Error('User must be logged in to manage favorites');
      }

      const { error: updateError } = await supabase.auth.updateUser({
        data: { favorites: [] }
      });

      if (updateError) {
        throw new Error(`Failed to clear favorites: ${updateError.message}`);
      }

      return [];
    } catch (err) {
      console.error('clearFavorites error:', err);
      throw err;
    }
  }
};
