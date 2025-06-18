import { create } from 'zustand';

type TabType = 'products' | 'categories' | 'orders' | 'users' | 'settings';

interface AdminViewState {
  currentView: TabType;
  setCurrentView: (view: TabType) => void;
}

export const useAdminViewStore = create<AdminViewState>((set) => ({
  currentView: (localStorage.getItem('adminView') as TabType) || 'products',
  setCurrentView: (view: TabType) => {
    localStorage.setItem('adminView', view);
    set({ currentView: view });
  },
}));
