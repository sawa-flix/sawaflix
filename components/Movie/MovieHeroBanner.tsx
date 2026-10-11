'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Play, ChevronLeft, ChevronRight } from 'lucide-react';
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
 * Clean, rectangular hero banner with minimal text - just movie title
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
      className="group relative isolate mx-auto mb-8 w-full max-w-[1800px] overflow-hidden rounded-3xl border border-[color:var(--border)]/50 bg-[color:var(--surface)] shadow-[0_20px_60px_rgba(0,0,0,0.3)] transition-all duration-500 hover:shadow-[0_25px_70px_rgba(0,0,0,0.4)] aspect-[21/9] min-h-[280px] sm:min-h-0 sm:aspect-[21/9]"
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
      {/* Background Image */}
      <Image
        src={movie.image}
        alt={movie.title}
        fill
        className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-[1.02]"
        priority
        unoptimized
        sizes="100vw"
      />

      {/* Smooth Gradient Overlays */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/95 via-black/60 to-transparent" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/50" />

      {/* Subtle Texture Overlay */}
      <div className="pointer-events-none absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JhaW4iIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzAwMCIvPjxyZWN0IHg9IjAiIHk9IjAiIHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmFpbikiLz48L3N2Zz4=')] opacity-20 mix-blend-overlay" />

      {/* Navigation Controls - Only show if multiple slides */}
      {slideCount > 1 && (
        <div className="absolute right-6 top-6 z-20 flex items-center gap-3">
          {/* Slide Indicators */}
          <div className="hidden items-center gap-2 sm:flex" aria-label={`Slide ${slideIndex + 1} of ${slideCount}`}>
            {Array.from({ length: slideCount }).map((_, index) => (
              <span
                key={index}
                className={`h-1 rounded-full transition-all duration-500 ${
                  index === slideIndex
                    ? 'w-8 bg-white shadow-[0_0_12px_rgba(255,255,255,0.5)]'
                    : 'w-1.5 bg-white/40 hover:bg-white/60'
                }`}
              />
            ))}
          </div>

          {/* Navigation Buttons */}
          <button
            type="button"
            onClick={onPrevious}
            aria-label="Previous featured movie"
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-xl transition-all duration-300 hover:scale-110 hover:border-white/40 hover:bg-black/60 hover:shadow-[0_8px_24px_rgba(0,0,0,0.4)]"
          >
            <ChevronLeft size={20} strokeWidth={2.5} />
          </button>
          <button
            type="button"
            onClick={onNext}
            aria-label="Next featured movie"
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-xl transition-all duration-300 hover:scale-110 hover:border-white/40 hover:bg-black/60 hover:shadow-[0_8px_24px_rgba(0,0,0,0.4)]"
          >
            <ChevronRight size={20} strokeWidth={2.5} />
          </button>
        </div>
      )}

      {/* Content - Minimal & Clean */}
      <div className="absolute inset-0 z-10 flex items-center px-6 sm:px-12 lg:px-16">
        <div className="flex max-w-4xl flex-col items-start">
          {/* Movie Title - Hero */}
          <h1 className="mb-4 text-2xl font-black leading-[0.95] tracking-tight text-white drop-shadow-[0_8px_32px_rgba(0,0,0,0.9)] sm:text-4xl sm:mb-6 lg:text-6xl xl:text-7xl">
            {movie.title}
          </h1>

          {/* Action Button - Clean & Minimal */}
          <Link
            href={detailsHref}
            className="group/btn flex cursor-pointer items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs font-bold text-black shadow-[0_16px_48px_rgba(255,255,255,0.25)] transition-all duration-300 hover:scale-[1.02] hover:bg-white/95 hover:shadow-[0_20px_60px_rgba(255,255,255,0.35)] active:scale-[0.98] sm:gap-3 sm:rounded-2xl sm:px-8 sm:py-4 sm:text-base"
            aria-label={`Watch ${movie.title}`}
          >
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-black/10 transition-transform duration-300 group-hover/btn:scale-110 sm:h-6 sm:w-6">
              <Play size={12} fill="currentColor" strokeWidth={0} className="sm:w-[14px] sm:h-[14px]" />
            </div>
            <span className="tracking-wide">Watch Now</span>
          </Link>
        </div>
      </div>

      {/* Bottom Fade for Smooth Transition */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] h-24 bg-gradient-to-t from-[color:var(--background)] to-transparent" />
    </div>
  );
};

export default MovieHeroBanner;
