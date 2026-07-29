'use client';

import { useCallback, useRef, useState, useTransition } from 'react';
import type { Video } from '@/types/youtube';
import { YouTubePlayer } from '@/components/YoutubePlayer';
import { useComments } from '@/hooks/useComments';
import { followYouTubeChannelAction } from '@/app/actions/youtube';
import { ReelOverlay } from './ReelOverlay';
import { ReelActions } from './ReelActions';
import { ReelComments } from './ReelComments';

interface ReelCardProps {
  video: Video;
  isActive: boolean;
  isPaused: boolean;
  isMuted: boolean;
  isDesktop: boolean;
  itemRef: (el: HTMLDivElement | null) => (() => void) | void;
  onTogglePlay: () => void;
}

/**
 * One reel. Exclusivity ("only one plays") needs no manager class — it
 * falls out of ReelsFeed only ever passing isActive=true to the card at its
 * current index; YouTubePlayer already maps isActive/isPaused to real
 * playVideo()/pauseVideo() calls.
 */
export function ReelCard({ video, isActive, isPaused, isMuted, isDesktop, itemRef, onTogglePlay }: ReelCardProps) {
  const playerRef = useRef<YT.Player | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [, startTransition] = useTransition();
  const { comments, loading: commentsLoading, error: commentsError, isOpen, setIsOpen, addComment } =
    useComments(video.id);

  const handlePlayerReady = useCallback((player: YT.Player) => {
    playerRef.current = player;
  }, []);

  const handleEnded = useCallback(() => {
    playerRef.current?.seekTo(0, true);
    playerRef.current?.playVideo();
  }, []);

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
      {/* Tap-to-pause target — scoped to the player itself so taps on the
          overlay/actions/comments (siblings below, higher z-index) don't
          also toggle playback. A plain div (not <button>) because it wraps
          the YouTube iframe, which is itself focusable/interactive —
          nesting that inside a real <button> would be invalid. */}
      <div
        role="button"
        tabIndex={0}
        onClick={onTogglePlay}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onTogglePlay();
          }
        }}
        aria-label={isPaused ? 'Play' : 'Pause'}
        className="absolute inset-0 z-0 h-full w-full"
      >
        <YouTubePlayer
          videoId={video.id}
          isActive={isActive}
          isPaused={isPaused}
          isMuted={isMuted}
          onPlayerReady={handlePlayerReady}
          onEnded={handleEnded}
        />
      </div>

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
