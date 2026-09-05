'use client';

import React from 'react';
import Image from 'next/image';
import { Play, Star } from 'lucide-react';
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
  return (
    <div
      className={`relative w-full group/card cursor-pointer transition-all duration-300 ${
        isActive ? 'scale-[1.02] ring-2 ring-white/50 rounded-xl' : ''
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
      <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden mb-3 bg-[#111] shadow-lg group-hover/card:shadow-2xl">
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
        <h3 className="text-sm lg:text-base font-bold text-white tracking-tight truncate group-hover/card:text-gray-300 transition-colors mb-1">
          {movie.title}
        </h3>
        <div className="flex items-center justify-between text-xs font-semibold text-gray-400">
          <span>
            {movie.year} • {movie.genres?.[0] || 'N/A'}
          </span>
          <span className="flex items-center gap-1 text-[#FCD116]">
            <Star size={12} fill="currentColor" />
            <span className="text-white">{movie.rating || '4.5'}</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
