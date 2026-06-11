# Task 1-2: Dark Mode Support & Promo Strip Fix

## Agent: Main Developer
## Date: 2026-03-05

## Summary
Implemented dark mode support with next-themes and fixed mobile promo strip truncation issues.

## Changes Made

### Part 1: Dark Mode Support

1. **ThemeProvider** (`/src/components/theme-provider.tsx`) — NEW
   - Wraps children with next-themes ThemeProvider
   - Configured: attribute="class", defaultTheme="light", enableSystem={true}, disableTransitionOnChange

2. **Layout** (`/src/app/layout.tsx`)
   - Imported ThemeProvider component
   - Wrapped body content with ThemeProvider
   - Added suppressHydrationWarning to body tag

3. **SiteHeader** (`/src/components/layout/SiteHeader.tsx`)
   - Added Sun/Moon icons from lucide-react
   - Added useTheme() hook from next-themes
   - Theme toggle button next to search icon (visible on both mobile and desktop)
   - AnimatePresence with rotate + scale + opacity transitions between Sun and Moon icons
   - Uses Button component with variant="ghost" size="icon"

4. **MobileBottomNav** (`/src/components/layout/MobileBottomNav.tsx`)
   - Added 6th nav item: theme toggle button
   - Uses AnimatePresence for smooth Sun/Moon icon transitions
   - Shows "Light" or "Dark" label based on current theme
   - Adjusted nav items from w-14 to w-12 to accommodate 6th item

### Part 2: Promo Strip Fix

5. **PromoStrip** (`/src/components/marketing/PromoStrip.tsx`)
   - Split message into two parts: "Free Delivery ₹499+" (left) and scrolling marquee text (center)
   - WELCOME10 always visible as a highlight badge with Tag icon on the right
   - Coupon badge uses animate-pulse-soft for subtle pulsing effect
   - Dismiss button enlarged to 44px minimum tap target (was 24px)
   - Added animated gradient background (animate-gradient-x)
   - Marquee text scrolls with "Use code WELCOME10 for 10% off!" repeated

6. **globals.css** (`/src/app/globals.css`)
   - Added `.animate-marquee` utility class (12s linear infinite)
   - Added `.animate-gradient-x` utility class (4s ease infinite)
   - Added `@keyframes marquee` (translateX 100% to -100%)
   - Added `@keyframes gradientX` (background-position animation)

## Verification
- ✅ ESLint passes with zero errors on modified files
- ✅ Dev server compiles successfully
- ✅ Dark mode CSS variables already defined in globals.css
- ✅ @custom-variant dark already configured for class-based dark mode
