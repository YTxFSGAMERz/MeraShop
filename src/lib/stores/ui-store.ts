import { create } from 'zustand';

// ── Types ──────────────────────────────────────────────────────────────────

interface UIState {
  isMobileMenuOpen: boolean;
  isSearchOpen: boolean;
  isFilterOpen: boolean;
  activeFilter: string | null;

  // Actions
  toggleMobileMenu: () => void;
  toggleSearch: () => void;
  toggleFilter: (filterName?: string) => void;
  closeAll: () => void;
}

// ── Store ──────────────────────────────────────────────────────────────────

export const useUIStore = create<UIState>()((set, get) => ({
  isMobileMenuOpen: false,
  isSearchOpen: false,
  isFilterOpen: false,
  activeFilter: null,

  toggleMobileMenu: () => {
    set((state) => ({
      isMobileMenuOpen: !state.isMobileMenuOpen,
      // Close others when mobile menu opens
      isSearchOpen: false,
      isFilterOpen: false,
    }));
  },

  toggleSearch: () => {
    set((state) => ({
      isSearchOpen: !state.isSearchOpen,
      // Close others when search opens
      isMobileMenuOpen: false,
      isFilterOpen: false,
    }));
  },

  toggleFilter: (filterName) => {
    const { isFilterOpen, activeFilter } = get();

    if (filterName === undefined) {
      // No argument: simply toggle the filter panel
      set({
        isFilterOpen: !isFilterOpen,
        activeFilter: !isFilterOpen ? null : activeFilter,
        isMobileMenuOpen: false,
        isSearchOpen: false,
      });
      return;
    }

    // Specific filter provided: open the panel and activate that filter
    if (isFilterOpen && activeFilter === filterName) {
      // Clicking the same filter again closes it
      set({ isFilterOpen: false, activeFilter: null });
    } else {
      set({
        isFilterOpen: true,
        activeFilter: filterName,
        isMobileMenuOpen: false,
        isSearchOpen: false,
      });
    }
  },

  closeAll: () => {
    set({
      isMobileMenuOpen: false,
      isSearchOpen: false,
      isFilterOpen: false,
      activeFilter: null,
    });
  },
}));
