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
  const { query, results, loading, error, hasMore, showResults, setQuery, submitSearch, clear, loadMore, retry, selectResult } =
    useReelsSearchStore();
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!loading && results[0]) {
      selectResult(results[0]);
      if (floating) setIsOpen(false);
      return;
    }
    submitSearch();
  };

  const handleSelectResult = (video: (typeof results)[number]) => {
    selectResult(video);
    if (floating) setIsOpen(false);
  };

  if (floating && !isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Search reels"
        className="flex h-9 w-9 cursor-pointer shrink-0 items-center justify-center rounded-full border border-white/15 bg-black/45 text-white shadow-lg backdrop-blur-xl transition-colors hover:bg-black/65"
      >
        <Search size={18} />
      </button>
    );
  }

  return (
    <div className={floating ? 'relative w-[min(19rem,calc(100vw-7rem))] sm:w-[22rem]' : 'relative mx-2 flex max-w-xl flex-1 sm:mx-4 md:mx-8'}>
      <form onSubmit={handleSubmit} className={`flex w-full items-center gap-2 px-3.5 py-2 text-white shadow-lg backdrop-blur-xl transition-colors focus-within:border-white/45 ${floating ? 'rounded-full border border-white/20 bg-black/55' : 'rounded-xl border border-[color:var(--input-border)] bg-[color:var(--input-bg)] text-[color:var(--muted-foreground)] focus-within:border-[color:var(--primary)] focus-within:bg-[color:var(--surface)]'}`}>
        <Search size={16} className={`shrink-0 ${floating ? 'text-white/75' : 'text-[color:var(--muted-foreground)]'}`} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search reels..."
          aria-label="Search reels"
          autoComplete="off"
          autoFocus={floating}
          enterKeyHint="search"
          onKeyDown={(event) => {
            if (event.key === 'Escape' && floating) {
              clear();
              setIsOpen(false);
            }
          }}
          className={`w-full bg-transparent text-sm focus:outline-none ${floating ? 'text-white placeholder:text-white/60' : 'text-[color:var(--foreground)] placeholder:text-[color:var(--muted-foreground)]'}`}
        />
        {(query || floating) && (
          <button
            type="button"
            onClick={() => {
              clear();
              if (floating) setIsOpen(false);
            }}
            aria-label={floating ? 'Close search' : 'Clear search'}
            className="flex h-6 w-6 cursor-pointer shrink-0 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/15 hover:text-white"
          >
            <X size={13} />
          </button>
        )}
      </form>

      {showResults && (
        <div className={`absolute right-0 top-full z-[110] mt-2 max-h-[min(68dvh,34rem)] w-[min(22rem,calc(100vw-1.5rem))] overflow-y-auto overscroll-contain rounded-2xl border border-white/15 bg-[#101216]/95 shadow-[0_20px_70px_rgba(0,0,0,0.65)] backdrop-blur-2xl ${floating ? '' : 'left-0 w-full'}`}>
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
              <SearchX size={20} className="text-[color:var(--muted-foreground)]" />
              <p className="text-sm text-[color:var(--muted-foreground)]">{error}</p>
              <button
                type="button"
                onClick={retry}
                disabled={loading}
                className="flex cursor-pointer items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <RotateCcw size={12} />
                Retry
              </button>
            </div>
          ) : (
            <>
              <p className="px-4 pb-1 pt-3 text-[10px] font-bold uppercase tracking-widest text-[color:var(--muted-foreground)]">Videos</p>
              <ul>
                {results.map((video) => (
                  <li key={video.id}>
                    <button
                      type="button"
                      onClick={() => handleSelectResult(video)}
                      className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-white/[0.08]"
                    >
                      <div className="relative h-9 w-14 shrink-0 overflow-hidden rounded-lg bg-white/[0.04] sm:h-10 sm:w-16">
                        <Image src={video.thumbnail} alt="" fill unoptimized className="object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-1 text-[13px] font-semibold text-white">{video.title}</p>
                        <p className="mt-0.5 truncate text-[11px] text-white/55">{video.channelTitle}</p>
                      </div>
                      <ChevronRight size={14} className="shrink-0 text-[color:var(--muted-foreground)]" />
                    </button>
                  </li>
                ))}
              </ul>
              {error && results.length > 0 && (
                <div className="flex items-center justify-between gap-2 border-t border-white/10 px-4 py-2.5">
                  <p className="text-[11px] text-white/60">{error}</p>
                  <button
                    type="button"
                    onClick={retry}
                    disabled={loading}
                    className="cursor-pointer text-[11px] font-bold text-white hover:text-white/75 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Retry
                  </button>
                </div>
              )}
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
