'use client';

import React from 'react';
import { Play, Pause } from 'lucide-react';
import { MusicCardProps } from './types';

/**
 * MusicCard Component
 * Renders a single music/video card for the grid display
 * Features: hover effects, play overlay, playing indicator
 */
export const MusicCard: React.FC<MusicCardProps> = ({ track, isPlaying, onClick }) => {
  return (
    <div
      className="flex-shrink-0 w-36 sm:w-48 group cursor-pointer snap-start"
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={`Play ${track.title} by ${track.artist}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick();
        }
      }}
    >
      {/* Card Image Container */}
      <div className="relative w-full aspect-square mb-3 rounded-xl overflow-hidden bg-gray-800 shadow-md group-hover:shadow-xl transition-all duration-300">
        <img
          src={track.image}
          alt={track.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Hover / Playing Overlay */}
        <div
          className={`absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center transition-opacity duration-300 ${
            isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}
        >
          <button
            className="bg-orange-500 text-white p-3 sm:p-4 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all"
            aria-label={`${isPlaying ? 'Pause' : 'Play'} ${track.title}`}
          >
            {isPlaying ? (
              <Pause size={24} fill="currentColor" />
            ) : (
              <Play size={24} fill="currentColor" className="ml-1" />
            )}
          </button>
        </div>

        {/* Playing Indicator - Audio Bars */}
        {isPlaying && (
          <div className="absolute bottom-2 right-2 flex gap-0.5 h-3 items-end">
            <div className="w-1 bg-orange-500 h-full animate-pulse"></div>
            <div className="w-1 bg-orange-500 h-2/3 animate-pulse delay-75"></div>
            <div className="w-1 bg-orange-500 h-full animate-pulse delay-150"></div>
          </div>
        )}
      </div>

      {/* Card Metadata */}
      <h4 className="font-semibold text-sm sm:text-base text-gray-100 truncate group-hover:text-orange-400 transition-colors">
        {track.title}
      </h4>
      <p className="text-gray-400 text-xs sm:text-sm truncate mt-0.5">{track.artist}</p>
    </div>
  );
};

export default MusicCard;
