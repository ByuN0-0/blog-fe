import { create } from "zustand";

type UiState = {
  isAdminSidebarOpen: boolean;
  setAdminSidebarOpen: (isOpen: boolean) => void;
  toggleAdminSidebar: () => void;
};

export const useUiStore = create<UiState>((set) => ({
  isAdminSidebarOpen: true,
  setAdminSidebarOpen: (isOpen) => set({ isAdminSidebarOpen: isOpen }),
  toggleAdminSidebar: () =>
    set((state) => ({ isAdminSidebarOpen: !state.isAdminSidebarOpen })),
}));
