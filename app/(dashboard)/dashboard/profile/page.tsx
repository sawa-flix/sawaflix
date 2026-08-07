import Link from 'next/link';
import { createClient } from '../../../../utils/supabase/server';
import { NormalUserProfileView } from '../../../../components/profile/NormalUserProfileView';
import { CreatorProfileView } from '../../../../components/profile/CreatorProfileView';
import { likeService } from '../../../../services/likeService';
import type { ProfileData, UserStats, CreatorStats, MediaGridItem } from '../../../../types/profile';

type UsersRow = {
  id: string;
  username: string | null;
  email: string | null;
  phone: string | null;
  profile_image_url: string | null;
  cover_image_url: string | null;
  bio: string | null;
  created_at: string;
  region: string | null;
  ethnic_group: string | null;
  village: string | null;
  language_preference: string | null;
  location_region: string | null;
  favored_genres: string[] | null;
  social_links: Record<string, string> | null;
  verification_status: string | null;
  role: string | null;
};

type MovieRow = { id: string; title: string | null; thumbnail: string | null; created_at: string };
type ContentRow = { id: string; title: string | null; cover_url: string | null; category: string | null; created_at: string };

async function countRows(
  supabase: Awaited<ReturnType<typeof createClient>>,
  table: string,
  match: Record<string, string>
): Promise<number | null> {
  let query = supabase.from(table).select('*', { count: 'exact', head: true });
  for (const [key, value] of Object.entries(match)) query = query.eq(key, value);
  const { count, error } = await query;
  if (error) {
    console.warn(`[profile/page] ${table} count unavailable:`, error.message);
    return null;
  }
  return count ?? 0;
}

const UserProfilePage = async () => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="min-h-screen bg-[#06080C] flex items-center justify-center">
        <Link href="/login" className="px-8 py-3 bg-[#CE1126] text-white rounded-full font-bold text-sm hover:bg-red-700 transition">
          Please Login
        </Link>
      </div>
    );
  }

  const [{ data: row }, { data: submission }] = await Promise.all([
    supabase
      .from('users')
      .select(
        `id, username, email, phone, profile_image_url, cover_image_url, bio, created_at,
         region, ethnic_group, village, language_preference, location_region, favored_genres,
         social_links, verification_status, role`
      )
      .eq('id', user.id)
      .single<UsersRow>(),
    supabase.from('verification_submissions').select('status').eq('creator_id', user.id).maybeSingle(),
  ]);

  const verificationStatus = (row?.verification_status ?? submission?.status ?? 'none').toLowerCase();
  const role = (row?.role ?? 'viewer').toLowerCase();
  const isApprovedCreator = role === 'admin' || verificationStatus === 'approved';
  const isPendingCreator = role === 'creator' && !isApprovedCreator && verificationStatus === 'pending';

  const socialLinks = row?.social_links ?? null;

  const profile: ProfileData = {
    id: user.id,
    username: row?.username ?? user.email?.split('@')[0] ?? 'user',
    email: row?.email ?? user.email ?? null,
    bio: row?.bio ?? null,
    profileImageUrl: row?.profile_image_url ?? null,
    coverImageUrl: row?.cover_image_url ?? null,
    createdAt: row?.created_at ?? user.created_at ?? new Date().toISOString(),
    verified: verificationStatus === 'approved',
    region: row?.location_region ?? row?.region ?? null,
    village: row?.village ?? null,
    ethnicGroup: row?.ethnic_group ?? null,
    languagePreference: row?.language_preference ?? null,
    favoredGenres: row?.favored_genres ?? [],
    socialLinks,
    website: socialLinks?.website ?? null,
    phone: row?.phone ?? null,
    role: (row?.role as ProfileData['role']) ?? null,
    isApprovedCreator,
    isPendingCreator,
  };

  const [{ data: movieRows }, { data: contentRows }, followerCount, followingCount] = await Promise.all([
    supabase.from('movies').select('id, title, thumbnail, created_at').eq('uploaded_by', user.id).order('created_at', { ascending: false }).returns<MovieRow[]>(),
    supabase.from('content').select('id, title, cover_url, category, created_at').eq('creator_id', user.id).order('created_at', { ascending: false }).returns<ContentRow[]>(),
    countRows(supabase, 'follows', { followee_type: 'user', followee_id: user.id }),
    countRows(supabase, 'follows', { follower_id: user.id }),
  ]);

  const movies = movieRows ?? [];
  const content = contentRows ?? [];
  const musicRows = content.filter((c) => c.category === 'music');

  const savedItems: MediaGridItem[] = (user.user_metadata?.favorites ?? []).map((f: Record<string, unknown>) => ({
    id: String(f.id ?? f.contentId),
    title: String(f.title ?? 'Untitled'),
    thumbnail: (f.thumbnail as string) ?? null,
  }));

  if (!isApprovedCreator) {
    const likesGiven = await likeService.getLikesGivenCount(user.id);
    const userStats: UserStats = {
      followingCount,
      followersCount: followerCount,
      moviesWatched: null,
      musicPlayed: null,
      reelsWatched: null,
      watchTimeMinutes: null,
      playlistsCreated: null,
      likesGiven,
      savedCount: savedItems.length,
    };

    return (
      <div className="min-h-screen bg-[#06080C] text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          <NormalUserProfileView profile={profile} stats={userStats} isOwner saved={savedItems} activity={[]} />
        </div>
      </div>
    );
  }

  // Approved creator — fetch likes-received (needs owned-content ids first).
  const movieIds = movies.map((m) => m.id);
  const contentIds = content.map((c) => c.id);
  let totalLikes: number | null = 0;
  if (movieIds.length > 0 || contentIds.length > 0) {
    const results = await Promise.all([
      movieIds.length > 0
        ? supabase.from('likes').select('*', { count: 'exact', head: true }).eq('content_type', 'movie').in('content_id', movieIds)
        : Promise.resolve({ count: 0, error: null }),
      contentIds.length > 0
        ? supabase.from('likes').select('*', { count: 'exact', head: true }).in('content_type', ['music', 'story']).in('content_id', contentIds)
        : Promise.resolve({ count: 0, error: null }),
    ]);
    totalLikes = results.some((r) => r.error) ? null : results.reduce((sum, r) => sum + (r.count ?? 0), 0);
  }

  const creatorStats: CreatorStats = {
    followersCount: followerCount,
    subscribersCount: null,
    totalViews: null,
    totalLikes,
    reelsPublished: null,
    moviesUploaded: movies.length,
    musicUploaded: musicRows.length,
    playlistsPublished: null,
    engagementRate: null,
    trendingScore: null,
  };

  const movieItems: MediaGridItem[] = movies.map((m) => ({ id: m.id, title: m.title ?? 'Untitled', thumbnail: m.thumbnail }));
  const musicItems: MediaGridItem[] = musicRows.map((c) => ({ id: c.id, title: c.title ?? 'Untitled', thumbnail: c.cover_url, subtitle: profile.username }));
  const newestUpload = movieItems[0] ?? musicItems[0] ?? null;

  return (
    <div className="min-h-screen bg-[#06080C] text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <CreatorProfileView
          profile={profile}
          stats={creatorStats}
          isOwner
          movies={movieItems}
          music={musicItems}
          communityPosts={[]}
          newestUpload={newestUpload}
        />
      </div>
    </div>
  );
};

export default UserProfilePage;
