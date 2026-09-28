'use client';

import React from 'react';
import Image from 'next/image';
import { Play, Star, X, Globe, Users, Calendar, Volume2 } from 'lucide-react';
import { MovieDetailSheetProps } from './types';

/**
 * MovieDetailSheet Component
 * Mobile-only bottom sheet for displaying movie details
 * Features: full-screen mobile view, swipe-down to close
 */
export const MovieDetailSheet: React.FC<MovieDetailSheetProps> = ({
  movie,
  onClose,
  onWatchNow,
}) => {
  return (
    <div className="fixed inset-0 z-50 xl:hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        role="button"
        tabIndex={0}
        aria-label="Close details"
      />

      {/* Bottom Sheet */}
      <div className="absolute bottom-0 left-0 right-0 max-h-[90vh] flex flex-col bg-[color:var(--surface)] border-t border-[color:var(--border)] rounded-t-3xl overflow-hidden shadow-2xl">
        {/* Drag Handle */}
        <div className="flex justify-center pt-3 pb-2 shrink-0">
          <div className="w-12 h-1 bg-[color:var(--muted-foreground)]/30 rounded-full" />
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-[color:var(--background)]/70 hover:bg-[color:var(--background)] text-[color:var(--foreground)] p-2 rounded-full transition-colors cursor-pointer border border-[color:var(--border)]"
          aria-label="Close details"
        >
          <X size={20} />
        </button>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 w-full">
          <div className="px-4 pb-6">
            {/* Movie Image */}
            <div className="relative w-full h-48 sm:h-56 rounded-2xl overflow-hidden mb-6 shadow-2xl shrink-0">
              <Image
                src={movie.image}
                alt={movie.title}
                fill
                className="object-cover"
                unoptimized
              />
              {/* Play Button */}
              <button
                onClick={() => onWatchNow(movie)}
                className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/50 transition-colors group cursor-pointer"
              >
                <div className="bg-[#CE1126] hover:scale-110 text-white rounded-full p-4 shadow-2xl transition-transform">
                  <Play size={28} fill="currentColor" className="ml-1" />
                </div>
              </button>
            </div>

            {/* Title and Rating */}
            <h2 className="text-2xl lg:text-3xl font-bold text-[color:var(--foreground)] mb-2">{movie.title}</h2>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-1 bg-[#FCD116]/20 text-[#FCD116] px-3 py-1 rounded-full">
                <Star size={16} fill="currentColor" />
                <span className="font-bold">{movie.rating || 4.5}</span>
              </div>
              <span className="text-[color:var(--muted-foreground)]">•</span>
              <span className="text-[color:var(--muted-foreground)]">{movie.year}</span>
              <span className="text-[color:var(--muted-foreground)]">•</span>
              <span className="bg-[color:var(--surface-hover)] border border-[color:var(--border)] text-[color:var(--foreground)] px-2 py-0.5 rounded text-xs font-semibold">
                {movie.ageRating || '13+'}
              </span>
            </div>

            {/* Description */}
            <p className="text-[color:var(--foreground-secondary)] text-sm mb-6 leading-relaxed">{movie.description}</p>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b border-[color:var(--border)]">
              {movie.year && (
                <DetailCell icon={<Calendar size={18} />} label="Year" value={movie.year.toString()} />
              )}
              {movie.duration && (
                <DetailCell icon={<Volume2 size={18} />} label="Duration" value={movie.duration} />
              )}
              {movie.country && (
                <DetailCell icon={<Globe size={18} />} label="Country" value={movie.country} />
              )}
              {movie.ageRating && (
                <DetailCell icon={<Users size={18} />} label="Rating" value={movie.ageRating} />
              )}
            </div>

            {/* Additional Details */}
            {(movie.director || movie.writer || movie.language) && (
              <div className="space-y-3 mb-2 pb-2">
                {movie.director && (
                  <div>
                    <p className="text-xs text-[color:var(--muted-foreground)] font-semibold mb-1">DIRECTOR</p>
                    <p className="text-sm text-[color:var(--foreground)]">{movie.director}</p>
                  </div>
                )}
                {movie.writer && (
                  <div>
                    <p className="text-xs text-gray-400 font-semibold mb-1">WRITER</p>
                    <p className="text-sm text-white">{movie.writer}</p>
                  </div>
                )}
                {movie.stars && (
                  <div>
                    <p className="text-xs text-gray-400 font-semibold mb-1">CAST</p>
                    <p className="text-sm text-white">{movie.stars}</p>
                  </div>
                )}
                {movie.language && (
                  <div>
                    <p className="text-xs text-gray-400 font-semibold mb-1">LANGUAGE</p>
                    <p className="text-sm text-white">{movie.language}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sticky Watch Now Button */}
        <div className="w-full p-4 bg-[#0F1419] border-t border-white/5 shrink-0 z-20">
          <button
            onClick={() => onWatchNow(movie)}
            className="w-full bg-[#CE1126] hover:bg-[#a30d1e] text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95"
          >
            <Play size={20} fill="currentColor" /> Watch Now
          </button>
        </div>

      </div>
    </div>
  );
};

/**
 * DetailCell Component - Helper for detail grid
 */
interface DetailCellProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

const DetailCell: React.FC<DetailCellProps> = ({ icon, label, value }) => (
  <div className="bg-white/5 rounded-lg p-3">
    <div className="text-gray-400 mb-1">{icon}</div>
    <p className="text-xs text-gray-400 font-semibold">{label}</p>
    <p className="text-sm text-white font-semibold mt-1">{value}</p>
  </div>
);

export default MovieDetailSheet;
