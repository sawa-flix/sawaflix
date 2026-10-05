'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Globe2,
  Play,
  Star,
  Users,
  Volume2,
  Eye,
  Check
} from 'lucide-react';
import type { Movie } from '@/components/Movie';
import { fetchCuratedMovies } from '@/components/Movie/movieApi';
import { MovieViewerPresence } from '@/components/Movie/MovieViewerPresence';
import MovieVideoPlayer from '@/components/Movie/MovieVideoPlayer';
import { MovieCard, MovieEpisodeGuide } from '@/components/Movie';
import PremiumPreviewCheckout from '@/components/Movie/PremiumPreviewCheckout';
import { clearMovieProgress, formatMovieTime, getMovieProgress, type MovieProgressEntry } from '@/components/Movie/movieProgress';

const MOVIE_SELECTION_EVENT = 'sawaflix:movie-selection';

export default function MovieDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const movieId = decodeURIComponent(params.id);
  const [selectedRouteId, setSelectedRouteId] = useState(movieId);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showDescriptionFull, setShowDescriptionFull] = useState(false);
  const [showEpisodeDescription, setShowEpisodeDescription] = useState(false);
  const [autoplayEnabled, setAutoplayEnabled] = useState(true);
  const [showPremiumCheckout, setShowPremiumCheckout] = useState(false);
  const [unlockedPremiumIds, setUnlockedPremiumIds] = useState<Set<string>>(() => new Set());
  const [playerResumeToken, setPlayerResumeToken] = useState(0);
  const [savedProgress, setSavedProgress] = useState<MovieProgressEntry | null>(null);
  const [startFromSeconds, setStartFromSeconds] = useState(0);

  const episodeScrollRef = useRef<HTMLDivElement>(null);
  const autoAdvanceStartedRef = useRef(false);
  const lastProgressRenderRef = useRef(0);

  useEffect(() => {
    setSelectedRouteId(movieId);
  }, [movieId]);

  useEffect(() => {
    const syncFromHistory = () => {
      const routeMatch = window.location.pathname.match(/\/dashboard\/movie\/([^/]+)/);
      if (routeMatch) setSelectedRouteId(decodeURIComponent(routeMatch[1]));
    };
    window.addEventListener('popstate', syncFromHistory);
    return () => window.removeEventListener('popstate', syncFromHistory);
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchCuratedMovies()
      .then((catalog) => {
        if (cancelled) return;
        setMovies(catalog);
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (movies.length === 0) return;
    const routeMovie = movies.find((movie) => movie.id === selectedRouteId) || null;
    setSelectedMovie(routeMovie);
  }, [movies, selectedRouteId]);

  useEffect(() => {
    autoAdvanceStartedRef.current = false;
    setCurrentTime(0);
    setDuration(0);
    setShowPremiumCheckout(false);
    const routeMovie = movies.find((movie) => movie.id === selectedRouteId);
    const routePlayable = routeMovie?.mediaKind === 'series'
      ? movies.find((movie) => movie.seriesId === routeMovie.seriesId && movie.mediaKind === 'episode')
      : routeMovie;
    const progress = routePlayable ? getMovieProgress(routePlayable.id) : null;
    setSavedProgress(progress);
    setStartFromSeconds(progress?.currentTime || 0);
  }, [selectedRouteId, movies]);

  const seriesEpisodes = useMemo(() => {
    if (!selectedMovie?.seriesId) return [];
    return movies
      .filter((movie) => movie.seriesId === selectedMovie.seriesId && movie.mediaKind === 'episode')
      .sort((a, b) => (a.seasonNumber || 1) - (b.seasonNumber || 1) || (a.episodeNumber || 0) - (b.episodeNumber || 0));
  }, [movies, selectedMovie]);

  const similarMovies = useMemo(() => {
    if (!selectedMovie) return [];
    return movies
      .filter((movie) => movie.id !== selectedMovie.id && movie.mediaKind !== 'episode' && movie.seriesId !== selectedMovie.seriesId)
      .map((movie) => ({ movie, overlap: movie.genres.filter((genre) => selectedMovie.genres.includes(genre)).length }))
      .sort((a, b) => b.overlap - a.overlap || Number(b.movie.featured) - Number(a.movie.featured))
      .slice(0, 8)
      .map(({ movie }) => movie);
  }, [movies, selectedMovie]);

  const firstEpisode = seriesEpisodes[0];
  const selectedEpisodeIndex = seriesEpisodes.findIndex((episode) => episode.id === selectedMovie?.id);
  const nextEpisode = selectedEpisodeIndex >= 0
    ? seriesEpisodes[selectedEpisodeIndex + 1]
    : selectedMovie?.mediaKind === 'series' ? firstEpisode : undefined;
  const activePlaybackId = selectedMovie?.mediaKind === 'series' ? firstEpisode?.id : selectedMovie?.id;

  const selectMovieInPlace = useCallback((movie: Movie) => {
    const nextUrl = `/dashboard/movie/${encodeURIComponent(movie.id)}`;
    if (window.location.pathname !== nextUrl) window.history.pushState(null, '', nextUrl);
    setSelectedRouteId(movie.id);
    setSelectedMovie(movie);
    autoAdvanceStartedRef.current = false;
    setCurrentTime(0);
    setDuration(0);
    setShowPremiumCheckout(false);
    const playable = movie.mediaKind === 'series'
      ? movies.find((candidate) => candidate.seriesId === movie.seriesId && candidate.mediaKind === 'episode')
      : movie;
    const progress = playable ? getMovieProgress(playable.id) : null;
    setSavedProgress(progress);
    setStartFromSeconds(progress?.currentTime || 0);
  }, [movies]);

  useEffect(() => {
    const onMovieSelection = (event: Event) => {
      const customEvent = event as CustomEvent<{ movieId: string }>;
      const movie = movies.find((item) => item.id === customEvent.detail?.movieId);
      if (movie) selectMovieInPlace(movie);
    };
    window.addEventListener(MOVIE_SELECTION_EVENT, onMovieSelection);
    return () => window.removeEventListener(MOVIE_SELECTION_EVENT, onMovieSelection);
  }, [movies, selectMovieInPlace]);

  const handleSelectEpisode = useCallback((episode: Movie) => {
    selectMovieInPlace(episode);
  }, [selectMovieInPlace]);

  const handlePlayNextEpisode = useCallback(() => {
    if (!nextEpisode) return;
    handleSelectEpisode(nextEpisode);
    setIsVideoPlaying(true);
    setIsPlaying(true);
  }, [handleSelectEpisode, nextEpisode]);

  const handlePlayerEnded = useCallback(() => {
    setIsVideoPlaying(false);
    if (autoplayEnabled && nextEpisode) handlePlayNextEpisode();
  }, [autoplayEnabled, handlePlayNextEpisode, nextEpisode]);

  const shouldAutoAdvance = autoplayEnabled && Boolean(nextEpisode) && duration > 0 && duration - currentTime <= 12;

  useEffect(() => {
    if (!shouldAutoAdvance || autoAdvanceStartedRef.current || !nextEpisode) return;
    autoAdvanceStartedRef.current = true;
    const timer = window.setTimeout(handlePlayNextEpisode, 12_000);
    return () => window.clearTimeout(timer);
  }, [handlePlayNextEpisode, nextEpisode, shouldAutoAdvance]);

  const handlePlayerProgress = useCallback((actualTime: number, actualDuration: number) => {
    const now = Date.now();
    if (now - lastProgressRenderRef.current < 1500 && actualTime < actualDuration) return;
    lastProgressRenderRef.current = now;
    setCurrentTime(actualTime);
    if (actualDuration > 0) setDuration(actualDuration);
    setSavedProgress(activePlaybackId ? getMovieProgress(activePlaybackId) : null);
  }, [activePlaybackId]);

  const handlePremiumPaymentSuccess = () => {
    if (!selectedMovie) return;
    setUnlockedPremiumIds((previous) => new Set(previous).add(selectedMovie.id));
    setShowPremiumCheckout(false);
    setPlayerResumeToken((token) => token + 1);
    setIsVideoPlaying(true);
    setIsPlaying(true);
  };

  const closePremiumCheckout = () => {
    setShowPremiumCheckout(false);
    setIsVideoPlaying(false);
    setIsPlaying(false);
  };

  const scrollEpisodes = (direction: 'left' | 'right') => {
    if (!episodeScrollRef.current) return;
    const scrollAmount = 300;
    episodeScrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  const currentProgress = duration > 0 ? Math.min(100, Math.round((currentTime / duration) * 100)) : 0;

  if (loading || (!isPlaying && movies.some((movie) => movie.id === selectedRouteId) && selectedMovie?.id !== selectedRouteId)) {
    return (
      <div className="mx-auto w-full max-w-[1080px] space-y-5 px-3 py-5 sm:px-6" aria-label="Loading movie details">
        <div className="h-9 w-36 animate-pulse rounded-lg bg-[color:var(--surface-hover)]" />
        <div className="aspect-video w-full animate-pulse rounded-xl bg-[color:var(--surface-hover)]" />
        <div className="space-y-3 px-1">
          <div className="h-6 w-2/3 animate-pulse rounded bg-[color:var(--surface-hover)]" />
          <div className="h-3 w-1/2 animate-pulse rounded bg-[color:var(--surface-hover)]" />
          <div className="h-3 w-4/5 animate-pulse rounded bg-[color:var(--surface-hover)]" />
        </div>
      </div>
    );
  }

  if (loadError || !selectedMovie) {
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center gap-4 px-5 text-center bg-[color:var(--background)]">
        <h1 className="text-xl font-bold text-[color:var(--foreground)]">
          {loadError ? 'Movie details are unavailable' : 'This title is no longer available'}
        </h1>
        <Link
          href="/dashboard/movie"
          className="cursor-pointer rounded-lg bg-[color:var(--primary)] px-4 py-2 text-sm font-bold text-white hover:opacity-90 transition-opacity"
        >
          Back to movies
        </Link>
      </main>
    );
  }

  const playableMovie = selectedMovie.mediaKind === 'series' && firstEpisode ? firstEpisode : selectedMovie;
  const playableId = playableMovie.id;
  const title = playableMovie.episodeTitle || playableMovie.title;
  const description = selectedMovie.description?.trim() || '';
  const shortDescription = description.length > 180 ? description.slice(0, 180) + '...' : description;

  return (
    <>
      {isPlaying ? (
        <div
          className="watch-player relative mx-auto w-full max-w-[1080px] pb-8 pt-3 text-[color:var(--foreground)] sm:pt-5"
        >
          <div className="w-full">
            <div className="w-full">
              <div
                className="relative aspect-video w-full overflow-hidden rounded-md bg-black shadow-[0_22px_70px_rgba(0,0,0,0.28)] sm:rounded-xl"
              >
              <MovieVideoPlayer
                videoId={playableId}
                title={title}
                poster={playableMovie.image}
                playing={isPlaying}
                resumeToken={playerResumeToken}
                initialResumeSeconds={startFromSeconds}
                previewLimitSeconds={selectedMovie.isPremium && !unlockedPremiumIds.has(selectedMovie.id) ? 8 : undefined}
                onPreviewLimitReached={() => setShowPremiumCheckout(true)}
                onClose={() => { setIsVideoPlaying(false); setIsPlaying(false); }}
                onProgress={handlePlayerProgress}
                onPlaybackStateChange={setIsVideoPlaying}
                onEnded={handlePlayerEnded}
              />
              <MovieViewerPresence movieId={playableId} mode="track-display" active={isPlaying && isVideoPlaying} />
              </div>
            </div>

            {/* Episode Description Section */}
            <div className="min-h-0 flex-1 overflow-y-auto border-t border-[color:var(--border)] bg-[color:var(--background)] text-[color:var(--foreground)]">
              <div className="w-full px-1 py-4 sm:py-5">
                {/* Main Content Header */}
                <div className="mb-4">
                  <div className="mb-2 flex items-start justify-between">
                    <div className="flex-1">
                      <h1 className="mb-2 text-xl font-bold text-[color:var(--foreground)] sm:text-2xl">{selectedMovie.seriesTitle || selectedMovie.title}</h1>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-[color:var(--muted-foreground)] sm:gap-3 sm:text-sm">
                        <span>Season {selectedMovie.seasonNumber || 1}</span>
                        <span>·</span>
                        <span>Episode {selectedMovie.episodeNumber || 1}</span>
                        <span>·</span>
                        <span>{selectedMovie.duration || '25m'}</span>
                        <span>·</span>
                        <span>{selectedMovie.country}</span>
                        <span>·</span>
                        <span>{selectedMovie.language || 'English / French'}</span>
                        <span>·</span>
                        <span>{selectedMovie.genres[0]}</span>
                      </div>
                    </div>
                  </div>

                  {/* Progress and Stats */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:gap-x-6 sm:text-sm">
                    <div className="flex items-center gap-2">
                      <Eye size={16} className="text-[color:var(--muted-foreground)]" />
                      <span className="text-[color:var(--muted-foreground)]">You&apos;re <strong className="text-[color:var(--foreground)]">{currentProgress}% through</strong></span>
                    </div>
                    <MovieViewerPresence movieId={playableId} mode="track-display" active={isPlaying && isVideoPlaying} />
                  </div>
                </div>

                {/* Episode Description */}
                {description && (
                  <div className="mb-5">
                    <button
                      type="button"
                      onClick={() => setShowEpisodeDescription(!showEpisodeDescription)}
                      className="mb-2 flex items-center gap-2 text-sm font-semibold text-[color:var(--foreground)] transition-opacity hover:opacity-75"
                      aria-expanded={showEpisodeDescription}
                    >
                      <span>Episode description</span>
                      <ChevronDown size={18} className={`transition-transform ${showEpisodeDescription ? 'rotate-180' : ''}`} />
                    </button>
                    <p className={`text-sm leading-relaxed text-[color:var(--muted-foreground)] ${showEpisodeDescription ? '' : 'line-clamp-2'}`}>
                      {description}
                    </p>
                  </div>
                )}

                {/* Episodes Carousel */}
                {seriesEpisodes.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-bold text-[color:var(--foreground)]">Season {selectedMovie.seasonNumber || 1}</h2>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[color:var(--muted-foreground)] sm:text-sm">{seriesEpisodes.length} episodes</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => scrollEpisodes('left')}
                            className="p-1.5 hover:bg-white/10 rounded transition-colors"
                          >
                            <ChevronLeft size={20} className="text-[color:var(--foreground)]" />
                          </button>
                          <button
                            onClick={() => scrollEpisodes('right')}
                            className="p-1.5 hover:bg-white/10 rounded transition-colors"
                          >
                            <ChevronRight size={20} className="text-[color:var(--foreground)]" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div
                      ref={episodeScrollRef}
                      className="scrollbar-hide -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-3 sm:-mx-6 sm:px-6"
                      style={{ scrollbarWidth: 'none' }}
                    >
                      {seriesEpisodes.map((episode, index) => {
                        const isCurrentEpisode = episode.id === selectedMovie.id;
                        const episodeProgress = isCurrentEpisode ? currentProgress : index < selectedEpisodeIndex ? 100 : 0;
                        const isWatched = episodeProgress === 100;

                        return (
                          <button
                            key={episode.id}
                            onClick={() => handleSelectEpisode(episode)}
                            className={`group w-36 shrink-0 snap-start rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] p-1.5 text-left transition-colors hover:bg-[color:var(--surface-hover)] sm:w-44 lg:w-48 ${
                                isCurrentEpisode ? 'ring-1 ring-[color:var(--foreground)]' : ''
                            }`}
                          >
                              <div className="relative mb-1.5 aspect-video overflow-hidden rounded-md">
                              <Image
                                src={episode.image}
                                alt={episode.title}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                                unoptimized
                              />
                              {isCurrentEpisode && (
                                <div className="absolute top-2 left-2">
                                  <span className="rounded bg-[color:var(--foreground)] px-2 py-1 text-[10px] font-bold uppercase text-[color:var(--background)]">
                                    NOW PLAYING
                                  </span>
                                </div>
                              )}
                              {!isCurrentEpisode && index === selectedEpisodeIndex + 1 && (
                                <div className="absolute top-2 left-2">
                                  <span className="rounded border border-white/30 bg-black/70 px-2 py-1 text-[10px] font-bold uppercase text-white">
                                    UP NEXT
                                  </span>
                                </div>
                              )}
                              {isWatched && !isCurrentEpisode && (
                                <div className="absolute top-2 right-2">
                                  <div className="p-1 bg-black/80 rounded-full">
                                    <Check size={16} className="text-emerald-400" />
                                  </div>
                                </div>
                              )}
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Play size={28} className="text-white" fill="white" />
                              </div>
                              {episodeProgress > 0 && episodeProgress < 100 && (
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                                  <div
                                    className="h-full bg-[color:var(--foreground)]"
                                    style={{ width: `${episodeProgress}%` }}
                                  />
                                </div>
                              )}
                              <div className="absolute bottom-2 right-2">
                                <span className="px-1.5 py-0.5 bg-black/80 text-white text-xs font-bold rounded">
                                  {episode.duration || '25m'}
                                </span>
                              </div>
                            </div>
                            <div className="px-0.5 pb-0.5">
                              <div className="mb-1 flex items-center justify-between gap-1">
                                <h3 className="line-clamp-1 flex-1 text-xs font-semibold text-[color:var(--foreground)] sm:text-sm">
                                  {episode.episodeNumber}. {episode.episodeTitle || episode.title}
                                </h3>
                                {isWatched && (
                                  <Check size={16} className="ml-2 flex-shrink-0 text-[color:var(--muted-foreground)]" />
                                )}
                              </div>
                              <div className="flex items-center justify-between text-[10px] text-[color:var(--muted-foreground)]">
                                <span>{episode.duration || '25m'}</span>
                                <span>{isWatched ? 'Watched' : episodeProgress > 0 ? `${episodeProgress}% watched` : `Episode ${episode.episodeNumber || index + 1}`}</span>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Continue Automatically Toggle */}
                    <div className="mt-4 flex items-center justify-end border-t border-[color:var(--border)] pt-4">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <span className="text-sm text-[color:var(--foreground)]">Continue automatically</span>
                        <button
                          onClick={() => setAutoplayEnabled(!autoplayEnabled)}
                          className={`relative w-11 h-6 rounded-full transition-colors ${
                            autoplayEnabled ? 'bg-[color:var(--foreground)]' : 'bg-[color:var(--surface-hover)]'
                          }`}
                        >
                          <span
                            className={`absolute left-1 top-1 h-4 w-4 rounded-full bg-[color:var(--background)] transition-transform ${
                              autoplayEnabled ? 'translate-x-5' : ''
                            }`}
                          />
                        </button>
                      </label>
                    </div>
                  </div>
                )}

                {similarMovies.length > 0 && (
                  <section className="mt-6 border-t border-[color:var(--border)] pt-5">
                    <div className="mb-3 flex items-end justify-between gap-3">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[color:var(--muted-foreground)]">Curated for you</p>
                        <h2 className="mt-1 text-base font-bold text-[color:var(--foreground)] sm:text-lg">More like this</h2>
                      </div>
                      <span className="text-xs text-[color:var(--muted-foreground)]">{similarMovies.length} titles</span>
                    </div>
                    <div className="scrollbar-hide -mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-2">
                      {similarMovies.map((movie) => (
                        <button
                          key={movie.id}
                          type="button"
                          onClick={() => selectMovieInPlace(movie)}
                          className="group w-36 shrink-0 snap-start cursor-pointer text-left sm:w-44"
                        >
                          <span className="relative mb-2 block aspect-video overflow-hidden rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)]">
                            <Image src={movie.image} alt={movie.title} fill sizes="176px" unoptimized className="object-cover transition-transform duration-300 group-hover:scale-105" />
                            <span className="absolute inset-0 flex items-center justify-center bg-black/20 text-white opacity-0 transition-opacity group-hover:opacity-100">
                              <Play size={24} fill="currentColor" />
                            </span>
                          </span>
                          <span className="block truncate text-xs font-bold text-[color:var(--foreground)] sm:text-sm">{movie.title}</span>
                          <span className="mt-1 block truncate text-[10px] text-[color:var(--muted-foreground)]">{movie.year} · {movie.genres[0] || 'Movie'}</span>
                        </button>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <main className="relative isolate mx-auto min-h-screen w-full max-w-[1600px] px-3 pb-16 sm:px-6 bg-[color:var(--background)]">
          <div
            aria-hidden="true"
            className="pointer-events-none fixed inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-30 mix-blend-screen"
            style={{ backgroundImage: "url('/logos_and_pwas/sawai.svg')" }}
          />
          <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 bg-gradient-to-b from-[color:var(--background)]/90 via-[color:var(--background)]/75 to-[color:var(--background)]/95" />

          <div className="relative z-10">
            <button
              type="button"
              onClick={() => router.push('/dashboard/movie')}
              className="mb-4 inline-flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-[color:var(--muted-foreground)] transition-colors hover:bg-[color:var(--surface-hover)] hover:text-[color:var(--foreground)]"
            >
              <ArrowLeft size={17} /> Back to movies
            </button>

            <section className="relative isolate min-h-[360px] overflow-hidden rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] sm:min-h-[440px]">
              <Image src={selectedMovie.image} alt="" fill priority unoptimized sizes="100vw" className="-z-20 object-cover" />
              <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/90 via-black/55 to-black/10" />
              <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/85 via-transparent to-black/15" />
              <div className="flex min-h-[360px] items-end p-5 sm:min-h-[440px] sm:p-10 lg:p-14">
                <div className="max-w-3xl">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span className="rounded bg-[color:var(--foreground)] px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-[color:var(--background)]">SawaFlix Cameroon</span>
                    {selectedMovie.mediaKind === 'episode' && (
                      <span className="rounded border border-white/40 bg-black/30 px-2.5 py-1 text-[10px] font-bold text-white">
                        Season {selectedMovie.seasonNumber || 1} · Episode {selectedMovie.episodeNumber || 1}
                      </span>
                    )}
                    {selectedMovie.mediaKind === 'series' && (
                      <span className="rounded border border-white/40 bg-black/30 px-2.5 py-1 text-[10px] font-bold text-white">Series</span>
                    )}
                  </div>
                  <h1 className="mb-3 text-3xl font-black leading-tight text-white sm:text-5xl">{title}</h1>
                  {selectedMovie.seriesTitle && <p className="mb-2 text-sm font-semibold text-white/75">{selectedMovie.seriesTitle}</p>}
                  <p className="mb-5 max-w-2xl line-clamp-3 text-sm leading-relaxed text-white/85 sm:text-base">{shortDescription}</p>
                  <div className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold text-white/80">
                    <span className="inline-flex items-center gap-1.5 text-[#FCD116]">
                      <Star size={14} fill="currentColor" />
                      <span className="text-white">{selectedMovie.rating || 4.8}</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar size={14} />
                      {selectedMovie.year}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Globe2 size={14} />
                      {selectedMovie.country}
                    </span>
                    {selectedMovie.duration && (
                      <span className="inline-flex items-center gap-1.5">
                        <Volume2 size={14} />
                        {selectedMovie.duration}
                      </span>
                    )}
                    {selectedMovie.language && (
                      <span className="inline-flex items-center gap-1.5">
                        <Users size={14} />
                        {selectedMovie.language}
                      </span>
                    )}
                    <span>{selectedMovie.genres.join(' · ')}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      autoAdvanceStartedRef.current = false;
                      setStartFromSeconds(savedProgress?.currentTime || 0);
                      setIsVideoPlaying(true);
                      setIsPlaying(true);
                    }}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-black text-black shadow-lg transition-transform hover:scale-[1.02] hover:bg-white/90"
                  >
                    <Play size={18} fill="currentColor" /> {savedProgress ? `Resume from ${formatMovieTime(savedProgress.currentTime)}` : selectedMovie.mediaKind === 'series' ? 'Start series' : 'Watch now'}
                  </button>
                  {savedProgress && (
                    <button
                      type="button"
                      onClick={() => {
                        if (activePlaybackId) clearMovieProgress(activePlaybackId);
                        setSavedProgress(null);
                        setStartFromSeconds(0);
                        autoAdvanceStartedRef.current = false;
                        setIsVideoPlaying(true);
                        setIsPlaying(true);
                      }}
                      className="ml-2 inline-flex cursor-pointer items-center gap-2 rounded-lg border border-white/45 bg-black/25 px-4 py-3 text-sm font-bold text-white backdrop-blur-sm transition-colors hover:bg-white/15"
                    >
                      Start over
                    </button>
                  )}
                </div>
              </div>
            </section>

            <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
              <div className="min-w-0 space-y-8">
                {description && (
                  <section className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)]/80 p-5 shadow-lg backdrop-blur-md sm:p-6">
                    <h2 className="mb-3 text-xl font-bold text-[color:var(--foreground)]">{selectedMovie.seriesTitle || selectedMovie.title}</h2>
                    <p className="max-w-4xl whitespace-pre-line text-sm leading-7 text-[color:var(--foreground-secondary)]">
                      {showDescriptionFull ? description : shortDescription}
                    </p>
                    {description.length > 180 && (
                      <button
                        type="button"
                        onClick={() => setShowDescriptionFull(!showDescriptionFull)}
                        className="mt-2 text-sm font-semibold text-[color:var(--primary)] hover:underline"
                      >
                        {showDescriptionFull ? 'Show less' : 'Read more'}
                      </button>
                    )}
                  </section>
                )}

                <section className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)]/70 p-5 backdrop-blur-md sm:p-6">
                  <h2 className="mb-4 text-lg font-bold text-[color:var(--foreground)]">Title details</h2>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <DetailFact label="Release year" value={String(selectedMovie.year)} />
                    <DetailFact label="Country" value={selectedMovie.country} />
                    <DetailFact label="Runtime" value={selectedMovie.duration || 'Not listed'} />
                    <DetailFact label="Language" value={selectedMovie.language || 'Not listed'} />
                    <DetailFact label="Genre" value={selectedMovie.genres.join(', ') || 'Drama'} />
                    <DetailFact label="Rating" value={`${selectedMovie.rating || 4.8} / 5`} />
                    {selectedMovie.director && <DetailFact label="From" value={selectedMovie.director} />}
                    {selectedMovie.stars && <DetailFact label="Featured artists" value={selectedMovie.stars} />}
                  </div>
                </section>

                {seriesEpisodes.length > 0 && (
                  <section>
                    <h2 className="mb-4 text-lg font-bold text-[color:var(--foreground)]">Episodes and seasons</h2>
                    <MovieEpisodeGuide
                      key={`${selectedMovie.seriesId}-${selectedMovie.id}`}
                      movie={selectedMovie}
                      episodes={seriesEpisodes}
                      onSelectEpisode={handleSelectEpisode}
                      onPlayEpisode={(episode) => {
                        handleSelectEpisode(episode);
                        setIsPlaying(true);
                      }}
                    />
                  </section>
                )}
              </div>

              <aside className="min-w-0">
                <div className="mb-4 flex items-end justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[color:var(--muted-foreground)]">Made around our stories</p>
                    <h2 className="mt-1 text-lg font-bold text-[color:var(--foreground)]">Similar titles</h2>
                  </div>
                  <span className="text-xs text-[color:var(--muted-foreground)]">{similarMovies.length} titles</span>
                </div>
                <div className="grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 xl:grid-cols-2">
                  {similarMovies.map((movie) => (
                    <MovieCard
                      key={movie.id}
                      movie={movie}
                      isPremium={Boolean(movie.isPremium)}
                      isActive={false}
                      onClick={() => selectMovieInPlace(movie)}
                    />
                  ))}
                </div>
                {similarMovies.length === 0 && <p className="text-sm text-[color:var(--muted-foreground)]">More curated titles are on the way.</p>}
              </aside>
            </div>
          </div>
        </main>
      )}
      {showPremiumCheckout && selectedMovie && (
        <PremiumPreviewCheckout
          title={selectedMovie.title}
          assetId={selectedMovie.id}
          amountXaf={500}
          onClose={closePremiumCheckout}
          onUnlockSuccess={handlePremiumPaymentSuccess}
        />
      )}
    </>
  );
}

function DetailFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 border-l-2 border-[color:var(--border)] pl-3">
      <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-[color:var(--muted-foreground)]">{label}</p>
      <p className="text-sm font-semibold text-[color:var(--foreground)]">{value}</p>
    </div>
  );
}
