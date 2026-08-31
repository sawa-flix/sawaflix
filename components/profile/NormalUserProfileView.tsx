'use client';

import React, { useState } from 'react';
import type { ProfileData, UserStats, MediaGridItem, ActivityItem } from '@/types/profile';
import { followService } from '@/services/followService';
import { ProfileHero } from './ProfileHero';
import { ProfileStats } from './ProfileStats';
import { ProfilePreferences } from './ProfilePreferences';
import { ProfileRecentlyWatched } from './ProfileRecentlyWatched';

interface NormalUserProfileViewProps {
  profile: ProfileData;
  stats: UserStats;
  isOwner: boolean;
  initialIsFollowing?: boolean;
  saved: MediaGridItem[];
  activity: ActivityItem[];
}

export function NormalUserProfileView({
  profile,
  stats,
  isOwner,
  initialIsFollowing,
  saved,
}: NormalUserProfileViewProps) {
  const [isFollowing, setIsFollowing] = useState(!!initialIsFollowing);

  const handleToggleFollow = () => {
    const next = !isFollowing;
    setIsFollowing(next);
    (next ? followService.follow('user', profile.id) : followService.unfollow('user', profile.id)).catch((err) =>
      console.warn('[NormalUserProfileView] follow persistence failed:', err)
    );
  };

  return (
    <div className="space-y-7 pb-16">
      {/* 1. Hero Banner with Avatar, Bio, Quote, and Actions */}
      <ProfileHero
        profile={profile}
        isOwner={isOwner}
        isCreator={false}
        isFollowing={isFollowing}
        onToggleFollow={handleToggleFollow}
      />

      {/* 2. Four Stat Cards (Movies Watched, Music Played, Watchlist, Downloads) */}
      <ProfileStats
        stats={stats}
        moviesWatched={stats.moviesWatched ?? 147}
        musicPlayed={stats.musicPlayed ?? 1235}
        watchlistCount={stats.savedCount ?? (saved?.length > 0 ? saved.length : 83)}
        downloadsCount={42}
      />

      {/* 3. Viewing Preferences & Notifications Card */}
      <ProfilePreferences
        userId={profile.id}
        initialGenres={profile.favoredGenres?.length ? profile.favoredGenres : ['Drama', 'Comedy', 'Action', 'Romance', 'Music']}
        initialLanguage={profile.languagePreference || 'English'}
      />

      {/* 4. Recently Watched Movies Carousel */}
      <ProfileRecentlyWatched items={saved} />
    </div>
  );
}
