'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, Play, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MovieCard,
  RightSidebarContent,
  MovieDetailSheet,
  FILTERS,
  Movie,
} from '@/components/Movie';
import MovieHeroBanner from '@/components/Movie/MovieHeroBanner';
import { fetchCuratedMovies } from '@/components/Movie/movieApi';
import { formatMovieTime, getLastMovieProgress, MOVIE_PROGRESS_EVENT, clearMovieProgress, type MovieProgressEntry } from '@/components/Movie/movieProgress';

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
  const [showAnnouncement, setShowAnnouncement] = useState(true);
  const [dismissedContinueWatching, setDismissedContinueWatching] = useState(false);

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

  // Countdown timer for announcement
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const targetDate = new Date('2026-11-01T00:00:00').getTime();
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        clearInterval(timer);
        return;
      }

      setCountdown({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Check if announcement was dismissed
  useEffect(() => {
    const dismissed = localStorage.getItem('movie-announcement-dismissed');
    if (dismissed) setShowAnnouncement(false);
  }, []);

  const handleDismissAnnouncement = () => {
    setShowAnnouncement(false);
    localStorage.setItem('movie-announcement-dismissed', 'true');
  };

  const handleRemoveContinueWatching = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lastProgress?.movieId) {
      clearMovieProgress(lastProgress.movieId);
      setDismissedContinueWatching(true);
      setLastProgress(null);
    }
  };

  return (
    <>
      {/* Announcement Banner */}
      <AnimatePresence>
        {showAnnouncement && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-16 left-0 right-0 z-50 mx-auto max-w-7xl px-4"
          >
            <div className="relative overflow-hidden rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-red-500/10 backdrop-blur-xl shadow-2xl">
              <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5 mix-blend-overlay" />
              <div className="relative px-6 py-4 sm:px-8 sm:py-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg">
                      <Sparkles className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-[color:var(--foreground)] sm:text-xl">
                          Coming Soon: "The Lion's Heart"
                        </h3>
                        <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-400">
                          Premiere
                        </span>
                      </div>
                      <p className="text-sm text-[color:var(--muted-foreground)] sm:text-base">
                        A powerful tale of courage and tradition. Be among the first to watch this epic Cameroonian production.
                      </p>
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="flex gap-2 sm:gap-3">
                          {[
                            { label: 'Days', value: countdown.days },
                            { label: 'Hours', value: countdown.hours },
                            { label: 'Min', value: countdown.minutes },
                            { label: 'Sec', value: countdown.seconds }
                          ].map((item) => (
                            <div key={item.label} className="flex flex-col items-center">
                              <span className="text-xl font-black tabular-nums text-[color:var(--foreground)] sm:text-2xl">
                                {String(item.value).padStart(2, '0')}
                              </span>
                              <span className="text-[9px] font-medium uppercase tracking-wide text-[color:var(--muted-foreground)] sm:text-[10px]">
                                {item.label}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleDismissAnnouncement}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[color:var(--muted-foreground)] transition-colors hover:bg-white/10 hover:text-[color:var(--foreground)]"
                    aria-label="Dismiss announcement"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`movie-page-root mx-auto flex min-h-screen w-full max-w-[1920px] flex-col gap-6 pb-20 text-[color:var(--foreground)] lg:gap-8 ${showAnnouncement ? 'pt-28 sm:pt-32' : ''}`}>
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

        {continueMovie && lastProgress && !dismissedContinueWatching && (
          <section className="space-y-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[color:var(--muted-foreground)]">Pick up where you left off</p>
              <h2 className="mt-1 text-xl font-bold text-[color:var(--foreground)]">Continue watching</h2>
            </div>
            <div className="relative group">
              <button
                type="button"
                onClick={() => router.push(movieDetailsHref(continueMovie))}
                className="flex w-full max-w-3xl cursor-pointer items-center gap-4 rounded-2xl border border-[color:var(--border)] bg-gradient-to-br from-[color:var(--surface)] to-[color:var(--surface)]/80 p-3 text-left shadow-lg backdrop-blur-sm transition-all hover:shadow-xl hover:border-[color:var(--foreground)]/20 sm:gap-5 sm:p-4"
              >
                <span className="relative block aspect-video w-36 shrink-0 overflow-hidden rounded-xl bg-black shadow-md sm:w-56">
                  <Image
                    src={continueMovie.image}
                    alt={continueMovie.title}
                    fill
                    sizes="224px"
                    unoptimized
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-lg transition-transform group-hover:scale-110">
                      <Play size={24} fill="currentColor" className="ml-1 text-black" />
                    </span>
                  </span>
                  <span className="absolute inset-x-0 bottom-0 h-1.5 bg-white/20 backdrop-blur-sm">
                    <span
                      className="block h-full bg-gradient-to-r from-blue-500 to-purple-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                      style={{ width: `${lastProgress.duration > 0 ? Math.min(100, lastProgress.currentTime / lastProgress.duration * 100) : 0}%` }}
                    />
                  </span>
                </span>
                <span className="min-w-0 flex-1 space-y-2">
                  <span className="block line-clamp-2 text-base font-bold text-[color:var(--foreground)] sm:text-lg">
                    {continueMovie.episodeTitle || continueMovie.title}
                  </span>
                  <span className="flex items-center gap-2 text-xs text-[color:var(--muted-foreground)]">
                    <span className="rounded-full bg-blue-500/10 px-2.5 py-1 font-semibold text-blue-400">
                      {Math.round((lastProgress.currentTime / lastProgress.duration) * 100)}% watched
                    </span>
                    <span>•</span>
                    <span>Resume from {formatMovieTime(lastProgress.currentTime)}</span>
                    {lastProgress.duration > 0 && (
                      <>
                        <span>•</span>
                        <span>{formatMovieTime(lastProgress.duration - lastProgress.currentTime)} left</span>
                      </>
                    )}
                  </span>
                </span>
                <span className="hidden shrink-0 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 px-5 py-3 text-sm font-bold text-white shadow-lg transition-transform hover:scale-105 sm:inline-flex">
                  Resume
                </span>
              </button>

              {/* Close button */}
              <button
                onClick={handleRemoveContinueWatching}
                className="absolute -right-2 -top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--muted-foreground)] shadow-lg backdrop-blur-sm transition-all hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/50 hover:scale-110"
                aria-label="Remove from continue watching"
              >
                <X size={16} />
              </button>
            </div>
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
