'use client';

import React from 'react';
import Image from 'next/image';
import { RecentlyWatched } from '../types';
import { Play, Trash2, Music, Film } from 'lucide-react';

interface RecentlyWatchedSectionProps {
  items: RecentlyWatched[];
  onItemClick: (id: string) => void;
  onDeleteClick: (id: string) => void;
}

/**
 * RecentlyWatchedSection Component
 * Displays grid of recently watched movies and music
 * Shows progress, thumbnails, and quick actions
 */

function RecentlyWatchedSection({
  items,
  onItemClick,
  onDeleteClick,
}: RecentlyWatchedSectionProps): React.ReactElement {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Recently Watched</h2>
        <p className="text-gray-400">Continue watching your favorite content</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="group relative bg-white/5 border border-white/10 rounded-lg overflow-hidden hover:border-[#CE1126] hover:bg-white/[0.08] transition"
          >
            {/* Thumbnail */}
            <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#111] mb-3">
              {item.thumbnail && (
                <Image
                  src={item.thumbnail}
                  alt={item.title}
                  fill
                  className="object-cover group-hover:scale-105 transition duration-300"
                />
              )}

              {/* Type Badge */}
              <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 rounded text-white text-xs font-semibold flex items-center gap-1">
                {item.type === 'movie' ? (
                  <>
                    <Film size={12} /> Movie
                  </>
                ) : (
                  <>
                    <Music size={12} /> Music
                  </>
                )}
              </div>

              {/* Play Button Overlay */}
              <button
                onClick={() => onItemClick(item.id)}
                className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/50 opacity-0 group-hover:opacity-100 transition"
              >
                <div className="w-12 h-12 bg-[#CE1126] rounded-full flex items-center justify-center group-hover:scale-110 transition">
                  <Play
                    size={20}
                    className="text-white fill-white ml-0.5"
                  />
                </div>
              </button>

              {/* Delete Button */}
              <button
                onClick={() => onDeleteClick(item.id)}
                className="absolute top-2 right-2 p-2 bg-black/60 hover:bg-red-600 text-gray-300 hover:text-white rounded-lg opacity-0 group-hover:opacity-100 transition"
              >
                <Trash2 size={16} />
              </button>
            </div>

            {/* Content */}
            <div className="p-3">
              <h3 className="font-semibold text-white text-sm line-clamp-2 mb-1">
                {item.title}
              </h3>

              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-gray-400">{item.watchedDate}</p>
                <p className="text-xs text-gray-400">{item.duration}</p>
              </div>

              {/* Progress Bar */}
              {item.progress < 100 && (
                <>
                  <div className="w-full bg-white/10 rounded-full h-1.5 mb-1 overflow-hidden">
                    <div
                      className="h-full bg-[#CE1126] transition-all duration-300"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400">
                    {item.progress}% watched
                  </p>
                </>
              )}

              {item.progress === 100 && (
                <p className="text-xs text-green-400">✓ Finished</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RecentlyWatchedSection;
