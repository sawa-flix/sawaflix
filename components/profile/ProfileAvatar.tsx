import Image from 'next/image';

interface ProfileAvatarProps {
  src: string | null;
  name: string;
  size?: 'sm' | 'md' | 'lg';
}

const SIZE_CLASSES: Record<NonNullable<ProfileAvatarProps['size']>, string> = {
  sm: 'h-10 w-10 text-sm',
  md: 'h-20 w-20 text-2xl',
  lg: 'h-32 w-32 text-4xl sm:h-40 sm:w-40',
};

/** Shared avatar-with-initial-fallback, extracted out of ProfileHero so it can be reused elsewhere (activity feeds, community posts, etc). */
export function ProfileAvatar({ src, name, size = 'md' }: ProfileAvatarProps) {
  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-full border-4 border-[#0E121A] bg-[#151C25] ${SIZE_CLASSES[size]}`}
    >
      {src ? (
        <Image src={src} alt={name} fill unoptimized className="object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center font-black text-white/20">
          {name.slice(0, 1).toUpperCase()}
        </div>
      )}
    </div>
  );
}
