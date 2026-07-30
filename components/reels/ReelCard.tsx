'use client';

import { useCallback, useRef, useState, useTransition } from 'react';
import { AnimatePresence } from 'framer-motion';
import type { Video } from '@/types/youtube';
import { YouTubePlayer } from '@/components/YoutubePlayer';
import { useComments } from '@/hooks/useComments';
import { useScrubGesture } from '@/hooks/reels/useScrubGesture';
import { followYouTubeChannelAction } from '@/app/actions/youtube';
import { ReelOverlay } from './ReelOverlay';
import { ReelActions } from './ReelActions';
import { ReelComments } from './ReelComments';
import { ReelScrubIndicator } from './ReelScrubIndicator';

interface ReelCardProps {
  video: Video;
  isActive: boolean;
  isPaused: boolean;
  isMuted: boolean;
  isDesktop: boolean;
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
export function ReelCard({ video, isActive, isPaused, isMuted, isDesktop, hasNext, itemRef, onTogglePlay, onEnded, onResume }: ReelCardProps) {
  const playerRef = useRef<YT.Player | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [, startTransition] = useTransition();
  const { comments, loading: commentsLoading, error: commentsError, isOpen, setIsOpen, addComment } =
    useComments(video.id);

  const handlePlayerReady = useCallback((player: YT.Player) => {
    playerRef.current = player;
  }, []);

  const getPlayer = useCallback(() => playerRef.current, []);

  const { isScrubbing, scrubTime, duration, handlers: scrubHandlers } = useScrubGesture({
    getPlayer,
    onTap: onTogglePlay,
    onScrubEnd: onResume,
  });

  // TikTok-style auto-advance: a finished reel moves on to the next one
  // instead of looping. Only loops itself as a fallback when there's
  // genuinely nothing next to advance to (end of the loaded feed).
  const handleEnded = useCallback(() => {
    if (hasNext) {
      onEnded();
    } else {
      playerRef.current?.seekTo(0, true);
      playerRef.current?.playVideo();
    }
  }, [hasNext, onEnded]);

  const handleToggleFollow = () => {
    const next = !isFollowing;
    setIsFollowing(next);
    startTransition(async () => {
      try {
        await followYouTubeChannelAction(video.channelId);
      } catch (err) {
        console.error('[ReelCard] Follow failed:', err);
        setIsFollowing(!next);
      }
    });
  };

  const handleSendComment = (text: string) => {
    addComment({
      id: `local-${Date.now()}`,
      author: 'You',
      authorProfileImage: '',
      text,
      likeCount: 0,
      publishedAt: new Date().toISOString(),
    });
    // Fire-and-forget: existing server action persists it server-side; the
    // optimistic local entry above is what the user sees immediately.
    import('@/app/actions/youtube').then(({ commentYouTubeVideoAction }) =>
      commentYouTubeVideoAction(video.id, text, video.origin ?? 'youtube').catch((err) =>
        console.error('[ReelCard] Comment post failed:', err)
      )
    );
  };

  return (
    <div
      ref={itemRef}
      className="relative h-full w-full shrink-0 snap-start snap-always overflow-hidden bg-black"
    >
      {/* Tap-to-pause / press-and-hold-to-scrub target — scoped to the
          player itself so taps on the overlay/actions/comments (siblings
          below, higher z-index) don't also toggle playback. A plain div
          (not <button>) because it wraps the YouTube iframe, which is
          itself focusable/interactive — nesting that inside a real
          <button> would be invalid.
          touchAction: 'pan-y' is what keeps this gesture from ever
          fighting vertical swipe navigation: it tells the browser to keep
          handling vertical drags as native scroll (they never reach the
          scrub gesture at all), while leaving horizontal movement free
          for useScrubGesture to interpret via Pointer Events. */}
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
        <YouTubePlayer
          videoId={video.id}
          isActive={isActive}
          isPaused={isPaused || isScrubbing}
          isMuted={isMuted}
          onPlayerReady={handlePlayerReady}
          onEnded={handleEnded}
        />
      </div>

      <AnimatePresence>
        {isScrubbing && <ReelScrubIndicator currentTime={scrubTime} duration={duration} />}
      </AnimatePresence>

      <ReelOverlay video={video} isFollowing={isFollowing} onToggleFollow={handleToggleFollow} />

      <ReelActions
        video={video}
        commentsCount={comments.length}
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
      />
    </div>
  );
}
