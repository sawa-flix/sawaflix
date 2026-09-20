'use client';

import { Film, Heart, MessageCircle, UserPlus, ListMusic, Activity as ActivityIcon } from 'lucide-react';
import type { ActivityItem, ActivityType } from '@/types/profile';
import { formatRelativeTime } from '@/utils/reels/reelHelpers';

interface ProfileActivityProps {
  items: ActivityItem[];
}

const ACTIVITY_META: Record<ActivityType, { icon: typeof Film; verb: string }> = {
  watched_movie: { icon: Film, verb: 'Watched' },
  liked_reel: { icon: Heart, verb: 'Liked a reel from' },
  commented: { icon: MessageCircle, verb: 'Commented on' },
  followed_creator: { icon: UserPlus, verb: 'Followed' },
  created_playlist: { icon: ListMusic, verb: 'Created playlist' },
};

/**
 * Normal-user consumption activity. Nothing populates `items` today — no
 * watch-history, likes-by-me, comments-by-me, follows-by-me, or playlists
 * feature exists anywhere in this app — so this always renders its empty
 * state for now. Kept real (not fabricated) and ready to wire up the
 * moment any of that tracking exists.
 */
export function ProfileActivity({ items }: ProfileActivityProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
          <ActivityIcon size={24} className="text-white/40" />
        </div>
        <div>
          <h3 className="text-base font-bold text-white">No activity yet</h3>
          <p className="mt-1 max-w-xs text-sm text-gray-500">
            Watching, liking, commenting, and following will show up here once activity tracking exists.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ul className="space-y-1">
      {items.map((item) => {
        const meta = ACTIVITY_META[item.type];
        const Icon = meta.icon;
        return (
          <li key={item.id} className="flex items-center gap-3 rounded-xl px-2 py-3 hover:bg-white/5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5">
              <Icon size={16} className="text-white/50" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-gray-300">
                {meta.verb} <span className="font-semibold text-white">{item.title}</span>
              </p>
              <p className="text-xs text-gray-500">{formatRelativeTime(item.createdAt)}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
