import { createClient } from '../utils/supabase/client';

export type LikeContentType = 'youtube_video' | 'movie' | 'music' | 'story';

/**
 * Real, persisted likes — backs ProfileStats.likesReceived (and a "likes
 * given" count, if ever surfaced). Requires
 * supabase/migrations/0001_follows_and_likes.sql. Every method fails soft
 * (counts resolve to null) rather than throwing when the table isn't
 * provisioned yet.
 */
export const likeService = {
  async like(contentType: LikeContentType, contentId: string): Promise<void> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('likes')
      .insert({ user_id: user.id, content_type: contentType, content_id: contentId });

    if (error && error.code !== '23505') {
      console.warn('[likeService] like failed (table may not exist yet):', error.message);
    }
  },

  async unlike(contentType: LikeContentType, contentId: string): Promise<void> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('likes')
      .delete()
      .eq('user_id', user.id)
      .eq('content_type', contentType)
      .eq('content_id', contentId);

    if (error) {
      console.warn('[likeService] unlike failed (table may not exist yet):', error.message);
    }
  },

  async getLikesGivenCount(userId: string): Promise<number | null> {
    const supabase = createClient();
    const { count, error } = await supabase
      .from('likes')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (error) {
      console.warn('[likeService] likes table unavailable:', error.message);
      return null;
    }
    return count ?? 0;
  },

  /**
   * Likes received across content the user actually owns — requires
   * knowing which movie/content rows belong to them first, since `likes`
   * itself has no ownership column.
   */
  async getLikesReceivedCount(userId: string): Promise<number | null> {
    const supabase = createClient();

    const [{ data: movies, error: moviesError }, { data: content, error: contentError }] = await Promise.all([
      supabase.from('movies').select('id').eq('uploaded_by', userId),
      supabase.from('content').select('id').eq('creator_id', userId),
    ]);

    if (moviesError || contentError) {
      console.warn('[likeService] could not resolve owned content:', moviesError?.message || contentError?.message);
      return null;
    }

    const movieIds = (movies ?? []).map((m) => m.id);
    const contentIds = (content ?? []).map((c) => c.id);

    if (movieIds.length === 0 && contentIds.length === 0) return 0;

    const counts = await Promise.all([
      movieIds.length > 0
        ? supabase.from('likes').select('*', { count: 'exact', head: true }).eq('content_type', 'movie').in('content_id', movieIds)
        : Promise.resolve({ count: 0, error: null }),
      contentIds.length > 0
        ? supabase.from('likes').select('*', { count: 'exact', head: true }).in('content_type', ['music', 'story']).in('content_id', contentIds)
        : Promise.resolve({ count: 0, error: null }),
    ]);

    if (counts.some((c) => c.error)) {
      console.warn('[likeService] likes table unavailable');
      return null;
    }

    return counts.reduce((sum, c) => sum + (c.count ?? 0), 0);
  },
};
