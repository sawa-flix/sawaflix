'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { MapPin, Crown, Pencil, LayoutDashboard, UploadCloud } from 'lucide-react';
import type { ProfileData } from '@/types/profile';
import { formatJoinDate } from '@/utils/profile/profileHelpers';
import { ProfileAvatar } from './ProfileAvatar';
import { ProfileShare } from './ProfileShare';

interface ProfileHeroProps {
  profile: ProfileData;
  isOwner: boolean;
  /** Whether to show creator-only action slots */
  isCreator: boolean;
  isFollowing?: boolean;
  onToggleFollow?: () => void;
  onEditClick?: () => void;
}

export function ProfileHero({
  profile,
  isOwner,
  isCreator,
  isFollowing,
  onToggleFollow,
  onEditClick,
}: ProfileHeroProps) {
  const location = [profile.village, profile.region || 'Cameroon'].filter(Boolean).join(', ');
  const defaultBio = 'Celebrating Cameroonian stories.';

  return (
    <section className="relative overflow-hidden rounded-2xl md:rounded-3xl border border-white/10 bg-[#0E121A] shadow-2xl">
      {/* Cover Background Banner */}
      <div className="relative h-44 sm:h-56 md:h-64 w-full overflow-hidden bg-gradient-to-r from-[#1A1F2C] via-[#0E121A] to-[#0A0D14]">
        {profile.coverImageUrl ? (
          <Image
            src={profile.coverImageUrl}
            alt=""
            fill
            unoptimized
            className="object-cover object-center brightness-90"
            priority
          />
        ) : (
          <div className="h-full w-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-zinc-800/40 via-[#0E121A] to-[#06080C]" />
        )}
        {/* Subtle Dark Glass Overlays for contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0E121A] via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent hidden sm:block" />
      </div>

      {/* Profile Details Bar */}
      <div className="relative px-5 pb-6 sm:px-8 sm:pb-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 -mt-16 sm:-mt-20">
          
          {/* Avatar & User Details */}
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-6 text-center sm:text-left">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="shrink-0"
            >
              <ProfileAvatar
                src={profile.profileImageUrl}
                name={profile.username}
                size="lg"
                showCamera={isOwner}
              />
            </motion.div>

            <div className="space-y-1.5 pt-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  {profile.username}
                </h1>
                
                {/* Premium / Creator Badge */}
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-gradient-to-r from-red-500/20 via-red-500/10 to-amber-500/10 text-white border border-red-500/30 shadow-sm">
                  <Crown size={12} className="text-red-400 fill-red-400" />
                  <span>{isCreator ? 'Creator Pro' : 'Premium Member'}</span>
                </span>
              </div>

              <p className="text-xs sm:text-sm text-zinc-400 font-medium">
                Member since {formatJoinDate(profile.createdAt)}
              </p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-1 text-xs text-zinc-400 pt-0.5">
                <span className="flex items-center gap-1 text-zinc-300 font-medium">
                  <MapPin size={13} className="text-[#CE1126]" />
                  {location}
                </span>
                <span className="text-zinc-600 hidden sm:inline">•</span>
                <span className="italic text-zinc-400">
                  &ldquo;{profile.bio || defaultBio}&rdquo;
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex shrink-0 flex-wrap items-center justify-center sm:justify-end gap-2.5 pt-2 md:pt-0">
            {isOwner ? (
              <>
                {onEditClick ? (
                  <button
                    type="button"
                    onClick={onEditClick}
                    className="flex items-center gap-2 rounded-xl bg-white hover:bg-zinc-100 px-5 py-2.5 text-xs sm:text-sm font-bold text-[#0E121A] transition-all shadow-md active:scale-95 cursor-pointer"
                  >
                    <Pencil size={14} />
                    <span>Edit Profile</span>
                  </button>
                ) : (
                  <Link
                    href="/dashboard/edit-profile"
                    className="flex items-center gap-2 rounded-xl bg-white hover:bg-zinc-100 px-5 py-2.5 text-xs sm:text-sm font-bold text-[#0E121A] transition-all shadow-md active:scale-95 cursor-pointer"
                  >
                    <Pencil size={14} />
                    <span>Edit Profile</span>
                  </Link>
                )}

                {isCreator && (
                  <>
                    <Link
                      href="/creator-dashboard"
                      className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-2.5 text-xs sm:text-sm font-bold text-white transition-colors"
                    >
                      <LayoutDashboard size={14} />
                      <span>Creator Studio</span>
                    </Link>
                    <Link
                      href="/creator-dashboard/post/upload"
                      className="flex items-center gap-1.5 rounded-xl bg-[#CE1126] hover:bg-red-700 px-4 py-2.5 text-xs sm:text-sm font-bold text-white transition-colors shadow-lg shadow-red-600/20"
                    >
                      <UploadCloud size={14} />
                      <span>Upload</span>
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
                  className={`rounded-xl px-6 py-2.5 text-xs sm:text-sm font-bold transition-all active:scale-95 cursor-pointer ${
                    isFollowing
                      ? 'bg-white/10 text-white hover:bg-white/15 border border-white/10'
                      : 'bg-[#CE1126] text-white hover:bg-red-700 shadow-lg shadow-red-600/20'
                  }`}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </button>
                <ProfileShare title={profile.username} />
              </>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
