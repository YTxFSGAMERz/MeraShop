'use client';

import { useCallback, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, LayoutGrid, ShoppingCart, Heart, User, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';

import { cn } from '@/lib/utils';
import { useCartStore } from '@/lib/stores/cart-store';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useHydrated } from '@/hooks/use-hydrated';
import { Badge } from '@/components/ui/badge';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  showBadge?: boolean;
}

const navItems: NavItem[] = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Shop', href: '/shop', icon: LayoutGrid },
  { label: 'Cart', href: '/cart', icon: ShoppingCart, showBadge: true },
  { label: 'Wishlist', href: '/wishlist', icon: Heart },
  { label: 'Account', href: '/account', icon: User },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const itemCount = useCartStore((s) => s.getItemCount());
  const { theme, setTheme } = useTheme();
  const user = useAuthStore((s) => s.user);
  const hydrated = useHydrated();
  const navRef = useRef<HTMLElement>(null);

  // Ripple effect handler
  const handleRipple = useCallback((e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
    const target = e.currentTarget;
    const rect = target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const size = Math.max(rect.width, rect.height) * 2;

    const ripple = document.createElement('span');
    ripple.className = 'ripple-effect';
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${x - size / 2}px`;
    ripple.style.top = `${y - size / 2}px`;

    target.style.position = 'relative';
    target.style.overflow = 'hidden';
    target.appendChild(ripple);

    setTimeout(() => {
      ripple.remove();
    }, 600);
  }, []);

  return (
    <nav
      ref={navRef}
      suppressHydrationWarning
      className="fixed bottom-0 left-0 right-0 z-[var(--z-sticky)] md:hidden bg-background border-t border-border/80 shadow-[0_-2px_10px_rgba(0,0,0,0.06)] safe-bottom"
      aria-label="Mobile navigation"
    >
      <ul className="flex items-center justify-around h-14 safe-bottom">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          const Icon = item.icon;
          const isAccount = item.href === '/account';

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={handleRipple}
                className={cn(
                  'flex flex-col items-center justify-center gap-0.5 w-12 h-full relative transition-all duration-200',
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <motion.div
                  className="relative"
                  animate={isActive ? { scale: 1.1 } : { scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  whileTap={{ scale: 0.85, opacity: 0.7 }}
                >
                  <Icon className="size-5" strokeWidth={isActive ? 2.5 : 2} />
                  {item.showBadge && hydrated && itemCount > 0 && (
                    <Badge className="absolute -top-1.5 -right-2.5 size-4 p-0 flex items-center justify-center text-[9px] font-bold leading-none animate-badge-pop">
                      {itemCount > 99 ? '99' : itemCount}
                    </Badge>
                  )}
                  {/* Notification dot on Account when user is logged in */}
                  {isAccount && hydrated && user && !isActive && (
                    <span className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-primary">
                      <span className="absolute inset-0 rounded-full bg-primary animate-ping opacity-75" />
                    </span>
                  )}
                </motion.div>
                <span
                  className={cn(
                    'text-[10px] leading-tight font-medium',
                    isActive && 'font-semibold',
                  )}
                >
                  {item.label}
                </span>
                {/* Active indicator dot */}
                {isActive && (
                  <motion.span
                    layoutId="activeTab"
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-primary"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </Link>
            </li>
          );
        })}

        {/* Theme toggle */}
        <li>
          <button
            onClick={(e) => {
              handleRipple(e);
              setTheme(theme === 'dark' ? 'light' : 'dark');
            }}
            className="flex flex-col items-center justify-center gap-0.5 w-12 h-full text-muted-foreground hover:text-foreground transition-all duration-200"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            suppressHydrationWarning
          >
            <div className="relative">
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
                      <Sun className="size-5" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="moon"
                      initial={{ rotate: 90, opacity: 0, scale: 0 }}
                      animate={{ rotate: 0, opacity: 1, scale: 1 }}
                      exit={{ rotate: -90, opacity: 0, scale: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Moon className="size-5" />
                    </motion.div>
                  )}
                </AnimatePresence>
              ) : (
                <Sun className="size-5" />
              )}
            </div>
            <span className="text-[10px] leading-tight font-medium">
              {hydrated && theme === 'dark' ? 'Light' : 'Dark'}
            </span>
          </button>
        </li>
      </ul>
    </nav>
  );
}
