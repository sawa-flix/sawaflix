'use client';

import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Calendar, Edit2, Crown, Camera } from 'lucide-react';

interface ProfileHeroProps {
  username: string | null;
  profileImageUrl: string | null;
  coverImageUrl: string | null;
  bio: string | null;
  createdAt: string;
  region?: string | null;
  isPremium?: boolean;
}

export default function ProfileHero({
  username,
  profileImageUrl,
  coverImageUrl,
  bio,
  createdAt,
  region,
  isPremium = true,
}: ProfileHeroProps) {
  const joinDate = new Date(createdAt).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#0E121A]">
      {/* Cover Image */}
      <div className="relative h-44 md:h-52 w-full">
        {coverImageUrl ? (
          <Image src={coverImageUrl} alt="Cover" fill className="object-cover" unoptimized />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-800/80 to-[#0E121A]">
            <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0E121A] via-black/20 to-transparent" />

        {/* Edit Profile Button */}
        <div className="absolute top-4 right-4">
          <Link
            href="/dashboard/edit-profile"
            className="flex items-center gap-2 px-4 py-2 bg-black/50 backdrop-blur-md border border-white/20 rounded-lg text-white text-xs font-semibold hover:bg-white/10 transition-all"
          >
            <Edit2 size={13} />
            Edit Profile
          </Link>
        </div>
      </div>

      {/* Profile Info Block */}
      <div className="relative px-5 pb-5">
        {/* Avatar — centered on mobile, left on desktop */}
        <div className="flex justify-center md:justify-start">
          <div className="relative -mt-12 md:-mt-12">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-[#0E121A] overflow-hidden bg-zinc-800 shadow-xl">
              <Image
                src={profileImageUrl || '/default-profile-pic.jpg'}
                alt="Profile"
                fill
                className="object-cover rounded-full"
                unoptimized
              />
            </div>
            <Link
              href="/dashboard/edit-profile"
              className="absolute bottom-0 right-0 w-7 h-7 bg-zinc-700 hover:bg-zinc-600 rounded-full flex items-center justify-center border-2 border-[#0E121A] transition-all shadow-lg"
            >
              <Camera size={12} className="text-white" />
            </Link>
          </div>
        </div>

        {/* Name + Badges */}
        <div className="mt-3 flex flex-col items-center md:items-start gap-2">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              {username || 'Your Name'}
            </h1>
            {isPremium && (
              <span className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/15 border border-amber-500/40 rounded-full text-amber-400 text-[10px] font-bold uppercase tracking-widest">
                <Crown size={10} />
                Premium Member
              </span>
            )}
          </div>

          <div className="flex flex-wrap justify-center md:justify-start gap-4 text-xs text-zinc-400">
            {region && (
              <span className="flex items-center gap-1.5">
                <MapPin size={12} className="text-amber-500" />
                {region}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Calendar size={12} className="text-amber-500" />
              Member since {joinDate}
            </span>
          </div>

          {bio && (
            <p className="text-sm text-zinc-400 leading-relaxed max-w-2xl text-center md:text-left line-clamp-2 mt-1">
              {bio}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
