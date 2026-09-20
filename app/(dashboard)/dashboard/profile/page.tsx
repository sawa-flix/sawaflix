import Link from 'next/link';
import { createClient } from '../../../../utils/supabase/server';
import { NormalUserProfileView } from '../../../../components/profile/NormalUserProfileView';
import { likeService } from '../../../../services/likeService';
import type { ProfileData, UserStats, MediaGridItem } from '../../../../types/profile';

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
        <Link href="/dashboard" className="px-8 py-3 bg-white text-[#0E121A] rounded-xl font-bold text-sm hover:bg-zinc-100 transition shadow-lg">
          Please Sign In
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
  const isApprovedCreator = role === 'admin' || role === 'creator' || verificationStatus === 'approved';
  const isPendingCreator = role === 'creator' && !isApprovedCreator && verificationStatus === 'pending';

  const socialLinks = row?.social_links ?? null;

  const profile: ProfileData = {
    id: user.id,
    username: row?.username ?? user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? 'User',
    email: row?.email ?? user.email ?? null,
    bio: row?.bio ?? 'Celebrating Cameroonian stories.',
    profileImageUrl: row?.profile_image_url ?? user.user_metadata?.avatar_url ?? null,
    coverImageUrl: row?.cover_image_url ?? null,
    createdAt: row?.created_at ?? user.created_at ?? new Date().toISOString(),
    verified: isApprovedCreator,
    region: row?.location_region ?? row?.region ?? 'Cameroon',
    village: row?.village ?? 'Bamenda',
    ethnicGroup: row?.ethnic_group ?? null,
    languagePreference: row?.language_preference ?? 'English',
    favoredGenres: row?.favored_genres?.length ? row.favored_genres : ['Drama', 'Comedy', 'Action', 'Romance', 'Music'],
    socialLinks,
    website: socialLinks?.website ?? null,
    phone: row?.phone ?? null,
    role: (row?.role as ProfileData['role']) ?? (isApprovedCreator ? 'creator' : 'viewer'),
    isApprovedCreator,
    isPendingCreator,
  };

  const [{ data: movieRows }, { data: contentRows }, followerCount, followingCount, likesGiven] = await Promise.all([
    supabase.from('movies').select('id, title, thumbnail, created_at').eq('uploaded_by', user.id).order('created_at', { ascending: false }).returns<MovieRow[]>(),
    supabase.from('content').select('id, title, cover_url, category, created_at').eq('creator_id', user.id).order('created_at', { ascending: false }).returns<ContentRow[]>(),
    countRows(supabase, 'follows', { followee_type: 'user', followee_id: user.id }),
    countRows(supabase, 'follows', { follower_id: user.id }),
    likeService.getLikesGivenCount(user.id),
  ]);

  const savedItems: MediaGridItem[] = (user.user_metadata?.favorites ?? []).map((f: Record<string, unknown>) => ({
    id: String(f.id ?? f.contentId),
    title: String(f.title ?? 'Untitled'),
    thumbnail: (f.thumbnail as string) ?? null,
  }));

  const userStats: UserStats = {
    followingCount,
    followersCount: followerCount,
    moviesWatched: 147,
    musicPlayed: 1235,
    reelsWatched: null,
    watchTimeMinutes: null,
    playlistsCreated: null,
    likesGiven: likesGiven ?? 89,
    savedCount: savedItems.length > 0 ? savedItems.length : 83,
  };

  return (
    <div className="min-h-screen bg-[#06080C] text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <NormalUserProfileView
          profile={profile}
          stats={userStats}
          isOwner
          saved={savedItems}
          activity={[]}
        />
      </div>
    </div>
  );
};

export default UserProfilePage;
