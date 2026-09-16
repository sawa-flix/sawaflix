'use client';

import React from 'react';
import { Play, Music, Bookmark, Download } from 'lucide-react';
import type { UserStats } from '@/types/profile';

interface ProfileStatsProps {
  stats?: UserStats;
  moviesWatched?: number;
  musicPlayed?: number;
  watchlistCount?: number;
  downloadsCount?: number;
}

export function ProfileStats({
  stats,
  moviesWatched,
  musicPlayed,
  watchlistCount,
  downloadsCount,
}: ProfileStatsProps) {
  const cards = [
    {
      id: 'movies',
      label: 'Movies Watched',
      value: (moviesWatched ?? stats?.moviesWatched ?? 147).toLocaleString(),
      icon: Play,
      iconColor: 'text-red-400 fill-red-400/20',
      bgColor: 'bg-white/10 border-white/15',
    },
    {
      id: 'music',
      label: 'Music Played',
      value: (musicPlayed ?? stats?.musicPlayed ?? 1235).toLocaleString(),
      icon: Music,
      iconColor: 'text-pink-400',
      bgColor: 'bg-white/10 border-white/15',
    },
    {
      id: 'watchlist',
      label: 'Watchlist',
      value: (watchlistCount ?? stats?.savedCount ?? 83).toLocaleString(),
      icon: Bookmark,
      iconColor: 'text-amber-400 fill-amber-400/20',
      bgColor: 'bg-white/10 border-white/15',
    },
    {
      id: 'downloads',
      label: 'Downloads',
      value: (downloadsCount ?? 42).toLocaleString(),
      icon: Download,
      iconColor: 'text-emerald-400',
      bgColor: 'bg-white/10 border-white/15',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            className="rounded-xl sm:rounded-2xl border border-white/10 bg-[#0E121A]/90 p-3 sm:p-4 md:p-5 flex items-center gap-3 sm:gap-4 hover:border-white/20 transition-all backdrop-blur-xl shadow-lg group"
          >
            {/* Icon Box with consistent light background */}
            <div
              className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center border shrink-0 transition-transform group-hover:scale-105 ${card.bgColor}`}
            >
              <Icon size={18} className={card.iconColor} />
            </div>

            {/* Content Box */}
            <div className="min-w-0 flex-1">
              <span className="block text-[10px] sm:text-xs font-medium text-zinc-400 mb-0.5 truncate">
                {card.label}
              </span>
              <span className="block text-lg sm:text-xl md:text-2xl font-black text-white tracking-tight">
                {card.value}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
