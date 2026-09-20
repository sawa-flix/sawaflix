'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Clock, ChevronRight, Play } from 'lucide-react';
import type { MediaGridItem } from '@/types/profile';

interface MovieItem {
  id: string;
  title: string;
  genre: string;
  image: string;
}

const DEFAULT_RECENT_MOVIES: MovieItem[] = [
  {
    id: 'saving-mbang',
    title: 'Saving Mbang',
    genre: 'Comedy',
    image: 'https://i.ibb.co/RGSygX9q/mbnag.png',
  },
  {
    id: 'fishermans-diary',
    title: 'Fisherman Diary',
    genre: 'Drama',
    image: 'https://i.ibb.co/xTCfBL6/fdiary.png',
  },
  {
    id: 'therapy',
    title: 'Therapy',
    genre: 'Drama',
    image: 'https://i.ibb.co/DDk4rzpn/therapist.png',
  },
  {
    id: 'heaven',
    title: 'Heaven',
    genre: 'Drama',
    image: 'https://i.ibb.co/2704Y9k4/heah.png',
  },
  {
    id: 'planters-plantation',
    title: 'The Planters Plantation',
    genre: 'History',
    image: 'https://i.ibb.co/BHbfNpkQ/planters-plantation.png',
  },
  {
    id: 'black-legacy',
    title: 'Black Legacy',
    genre: 'Action',
    image: 'https://i.ibb.co/Zz677vY/black-legacy.png',
  },
];

interface ProfileRecentlyWatchedProps {
  items?: MediaGridItem[];
}

export function ProfileRecentlyWatched({ items }: ProfileRecentlyWatchedProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 280, behavior: 'smooth' });
    }
  };

  const movies: MovieItem[] =
    items && items.length > 0
      ? items.map((it) => ({
          id: it.id,
          title: it.title,
          genre: it.subtitle || 'Movie',
          image: it.thumbnail || 'https://i.ibb.co/BHbfNpkQ/planters-plantation.png',
        }))
      : DEFAULT_RECENT_MOVIES;

  return (
    <section className="space-y-3">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center text-white">
            <Clock size={14} className="text-red-400" />
          </div>
          <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
            Recently Watched
          </h2>
        </div>

        <Link
          href="/dashboard/movie"
          className="text-[11px] sm:text-xs font-bold text-[#CE1126] hover:text-red-400 flex items-center gap-0.5 transition-colors group"
        >
          <span>View all</span>
          <ChevronRight size={13} className="transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      {/* Movie Posters Carousel Container */}
      <div className="relative group">
        <div
          ref={scrollRef}
          className="flex items-start gap-3 sm:gap-4 overflow-x-auto pb-2 scrollbar-none scroll-smooth snap-x"
        >
          {movies.map((movie) => (
            <Link
              key={movie.id}
              href={`/dashboard/video/${movie.id}`}
              className="group/card flex-none w-[125px] sm:w-[155px] md:w-[175px] snap-start space-y-1.5 cursor-pointer"
            >
              {/* Poster Card */}
              <div className="relative aspect-[16/10] w-full rounded-xl sm:rounded-2xl overflow-hidden bg-[#151B25] border border-white/10 shadow-lg group-hover/card:border-white/25 transition-all">
                <Image
                  src={movie.image}
                  alt={movie.title}
                  fill
                  unoptimized
                  className="object-cover transition-transform duration-300 group-hover/card:scale-105"
                />
                
                {/* Dark Vignette Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover/card:opacity-90 transition-opacity" />

                {/* Hover Play Button */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#CE1126] flex items-center justify-center text-white shadow-xl transform scale-90 group-hover/card:scale-100 transition-transform">
                    <Play size={15} className="fill-white translate-x-0.5" />
                  </div>
                </div>
              </div>

              {/* Title & Genre */}
              <div className="px-0.5">
                <h4 className="text-xs font-bold text-white truncate group-hover/card:text-[#CE1126] transition-colors">
                  {movie.title}
                </h4>
                <p className="text-[10px] text-zinc-400 font-medium">
                  {movie.genre}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* Right Scroll Arrow Button */}
        <button
          type="button"
          onClick={scrollRight}
          className="absolute right-0 top-[38%] -translate-y-1/2 translate-x-2.5 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/15 hover:bg-white/25 text-white backdrop-blur-md border border-white/20 flex items-center justify-center shadow-2xl transition-all hover:scale-105 active:scale-95 cursor-pointer z-10 hidden sm:flex"
          aria-label="Scroll right"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </section>
  );
}
