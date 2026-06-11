# Component Documentation

This document covers all custom components in MeraShop. shadcn/ui primitives are listed but not fully documented — refer to the [shadcn/ui docs](https://ui.shadcn.com/) for those.

---

## Table of Contents

- [Layout Components](#layout-components)
- [Marketing Components](#marketing-components)
- [Shop Components](#shop-components)
- [shadcn/ui Components](#shadcnui-components)
- [Zustand Stores](#zustand-stores)
- [Custom Hooks](#custom-hooks)

---

## Layout Components

Located in `src/components/layout/`

### SiteHeader

**File**: `SiteHeader.tsx`  
**Type**: Client Component (`'use client'`)  
**Import**: `import { SiteHeader } from '@/components/layout/SiteHeader'`

The main application header with sticky positioning, blur backdrop on scroll, and responsive navigation.

**Features**:
- Sticky header with blur effect on scroll
- Logo + site name
- Desktop mega-menu navigation (Categories dropdown)
- Search bar toggle (expandable)
- Notification center
- Dark/Light theme toggle with animated icon
- Wishlist badge (desktop)
- Cart badge with item count
- Account link (desktop)
- Recent search history dropdown

**Props**: None (reads from Zustand stores)

**Dependencies**:
- `useCartStore` — cart item count badge
- `useWishlistStore` — wishlist count badge
- `useUIStore` — search bar open/close state
- `useAuthStore` — user session state
- `next-themes` — theme toggle

---

### SiteFooter

**File**: `SiteFooter.tsx`  
**Type**: Server/Client Component  
**Import**: `import { SiteFooter } from '@/components/layout/SiteFooter'`

Footer with links, newsletter signup, and copyright.

---

### MobileMenu

**File**: `MobileMenu.tsx`  
**Type**: Client Component  
**Import**: `import { MobileMenu } from '@/components/layout/MobileMenu'`

Slide-out navigation drawer for mobile devices.

**Features**:
- Hamburger icon trigger
- Sheet/drawer slide animation
- Category navigation links
- Auth links (Login/Register or Account)
- Quick links (Wishlist, Orders, etc.)

---

### MobileBottomNav

**File**: `MobileBottomNav.tsx`  
**Type**: Client Component  
**Import**: `import { MobileBottomNav } from '@/components/layout/MobileBottomNav'`

Fixed bottom navigation bar visible on mobile screens.

**Items**: Home, Shop, Cart, Wishlist, Account

---

### SearchBar

**File**: `SearchBar.tsx`  
**Type**: Client Component  
**Import**: `import { SearchBar } from '@/components/layout/SearchBar'`

Expandable search input with autocomplete and recent searches.

**Features**:
- Search input with keyboard shortcut (Ctrl+K)
- Redirects to `/shop?search=query`
- Saves search history to localStorage

---

### NotificationCenter

**File**: `NotificationCenter.tsx`  
**Type**: Client Component  
**Import**: `import { NotificationCenter } from '@/components/layout/NotificationCenter'`

Bell icon with dropdown showing recent notifications (cart adds, wishlist, etc.).

---

### Breadcrumb

**File**: `Breadcrumb.tsx`  
**Type**: Client Component  
**Import**: `import { Breadcrumb } from '@/components/layout/Breadcrumb'`

Breadcrumb navigation for category and product pages.

---

## Marketing Components

Located in `src/components/marketing/`. Used primarily on the homepage.

### HeroBanner

**File**: `HeroBanner.tsx`  
**Type**: Client Component  
**Import**: `import { HeroBanner } from '@/components/marketing/HeroBanner'`

Full-width hero carousel with sale countdown and CTA buttons.

**Features**:
- Auto-playing carousel (5s interval)
- Parallax scroll effect on images
- Sale countdown timer
- Staggered Framer Motion entrance animations
- Floating decorative elements (circles, stars)
- Indian-themed gradient backgrounds
- Dot indicators for slide navigation
- Desktop and mobile navigation arrows
- Fallback slides when API banners are unavailable

**Data Source**: `GET /api/banners?position=hero`

**Props**: None

---

### CategoryShowcase

**File**: `CategoryShowcase.tsx`  
**Type**: Client Component

Grid of category cards with images and product counts.

**Data Source**: `GET /api/categories?includeProducts=true`

---

### DealsSection

**File**: `DealsSection.tsx`  
**Type**: Client Component

Flash deals section with countdown timer and "claimed" progress bars.

**Data Source**: `GET /api/products?bestseller=true&limit=8`

---

### FeaturedProducts

**File**: `FeaturedProducts.tsx`  
**Type**: Client Component

Horizontal scrollable row of featured products.

**Data Source**: `GET /api/products?featured=true&limit=12`

---

### NewArrivals

**File**: `NewArrivals.tsx`  
**Type**: Client Component

Section highlighting newly arrived products.

**Data Source**: `GET /api/products?newArrival=true&limit=8`

---

### BrandShowcase

**File**: `BrandShowcase.tsx`  
**Type**: Client Component

Logo grid of featured brands.

---

### FlashSaleBanner

**File**: `FlashSaleBanner.tsx`  
**Type**: Client Component

Compact banner with live countdown for flash sales.

---

### PromoStrip

**File**: `PromoStrip.tsx`  
**Type**: Client Component

Thin horizontal strip showing promotional messages (e.g., "Free delivery over ₹499").

---

### TrustBadges

**File**: `TrustBadges.tsx`  
**Type**: Client Component

Row of trust indicators (Free Delivery, Easy Returns, Secure Payment, 24/7 Support).

---

### Testimonials

**File**: `Testimonials.tsx`  
**Type**: Client Component

Customer testimonial carousel with ratings.

---

### NewsletterSection

**File**: `NewsletterSection.tsx`  
**Type**: Client Component

Email subscription form with heading and CTA.

**API**: `POST /api/newsletter`

---

### FAQSection

**File**: `FAQSection.tsx`  
**Type**: Client Component

Expandable FAQ accordion on the homepage.

**Data Source**: `GET /api/faq`

---

## Shop Components

Located in `src/components/shop/`. These are the core e-commerce UI components.

### ProductCard

**File**: `ProductCard.tsx`  
**Type**: Client Component  
**Import**: `import { ProductCard } from '@/components/shop/ProductCard'`

The primary product display card used in grids throughout the app.

**Props**:

```typescript
interface ProductCardProduct {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  salePrice?: number;
  images: { url: string; isPrimary: boolean }[];
  avgRating: number;
  reviewCount: number;
  brand?: { name: string };
  stock: number;
  isNewArrival?: boolean;
  isBestseller?: boolean;
  totalSold?: number;
  colorVariants?: string[];
  createdAt?: string;
}

interface ProductCardProps {
  product: ProductCardProduct;
  className?: string;
  showQuickView?: boolean; // default: true
}
```

**Features**:
- Discount percentage badge (top-left, spring animation)
- "Save ₹X" badge on hover (desktop)
- Trending / Limited Time / Top Rated dynamic badges
- Wishlist heart toggle with fill animation
- Compare scale toggle (desktop)
- Quick View eye icon (mobile: top-left, desktop: hover overlay)
- "New" and "Bestseller" status badges
- Color variant dots (bottom-right)
- Stock progress bar for low-stock items
- "X% claimed" progress bar for bestsellers
- Add to Cart button with gradient and success animation
- RatingStars display
- PriceDisplay with MRP strikethrough

---

### ProductGrid

**File**: `ProductGrid.tsx`  
**Type**: Client Component  
**Import**: `import { ProductGrid } from '@/components/shop/ProductGrid'`

Responsive grid layout for ProductCard components.

**Features**:
- 2 columns on mobile, 3 on tablet, 4 on desktop
- Framer Motion staggered entrance animation
- Empty state when no products

---

### QuickViewModal

**File**: `QuickViewModal.tsx`  
**Type**: Client Component  
**Import**: `import { QuickViewModal } from '@/components/shop/QuickViewModal'`

Modal dialog showing product details without leaving the current page.

**Props**:

```typescript
interface QuickViewModalProps {
  product: ProductCardProduct;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
```

**Features**:
- Product image carousel
- Variant selection
- Add to cart
- Link to full product page

---

### PriceDisplay

**File**: `PriceDisplay.tsx`  
**Type**: Client Component  
**Import**: `import { PriceDisplay } from '@/components/shop/PriceDisplay'`

Formatted price display with MRP, sale price, and discount.

**Props**:

```typescript
interface PriceDisplayProps {
  price: number;        // MRP / base price
  salePrice?: number;   // Sale price
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}
```

---

### RatingStars

**File**: `RatingStars.tsx`  
**Type**: Client Component  
**Import**: `import { RatingStars } from '@/components/shop/RatingStars'`

Star rating display with count.

**Props**:

```typescript
interface RatingStarsProps {
  rating: number;       // 0–5
  reviewCount?: number;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;  // default: true
}
```

---

### FilterDrawer

**File**: `FilterDrawer.tsx`  
**Type**: Client Component  
**Import**: `import { FilterDrawer } from '@/components/shop/FilterDrawer'`

Mobile drawer / desktop sidebar with product filters.

**Features**:
- Category filter (checkboxes)
- Brand filter
- Price range slider
- Rating filter
- Clear all / Apply buttons

---

### SortSheet

**File**: `SortSheet.tsx`  
**Type**: Client Component  
**Import**: `import { SortSheet } from '@/components/shop/SortSheet'`

Bottom sheet for selecting sort order (mobile-friendly).

**Options**: Newest, Price Low→High, Price High→Low, Rating, Bestseller

---

### RazorpayCheckout

**File**: `RazorpayCheckout.tsx`  
**Type**: Client Component  
**Import**: `import { RazorpayCheckout } from '@/components/shop/RazorpayCheckout'`

Razorpay payment integration component.

**Features**:
- Creates Razorpay order via API
- Opens Razorpay checkout modal
- Verifies payment signature
- Handles success/failure redirects

---

### CompareDrawer

**File**: `CompareDrawer.tsx`  
**Type**: Client Component  
**Import**: `import { CompareDrawer } from '@/components/shop/CompareDrawer'`

Slide-out drawer showing side-by-side product comparison (up to 4 products).

**Data Source**: `GET /api/products/compare?ids=...`

---

### ImageZoom

**File**: `ImageZoom.tsx`  
**Type**: Client Component

Hover-to-zoom on product detail page images.

---

### PincodeChecker

**File**: `PincodeChecker.tsx`  
**Type**: Client Component

Input to check delivery availability and estimated date by pincode.

---

### SizeGuide

**File**: `SizeGuide.tsx`  
**Type**: Client Component

Modal showing clothing size chart (XS–3XL measurements).

---

### StockAlert

**File**: `StockAlert.tsx`  
**Type**: Client Component

Email subscription form for out-of-stock product notifications.

**API**: `POST /api/stock-alert`

---

### ReviewForm

**File**: `ReviewForm.tsx`  
**Type**: Client Component

Form for submitting product reviews (1–5 star rating, title, comment).

**API**: `POST /api/reviews`

---

### ReviewsSummary

**File**: `ReviewsSummary.tsx`  
**Type**: Client Component

Star distribution bar chart + average rating display.

---

### ProductQA

**File**: `ProductQA.tsx`  
**Type**: Client Component

Product Q&A section with AI-powered answers.

**API**: `GET /api/questions`, `POST /api/questions`, `POST /api/ai-answer`

---

### AlsoBought

**File**: `AlsoBought.tsx`  
**Type**: Client Component

"Customers also bought" product carousel.

---

### RecentlyViewed

**File**: `RecentlyViewed.tsx`  
**Type**: Client Component

Horizontal scroll of recently viewed products (from Zustand store).

---

### ShareButton

**File**: `ShareButton.tsx`  
**Type**: Client Component

Share button using Web Share API or copy-to-clipboard fallback.

---

### CategoryPills

**File**: `CategoryPills.tsx`  
**Type**: Client Component

Horizontal scrollable pill-style category navigation.

---

### CategoryCard

**File**: `CategoryCard.tsx`  
**Type**: Client Component

Category card with image and name, used in grids.

---

### EmptyState

**File**: `EmptyState.tsx`  
**Type**: Client Component

Reusable empty state with icon, heading, and CTA.

**Props**:

```typescript
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: { label: string; href: string };
}
```

---

### LoadingSkeleton

**File**: `LoadingSkeleton.tsx`  
**Type**: Client Component

Collection of skeleton loading placeholders:
- `ProductCardSkeleton` — For product cards
- `HeroSkeleton` — For hero banner
- `ProductGridSkeleton` — For product grid (6 cards)

---

### AIAssistant

**File**: `AIAssistant.tsx`  
**Type**: Client Component

Floating AI chatbot button with expandable chat interface.

**Features**:
- Floating action button (bottom-right)
- Expandable chat panel
- Message history
- Typing indicator
- Fallback responses

**API**: `POST /api/ai-chat`

---

## shadcn/ui Components

Located in `src/components/ui/`. 40+ components from the shadcn/ui library (New York style).

| Component | File | Usage |
|-----------|------|-------|
| Accordion | `accordion.tsx` | FAQ sections |
| Alert | `alert.tsx` | Form alerts |
| AlertDialog | `alert-dialog.tsx` | Confirmations |
| AspectRatio | `aspect-ratio.tsx` | Image containers |
| Avatar | `avatar.tsx` | User avatars |
| Badge | `badge.tsx` | Status badges, product badges |
| Breadcrumb | `breadcrumb.tsx` | Navigation breadcrumbs |
| Button | `button.tsx` | Primary UI element |
| Calendar | `calendar.tsx` | Date pickers |
| Card | `card.tsx` | Content containers |
| Carousel | `carousel.tsx` | Hero banner, product carousels |
| Chart | `chart.tsx` | Admin dashboard charts |
| Checkbox | `checkbox.tsx` | Filters, forms |
| Collapsible | `collapsible.tsx` | Expandable sections |
| Command | `command.tsx` | Search command palette |
| ContextMenu | `context-menu.tsx` | Right-click menus |
| Dialog | `dialog.tsx` | Modals, quick view |
| Drawer | `drawer.tsx` | Mobile filter drawer |
| DropdownMenu | `dropdown-menu.tsx` | User menu, sort options |
| Form | `form.tsx` | React Hook Form integration |
| HoverCard | `hover-card.tsx` | Product preview on hover |
| Input | `input.tsx` | Text inputs |
| InputOTP | `input-otp.tsx` | OTP verification |
| Label | `label.tsx` | Form labels |
| Menubar | `menubar.tsx` | Desktop menu bar |
| NavigationMenu | `navigation-menu.tsx` | Category navigation |
| Pagination | `pagination.tsx` | Product listing pagination |
| Popover | `popover.tsx` | Tooltip popups |
| Progress | `progress.tsx` | Stock progress bars |
| RadioGroup | `radio-group.tsx` | Payment method selection |
| Resizable | `resizable.tsx` | Resizable panels |
| ScrollArea | `scroll-area.tsx` | Scrollable containers |
| ScrollToTop | `scroll-to-top.tsx` | Floating scroll-to-top button |
| Select | `select.tsx` | Dropdown selects |
| Separator | `separator.tsx` | Visual dividers |
| Sheet | `sheet.tsx` | Mobile side panels |
| Sidebar | `sidebar.tsx` | Admin sidebar |
| Skeleton | `skeleton.tsx` | Loading placeholders |
| Slider | `slider.tsx` | Price range filter |
| Sonner (Toaster) | `sonner.tsx` | Toast notifications |
| Switch | `switch.tsx` | Toggle switches |
| Table | `table.tsx` | Admin data tables |
| Tabs | `tabs.tsx` | Product detail tabs |
| Textarea | `textarea.tsx` | Multi-line inputs |
| Toast | `toast.tsx` | Notification toasts |
| Toggle | `toggle.tsx` | Toggle buttons |
| ToggleGroup | `toggle-group.tsx` | Grouped toggles |
| Tooltip | `tooltip.tsx` | Hover tooltips |

---

## Zustand Stores

Located in `src/lib/stores/`

### Cart Store

**File**: `cart-store.ts`  
**Persistence**: `localStorage` (key: `merashop-cart`)

```typescript
interface CartItem {
  productId: string;
  name: string;
  slug: string;
  price: number;         // MRP
  salePrice?: number;    // Sale price
  image: string;
  quantity: number;
  variantId?: string;
  variantName?: string;
}

interface CartState {
  items: CartItem[];
  addItem: (product: Omit<CartItem, 'quantity'>, quantity?: number, variantId?: string, variantName?: string) => void;
  removeItem: (productId: string, variantId?: string) => void;
  updateQuantity: (productId: string, quantity: number, variantId?: string) => void;
  clearCart: () => void;
  getItemCount: () => number;
  getSubtotal: () => number;
  getDiscount: () => number;
  getTotal: () => number;
}
```

**Key Design**: Items are keyed by `productId::variantId` to support multiple variants of the same product.

---

### Auth Store

**File**: `auth-store.ts`  
**Persistence**: `localStorage`

```typescript
interface AuthUser {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  role: 'customer' | 'admin' | 'seller';
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (user: AuthUser) => void;
  logout: () => void;
  updateUser: (data: Partial<AuthUser>) => void;
}
```

---

### Wishlist Store

**File**: `wishlist-store.ts`  
**Persistence**: `localStorage`

```typescript
interface WishlistItem {
  productId: string;
  name: string;
  price: number;
  salePrice?: number;
  image: string;
  slug: string;
}

interface WishlistState {
  items: WishlistItem[];
  addItem: (item: WishlistItem) => void;
  removeItem: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
}
```

---

### Comparison Store

**File**: `comparison-store.ts`  
**Persistence**: `localStorage`

```typescript
interface ComparisonState {
  productIds: string[];  // Max 4
  addToCompare: (productId: string) => void;
  removeFromCompare: (productId: string) => void;
  isInComparison: (productId: string) => boolean;
  clearComparison: () => void;
}
```

---

### Recently Viewed Store

**File**: `recently-viewed-store.ts`  
**Persistence**: `localStorage`

Stores the last 10 viewed product IDs.

---

### UI Store

**File**: `ui-store.ts`  
**Persistence**: None (ephemeral)

```typescript
interface UIState {
  isSearchOpen: boolean;
  toggleSearch: () => void;
  closeAll: () => void;
}
```

---

## Custom Hooks

Located in `src/hooks/`

### useHydrated

**File**: `use-hydrated.ts`

Returns `true` after the component has mounted on the client. Used to prevent hydration mismatches with persisted state.

```typescript
const hydrated = useHydrated();
// Returns false on server, true after client mount
```

---

### useMobile

**File**: `use-mobile.ts`

Detects if the viewport is mobile-sized (below 768px).

```typescript
const isMobile = useMobile();
```

---

### useToast

**File**: `use-toast.ts`

Toast notification hook (from shadcn/ui).

```typescript
const { toast } = useToast();
toast({ title: "Added to cart", description: "Product name" });
```
