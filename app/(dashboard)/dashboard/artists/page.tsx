'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, MapPin, Search } from 'lucide-react';
import { artistsData } from '@/lib/music/artists';

const genreFilters = ['All artists', 'Hip Hop', 'Afrobeats', 'Afropop', 'Makossa'];

export default function ArtistsPage() {
  const [activeGenre, setActiveGenre] = useState('All artists');
  const [query, setQuery] = useState('');

  const visibleArtists = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return artistsData.filter((artist) => {
      const matchesGenre = activeGenre === 'All artists' || artist.genres.some((genre) => genre.toLowerCase() === activeGenre.toLowerCase());
      const matchesQuery = !normalizedQuery || `${artist.name} ${artist.genres.join(' ')} ${artist.bio}`.toLowerCase().includes(normalizedQuery);
      return matchesGenre && matchesQuery;
    });
  }, [activeGenre, query]);

  return (
    <main className="mx-auto w-full max-w-[1600px] px-3 pb-24 pt-3 sm:px-5 lg:px-7">
      <section className="relative isolate flex min-h-[330px] items-end overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] sm:min-h-[390px]">
        <Image
          src="/SawaFlix_Cameroonian_Entertainment_Cover.webp"
          alt="Cameroonian music, films, and entertainment on SawaFlix"
          fill
          priority
          sizes="(max-width: 768px) 100vw, 1600px"
          className="-z-20 object-cover object-center"
        />
        <div className="absolute inset-0 -z-10 bg-black/55" />
        <div className="relative z-10 max-w-3xl p-6 text-white sm:p-10 lg:p-12">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-white/70">Cameroon sounds, on one stage</p>
          <h1 className="text-4xl font-black sm:text-5xl">Artists</h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-white/80 sm:text-base">
            Meet the voices shaping Cameroon’s sound. Explore artists across Mboko, Afrobeats, Afropop, Makossa and more, then open a profile to learn about their work.
          </p>
          <a
            href="#artist-list"
            className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full bg-[color:var(--foreground)] px-5 py-2.5 text-sm font-bold text-[color:var(--background)] transition-opacity hover:opacity-85"
          >
            Explore artists <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>

      <section id="artist-list" className="mt-9">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">The SawaFlix artist directory</p>
            <h2 className="mt-2 text-2xl font-black text-[color:var(--foreground)] sm:text-3xl">Find your next favorite</h2>
          </div>
          <label className="flex min-h-11 w-full items-center gap-2 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] px-3 text-[color:var(--muted-foreground)] sm:max-w-xs">
            <Search className="h-4 w-4 shrink-0" aria-hidden="true" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search artists or genres"
              className="min-w-0 flex-1 bg-transparent text-sm text-[color:var(--foreground)] outline-none placeholder:text-[color:var(--muted-foreground)]"
              aria-label="Search artists or genres"
            />
          </label>
        </div>

        <div className="mt-5 flex gap-2 overflow-x-auto pb-2" aria-label="Filter artists by genre">
          {genreFilters.map((genre) => (
            <button
              key={genre}
              type="button"
              onClick={() => setActiveGenre(genre)}
              aria-pressed={activeGenre === genre}
              className={`shrink-0 rounded-full border px-4 py-2 text-xs font-semibold transition-colors ${activeGenre === genre ? 'border-[color:var(--foreground)] bg-[color:var(--foreground)] text-[color:var(--background)]' : 'border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--muted-foreground)] hover:text-[color:var(--foreground)]'}`}
            >
              {genre}
            </button>
          ))}
        </div>

        {visibleArtists.length > 0 ? (
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
            {visibleArtists.map((artist) => (
              <Link
                key={artist.id}
                href={`/dashboard/artist/${artist.id}`}
                className="group overflow-hidden rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] transition-colors hover:border-[color:var(--muted-foreground)]"
              >
                <div className="flex aspect-[4/4.5] w-full items-center justify-center bg-[color:var(--surface-hover)]">
                  <div className="relative h-28 w-28 overflow-hidden rounded-full border-4 border-[color:var(--surface)] bg-[color:var(--background)] shadow-md transition-transform duration-300 group-hover:scale-105 sm:h-32 sm:w-32">
                    <Image
                      src="/logos_and_pwas/loaderLogo.png"
                      alt={`${artist.name} on SawaFlix`}
                      fill
                      sizes="128px"
                      className="object-contain p-2"
                    />
                  </div>
                </div>
                <div className="p-3 sm:p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="truncate text-sm font-bold text-[color:var(--foreground)] sm:text-base">{artist.name}</h3>
                    <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--muted-foreground)] transition-transform group-hover:translate-x-0.5" />
                  </div>
                  <div className="mt-2 flex items-center gap-1 text-[10px] text-[color:var(--muted-foreground)]">
                    <MapPin className="h-3 w-3" /> {artist.region}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {artist.genres.slice(0, 2).map((genre) => (
                      <span key={genre} className="rounded-full border border-[color:var(--border)] px-2 py-1 text-[9px] text-[color:var(--muted-foreground)]">
                        {genre}
                      </span>
                    ))}
                  </div>
                  <p className="mt-3 line-clamp-2 text-xs leading-5 text-[color:var(--muted-foreground)]">{artist.bio}</p>
                  {artist.yearsActive && <p className="mt-2 text-[10px] font-medium text-[color:var(--muted-foreground)]">Active {artist.yearsActive}</p>}
                  {artist.songs[0] && <p className="mt-2 truncate text-[10px] text-[color:var(--foreground)]">Featured track: {artist.songs[0].title}</p>}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="mt-8 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] p-6 text-center text-sm text-[color:var(--muted-foreground)]">
            No artists match that search. Try another name or genre.
          </p>
        )}
      </section>
    </main>
  );
}
