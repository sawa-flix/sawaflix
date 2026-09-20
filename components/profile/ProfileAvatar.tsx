'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Camera } from 'lucide-react';

interface ProfileAvatarProps {
  src: string | null;
  name: string;
  size?: 'sm' | 'md' | 'lg';
  showCamera?: boolean;
}

const SIZE_CLASSES: Record<NonNullable<ProfileAvatarProps['size']>, string> = {
  sm: 'h-9 w-9 text-xs',
  md: 'h-16 w-16 text-lg sm:h-20 sm:w-20 sm:text-2xl',
  lg: 'h-20 w-20 sm:h-28 sm:w-28 md:h-36 md:w-36 text-2xl sm:text-4xl',
};

export function ProfileAvatar({ src, name, size = 'md', showCamera = false }: ProfileAvatarProps) {
  return (
    <div className="relative inline-block">
      <div
        className={`relative shrink-0 overflow-hidden rounded-full border-[3px] sm:border-4 border-[#0E121A] ring-2 ring-white/10 bg-gradient-to-br from-[#1E2330] to-[#0E121A] shadow-2xl flex items-center justify-center ${SIZE_CLASSES[size]}`}
      >
        {src ? (
          <Image src={src} alt={name || 'User'} fill unoptimized className="object-cover" />
        ) : (
          <div className="relative h-full w-full flex items-center justify-center p-2.5 sm:p-4">
            <Image
              src="/logos_and_pwas/android-chrome-192x192.png"
              alt="SawaFlix"
              fill
              unoptimized
              className="object-contain p-2 sm:p-3 drop-shadow-md"
            />
          </div>
        )}
      </div>

      {showCamera && (
        <Link
          href="/dashboard/edit-profile"
          className="absolute bottom-0 right-0 sm:bottom-1 sm:right-1 p-1.5 sm:p-2 rounded-full bg-black/85 hover:bg-black text-white border border-white/20 shadow-xl transition-transform hover:scale-110 active:scale-95 cursor-pointer z-10"
          title="Change profile picture"
          aria-label="Change profile picture"
        >
          <Camera size={13} className="sm:w-3.5 sm:h-3.5" />
        </Link>
      )}
    </div>
  );
}
