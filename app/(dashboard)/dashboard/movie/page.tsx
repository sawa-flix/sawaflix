'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Play, X, Loader2, RefreshCw } from 'lucide-react';
import {
  MovieCard,
  RightSidebarContent,
  MovieDetailSheet,
  FILTERS,
  MOVIES_DATA,
  Movie,
} from '@/components/Movie';
import MovieHeroBanner from '@/components/Movie/MovieHeroBanner';
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

function publicationYear(value: string): number {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 2026 : date.getFullYear();
}

function mapCuratedToMovie(dto: CuratedMovieDto): Movie {
  return {
    id: dto.youtube_video_id,
    title: dto.title,
    image: dto.thumbnail_url,
    year: publicationYear(dto.published_at),
    country: 'Cameroon',
    genres: dto.genres && dto.genres.length > 0 ? dto.genres : ['Drama'],
    featured: dto.is_featured,
    description: dto.description || 'Authentic Cameroonian movie streaming on SawaFlix.',
    duration: formatDuration(dto.duration_seconds),
    ageRating: '16+',
    rating: 4.8,
    director: dto.channel_title,
    writer: dto.channel_title,
    stars: dto.channel_title,
    language: dto.language || 'English / French',
    subtitles: 'English',
  };
}

export default function MoviePage(): React.ReactElement {
  const [movies, setMovies] = useState<Movie[]>(MOVIES_DATA);
  const [genres, setGenres] = useState<string[]>(FILTERS);
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [selectedMovie, setSelectedMovie] = useState<Movie>(MOVIES_DATA[0]);
  const [playingMovie, setPlayingMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch real Cameroonian movies from the backend YouTube curation engine
  const loadMovies = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${BACKEND_URL}/api/youtube/movies?limit=100`, {
        headers: { Accept: 'application/json' },
        cache: 'no-store',
      });
      const result: MovieApiResponse = await response.json();
      if (!response.ok || !result.success || !result.movies || result.movies.length === 0) {
        throw new Error(result.error || 'Using curated catalog.');
      }
      const mapped = result.movies.map(mapCuratedToMovie);
      setMovies(mapped);
      
      const availableGenres = Array.from(
        new Set(['All', ...(result.genres || []), ...mapped.flatMap((m) => m.genres)])
      ).slice(0, 12);
      setGenres(availableGenres);

      const featured = mapped.find((m) => m.featured) || mapped[0];
      setSelectedMovie(featured);
    } catch {
      // Fallback to static catalog if backend is syncing
      const featured = MOVIES_DATA.find((m) => m.featured) || MOVIES_DATA[0];
      setMovies(MOVIES_DATA);
      setSelectedMovie(featured);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadMovies();
  }, [loadMovies]);

  // Featured Hero movie
  const featuredMovie = useMemo(
    () => movies.find((m) => m.featured) || movies[0] || MOVIES_DATA[0],
    [movies]
  );

  // Memoized filtered movies for responsive grid
  const filteredMovies = useMemo(() => {
    if (activeFilter === 'All') return movies.filter((m) => m.id !== featuredMovie.id);
    return movies.filter((m) => m.id !== featuredMovie.id && m.genres?.includes(activeFilter));
  }, [movies, activeFilter, featuredMovie]);

  // Related movies for the desktop right sidebar
  const moreMovies = useMemo(
    () => movies.filter((m) => m.id !== selectedMovie?.id).slice(0, 6),
    [movies, selectedMovie]
  );

  // Close player modal on Escape key
  useEffect(() => {
    if (!playingMovie) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPlayingMovie(null);
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [playingMovie]);

  return (
    <>
      <div className="movie-page-root flex flex-col xl:flex-row gap-6 lg:gap-8 w-full max-w-[1920px] mx-auto min-h-screen text-[color:var(--foreground)] pb-20">
        {/* ========== LEFT CONTENT AREA ========== */}
        <div className="flex-1 min-w-0 flex flex-col pt-2">
          {/* Filters Bar - Sticky above hero banner (YouTube style chips) */}
          <div className="sticky top-0 z-40 bg-[color:var(--background)]/90 backdrop-blur-md py-3 mb-6 flex items-center gap-2 overflow-x-auto scrollbar-hide border-b border-[color:var(--border)] -mx-4 px-4 sm:mx-0 sm:px-0">
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

          {/* Featured Hero Banner */}
          <MovieHeroBanner
            movie={featuredMovie}
            onWatchNow={() => setPlayingMovie(featuredMovie)}
          />

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
        <div className="hidden xl:block w-[340px] shrink-0 sticky top-4 h-[calc(100vh-2rem)] rounded-2xl overflow-y-auto scrollbar-hide bg-[color:var(--surface)] border border-[color:var(--border)] shadow-xl p-6 transition-colors">
          <RightSidebarContent
            movie={selectedMovie}
            onClose={() => setSelectedMovie(featuredMovie)}
            moreMovies={moreMovies}
            onWatchNow={(movieToPlay) => setPlayingMovie(movieToPlay)}
          />
        </div>
      </div>

      {/* ========== MOBILE BOTTOM SHEET (SLIDES FROM BOTTOM) ========== */}
      <div className="xl:hidden">
        {selectedMovie && selectedMovie.id !== featuredMovie.id && (
          <MovieDetailSheet
            movie={selectedMovie}
            onClose={() => setSelectedMovie(featuredMovie)}
            onWatchNow={(movieToPlay) => setPlayingMovie(movieToPlay)}
          />
        )}
      </div>

      {/* ========== THEATER VIDEO PLAYER MODAL ========== */}
      {playingMovie && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-5xl bg-black rounded-2xl overflow-hidden border border-white/10 shadow-[0_25px_80px_rgba(0,0,0,0.9)] flex flex-col">
            {/* Player Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-[#0B0E14] border-b border-white/10">
              <div className="flex items-center gap-2 min-w-0 pr-4">
                <span className="bg-[#CE1126] text-white text-[10px] font-black uppercase px-2 py-0.5 rounded">
                  Now Playing
                </span>
                <h3 className="text-sm font-bold text-white truncate">{playingMovie.title}</h3>
              </div>
              <button
                onClick={() => setPlayingMovie(null)}
                className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
                aria-label="Close Player"
              >
                <X size={20} />
              </button>
            </div>

            {/* Embed Player */}
            <div className="relative aspect-video w-full bg-black">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${playingMovie.id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
                title={playingMovie.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="absolute inset-0 w-full h-full border-0"
              />
            </div>
          </div>
        </div>
      )}

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
