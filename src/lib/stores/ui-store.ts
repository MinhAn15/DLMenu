import { create } from 'zustand';

interface UIState {
  sidebarOpen: boolean;
  selectedShopId: string | null;
  theme: 'light' | 'dark' | 'system';
  toggleSidebar: () => void;
  setSelectedShopId: (id: string | null) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  reset: () => void;
}

const initialState = {
  sidebarOpen: true,
  selectedShopId: null,
  theme: 'system' as const,
};

export const useUIStore = create<UIState>()((set) => ({
  ...initialState,

  toggleSidebar: () =>
    set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  setSelectedShopId: (id) =>
    set({ selectedShopId: id }),

  setTheme: (theme) =>
    set({ theme }),

  reset: () =>
    set(initialState),
}));
