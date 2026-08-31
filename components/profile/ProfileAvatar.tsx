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
  sm: 'h-10 w-10 text-sm',
  md: 'h-20 w-20 text-2xl',
  lg: 'h-28 w-28 sm:h-36 sm:w-36 text-4xl',
};

export function ProfileAvatar({ src, name, size = 'md', showCamera = false }: ProfileAvatarProps) {
  return (
    <div className="relative inline-block">
      <div
        className={`relative shrink-0 overflow-hidden rounded-full border-4 border-[#0E121A] ring-2 ring-white/10 bg-[#151C25] shadow-2xl ${SIZE_CLASSES[size]}`}
      >
        {src ? (
          <Image src={src} alt={name} fill unoptimized className="object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center font-black text-white/40 bg-gradient-to-br from-[#1E2330] to-[#0E121A]">
            {name ? name.slice(0, 1).toUpperCase() : 'U'}
          </div>
        )}
      </div>

      {showCamera && (
        <Link
          href="/dashboard/edit-profile"
          className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 p-2 rounded-full bg-black/80 hover:bg-black text-white border border-white/20 shadow-lg transition-transform hover:scale-110 active:scale-95 cursor-pointer z-10"
          title="Change profile picture"
          aria-label="Change profile picture"
        >
          <Camera size={15} />
        </Link>
      )}
    </div>
  );
}
