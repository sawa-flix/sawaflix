'use client';

import React, { useState, useMemo } from 'react';
import { Filter } from 'lucide-react';
import PaywallFlowManager from '@/components/Paywall/PaywallFlowManager';
import { MovieCard, RightSidebarContent, MovieDetailSheet, FILTERS, MOVIES_DATA, Movie } from '@/components/Movie';
import MovieHeroBanner from '@/components/Movie/MovieHeroBanner';

/**
 * Movie Page
 * Main page component for browsing and watching movies
 * Features:
 * - Featured movie hero banner
 * - Genre filtering
 * - Responsive grid layout
 * - Desktop sidebar with details
 * - Mobile bottom sheet
 * - Paywall integration
 */

export default function MoviePage(): React.ReactElement {
  // Data initialization
  const featuredMovie = MOVIES_DATA.find((m) => m.featured) || MOVIES_DATA[0];

  // State management
  const [selectedMovie, setSelectedMovie] = useState<Movie>(featuredMovie);
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [paywallMovie, setPaywallMovie] = useState<Movie | null>(null);

  // Memoized filtered movies for performance
  const filteredMovies = useMemo(() => {
    if (activeFilter === 'All') return MOVIES_DATA.filter((m) => !m.featured);
    return MOVIES_DATA.filter((m) => !m.featured && m.genres?.includes(activeFilter));
  }, [activeFilter]);

  return (
    <>
      <div className="movie-page-root flex flex-col xl:flex-row gap-6 lg:gap-8 w-full max-w-[1920px] mx-auto min-h-screen text-[color:var(--foreground)] pb-20">
        {/* ========== LEFT CONTENT AREA ========== */}
        <div className="flex-1 min-w-0 flex flex-col pt-2">
          {/* Filters Bar - Sticky above banner */}
          <div className="sticky top-0 z-40 bg-[color:var(--surface)]/95 backdrop-blur-md py-3 mb-6 flex items-center gap-2 overflow-x-auto scrollbar-hide border-b border-[color:var(--border)] -mx-4 px-4 sm:mx-0 sm:px-0">
            {FILTERS.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`cursor-pointer shrink-0 px-4 py-2 rounded-full text-sm font-bold transition-all ${
                  activeFilter === filter
                    ? 'bg-[#CE1126] text-white shadow-[0_0_15px_rgba(206,17,38,0.3)]'
                : 'bg-transparent text-[color:var(--muted-foreground)] hover:bg-[color:var(--surface)]/70 hover:text-[color:var(--foreground)] border border-[color:var(--border)]/60'
                }`}
                aria-pressed={activeFilter === filter}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Hero Banner */}
          <MovieHeroBanner
            movie={featuredMovie}
            onWatchNow={() => setPaywallMovie(featuredMovie)}
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
              <div className="col-span-full py-20 text-center text-gray-500 font-bold">
                No movies found for "{activeFilter}"
              </div>
            )}
          </div>
        </div>

        {/* ========== RIGHT SIDEBAR (DESKTOP ONLY) ========== */}
        <div className="hidden xl:block w-[340px] shrink-0 sticky top-4 h-[calc(100vh-2rem)] rounded-xl overflow-y-auto scrollbar-hide bg-[color:var(--surface)] border border-[color:var(--border)] shadow-2xl p-6">
          <RightSidebarContent
            movie={selectedMovie}
            onClose={() => setSelectedMovie(featuredMovie)}
            moreMovies={MOVIES_DATA.filter((m) => m.id !== selectedMovie.id).slice(0, 4)}
            onWatchNow={setPaywallMovie}
          />
        </div>
      </div>

      {/* ========== MOBILE BOTTOM SHEET ========== */}
      <div className="xl:hidden">
        {selectedMovie && selectedMovie.id !== featuredMovie.id && (
          <MovieDetailSheet
            movie={selectedMovie}
            onClose={() => setSelectedMovie(featuredMovie)}
            onWatchNow={setPaywallMovie}
          />
        )}
      </div>

      {/* ========== PAYWALL OVERLAY ========== */}
      {paywallMovie && (
        <PaywallFlowManager
          movie={paywallMovie}
          onClose={() => setPaywallMovie(null)}
        />
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
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
