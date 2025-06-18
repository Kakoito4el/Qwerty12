// src/store/activeTabStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ActiveTabState {
  activeTab: 'products' | 'categories';
  setActiveTab: (tab: 'products' | 'categories') => void;
}

export const useActiveTabStore = create<ActiveTabState>()(
  persist(
    (set) => ({
      activeTab: 'products',
      setActiveTab: (tab) => set({ activeTab: tab }),
    }),
    {
      name: 'active-tab',
      getStorage: () => localStorage,
    }
  )
);