'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const movieQuery = (searchParams.get('q') || '').trim().toLowerCase();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [genres, setGenres] = useState<string[]>(FILTERS);
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const movieDetailsHref = useCallback((movie: Movie) => `/dashboard/movie/${encodeURIComponent(movie.id)}`, []);
  const handleWatchMovie = useCallback((movie: Movie) => {
    router.push(movieDetailsHref(movie));
  }, [movieDetailsHref, router]);

  const loadMovies = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const catalog = await fetchCuratedMovies();
      if (catalog.length === 0) throw new Error('No curated movies are available.');
      setMovies(catalog);
      setGenres(Array.from(new Set(['All', ...catalog.flatMap((movie) => movie.genres)])).slice(0, 12));
      const featured = catalog.find((movie) => movie.featured && movie.mediaKind !== 'episode') || catalog[0];
      setSelectedMovie(featured);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Movie catalog is unavailable.');
      setMovies([]);
      setSelectedMovie(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadMovies(); }, [loadMovies]);

  const matchingMovies = useMemo(() => {
    if (!movieQuery) return movies;
    return movies.filter((movie) => movie.title.toLowerCase().includes(movieQuery)
      || movie.description.toLowerCase().includes(movieQuery)
      || movie.genres.some((genre) => genre.toLowerCase().includes(movieQuery))
      || String(movie.year).includes(movieQuery));
  }, [movies, movieQuery]);

  const featuredMovie = useMemo(
    () => movieQuery ? matchingMovies[0] || null : matchingMovies.find((movie) => movie.featured && movie.mediaKind !== 'episode') || matchingMovies[0] || null,
    [matchingMovies, movieQuery]
  );

  const filteredMovies = useMemo(() => {
    const catalog = matchingMovies.filter((movie) => movie.id !== featuredMovie?.id);
    return activeFilter === 'All' ? catalog : catalog.filter((movie) => movie.genres.includes(activeFilter));
  }, [matchingMovies, activeFilter, featuredMovie]);

  const moreMovies = useMemo(
    () => movies.filter((movie) => movie.id !== selectedMovie?.id).slice(0, 6),
    [movies, selectedMovie]
  );

  const seriesEpisodes = useMemo(() => {
    if (!selectedMovie?.seriesId) return [];
    return movies
      .filter((movie) => movie.seriesId === selectedMovie.seriesId && movie.mediaKind === 'episode')
      .sort((a, b) => (a.seasonNumber || 1) - (b.seasonNumber || 1) || (a.episodeNumber || 0) - (b.episodeNumber || 0));
  }, [movies, selectedMovie]);

  return (
    <>
      <div className="movie-page-root mx-auto flex min-h-screen w-full max-w-[1920px] flex-col gap-6 pb-20 text-[color:var(--foreground)] lg:gap-8">
        <div className="sticky top-0 z-40 -mx-4 flex items-center gap-2 overflow-x-auto border-b border-[color:var(--border)] bg-[color:var(--background)]/90 px-4 py-3 backdrop-blur-md sm:mx-0 sm:px-0">
          {genres.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
              className={`shrink-0 cursor-pointer rounded-full px-4 py-2 text-xs font-bold transition-all ${activeFilter === filter ? 'bg-[color:var(--foreground)] text-[color:var(--background)] shadow-sm' : 'border border-[color:var(--border)]/50 bg-[color:var(--surface-hover)] text-[color:var(--muted-foreground)] hover:bg-[color:var(--border)]/40 hover:text-[color:var(--foreground)]'}`}
              aria-pressed={activeFilter === filter}
            >{filter}</button>
          ))}
          {loading && <div className="ml-auto flex shrink-0 items-center gap-1.5 pr-2 text-xs text-[color:var(--muted-foreground)]"><Loader2 size={13} className="animate-spin" /> Syncing catalog…</div>}
        </div>

        {featuredMovie && (!movieQuery || matchingMovies.length > 0) && (
          <MovieHeroBanner movie={featuredMovie} detailsHref={movieDetailsHref(featuredMovie)} />
        )}

        {movieQuery && matchingMovies.length === 0 && <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] px-5 py-8 text-center text-sm font-semibold text-[color:var(--muted-foreground)]">No movies found for &quot;{searchParams.get('q')}&quot;.</div>}
        {!loading && error && movies.length === 0 && !movieQuery && <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] px-5 py-10 text-center"><p className="text-sm font-semibold text-[color:var(--foreground)]">The SawaFlix movie catalog is unavailable right now.</p><p className="mt-1 text-xs text-[color:var(--muted-foreground)]">Please try again shortly.</p></div>}

        <div className="flex flex-col gap-6 lg:gap-8 xl:flex-row">
          <div className="min-w-0 flex-1 pt-2">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
              {filteredMovies.map((movie, index) => <MovieCard key={movie.id} movie={movie} isPremium={index % 3 === 0} onClick={() => setSelectedMovie(movie)} isActive={selectedMovie?.id === movie.id} />)}
              {filteredMovies.length === 0 && <div className="col-span-full py-20 text-center font-bold text-[color:var(--muted-foreground)]">No movies found for &quot;{activeFilter}&quot;</div>}
            </div>
          </div>
          <div className="sticky top-4 hidden h-[calc(100vh-2rem)] w-[400px] shrink-0 overflow-y-auto rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] p-5 shadow-xl transition-colors 2xl:w-[440px] xl:block">
            <RightSidebarContent
              movie={selectedMovie}
              onClose={() => featuredMovie && setSelectedMovie(featuredMovie)}
              moreMovies={moreMovies}
              seriesEpisodes={seriesEpisodes}
              onSelectMovie={setSelectedMovie}
              detailsHref={movieDetailsHref(selectedMovie || featuredMovie || movies[0])}
            />
          </div>
        </div>
      </div>
      <div className="xl:hidden">
        {selectedMovie && selectedMovie.id !== featuredMovie?.id && <MovieDetailSheet movie={selectedMovie} seriesEpisodes={seriesEpisodes} onSelectMovie={setSelectedMovie} onClose={() => featuredMovie && setSelectedMovie(featuredMovie)} onWatchNow={handleWatchMovie} />}
      </div>
      <style jsx global>{`
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.25s ease-out; }
      `}</style>
    </>
  );
}
