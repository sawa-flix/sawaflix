'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import {
  MovieCard,
  RightSidebarContent,
  MovieDetailSheet,
  FILTERS,
  Movie,
} from '@/components/Movie';
import MovieHeroBanner from '@/components/Movie/MovieHeroBanner';
import { fetchCuratedMovies } from '@/components/Movie/movieApi';

export default function MoviePage(): React.ReactElement {
  const searchParams = useSearchParams();
  const router = useRouter();
  const movieQuery = (searchParams.get('q') || '').trim().toLowerCase();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [genres, setGenres] = useState<string[]>(FILTERS);
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch real Cameroonian movies from the backend YouTube curation engine
  const loadMovies = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const catalog = await fetchCuratedMovies();
      if (catalog.length === 0) throw new Error('No curated movies are available.');
      setMovies(catalog);
      
      const availableGenres = Array.from(
        new Set(['All', ...catalog.flatMap((m) => m.genres)])
      ).slice(0, 12);
      setGenres(availableGenres);

      const featured = catalog.find((m) => m.featured && m.mediaKind !== 'episode') || catalog[0];
      setSelectedMovie(featured);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Movie catalog is unavailable.');
      setMovies([]);
      setSelectedMovie(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadMovies();
  }, [loadMovies]);

  // Featured Hero movie
  const matchingMovies = useMemo(() => {
    if (!movieQuery) return movies;
    return movies.filter((movie) =>
      movie.title.toLowerCase().includes(movieQuery) ||
      movie.description.toLowerCase().includes(movieQuery) ||
      movie.genres.some((genre) => genre.toLowerCase().includes(movieQuery)) ||
      String(movie.year).includes(movieQuery)
    );
  }, [movies, movieQuery]);

  const featuredMovie = useMemo(
    () => movieQuery ? matchingMovies[0] || null : matchingMovies.find((movie) => movie.featured && movie.mediaKind !== 'episode') || matchingMovies[0] || null,
    [movies, movieQuery, matchingMovies]
  );

  // Memoized filtered movies for responsive grid
  const filteredMovies = useMemo(() => {
    if (activeFilter === 'All') return matchingMovies.filter((movie) => movie.id !== featuredMovie?.id);
    return matchingMovies.filter((movie) => movie.id !== featuredMovie?.id && movie.genres?.includes(activeFilter));
  }, [matchingMovies, activeFilter, featuredMovie]);

  // Related movies for the desktop right sidebar
  const moreMovies = useMemo(
    () => movies.filter((m) => m.id !== selectedMovie?.id).slice(0, 6),
    [movies, selectedMovie]
  );

  const seriesEpisodes = useMemo(() => {
    if (!selectedMovie?.seriesId) return [];
    return movies
      .filter((movie) => movie.seriesId === selectedMovie.seriesId && movie.mediaKind === 'episode')
      .sort((a, b) => (a.seasonNumber || 1) - (b.seasonNumber || 1) || (a.episodeNumber || 0) - (b.episodeNumber || 0));
  }, [movies, selectedMovie]);

  const handleWatchMovie = useCallback((movie: Movie) => {
    router.push(`/dashboard/movie/${encodeURIComponent(movie.id)}`);
  }, [router]);

  return (
    <>
      <div className="movie-page-root flex flex-col gap-6 lg:gap-8 w-full max-w-[1920px] mx-auto min-h-screen text-[color:var(--foreground)] pb-20">
        {/* Filters span the same cinema canvas as the featured title. */}
        <div className="sticky top-0 z-40 bg-[color:var(--background)]/90 backdrop-blur-md py-3 flex items-center gap-2 overflow-x-auto scrollbar-hide border-b border-[color:var(--border)] -mx-4 px-4 sm:mx-0 sm:px-0">
            {genres.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`cursor-pointer shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                  activeFilter === filter
                    ? 'bg-[color:var(--foreground)] text-[color:var(--background)] shadow-sm'
                    : 'bg-[color:var(--surface-hover)] text-[color:var(--muted-foreground)] hover:text-[color:var(--foreground)] hover:bg-[color:var(--border)]/40 border border-[color:var(--border)]/50'
                }`}
                aria-pressed={activeFilter === filter}
              >
                {filter}
              </button>
            ))}

            {loading && (
              <div className="flex items-center gap-1.5 text-xs text-[color:var(--muted-foreground)] shrink-0 ml-auto pr-2">
                <Loader2 size={13} className="animate-spin" />
                <span>Syncing catalog…</span>
              </div>
            )}
        </div>

        {featuredMovie && (!movieQuery || matchingMovies.length > 0) && (
          <MovieHeroBanner
            movie={featuredMovie}
            onWatchNow={() => handleWatchMovie(featuredMovie)}
          />
        )}

        {movieQuery && matchingMovies.length === 0 && (
          <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] px-5 py-8 text-center text-sm font-semibold text-[color:var(--muted-foreground)]">
            No movies found for &quot;{searchParams.get('q')}&quot;.
          </div>
        )}

        {!loading && error && movies.length === 0 && !movieQuery && (
          <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] px-5 py-10 text-center">
            <p className="text-sm font-semibold text-[color:var(--foreground)]">The SawaFlix movie catalog is unavailable right now.</p>
            <p className="mt-1 text-xs text-[color:var(--muted-foreground)]">Please try again shortly.</p>
          </div>
        )}

        <div className="flex flex-col xl:flex-row gap-6 lg:gap-8">
        {/* ========== MOVIE CATALOG ========== */}
        <div className="flex-1 min-w-0 flex flex-col pt-2">
          {/* Movie Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
            {filteredMovies.map((movie, idx) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                isPremium={idx % 3 === 0}
                onClick={() => setSelectedMovie(movie)}
                isActive={selectedMovie?.id === movie.id}
              />
            ))}
            {filteredMovies.length === 0 && (
              <div className="col-span-full py-20 text-center text-[color:var(--muted-foreground)] font-bold">
                No movies found for &quot;{activeFilter}&quot;
              </div>
            )}
          </div>
        </div>

        {/* ========== RIGHT SIDEBAR (DESKTOP ONLY) ========== */}
        <div className="hidden xl:block w-[400px] 2xl:w-[440px] shrink-0 sticky top-4 h-[calc(100vh-2rem)] rounded-xl overflow-y-auto scrollbar-hide bg-[color:var(--surface)] border border-[color:var(--border)] shadow-xl p-5 transition-colors">
          <RightSidebarContent
            movie={selectedMovie}
            onClose={() => setSelectedMovie(featuredMovie)}
            moreMovies={moreMovies}
            seriesEpisodes={seriesEpisodes}
            onSelectMovie={setSelectedMovie}
            onWatchNow={handleWatchMovie}
          />
        </div>
        </div>
      </div>

      {/* ========== MOBILE BOTTOM SHEET (SLIDES FROM BOTTOM) ========== */}
      <div className="xl:hidden">
        {selectedMovie && selectedMovie.id !== featuredMovie?.id && (
          <MovieDetailSheet
            movie={selectedMovie}
            seriesEpisodes={seriesEpisodes}
            onSelectMovie={setSelectedMovie}
            onClose={() => setSelectedMovie(featuredMovie)}
            onWatchNow={handleWatchMovie}
          />
        )}
      </div>

      <style jsx global>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.25s ease-out;
        }
      `}</style>
    </>
  );
}
