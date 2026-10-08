'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Play, Plus, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { Movie } from './types';

interface MovieHeroBannerProps {
  movie: Movie;
  detailsHref: string;
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
  detailsHref,
  slideIndex = 0,
  slideCount = 1,
  onPrevious,
  onNext,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const pointerStartX = useRef<number | null>(null);

  useEffect(() => {
    if (slideCount < 2 || isHovered || !onNext) return;
    const timer = window.setInterval(onNext, 7000);
    return () => window.clearInterval(timer);
  }, [isHovered, onNext, slideCount, slideIndex]);

  return (
    <div
      className="group relative isolate mx-auto mb-6 aspect-[16/9] min-h-[560px] w-full max-w-[1920px] overflow-hidden rounded-[34px] border border-[color:var(--border)] bg-[color:var(--surface)] shadow-2xl sm:min-h-0 sm:aspect-[2.1/1] lg:aspect-[22/9] lg:max-h-[980px]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onPointerDown={(event) => { pointerStartX.current = event.clientX; }}
      onPointerUp={(event) => {
        if (pointerStartX.current === null) return;
        const swipeDistance = event.clientX - pointerStartX.current;
        pointerStartX.current = null;
        if (Math.abs(swipeDistance) < 60) return;
        if (swipeDistance < 0) onNext?.();
        else onPrevious?.();
      }}
      onPointerCancel={() => { pointerStartX.current = null; }}
    >
      <Image
        src={movie.image}
        alt={movie.title}
        fill
        className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center"
        priority
        unoptimized
        sizes="100vw"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/20" />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-[0.10] mix-blend-screen"
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
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-white/35 bg-black/35 text-white backdrop-blur-md transition-colors hover:bg-black/60"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={onNext}
            aria-label="Next featured movie"
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-white/35 bg-black/35 text-white backdrop-blur-md transition-colors hover:bg-black/60"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-28 bg-gradient-to-t from-black/90 to-transparent" />

      <div className="absolute inset-0 z-20 flex items-end p-5 sm:p-8 lg:p-12">
          <div className="flex max-w-3xl flex-col items-start justify-end">
            <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-[color:var(--primary)]/90 px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-[0.22em] text-white shadow-[0_10px_32px_rgba(0,0,0,0.35)] sm:text-[10px]">
              <span className="h-1.5 w-1.5 rounded-full bg-white" />
              {movie.mediaKind === 'episode'
                ? `${movie.seriesTitle || 'Series'} · Season ${movie.seasonNumber || 1}, Episode ${movie.episodeNumber || 1}`
                : movie.mediaKind === 'series' ? 'Cameroon Series' : 'Cameroon Cinema'}
            </span>

            <h1 className="mb-3 max-w-3xl text-xl font-black leading-[1.02] text-white drop-shadow-[0_18px_40px_rgba(0,0,0,0.7)] sm:text-xl lg:text-2xl">
              {movie.title}
            </h1>

            <p className="mb-4 max-w-2xl text-sm leading-relaxed text-white/85 drop-shadow-[0_8px_22px_rgba(0,0,0,0.55)] line-clamp-2 sm:text-base">
              {movie.description}
            </p>

            <div className="mb-5 flex flex-wrap items-center gap-3 text-xs font-semibold text-white/80 sm:gap-4 sm:text-sm">
              <span className="flex items-center gap-1.5 text-[#FCD116]">
                <Star size={14} fill="currentColor" className="sm:h-[16px] sm:w-[16px]" />
                <span className="text-white">{movie.rating || 4.8}</span>
              </span>
              <span>{movie.year}</span>
              <span>{movie.genres?.[0] || 'Drama'}</span>
              {movie.duration && <span>{movie.duration}</span>}
              <span className="rounded border border-white/45 px-1.5 py-0.5 text-[9px] uppercase text-white/85 sm:text-[10px]">
                {movie.ageRating || '13+'}
              </span>
            </div>

            <div className="flex items-center gap-3 sm:gap-4">
              <Link
                href={detailsHref}
                className="flex cursor-pointer items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-black shadow-[0_18px_44px_rgba(255,255,255,0.25)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/90 sm:px-7 sm:py-3 sm:text-sm"
                aria-label={`Play ${movie.title}`}
              >
                <Play size={16} fill="currentColor" className="sm:h-[18px] sm:w-[18px]" /> Watch now
              </Link>
              <button
                type="button"
                className="flex cursor-pointer items-center gap-2 rounded-xl border border-white/35 bg-white/8 px-4 py-2.5 text-xs font-bold text-white backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/15 sm:px-6 sm:py-3 sm:text-sm"
                aria-label={`Add ${movie.title} to watchlist`}
              >
                <Plus size={16} className="sm:h-[18px] sm:w-[18px]" /> Watchlist
              </button>
            </div>
          </div>
      </div>
    </div>
  );
};

export default MovieHeroBanner;
