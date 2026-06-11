'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Menu,
  Home,
  LayoutGrid,
  Tag,
  Info,
  ShoppingBag,
  Heart,
  ShoppingCart,
  User,
  LogIn,
  UserPlus,
  ChevronRight,
  Shirt,
  Smartphone,
  HomeIcon,
  Sparkles,
  Dumbbell,
  BookOpen,
  Baby,
  Utensils,
} from 'lucide-react';

import { SITE_NAME, NAV_LINKS } from '@/lib/constants';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useUIStore } from '@/lib/stores/ui-store';
import { useCartStore } from '@/lib/stores/cart-store';
import { useWishlistStore } from '@/lib/stores/wishlist-store';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const navIcons: Record<string, React.ElementType> = {
  Home,
  Shop: LayoutGrid,
  Categories: LayoutGrid,
  Deals: Tag,
  About: Info,
};

const categories = [
  { label: 'Fashion', icon: Shirt, href: '/category/fashion' },
  { label: 'Electronics', icon: Smartphone, href: '/category/electronics' },
  { label: 'Home & Living', icon: HomeIcon, href: '/category/home-living' },
  { label: 'Beauty', icon: Sparkles, href: '/category/beauty' },
  { label: 'Sports', icon: Dumbbell, href: '/category/sports' },
  { label: 'Books', icon: BookOpen, href: '/category/books' },
  { label: 'Kids & Baby', icon: Baby, href: '/category/kids' },
  { label: 'Grocery', icon: Utensils, href: '/category/grocery' },
];

const accountLinks = [
  { label: 'My Orders', icon: ShoppingBag, href: '/account' },
  { label: 'My Wishlist', icon: Heart, href: '/wishlist' },
  { label: 'My Cart', icon: ShoppingCart, href: '/cart' },
  { label: 'My Profile', icon: User, href: '/account' },
];

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const itemCount = useCartStore((s) => s.getItemCount());
  const wishlistCount = useWishlistStore((s) => s.items.length);

  const closeMenu = () => setOpen(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden size-9 md:size-10"
          aria-label="Open menu"
        >
          <Menu className="size-[18px] md:size-5" />
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="w-[300px] sm:w-[340px] p-0">
        <ScrollArea className="h-full">
          {/* ── User Greeting / Auth ────────────────────────────────────────── */}
          <SheetHeader className="p-4 pb-3 border-b border-border/50 bg-primary/5">
            <div className="flex items-center gap-3">
              <Avatar className="size-10 border-2 border-primary/20">
                <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                  {isAuthenticated && user?.name
                    ? user.name.charAt(0).toUpperCase()
                    : 'G'}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                {isAuthenticated && user ? (
                  <>
                    <SheetTitle className="text-sm font-semibold text-left">
                      Hello, {user.name.split(' ')[0]}!
                    </SheetTitle>
                    <p className="text-xs text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </>
                ) : (
                  <>
                    <SheetTitle className="text-sm font-semibold text-left">
                      Welcome!
                    </SheetTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Button size="sm" className="h-7 text-xs px-3" asChild>
                        <Link href="#login" onClick={closeMenu}>
                          <LogIn className="size-3 mr-1" />
                          Login
                        </Link>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs px-3"
                        asChild
                      >
                        <Link href="#register" onClick={closeMenu}>
                          <UserPlus className="size-3 mr-1" />
                          Register
                        </Link>
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </SheetHeader>

          {/* ── Main Navigation ─────────────────────────────────────────────── */}
          <div className="p-4">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Navigation
            </p>
            <nav className="space-y-0.5">
              {NAV_LINKS.map((link) => {
                const Icon = navIcons[link.label] || LayoutGrid;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={closeMenu}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-primary/5 hover:text-primary transition-colors"
                  >
                    <Icon className="size-4 text-muted-foreground" />
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <Separator className="mx-4 w-auto" />

          {/* ── Categories ──────────────────────────────────────────────────── */}
          <div className="p-4">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Categories
            </p>
            <div className="space-y-0.5">
              {categories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <Link
                    key={cat.href}
                    href={cat.href}
                    onClick={closeMenu}
                    className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm text-foreground hover:bg-primary/5 hover:text-primary transition-colors"
                  >
                    <span className="flex items-center gap-3">
                      <Icon className="size-4 text-muted-foreground" />
                      {cat.label}
                    </span>
                    <ChevronRight className="size-3.5 text-muted-foreground" />
                  </Link>
                );
              })}
            </div>
          </div>

          <Separator className="mx-4 w-auto" />

          {/* ── Account Section ─────────────────────────────────────────────── */}
          <div className="p-4">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              My Account
            </p>
            <div className="space-y-0.5">
              {accountLinks.map((link) => {
                const Icon = link.icon;
                const badge =
                  link.label === 'My Cart'
                    ? itemCount
                    : link.label === 'My Wishlist'
                      ? wishlistCount
                      : 0;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={closeMenu}
                    className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm text-foreground hover:bg-primary/5 hover:text-primary transition-colors"
                  >
                    <span className="flex items-center gap-3">
                      <Icon className="size-4 text-muted-foreground" />
                      {link.label}
                    </span>
                    {badge > 0 && (
                      <span className="inline-flex items-center justify-center size-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                        {badge > 99 ? '99+' : badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Bottom spacer for safe area */}
          <div className="h-6" />
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
