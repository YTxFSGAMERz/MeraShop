'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag,
  Search,
  Heart,
  ShoppingCart,
  User,
  Menu,
  Sun,
  Moon,
  ChevronDown,
  Clock,
  X,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { SITE_NAME, NAV_LINKS } from '@/lib/constants';
import { useCartStore } from '@/lib/stores/cart-store';
import { useWishlistStore } from '@/lib/stores/wishlist-store';
import { useUIStore } from '@/lib/stores/ui-store';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useHydrated } from '@/hooks/use-hydrated';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MobileMenu } from '@/components/layout/MobileMenu';
import { SearchBar } from '@/components/layout/SearchBar';
import { NotificationCenter } from '@/components/layout/NotificationCenter';
import { useTheme } from 'next-themes';

// Category mega-menu data
const MEGA_MENU_CATEGORIES = [
  {
    title: 'Electronics',
    href: '/shop?category=electronics',
    items: [
      { label: 'Smartphones', href: '/shop?category=smartphones' },
      { label: 'Laptops', href: '/shop?category=laptops' },
      { label: 'Headphones', href: '/shop?category=headphones' },
      { label: 'Cameras', href: '/shop?category=cameras' },
    ],
  },
  {
    title: 'Fashion',
    href: '/shop?category=fashion',
    items: [
      { label: 'Men\'s Clothing', href: '/shop?category=mens-clothing' },
      { label: 'Women\'s Clothing', href: '/shop?category=womens-clothing' },
      { label: 'Footwear', href: '/shop?category=footwear' },
      { label: 'Accessories', href: '/shop?category=accessories' },
    ],
  },
  {
    title: 'Home & Living',
    href: '/shop?category=home',
    items: [
      { label: 'Furniture', href: '/shop?category=furniture' },
      { label: 'Kitchen', href: '/shop?category=kitchen' },
      { label: 'Decor', href: '/shop?category=decor' },
      { label: 'Bedding', href: '/shop?category=bedding' },
    ],
  },
  {
    title: 'Beauty',
    href: '/shop?category=beauty',
    items: [
      { label: 'Skincare', href: '/shop?category=skincare' },
      { label: 'Haircare', href: '/shop?category=haircare' },
      { label: 'Makeup', href: '/shop?category=makeup' },
      { label: 'Fragrances', href: '/shop?category=fragrances' },
    ],
  },
];

const RECENT_SEARCHES_KEY = 'merashop-recent-searches';

function getRecentSearches(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function SiteHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showRecentSearches, setShowRecentSearches] = useState(false);
  const megaMenuTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchInputRef = useRef<HTMLDivElement>(null);
  const itemCount = useCartStore((s) => s.getItemCount());
  const wishlistCount = useWishlistStore((s) => s.items.length);
  const { isSearchOpen, toggleSearch, closeAll } = useUIStore();
  const { theme, setTheme } = useTheme();
  const user = useAuthStore((s) => s.user);
  const hydrated = useHydrated();

  // ── Scroll detection for sticky blur ────────────────────────────────────
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ── Load recent searches from localStorage after mount ──────────────────
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Intentional: load persisted data after hydration
    setRecentSearches(getRecentSearches());
  }, []);

  // ── Refresh recent searches when search opens ──────────────────────────
  const toggleSearchWithRefresh = useCallback(() => {
    toggleSearch();
    setShowRecentSearches(true);
    // Refresh recent searches on next tick
    setTimeout(() => {
      setRecentSearches(getRecentSearches());
    }, 0);
  }, [toggleSearch]);

  // ── Close recent searches dropdown on outside click ──────────────────────
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
        setShowRecentSearches(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ── Mega menu hover handlers with delay ─────────────────────────────────
  const handleMegaMenuEnter = () => {
    if (megaMenuTimeoutRef.current) clearTimeout(megaMenuTimeoutRef.current);
    setMegaMenuOpen(true);
  };

  const handleMegaMenuLeave = () => {
    megaMenuTimeoutRef.current = setTimeout(() => {
      setMegaMenuOpen(false);
    }, 200);
  };

  const removeRecentSearch = (term: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const updated = recentSearches.filter((s) => s !== term);
    setRecentSearches(updated);
    try {
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch { /* ignore */ }
  };

  return (
    <header
      suppressHydrationWarning
      className={cn(
        'sticky top-0 z-[var(--z-sticky)] w-full transition-all duration-500 ease-out',
        isScrolled
          ? 'bg-background/80 backdrop-blur-lg shadow-sm border-b border-border/50'
          : 'bg-background border-b border-transparent',
      )}
    >
      {/* Gradient line at the bottom when scrolled */}
      <AnimatePresence>
        {isScrolled && (
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            exit={{ scaleX: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="absolute bottom-0 left-0 right-0 h-[2px] origin-center bg-search-highlight"
          />
        )}
      </AnimatePresence>

      <div className="container-shop flex h-14 md:h-16 items-center justify-between px-4 md:px-6 lg:px-8">
        {/* ── Left: Hamburger (mobile) + Logo ─────────────────────────────── */}
        <div className="flex items-center gap-2">
          {/* Mobile hamburger */}
          <MobileMenu />

          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-1.5 group"
            onClick={() => closeAll()}
          >
            <ShoppingBag className="size-5 md:size-6 text-primary transition-transform duration-300 group-hover:scale-110" />
            <span className="text-lg md:text-xl font-extrabold tracking-tight text-foreground">
              {SITE_NAME}
            </span>
          </Link>
        </div>

        {/* ── Center: Desktop Navigation ──────────────────────────────────── */}
        <nav className="hidden lg:flex items-center gap-1">
          {NAV_LINKS.map((link) => {
            // Check if this is the Categories link - make it a mega-menu trigger
            if (link.label === 'Categories') {
              return (
                <div
                  key={link.href}
                  className="relative"
                  onMouseEnter={handleMegaMenuEnter}
                  onMouseLeave={handleMegaMenuLeave}
                >
                  <Link
                    href={link.href}
                    className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-primary rounded-md hover:bg-primary/5 transition-colors relative group inline-flex items-center gap-1"
                  >
                    {link.label}
                    <ChevronDown className={cn(
                      'size-3 transition-transform duration-200',
                      megaMenuOpen && 'rotate-180'
                    )} />
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-primary rounded-full transition-all duration-300 group-hover:w-4/5" />
                  </Link>

                  {/* Mega Menu Dropdown */}
                  <AnimatePresence>
                    {megaMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.98 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-[480px] rounded-xl bg-card border border-border shadow-xl overflow-hidden"
                        onMouseEnter={handleMegaMenuEnter}
                        onMouseLeave={handleMegaMenuLeave}
                      >
                        <div className="grid grid-cols-2 gap-0">
                          {MEGA_MENU_CATEGORIES.map((cat, idx) => (
                            <div
                              key={cat.title}
                              className={cn(
                                'p-4 hover:bg-primary/5 transition-colors',
                                idx < 2 && 'border-b border-border/50',
                                idx % 2 === 0 && 'border-r border-border/50',
                              )}
                            >
                              <Link
                                href={cat.href}
                                className="text-sm font-semibold text-foreground hover:text-primary transition-colors flex items-center gap-1.5"
                                onClick={() => setMegaMenuOpen(false)}
                              >
                                {cat.title}
                              </Link>
                              <div className="mt-2 space-y-1">
                                {cat.items.map((item) => (
                                  <Link
                                    key={item.label}
                                    href={item.href}
                                    className="block text-xs text-muted-foreground hover:text-primary transition-colors py-0.5"
                                    onClick={() => setMegaMenuOpen(false)}
                                  >
                                    {item.label}
                                  </Link>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                        {/* Bottom link */}
                        <div className="border-t border-border/50 px-4 py-3 bg-muted/30">
                          <Link
                            href="/shop"
                            className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                            onClick={() => setMegaMenuOpen(false)}
                          >
                            View All Categories →
                          </Link>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            }

            return (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-primary rounded-md hover:bg-primary/5 transition-colors relative group"
              >
                {link.label}
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-primary rounded-full transition-all duration-300 group-hover:w-4/5" />
              </Link>
            );
          })}
        </nav>

        {/* ── Right: Actions ──────────────────────────────────────────────── */}
        <div className="flex items-center gap-0.5 md:gap-1">
          {/* Search toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="size-9 md:size-10 transition-colors"
            onClick={toggleSearchWithRefresh}
            aria-label="Toggle search"
          >
            <Search className="size-[18px] md:size-5" />
          </Button>

          {/* Notification Center */}
          <NotificationCenter />

          {/* Theme toggle (mobile: small icon next to search, desktop: full icon button) */}
          <Button
            variant="ghost"
            size="icon"
            className="size-9 md:size-10 transition-colors"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            suppressHydrationWarning
          >
            {hydrated ? (
              <AnimatePresence mode="wait" initial={false}>
                {theme === 'dark' ? (
                  <motion.div
                    key="sun"
                    initial={{ rotate: -90, opacity: 0, scale: 0 }}
                    animate={{ rotate: 0, opacity: 1, scale: 1 }}
                    exit={{ rotate: 90, opacity: 0, scale: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Sun className="size-[18px] md:size-5" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="moon"
                    initial={{ rotate: 90, opacity: 0, scale: 0 }}
                    animate={{ rotate: 0, opacity: 1, scale: 1 }}
                    exit={{ rotate: -90, opacity: 0, scale: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Moon className="size-[18px] md:size-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            ) : (
              <Sun className="size-[18px] md:size-5" />
            )}
          </Button>

          {/* Wishlist (desktop only) */}
          <Button
            variant="ghost"
            size="icon"
            className="hidden md:inline-flex size-10 relative"
            asChild
          >
            <Link href="/wishlist" aria-label="Wishlist">
              <Heart className="size-5" />
              {hydrated && wishlistCount > 0 && (
                <Badge className="absolute -top-0.5 -right-0.5 size-5 p-0 flex items-center justify-center text-[10px] font-bold animate-badge-pop">
                  {wishlistCount > 99 ? '99+' : wishlistCount}
                </Badge>
              )}
            </Link>
          </Button>

          {/* Cart with bounce animation */}
          <Button
            variant="ghost"
            size="icon"
            className="size-9 md:size-10 relative"
            asChild
          >
            <Link href="/cart" aria-label="Shopping cart">
              <ShoppingCart className="size-[18px] md:size-5" />
              {hydrated && itemCount > 0 && (
                <Badge className="absolute -top-0.5 -right-0.5 size-5 p-0 flex items-center justify-center text-[10px] font-bold animate-badge-pop">
                  {itemCount > 99 ? '99+' : itemCount}
                </Badge>
              )}
            </Link>
          </Button>

          {/* Account (desktop only) */}
          <Button
            variant="ghost"
            size="icon"
            className="hidden md:inline-flex size-10"
            asChild
          >
            <Link href="/account" aria-label="My account">
              <User className="size-5" />
            </Link>
          </Button>
        </div>
      </div>

      {/* ── Expandable Search Bar with improved animation ──────────────────── */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden border-t border-border/50"
          >
            <div className="container-shop px-4 md:px-6 lg:px-8 py-3 relative" ref={searchInputRef}>
              <SearchBar />

              {/* Recent Search Terms Dropdown */}
              <AnimatePresence>
                {showRecentSearches && recentSearches.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-4 md:left-6 lg:left-8 right-4 md:right-6 lg:right-8 top-full mt-1 rounded-lg bg-card border border-border shadow-lg z-50 overflow-hidden"
                  >
                    <div className="px-3 py-2 border-b border-border/50 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                        <Clock className="size-3" />
                        Recent Searches
                      </div>
                      <button
                        onClick={() => {
                          setRecentSearches([]);
                          try { localStorage.removeItem(RECENT_SEARCHES_KEY); } catch { /* ignore */ }
                        }}
                        className="text-[10px] text-muted-foreground hover:text-destructive transition-colors"
                      >
                        Clear All
                      </button>
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                      {recentSearches.slice(0, 8).map((term) => (
                        <Link
                          key={term}
                          href={`/shop?search=${encodeURIComponent(term)}`}
                          className="flex items-center justify-between px-3 py-2 hover:bg-muted/50 transition-colors group"
                          onClick={() => setShowRecentSearches(false)}
                        >
                          <span className="text-sm text-foreground">{term}</span>
                          <button
                            onClick={(e) => removeRecentSearch(term, e)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            aria-label={`Remove ${term}`}
                          >
                            <X className="size-3.5 text-muted-foreground hover:text-destructive" />
                          </button>
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
