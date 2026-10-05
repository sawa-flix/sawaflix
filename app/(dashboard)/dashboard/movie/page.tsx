'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, Play } from 'lucide-react';
import {
  MovieCard,
  RightSidebarContent,
  MovieDetailSheet,
  FILTERS,
  Movie,
} from '@/components/Movie';
import MovieHeroBanner from '@/components/Movie/MovieHeroBanner';
import { fetchCuratedMovies } from '@/components/Movie/movieApi';
import { formatMovieTime, getLastMovieProgress, MOVIE_PROGRESS_EVENT, type MovieProgressEntry } from '@/components/Movie/movieProgress';

export default function MoviePage(): React.ReactElement {
  const router = useRouter();
  const searchParams = useSearchParams();
  const movieQuery = (searchParams.get('q') || '').trim().toLowerCase();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [genres, setGenres] = useState<string[]>(FILTERS);
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastProgress, setLastProgress] = useState<MovieProgressEntry | null>(null);

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

  useEffect(() => {
    const refreshProgress = () => setLastProgress(getLastMovieProgress());
    refreshProgress();
    window.addEventListener(MOVIE_PROGRESS_EVENT, refreshProgress);
    window.addEventListener('storage', refreshProgress);
    return () => {
      window.removeEventListener(MOVIE_PROGRESS_EVENT, refreshProgress);
      window.removeEventListener('storage', refreshProgress);
    };
  }, []);

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

  useEffect(() => {
    if (!featuredMovie) {
      setFeaturedIndex(0);
      return;
    }

    const targetIndex = matchingMovies.findIndex((movie) => movie.id === featuredMovie.id);
    if (targetIndex >= 0) {
      setFeaturedIndex(targetIndex);
    }
  }, [featuredMovie, matchingMovies]);

  const heroMovie = matchingMovies[featuredIndex] || featuredMovie;

  const filteredMovies = useMemo(() => {
    const catalog = matchingMovies.filter((movie) => movie.id !== featuredMovie?.id);
    return activeFilter === 'All' ? catalog : catalog.filter((movie) => movie.genres.includes(activeFilter));
  }, [matchingMovies, activeFilter, featuredMovie]);

  const moreMovies = useMemo(
    () => movies.filter((movie) => movie.id !== selectedMovie?.id).slice(0, 6),
    [movies, selectedMovie]
  );

  const recommendedMovies = useMemo(
    () => (matchingMovies.length > 0 ? matchingMovies.slice(0, 8) : movies.slice(0, 8)),
    [matchingMovies, movies]
  );
  const continueMovie = useMemo(
    () => lastProgress ? movies.find((movie) => movie.id === lastProgress.movieId) || null : null,
    [lastProgress, movies]
  );

  const seriesEpisodes = useMemo(() => {
    if (!selectedMovie?.seriesId) return [];
    return movies
      .filter((movie) => movie.seriesId === selectedMovie.seriesId && movie.mediaKind === 'episode')
      .sort((a, b) => (a.seasonNumber || 1) - (b.seasonNumber || 1) || (a.episodeNumber || 0) - (b.episodeNumber || 0));
  }, [movies, selectedMovie]);
  const sidebarMovie = selectedMovie || featuredMovie;

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

        {heroMovie && (!movieQuery || matchingMovies.length > 0) && (
          <MovieHeroBanner
            movie={heroMovie}
            detailsHref={movieDetailsHref(heroMovie)}
            slideIndex={featuredIndex}
            slideCount={Math.max(1, matchingMovies.length)}
            onPrevious={() => setFeaturedIndex((current) => (matchingMovies.length === 0 ? 0 : (current - 1 + matchingMovies.length) % matchingMovies.length))}
            onNext={() => setFeaturedIndex((current) => (matchingMovies.length === 0 ? 0 : (current + 1) % matchingMovies.length))}
          />
        )}

        {continueMovie && lastProgress && (
          <section className="space-y-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[color:var(--muted-foreground)]">Pick up where you left off</p>
              <h2 className="mt-1 text-xl font-bold text-[color:var(--foreground)]">Continue watching</h2>
            </div>
            <button
              type="button"
              onClick={() => router.push(movieDetailsHref(continueMovie))}
              className="group flex w-full max-w-2xl cursor-pointer items-center gap-3 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] p-2 text-left transition-colors hover:bg-[color:var(--surface-hover)] sm:gap-4 sm:p-3"
            >
              <span className="relative block aspect-video w-32 shrink-0 overflow-hidden rounded-lg bg-black sm:w-48">
                <Image src={continueMovie.image} alt={continueMovie.title} fill sizes="192px" unoptimized className="object-cover transition-transform duration-300 group-hover:scale-105" />
                <span className="absolute inset-0 flex items-center justify-center bg-black/25 text-white"><Play size={25} fill="currentColor" /></span>
                <span className="absolute inset-x-0 bottom-0 h-1 bg-white/30">
                  <span className="block h-full bg-[color:var(--primary)]" style={{ width: `${lastProgress.duration > 0 ? Math.min(100, lastProgress.currentTime / lastProgress.duration * 100) : 0}%` }} />
                </span>
              </span>
              <span className="min-w-0 flex-1">
                <span className="block line-clamp-2 text-sm font-bold text-[color:var(--foreground)] sm:text-base">{continueMovie.episodeTitle || continueMovie.title}</span>
                <span className="mt-1 block text-xs text-[color:var(--muted-foreground)]">Resume from {formatMovieTime(lastProgress.currentTime)}{lastProgress.duration > 0 ? ` · ${formatMovieTime(lastProgress.duration - lastProgress.currentTime)} left` : ''}</span>
              </span>
              <span className="hidden shrink-0 rounded-lg bg-[color:var(--primary)] px-3 py-2 text-xs font-bold text-white sm:inline-flex">Resume</span>
            </button>
          </section>
        )}

        {continueMovie && lastProgress && (
          <section className="space-y-3" aria-label="Continue watching">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[color:var(--muted-foreground)]">Pick up where you left off</p>
              <h2 className="mt-1 text-xl font-bold text-[color:var(--foreground)]">Continue watching</h2>
            </div>
            <button
              type="button"
              onClick={() => router.push(movieDetailsHref(continueMovie))}
              className="group flex w-full max-w-2xl cursor-pointer items-center gap-3 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] p-2 text-left transition-colors hover:bg-[color:var(--surface-hover)] sm:gap-4 sm:p-3"
            >
              <span className="relative block aspect-video w-32 shrink-0 overflow-hidden rounded-lg bg-black sm:w-48">
                <Image src={continueMovie.image} alt={continueMovie.title} fill sizes="192px" unoptimized className="object-cover transition-transform duration-300 group-hover:scale-105" />
                <span className="absolute inset-0 flex items-center justify-center bg-black/25 text-white"><span className="text-lg font-black">▶</span></span>
                <span className="absolute inset-x-0 bottom-0 h-1 bg-white/30">
                  <span className="block h-full bg-[color:var(--primary)]" style={{ width: `${lastProgress.duration > 0 ? Math.min(100, lastProgress.currentTime / lastProgress.duration * 100) : 0}%` }} />
                </span>
              </span>
              <span className="min-w-0 flex-1">
                <span className="block line-clamp-2 text-sm font-bold text-[color:var(--foreground)] sm:text-base">{continueMovie.episodeTitle || continueMovie.title}</span>
                <span className="mt-1 block text-xs text-[color:var(--muted-foreground)]">Resume from {formatMovieTime(lastProgress.currentTime)}{lastProgress.duration > 0 ? ` · ${formatMovieTime(lastProgress.duration - lastProgress.currentTime)} left` : ''}</span>
              </span>
              <span className="hidden shrink-0 rounded-lg bg-[color:var(--primary)] px-3 py-2 text-xs font-bold text-white sm:inline-flex">Resume</span>
            </button>
          </section>
        )}

        {recommendedMovies.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between gap-3 px-1">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[color:var(--muted-foreground)]">Recommended</p>
                <h2 className="mt-1 text-xl font-bold text-[color:var(--foreground)]">For you</h2>
              </div>
              <button type="button" className="hidden rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-1.5 text-xs font-bold text-[color:var(--foreground)] sm:inline-flex">
                Browse all
              </button>
            </div>
            <div className="scrollbar-hide overflow-x-auto pb-2">
              <div className="flex min-w-max gap-4 pr-2">
                {recommendedMovies.map((movie) => (
                  <div key={movie.id} className="w-[180px] sm:w-[210px]">
                    <MovieCard
                      movie={movie}
                      isPremium={Boolean(movie.isPremium)}
                      onClick={() => setSelectedMovie(movie)}
                      isActive={selectedMovie?.id === movie.id}
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {movieQuery && matchingMovies.length === 0 && <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] px-5 py-8 text-center text-sm font-semibold text-[color:var(--muted-foreground)]">No movies found for &quot;{searchParams.get('q')}&quot;.</div>}
        {!loading && error && movies.length === 0 && !movieQuery && <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] px-5 py-10 text-center"><p className="text-sm font-semibold text-[color:var(--foreground)]">The SawaFlix movie catalog is unavailable right now.</p><p className="mt-1 text-xs text-[color:var(--muted-foreground)]">Please try again shortly.</p></div>}

        <div className="flex flex-col gap-6 lg:gap-8 xl:flex-row">
          <div className="min-w-0 flex-1 pt-2">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
              {filteredMovies.map((movie) => <MovieCard key={movie.id} movie={movie} isPremium={Boolean(movie.isPremium)} onClick={() => setSelectedMovie(movie)} isActive={selectedMovie?.id === movie.id} />)}
              {filteredMovies.length === 0 && <div className="col-span-full py-20 text-center font-bold text-[color:var(--muted-foreground)]">No movies found for &quot;{activeFilter}&quot;</div>}
            </div>
          </div>
          {sidebarMovie && (
            <div className="sticky top-4 hidden h-[calc(100vh-2rem)] w-[400px] shrink-0 overflow-y-auto rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] p-5 shadow-xl transition-colors 2xl:w-[440px] xl:block">
              <RightSidebarContent
                movie={sidebarMovie}
                onClose={() => featuredMovie && setSelectedMovie(featuredMovie)}
                moreMovies={moreMovies}
                seriesEpisodes={seriesEpisodes}
                onSelectMovie={setSelectedMovie}
                detailsHref={movieDetailsHref(sidebarMovie)}
              />
            </div>
          )}
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
