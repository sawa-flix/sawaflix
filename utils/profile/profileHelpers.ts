import type { Achievement, ProfileData, CreatorStats } from '@/types/profile';

const COMPLETION_CHECKS: Array<[(p: ProfileData) => boolean, string]> = [
  [(p) => !!p.profileImageUrl, 'Profile Photo'],
  [(p) => !!p.coverImageUrl, 'Cover Photo'],
  [(p) => !!p.bio && p.bio.trim().length > 0, 'Bio'],
  [(p) => !!p.website, 'Website'],
  [(p) => p.favoredGenres.length > 0, 'Favorite Genres'],
  [(p) => !!p.region, 'Region'],
  [(p) => !!p.languagePreference, 'Language'],
  [(p) => !!(p.socialLinks && Object.keys(p.socialLinks).length > 0), 'Social Links'],
];

/** Real, computed from how many profile fields are actually filled in — never a fabricated number. */
export function computeProfileCompletion(profile: ProfileData): { percent: number; missing: string[] } {
  const missing = COMPLETION_CHECKS.filter(([check]) => !check(profile)).map(([, label]) => label);
  const percent = Math.round(((COMPLETION_CHECKS.length - missing.length) / COMPLETION_CHECKS.length) * 100);
  return { percent, missing };
}

export function formatJoinDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
}

const EARLY_MEMBER_MIN_DAYS = 90;

function accountAgeDays(createdAt: string): number {
  return (Date.now() - new Date(createdAt).getTime()) / 86_400_000;
}

/**
 * Normal-user achievement set. Only "Early Member" and "Premium Member" have
 * any real signal today (account age; the latter is permanently unearned —
 * no subscription-plan system exists anywhere in this app). Watch-count and
 * streak achievements have no tracking data to derive from, so they're
 * returned locked rather than fabricated as earned.
 */
export function deriveUserAchievements(profile: ProfileData): Achievement[] {
  return [
    {
      id: 'early_member',
      label: 'Early Member',
      description: `Part of SawaFlix for over ${EARLY_MEMBER_MIN_DAYS} days`,
      earned: accountAgeDays(profile.createdAt) >= EARLY_MEMBER_MIN_DAYS,
    },
    {
      id: 'movies_100',
      label: '100 Movies Watched',
      description: 'Watch history isn’t tracked yet',
      earned: false,
    },
    {
      id: 'thirty_day_streak',
      label: '30 Day Streak',
      description: 'Viewing streaks aren’t tracked yet',
      earned: false,
    },
    {
      id: 'top_fan',
      label: 'Top Fan',
      description: 'No fan-ranking system exists yet',
      earned: false,
    },
    {
      id: 'premium_member',
      label: 'Premium Member',
      description: 'No subscription plan system exists yet',
      earned: false,
    },
  ];
}

/**
 * Creator achievement set. "Verified Creator" and "100K Followers" are real,
 * computed from actual data (verification_status, the follows table).
 * Everything view/trending/genre-ranking-based has no tracking anywhere in
 * this app and stays locked rather than fabricated.
 */
export function deriveCreatorAchievements(profile: ProfileData, stats: CreatorStats): Achievement[] {
  return [
    {
      id: 'verified_creator',
      label: 'Verified Creator',
      description: 'Completed creator verification',
      earned: profile.verified,
    },
    {
      id: 'followers_100k',
      label: '100K Followers',
      description: 'Reached 100,000 followers',
      earned: stats.followersCount !== null && stats.followersCount >= 100_000,
    },
    {
      id: 'trending_creator',
      label: 'Trending Creator',
      description: 'Trending scores aren’t tracked yet',
      earned: false,
    },
    {
      id: 'views_1m',
      label: '1M Views',
      description: 'View counts aren’t tracked yet',
      earned: false,
    },
    {
      id: 'top_music_creator',
      label: 'Top Music Creator',
      description: 'No genre-ranking system exists yet',
      earned: false,
    },
    {
      id: 'top_movie_creator',
      label: 'Top Movie Creator',
      description: 'No genre-ranking system exists yet',
      earned: false,
    },
  ];
}
