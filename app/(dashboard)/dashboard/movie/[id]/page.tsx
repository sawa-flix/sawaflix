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
  const playableMovie = selectedMovie.mediaKind === 'series' && firstEpisode ? firstEpisode : selectedMovie;

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
        <Link href="/dashboard/movie" className="rounded-lg bg-[color:var(--foreground)] px-4 py-2 text-sm font-bold text-[color:var(--background)]">Back to movies</Link>
      </main>
    );
  }

  const playableId = playableMovie.id;
  const title = playableMovie.episodeTitle || playableMovie.title;

  return (
    <main className="mx-auto min-h-screen w-full max-w-[1600px] px-3 pb-16 sm:px-6">
      <button
        type="button"
        onClick={() => router.push('/dashboard/movie')}
        className="mb-4 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-[color:var(--muted-foreground)] transition-colors hover:bg-[color:var(--surface-hover)] hover:text-[color:var(--foreground)]"
      >
        <ArrowLeft size={17} /> Back to movies
      </button>

      {isPlaying ? (
        <div className="overflow-hidden rounded-xl border border-[color:var(--border)] bg-black shadow-2xl">
          <div className="flex items-center justify-between gap-4 bg-[color:var(--surface)] px-4 py-3">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[color:var(--muted-foreground)]">Now playing</p>
              <h1 className="truncate text-sm font-bold text-[color:var(--foreground)]">{title}</h1>
            </div>
            <button type="button" onClick={() => setIsPlaying(false)} className="rounded-md px-3 py-1.5 text-xs font-bold text-[color:var(--foreground)] hover:bg-[color:var(--surface-hover)]">Close player</button>
          </div>
          <div className="relative aspect-video w-full">
            <iframe
                src={`https://www.youtube-nocookie.com/embed/${playableId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="absolute inset-0 h-full w-full border-0"
            />
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
              <button type="button" onClick={() => setIsPlaying(true)} className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-black text-black shadow-lg transition-transform hover:scale-[1.02]">
                <Play size={18} fill="currentColor" /> {selectedMovie.mediaKind === 'series' ? 'Start series' : 'Watch now'}
              </button>
            </div>
          </div>
        </section>
      )}

      <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0 space-y-8">
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

          {selectedMovie.director && <p className="text-sm text-[color:var(--muted-foreground)]">From {selectedMovie.director}</p>}
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
    </main>
  );
}
