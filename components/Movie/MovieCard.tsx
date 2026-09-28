'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Play, Star, Heart, MessageCircle, Send, X } from 'lucide-react';
import { MovieCardProps } from './types';

/**
 * MovieCard Component
 * Renders a single movie card for the grid display
 * Features: hover effects, play overlay, premium badge, rating display
 */
export const MovieCard: React.FC<MovieCardProps> = ({
  movie,
  isPremium,
  onClick,
  isActive,
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(128);
  const [showComments, setShowComments] = useState(false);
  const [commentDraft, setCommentDraft] = useState('');

  const toggleLike = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setIsLiked((liked) => {
      setLikesCount((count) => count + (liked ? -1 : 1));
      return !liked;
    });
  };

  return (
    <div
      className={`relative w-full group/card cursor-pointer transition-all duration-300 ${
        isActive ? 'scale-[1.02] ring-2 ring-[color:var(--primary)] rounded-xl' : ''
      }`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={`Select ${movie.title}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick();
        }
      }}
    >
      {/* Movie Image Container */}
      <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden mb-3 bg-[color:var(--surface)] shadow-lg group-hover/card:shadow-2xl">
        <Image
          src={movie.image}
          alt={movie.title}
          fill
          className="object-contain sm:object-cover group-hover/card:scale-105 transition-transform duration-500"
          unoptimized
          loading="lazy"
        />

        {/* Play Overlay on Hover */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/card:opacity-100 transition-all duration-300 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full border-2 border-white flex items-center justify-center bg-black/50 backdrop-blur-sm transform scale-90 group-hover/card:scale-100 transition-all">
            <Play size={20} fill="currentColor" className="text-white ml-1" />
          </div>
        </div>

        <div className="absolute bottom-2 right-2 z-10 flex items-center gap-1.5">
          <button
            type="button"
            onClick={toggleLike}
            aria-label={isLiked ? 'Unlike movie' : 'Like movie'}
            aria-pressed={isLiked}
            className="flex h-8 items-center gap-1.5 rounded-full border border-white/20 bg-black/65 px-2.5 text-[11px] font-semibold text-white backdrop-blur-md transition-colors hover:bg-black/80"
          >
            <Heart size={14} className={isLiked ? 'fill-red-500 text-red-500' : ''} />
            {likesCount}
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              setShowComments((visible) => !visible);
            }}
            aria-label={`Show comments for ${movie.title}`}
            aria-expanded={showComments}
            className="flex h-8 items-center gap-1.5 rounded-full border border-white/20 bg-black/65 px-2.5 text-[11px] font-semibold text-white backdrop-blur-md transition-colors hover:bg-black/80"
          >
            <MessageCircle size={14} /> 24
          </button>
        </div>

        {/* Premium/Free Badge */}
        <div className="absolute top-2 left-2 z-10">
          {isPremium ? (
            <span className="bg-[#111]/90 backdrop-blur-md text-[#FCD116] border border-[#FCD116]/30 text-[10px] font-bold px-2 py-1 rounded shadow-lg flex items-center gap-1 uppercase tracking-wider">
              <Star size={10} fill="currentColor" /> Premium
            </span>
          ) : (
            <span className="bg-[#009639]/90 backdrop-blur-md text-white border border-[#009639]/30 text-[10px] font-bold px-2 py-1 rounded shadow-lg uppercase tracking-wider">
              Free
            </span>
          )}
        </div>
      </div>

      {/* Movie Info Below Card */}
      <div className="px-1">
        <h3 className="text-sm lg:text-base font-bold text-[color:var(--foreground)] tracking-tight truncate group-hover/card:text-[color:var(--primary)] transition-colors mb-1">
          {movie.title}
        </h3>
        <div className="flex items-center justify-between text-xs font-semibold text-[color:var(--muted-foreground)]">
          <span>
            {movie.year} • {movie.genres?.[0] || 'N/A'}
          </span>
          <span className="flex items-center gap-1 text-[#FCD116]">
            <Star size={12} fill="currentColor" />
            <span className="text-[color:var(--foreground)]">{movie.rating || '4.5'}</span>
          </span>
        </div>
      </div>

      {showComments && (
        <div
          role="dialog"
          aria-label={`Comments for ${movie.title}`}
          onClick={(event) => event.stopPropagation()}
          className="absolute bottom-16 left-2 right-2 z-30 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-elevated)] p-3 shadow-2xl"
        >
          <div className="mb-3 flex items-center justify-between gap-2">
            <div>
              <p className="text-xs font-bold text-[color:var(--foreground)]">Movie discussion</p>
              <p className="text-[10px] text-[color:var(--muted-foreground)]">24 comments</p>
            </div>
            <button
              type="button"
              onClick={() => setShowComments(false)}
              className="flex h-7 w-7 items-center justify-center rounded-full text-[color:var(--muted-foreground)] hover:bg-[color:var(--surface-hover)] hover:text-[color:var(--foreground)]"
              aria-label="Close comments"
            >
              <X size={14} />
            </button>
          </div>
          <div className="space-y-2 border-y border-[color:var(--border)] py-2">
            <p className="text-[11px] leading-relaxed text-[color:var(--foreground-secondary)]"><strong className="text-[color:var(--foreground)]">Nadia:</strong> A beautiful story. The cast was excellent.</p>
            <p className="text-[11px] leading-relaxed text-[color:var(--foreground-secondary)]"><strong className="text-[color:var(--foreground)]">Kevin:</strong> More Cameroon cinema like this, please.</p>
          </div>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              setCommentDraft('');
            }}
            className="mt-2 flex items-center gap-2"
          >
            <input
              value={commentDraft}
              onChange={(event) => setCommentDraft(event.target.value)}
              placeholder="Add a comment"
              className="min-w-0 flex-1 bg-transparent text-[11px] text-[color:var(--foreground)] outline-none placeholder:text-[color:var(--muted-foreground)]"
              aria-label="Add a comment"
            />
            <button type="submit" aria-label="Post comment" className="text-[color:var(--primary)] disabled:opacity-40" disabled={!commentDraft.trim()}>
              <Send size={14} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default MovieCard;
