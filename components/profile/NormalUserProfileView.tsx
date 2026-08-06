'use client';

import { useState } from 'react';
import { UserPlus, Users, Clapperboard, Music2, Video, Clock, ListMusic, Heart } from 'lucide-react';
import type { ProfileData, UserStats, ProfileTabId, MediaGridItem, ActivityItem } from '@/types/profile';
import { followService } from '@/services/followService';
import { deriveUserAchievements } from '@/utils/profile/profileHelpers';
import { ProfileHero } from './ProfileHero';
import { ProfileStats, type StatItem } from './ProfileStats';
import { ProfileGenres } from './ProfileGenres';
import { ProfileContinueWatching } from './ProfileContinueWatching';
import { ProfileCompletion } from './ProfileCompletion';
import { ProfileTabs, type ProfileTabDef } from './ProfileTabs';
import { ProfileMediaGrid } from './ProfileMediaGrid';
import { ProfileActivity } from './ProfileActivity';
import { ProfileAbout } from './ProfileAbout';
import { ProfileAchievements } from './ProfileAchievements';
import { ProfilePrivacy } from './ProfilePrivacy';

const TABS: ProfileTabDef[] = [
  { id: 'watchlist', label: 'Watchlist', icon: Video },
  { id: 'liked', label: 'Liked', icon: Heart },
  { id: 'saved', label: 'Saved', icon: Clapperboard },
  { id: 'playlists', label: 'Playlists', icon: ListMusic },
  { id: 'activity', label: 'Activity', icon: Clock },
  { id: 'about', label: 'About', icon: Music2 },
];

interface NormalUserProfileViewProps {
  profile: ProfileData;
  stats: UserStats;
  isOwner: boolean;
  initialIsFollowing?: boolean;
  saved: MediaGridItem[];
  activity: ActivityItem[];
}

/**
 * Consumer-facing profile — no upload tools, no analytics, no creator
 * stats. Watchlist/Liked have no distinct backing data (only "Saved" does,
 * via favoritesService) — they render as their own honest empty tabs
 * rather than fabricating a split that doesn't exist.
 */
export function NormalUserProfileView({ profile, stats, isOwner, initialIsFollowing, saved, activity }: NormalUserProfileViewProps) {
  const [activeTab, setActiveTab] = useState<ProfileTabId>('saved');
  const [isFollowing, setIsFollowing] = useState(!!initialIsFollowing);

  const handleToggleFollow = () => {
    const next = !isFollowing;
    setIsFollowing(next);
    (next ? followService.follow('user', profile.id) : followService.unfollow('user', profile.id)).catch((err) =>
      console.warn('[NormalUserProfileView] follow persistence failed:', err)
    );
  };

  const statItems: StatItem[] = [
    { icon: Users, label: 'Following', value: stats.followingCount },
    { icon: UserPlus, label: 'Followers', value: stats.followersCount },
    { icon: Heart, label: 'Likes Given', value: stats.likesGiven },
    { icon: Clapperboard, label: 'Saved', value: stats.savedCount },
    { icon: Clock, label: 'Watch Time', value: stats.watchTimeMinutes },
  ];

  return (
    <div className="space-y-6">
      <ProfileHero profile={profile} isOwner={isOwner} isCreator={false} isFollowing={isFollowing} onToggleFollow={handleToggleFollow} />

      <ProfileStats items={statItems} />

      {isOwner && <ProfileCompletion profile={profile} />}

      <ProfileGenres genres={profile.favoredGenres} />

      <div>
        <h2 className="mb-4 text-sm font-bold text-white">Continue Watching</h2>
        <ProfileContinueWatching />
      </div>

      <div className="rounded-2xl border border-white/5 bg-[#0E121A] p-5">
        <h2 className="mb-4 text-sm font-bold text-white">Achievements</h2>
        <ProfileAchievements achievements={deriveUserAchievements(profile)} />
      </div>

      {isOwner && <ProfilePrivacy />}

      <div className="rounded-2xl border border-white/5 bg-[#0E121A] p-5">
        <ProfileTabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />
        <div className="pt-5">
          {activeTab === 'watchlist' && (
            <ProfileMediaGrid
              variant="poster"
              items={[]}
              emptyTitle="Watchlist is coming soon"
              emptyDescription="There's no separate watchlist yet — only Saved items are tracked today."
              emptyIcon={Video}
            />
          )}
          {activeTab === 'liked' && (
            <ProfileMediaGrid
              variant="card"
              items={[]}
              emptyTitle="No public like history yet"
              emptyDescription="There's no way to list everything you've liked across the app yet."
              emptyIcon={Heart}
            />
          )}
          {activeTab === 'saved' && (
            <ProfileMediaGrid
              variant="card"
              items={saved}
              emptyTitle="Nothing saved yet"
              emptyDescription="Items you save will show up here."
              emptyIcon={Clapperboard}
            />
          )}
          {activeTab === 'playlists' && (
            <ProfileMediaGrid
              variant="card"
              items={[]}
              emptyTitle="Playlists are coming soon"
              emptyDescription="SawaFlix doesn't have saved playlists yet — this is planned."
              emptyIcon={ListMusic}
            />
          )}
          {activeTab === 'activity' && <ProfileActivity items={activity} />}
          {activeTab === 'about' && <ProfileAbout profile={profile} />}
        </div>
      </div>
    </div>
  );
}
