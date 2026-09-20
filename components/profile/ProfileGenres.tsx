import { Sparkles } from 'lucide-react';

interface ProfileGenresProps {
  genres: string[];
}

/** Real — sourced directly from users.favored_genres. Shown as its own section, distinct from the About tab. */
export function ProfileGenres({ genres }: ProfileGenresProps) {
  return (
    <div className="rounded-2xl border border-white/5 bg-[#0E121A] p-5">
      <div className="mb-3 flex items-center gap-2">
        <Sparkles size={15} className="text-white/40" />
        <h2 className="text-sm font-bold text-white">Favorite Genres</h2>
      </div>
      {genres.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {genres.map((genre) => (
            <span key={genre} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-gray-300">
              {genre}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500">No favorite genres added yet.</p>
      )}
    </div>
  );
}
