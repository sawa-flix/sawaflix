import Image from 'next/image';
import type { ComponentType } from 'react';
import { TrendingUp, Video, Clapperboard, Music2, Sparkles } from 'lucide-react';
import type { MediaGridItem } from '@/types/profile';

interface ProfileHighlightsProps {
  /** Most recently uploaded movie or content — the only real signal available (no view/trending tracking exists). */
  newestUpload?: MediaGridItem | null;
}

interface SlotProps {
  icon: ComponentType<{ size?: number; className?: string }>;
  label: string;
  item?: MediaGridItem | null;
  unavailableReason: string;
}

function Slot({ icon: Icon, label, item, unavailableReason }: SlotProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-white/5 bg-[#0E121A]">
      <div className="flex items-center gap-2 border-b border-white/5 px-4 py-3">
        <Icon size={14} className="text-white/40" />
        <span className="text-[11px] font-bold uppercase tracking-widest text-gray-500">{label}</span>
      </div>
      {item ? (
        <div className="flex items-center gap-3 p-4">
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-white/5">
            {item.thumbnail && <Image src={item.thumbnail} alt={item.title} fill unoptimized className="object-cover" />}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{item.title}</p>
            {item.subtitle && <p className="truncate text-xs text-gray-500">{item.subtitle}</p>}
          </div>
        </div>
      ) : (
        <p className="p-4 text-xs text-gray-500">{unavailableReason}</p>
      )}
    </div>
  );
}

/**
 * "Trending"/"Top"/"Most Viewed" all imply ranking signals (views, engagement)
 * this app doesn't track anywhere — those four slots are honest empty
 * states. Only "Newest Upload" has a real signal: recency.
 */
export function ProfileHighlights({ newestUpload }: ProfileHighlightsProps) {
  return (
    <div className="rounded-2xl border border-white/5 bg-[#0E121A] p-5">
      <h2 className="mb-4 text-sm font-bold text-white">Creator Highlights</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <Slot icon={TrendingUp} label="Trending Content" item={null} unavailableReason="Trending scores aren't tracked yet." />
        <Slot icon={Video} label="Top Reel" item={null} unavailableReason="Reels aren't user-uploaded content on SawaFlix." />
        <Slot icon={Clapperboard} label="Most Viewed Movie" item={null} unavailableReason="View counts aren't tracked yet." />
        <Slot icon={Music2} label="Top Song" item={null} unavailableReason="Play counts aren't tracked yet." />
        <Slot icon={Sparkles} label="Newest Upload" item={newestUpload} unavailableReason="No uploads yet." />
      </div>
    </div>
  );
}
