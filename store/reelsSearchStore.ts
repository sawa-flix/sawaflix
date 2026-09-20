import { create } from 'zustand';
import type { Video } from '@/types/youtube';

const noop = () => {};
const noopAsync = async () => {};

interface ReelsSearchStore {
  /** True only while /dashboard/reels's ReelsFeed is mounted — lets the
   * top navbar know whether to render Reels' own search bar at all, as
   * opposed to the normal global search (which stays suppressed on this
   * route regardless, via Header's existing searchDisabled prop). */
  active: boolean;
  query: string;
  results: Video[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  /** Whether the results dropdown should be open (searchMode === 'searching' in ReelsFeed). */
  showResults: boolean;
  setQuery: (value: string) => void;
  clear: () => void;
  loadMore: () => void;
  retry: () => void;
  selectResult: (video: Video) => void;
}

/**
 * Bridges Reels' own search (owned by useReelsSearch, deep inside
 * ReelsFeed) up to the shared dashboard Header, which is a sibling in the
 * component tree — not a parent/child of the Reels page — so it can't read
 * that state via props. ReelsFeed registers the real state/handlers here on
 * mount and clears them on unmount; Header (via ReelsSearchBar) only ever
 * reads from and calls into this store, never owns any search logic itself.
 */
export const useReelsSearchStore = create<ReelsSearchStore>(() => ({
  active: false,
  query: '',
  results: [],
  loading: false,
  error: null,
  hasMore: false,
  showResults: false,
  setQuery: noop,
  clear: noop,
  loadMore: noopAsync,
  retry: noopAsync,
  selectResult: noop,
}));
