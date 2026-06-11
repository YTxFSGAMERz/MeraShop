'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ── Types ──────────────────────────────────────────────────────────────────

export interface ViewedProduct {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  salePrice: number | null;
  image: string;
  brand?: string;
}

interface RecentlyViewedState {
  items: ViewedProduct[];

  // Actions
  addViewedProduct: (productId: string, product: ViewedProduct) => void;
  getRecentlyViewed: (currentProductId?: string) => ViewedProduct[];
  clearRecentlyViewed: () => void;
}

const MAX_ITEMS = 20;

// ── Store ──────────────────────────────────────────────────────────────────

export const useRecentlyViewedStore = create<RecentlyViewedState>()(
  persist(
    (set, get) => ({
      items: [],

      addViewedProduct: (productId, product) => {
        set((state) => {
          // Remove existing entry for this product (to move it to front)
          const filtered = state.items.filter((item) => item.id !== productId);

          // Add to front, limit to MAX_ITEMS
          const updated = [product, ...filtered].slice(0, MAX_ITEMS);

          return { items: updated };
        });
      },

      getRecentlyViewed: (currentProductId) => {
        const items = get().items;
        if (currentProductId) {
          return items.filter((item) => item.id !== currentProductId);
        }
        return items;
      },

      clearRecentlyViewed: () => {
        set({ items: [] });
      },
    }),
    {
      name: 'merashop-recently-viewed',
      partialize: (state) => ({ items: state.items }) as RecentlyViewedState,
    },
  ),
);
