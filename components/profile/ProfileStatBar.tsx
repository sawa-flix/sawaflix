import { Film, Music, Bookmark, Download } from 'lucide-react';

interface ProfileStatsProps {
  moviesWatched?: number;
  musicPlayed?: number;
  watchlistItems?: number;
  downloads?: number;
}

const stats = [
  {
    key: 'moviesWatched',
    label: 'Movies Watched',
    icon: Film,
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
  },
  {
    key: 'musicPlayed',
    label: 'Music Played',
    icon: Music,
    color: 'text-amber-400',
    bg: 'bg-amber-400/10',
  },
  {
    key: 'watchlistItems',
    label: 'Watchlist',
    icon: Bookmark,
    color: 'text-amber-300',
    bg: 'bg-amber-300/10',
  },
  {
    key: 'downloads',
    label: 'Downloads',
    icon: Download,
    color: 'text-amber-600',
    bg: 'bg-amber-600/10',
  },
];

export default function ProfileStatBar({
  moviesWatched = 147,
  musicPlayed = 1235,
  watchlistItems = 83,
  downloads = 42,
}: ProfileStatsProps) {
  const values: Record<string, number> = {
    moviesWatched,
    musicPlayed,
    watchlistItems,
    downloads,
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.key}
            className="flex items-center gap-4 p-4 bg-[#0E121A] border border-white/5 rounded-xl hover:border-white/10 transition-all"
          >
            <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center shrink-0`}>
              <Icon size={18} className={stat.color} />
            </div>
            <div>
              <p className="text-xs text-zinc-500 font-medium mb-0.5">{stat.label}</p>
              <p className="text-xl font-bold text-white leading-none">
                {values[stat.key].toLocaleString()}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
