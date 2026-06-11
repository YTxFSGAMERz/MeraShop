# Task 9-10: Auth & Account Agent

## Task: Build auth pages and account management

## Work Completed

### Store Update
- Updated `/src/lib/stores/auth-store.ts`: Added `persist` middleware from zustand/middleware for localStorage persistence, added `updateUser` action for partial profile updates

### API Routes Created
1. `/src/app/api/auth/login/route.ts` - POST: Login with email/password, demo mode (any password works)
2. `/src/app/api/auth/register/route.ts` - POST: Register with name/email/phone/password, uniqueness checks
3. `/src/app/api/auth/profile/route.ts` - GET: User profile with stats; PUT: Update profile
4. `/src/app/api/orders/user/route.ts` - GET: User orders with items, payment, shipping
5. `/src/app/api/addresses/route.ts` - GET/POST/PUT/DELETE: Full CRUD for addresses

### Pages Created
1. `/src/app/account/login/page.tsx` - Login with email, password, show/hide, social buttons, demo credentials
2. `/src/app/account/register/page.tsx` - Registration with validation, +91 phone prefix, terms checkbox
3. `/src/app/account/page.tsx` - Dashboard with greeting, stats, quick links, recent orders, cart summary
4. `/src/app/account/profile/page.tsx` - Profile display/edit, change password
5. `/src/app/account/orders/page.tsx` - Orders list with detail sheet (timeline, items, pricing, address, payment, tracking)
6. `/src/app/account/addresses/page.tsx` - Address CRUD with Indian states dropdown, default management
7. `/src/app/wishlist/page.tsx` - Wishlist grid with move-to-cart, remove, empty state

### Key Decisions
- Auth uses Zustand with persist middleware (localStorage), API checks against Prisma/SQLite
- Demo mode: any password works for admin@merashop.in and customer@example.com
- All pages use 'use client' with auth guards (redirect to /account/login if not authenticated)
- Indian-specific: +91 phone prefix, Indian states dropdown, INR formatting, 6-digit pincode validation

### Test Results
- All API routes return correct status codes
- All pages compile and return 200
- ESLint passes with zero errors
