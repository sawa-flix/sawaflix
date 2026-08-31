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
      iconColor: 'text-red-500 fill-red-500/20',
      bgColor: 'bg-red-500/10 border-red-500/20',
    },
    {
      id: 'music',
      label: 'Music Played',
      value: (musicPlayed ?? stats?.musicPlayed ?? 1235).toLocaleString(),
      icon: Music,
      iconColor: 'text-pink-500',
      bgColor: 'bg-pink-500/10 border-pink-500/20',
    },
    {
      id: 'watchlist',
      label: 'Watchlist',
      value: (watchlistCount ?? stats?.savedCount ?? 83).toLocaleString(),
      icon: Bookmark,
      iconColor: 'text-amber-500 fill-amber-500/20',
      bgColor: 'bg-amber-500/10 border-amber-500/20',
    },
    {
      id: 'downloads',
      label: 'Downloads',
      value: (downloadsCount ?? 42).toLocaleString(),
      icon: Download,
      iconColor: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10 border-emerald-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            className="rounded-2xl border border-white/10 bg-[#0E121A]/90 p-5 flex items-center gap-4 hover:border-white/20 transition-all backdrop-blur-xl shadow-xl group"
          >
            {/* Icon Box */}
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center border shrink-0 transition-transform group-hover:scale-105 ${card.bgColor}`}
            >
              <Icon size={22} className={card.iconColor} />
            </div>

            {/* Content Box */}
            <div className="min-w-0 flex-1">
              <span className="block text-xs font-medium text-zinc-400 mb-0.5 truncate">
                {card.label}
              </span>
              <span className="block text-2xl font-black text-white tracking-tight">
                {card.value}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
