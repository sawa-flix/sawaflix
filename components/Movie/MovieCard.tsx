'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
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
  const [isPreviewing, setIsPreviewing] = useState(false);

  return (
    <motion.div
      whileHover={isDownloading ? undefined : { scale: 1.24, y: -6, zIndex: 40 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      onHoverStart={() => { if (!isDownloading) setIsPreviewing(true); }}
      onHoverEnd={() => setIsPreviewing(false)}
      onFocus={() => { if (!isDownloading) setIsPreviewing(true); }}
      onBlur={() => setIsPreviewing(false)}
      className={`relative z-0 w-full origin-center group/card ${
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
          className="object-cover transition-opacity duration-200"
          unoptimized
          loading="lazy"
        />

        {isPreviewing && !isDownloading && (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(movie.id)}?autoplay=1&mute=1&controls=0&rel=0&playsinline=1&modestbranding=1`}
            title={`Silent preview: ${movie.title}`}
            className="pointer-events-none absolute inset-0 h-full w-full border-0"
            allow="autoplay; encrypted-media; picture-in-picture"
            tabIndex={-1}
            aria-hidden="true"
          />
        )}

        <div className={`pointer-events-none absolute inset-0 bg-gradient-to-t from-black/95 via-black/15 to-transparent transition-opacity duration-200 ${isPreviewing ? 'opacity-100' : 'opacity-0'}`} />

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

        {isPreviewing && !isDownloading && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 p-3 text-white sm:p-4">
            <h3 className="line-clamp-2 text-sm font-bold leading-tight drop-shadow-lg">{movie.episodeTitle || movie.title}</h3>
            <p className="mt-1 line-clamp-2 text-[10px] leading-relaxed text-white/80">{movie.description || `${movie.year} · ${movie.genres?.slice(0, 2).join(' · ')}`}</p>
            <div className="mt-2 flex items-center gap-2 text-[9px] font-semibold text-white/75">
              {movie.duration && <span>{movie.duration}</span>}
              {movie.ageRating && <span>{movie.ageRating}</span>}
              {isPremium && <span>Premium</span>}
              {isDownloaded && <span>Downloaded</span>}
              <Play size={12} fill="currentColor" className="ml-auto" />
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default MovieCard;
