import { create } from 'zustand';

interface SawaiStore {
  isOpen: boolean;
  openSawai: () => void;
  closeSawai: () => void;
  toggleSawai: () => void;
}

export const useSawaiStore = create<SawaiStore>((set) => ({
  isOpen: false,
  openSawai: () => set({ isOpen: true }),
  closeSawai: () => set({ isOpen: false }),
  toggleSawai: () => set((state) => ({ isOpen: !state.isOpen })),
}));
