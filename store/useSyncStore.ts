import { create } from 'zustand';

interface SyncStore {
  pendingCount: number;
  syncing: boolean;
  setPendingCount: (count: number) => void;
  setSyncing: (syncing: boolean) => void;
}

export const useSyncStore = create<SyncStore>((set) => ({
  pendingCount: 0,
  syncing: false,
  setPendingCount: (count) => set({ pendingCount: count }),
  setSyncing: (syncing) => set({ syncing }),
}));
