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
  lg: 'h-28 w-28 sm:h-36 sm:w-36 text-3xl sm:text-5xl',
};

export function ProfileAvatar({ src, name, size = 'md', showCamera = false }: ProfileAvatarProps) {
  const initial = (name || 'U').trim().charAt(0).toUpperCase() || 'U';

  return (
    <div className="relative inline-block">
      <div
        className={`relative shrink-0 overflow-hidden rounded-full border-4 border-[#0E121A] ring-2 ring-white/10 bg-[#151C25] shadow-2xl flex items-center justify-center ${SIZE_CLASSES[size]}`}
      >
        {src ? (
          <Image src={src} alt={name} fill unoptimized className="object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center font-black text-white bg-gradient-to-br from-[#242C3D] via-[#151B26] to-[#0A0D14] select-none">
            <span>{initial}</span>
          </div>
        )}
      </div>

      {showCamera && (
        <Link
          href="/dashboard/edit-profile"
          className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 p-2 rounded-full bg-black/85 hover:bg-black text-white border border-white/20 shadow-xl transition-transform hover:scale-110 active:scale-95 cursor-pointer z-10"
          title="Change profile picture"
          aria-label="Change profile picture"
        >
          <Camera size={15} />
        </Link>
      )}
    </div>
  );
}
