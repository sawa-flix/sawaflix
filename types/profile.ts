/**
 * Shared shape both /dashboard/profile and /creator/[username] normalize
 * into before handing data to the shared components/profile/* components.
 * Each route fetches from its own appropriate source (Supabase directly for
 * the dashboard route, the external backend for the public creator route)
 * and maps into this one interface — the components never know which.
 */
export interface ProfileData {
  id: string;
  username: string;
  email: string | null;
  bio: string | null;
  profileImageUrl: string | null;
  coverImageUrl: string | null;
  createdAt: string;
  verified: boolean;
  region: string | null;
  village: string | null;
  ethnicGroup: string | null;
  languagePreference: string | null;
  favoredGenres: string[];
  socialLinks: Record<string, string> | null;
  website: string | null;
  phone: string | null;
  /** Self-declared at signup — on its own does NOT mean "is a creator" (see isApprovedCreator). */
  role: 'creator' | 'viewer' | 'admin' | null;
  /** The real, app-wide gate this codebase already uses for /creator-dashboard access:
   *  role === 'admin' || verification_status === 'approved'. This — not `role` — decides
   *  whether NormalUserProfileView or CreatorProfileView renders. */
  isApprovedCreator: boolean;
  /** Applied (role === 'creator') but not yet approved — still gets the Normal User profile. */
  isPendingCreator: boolean;
}

/**
 * `null` means "no tracking exists for this yet" (e.g. no watch-history table,
 * or the follows/likes migration hasn't been applied) — distinct from a real
 * `0`. Components render `null` as an honest "—", never a fabricated number.
 */
export interface UserStats {
  followingCount: number | null;
  followersCount: number | null;
  moviesWatched: number | null;
  musicPlayed: number | null;
  reelsWatched: number | null;
  watchTimeMinutes: number | null;
  playlistsCreated: number | null;
  likesGiven: number | null;
  savedCount: number;
}

export interface CreatorStats {
  followersCount: number | null;
  subscribersCount: number | null;
  totalViews: number | null;
  totalLikes: number | null;
  reelsPublished: number | null;
  moviesUploaded: number;
  musicUploaded: number;
  playlistsPublished: number | null;
  engagementRate: number | null;
  trendingScore: number | null;
}

export type ProfileTabId =
  | 'reels'
  | 'movies'
  | 'music'
  | 'playlists'
  | 'watchlist'
  | 'liked'
  | 'saved'
  | 'activity'
  | 'community'
  | 'about';

export interface MediaGridItem {
  id: string;
  title: string;
  thumbnail: string | null;
  href?: string;
  subtitle?: string;
}

/**
 * Normal-user consumption activity (Watched Movie / Liked Reel / Commented /
 * Followed Creator / Created Playlist). None of these are tracked anywhere
 * in this app today — no watch-history, no likes-by-me readback, no
 * comments-by-me aggregation, no follows-by-me timeline, no playlists
 * feature — so this always renders as an honest empty state for now. The
 * type exists so it's ready the moment any of that tracking gets built.
 */
export type ActivityType = 'watched_movie' | 'liked_reel' | 'commented' | 'followed_creator' | 'created_playlist';

export interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  thumbnail: string | null;
  createdAt: string;
}

/** Structurally ready for the future (per "Community Feed... future ready"); no backing table exists yet. */
export interface CommunityPost {
  id: string;
  type: 'announcement' | 'post' | 'poll' | 'update';
  title: string;
  body: string;
  createdAt: string;
}

export type AchievementId =
  // shared / user
  | 'early_member'
  | 'verified_creator'
  | 'top_reviewer'
  | 'movies_100'
  | 'thirty_day_streak'
  | 'top_fan'
  | 'premium_member'
  // creator-only
  | 'trending_creator'
  | 'followers_100k'
  | 'views_1m'
  | 'top_music_creator'
  | 'top_movie_creator';

export interface Achievement {
  id: AchievementId;
  label: string;
  description: string;
  earned: boolean;
}
