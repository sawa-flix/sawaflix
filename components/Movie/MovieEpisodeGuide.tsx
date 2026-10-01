'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { Check, Play, Tv } from 'lucide-react';
import type { Movie } from './types';

interface MovieEpisodeGuideProps {
  movie: Movie;
  episodes: Movie[];
  onSelectEpisode: (movie: Movie) => void;
  onPlayEpisode: (movie: Movie) => void;
}

export function MovieEpisodeGuide({ movie, episodes, onSelectEpisode, onPlayEpisode }: MovieEpisodeGuideProps) {
  const seasons = useMemo(
    () => Array.from(new Set(episodes.map((episode) => episode.seasonNumber || 1))).sort((a, b) => a - b),
    [episodes]
  );
  const [activeSeason, setActiveSeason] = useState(movie.seasonNumber || seasons[0] || 1);
  const seasonEpisodes = episodes.filter((episode) => (episode.seasonNumber || 1) === activeSeason);

  if (episodes.length === 0 && movie.mediaKind !== 'series' && movie.mediaKind !== 'episode') return null;

  return (
    <section className="mb-6 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-hover)]/45 p-3">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[color:var(--foreground)]/8 text-[color:var(--foreground)]">
          <Tv size={16} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-[color:var(--foreground)]">{movie.seriesTitle || movie.title}</p>
          <p className="text-[11px] text-[color:var(--muted-foreground)]">
            {episodes.length > 0 ? `${episodes.length} episode${episodes.length === 1 ? '' : 's'}` : 'Series'}
            {movie.isSample ? ' · Sample data' : ''}
          </p>
        </div>
      </div>

      {seasons.length > 1 && (
        <div className="mb-3 flex gap-1.5 overflow-x-auto scrollbar-hide">
          {seasons.map((season) => (
            <button
              key={season}
              type="button"
              onClick={() => setActiveSeason(season)}
              aria-pressed={activeSeason === season}
              className={`shrink-0 rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors ${activeSeason === season ? 'bg-[color:var(--foreground)] text-[color:var(--background)]' : 'bg-[color:var(--surface)] text-[color:var(--muted-foreground)] hover:text-[color:var(--foreground)]'}`}
            >
              Season {season}
            </button>
          ))}
        </div>
      )}

      {seasonEpisodes.length > 0 ? (
        <div className="max-h-64 space-y-1 overflow-y-auto pr-1">
          {seasonEpisodes.map((episode, index) => {
            const isCurrent = episode.id === movie.id;
            const episodeLabel = episode.episodeNumber ? `Episode ${episode.episodeNumber}` : `Episode ${index + 1}`;
            return (
              <div
                key={episode.id}
                className={`flex items-center gap-2 rounded-lg p-1.5 ${isCurrent ? 'bg-[color:var(--foreground)]/8' : 'hover:bg-[color:var(--surface-hover)]'}`}
              >
                <button
                  type="button"
                  onClick={() => onSelectEpisode(episode)}
                  aria-current={isCurrent ? 'true' : undefined}
                  className="flex min-w-0 flex-1 items-center gap-2 text-left"
                >
                  <div className="relative h-10 w-16 shrink-0 overflow-hidden rounded-md bg-[color:var(--surface)]">
                    <Image src={episode.image} alt="" fill className="object-cover" unoptimized sizes="64px" />
                    <span className="absolute bottom-0.5 left-0.5 rounded bg-black/70 px-1 text-[9px] font-bold text-white">
                      {episode.episodeNumber ? `E${episode.episodeNumber}` : `E${index + 1}`}
                    </span>
                  </div>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[10px] font-semibold uppercase text-[color:var(--muted-foreground)]">
                      S{String(episode.seasonNumber || 1).padStart(2, '0')} · {episodeLabel}
                    </span>
                    <span className="block truncate text-xs font-medium text-[color:var(--foreground)]">
                      {episode.episodeTitle || episode.title}
                    </span>
                  </span>
                  {isCurrent && <Check size={14} className="shrink-0 text-[color:var(--foreground)]" />}
                </button>
                <button
                  type="button"
                  onClick={() => onPlayEpisode(episode)}
                  title={`Play ${episode.title}`}
                  aria-label={`Play ${episode.title}`}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[color:var(--foreground)] hover:bg-[color:var(--surface-hover)]"
                >
                  <Play size={14} fill="currentColor" />
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-xs text-[color:var(--muted-foreground)]">Episodes will appear here as they are added.</p>
      )}
    </section>
  );
}
