'use client';

import React, { useEffect, useState, use, useCallback } from 'react';
import { AlertCircle } from 'lucide-react';
import React, { useEffect, useState, use, useCallback } from 'react';
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { motion, AnimatePresence } from 'framer-motion';
import { BACKEND_URL } from '@/lib/apiConfig';
import { createClient } from '@/utils/supabase/client';
import { followService } from '@/services/followService';
import { likeService } from '@/services/likeService';
import { CreatorProfileView } from '@/components/profile/CreatorProfileView';
import { ProfileEditForm } from '@/components/profile/ProfileEditForm';
import { ProfileSkeleton } from '@/components/profile/ProfileSkeleton';

/** Maps whatever the external backend returns for a creator into the shared ProfileData shape. */
function normalizeProfile(raw, fallbackUsername) {
  const socialLinks = raw.socialLinks ?? raw.social_links ?? null;
  return {
    id: raw.id ?? raw.userId ?? raw.user_id,
    username: raw.displayName ?? raw.username ?? fallbackUsername,
    email: raw.email ?? null,
    bio: raw.bio ?? null,
    profileImageUrl: raw.profileImage ?? raw.profile_image_url ?? null,
    coverImageUrl: raw.bannerImage ?? raw.cover_image_url ?? null,
    createdAt: raw.createdAt ?? raw.created_at ?? new Date().toISOString(),
    verified: raw.verified === true || raw.verification_status === 'approved',
    region: raw.locationRegion ?? raw.location_region ?? raw.region ?? null,
    village: raw.village ?? null,
    ethnicGroup: raw.ethnicGroup ?? raw.ethnic_group ?? null,
    languagePreference: raw.languagePreference ?? raw.language_preference ?? null,
    favoredGenres: raw.favoredGenres ?? raw.favored_genres ?? [],
    socialLinks,
    website: socialLinks?.website ?? null,
    phone: raw.phone ?? null,
    role: raw.role ?? 'creator',
    isApprovedCreator: true,
    isPendingCreator: false,
  };
}

async function countRows(supabase, table, match) {
  let query = supabase.from(table).select('*', { count: 'exact', head: true });
  for (const [key, value] of Object.entries(match)) query = query.eq(key, value);
  const { count, error } = await query;
  if (error) return null;
  return count ?? 0;
}
import { followService } from '@/services/followService';
import { likeService } from '@/services/likeService';
import { CreatorProfileView } from '@/components/profile/CreatorProfileView';
import { ProfileEditForm } from '@/components/profile/ProfileEditForm';
import { ProfileSkeleton } from '@/components/profile/ProfileSkeleton';

/** Maps whatever the external backend returns for a creator into the shared ProfileData shape. */
function normalizeProfile(raw, fallbackUsername) {
  const socialLinks = raw.socialLinks ?? raw.social_links ?? null;
  return {
    id: raw.id ?? raw.userId ?? raw.user_id,
    username: raw.displayName ?? raw.username ?? fallbackUsername,
    email: raw.email ?? null,
    bio: raw.bio ?? null,
    profileImageUrl: raw.profileImage ?? raw.profile_image_url ?? null,
    coverImageUrl: raw.bannerImage ?? raw.cover_image_url ?? null,
    createdAt: raw.createdAt ?? raw.created_at ?? new Date().toISOString(),
    verified: raw.verified === true || raw.verification_status === 'approved',
    region: raw.locationRegion ?? raw.location_region ?? raw.region ?? null,
    village: raw.village ?? null,
    ethnicGroup: raw.ethnicGroup ?? raw.ethnic_group ?? null,
    languagePreference: raw.languagePreference ?? raw.language_preference ?? null,
    favoredGenres: raw.favoredGenres ?? raw.favored_genres ?? [],
    socialLinks,
    website: socialLinks?.website ?? null,
    phone: raw.phone ?? null,
    role: raw.role ?? 'creator',
    isApprovedCreator: true,
    isPendingCreator: false,
  };
}

async function countRows(supabase, table, match) {
  let query = supabase.from(table).select('*', { count: 'exact', head: true });
  for (const [key, value] of Object.entries(match)) query = query.eq(key, value);
  const { count, error } = await query;
  if (error) return null;
  return count ?? 0;
}

export default function PublicProfilePage({ params }) {
  const { username } = use(params);
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [movies, setMovies] = useState([]);
  const [music, setMusic] = useState([]);
  const [newestUpload, setNewestUpload] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const supabase = createClient();

  const loadContentAndStats = useCallback(async (creatorId) => {
    const [{ data: movieRows }, { data: contentRows }, followerCount, currentUserFollowing] = await Promise.all([
      supabase.from('movies').select('id, title, thumbnail, created_at').eq('uploaded_by', creatorId).order('created_at', { ascending: false }),
      supabase.from('content').select('id, title, cover_url, category, created_at').eq('creator_id', creatorId).order('created_at', { ascending: false }),
      countRows(supabase, 'follows', { followee_type: 'user', followee_id: creatorId }),
      followService.isFollowing('user', creatorId),
    ]);

    const movieList = movieRows ?? [];
    const contentList = contentRows ?? [];
    const musicRows = contentList.filter((c) => c.category === 'music');
    const totalLikes = await likeService.getLikesReceivedCount(creatorId);

    const movieItems = movieList.map((m) => ({ id: m.id, title: m.title ?? 'Untitled', thumbnail: m.thumbnail }));
    const musicItems = musicRows.map((c) => ({ id: c.id, title: c.title ?? 'Untitled', thumbnail: c.cover_url }));

    setMovies(movieItems);
    setMusic(musicItems);
    setNewestUpload(movieItems[0] ?? musicItems[0] ?? null);
    setStats({
      followersCount: followerCount,
      subscribersCount: null,
      totalViews: null,
      totalLikes,
      reelsPublished: null,
      moviesUploaded: movieList.length,
      musicUploaded: musicRows.length,
      playlistsPublished: null,
      engagementRate: null,
      trendingScore: null,
    });
    setIsFollowing(currentUserFollowing);
  }, [supabase]);
  const { username } = use(params);
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [movies, setMovies] = useState([]);
  const [music, setMusic] = useState([]);
  const [newestUpload, setNewestUpload] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const supabase = createClient();

  const loadContentAndStats = useCallback(async (creatorId) => {
    const [{ data: movieRows }, { data: contentRows }, followerCount, currentUserFollowing] = await Promise.all([
      supabase.from('movies').select('id, title, thumbnail, created_at').eq('uploaded_by', creatorId).order('created_at', { ascending: false }),
      supabase.from('content').select('id, title, cover_url, category, created_at').eq('creator_id', creatorId).order('created_at', { ascending: false }),
      countRows(supabase, 'follows', { followee_type: 'user', followee_id: creatorId }),
      followService.isFollowing('user', creatorId),
    ]);

    const movieList = movieRows ?? [];
    const contentList = contentRows ?? [];
    const musicRows = contentList.filter((c) => c.category === 'music');
    const totalLikes = await likeService.getLikesReceivedCount(creatorId);

    const movieItems = movieList.map((m) => ({ id: m.id, title: m.title ?? 'Untitled', thumbnail: m.thumbnail }));
    const musicItems = musicRows.map((c) => ({ id: c.id, title: c.title ?? 'Untitled', thumbnail: c.cover_url }));

    setMovies(movieItems);
    setMusic(musicItems);
    setNewestUpload(movieItems[0] ?? musicItems[0] ?? null);
    setStats({
      followersCount: followerCount,
      subscribersCount: null,
      totalViews: null,
      totalLikes,
      reelsPublished: null,
      moviesUploaded: movieList.length,
      musicUploaded: musicRows.length,
      playlistsPublished: null,
      engagementRate: null,
      trendingScore: null,
    });
    setIsFollowing(currentUserFollowing);
  }, [supabase]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profileRes = await fetch(`${BACKEND_URL}/api/creator/${username}`);
        if (!profileRes.ok) {
          const data = await profileRes.json();
          throw new Error(data.error || 'Failed to fetch creator profile');
        }
        const raw = await profileRes.json();
        const normalized = normalizeProfile(raw, username);
        setProfile(normalized);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const profileRes = await fetch(`${BACKEND_URL}/api/creator/${username}`);
        if (!profileRes.ok) {
          const data = await profileRes.json();
          throw new Error(data.error || 'Failed to fetch creator profile');
        }
        const raw = await profileRes.json();
        const normalized = normalizeProfile(raw, username);
        setProfile(normalized);

        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUser(user);
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUser(user);

        if (normalized.id) await loadContentAndStats(normalized.id);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
        if (normalized.id) await loadContentAndStats(normalized.id);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (username) fetchData();
  }, [username, supabase, loadContentAndStats]);
    if (username) fetchData();
  }, [username, supabase, loadContentAndStats]);

  const handleSave = async (fields) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/creator/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields),
      });
      if (!res.ok) throw new Error('Failed to save profile');
      const newData = await res.json();
      setProfile((prev) => ({ ...prev, ...normalizeProfile(newData.data || fields, username) }));
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      alert('Error saving profile: ' + err.message);
    }
  };
  const handleSave = async (fields) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/creator/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields),
      });
      if (!res.ok) throw new Error('Failed to save profile');
      const newData = await res.json();
      setProfile((prev) => ({ ...prev, ...normalizeProfile(newData.data || fields, username) }));
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      alert('Error saving profile: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#06080C] px-4 py-6 text-white">
        <div className="mx-auto max-w-6xl">
          <ProfileSkeleton />
        </div>
      </div>
    );
  }
  if (loading) {
    return (
      <div className="min-h-screen bg-[#06080C] px-4 py-6 text-white">
        <div className="mx-auto max-w-6xl">
          <ProfileSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#06080C] p-6 text-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 bg-red-600/10 rounded-[2.5rem] flex items-center justify-center mb-8 border border-red-600/20 shadow-2xl shadow-red-600/10"
        >
          <AlertCircle className="w-10 h-10 text-red-600" />
        </motion.div>
        <h1 className="text-3xl font-black text-white mb-4 tracking-tight">Profile Not Found</h1>
        <p className="text-zinc-500 mb-10 max-w-md font-medium leading-relaxed italic text-sm">&quot;{error}&quot;</p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/"
            className="px-10 py-4 border border-zinc-800 text-zinc-400 rounded-full font-black text-[10px] tracking-widest uppercase hover:bg-white/5 hover:text-white transition-all active:scale-95"
          >
            Return Home
          </Link>
          <Link
            href="/login"
            className="px-10 py-4 bg-red-600 text-white rounded-full font-black text-[10px] tracking-widest uppercase hover:bg-red-500 transition-all shadow-2xl shadow-red-600/20 active:scale-95"
          >
            Creator Login
          </Link>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#06080C] p-6 text-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 bg-red-600/10 rounded-[2.5rem] flex items-center justify-center mb-8 border border-red-600/20 shadow-2xl shadow-red-600/10"
        >
          <AlertCircle className="w-10 h-10 text-red-600" />
        </motion.div>
        <h1 className="text-3xl font-black text-white mb-4 tracking-tight">Profile Not Found</h1>
        <p className="text-zinc-500 mb-10 max-w-md font-medium leading-relaxed italic text-sm">&quot;{error}&quot;</p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/"
            className="px-10 py-4 border border-zinc-800 text-zinc-400 rounded-full font-black text-[10px] tracking-widest uppercase hover:bg-white/5 hover:text-white transition-all active:scale-95"
          >
            Return Home
          </Link>
          <Link
            href="/login"
            className="px-10 py-4 bg-red-600 text-white rounded-full font-black text-[10px] tracking-widest uppercase hover:bg-red-500 transition-all shadow-2xl shadow-red-600/20 active:scale-95"
          >
            Creator Login
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = !!(currentUser && profile?.id === currentUser.id);

  return (
    <div className="relative min-h-screen bg-[#06080C] text-white">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <AnimatePresence mode="wait">
          {isEditing ? (
            <motion.div key="editing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="rounded-xl border border-white/5 bg-[#0E121A] p-6 md:p-8">
                <ProfileEditForm profile={profile} onSave={handleSave} onCancel={() => setIsEditing(false)} />
              </div>
            </motion.div>
          ) : (
            <motion.div key="viewing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {stats && (
                <CreatorProfileView
                  profile={profile}
                  stats={stats}
                  isOwner={isOwner}
                  initialIsFollowing={isFollowing}
                  movies={movies}
                  music={music}
                  communityPosts={[]}
                  newestUpload={newestUpload}
                  onEditClick={isOwner ? () => setIsEditing(true) : undefined}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
  return (
    <div className="relative min-h-screen bg-[#06080C] text-white">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <AnimatePresence mode="wait">
          {isEditing ? (
            <motion.div key="editing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="rounded-xl border border-white/5 bg-[#0E121A] p-6 md:p-8">
                <ProfileEditForm profile={profile} onSave={handleSave} onCancel={() => setIsEditing(false)} />
              </div>
            </motion.div>
          ) : (
            <motion.div key="viewing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {stats && (
                <CreatorProfileView
                  profile={profile}
                  stats={stats}
                  isOwner={isOwner}
                  initialIsFollowing={isFollowing}
                  movies={movies}
                  music={music}
                  communityPosts={[]}
                  newestUpload={newestUpload}
                  onEditClick={isOwner ? () => setIsEditing(true) : undefined}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
