'use client';

import React from 'react';
import { MusicCard } from './MusicCard';
import { MusicCategoryRowProps, Track } from './types';

/**
 * MusicCategoryRow Component
 * Displays a horizontal scrolling row of music tracks for a category
 * Features: responsive scrolling, category header, see all button
 */
export const MusicCategoryRow: React.FC<MusicCategoryRowProps> = ({
  category,
  isPlaying,
  currentTrackId,
  onTrackClick,
  onPlayPauseCurrentTrack,
}) => {
  if (!category.videos || category.videos.length === 0) {
    return null;
  }

  return (
    <div className="w-full">
      {/* Category Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
          {category.category}
        </h3>
        <button className="text-sm font-semibold text-gray-400 hover:text-white transition-colors">
          See All
        </button>
      </div>

      {/* Horizontal Scroll Container */}
      <div className="flex gap-4 sm:gap-6 overflow-x-auto scrollbar-none pb-4 pt-2 -mx-2 px-2 sm:-mx-0 sm:px-0 scroll-smooth snap-x">
        {category.videos.map((video) => {
          const trackObj: Track = {
            id: video.id,
            title: video.title,
            artist: video.channelTitle,
            image: video.thumbnail,
            src: video.videoUrl,
            duration: '3:00',
          };

          const isTrackPlaying = isPlaying && currentTrackId === trackObj.id;

          return (
            <div
              key={video.id}
              onClick={() => {
                // If clicking the currently playing track, toggle play/pause
                if (currentTrackId === trackObj.id) {
                  onPlayPauseCurrentTrack();
                } else {
                  // Create playlist from all videos in category
                  const playlist: Track[] = category.videos.map((v) => ({
                    id: v.id,
                    title: v.title,
                    artist: v.channelTitle,
                    image: v.thumbnail,
                    src: v.videoUrl,
                  }));
                  onTrackClick(trackObj, playlist);
                }
              }}
            >
              <MusicCard
                track={trackObj}
                isPlaying={isTrackPlaying}
                onClick={() => {}}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MusicCategoryRow;
