import { create } from 'zustand';
import type { Video } from '@/types/youtube';

interface HomeSearchStore {
  /** Non-empty only while a search's results are overriding the home page's Reels row. */
  query: string;
  results: Video[];
  clear: () => void;
}

/**
 * Bridges the home page's search (Header.tsx, a sibling of the page content
 * in the component tree, not a parent) to the Reels row on the home page
 * itself (DashboardLanding.tsx). Clicking a video result there doesn't play
 * it directly — it sets these results here, and DashboardLanding shows them
 * in place of its normal Reels preview row; picking a card from that row is
 * what actually opens the video into the real Reels page.
 */
export const useHomeSearchStore = create<HomeSearchStore>((set) => ({
  query: '',
  results: [],
  clear: () => set({ query: '', results: [] }),
}));
