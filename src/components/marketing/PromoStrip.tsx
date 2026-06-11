'use client';

import { useCallback, useSyncExternalStore } from 'react';
import { X, PartyPopper, Tag } from 'lucide-react';

const PROMO_KEY = 'merashop_promo_dismissed';

function subscribe(callback: () => void) {
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
}

function getSnapshot(): boolean {
  if (typeof window === 'undefined') return true; // SSR: hidden by default
  return localStorage.getItem(PROMO_KEY) === 'true';
}

function getServerSnapshot(): boolean {
  return true; // SSR: hidden by default (no hydration mismatch)
}

export function PromoStrip() {
  const dismissed = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const handleDismiss = useCallback(() => {
    localStorage.setItem(PROMO_KEY, 'true');
    // Dispatch a storage event so other tabs update + trigger re-render
    window.dispatchEvent(new StorageEvent('storage', { key: PROMO_KEY }));
  }, []);

  if (dismissed) return null;

  return (
    <div className="md:hidden sticky top-0 z-50 bg-primary text-primary-foreground overflow-hidden">
      {/* Subtle gradient animation background */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/90 to-primary animate-gradient-x" />

      <div className="relative flex items-center gap-2 px-3 py-2.5">
        {/* Left: Main message */}
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <PartyPopper className="size-4 shrink-0" />
          <span className="text-xs font-medium whitespace-nowrap">
            Free Delivery ₹499+
          </span>
        </div>

        {/* Center: Scrolling marquee text */}
        <div className="flex-1 overflow-hidden min-w-0">
          <div className="animate-marquee whitespace-nowrap">
            <span className="text-xs text-primary-foreground/90">
              {'Use code '}
            </span>
            <span className="font-bold text-primary-foreground">
              WELCOME10
            </span>
            <span className="text-xs text-primary-foreground/90">
              {' for 10% off!   |   Use code '}
            </span>
            <span className="font-bold text-primary-foreground">
              WELCOME10
            </span>
            <span className="text-xs text-primary-foreground/90">
              {' for 10% off!          '}
            </span>
          </div>
        </div>

        {/* Right: Coupon badge + Dismiss */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Coupon badge - always visible */}
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary-foreground/20 text-[11px] font-bold animate-pulse-soft">
            <Tag className="size-3" />
            WELCOME10
          </span>

          {/* Dismiss button - 44px minimum tap target */}
          <button
            onClick={handleDismiss}
            className="flex size-[44px] items-center justify-center rounded-full hover:bg-primary-foreground/20 transition-colors -m-1"
            aria-label="Dismiss promotion"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function PromoStripDesktop() {
  return (
    <div className="hidden md:block bg-primary/5 border-b border-primary/10 overflow-hidden">
      <div className="container-shop px-4 md:px-6 lg:px-8 py-2">
        <div className="flex items-center justify-center gap-3 text-sm text-foreground">
          <PartyPopper className="size-4 text-primary shrink-0" />
          <p className="font-medium">
            🎉 Free Delivery on orders above ₹499
          </p>
          <span className="text-muted-foreground">|</span>
          <p className="font-medium">
            Use code{' '}
            <span className="font-bold text-primary animate-pulse-soft">
              WELCOME10
            </span>{' '}
            for 10% off your first order!
          </p>
        </div>
      </div>
    </div>
  );
}
