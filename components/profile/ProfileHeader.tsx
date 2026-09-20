'use client';

import React from 'react';
import Image from 'next/image';
import { UserProfile } from './types';
import { Edit3, Crown } from 'lucide-react';

interface ProfileHeaderProps {
  user: UserProfile;
  onEditClick: () => void;
}

/**
 * ProfileHeader Component
 * Displays user profile with cover image, avatar, name, and edit button
 * Responsive design with mobile and desktop views
 */
function ProfileHeader({
  user,
  onEditClick,
}: ProfileHeaderProps): React.ReactElement {
  return (
    <div className="relative">
      {/* Cover Image */}
      <div className="relative w-full h-32 sm:h-48 md:h-64 bg-linear-to-r from-[#CE1126] to-[#8B0A1E] rounded-none md:rounded-b-2xl overflow-hidden">
        <div className="absolute inset-0">
          {user.coverImage && (
            <Image
              src={user.coverImage}
              alt="Profile cover"
              fill
              className="object-cover"
              priority
            />
          )}
          <div className="w-full h-full bg-linear-to-r from-[#CE1126] via-[#A00D22] to-[#8B0A1E]" />
        </div>
        <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent" />
      </div>

      {/* Profile Info Container */}
      <div className="px-4 sm:px-6 md:px-8 pb-8">
        <div className="max-w-7xl mx-auto flex flex-col items-center sm:flex-row sm:items-end gap-4 sm:gap-6 -mt-12 sm:-mt-16 md:-mt-20 relative z-10">
          {/* Avatar */}
          <div className="shrink-0 relative">
            <div className="relative w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-[#0B0E14] bg-[#0E121A] shadow-2xl">
              {user.avatar && (
                <Image
                  src={user.avatar}
                  alt={user.fullName}
                  fill
                  className="object-cover"
                  priority
                />
              )}
            </div>
            {user.isPremium && (
              <div className="absolute bottom-0 right-0 transform translate-x-1 translate-y-1 bg-[#CE1126] rounded-full p-2 border-2 border-[#0B0E14] shadow-lg">
                <Crown size={14} className="text-white" fill="currentColor" />
              </div>
            )}
          </div>

          {/* User Info */}
          <div className="flex-1 text-center sm:text-left">
            <div className="space-y-1 mb-4">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tighter text-white">
                {user.fullName}
              </h1>
              <p className="text-xs sm:text-sm text-gray-400">
                Member since {user.joinDate}
              </p>
            </div>

            {user.bio && (
              <p className="text-sm text-gray-300 max-w-lg line-clamp-2">
                {user.bio}
              </p>
            )}
          </div>

          {/* Edit Button */}
          <button
            onClick={onEditClick}
            className="shrink-0 px-4 sm:px-6 py-2 sm:py-3 bg-[#CE1126] hover:bg-red-700 text-white rounded-lg font-semibold transition-all active:scale-95 flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-start"
          >
            <Edit3 size={16} />
            <span className="hidden sm:inline">Edit Profile</span>
            <span className="sm:hidden">Edit</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProfileHeader;


