'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, Globe2, Loader2, Play, Star, Users, Volume2 } from 'lucide-react';
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

  const handleSelectEpisode = useCallback((episode: Movie) => {
    setSelectedMovie(episode);
    setIsPlaying(false);
    router.replace(`/dashboard/movie/${encodeURIComponent(episode.id)}`, { scroll: false });
  }, [router]);

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

  return (
    <main className="relative isolate mx-auto min-h-screen w-full max-w-[1600px] px-3 pb-16 sm:px-6">
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
        <div className="fixed inset-0 z-[100] flex h-[100dvh] flex-col bg-black sm:items-center sm:justify-center sm:bg-black/90 sm:p-4">
          <div className="flex h-full w-full flex-col overflow-hidden bg-black sm:h-auto sm:max-h-[94dvh] sm:max-w-7xl sm:rounded-2xl sm:border sm:border-[color:var(--border)] sm:shadow-2xl">
            <header className="z-10 flex shrink-0 items-center justify-between gap-4 border-b border-white/10 bg-black/90 px-4 pb-3 pt-[calc(env(safe-area-inset-top)+0.75rem)] text-white backdrop-blur-xl sm:bg-[color:var(--surface)] sm:pt-3 sm:text-[color:var(--foreground)]">
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-white/55 sm:text-[color:var(--muted-foreground)]">Now playing</p>
                <h1 className="truncate text-sm font-bold">{title}</h1>
              </div>
              <button
                type="button"
                onClick={() => setIsPlaying(false)}
                aria-label="Close player"
                className="shrink-0 cursor-pointer rounded-lg border border-white/15 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-white/10 sm:border-[color:var(--border)] sm:text-[color:var(--foreground)] sm:hover:bg-[color:var(--surface-hover)]"
              >
                Close
              </button>
            </header>
            <div className="flex min-h-0 flex-1 items-center justify-center bg-black sm:flex-none">
              <div className="relative aspect-video max-h-full w-full sm:max-h-[calc(94dvh-9rem)] sm:max-w-full">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${playableId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
                  title={title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="absolute inset-0 h-full w-full border-0"
                />
              </div>
            </div>
            <footer className="shrink-0 border-t border-white/10 bg-black/90 px-4 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3 text-white backdrop-blur-xl sm:bg-[color:var(--surface)] sm:pb-3 sm:text-[color:var(--foreground)]">
              <h2 className="truncate text-sm font-bold">{title}</h2>
              <p className="mt-1 text-xs text-white/60 sm:text-[color:var(--muted-foreground)]">
                {selectedMovie.year} · {selectedMovie.country} · {selectedMovie.genres.join(' · ')}
              </p>
            </footer>
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
              <p className="mb-5 max-w-2xl line-clamp-3 text-sm leading-relaxed text-white/85 sm:text-base">{selectedMovie.description}</p>
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
          <section className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)]/80 p-5 shadow-lg backdrop-blur-md sm:p-6">
            <p className="mb-2 text-[10px] font-black uppercase tracking-[0.18em] text-[color:var(--primary)]">SawaFlix story guide</p>
            <h2 className="mb-3 text-xl font-bold text-[color:var(--foreground)]">About this title</h2>
            <p className="max-w-4xl whitespace-pre-line text-sm leading-7 text-[color:var(--foreground-secondary)]">
              {selectedMovie.description || `Discover ${selectedMovie.title}, a ${selectedMovie.genres[0]?.toLowerCase() || 'Cameroonian'} title curated for SawaFlix viewers.`}
            </p>
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
