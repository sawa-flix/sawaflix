import { BadgeCheck, Clapperboard } from 'lucide-react';

interface ProfileBadgesProps {
  verified?: boolean;
  isCreator?: boolean;
}

/** Shared verified/creator badge row — used in both profile heroes. */
export function ProfileBadges({ verified, isCreator }: ProfileBadgesProps) {
  if (!verified && !isCreator) return null;

  return (
    <div className="flex items-center gap-1.5">
      {verified && <BadgeCheck size={20} className="fill-[#E50914] text-[#0E121A]" aria-label="Verified" />}
      {isCreator && (
        <span className="flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-white/70">
          <Clapperboard size={10} />
          Creator
        </span>
      )}
    </div>
  );
}
