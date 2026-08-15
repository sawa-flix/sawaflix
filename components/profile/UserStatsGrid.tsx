'use client';

import React from 'react';
import { UserStats } from './types';
import { Film, Music, Bookmark, Download } from 'lucide-react';

interface UserStatsGridProps {
  stats: UserStats;
}

/**
 * UserStatsGrid Component
 * Displays 4 key user statistics in responsive grid
 * Uses alternating red/white color scheme
 */
export default function UserStatsGrid({ stats }: UserStatsGridProps): React.ReactElement {
  if (!stats) {
    return <div>Loading stats...</div>;
  }

  const statsItems = [
    { 
      icon: Film, 
      label: 'Movies Watched', 
      value: stats.moviesWatched,
      isRed: true
    },
    { 
      icon: Music, 
      label: 'Music Played', 
      value: stats.musicPlayed,
      isRed: false
    },
    { 
      icon: Bookmark,
      label: 'Watchlist',
      value: stats.watchlistItems,
      isRed: true
    },
    { 
      icon: Download, 
      label: 'Downloads', 
      value: stats.downloads,
      isRed: false
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {statsItems.map((item) => {
        const Icon = item.icon;
        
        return (
          <div
            key={item.label}
            className={`p-4 sm:p-6 rounded-lg sm:rounded-xl border border-white/10 transition-all hover:border-white/20 ${
              item.isRed
                ? 'bg-[#CE1126]/10 hover:bg-[#CE1126]/15'
                : 'bg-white/5 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className={`p-2 rounded-lg ${
                  item.isRed ? 'bg-[#CE1126]/20' : 'bg-white/10'
                }`}
              >
                <Icon
                  size={20}
                  className={item.isRed ? 'text-[#CE1126]' : 'text-white'}
                />
              </div>
              <span className="text-xs sm:text-sm text-gray-400 font-medium">
                {item.label}
              </span>
            </div>

            <p className="text-2xl sm:text-3xl font-bold text-white">
              {item.value.toLocaleString()}
            </p>
          </div>
        );
      })}
    </div>
  );
}
