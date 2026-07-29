'use client';

import { useState, useTransition } from 'react';
import { Heart, MessageCircle, MoreHorizontal, Share2, Bookmark } from 'lucide-react';
import type { Video } from '@/types/youtube';
import { likeYouTubeVideoAction } from '@/app/actions/youtube';
import { formatCount } from '@/utils/formatCount';
import { useFavorites } from '@/contexts/FavoriteContext';

interface ReelActionsProps {
  video: Video;
  commentsCount: number;
  onShowComments: () => void;
}

function parseCount(value: string | number | undefined): number {
  if (value === undefined) return 0;
  const n = typeof value === 'number' ? value : parseInt(value, 10);
  return Number.isNaN(n) ? 0 : n;
}

/**
 * Right-side action rail: like, comment, and a "More" menu (share, save).
 * Like/comment/share/save all call the existing server actions and
 * favorites context — nothing here reimplements backend logic.
 */
export function ReelActions({ video, commentsCount, onShowComments }: ReelActionsProps) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(() => parseCount(video.likeCount));
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [, startTransition] = useTransition();
  const { isFavorite, toggleFavorite } = useFavorites();

  const saved = isFavorite(video.id);

  const handleLike = () => {
    const nextLiked = !liked;
    // Optimistic update — rolled back if the server action throws.
    setLiked(nextLiked);
    setLikeCount((prev) => prev + (nextLiked ? 1 : -1));

    startTransition(async () => {
      try {
        await likeYouTubeVideoAction(video.id, video.origin ?? 'youtube');
      } catch (err) {
        console.error('[ReelActions] Like failed:', err);
        setLiked(!nextLiked);
        setLikeCount((prev) => prev + (nextLiked ? -1 : 1));
      }
    });
  };

  const handleShare = async () => {
    setIsMoreOpen(false);
    const url = video.videoUrl;
    try {
      if (navigator.share) {
        await navigator.share({ title: video.title, url });
      } else {
        await navigator.clipboard.writeText(url);
      }
    } catch (err) {
      // User cancelling the native share sheet also rejects — not an error.
      if ((err as Error)?.name !== 'AbortError') {
        console.error('[ReelActions] Share failed:', err);
      }
    }
  };

  const handleSave = () => {
    toggleFavorite(video);
    setIsMoreOpen(false);
  };

  return (
    <div className="pointer-events-auto absolute bottom-10 right-3 z-20 flex flex-col items-center gap-5">
      <button
        type="button"
        onClick={handleLike}
        aria-label={liked ? 'Unlike' : 'Like'}
        aria-pressed={liked}
        className="flex flex-col items-center gap-1 text-white"
      >
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-black/30 backdrop-blur-md transition-transform active:scale-90">
          <Heart size={24} className={liked ? 'fill-red-600 text-red-600' : 'text-white'} />
        </span>
        <span className="text-xs font-bold drop-shadow">{formatCount(likeCount)}</span>
      </button>

      <button
        type="button"
        onClick={onShowComments}
        aria-label="View comments"
        className="flex flex-col items-center gap-1 text-white"
      >
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-black/30 backdrop-blur-md transition-transform active:scale-90">
          <MessageCircle size={24} />
        </span>
        <span className="text-xs font-bold drop-shadow">{formatCount(commentsCount)}</span>
      </button>

      <div className="relative">
        <button
          type="button"
          onClick={() => setIsMoreOpen((prev) => !prev)}
          aria-label="More options"
          aria-haspopup="menu"
          aria-expanded={isMoreOpen}
          className="flex flex-col items-center gap-1 text-white"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-black/30 backdrop-blur-md transition-transform active:scale-90">
            <MoreHorizontal size={24} />
          </span>
        </button>

        {isMoreOpen && (
          <>
            {/* Backdrop — closes the menu on any outside tap. */}
            <div className="fixed inset-0 z-10" onClick={() => setIsMoreOpen(false)} aria-hidden="true" />

            <div
              role="menu"
              className="absolute bottom-full right-0 z-20 mb-3 w-44 overflow-hidden rounded-2xl border border-white/10 bg-[#181A20] shadow-2xl"
            >
              <button
                type="button"
                role="menuitem"
                onClick={handleShare}
                className="flex w-full items-center gap-3 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                <Share2 size={18} />
                Share
              </button>
              <button
                type="button"
                role="menuitemcheckbox"
                onClick={handleSave}
                aria-checked={saved}
                className="flex w-full items-center gap-3 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                <Bookmark size={18} className={saved ? 'fill-white' : ''} />
                {saved ? 'Saved' : 'Save'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
