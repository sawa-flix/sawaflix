import { createClient } from '../utils/supabase/client';

export type FolloweeType = 'user' | 'youtube_channel';

/**
 * Real, persisted follow relationships — backs ProfileStats.followersCount/
 * followingCount and upgrades the Reels follow button (previously
 * optimistic-local-state-only) to something actually stored. Requires
 * supabase/migrations/0001_follows_and_likes.sql to have been run; until
 * then every method here fails soft (counts resolve to null, follow/unfollow
 * no-op) rather than throwing, matching the rest of the app's tolerance for
 * a not-yet-provisioned table.
 */
export const followService = {
  async follow(followeeType: FolloweeType, followeeId: string): Promise<void> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('follows')
      .insert({ follower_id: user.id, followee_type: followeeType, followee_id: followeeId });

    // 23505 = unique_violation (already following) — not a real failure.
    if (error && error.code !== '23505') {
      console.warn('[followService] follow failed (table may not exist yet):', error.message);
    }
  },

  async unfollow(followeeType: FolloweeType, followeeId: string): Promise<void> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', user.id)
      .eq('followee_type', followeeType)
      .eq('followee_id', followeeId);

    if (error) {
      console.warn('[followService] unfollow failed (table may not exist yet):', error.message);
    }
  },

  async isFollowing(followeeType: FolloweeType, followeeId: string): Promise<boolean> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', user.id)
      .eq('followee_type', followeeType)
      .eq('followee_id', followeeId)
      .maybeSingle();

    if (error) return false;
    return !!data;
  },

  /** Null means the count couldn't be computed (migration not applied yet) — never a fabricated 0. */
  async getFollowerCount(userId: string): Promise<number | null> {
    const supabase = createClient();
    const { count, error } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('followee_type', 'user')
      .eq('followee_id', userId);

    if (error) {
      console.warn('[followService] follows table unavailable:', error.message);
      return null;
    }
    return count ?? 0;
  },

  async getFollowingCount(userId: string): Promise<number | null> {
    const supabase = createClient();
    const { count, error } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', userId);

    if (error) {
      console.warn('[followService] follows table unavailable:', error.message);
      return null;
    }
    return count ?? 0;
  },
};
