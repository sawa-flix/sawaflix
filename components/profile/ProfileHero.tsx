'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { MapPin, Pencil, LayoutDashboard, UploadCloud } from 'lucide-react';
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
  const location = [profile.village, profile.region || 'Cameroon'].filter(Boolean).join(', ') || 'Bamenda, Cameroon';
  const bioText = profile.bio || 'Celebrating Cameroonian stories.';

  return (
    <section className="relative overflow-hidden rounded-xl sm:rounded-2xl md:rounded-3xl border border-white/10 bg-[#0E121A] shadow-2xl">
      {/* Cover Background Banner */}
      <div className="relative h-32 sm:h-48 md:h-56 w-full overflow-hidden bg-gradient-to-r from-[#1A1F2C] via-[#0E121A] to-[#0A0D14]">
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
          <div className="relative h-full w-full">
            <Image
              src="/hero-bg.png"
              alt="SawaFlix Background"
              fill
              unoptimized
              className="object-cover object-center opacity-40 brightness-75"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/40" />
          </div>
        )}
        {/* Dark Vignette Overlays for contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0E121A] via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent hidden sm:block" />
      </div>

      {/* Profile Details Bar */}
      <div className="relative px-3.5 pb-4 sm:px-6 sm:pb-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 sm:gap-5 -mt-10 sm:-mt-14 md:-mt-18">
          
          {/* Avatar & User Details */}
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-3 sm:gap-4 text-center sm:text-left">
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

            <div className="space-y-0.5 pt-0.5 sm:pt-1">
              <h1 className="text-lg sm:text-2xl font-black tracking-tight text-white">
                {profile.username}
              </h1>

              <p className="text-[11px] sm:text-xs text-zinc-400 font-medium">
                Member since {formatJoinDate(profile.createdAt)}
              </p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-2.5 gap-y-0.5 text-[11px] sm:text-xs text-zinc-400 pt-0.5">
                <span className="flex items-center gap-1 text-zinc-300 font-medium">
                  <MapPin size={11} className="text-[#CE1126]" />
                  {location}
                </span>
                <span className="text-zinc-600 hidden sm:inline">•</span>
                <span className="italic text-zinc-400">
                  &ldquo;{bioText}&rdquo;
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex shrink-0 flex-wrap items-center justify-center sm:justify-end gap-2 pt-1 sm:pt-0">
            {isOwner ? (
              <>
                {onEditClick ? (
                  <button
                    type="button"
                    onClick={onEditClick}
                    className="flex items-center gap-1.5 rounded-lg sm:rounded-xl bg-white hover:bg-zinc-100 px-4 py-2 text-xs font-bold text-[#0E121A] transition-all shadow-md active:scale-95 cursor-pointer"
                  >
                    <Pencil size={13} />
                    <span>Edit Profile</span>
                  </button>
                ) : (
                  <Link
                    href="/dashboard/edit-profile"
                    className="flex items-center gap-1.5 rounded-lg sm:rounded-xl bg-white hover:bg-zinc-100 px-4 py-2 text-xs font-bold text-[#0E121A] transition-all shadow-md active:scale-95 cursor-pointer"
                  >
                    <Pencil size={13} />
                    <span>Edit Profile</span>
                  </Link>
                )}

                {isCreator && (
                  <>
                    <Link
                      href="/creator-dashboard"
                      className="flex items-center gap-1.5 rounded-lg sm:rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-3.5 py-2 text-xs font-bold text-white transition-colors"
                    >
                      <LayoutDashboard size={13} />
                      <span>Studio</span>
                    </Link>
                    <Link
                      href="/creator-dashboard/post/upload"
                      className="flex items-center gap-1.5 rounded-lg sm:rounded-xl bg-[#CE1126] hover:bg-red-700 px-3.5 py-2 text-xs font-bold text-white transition-colors shadow-lg shadow-red-600/20"
                    >
                      <UploadCloud size={13} />
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
                  className={`rounded-lg sm:rounded-xl px-5 py-2 text-xs font-bold transition-all active:scale-95 cursor-pointer ${
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
