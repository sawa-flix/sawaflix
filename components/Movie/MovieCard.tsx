'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Play, Star, CheckCircle2 } from 'lucide-react';
import { MovieCardProps } from './types';
import CircularProgress from '@/components/CircularProgress';

/**
 * MovieCard Component
 * Stunning, modern movie card with smooth interactions
 */
export const MovieCard: React.FC<MovieCardProps> = ({
  movie,
  isPremium,
  onClick,
  isActive,
  isDownloading = false,
  downloadProgress = 0,
  isDownloaded = false,
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(128);

  const toggleLike = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setIsLiked((liked) => {
      setLikesCount((count) => count + (liked ? -1 : 1));
      return !liked;
    });
  };

  return (
    <motion.div
      whileHover={isDownloading ? undefined : { y: -8 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`relative w-full group/card ${
        isDownloading ? 'cursor-wait opacity-80' : 'cursor-pointer'
      } ${
        isActive ? 'ring-2 ring-[color:var(--primary)]/60 ring-offset-2 ring-offset-[color:var(--background)] rounded-2xl' : ''
      }`}
      onClick={isDownloading ? undefined : onClick}
      role="button"
      tabIndex={isDownloading ? -1 : 0}
      aria-label={`Select ${movie.title}`}
      onKeyDown={(e) => {
        if (!isDownloading && (e.key === 'Enter' || e.key === ' ')) {
          onClick();
        }
      }}
    >
      {/* Movie Image Container */}
      <div className={`relative aspect-[3/4] w-full rounded-2xl overflow-hidden mb-3 bg-[color:var(--surface)] shadow-md group-hover/card:shadow-2xl transition-shadow duration-300 border border-[color:var(--border)]/50 ${
        isDownloading ? 'ring-1 ring-[color:var(--primary)]/40' : ''
      }`}>
        <Image
          src={movie.image}
          alt={movie.title}
          fill
          className={`object-cover transition-transform duration-700 ease-out ${
            isDownloading ? 'scale-100 grayscale-[35%]' : 'group-hover/card:scale-110'
          }`}
          unoptimized
          loading="lazy"
        />

        {/* Gradient Overlay - Always visible for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-black/20 opacity-60 group-hover/card:opacity-40 transition-opacity duration-300" />

        {/* Active Downloading Overlay */}
        {isDownloading && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 backdrop-blur-[2px] p-2 text-center">
            <CircularProgress progress={downloadProgress} size={48} strokeWidth={4} showPercent={true} />
            <span className="mt-2 text-[11px] font-bold uppercase tracking-wider text-white drop-shadow">
              Downloading...
            </span>
            <span className="text-[10px] font-medium text-white/80">
              {downloadProgress}%
            </span>
          </div>
        )}

        {/* Play Overlay on Hover */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/card:opacity-100 transition-all duration-300 flex items-center justify-center backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            className="w-16 h-16 rounded-full bg-white/95 flex items-center justify-center shadow-[0_8px_32px_rgba(0,0,0,0.4)] group-hover/card:scale-100 group-hover/card:opacity-100 opacity-0 transition-all duration-300"
          >
            <Play size={24} fill="currentColor" className="text-black ml-1" />
          </motion.div>
        </div>

        {/* Like Button */}
        <div className="absolute bottom-3 right-3 z-10">
          <motion.button
            type="button"
            onClick={toggleLike}
            aria-label={isLiked ? 'Unlike movie' : 'Like movie'}
            aria-pressed={isLiked}
            whileTap={{ scale: 0.85 }}
            whileHover={{ scale: 1.05 }}
            className={`group flex h-9 cursor-pointer items-center gap-1.5 rounded-full px-3 text-xs font-bold shadow-lg backdrop-blur-xl transition-all duration-300 ${
              isLiked
                ? 'bg-gradient-to-br from-pink-500 to-red-500 text-white border-0'
                : 'bg-black/70 text-white border border-white/20 hover:bg-black/80 hover:border-white/40'
            }`}
          >
            <motion.span
              animate={isLiked ? { scale: [1, 1.3, 0.9, 1] } : { scale: 1 }}
              transition={{ duration: 0.4 }}
              className="flex items-center"
            >
              <Image
                src="/logos_and_pwas/like.png"
                alt=""
                width={16}
                height={16}
                className={`h-4 w-4 object-contain transition-all ${
                  isLiked ? 'brightness-0 invert drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]' : 'opacity-90'
                }`}
              />
            </motion.span>
            <span className="font-mono">{likesCount}</span>
          </motion.button>
        </div>

        {/* Premium/Free/Downloaded Badge */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
          {isDownloaded ? (
            <span className="bg-emerald-500/90 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-lg flex items-center gap-1 uppercase tracking-wider">
              <CheckCircle2 size={11} className="text-white" /> Saved
            </span>
          ) : isPremium ? (
            <span className="bg-gradient-to-br from-[#FCD116] to-[#E5B800] text-black text-[10px] font-black px-2.5 py-1.5 rounded-lg shadow-lg flex items-center gap-1 uppercase tracking-wider">
              <Star size={10} fill="currentColor" /> Premium
            </span>
          ) : movie.mediaKind !== 'movie' ? (
            <span className="bg-black/80 backdrop-blur-xl text-white border border-white/20 text-[10px] font-bold px-2.5 py-1.5 rounded-lg shadow-lg uppercase tracking-wider">
              {movie.mediaKind === 'episode' ? `S${movie.seasonNumber || 1} · E${movie.episodeNumber || 1}` : 'Series'}
            </span>
          ) : (
            <span className="bg-gradient-to-br from-[#009639] to-[#007A2E] text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg shadow-lg uppercase tracking-wider">
              Free
            </span>
          )}
        </div>
      </div>

      {/* Movie Info Below Card */}
      <div className="px-1">
        <h3 className="text-sm lg:text-base font-bold text-[color:var(--foreground)] tracking-tight truncate group-hover/card:text-[color:var(--primary)] transition-colors duration-200 mb-1.5">
          {movie.title}
        </h3>
        <div className="flex items-center justify-between text-xs font-semibold text-[color:var(--muted-foreground)]">
          <span className="truncate mr-2">
            {movie.year} • {movie.genres?.[0] || 'N/A'}
          </span>
          <span className="flex items-center gap-1 flex-shrink-0">
            <Star size={12} fill="#FCD116" className="text-[#FCD116]" />
            <span className="text-[color:var(--foreground)] font-mono">{movie.rating || '4.5'}</span>
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default MovieCard;
