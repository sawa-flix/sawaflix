'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronRight, RotateCcw, Search, SearchX, X } from 'lucide-react';
import { useReelsSearchStore } from '@/store/reelsSearchStore';

/**
 * Reels' own search — rendered inside the shared dashboard Header (top
 * navbar) only while /dashboard/reels is mounted, in the same slot the
 * global search normally occupies there (which stays suppressed on this
 * route via Header's existing searchDisabled prop). All state/actions come
 * from useReelsSearchStore, which ReelsFeed keeps in sync — this component
 * owns no search logic itself, purely presentation.
 *
 * Icon button that opens a spotlight-style modal, matching the home page's
 * own search (components/Dashboard/Header.tsx's isSearchFocused modal)
 * exactly in structure/animation — not a second, differently-behaving
 * search pattern.
 */
export function ReelsSearchBar() {
  const [isOpen, setIsOpen] = useState(false);
  const { query, results, loading, error, hasMore, setQuery, clear, loadMore, retry, selectResult } =
    useReelsSearchStore();

  // Dismissing without picking a result abandons the search entirely — the
  // paused reel underneath (ReelsFeed pauses whenever a query is active)
  // needs `clear()` too, not just hiding the modal, or it would stay
  // paused with no visible search UI to explain why.
  const dismiss = () => {
    setIsOpen(false);
    clear();
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dismiss();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="p-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
        aria-label="Search reels"
      >
        <Search size={18} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={dismiss}
              className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-[6px]"
            />

            <div className="fixed inset-0 z-[101] flex items-start justify-center pt-[8vh] sm:pt-[12vh] px-3 sm:px-4 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -12, scale: 0.97 }}
                transition={{ type: 'spring', damping: 28, stiffness: 350 }}
                className="w-full max-w-[560px] bg-[#12151C] border border-white/[0.08] rounded-xl sm:rounded-2xl shadow-[0_24px_80px_rgba(0,0,0,0.6)] overflow-hidden pointer-events-auto flex flex-col max-h-[70vh] sm:max-h-[65vh]"
              >
                <div className="relative w-full shrink-0">
                  <Search className="absolute left-4 sm:left-5 top-1/2 transform -translate-y-1/2 text-white/30" size={18} />
                  <input
                    autoFocus
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search reels..."
                    aria-label="Search reels"
                    autoComplete="off"
                    className="w-full pl-11 sm:pl-13 pr-11 py-3.5 sm:py-4 bg-transparent
                               text-white text-[15px] sm:text-base placeholder-white/25 focus:outline-none tracking-wide"
                  />
                  {query ? (
                    <button
                      type="button"
                      onClick={clear}
                      aria-label="Clear search"
                      className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 p-1.5 rounded-md text-white/30 hover:text-white/60 hover:bg-white/5 transition-all"
                    >
                      <X size={14} />
                    </button>
                  ) : (
                    <kbd className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium text-white/20 bg-white/[0.04] border border-white/[0.06] rounded">
                      ESC
                    </kbd>
                  )}
                  <div className="absolute bottom-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
                </div>

                <div className="overflow-y-auto flex-1 overscroll-contain" style={{ scrollbarWidth: 'none' }}>
                  {query.trim() ? (
                    loading && results.length === 0 ? (
                      <div className="flex flex-col gap-1 p-2">
                        {[0, 1, 2].map((i) => (
                          <SkeletonRow key={i} />
                        ))}
                      </div>
                    ) : error && results.length === 0 ? (
                      <div className="flex flex-col items-center gap-3 px-4 py-10 text-center">
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
                      <div className="py-2">
                        <p className="px-4 py-2 text-[10px] font-bold tracking-[0.15em] uppercase text-white/25">Videos</p>
                        <ul>
                          {results.map((video) => (
                            <li key={video.id}>
                              <button
                                type="button"
                                onClick={() => {
                                  // Just hides the modal — deliberately no
                                  // clear() here, since the underlying
                                  // search stays active while viewing this
                                  // result (see ReelsFeed's searchMode).
                                  selectResult(video);
                                  setIsOpen(false);
                                }}
                                className="flex items-center gap-3 w-full px-4 py-2 hover:bg-white/[0.04] transition-colors text-left group"
                              >
                                <div className="w-14 h-9 sm:w-16 sm:h-10 relative rounded-lg overflow-hidden flex-shrink-0 bg-white/[0.04]">
                                  <Image src={video.thumbnail} alt="" fill className="object-cover" unoptimized />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-[13px] font-semibold text-white/80 line-clamp-1 group-hover:text-white transition-colors">
                                    {video.title}
                                  </h4>
                                  <p className="text-[11px] text-white/30 truncate mt-0.5">{video.channelTitle}</p>
                                </div>
                                <ChevronRight size={12} className="text-white/10 group-hover:text-white/30 transition-colors flex-shrink-0" />
                              </button>
                            </li>
                          ))}
                        </ul>
                        {/* Loading the next page (append) — same skeleton row shape. */}
                        {loading && <SkeletonRow />}
                        {hasMore && <IntersectionSentinel onVisible={loadMore} />}
                      </div>
                    )
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-white/20">
                      <Search size={20} className="mb-2 opacity-30" />
                      <p className="text-[13px]">Search reels</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
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

/** Tiny self-contained infinite-scroll trigger — the modal lives outside ReelsFeed, so it can't reuse that component's useIntersection instance directly. */
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
