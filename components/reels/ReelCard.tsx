'use client';

import { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import Image from 'next/image';
import { AnimatePresence } from 'framer-motion';
import type { Video } from '@/types/youtube';
import { YouTubePlayer } from '@/components/YoutubePlayer';
import { useComments } from '@/hooks/useComments';
import { useVideoStats } from '@/hooks/useVideoStats';
import { useScrubGesture } from '@/hooks/reels/useScrubGesture';
import { followYouTubeChannelAction } from '@/app/actions/youtube';
import { followService } from '@/services/followService';
import { ReelOverlay } from './ReelOverlay';
import { ReelActions } from './ReelActions';
import { ReelComments } from './ReelComments';
import { ReelScrubIndicator } from './ReelScrubIndicator';
import { ReelProgressBar } from './ReelProgressBar';
import { ReelControls } from './ReelControls';
import { ReelsBackdrop } from './ReelsBackdrop';
import { useAuthSession } from '@/hooks/useAuthSession';
import { useAuthModal } from '@/contexts/AuthModalContext';
import { videoInteractivityService } from '@/services/videoInteractivityService';
import { patchStatsCache } from '@/hooks/useVideoStats';

interface ReelCardProps {
  video: Video;
  isActive: boolean;
  isPaused: boolean;
  isMuted: boolean;
  isDesktop: boolean;
  desktopOverlayRoot: HTMLDivElement | null;
  /** Whether ReelsFeed has another reel to advance to when this one ends. */
  hasNext: boolean;
  itemRef: (el: HTMLDivElement | null) => (() => void) | void;
  onTogglePlay: () => void;
  /** Advance ReelsFeed to the next reel — called when this video ends and hasNext is true. */
  onEnded: () => void;
  /** Clears ReelsFeed's manual-pause flag once a scrub completes, so playback always resumes on release even if the reel was paused before scrubbing began. */
  onResume: () => void;
}

/**
 * One reel. Exclusivity ("only one plays") needs no manager class — it
 * falls out of ReelsFeed only ever passing isActive=true to the card at its
 * current index; YouTubePlayer already maps isActive/isPaused to real
 * playVideo()/pauseVideo() calls.
 */
export function ReelCard({ video, isActive, isPaused, isMuted, isDesktop, desktopOverlayRoot, hasNext, itemRef, onTogglePlay, onEnded, onResume }: ReelCardProps) {
  const playerRef = useRef<YT.Player | null>(null);
  const nativeVideoRef = useRef<HTMLVideoElement | null>(null);
  const isNative =
    video.origin === 'sawaflix' ||
    (Boolean(video.videoUrl) && !video.videoUrl.includes('youtube.com') && !video.videoUrl.includes('youtu.be')) ||
    (Boolean(video.embedUrl) && !video.embedUrl.includes('youtube.com') && !video.embedUrl.includes('youtu.be')) ||
    (Boolean(video.id) && video.id.length !== 11);

  const adminUrl = process.env.NEXT_PUBLIC_ADMIN_API_URL || process.env.NEXT_PUBLIC_API_URL || 'https://api.sawaflix.com';
  let nativeSrc = video.videoUrl || video.embedUrl || (video.id ? `${adminUrl}/api/admin/upload/stream/${video.id}` : '');
  
  // Fix for videos uploaded locally whose URLs were saved to the DB with localhost:10000 etc.
  if (nativeSrc && (nativeSrc.includes('localhost:') || nativeSrc.includes('127.0.0.1:'))) {
    try {
      const parsed = new URL(nativeSrc);
      nativeSrc = `${adminUrl}${parsed.pathname}${parsed.search}`;
    } catch (e) {
      // Ignore parse errors
    }
  }

  const { user, isAuthenticated } = useAuthSession();
  const { openAuthModal } = useAuthModal();
  const [isFollowing, setIsFollowing] = useState(false);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [, startTransition] = useTransition();
  const { comments, loading: commentsLoading, error: commentsError, isOpen, setIsOpen, addComment, toggleCommentLike } =
    useComments(isActive ? video.id : null);
  const { stats } = useVideoStats(isActive ? video.id : null);

  // A new video id means a fresh player load
  useEffect(() => {
    setIsPlayerReady(false);
  }, [video.id]);

  // Sync native video playback with active/paused state
  useEffect(() => {
    if (!isNative || !nativeVideoRef.current) return;
    const v = nativeVideoRef.current;
    v.setAttribute('fetchpriority', isActive ? 'high' : 'auto');
    if (isActive && !isPaused) {
      v.play().catch(() => {});
    } else {
      v.pause();
    }
  }, [isActive, isPaused, isNative]);

  // Sync native video mute state
  useEffect(() => {
    if (!isNative || !nativeVideoRef.current) return;
    nativeVideoRef.current.muted = isMuted;
  }, [isMuted, isNative]);

  const handlePlayerReady = useCallback((player: YT.Player) => {
    playerRef.current = player;
    setIsPlayerReady(true);
  }, []);

  const getPlayer = useCallback(() => {
    if (isNative && nativeVideoRef.current) {
      const v = nativeVideoRef.current;
      return {
        seekTo: (time: number) => { if (v) v.currentTime = time; },
        getCurrentTime: () => v?.currentTime || 0,
        getDuration: () => v?.duration || 0,
        pauseVideo: () => v?.pause(),
        playVideo: () => { void v?.play().catch(() => {}); },
      } as unknown as YT.Player;
    }
    return playerRef.current;
  }, [isNative]);

  const { isScrubbing, scrubTime, duration, handlers: scrubHandlers } = useScrubGesture({
    getPlayer,
    onTap: onTogglePlay,
    onScrubEnd: onResume,
  });

  const handleEnded = useCallback(() => {
    if (hasNext) {
      onEnded();
    } else {
      playerRef.current?.seekTo(0, true);
      playerRef.current?.playVideo();
    }
  }, [hasNext, onEnded]);

  const handleForward = useCallback(() => {
    const player = getPlayer();
    if (!player) return;
    try {
      const cur = player.getCurrentTime?.() ?? 0;
      const dur = player.getDuration?.() ?? 0;
      const target = dur > 0 ? Math.min(cur + 10, dur) : cur + 10;
      player.seekTo?.(target, true);
    } catch (e) {
      console.warn('[ReelCard] Forward failed:', e);
    }
  }, [getPlayer]);

  const handleNativeEnded = useCallback(() => {
    if (hasNext) {
      onEnded();
    } else {
      if (nativeVideoRef.current) {
        nativeVideoRef.current.currentTime = 0;
        nativeVideoRef.current.play().catch(() => {});
      }
    }
  }, [hasNext, onEnded]);

  const handleToggleFollow = () => {
    if (!isAuthenticated) {
      openAuthModal('to follow creators');
      return;
    }
    const next = !isFollowing;
    setIsFollowing(next);
    startTransition(async () => {
      try {
        await followYouTubeChannelAction(video.channelId);
      } catch (err) {
        console.error('[ReelCard] Follow failed:', err);
        setIsFollowing(!next);
        return;
      }
      try {
        if (next) await followService.follow('youtube_channel', video.channelId);
        else await followService.unfollow('youtube_channel', video.channelId);
      } catch (err) {
        console.warn('[ReelCard] local follow persistence failed:', err);
      }
    });
  };

  const handleSendComment = (text: string, parentId?: string) => {
    if (!isAuthenticated) {
      openAuthModal('to comment on reels');
      return;
    }
    const authorName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'You';
    const authorAvatar = user?.user_metadata?.avatar_url || user?.user_metadata?.picture || '';
    const optimisticComment = {
      id: `local-${Date.now()}`,
      author: authorName,
      authorProfileImage: authorAvatar,
      text,
      likeCount: 0,
      publishedAt: new Date().toISOString(),
      parentId,
    };
    addComment(optimisticComment);

    if (isNative) {
      // Native SawaFlix/Cloudflare video — use our Neon interactivity service
      videoInteractivityService.postComment(video.id, text, parentId).catch((err) =>
        console.error('[ReelCard] Video comment post failed:', err)
      );
    } else {
      // YouTube video — route through the YouTube action (parentId ignored on backend,
      // which is fine since we store it in Neon's VideoComment with the YT videoId)
      import('@/app/actions/youtube').then(({ commentYouTubeVideoAction }) =>
        commentYouTubeVideoAction(video.id, text, video.origin ?? 'youtube').catch((err) =>
          console.error('[ReelCard] Comment post failed:', err)
        )
      );
    }
  };

  return (
    <div
      ref={itemRef}
      className="relative h-full w-full shrink-0 snap-start snap-always overflow-hidden bg-transparent"
    >
      <ReelsBackdrop className="absolute inset-0" />
      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onTogglePlay();
          }
        }}
        aria-label={isPaused ? 'Play' : 'Pause'}
        className="absolute inset-0 z-0 h-full w-full select-none cursor-grab active:cursor-grabbing"
        style={{ touchAction: 'pan-y' }}
        {...scrubHandlers}
      >
        {isNative ? (
          <video
            ref={nativeVideoRef}
            src={nativeSrc}
            poster={video.thumbnail || undefined}
            playsInline
            muted={isMuted}
            preload={isActive ? 'auto' : 'metadata'}
            crossOrigin="anonymous"
            className="w-full h-full object-contain bg-transparent"
            onLoadedData={() => setIsPlayerReady(true)}
            onCanPlay={() => setIsPlayerReady(true)}
            onEnded={handleNativeEnded}
            onError={(e) => {
              const v = e.target as HTMLVideoElement;
              console.warn('[ReelCard] Video load error:', v.error?.message, '| src:', v.currentSrc || nativeSrc);
            }}
          />
        ) : (
          <>
            {isActive && !isPlayerReady && video.thumbnail && (
              <Image
                src={video.thumbnail}
                alt=""
                fill
                unoptimized
                priority
                className="z-10 object-cover"
              />
            )}
            <div className="absolute inset-0">
              <YouTubePlayer
                videoId={video.id}
                isActive={isActive}
                isPaused={isPaused || isScrubbing}
                isMuted={isMuted}
                onPlayerReady={handlePlayerReady}
                onEnded={handleEnded}
              />
            </div>
          </>
        )}
      </div>

      {/* Keep the poster visible and limit buffering feedback to a small spinner. */}
      {isActive && !isPlayerReady && (
        <div className="pointer-events-none absolute inset-x-0 top-1/2 z-20 flex -translate-y-1/2 justify-center">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-white/25 border-t-white/90 shadow-lg" />
        </div>
      )}

      <AnimatePresence>
        {isScrubbing && <ReelScrubIndicator currentTime={scrubTime} duration={duration} />}
      </AnimatePresence>

      <ReelControls
        getPlayer={getPlayer}
        isActive={isActive}
        isPaused={isPaused}
        onTogglePlay={onTogglePlay}
        onBackward={() => {
          const player = getPlayer();
          if (!player) return;
          try {
            player.seekTo(Math.max(0, player.getCurrentTime() - 10), true);
          } catch (e) {
            console.warn('[ReelCard] Rewind failed:', e);
          }
        }}
        onForward={handleForward}
      />

      <ReelProgressBar getPlayer={getPlayer} isActive={isActive} isScrubbing={isScrubbing} />

      <ReelOverlay
        video={video}
        isFollowing={isFollowing}
        isActive={isActive}
        isDesktop={isDesktop}
        portalTarget={desktopOverlayRoot}
        onToggleFollow={handleToggleFollow}
      />

      <ReelActions
        video={video}
        commentsCount={comments.length}
        realLikeCount={stats?.likeCount}
        realIsLiked={stats?.isLiked}
        interactors={stats?.interactors}
        onShowComments={() => setIsOpen(true)}
      />

      <ReelComments
        isOpen={isOpen}
        isDesktop={isDesktop}
        comments={comments}
        loading={commentsLoading}
        error={commentsError}
        onClose={() => setIsOpen(false)}
        onSend={handleSendComment}
        onLikeComment={toggleCommentLike}
      />
    </div>
  );
}
