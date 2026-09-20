'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronRight, RotateCcw, Search, SearchX, X } from 'lucide-react';
import { useReelsSearchStore } from '@/store/reelsSearchStore';

interface ReelsSearchBarProps {
  /** Phones' fullscreen compact bar: collapses to a single floating icon
   * (matching the mute button next to it) until tapped, instead of the
   * always-visible inline bar the desktop header uses in its normal row. */
  floating?: boolean;
}

/**
 * Reels' own search — rendered inside the shared dashboard Header (top
 * navbar) only while /dashboard/reels is mounted, in the same slot the
 * global search normally occupies there (which stays suppressed on this
 * route via Header's existing searchDisabled prop). All state/actions come
 * from useReelsSearchStore, which ReelsFeed keeps in sync — this component
 * owns no search logic itself, purely presentation.
 */
export function ReelsSearchBar({ floating = false }: ReelsSearchBarProps) {
  const { query, results, loading, error, hasMore, showResults, setQuery, clear, loadMore, retry, selectResult } =
    useReelsSearchStore();
  const [isOpen, setIsOpen] = useState(false);

  if (floating && !isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Search reels"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-black/40 text-white backdrop-blur-md transition-colors hover:bg-white/20"
      >
        <Search size={18} />
      </button>
    );
  }

  return (
    <div className={floating ? 'relative flex w-full' : 'relative flex flex-1 mx-2 sm:mx-4 md:mx-8 md:max-w-xl'}>
      <div className="flex w-full items-center gap-2 rounded-xl border border-white/10 bg-black/40 px-4 py-2 text-white/50 transition-colors focus-within:border-white/30 focus-within:bg-black/60">
        <Search size={16} className="shrink-0 text-gray-500" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search reels..."
          aria-label="Search reels"
          autoComplete="off"
          autoFocus={floating}
          className="w-full bg-transparent text-sm text-white placeholder-white/40 focus:outline-none"
        />
        {(query || floating) && (
          <button
            type="button"
            onClick={() => {
              clear();
              if (floating) setIsOpen(false);
            }}
            aria-label={floating ? 'Close search' : 'Clear search'}
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-white/40 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X size={13} />
          </button>
        )}
      </div>

      {showResults && (
        <div className="absolute inset-x-0 top-full mt-2 max-h-[70vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#12151C] shadow-[0_24px_80px_rgba(0,0,0,0.6)]">
          {loading && results.length === 0 ? (
            // Skeleton rows shaped like the real results below, not a
            // spinner — consistent with every other "a reel is loading"
            // moment in Reels (see ReelLoading, reused in ReelCard).
            <div className="flex flex-col gap-1 p-2">
              {[0, 1, 2].map((i) => (
                <SkeletonRow key={i} />
              ))}
            </div>
          ) : error && results.length === 0 ? (
            <div className="flex flex-col items-center gap-3 px-4 py-6 text-center">
              <SearchX size={20} className="text-white/30" />
              <p className="text-sm text-white/50">{error}</p>
              <button
                type="button"
                onClick={retry}
                disabled={loading}
                className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <RotateCcw size={12} />
                Retry
              </button>
            </div>
          ) : (
            <>
              <p className="px-4 pb-1 pt-3 text-[10px] font-bold uppercase tracking-widest text-white/40">Videos</p>
              <ul>
                {results.map((video) => (
                  <li key={video.id}>
                    <button
                      type="button"
                      onClick={() => selectResult(video)}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-white/[0.04]"
                    >
                      <div className="relative h-9 w-14 shrink-0 overflow-hidden rounded-lg bg-white/[0.04] sm:h-10 sm:w-16">
                        <Image src={video.thumbnail} alt="" fill unoptimized className="object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-1 text-[13px] font-semibold text-white/80">{video.title}</p>
                        <p className="mt-0.5 truncate text-[11px] text-white/30">{video.channelTitle}</p>
                      </div>
                      <ChevronRight size={14} className="shrink-0 text-white/20" />
                    </button>
                  </li>
                ))}
              </ul>
              {/* Loading the next page (append) — same skeleton row shape,
                  singular, appended after the real results already shown. */}
              {loading && <SkeletonRow />}
              {hasMore && (
                <IntersectionSentinel onVisible={loadMore} />
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

/** One skeleton row, shaped like a real result (thumbnail + two text lines). */
function SkeletonRow() {
  return (
    <div className="flex animate-pulse items-center gap-3 px-4 py-2.5">
      <div className="h-9 w-14 shrink-0 rounded-lg bg-white/10 sm:h-10 sm:w-16" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-3/4 rounded bg-white/10" />
        <div className="h-2.5 w-1/2 rounded bg-white/10" />
      </div>
    </div>
  );
}

/** Tiny self-contained infinite-scroll trigger — the dropdown lives outside ReelsFeed now, so it can't reuse that component's useIntersection instance directly. */
function IntersectionSentinel({ onVisible }: { onVisible: () => void }) {
  return (
    <div
      ref={(el) => {
        if (!el) return;
        const observer = new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting) onVisible();
          },
          { threshold: 0.1 }
        );
        observer.observe(el);
        return () => observer.disconnect();
      }}
      className="h-1 w-full"
    />
  );
}
