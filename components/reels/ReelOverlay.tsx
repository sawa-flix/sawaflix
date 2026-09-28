'use client';

import Image from 'next/image';
import { createPortal } from 'react-dom';
import type { Video } from '@/types/youtube';
import { formatCount } from '@/utils/formatCount';
import { extractHashtags, formatRelativeTime, creatorAvatarUrl } from '@/utils/reels/reelHelpers';

interface ReelOverlayProps {
  video: Video;
  isFollowing: boolean;
  isActive: boolean;
  isDesktop: boolean;
  portalTarget: HTMLElement | null;
  onToggleFollow: () => void;
}

/**
 * Bottom-gradient overlay for one reel: creator + follow, caption,
 * hashtags, view count, upload time. Pure presentation — all the data it
 * needs already arrives on the mapped `Video` object.
 */
export function ReelOverlay({ video, isFollowing, isActive, isDesktop, portalTarget, onToggleFollow }: ReelOverlayProps) {
  const hashtags = extractHashtags(`${video.title} ${video.description}`);
  const relativeTime = formatRelativeTime(video.publishedAt);

  const isSawaflix =
    video.origin === 'sawaflix' ||
    (video.channelTitle || '').toLowerCase().includes('sawaflix') ||
    video.channelId === 'sawaflix' ||
    video.channelId === 'sawaflix_admin';

  const channelName = isSawaflix ? 'SawaFlix' : (video.channelTitle || 'YouTube Channel');
  const avatarUrl = isSawaflix
    ? '/logos_and_pwas/android-chrome-192x192.png'
    : (video as any).channelAvatar || creatorAvatarUrl(video.channelTitle, video.origin);

  const overlayContent = (
    <div className={`pointer-events-none z-20 ${isDesktop ? 'w-full' : 'absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-4 pb-6 pr-20'}`}>
      <div className="pointer-events-auto">
      <div className="flex items-center gap-2.5">
        <div className={`relative h-9 w-9 shrink-0 overflow-hidden rounded-full border shadow-md ${isDesktop ? 'border-[color:var(--border)] bg-[color:var(--surface)]' : 'border-white/20 bg-black/60'}`}>
          <Image
            src={avatarUrl}
            alt={channelName}
            fill
            unoptimized
            className="object-contain p-0.5"
          />
        </div>
        <span className={`flex items-center gap-1.5 truncate text-sm font-bold ${isDesktop ? 'text-[color:var(--foreground)]' : 'text-white'}`}>
          {channelName}
          {isSawaflix && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#E50914] shadow-[0_0_6px_rgba(229,9,20,0.8)]" title="Official SawaFlix" />
          )}
        </span>
        <button
          type="button"
          onClick={onToggleFollow}
          aria-pressed={isFollowing}
          className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-wide transition-colors cursor-pointer active:scale-95 ${
            isDesktop
              ? 'border border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--foreground)] hover:bg-[color:var(--surface-hover)]'
              : isFollowing
                ? 'bg-white/10 text-white/70'
                : 'bg-white text-black hover:bg-white/90'
          }`}
        >
          {isFollowing ? 'Following' : 'Follow'}
        </button>
      </div>

      <p className={`mt-3 line-clamp-2 text-sm ${isDesktop ? 'text-[color:var(--foreground)]' : 'text-white/90'}`}>{video.title}</p>

      {hashtags.length > 0 && (
        <p className={`mt-1 truncate text-sm font-semibold ${isDesktop ? 'text-[color:var(--muted-foreground)]' : 'text-white/70'}`}>{hashtags.join(' ')}</p>
      )}

      <div className={`mt-2 flex items-center gap-2 text-xs font-medium ${isDesktop ? 'text-[color:var(--muted-foreground)]' : 'text-white/50'}`}>
        {video.viewCount && <span>{formatCount(video.viewCount)} views</span>}
        {video.viewCount && relativeTime && <span aria-hidden="true">•</span>}
        {relativeTime && <span>{relativeTime}</span>}
      </div>
    </div>
    </div>
  );

  if (!isDesktop) return overlayContent;
  if (!isActive || !portalTarget) return null;
  return createPortal(overlayContent, portalTarget);
}
