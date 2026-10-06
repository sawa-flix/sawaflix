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
  Lock
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
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showDescriptionFull, setShowDescriptionFull] = useState(false);

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

  const nextEpisode = useMemo(() => {
    if (!selectedMovie || selectedMovie.mediaKind !== 'episode') return null;
    const currentIndex = seriesEpisodes.findIndex(e => e.id === selectedMovie.id);
    if (currentIndex === -1 || currentIndex === seriesEpisodes.length - 1) return null;
    return seriesEpisodes[currentIndex + 1];
  }, [selectedMovie, seriesEpisodes]);

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
          className="relative w-full bg-black rounded-xl overflow-hidden"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setShowControls(false)}
        >
          {/* Video Player Container */}
          <div className="relative w-full aspect-video bg-black">
            {/* Video Thumbnail/Poster */}
            <Image
              src={selectedMovie.image}
              alt={title}
              fill
              className="object-cover"
              unoptimized
            />

            {/* Top Bar - Title and Close */}
            <div className={`absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent p-4 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 bg-[#CE1126] text-white text-[10px] font-bold uppercase rounded">S1 E1</span>
                    <span className="text-white/60 text-xs">{selectedMovie.duration}</span>
                  </div>
                  <h2 className="text-white text-lg font-bold">{title}</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPlaying(false)}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-white">
                    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Center Play/Pause Button */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex items-center gap-8">
                <button
                  type="button"
                  className="p-3 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all"
                >
                  <SkipBack size={24} className="text-white" fill="white" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsVideoPlaying(!isVideoPlaying)}
                  className="p-5 rounded-full bg-white/90 hover:bg-white transition-all transform hover:scale-105"
                >
                  {isVideoPlaying ? (
                    <Pause size={32} className="text-black" fill="black" />
                  ) : (
                    <Play size={32} className="text-black ml-1" fill="black" />
                  )}
                </button>
                <button
                  type="button"
                  className="p-3 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all"
                >
                  <SkipForward size={24} className="text-white" fill="white" />
                </button>
              </div>
            </div>

            {/* Bottom Controls */}
            <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
              {/* Progress Bar */}
              <div className="mb-3">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={(currentTime / duration) * 100 || 0}
                  onChange={(e) => setCurrentTime((parseFloat(e.target.value) / 100) * duration)}
                  className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#CE1126] [&::-webkit-slider-thumb]:cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #CE1126 0%, #CE1126 ${(currentTime / duration) * 100 || 0}%, rgba(255,255,255,0.2) ${(currentTime / duration) * 100 || 0}%, rgba(255,255,255,0.2) 100%)`
                  }}
                />
                <div className="flex justify-between text-xs text-white/60 mt-1">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration || 2760)}</span>
                </div>
              </div>

              {/* Control Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsVideoPlaying(!isVideoPlaying)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    {isVideoPlaying ? (
                      <Pause size={20} className="text-white" />
                    ) : (
                      <Play size={20} className="text-white" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsMuted(!isMuted)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    {isMuted ? (
                      <VolumeX size={20} className="text-white" />
                    ) : (
                      <Volume2 size={20} className="text-white" />
                    )}
                  </button>
                  <span className="text-white text-sm font-medium">12:34 / 46:12</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <Settings size={20} className="text-white" />
                  </button>
                  <button
                    type="button"
                    onClick={toggleFullscreen}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <Maximize size={20} className="text-white" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Next Up Section */}
          <div className="bg-[color:var(--background)] p-6">
            <h3 className="text-[color:var(--foreground)] font-bold mb-4">Next Up</h3>
            <div className="flex gap-3 overflow-x-auto no-scrollbar">
              {seriesEpisodes.slice(0, 5).map((episode) => (
                <div key={episode.id} className="flex-shrink-0 w-48 group cursor-pointer">
                  <div className="relative aspect-video rounded-lg overflow-hidden mb-2 border border-[#CE1126]">
                    <Image src={episode.image} alt={episode.title} fill className="object-cover" unoptimized />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play size={32} className="text-white" fill="white" />
                    </div>
                    <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/80 text-white text-[10px] font-bold rounded">
                      65%
                    </div>
                    <div className="absolute top-2 left-2">
                      <span className="px-2 py-0.5 bg-[#CE1126] text-white text-[9px] font-bold uppercase rounded">S1 E{episode.episodeNumber}</span>
                    </div>
                  </div>
                  <h4 className="text-[color:var(--foreground)] text-sm font-semibold line-clamp-1">{episode.episodeTitle || episode.title}</h4>
                  <p className="text-[color:var(--muted-foreground)] text-xs">Season {episode.seasonNumber} · Episode {episode.episodeNumber}</p>
                  <p className="text-[color:var(--muted-foreground)] text-xs">{episode.duration}</p>
                </div>
              ))}
            </div>
          </div>

          {/* More Like This Section */}
          <div className="bg-[color:var(--background)] px-6 pb-6">
            <h3 className="text-[color:var(--foreground)] font-bold mb-4">More Like This</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {similarMovies.slice(0, 4).map((movie) => (
                <div key={movie.id} className="group cursor-pointer">
                  <div className="relative aspect-[2/3] rounded-lg overflow-hidden mb-2">
                    <Image src={movie.image} alt={movie.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" unoptimized />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute top-2 left-2">
                      {movie.featured ? (
                        <span className="px-2 py-0.5 bg-[#CE1126] text-white text-[9px] font-bold uppercase rounded">Series</span>
                      ) : (
                        <span className="px-2 py-0.5 bg-black/60 text-white text-[9px] font-bold uppercase rounded backdrop-blur-sm">Movie</span>
                      )}
                    </div>
                    <div className="absolute bottom-2 right-2">
                      <Lock size={16} className="text-white/80" />
                    </div>
                  </div>
                  <h4 className="text-[color:var(--foreground)] text-sm font-semibold line-clamp-1">{movie.title}</h4>
                  <p className="text-[color:var(--muted-foreground)] text-xs">Season 1 · Episode 4</p>
                </div>
              ))}
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
