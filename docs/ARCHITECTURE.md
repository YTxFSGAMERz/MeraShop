# Architecture Documentation

## System Architecture Overview

MeraShop follows a **monolithic full-stack architecture** built on Next.js 16 with the App Router pattern. The application serves both the frontend UI and backend API from a single deployment unit, leveraging Next.js Route Handlers for the API layer.

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client (Browser)                         │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────┐    │
│  │ React Pages │  │ Zustand Store│  │ TanStack Query Cache│    │
│  │  + Framer   │  │ (Cart, Auth, │  │  (Server State)     │    │
│  │   Motion    │  │  Wishlist…)  │  │                     │    │
│  └──────┬──────┘  └──────┬───────┘  └──────────┬─────────┘    │
│         │                │                      │               │
│         └────────────────┼──────────────────────┘               │
│                          │ fetch()                              │
└──────────────────────────┼──────────────────────────────────────┘
                           │
┌──────────────────────────┼──────────────────────────────────────┐
│                   Next.js 16 App Router                         │
│                          │                                      │
│  ┌───────────────────────┼───────────────────────────┐         │
│  │              Server-Side Layer                      │         │
│  │  ┌──────────────┐  ┌─┴──────────────┐  ┌───────┐ │         │
│  │  │ SSR/SSG Pages│  │ API Route       │  │  Mdw  │ │         │
│  │  │ (React Server│  │ Handlers        │  │(none) │ │         │
│  │  │  Components) │  │ (/api/*)        │  │       │ │         │
│  │  └──────┬───────┘  └───────┬────────┘  └───────┘ │         │
│  │         │                  │                       │         │
│  └─────────┼──────────────────┼───────────────────────┘         │
│            │                  │                                  │
│  ┌─────────┼──────────────────┼───────────────────────┐         │
│  │         │    Prisma ORM Layer    │                  │         │
│  │  ┌──────┴───────────────────────┴──────────────┐   │         │
│  │  │          Prisma Client (Singleton)           │   │         │
│  │  │         @prisma/client via lib/db.ts         │   │         │
│  │  └──────────────────┬───────────────────────────┘   │         │
│  └─────────────────────┼───────────────────────────────┘         │
│                        │                                         │
│  ┌─────────────────────┼───────────────────────────────┐         │
│  │              SQLite Database                         │         │
│  │         db/custom.db (via Prisma)                    │         │
│  └─────────────────────────────────────────────────────┘         │
└──────────────────────────────────────────────────────────────────┘
```

---

## Frontend Architecture

### Next.js App Router

The frontend uses Next.js 16's **App Router** with a mix of Client Components and Server Components:

- **Server Components** (default): Page layouts, static content, data-fetching on the server
- **Client Components** (`'use client'`): Interactive components with state, effects, and event handlers

### Component Hierarchy

```
RootLayout (Server Component)
├── ThemeProvider (Client - next-themes)
├── SiteHeader (Client)
│   ├── MobileMenu
│   ├── SearchBar
│   ├── NotificationCenter
│   └── Mega Menu (Category Dropdown)
├── <main> (Page Content)
├── SiteFooter (Server)
├── MobileBottomNav (Client)
├── CompareDrawer (Client)
├── AIAssistant (Client)
├── ScrollToTop (Client)
└── Toaster (Client - Sonner)
```

### State Management

MeraShop uses a **dual state management** approach:

#### 1. Zustand Stores (Client State)

| Store | File | Purpose | Persistence |
|-------|------|---------|-------------|
| `useCartStore` | `cart-store.ts` | Shopping cart items, quantities, totals | `localStorage` via `persist` |
| `useAuthStore` | `auth-store.ts` | User session, login/logout, role | `localStorage` via `persist` |
| `useWishlistStore` | `wishlist-store.ts` | Saved product wishlist | `localStorage` via `persist` |
| `useComparisonStore` | `comparison-store.ts` | Products selected for comparison | `localStorage` via `persist` |
| `useRecentlyViewedStore` | `recently-viewed-store.ts` | Recently viewed products | `localStorage` via `persist` |
| `useUIStore` | `ui-store.ts` | Search bar open/close state | None (ephemeral) |

All persisted stores use Zustand's `persist` middleware with the key prefix `merashop-` for namespacing.

#### 2. TanStack Query (Server State)

Used for fetching and caching API data with automatic revalidation:
- Product listings and details
- Category data
- Order information
- User profile data
- Admin dashboard statistics

### Routing Structure

| Route | Page | Type |
|-------|------|------|
| `/` | Homepage | Client |
| `/shop` | Product listing | Client |
| `/product/[slug]` | Product detail | Client |
| `/category/[slug]` | Category page | Client |
| `/cart` | Shopping cart | Client |
| `/checkout` | Multi-step checkout | Client |
| `/wishlist` | User wishlist | Client |
| `/compare` | Product comparison | Client |
| `/search` | Search results | Client |
| `/account` | Account dashboard | Client |
| `/account/login` | Login page | Client |
| `/account/register` | Registration page | Client |
| `/account/profile` | Profile management | Client |
| `/account/orders` | Order history | Client |
| `/account/addresses` | Address book | Client |
| `/admin` | Admin dashboard | Client |
| `/admin/products` | Product management | Client |
| `/admin/orders` | Order management | Client |
| `/admin/users` | User management | Client |
| `/admin/categories` | Category management | Client |
| `/admin/coupons` | Coupon management | Client |
| `/admin/banners` | Banner management | Client |
| `/admin/blog` | Blog CMS | Client |
| `/admin/analytics` | Analytics dashboard | Client |
| `/blog` | Blog listing | Client |
| `/blog/[slug]` | Blog post detail | Client |
| `/about` | About page | Client |
| `/contact` | Contact page | Client |
| `/faq` | FAQ page | Client |
| `/privacy` | Privacy policy | Client |
| `/terms` | Terms of service | Client |
| `/returns` | Returns policy | Client |
| `/track-order` | Order tracking | Client |
| `/gift-cards` | Gift cards | Client |
| `/payment/success` | Payment success | Client |
| `/payment/failure` | Payment failure | Client |
| `/order-confirmation` | Order confirmed | Client |

---

## Backend Architecture

### API Route Handlers

All backend logic lives in **Next.js Route Handlers** under `src/app/api/`. These are server-side functions that handle HTTP requests.

#### Architecture Pattern

```
Request → Route Handler → Validation → Prisma Query → Response
                ↓
         Error Handling (try/catch)
                ↓
         JSON Response (success/error)
```

#### API Route Groups

| Group | Prefix | Description |
|-------|--------|-------------|
| **Public** | `/api/` | Products, categories, banners, search, blog, FAQ |
| **Auth** | `/api/auth/` | Login, register, profile |
| **User** | `/api/` | Cart, orders, addresses, reviews, wishlist |
| **Payment** | `/api/` | Razorpay order creation, payment verification |
| **AI** | `/api/` | Chat assistant, product Q&A |
| **Admin** | `/api/admin/` | Product/Order/User/Coupon/Banner/Blog/Category CRUD |
| **Utility** | `/api/` | Newsletter, analytics, contact, stock alerts |

### Database Layer

#### Prisma Client Singleton

The Prisma client is instantiated as a singleton via `src/lib/db.ts` to prevent connection pool exhaustion in development:

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const db = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
```

#### Database Schema

The schema defines **18 models** organized into these domain groups:

1. **User & Auth**: `User`, `Address`
2. **Product Catalog**: `Category`, `Brand`, `Product`, `ProductImage`, `ProductVariant`, `ProductQuestion`
3. **Shopping Cart**: `CartItem`
4. **Wishlist**: `WishlistItem`
5. **Orders & Payments**: `Order`, `OrderItem`, `Payment`
6. **Coupons**: `Coupon`
7. **Reviews**: `Review`
8. **CMS**: `Banner`, `BlogPost`, `FAQ`
9. **Communication**: `NewsletterSubscriber`, `ContactMessage`
10. **Analytics**: `AnalyticsEvent`

Key design decisions:
- **Soft deletes**: Products use `deletedAt` timestamp instead of hard deletes
- **Snapshot pattern**: Order items store `productName`, `productImage`, `unitPrice` at order time
- **Hierarchical categories**: `Category` has self-referencing `parentId` for nested categories
- **Variant model**: Products support multiple variants (color, size) with individual stock tracking

---

## Data Flow Diagrams

### Product Browsing Flow

```
User clicks category/filters
         │
         ▼
┌─────────────────────┐
│ Shop Page Component  │
│ (Client Component)   │
└─────────┬───────────┘
          │ fetch('/api/products?category=electronics&sort=newest&page=1')
          ▼
┌─────────────────────┐
│ GET /api/products    │
│ (Route Handler)      │
├─────────────────────┤
│ 1. Parse query params│
│ 2. Build Prisma where│
│ 3. Count + FindMany  │
│ 4. Transform results │
│ 5. Return JSON       │
└─────────┬───────────┘
          │ JSON response
          ▼
┌─────────────────────┐
│ ProductGrid renders  │
│ ProductCard components│
└─────────────────────┘
```

### Checkout Flow

```
User on Cart page → Clicks "Proceed to Checkout"
         │
         ▼
┌──────────────────────┐
│ Step 1: Cart Review   │
└──────────┬───────────┘
           ▼
┌──────────────────────┐
│ Step 2: Shipping Addr │──── POST /api/addresses (save)
└──────────┬───────────┘
           ▼
┌──────────────────────┐
│ Step 3: Payment Method│
└──────────┬───────────┘
           ▼
┌──────────────────────┐
│ Step 4: Review Order  │──── POST /api/coupons/validate
└──────────┬───────────┘
           ▼
┌──────────────────────────────────┐
│ Step 5: Payment                  │
│  ├── Online: POST /api/create-   │
│  │         order (Razorpay)      │
│  │         → Razorpay checkout   │
│  │         → POST /api/verify-   │
│  │           payment             │
│  └── COD: Direct confirm         │
└──────────┬───────────────────────┘
           ▼
┌──────────────────────┐
│ POST /api/orders      │
│ → Create order in DB  │
│ → Update stock        │
│ → Clear cart          │
│ → Return order details│
└──────────┬───────────┘
           ▼
┌──────────────────────┐
│ Order Confirmation    │
│ /order-confirmation   │
└──────────────────────┘
```

### Admin Data Flow

```
Admin Dashboard Page
         │
         ▼
┌─────────────────────────────┐
│ GET /api/admin/dashboard     │
│ → Aggregate stats            │
│ → Recent orders              │
│ → Top products               │
│ → Low stock alerts           │
│ → Revenue chart data         │
│ → Orders by status           │
└─────────────────────────────┘
```

---

## Key Design Decisions

### 1. Monolithic Architecture over Microservices

**Decision**: Single Next.js application serving both frontend and API.

**Rationale**:
- Simplified deployment and development for a small-to-medium e-commerce platform
- Shared TypeScript types between frontend and backend
- No network overhead between services
- Prisma provides a clean data access layer within the same process

### 2. SQLite via Prisma

**Decision**: Use SQLite as the database with Prisma ORM.

**Rationale**:
- Zero-configuration database for development and small deployments
- Prisma provides type-safe queries, migrations, and a visual schema browser
- Easy migration path to PostgreSQL/MySQL via Prisma when scaling

### 3. Client-Side Cart with localStorage Persistence

**Decision**: Shopping cart stored in Zustand + localStorage, not in the database.

**Rationale**:
- Instant UI updates without network latency
- Works for guest users without authentication
- Cart syncs to database only when an order is created
- Reduces database load for frequent cart operations

### 4. Soft Deletes for Products

**Decision**: Products use `deletedAt` timestamp rather than hard deletion.

**Rationale**:
- Preserves order history references (order items link to products)
- Enables data recovery and audit trails
- Admin can "unarchive" products

### 5. API Route Handlers over Server Actions

**Decision**: Use Next.js Route Handlers (`/api/*`) instead of Server Actions.

**Rationale**:
- RESTful API is more testable and debuggable
- Can be consumed by mobile apps or other clients in the future
- Clear separation between client and server code
- Standard HTTP semantics (status codes, methods, headers)

### 6. AI Integration with Fallback

**Decision**: AI features (chat, product Q&A) use the z-ai-web-dev-sdk with keyword-based fallbacks.

**Rationale**:
- Graceful degradation when AI API is unavailable
- Predefined responses for common queries (shipping, returns, coupons)
- Product context (price, brand, stock) is injected into AI prompts

---

## Performance Optimizations

### Frontend

1. **Image Optimization**: Next.js `<Image>` component with `sizes` prop for responsive loading
2. **Code Splitting**: App Router automatically splits code per route
3. **Skeleton Loading**: `LoadingSkeleton` components shown during data fetching
4. **Lazy Loading**: Heavy components (QuickView modal, AI Assistant) loaded on interaction
5. **Zustand Persist**: Cart/wishlist persisted to localStorage for instant hydration
6. **Framer Motion**: `viewport={{ once: true }}` prevents re-animation on scroll

### Backend

1. **Prisma Query Optimization**: Selective field inclusion via `select` and `include`
2. **Pagination**: All list endpoints support `page` and `limit` parameters
3. **Batch Analytics**: Analytics events batch-inserted (up to 50 per request)
4. **Bulk Operations**: Admin bulk actions for products and orders
5. **Connection Pooling**: Prisma client singleton prevents connection pool exhaustion

### Database

1. **Indexes**: Unique constraints on `slug`, `email`, `orderNumber`, and composite keys
2. **Count Optimization**: `_count` used for related record counts without N+1 queries
3. **Aggregate Queries**: Dashboard stats use Prisma `aggregate` and `groupBy`

---

## Security Considerations

### Current Implementation

1. **Payment Verification**: Razorpay signature verification using HMAC-SHA256 with timing-safe comparison
2. **Input Validation**: All API endpoints validate required fields and data types
3. **Soft Deletes**: Products are soft-deleted to prevent data loss
4. **SQL Injection Prevention**: Prisma parameterizes all queries
5. **XSS Prevention**: React's built-in JSX escaping, Next.js CSP headers

### Production Recommendations

1. **Authentication**: Implement NextAuth.js with proper session management and JWT verification
2. **Authorization**: Add role-based middleware to protect admin API routes
3. **Rate Limiting**: Implement rate limiting on auth and payment endpoints
4. **CSRF Protection**: Add CSRF tokens to state-changing requests
5. **Password Hashing**: Use bcrypt/argon2 for password storage (currently demo mode)
6. **Environment Variables**: Never commit secrets; use `.env.local` for sensitive values
7. **HTTPS**: Enforce HTTPS in production
8. **Content Security Policy**: Configure CSP headers via `next.config.ts`

### Admin Route Protection

> **Note**: Currently, admin routes are protected only at the UI level (auth store check). For production, add server-side middleware to verify admin role on all `/api/admin/*` routes.
