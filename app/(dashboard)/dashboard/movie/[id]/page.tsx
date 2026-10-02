'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  ChevronRight,
  Globe2,
  Loader2,
  Play,
  Pause,
  Star,
  Users,
  Volume2,
  VolumeX,
  Maximize,
  Settings,
  SkipBack,
  SkipForward,
  Lock,
  X
} from 'lucide-react';
import { MovieCard, MovieEpisodeGuide } from '@/components/Movie';
import type { Movie } from '@/components/Movie';
import { fetchCuratedMovies } from '@/components/Movie/movieApi';

export default function MovieDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const movieId = decodeURIComponent(params.id);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  // Video player states
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(2760); // Default 46 minutes
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showDescriptionFull, setShowDescriptionFull] = useState(false);
  const [buffering, setBuffering] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    let cancelled = false;
    fetchCuratedMovies()
      .then((catalog) => {
        if (cancelled) return;
        setMovies(catalog);
        setSelectedMovie(catalog.find((movie) => movie.id === movieId) || null);
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
    setSelectedMovie(movies.find((movie) => movie.id === movieId) || null);
  }, [movies, movieId]);

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

  const handleSelectEpisode = useCallback((episode: Movie) => {
    setSelectedMovie(episode);
    setIsPlaying(false);
    router.replace(`/dashboard/movie/${encodeURIComponent(episode.id)}`, { scroll: false });
  }, [router]);

  const handlePlayNextEpisode = useCallback(() => {
    if (!nextEpisode) return;
    handleSelectEpisode(nextEpisode);
    setIsPlaying(true);
  }, [handleSelectEpisode, nextEpisode]);

  // Video player controls
  useEffect(() => {
    if (!videoRef.current) return;

    const video = videoRef.current;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleLoadedMetadata = () => setDuration(video.duration);
    const handlePlay = () => setIsVideoPlaying(true);
    const handlePause = () => setIsVideoPlaying(false);
    const handleWaiting = () => setBuffering(true);
    const handleCanPlay = () => setBuffering(false);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('canplay', handleCanPlay);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('canplay', handleCanPlay);
    };
  }, [isPlaying]);

  // Auto-play when player opens
  useEffect(() => {
    if (isPlaying && videoRef.current) {
      videoRef.current.play().catch(err => console.error('Autoplay failed:', err));
    }
  }, [isPlaying]);

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isVideoPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  const togglePlayPause = () => {
    if (!videoRef.current) return;
    if (isVideoPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleSeek = (value: number) => {
    if (!videoRef.current) return;
    const newTime = (value / 100) * duration;
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const skipTime = (seconds: number) => {
    if (!videoRef.current) return;
    const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const toggleFullscreen = () => {
    if (!videoContainerRef.current) return;
    if (!isFullscreen) {
      videoContainerRef.current.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsFullscreen(!isFullscreen);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getVideoUrl = (movieId: string) => {
    // This will use YouTube video as source. Replace with actual video URLs when available
    return `https://www.youtube.com/embed/${movieId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;
  };

  if (loading) {
    return <div className="flex min-h-[60vh] items-center justify-center text-[color:var(--muted-foreground)]"><Loader2 className="animate-spin" /></div>;
  }

  if (loadError || !selectedMovie) {
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center gap-4 px-5 text-center">
        <h1 className="text-xl font-bold text-[color:var(--foreground)]">{loadError ? 'Movie details are unavailable' : 'This title is no longer available'}</h1>
        <Link href="/dashboard/movie" className="cursor-pointer rounded-lg bg-[color:var(--foreground)] px-4 py-2 text-sm font-bold text-[color:var(--background)]">Back to movies</Link>
      </main>
    );
  }

  const playableMovie = selectedMovie.mediaKind === 'series' && firstEpisode ? firstEpisode : selectedMovie;
  const playableId = playableMovie.id;
  const title = playableMovie.episodeTitle || playableMovie.title;
  const description = selectedMovie.description || `Discover ${selectedMovie.title}, a ${selectedMovie.genres[0]?.toLowerCase() || 'Cameroonian'} title curated for SawaFlix viewers.`;
  const shortDescription = description.length > 180 ? description.slice(0, 180) + '...' : description;

  return (
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

      {isPlaying ? (
        <div
          ref={videoContainerRef}
          className="fixed inset-0 z-[100] bg-black overflow-y-auto"
          onMouseMove={handleMouseMove}
        >
          {/* Video Player Section - Full Width */}
          <div className="relative w-full min-h-screen flex flex-col">
            {/* Video Container */}
            <div className="relative w-full aspect-video bg-black flex-shrink-0">
              {/* Video Element with YouTube Embed */}
              <iframe
                src={getVideoUrl(playableId)}
                title={title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />

              {/* Top Bar - Title and Close */}
              <div className={`absolute top-0 left-0 right-0 bg-gradient-to-b from-black/90 via-black/50 to-transparent p-4 sm:p-6 transition-opacity duration-300 z-10 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
                <div className="flex items-start justify-between max-w-[1400px] mx-auto">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      {selectedMovie.mediaKind === 'episode' && (
                        <span className="px-2.5 py-1 bg-[#CE1126] text-white text-[10px] font-bold uppercase rounded">
                          S{selectedMovie.seasonNumber || 1} E{selectedMovie.episodeNumber || 1}
                        </span>
                      )}
                      <span className="text-white/70 text-xs font-medium">{selectedMovie.duration}</span>
                    </div>
                    <h2 className="text-white text-base sm:text-xl font-bold line-clamp-1">{title}</h2>
                    {selectedMovie.seriesTitle && (
                      <p className="text-white/60 text-xs sm:text-sm mt-0.5">{selectedMovie.seriesTitle}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsPlaying(false)}
                    className="p-2.5 rounded-full hover:bg-white/10 transition-colors ml-4"
                  >
                    <X size={24} className="text-white" />
                  </button>
                </div>
              </div>
            </div>

            {/* Dark Background Section with Episodes */}
            <div className="flex-1 bg-gradient-to-b from-black via-[#0a0a0a] to-black">
              <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">
                {/* Next Up / Episodes Section */}
                {seriesEpisodes.length > 0 && (
                  <div className="mb-10">
                    <h3 className="text-white text-lg sm:text-xl font-bold mb-5">
                      {selectedMovie.mediaKind === 'series' ? 'Episodes' : 'Next Up'}
                    </h3>
                    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                      {seriesEpisodes.map((episode, index) => {
                        const isCurrentEpisode = episode.id === selectedMovie.id;
                        const isWatched = index < (selectedEpisodeIndex || 0);
                        const progress = isCurrentEpisode ? 65 : isWatched ? 100 : 0;
                        const isComingSoon = !episode.id.includes('v='); // Mock logic for coming soon

                        return (
                          <button
                            key={episode.id}
                            onClick={() => !isComingSoon && handleSelectEpisode(episode)}
                            disabled={isComingSoon}
                            className={`flex-shrink-0 w-72 group cursor-pointer ${isComingSoon ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            <div className={`relative aspect-video rounded-lg overflow-hidden mb-3 ${isCurrentEpisode ? 'ring-2 ring-[#CE1126]' : 'border border-white/10'}`}>
                              <Image
                                src={episode.image}
                                alt={episode.title}
                                fill
                                className={`object-cover ${isComingSoon ? 'blur-md' : 'group-hover:scale-105 transition-transform duration-300'}`}
                                unoptimized
                              />

                              {/* Blur overlay for coming soon */}
                              {isComingSoon && (
                                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                                  <div className="text-center">
                                    <Lock size={28} className="text-white/80 mx-auto mb-2" />
                                    <span className="text-white text-xs font-bold uppercase tracking-wider">Coming Soon</span>
                                  </div>
                                </div>
                              )}

                              {/* Play overlay */}
                              {!isComingSoon && !isCurrentEpisode && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Play size={40} className="text-white" fill="white" />
                                </div>
                              )}

                              {/* Progress bar */}
                              {progress > 0 && !isComingSoon && (
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                                  <div
                                    className="h-full bg-[#CE1126]"
                                    style={{ width: `${progress}%` }}
                                  />
                                </div>
                              )}

                              {/* Episode badge */}
                              <div className="absolute top-2 left-2">
                                <span className="px-2 py-1 bg-[#CE1126] text-white text-[10px] font-bold uppercase rounded shadow-lg">
                                  S{episode.seasonNumber || 1} E{episode.episodeNumber || 1}
                                </span>
                              </div>

                              {/* Duration badge */}
                              {episode.duration && !isComingSoon && (
                                <div className="absolute bottom-2 right-2">
                                  <span className="px-2 py-0.5 bg-black/80 text-white text-[10px] font-bold rounded backdrop-blur-sm">
                                    {episode.duration}
                                  </span>
                                </div>
                              )}

                              {/* Now playing indicator */}
                              {isCurrentEpisode && (
                                <div className="absolute top-2 right-2">
                                  <span className="px-2 py-1 bg-white text-black text-[9px] font-black uppercase rounded shadow-lg">
                                    Now Playing
                                  </span>
                                </div>
                              )}
                            </div>

                            <h4 className="text-white text-sm font-semibold line-clamp-1 mb-1 text-left">
                              {episode.episodeTitle || episode.title}
                            </h4>
                            <p className="text-white/50 text-xs text-left">
                              Season {episode.seasonNumber} · Episode {episode.episodeNumber}
                            </p>
                            {isWatched && !isCurrentEpisode && (
                              <p className="text-[#CE1126] text-xs font-semibold text-left mt-1">✓ Watched</p>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* More Like This Section */}
                {similarMovies.length > 0 && (
                  <div>
                    <h3 className="text-white text-lg sm:text-xl font-bold mb-5">More Like This</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {similarMovies.map((movie) => (
                        <button
                          key={movie.id}
                          onClick={() => router.push(`/dashboard/movie/${encodeURIComponent(movie.id)}`)}
                          className="group cursor-pointer text-left"
                        >
                          <div className="relative aspect-[2/3] rounded-lg overflow-hidden mb-2">
                            <Image
                              src={movie.image}
                              alt={movie.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                              unoptimized
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                            {/* Badge */}
                            <div className="absolute top-2 left-2">
                              <span className="px-2 py-1 bg-[#CE1126] text-white text-[9px] font-bold uppercase rounded">
                                {movie.mediaKind === 'series' ? 'Series' : 'Movie'}
                              </span>
                            </div>

                            {/* Play overlay */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="p-3 rounded-full bg-white/20 backdrop-blur-sm">
                                <Play size={24} className="text-white" fill="white" />
                              </div>
                            </div>

                            {/* Info at bottom */}
                            <div className="absolute bottom-2 left-2 right-2">
                              <p className="text-white text-xs font-semibold line-clamp-2">{movie.title}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[#FCD116] text-xs">★ {movie.rating || 4.8}</span>
                                <span className="text-white/60 text-xs">{movie.year}</span>
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <section className="relative isolate min-h-[360px] overflow-hidden rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] sm:min-h-[440px]">
          <Image src={selectedMovie.image} alt="" fill priority unoptimized sizes="100vw" className="-z-20 object-cover" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/90 via-black/55 to-black/10" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/85 via-transparent to-black/15" />
          <div className="flex min-h-[360px] items-end p-5 sm:min-h-[440px] sm:p-10 lg:p-14">
            <div className="max-w-3xl">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="rounded bg-[#CE1126] px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white">SawaFlix Cameroon</span>
                {selectedMovie.mediaKind === 'episode' && <span className="rounded border border-white/40 bg-black/30 px-2.5 py-1 text-[10px] font-bold text-white">Season {selectedMovie.seasonNumber || 1} · Episode {selectedMovie.episodeNumber || 1}</span>}
                {selectedMovie.mediaKind === 'series' && <span className="rounded border border-white/40 bg-black/30 px-2.5 py-1 text-[10px] font-bold text-white">Series</span>}
              </div>
              <h1 className="mb-3 text-3xl font-black leading-tight text-white sm:text-5xl">{title}</h1>
              {selectedMovie.seriesTitle && <p className="mb-2 text-sm font-semibold text-white/75">{selectedMovie.seriesTitle}</p>}
              <p className="mb-5 max-w-2xl line-clamp-3 text-sm leading-relaxed text-white/85 sm:text-base">{shortDescription}</p>
              <div className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold text-white/80">
                <span className="inline-flex items-center gap-1.5 text-[#FCD116]"><Star size={14} fill="currentColor" /><span className="text-white">{selectedMovie.rating || 4.8}</span></span>
                <span className="inline-flex items-center gap-1.5"><Calendar size={14} />{selectedMovie.year}</span>
                <span className="inline-flex items-center gap-1.5"><Globe2 size={14} />{selectedMovie.country}</span>
                {selectedMovie.duration && <span className="inline-flex items-center gap-1.5"><Volume2 size={14} />{selectedMovie.duration}</span>}
                {selectedMovie.language && <span className="inline-flex items-center gap-1.5"><Users size={14} />{selectedMovie.language}</span>}
                <span>{selectedMovie.genres.join(' · ')}</span>
              </div>
              <button type="button" onClick={() => setIsPlaying(true)} className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-black text-black shadow-lg transition-transform hover:scale-[1.02]">
                <Play size={18} fill="currentColor" /> {selectedMovie.mediaKind === 'series' ? 'Start series' : 'Watch now'}
              </button>
            </div>
          </div>
        </section>
      )}

      <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0 space-y-8">
          {nextEpisode && !isPlaying && (
            <div className="flex flex-col gap-3 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)]/85 p-4 shadow-lg backdrop-blur-md sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[color:var(--foreground)]/10 text-[color:var(--foreground)]">
                  <ChevronRight size={16} />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-[color:var(--foreground)]">Swipe or scroll down for the next episode</p>
                  <p className="mt-0.5 truncate text-xs text-[color:var(--muted-foreground)]">
                    Next up: S{nextEpisode.seasonNumber || 1} · E{nextEpisode.episodeNumber || 1} · {nextEpisode.episodeTitle || nextEpisode.title}
                  </p>
                </div>
              </div>
              <button type="button" onClick={handlePlayNextEpisode} className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-[color:var(--foreground)] px-4 py-2.5 text-xs font-bold text-[color:var(--background)] transition-opacity hover:opacity-85">
                Play next episode <ChevronRight size={15} />
              </button>
            </div>
          )}

          <section className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)]/80 p-5 shadow-lg backdrop-blur-md sm:p-6">
            <p className="mb-2 text-[10px] font-black uppercase tracking-[0.18em] text-[color:var(--primary)]">SawaFlix story guide</p>
            <h2 className="mb-3 text-xl font-bold text-[color:var(--foreground)]">About this title</h2>
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

          {seriesEpisodes.length > 0 && !isPlaying && (
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
                isPremium={false}
                isActive={false}
                onClick={() => router.push(`/dashboard/movie/${encodeURIComponent(movie.id)}`)}
              />
            ))}
          </div>
          {similarMovies.length === 0 && <p className="text-sm text-[color:var(--muted-foreground)]">More curated titles are on the way.</p>}
        </aside>
      </div>
      </div>
    </main>
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
