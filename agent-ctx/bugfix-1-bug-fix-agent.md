# Bug Fix Agent Work Record

## Task ID: bugfix-1
## Agent: Bug Fix Agent

## Summary
Fixed 6 critical bugs in the MeraShop e-commerce project.

## Bugs Fixed

1. **Shop Page - Imports After Export Default**: Moved `Heart`, `ShoppingCart`, `Star as StarIcon`, and `Link` imports from lines 647-648 (after the export default function) to the top of the file with other imports.

2. **Shop Page - useSearchParams Without Suspense**: Renamed `ShopPage` to `ShopPageContent`, created a new `ShopPage` that wraps `ShopPageContent` in a `<Suspense>` boundary with `ProductGridSkeleton` fallback.

3. **FAQ Page - useSearchParams Without Suspense**: Renamed `FAQPage` to `FAQPageContent`, created a new `FAQPage` with `<Suspense>` wrapper and skeleton fallback.

4. **Sikkim Typo in Checkout**: Fixed `'Sikkam'` → `'Sikkim'` in the INDIAN_STATES array.

5. **ListProductCard Uses Local Wishlist State**: Replaced `useState(false)` with `useWishlistStore` selectors (`isInWishlist`, `addItem`, `removeItem`). Updated button onClick to properly add/remove items from the global wishlist store.

6. **Cart Page Uses productId Instead of Slug**: Added `slug` field to `CartItem` interface in cart-store.ts. Updated all 4 `addItem` call sites (ProductCard, QuickViewModal, compare page, product detail page) to include slug. Changed cart page links from `/product/${item.productId}` to `/product/${item.slug}`. Fixed `handleMoveToWishlist` to pass `item.slug` instead of `item.productId`.

## Verification
- `bun run lint` passes with zero errors
