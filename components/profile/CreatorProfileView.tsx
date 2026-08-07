'use client';

import { useState } from 'react';
import { Users, UserPlus, Eye, Heart, Video, Clapperboard, Music2, ListMusic, TrendingUp, Sparkles, MessagesSquare, Info } from 'lucide-react';
import type { ProfileData, CreatorStats, ProfileTabId, MediaGridItem, CommunityPost } from '@/types/profile';
import { followService } from '@/services/followService';
import { deriveCreatorAchievements } from '@/utils/profile/profileHelpers';
import { ProfileHero } from './ProfileHero';
import { ProfileStats, type StatItem } from './ProfileStats';
import { ProfileFeaturedContent } from './ProfileFeaturedContent';
import { ProfileHighlights } from './ProfileHighlights';
import { ProfileTabs, type ProfileTabDef } from './ProfileTabs';
import { ProfileMediaGrid } from './ProfileMediaGrid';
import { ProfileCommunityFeed } from './ProfileCommunityFeed';
import { ProfileAbout } from './ProfileAbout';
import { ProfileAchievements } from './ProfileAchievements';
import { ProfileAnalytics } from './ProfileAnalytics';
import { ProfileMonetization } from './ProfileMonetization';

const TABS: ProfileTabDef[] = [
  { id: 'reels', label: 'Reels', icon: Video },
  { id: 'movies', label: 'Movies', icon: Clapperboard },
  { id: 'music', label: 'Music', icon: Music2 },
  { id: 'playlists', label: 'Playlists', icon: ListMusic },
  { id: 'community', label: 'Community', icon: MessagesSquare },
  { id: 'about', label: 'About', icon: Info },
];

interface CreatorProfileViewProps {
  profile: ProfileData;
  stats: CreatorStats;
  isOwner: boolean;
  initialIsFollowing?: boolean;
  movies: MediaGridItem[];
  music: MediaGridItem[];
  communityPosts: CommunityPost[];
  newestUpload: MediaGridItem | null;
  /** /creator/[username] passes this to toggle its in-page edit mode instead of navigating to /dashboard/edit-profile. */
  onEditClick?: () => void;
}

/**
 * Public-facing creator channel — upload tools, analytics, and
 * monetization only ever render for the owner. No Continue
 * Watching/Watchlist here; those are consumer-profile concepts.
 */
export function CreatorProfileView({
  profile,
  stats,
  isOwner,
  initialIsFollowing,
  movies,
  music,
  communityPosts,
  newestUpload,
  onEditClick,
}: CreatorProfileViewProps) {
  const [activeTab, setActiveTab] = useState<ProfileTabId>('movies');
  const [isFollowing, setIsFollowing] = useState(!!initialIsFollowing);

  const handleToggleFollow = () => {
    const next = !isFollowing;
    setIsFollowing(next);
    (next ? followService.follow('user', profile.id) : followService.unfollow('user', profile.id)).catch((err) =>
      console.warn('[CreatorProfileView] follow persistence failed:', err)
    );
  };

  const statItems: StatItem[] = [
    { icon: Users, label: 'Followers', value: stats.followersCount },
    { icon: UserPlus, label: 'Subscribers', value: stats.subscribersCount },
    { icon: Eye, label: 'Total Views', value: stats.totalViews },
    { icon: Heart, label: 'Total Likes', value: stats.totalLikes },
    { icon: Video, label: 'Reels Published', value: stats.reelsPublished },
    { icon: Clapperboard, label: 'Movies Uploaded', value: stats.moviesUploaded },
    { icon: Music2, label: 'Music Uploaded', value: stats.musicUploaded },
    { icon: ListMusic, label: 'Playlists Published', value: stats.playlistsPublished },
    { icon: TrendingUp, label: 'Engagement Rate', value: stats.engagementRate },
    { icon: Sparkles, label: 'Trending Score', value: stats.trendingScore },
  ];

  return (
    <div className="space-y-6">
      <ProfileHero
        profile={profile}
        isOwner={isOwner}
        isCreator
        isFollowing={isFollowing}
        onToggleFollow={handleToggleFollow}
        onEditClick={onEditClick}
      />

      <ProfileStats items={statItems} />

      <ProfileFeaturedContent />

      <ProfileHighlights newestUpload={newestUpload} />

      <div className="rounded-2xl border border-white/5 bg-[#0E121A] p-5">
        <h2 className="mb-4 text-sm font-bold text-white">Achievements</h2>
        <ProfileAchievements achievements={deriveCreatorAchievements(profile, stats)} />
      </div>

      {isOwner && (
        <div>
          <h2 className="mb-4 text-sm font-bold text-white">Analytics</h2>
          <ProfileAnalytics />
        </div>
      )}

      {isOwner && <ProfileMonetization />}

      <div className="rounded-2xl border border-white/5 bg-[#0E121A] p-5">
        <ProfileTabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />
        <div className="pt-5">
          {activeTab === 'reels' && (
            <ProfileMediaGrid
              variant="poster"
              items={[]}
              emptyTitle="No reels to show"
              emptyDescription="Reels on SawaFlix are a curated YouTube feed, not creator-uploaded content."
              emptyIcon={Video}
            />
          )}
          {activeTab === 'movies' && (
            <ProfileMediaGrid
              variant="poster"
              items={movies}
              emptyTitle="No movies uploaded yet"
              emptyDescription="Movies this creator uploads will show up here."
              emptyIcon={Clapperboard}
            />
          )}
          {activeTab === 'music' && (
            <ProfileMediaGrid
              variant="list"
              items={music}
              emptyTitle="No music uploaded yet"
              emptyDescription="Tracks this creator publishes will show up here."
              emptyIcon={Music2}
            />
          )}
          {activeTab === 'playlists' && (
            <ProfileMediaGrid
              variant="card"
              items={[]}
              emptyTitle="Playlists are coming soon"
              emptyDescription="SawaFlix doesn't have published playlists yet — this is planned."
              emptyIcon={ListMusic}
            />
          )}
          {activeTab === 'community' && <ProfileCommunityFeed posts={communityPosts} />}
          {activeTab === 'about' && <ProfileAbout profile={profile} />}
        </div>
      </div>
    </div>
  );
}
