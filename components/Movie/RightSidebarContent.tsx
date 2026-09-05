'use client';

import React from 'react';
import Image from 'next/image';
import { Play, Star, Info, Globe, Users, Calendar, FileText, Volume2 } from 'lucide-react';
import { RightSidebarContentProps } from './types';

/**
 * RightSidebarContent Component
 * Desktop-only sidebar showing detailed movie information
 * Features: movie preview, metadata, related movies
 */
export const RightSidebarContent: React.FC<RightSidebarContentProps> = ({
  movie,
  onClose,
  moreMovies,
  onWatchNow,
}) => {
  if (!movie) return null;

  return (
    <div className="animate-fadeIn">
      {/* Sidebar Header */}
      <div className="flex justify-between items-center mb-5">
        <span className="bg-[#FCD116]/20 text-[#FCD116] border border-[#FCD116]/30 text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1 uppercase tracking-wider">
          <Star size={10} fill="currentColor" /> Premium Content
        </span>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
          aria-label="Close sidebar"
        >
          ✕
        </button>
      </div>

      {/* Sidebar Preview Player */}
      <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-6 group cursor-pointer border border-white/10 shadow-lg">
        <Image
          src={movie.image}
          alt={movie.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-700"
          unoptimized
        />

        {/* Play Button Overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <button
            onClick={() => onWatchNow(movie)}
            className="bg-[#CE1126] hover:bg-[#a30d1e] text-white rounded-full p-4 shadow-2xl transform scale-90 group-hover:scale-100 transition-all"
            aria-label={`Play ${movie.title}`}
          >
            <Play size={24} fill="currentColor" className="ml-1" />
          </button>
        </div>
      </div>

      {/* Movie Title and Rating */}
      <h2 className="text-lg lg:text-xl font-bold text-white mb-2 line-clamp-2">
        {movie.title}
      </h2>
      <div className="flex items-center gap-2 mb-4 text-sm">
        <div className="flex items-center gap-1 bg-[#FCD116]/20 text-[#FCD116] px-2 py-1 rounded">
          <Star size={14} fill="currentColor" />
          <span className="font-bold">{movie.rating || 4.5}</span>
        </div>
        <span className="text-gray-400">•</span>
        <span className="text-gray-400">{movie.ageRating || '13+'}</span>
      </div>

      {/* Description */}
      <p className="text-xs lg:text-sm text-gray-300 mb-4 line-clamp-3">
        {movie.description}
      </p>

      {/* Movie Details Grid */}
      <div className="space-y-3 mb-6 pb-6 border-b border-white/10">
        {movie.year && (
          <DetailRow icon={<Calendar size={16} />} label="Year" value={movie.year.toString()} />
        )}
        {movie.duration && (
          <DetailRow icon={<Volume2 size={16} />} label="Duration" value={movie.duration} />
        )}
        {movie.director && (
          <DetailRow icon={<Users size={16} />} label="Director" value={movie.director} />
        )}
        {movie.language && (
          <DetailRow icon={<Globe size={16} />} label="Language" value={movie.language} />
        )}
        {movie.stars && <DetailRow icon={<Star size={16} />} label="Cast" value={movie.stars} />}
      </div>

      {/* Watch Now Button */}
      <button
        onClick={() => onWatchNow(movie)}
        className="w-full bg-[#CE1126] hover:bg-[#a30d1e] text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg mb-6"
      >
        <Play size={18} fill="currentColor" /> Watch Now
      </button>

      {/* Related Movies Section */}
      <div>
        <h3 className="text-sm font-bold text-white mb-3 uppercase tracking-wider">
          Similar Movies
        </h3>
        <div className="space-y-2">
          {moreMovies.map((m) => (
            <div
              key={m.id}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors group"
            >
              <div className="relative w-10 h-14 rounded overflow-hidden flex-shrink-0">
                <Image
                  src={m.image}
                  alt={m.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                  unoptimized
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-300 truncate group-hover:text-white">
                  {m.title}
                </p>
                <p className="text-[10px] text-gray-500">
                  {m.rating} ★ • {m.year}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * DetailRow Component - Helper for movie details
 */
interface DetailRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

const DetailRow: React.FC<DetailRowProps> = ({ icon, label, value }) => (
  <div className="flex items-start gap-2">
    <div className="text-gray-400 flex-shrink-0 mt-0.5">{icon}</div>
    <div className="min-w-0 flex-1">
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-xs font-semibold text-white truncate">{value}</p>
    </div>
  </div>
);

export default RightSidebarContent;
