import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ── Types ──────────────────────────────────────────────────────────────────

interface ComparisonState {
  productIds: string[];

  // Actions
  addToCompare: (productId: string) => void;
  removeFromCompare: (productId: string) => void;
  clearComparison: () => void;
  isInComparison: (productId: string) => boolean;
}

// ── Constants ──────────────────────────────────────────────────────────────

const MAX_COMPARE = 4;

// ── Store ──────────────────────────────────────────────────────────────────

export const useComparisonStore = create<ComparisonState>()(
  persist(
    (set, get) => ({
      productIds: [],

      addToCompare: (productId: string) => {
        set((state) => {
          if (state.productIds.includes(productId)) return state;
          if (state.productIds.length >= MAX_COMPARE) return state;
          return { productIds: [...state.productIds, productId] };
        });
      },

      removeFromCompare: (productId: string) => {
        set((state) => ({
          productIds: state.productIds.filter((id) => id !== productId),
        }));
      },

      clearComparison: () => {
        set({ productIds: [] });
      },

      isInComparison: (productId: string) => {
        return get().productIds.includes(productId);
      },
    }),
    {
      name: 'merashop-comparison',
      partialize: (state) => ({ productIds: state.productIds }) as ComparisonState,
    },
  ),
);
