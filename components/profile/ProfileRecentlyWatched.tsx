import Image from 'next/image';
import Link from 'next/link';
import { Play, Clock, ChevronRight } from 'lucide-react';
import { MOVIES_DATA } from '../Movie';

interface Movie {
  id: string;
  title: string;
  image: string;
  year: number;
  genres: string[];
  duration?: string;
  rating?: number;
}

const WATCH_PROGRESS = [72, 45, 88, 31, 60];

export default function ProfileRecentlyWatched() {
  const recentMovies = MOVIES_DATA.slice(0, 5) as Movie[];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-amber-500" />
          <h3 className="text-base font-bold text-white">Recently Watched</h3>
        </div>
        <Link
          href="/dashboard/movie"
          className="flex items-center gap-1 text-amber-500 text-xs font-bold hover:text-amber-400 transition-colors"
        >
          View all
          <ChevronRight size={14} />
        </Link>
      </div>

      {/* Movie Grid — horizontal scroll on mobile, grid on desktop */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none md:grid md:grid-cols-2">
        {recentMovies.map((movie, i) => (
          <Link
            key={movie.id}
            href="/dashboard/movie"
            className="group relative shrink-0 w-36 md:w-auto rounded-xl overflow-hidden border border-white/5 hover:border-amber-500/40 transition-all"
          >
            {/* Thumbnail */}
            <div className="relative aspect-[2/3] md:aspect-video w-full bg-zinc-900">
              <Image
                src={movie.image}
                alt={movie.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                unoptimized
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center pl-0.5 shadow-lg shadow-amber-500/30">
                  <Play size={16} fill="white" className="text-white" />
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="absolute bottom-14 md:bottom-10 left-0 right-0 h-0.5 bg-white/20">
              <div
                className="h-full bg-amber-500"
                style={{ width: `${WATCH_PROGRESS[i]}%` }}
              />
            </div>

            {/* Info */}
            <div className="p-2 bg-[#0E121A]">
              <p className="text-white text-[11px] font-semibold line-clamp-1 mb-0.5">
                {movie.title}
              </p>
              <p className="text-zinc-500 text-[10px]">
                {movie.genres?.[0] || 'Drama'}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
