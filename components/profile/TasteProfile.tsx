import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { MUSICIANS_DATA } from '../Movie/MusicianConstants';

interface TasteProfile {
  genre: string;
  percentage: number;
}

const USER_TASTE_PROFILE: TasteProfile[] = [
  { genre: 'Makossa', percentage: 78 },
  { genre: 'Afrobeat', percentage: 65 },
  { genre: 'Drama', percentage: 52 },
  { genre: 'Comedy', percentage: 41 },
];

export default function TasteProfile() {
  // Get featured musicians for "Artists You Follow"
  const featuredArtists = MUSICIANS_DATA.filter((musician) => musician.featured).slice(0, 4);

  return (
    <div className="w-full space-y-8">
      {/* TASTE PROFILE SECTION */}
      <div>
        {/* Header */}
        <h3 className="text-sm font-bold text-white uppercase tracking-wide mb-6">
          Taste Profile
        </h3>

        {/* Genre List with Progress Bars */}
        <div className="space-y-4">
          {USER_TASTE_PROFILE.map((item) => (
            <div key={item.genre} className="flex items-center gap-4">
              {/* Genre Name */}
              <span className="text-sm text-zinc-300 min-w-20">{item.genre}</span>

              {/* Progress Bar */}
              <div className="flex-1 h-1 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-600 transition-all duration-500"
                  style={{ width: `${item.percentage}%` }}
                />
              </div>

              {/* Percentage */}
              <span className="text-sm font-semibold text-zinc-400 min-w-10 text-right">
                {item.percentage}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ARTISTS YOU FOLLOW SECTION */}
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-bold text-white uppercase tracking-wide">
            Artists You Follow
          </h3>
          <Link
            href="/dashboard/artists"
            className="flex items-center gap-1 text-red-600 text-xs font-semibold hover:text-red-500 transition-colors"
          >
            View all artists
            <ChevronRight size={16} />
          </Link>
        </div>

        {/* Artists Grid - 2x2 */}
        <div className="grid grid-cols-2 gap-6">
          {featuredArtists.map((artist) => (
            <Link
              key={artist.id}
              href={`/dashboard/artists/`}
              className="group flex flex-col items-center text-center"
            >
              {/* Artist Avatar */}
              <div className="relative w-24 h-24 mb-3 rounded-full border-2 border-red-600 p-0.5 group-hover:border-red-500 transition-colors">
                <div className="relative w-full h-full rounded-full overflow-hidden bg-zinc-800 flex items-center justify-center">
                  {artist.image && artist.image !== 'https://i.ibb.co/placeholder/manu-dibango.png' ? (
                    <Image
                      src={artist.image}
                      alt={artist.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                      unoptimized
                    />
                  ) : (
                    /* Placeholder Icon */
                    <div className="w-16 h-16 rounded-full bg-zinc-700/50 flex items-center justify-center">
                      <svg
                        className="w-8 h-8 text-zinc-500"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>

              {/* Artist Name */}
              <h4 className="text-sm font-semibold text-white group-hover:text-red-500 transition-colors line-clamp-1">
                {artist.name}
              </h4>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
