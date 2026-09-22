'use client';

import Image from 'next/image';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Clock3, Film, Loader2, Play, RefreshCw, Search, X } from 'lucide-react';
import { BACKEND_URL } from '@/lib/apiConfig';

interface CuratedMovieDto {
  youtube_video_id: string;
  channel_title: string;
  title: string;
  description: string;
  thumbnail_url: string;
  embed_url: string;
  duration_seconds: number;
  published_at: string;
  genres: string[];
  language: string | null;
  is_featured: boolean;
}

interface MovieApiResponse {
  success: boolean;
  movies?: CuratedMovieDto[];
  genres?: string[];
  error?: string;
}

function formatDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}

function publicationYear(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : String(date.getFullYear());
}

export default function MoviePage(): React.ReactElement {
  const [movies, setMovies] = useState<CuratedMovieDto[]>([]);
  const [genres, setGenres] = useState<string[]>([]);
  const [activeGenre, setActiveGenre] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [playingMovie, setPlayingMovie] = useState<CuratedMovieDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMovies = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${BACKEND_URL}/api/youtube/movies?limit=100`, {
        headers: { Accept: 'application/json' },
        cache: 'no-store',
      });
      const result: MovieApiResponse = await response.json();
      if (!response.ok || !result.success || !result.movies) {
        throw new Error(result.error || 'The movie library is temporarily unavailable.');
      }
      setMovies(result.movies);
      setGenres(result.genres || []);
    } catch (requestError) {
      const message = requestError instanceof Error
        ? requestError.message
        : 'The movie library is temporarily unavailable.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadMovies();
  }, [loadMovies]);

  useEffect(() => {
    if (!playingMovie) return;
    const closeOnEscape = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') setPlayingMovie(null);
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [playingMovie]);

  const featuredMovie = useMemo(
    () => movies.find((movie) => movie.is_featured) || movies[0] || null,
    [movies],
  );

  const filteredMovies = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLocaleLowerCase();
    return movies.filter((movie) => {
      const matchesGenre = activeGenre === 'All' || movie.genres.includes(activeGenre);
      const matchesSearch = normalizedQuery.length === 0
        || movie.title.toLocaleLowerCase().includes(normalizedQuery)
        || movie.channel_title.toLocaleLowerCase().includes(normalizedQuery);
      return matchesGenre && matchesSearch;
    });
  }, [activeGenre, movies, searchQuery]);

  return (
    <main className="min-h-screen bg-[#090b0f] text-white pb-20">
      <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 border-b border-white/10 py-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-1 text-xs font-bold uppercase text-[#f2c94c]">Cameroon on screen</p>
            <h1 className="text-3xl font-black sm:text-4xl">Movies</h1>
          </div>
          <label className="flex h-11 w-full items-center gap-3 border border-white/15 bg-[#12151b] px-4 md:max-w-sm">
            <Search size={18} className="shrink-0 text-gray-400" aria-hidden="true" />
            <span className="sr-only">Search movies or channels</span>
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search movies or channels"
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-gray-500"
              type="search"
            />
          </label>
        </header>

        {loading && (
          <div className="flex min-h-[60vh] items-center justify-center gap-3 text-gray-300" role="status">
            <Loader2 className="animate-spin" size={22} />
            Loading the movie library
          </div>
        )}

        {!loading && error && (
          <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
            <Film size={42} className="mb-4 text-gray-500" />
            <h2 className="text-xl font-bold">Movies could not be loaded</h2>
            <p className="mt-2 max-w-lg text-sm text-gray-400">{error}</p>
            <button
              type="button"
              onClick={() => void loadMovies()}
              className="mt-6 inline-flex h-10 items-center gap-2 bg-white px-4 text-sm font-bold text-black hover:bg-gray-200"
            >
              <RefreshCw size={16} /> Retry
            </button>
          </div>
        )}

        {!loading && !error && featuredMovie && (
          <>
            <section className="relative -mx-4 min-h-[430px] overflow-hidden sm:-mx-6 lg:-mx-8 lg:min-h-[520px]">
              <Image src={featuredMovie.thumbnail_url} alt="" fill priority unoptimized className="object-cover" sizes="100vw" />
              <div className="absolute inset-0 bg-black/60" />
              <div className="relative flex min-h-[430px] max-w-3xl flex-col justify-end px-4 pb-10 sm:px-6 lg:min-h-[520px] lg:px-8 lg:pb-14">
                <p className="mb-3 text-xs font-bold uppercase text-[#f2c94c]">Featured from {featuredMovie.channel_title}</p>
                <h2 className="text-3xl font-black leading-tight sm:text-5xl">{featuredMovie.title}</h2>
                <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-200">
                  <span>{publicationYear(featuredMovie.published_at)}</span>
                  <span className="inline-flex items-center gap-1.5"><Clock3 size={15} /> {formatDuration(featuredMovie.duration_seconds)}</span>
                  <span>{featuredMovie.language || 'Cameroonian cinema'}</span>
                </div>
                <p className="mt-4 line-clamp-3 max-w-2xl text-sm leading-6 text-gray-200 sm:text-base">
                  {featuredMovie.description || `A film from ${featuredMovie.channel_title}.`}
                </p>
                <button type="button" onClick={() => setPlayingMovie(featuredMovie)} className="mt-6 inline-flex h-11 w-fit items-center gap-2 bg-[#ce1126] px-5 text-sm font-bold hover:bg-[#aa0e20]">
                  <Play size={17} fill="currentColor" /> Watch now
                </button>
              </div>
            </section>

            <section className="py-8" aria-label="Movie catalog">
              <div className="mb-7 flex gap-1 overflow-x-auto border-b border-white/10" role="tablist" aria-label="Movie genres">
                {['All', ...genres].map((genre) => (
                  <button key={genre} type="button" role="tab" aria-selected={activeGenre === genre} onClick={() => setActiveGenre(genre)} className={`shrink-0 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${activeGenre === genre ? 'border-[#f2c94c] text-white' : 'border-transparent text-gray-400 hover:text-white'}`}>
                    {genre}
                  </button>
                ))}
              </div>

              {filteredMovies.length > 0 ? (
                <div className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                  {filteredMovies.map((movie) => (
                    <article key={movie.youtube_video_id} className="group min-w-0">
                      <button type="button" onClick={() => setPlayingMovie(movie)} className="relative block aspect-video w-full overflow-hidden bg-[#171a20] text-left" aria-label={`Watch ${movie.title}`}>
                        <Image src={movie.thumbnail_url} alt={movie.title} fill unoptimized className="object-cover transition-transform duration-300 group-hover:scale-[1.03]" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
                        <span className="absolute bottom-3 right-3 bg-black/85 px-2 py-1 text-xs font-bold">{formatDuration(movie.duration_seconds)}</span>
                        <span className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/35">
                          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ce1126] opacity-0 transition-opacity group-hover:opacity-100">
                            <Play size={20} fill="currentColor" className="ml-0.5" />
                          </span>
                        </span>
                      </button>
                      <h3 className="mt-3 line-clamp-2 text-base font-bold leading-5">{movie.title}</h3>
                      <p className="mt-1 text-xs text-gray-400">{movie.channel_title} | {publicationYear(movie.published_at)}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {movie.genres.slice(0, 3).map((genre) => <span key={genre} className="text-xs font-semibold text-[#f2c94c]">{genre}</span>)}
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center">
                  <Film size={38} className="mx-auto mb-3 text-gray-600" />
                  <h2 className="font-bold">No matching movies</h2>
                  <p className="mt-1 text-sm text-gray-400">Try another title, channel, or genre.</p>
                </div>
              )}
            </section>
          </>
        )}

        {!loading && !error && movies.length === 0 && (
          <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
            <Film size={42} className="mb-4 text-gray-600" />
            <h2 className="text-xl font-bold">The movie library is being prepared</h2>
            <p className="mt-2 text-sm text-gray-400">Check back after the next catalog synchronization.</p>
          </div>
        )}
      </div>

      {playingMovie && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-3 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label={`Playing ${playingMovie.title}`}
          onClick={() => setPlayingMovie(null)}
        >
          <div
            className="max-h-full w-full max-w-6xl overflow-y-auto bg-[#12151b] shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="flex min-h-14 items-center justify-between gap-3 border-b border-white/10 bg-[#12151b] px-3 sm:px-4">
              <button
                type="button"
                onClick={() => setPlayingMovie(null)}
                className="inline-flex h-10 shrink-0 items-center gap-2 px-2 text-sm font-bold text-white hover:bg-white/10"
              >
                <ArrowLeft size={19} />
                <span>Back to movies</span>
              </button>
              <p className="hidden min-w-0 flex-1 truncate text-center text-sm font-semibold text-gray-300 sm:block">
                {playingMovie.title}
              </p>
              <button
                type="button"
                onClick={() => setPlayingMovie(null)}
                className="flex h-10 w-10 shrink-0 items-center justify-center text-gray-300 hover:bg-white/10 hover:text-white"
                aria-label="Close player"
                title="Close player"
              >
                <X size={21} />
              </button>
            </header>
            <div className="aspect-video w-full bg-black">
              <iframe src={`${playingMovie.embed_url}?autoplay=1&rel=0`} title={playingMovie.title} className="h-full w-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen />
            </div>
            <div className="bg-[#12151b] p-4 sm:p-5">
              <h2 className="pr-10 text-lg font-bold sm:text-xl">{playingMovie.title}</h2>
              <p className="mt-1 text-sm text-gray-400">{playingMovie.channel_title}</p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
