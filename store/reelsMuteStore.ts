import { create } from 'zustand';

const noop = () => {};

interface ReelsMuteStore {
  /** True only while /dashboard/reels's ReelsFeed is mounted — lets the
   * top navbar know whether to render the mute toggle at all. */
  active: boolean;
  isMuted: boolean;
  toggleMute: () => void;
}

/**
 * Bridges Reels' mute state (owned by ReelsFeed) up to the shared dashboard
 * Header, which is a sibling in the component tree — not a parent/child of
 * the Reels page — so it can't read this via props. Mirrors
 * store/reelsSearchStore.ts's bridging pattern exactly. Used on phones,
 * where the mute toggle moves from the in-video ReelHeader overlay into the
 * header's compact floating bar, next to search.
 */
export const useReelsMuteStore = create<ReelsMuteStore>(() => ({
  active: false,
  isMuted: true,
  toggleMute: noop,
}));
