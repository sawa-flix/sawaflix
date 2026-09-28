'use client';

import React from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { Play, Plus, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { Movie } from './types';

interface MovieHeroBannerProps {
  movie: Movie;
  onWatchNow: () => void;
  slideIndex?: number;
  slideCount?: number;
  onPrevious?: () => void;
  onNext?: () => void;
}

/**
 * MovieHeroBanner Component
 * Featured movie hero banner at the top of the movie page
 * Displays large backdrop with call-to-action buttons
 */
export const MovieHeroBanner: React.FC<MovieHeroBannerProps> = ({
  movie,
  onWatchNow,
  slideIndex = 0,
  slideCount = 1,
  onPrevious,
  onNext,
}) => {
  return (
    <div className="group relative isolate mb-8 aspect-[16/10] min-h-[420px] w-full overflow-hidden rounded-xl border border-[color:var(--border)] bg-black shadow-2xl sm:min-h-0 sm:aspect-[2.15/1] lg:aspect-[2.35/1] lg:max-h-[620px]">
      <AnimatePresence mode="sync">
        <motion.div
          key={`cover-${movie.id}`}
          initial={{ opacity: 0, scale: 1.035, x: 20 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          exit={{ opacity: 0, scale: 0.99, x: -18 }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
        >
          <Image
            src={movie.image}
            alt={movie.title}
            fill
            className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.02]"
            priority
            unoptimized
            sizes="100vw"
          />
        </motion.div>
      </AnimatePresence>
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/55 to-black/5" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/10" />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-[0.12] mix-blend-screen"
        style={{ backgroundImage: "url('/logos_and_pwas/sawai.svg')" }}
      />

      {slideCount > 1 && (
        <div className="absolute right-4 top-4 z-20 flex items-center gap-2 sm:right-6 sm:top-6">
          <div className="mr-1 hidden items-center gap-1.5 sm:flex" aria-label={`Slide ${slideIndex + 1} of ${slideCount}`}>
            {Array.from({ length: slideCount }).map((_, index) => (
              <span
                key={index}
                className={`h-1 rounded-full transition-all duration-500 ${index === slideIndex ? 'w-7 bg-white' : 'w-2 bg-white/45'}`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={onPrevious}
            aria-label="Previous featured movie"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/35 bg-black/35 text-white backdrop-blur-md transition-colors hover:bg-black/60"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={onNext}
            aria-label="Next featured movie"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/35 bg-black/35 text-white backdrop-blur-md transition-colors hover:bg-black/60"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      <AnimatePresence mode="wait">
      <motion.div
        key={`details-${movie.id}`}
        initial={{ opacity: 0, x: 24, y: 8 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        exit={{ opacity: 0, x: -18, y: -4 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-0 z-10 flex items-end p-5 sm:p-8 lg:p-12"
      >
        <div className="flex max-w-3xl flex-col items-start justify-end">
        <span className="inline-flex items-center gap-1.5 bg-[color:var(--primary)] text-white text-[9px] sm:text-[10px] font-bold px-2.5 py-1.5 rounded tracking-widest uppercase mb-3">
          <span className="h-1.5 w-1.5 rounded-full bg-white" />
          Cameroon Cinema
        </span>

        <h1 className="max-w-3xl text-3xl sm:text-4xl lg:text-6xl font-black text-white leading-[1.05] mb-3 drop-shadow-lg">
          {movie.title}
        </h1>

        <p className="max-w-2xl text-sm sm:text-base leading-relaxed text-white/85 line-clamp-2 mb-4 drop-shadow">
          {movie.description}
        </p>

        <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm font-semibold text-white/80 mb-5 flex-wrap">
          <span className="flex items-center gap-1.5 text-[#FCD116]">
            <Star size={14} fill="currentColor" className="sm:w-[16px] sm:h-[16px]" />
            <span className="text-white">{movie.rating || 4.8}</span>
          </span>
          <span>{movie.year}</span>
          <span>{movie.genres?.[0] || 'Drama'}</span>
          {movie.duration && <span>{movie.duration}</span>}
          <span className="border border-white/45 px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] uppercase text-white/85">
            {movie.ageRating || '13+'}
          </span>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={onWatchNow}
            className="bg-white hover:bg-white/90 text-black font-bold py-2.5 sm:py-3 px-4 sm:px-7 rounded-lg flex items-center gap-2 transition-all shadow-lg text-xs sm:text-sm cursor-pointer"
            aria-label={`Play ${movie.title}`}
          >
            <Play size={16} fill="currentColor" className="sm:w-[18px] sm:h-[18px]" /> Watch now
          </button>
          <button
            className="bg-white/15 hover:bg-white/25 border border-white/35 text-white font-bold py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg flex items-center gap-2 transition-all backdrop-blur-md text-xs sm:text-sm cursor-pointer"
            aria-label={`Add ${movie.title} to watchlist`}
          >
            <Plus size={16} className="sm:w-[18px] sm:h-[18px]" /> Watchlist
          </button>
        </div>
        </div>
      </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default MovieHeroBanner;
