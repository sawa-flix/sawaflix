'use client';

import React from 'react';
import Image from 'next/image';
import { Play, Plus, Star } from 'lucide-react';
import { Movie } from './types';

interface MovieHeroBannerProps {
  movie: Movie;
  onWatchNow: () => void;
}

/**
 * MovieHeroBanner Component
 * Featured movie hero banner at the top of the movie page
 * Displays large backdrop with call-to-action buttons
 */
export const MovieHeroBanner: React.FC<MovieHeroBannerProps> = ({ movie, onWatchNow }) => {
  return (
    <div className="relative w-full h-[250px] sm:h-[350px] lg:h-[480px] rounded-xl overflow-hidden bg-[#111] mb-8 shadow-2xl">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={movie.image}
          alt={movie.title}
          fill
          className="object-cover object-top opacity-90"
          priority
          unoptimized
        />
      </div>

      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E14] via-[#0B0E14]/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0B0E14] via-[#0B0E14]/50 to-transparent w-[80%]" />

      {/* Content */}
      <div className="absolute bottom-4 sm:bottom-8 left-4 sm:left-8 right-4 sm:right-8 z-10 flex flex-col items-start justify-end">
        {/* Featured Badge */}
        <span className="inline-block bg-[#CE1126] text-white text-[9px] sm:text-[10px] font-bold px-2 py-1 rounded tracking-widest uppercase mb-2 sm:mb-3 shadow-[0_2px_10px_rgba(206,17,38,0.5)]">
          Featured Title
        </span>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl lg:text-5xl font-black text-white leading-tight tracking-tight mb-1 sm:mb-2 uppercase drop-shadow-md">
          {movie.title}
        </h1>

        {/* Metadata */}
        <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm font-semibold text-gray-300 mb-4 sm:mb-6 drop-shadow flex-wrap">
          <span className="flex items-center gap-1 text-[#FCD116]">
            <Star size={14} fill="currentColor" className="sm:w-[16px] sm:h-[16px]" />
            <span className="text-white">{movie.rating || 4.8}</span>
          </span>
          <span>{movie.year}</span>
          <span>{movie.duration || '2h 25m'}</span>
          <span className="border border-gray-400 px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] uppercase text-gray-300">
            {movie.ageRating || '13+'}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={onWatchNow}
            className="bg-[#CE1126] hover:bg-[#a30d1e] text-white font-bold py-2 sm:py-3 px-4 sm:px-8 rounded-lg flex items-center gap-2 transition-all shadow-lg text-xs sm:text-sm cursor-pointer"
            aria-label={`Play ${movie.title}`}
          >
            <Play size={16} fill="currentColor" className="sm:w-[18px] sm:h-[18px]" /> Play Now
          </button>
          <button
            className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold py-2 sm:py-3 px-4 sm:px-6 rounded-lg flex items-center gap-2 transition-all backdrop-blur-md text-xs sm:text-sm cursor-pointer"
            aria-label={`Add ${movie.title} to watchlist`}
          >
            <Plus size={16} className="sm:w-[18px] sm:h-[18px]" /> Watchlist
          </button>
        </div>
      </div>
    </div>
  );
};

export default MovieHeroBanner;
