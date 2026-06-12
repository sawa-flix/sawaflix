import Image from 'next/image';
import Link from 'next/link';
import { Play, ChevronRight, Clock } from 'lucide-react';
import { MOVIES_DATA } from '../Movie';

interface Movie {
  id: string;
  title: string;
  image: string;
  year: number;
  genres: string[];
  duration?: string;
  rating?: number;
  description?: string;
}

const CONTINUE_WATCHING_DATA = [
  {
    movie: MOVIES_DATA[0],
    timeLeft: '1h 12m left',
    progress: 65,
  },
  {
    movie: MOVIES_DATA[1],
    timeLeft: '42m left',
    progress: 48,
  },
  {
    movie: MOVIES_DATA[2],
    timeLeft: '1h 05m left',
    progress: 72,
  },
];

export default function ProfileContinuePlaying() {
  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-1 h-5 bg-red-600 rounded-full"></div>
          <h2 className="text-xl font-bold text-white">CONTINUE WATCHING</h2>
        </div>
        <Link
          href="/dashboard/movie"
          className="flex items-center gap-1 text-red-600 text-sm font-semibold hover:text-red-500 transition-colors"
        >
          View all
          <ChevronRight size={18} />
        </Link>
      </div>

      {/* Continue Watching List - Vertical Stack */}
      <div className="space-y-4">
        {CONTINUE_WATCHING_DATA.map((item) => (
          <Link
            key={item.movie.id}
            href={`/dashboard/movie/`}
            className="group flex gap-4 rounded-lg overflow-hidden border border-white/5 hover:border-red-600/40 transition-all bg-zinc-900/40 hover:bg-zinc-900/60 p-3"
          >
            {/* Movie Thumbnail */}
            <div className="relative shrink-0 w-24 h-32 rounded overflow-hidden bg-zinc-800">
              <Image
                src={item.movie.image}
                alt={item.movie.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                unoptimized
              />
              {/* Play Overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center shadow-lg shadow-red-600/50">
                  <Play size={20} fill="white" className="text-white" />
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col justify-between py-1">
              {/* Title & Info */}
              <div className="flex-1">
                <h3 className="text-white font-semibold text-sm line-clamp-2 mb-2">
                  {item.movie.title}
                </h3>
                <p className="text-zinc-400 text-xs mb-3">
                  {item.timeLeft}
                </p>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-1 bg-zinc-700/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-600 transition-all duration-300"
                  style={{ width: `${item.progress}%` }}
                />
              </div>
            </div>

            {/* Resume Button */}
            <div className="shrink-0 flex items-center justify-center">
              <button className="px-4 py-2 border border-red-600 text-red-600 font-semibold text-xs rounded hover:bg-red-600 hover:text-white transition-all">
                Resume
              </button>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
