'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Link2, Pencil, LayoutDashboard, UploadCloud } from 'lucide-react';
import type { ProfileData } from '@/types/profile';
import { formatJoinDate } from '@/utils/profile/profileHelpers';
import { ProfileAvatar } from './ProfileAvatar';
import { ProfileBadges } from './ProfileBadges';
import { ProfileShare } from './ProfileShare';

interface ProfileHeroProps {
  profile: ProfileData;
  isOwner: boolean;
  /** Whether to show the creator-only action slots (Creator Dashboard/Upload for the owner, Subscribe for a visitor). */
  isCreator: boolean;
  isFollowing?: boolean;
  onToggleFollow?: () => void;
  /** /dashboard/profile edits via a direct link; /creator/[username] edits via an in-page toggle against the external backend — pass whichever applies. */
  onEditClick?: () => void;
}

/**
 * Shared hero for both profile types — `isOwner`/`isCreator` only change
 * which action buttons render, not the structure. Owner: Edit Profile +
 * Share, plus Creator Dashboard/Upload if isCreator. Visitor: Follow +
 * Share, plus a disabled "Subscribe" (future-ready) if isCreator.
 */
export function ProfileHero({ profile, isOwner, isCreator, isFollowing, onToggleFollow, onEditClick }: ProfileHeroProps) {
  const location = [profile.village, profile.region].filter(Boolean).join(', ');

  return (
    <section className="relative overflow-hidden rounded-2xl border border-white/5 bg-[#0E121A]">
      <div className="relative h-40 w-full sm:h-56 md:h-64">
        {profile.coverImageUrl ? (
          <Image src={profile.coverImageUrl} alt="" fill unoptimized className="object-cover" priority />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-[#1E293B] via-[#0E121A] to-black" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0E121A] via-transparent to-black/20" />
      </div>

      <div className="relative px-5 pb-5 sm:px-8 sm:pb-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="-mt-16 sm:-mt-20">
          <ProfileAvatar src={profile.profileImageUrl} name={profile.username} size="lg" />
        </motion.div>

        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">{profile.username}</h1>
              <ProfileBadges verified={profile.verified} isCreator={isCreator} />
            </div>
            <p className="text-sm text-gray-400">@{profile.username}</p>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {isOwner ? (
              <>
                {onEditClick ? (
                  <button
                    type="button"
                    onClick={onEditClick}
                    className="flex items-center gap-1.5 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-black transition-colors hover:bg-white/90"
                  >
                    <Pencil size={14} />
                    Edit Profile
                  </button>
                ) : (
                  <Link
                    href="/dashboard/edit-profile"
                    className="flex items-center gap-1.5 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-black transition-colors hover:bg-white/90"
                  >
                    <Pencil size={14} />
                    Edit Profile
                  </Link>
                )}
                {isCreator && (
                  <>
                    <Link
                      href="/creator-dashboard"
                      className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-white/10"
                    >
                      <LayoutDashboard size={14} />
                      Creator Dashboard
                    </Link>
                    <Link
                      href="/creator-dashboard/post/upload"
                      className="flex items-center gap-1.5 rounded-full bg-[#CE1126] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-red-700"
                    >
                      <UploadCloud size={14} />
                      Upload
                    </Link>
                  </>
                )}
                <ProfileShare title={profile.username} />
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={onToggleFollow}
                  aria-pressed={isFollowing}
                  className={`rounded-full px-6 py-2.5 text-sm font-bold transition-colors ${
                    isFollowing ? 'bg-white/10 text-white/70 hover:bg-white/15' : 'bg-[#CE1126] text-white hover:bg-red-700'
                  }`}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </button>
                {isCreator && (
                  <button
                    type="button"
                    disabled
                    title="Subscriptions are coming soon"
                    className="cursor-not-allowed rounded-full border border-white/10 bg-white/5 px-6 py-2.5 text-sm font-bold text-white/30"
                  >
                    Subscribe
                  </button>
                )}
                <ProfileShare title={profile.username} />
              </>
            )}
          </div>
        </div>

        {profile.bio && <p className="mt-4 max-w-2xl text-sm leading-relaxed text-gray-300">{profile.bio}</p>}

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium text-gray-500">
          {location && (
            <span className="flex items-center gap-1.5">
              <MapPin size={13} />
              {location}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Calendar size={13} />
            Joined {formatJoinDate(profile.createdAt)}
          </span>
          {profile.website && (
            <a
              href={profile.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[#CE1126] hover:text-red-400"
            >
              <Link2 size={13} />
              {profile.website.replace(/^https?:\/\//, '')}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
