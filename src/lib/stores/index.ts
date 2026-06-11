// ── Barrel export for all Zustand stores ────────────────────────────────────

export { useCartStore } from './cart-store';
export type { CartItem } from './cart-store';

export { useWishlistStore } from './wishlist-store';
export type { WishlistItem } from './wishlist-store';

export { useAuthStore } from './auth-store';
export type { User } from './auth-store';

export { useUIStore } from './ui-store';

export { useRecentlyViewedStore } from './recently-viewed-store';
export type { ViewedProduct } from './recently-viewed-store';

export { useComparisonStore } from './comparison-store';
