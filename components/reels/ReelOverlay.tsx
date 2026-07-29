'use client';

import Image from 'next/image';
import type { Video } from '@/types/youtube';
import { formatCount } from '@/utils/formatCount';
import { extractHashtags, formatRelativeTime, creatorAvatarUrl } from '@/utils/reels/reelHelpers';

interface ReelOverlayProps {
  video: Video;
  isFollowing: boolean;
  onToggleFollow: () => void;
}

/**
 * Bottom-gradient overlay for one reel: creator + follow, caption,
 * hashtags, view count, upload time. Pure presentation — all the data it
 * needs already arrives on the mapped `Video` object.
 */
export function ReelOverlay({ video, isFollowing, onToggleFollow }: ReelOverlayProps) {
  const hashtags = extractHashtags(`${video.title} ${video.description}`);
  const relativeTime = formatRelativeTime(video.publishedAt);

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-4 pb-6 pr-20">
      <div className="pointer-events-auto flex items-center gap-2.5">
        <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full border border-white/20">
          <Image
            src={creatorAvatarUrl(video.channelTitle)}
            alt={video.channelTitle}
            fill
            unoptimized
            className="object-cover"
          />
        </div>
        <span className="truncate text-sm font-bold text-white">{video.channelTitle}</span>
        <button
          type="button"
          onClick={onToggleFollow}
          aria-pressed={isFollowing}
          className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-wide transition-colors ${
            isFollowing
              ? 'bg-white/10 text-white/70'
              : 'bg-white text-black hover:bg-white/90'
          }`}
        >
          {isFollowing ? 'Following' : 'Follow'}
        </button>
      </div>

      <p className="mt-3 line-clamp-2 text-sm text-white/90">{video.title}</p>

      {hashtags.length > 0 && (
        <p className="mt-1 truncate text-sm font-semibold text-white/70">{hashtags.join(' ')}</p>
      )}

      <div className="mt-2 flex items-center gap-2 text-xs font-medium text-white/50">
        {video.viewCount && <span>{formatCount(video.viewCount)} views</span>}
        {video.viewCount && relativeTime && <span aria-hidden="true">•</span>}
        {relativeTime && <span>{relativeTime}</span>}
      </div>
    </div>
  );
}
