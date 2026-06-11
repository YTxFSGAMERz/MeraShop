import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ── Types ──────────────────────────────────────────────────────────────────

export interface CartItem {
  productId: string;
  name: string;
  slug: string;
  price: number;
  salePrice?: number;
  image: string;
  quantity: number;
  variantId?: string;
  variantName?: string;
}

interface CartState {
  items: CartItem[];

  // Actions
  addItem: (
    product: Omit<CartItem, 'quantity'>,
    quantity?: number,
    variantId?: string,
    variantName?: string,
  ) => void;
  removeItem: (productId: string, variantId?: string) => void;
  updateQuantity: (productId: string, quantity: number, variantId?: string) => void;
  clearCart: () => void;

  // Computed getters
  getItemCount: () => number;
  getSubtotal: () => number;
  getDiscount: () => number;
  getTotal: () => number;
}

// ── Helpers ────────────────────────────────────────────────────────────────

/** Unique key for a cart line item (product + optional variant). */
const itemKey = (productId: string, variantId?: string) =>
  variantId ? `${productId}::${variantId}` : productId;

// ── Store ──────────────────────────────────────────────────────────────────

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      // ── Actions ────────────────────────────────────────────────────────

      addItem: (product, quantity = 1, variantId, variantName) => {
        set((state) => {
          const key = itemKey(product.productId, variantId);
          const existingIndex = state.items.findIndex(
            (item) => itemKey(item.productId, item.variantId) === key,
          );

          if (existingIndex >= 0) {
            // Increment quantity for existing item
            const updated = [...state.items];
            updated[existingIndex] = {
              ...updated[existingIndex],
              quantity: updated[existingIndex].quantity + quantity,
            };
            return { items: updated };
          }

          // Add new item
          return {
            items: [
              ...state.items,
              {
                ...product,
                quantity,
                variantId: variantId ?? product.variantId,
                variantName: variantName ?? product.variantName,
              },
            ],
          };
        });
      },

      removeItem: (productId, variantId) => {
        set((state) => {
          const key = itemKey(productId, variantId);
          return {
            items: state.items.filter(
              (item) => itemKey(item.productId, item.variantId) !== key,
            ),
          };
        });
      },

      updateQuantity: (productId, quantity, variantId) => {
        set((state) => {
          if (quantity <= 0) {
            const key = itemKey(productId, variantId);
            return {
              items: state.items.filter(
                (item) => itemKey(item.productId, item.variantId) !== key,
              ),
            };
          }

          return {
            items: state.items.map((item) => {
              const key = itemKey(item.productId, item.variantId);
              const targetKey = itemKey(productId, variantId);
              if (key === targetKey) {
                return { ...item, quantity };
              }
              return item;
            }),
          };
        });
      },

      clearCart: () => {
        set({ items: [] });
      },

      // ── Computed ───────────────────────────────────────────────────────

      getItemCount: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getSubtotal: () => {
        return get().items.reduce((total, item) => {
          const unitPrice = item.salePrice ?? item.price;
          return total + unitPrice * item.quantity;
        }, 0);
      },

      getDiscount: () => {
        return get().items.reduce((total, item) => {
          if (item.salePrice !== undefined && item.salePrice < item.price) {
            return total + (item.price - item.salePrice) * item.quantity;
          }
          return total;
        }, 0);
      },

      getTotal: () => {
        // Total equals subtotal for now; adjustments (shipping, coupons) can be
        // layered on top in a future iteration.
        return get().getSubtotal();
      },
    }),
    {
      name: 'merashop-cart',
      partialize: (state) => ({ items: state.items }) as CartState,
    },
  ),
);
