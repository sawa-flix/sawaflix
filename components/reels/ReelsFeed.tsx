'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { RotateCcw, Film } from 'lucide-react';
import type { Video } from '@/types/youtube';
import { useReels } from '@/hooks/reels/useReels';
import { useActiveReel } from '@/hooks/reels/useActiveReel';
import { useIntersection } from '@/hooks/reels/useIntersection';
import { ReelCard } from './ReelCard';
import { ReelHeader } from './ReelHeader';
import { ReelLoading } from './ReelLoading';

const MUTE_STORAGE_KEY = 'sawaflix_reels_muted';

interface ReelsFeedProps {
  initialVideos: Video[];
  initialHasMore: boolean;
  initialVideoId?: string;
}

export function ReelsFeed({ initialVideos, initialHasMore, initialVideoId }: ReelsFeedProps) {
  const router = useRouter();
  const { videos, loading, error, hasMore, loadMore, retry } = useReels({
    initialVideos,
    initialHasMore,
  });

  const { containerRef, activeIndex, setItemRef } = useActiveReel({ threshold: 0.8 });
  const [sentinelRef, sentinelVisible] = useIntersection<HTMLDivElement>({ threshold: 0.1 });

  const [isMuted, setIsMuted] = useState(true);
  const [manuallyPaused, setManuallyPaused] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);

  // A fresh reel always starts playing — reset any manual pause from the
  // previous card when the active index changes.
  useEffect(() => {
    setManuallyPaused(false);
  }, [activeIndex]);

  // Deep link support (?id=VIDEO_ID): jump straight to that reel on mount.
  // The target card starts out as an inert placeholder (outside the ±1
  // mount window), but it's still observed — scrolling to it lets the
  // IntersectionObserver pick it up as active, which mounts a real
  // ReelCard there on the next render.
  useEffect(() => {
    if (!initialVideoId || videos.length === 0) return;
    const index = videos.findIndex((v) => v.id === initialVideoId);
    const container = containerRef.current;
    if (index <= 0 || !container) return;
    container.scrollTo({ top: index * container.clientHeight, behavior: 'auto' });
    // Deep-link jump only ever needs to run once per mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videos.length]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(MUTE_STORAGE_KEY);
      if (saved !== null) setIsMuted(saved === 'true');
    } catch {
      // localStorage unavailable (privacy mode, etc.) — default mute stands.
    }
  }, []);

  useEffect(() => {
    const checkIsDesktop = () => setIsDesktop(window.innerWidth >= 1024);
    checkIsDesktop();
    window.addEventListener('resize', checkIsDesktop);
    return () => window.removeEventListener('resize', checkIsDesktop);
  }, []);

  // Infinite scroll: fetch the next page once the sentinel near the end
  // of the list scrolls into view.
  useEffect(() => {
    if (sentinelVisible && hasMore && !loading) {
      loadMore();
    }
  }, [sentinelVisible, hasMore, loading, loadMore]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ') {
        e.preventDefault();
        setManuallyPaused((prev) => !prev);
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        toggleMute();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const toggleMute = () => {
    setIsMuted((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(MUTE_STORAGE_KEY, String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  if (loading && videos.length === 0) {
    return <ReelLoading />;
  }

  if (error && videos.length === 0) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-[#0B0E14] px-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
          <Film size={24} className="text-white/40" />
        </div>
        <h2 className="text-lg font-bold text-white">{error}</h2>
        <button
          type="button"
          onClick={retry}
          className="flex items-center gap-2 rounded-full bg-white/10 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-white/20"
        >
          <RotateCcw size={16} />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-[#0B0E14]">
      <ReelHeader isMuted={isMuted} onToggleMute={toggleMute} onBack={() => router.push('/dashboard')} />

      <div
        ref={containerRef}
        className="relative h-full w-full snap-y snap-mandatory overflow-y-scroll scroll-smooth
                   lg:h-[calc(100%-5rem)] lg:w-auto lg:aspect-[9/16] lg:max-h-full
                   lg:rounded-[1.75rem] lg:ring-1 lg:ring-white/10 lg:shadow-[0_25px_80px_-20px_rgba(0,0,0,0.85)]"
        style={{ scrollbarWidth: 'none' }}
      >
        {videos.map((video, index) => {
          const distance = Math.abs(index - activeIndex);
          const isActive = index === activeIndex;

          return (
            <div key={video.id} className="h-full w-full shrink-0 snap-start">
              {distance > 1 ? (
                // Outside the mount window — an inert placeholder keeps
                // scroll-snap geometry correct without a real player.
                <div ref={setItemRef(index)} className="h-full w-full bg-black" />
              ) : (
                <ReelCard
                  video={video}
                  isActive={isActive}
                  isPaused={!isActive || manuallyPaused}
                  isMuted={isMuted}
                  isDesktop={isDesktop}
                  itemRef={setItemRef(index)}
                  onTogglePlay={() => setManuallyPaused((prev) => !prev)}
                />
              )}
            </div>
          );
        })}

        {/* Infinite-scroll trigger, placed a couple cards before the end so
            the next page has time to arrive before the user gets there. */}
        {hasMore && videos.length > 0 && <div ref={sentinelRef} className="h-1 w-full" />}
      </div>
    </div>
  );
}
