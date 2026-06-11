'use client';

import { useCallback, useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Clock, Eye, AlertTriangle } from 'lucide-react';
import { ProductCard, type ProductCardProduct } from '@/components/shop/ProductCard';
import { ProductCardSkeleton } from '@/components/shop/LoadingSkeleton';

interface ApiProduct {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  salePrice: number | null;
  primaryImage: string | null;
  avgRating: number;
  reviewCount: number;
  brand: { name: string } | null;
  stock: number;
  isNewArrival: boolean;
  isBestseller: boolean;
  discountPercent: number;
  totalSold?: number;
}

function mapToProductCard(p: ApiProduct): ProductCardProduct {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    basePrice: p.basePrice,
    salePrice: p.salePrice ?? undefined,
    images: p.primaryImage
      ? [{ url: p.primaryImage, isPrimary: true }]
      : [],
    avgRating: p.avgRating,
    reviewCount: p.reviewCount,
    brand: p.brand ?? undefined,
    stock: p.stock,
    isNewArrival: p.isNewArrival,
    isBestseller: p.isBestseller,
    totalSold: p.totalSold,
  };
}

function useCountdown(hours: number) {
  const getTargetTime = useCallback(() => {
    const now = new Date();
    return new Date(now.getTime() + hours * 60 * 60 * 1000);
  }, [hours]);

  const [targetTime, setTargetTime] = useState(getTargetTime);
  const [mounted, setMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Intentional: mark client-side mount for hydration guard
    setMounted(true);
    // Calculate initial time immediately
    const now = new Date();
    const diff = targetTime.getTime() - now.getTime();
    if (diff > 0) {
      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft({ hours: h, minutes: m, seconds: s });
    }

    const interval = setInterval(() => {
      const now = new Date();
      const diff = targetTime.getTime() - now.getTime();

      if (diff <= 0) {
        setTargetTime(getTargetTime());
        return;
      }

      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ hours: h, minutes: m, seconds: s });
    }, 1000);

    return () => clearInterval(interval);
  }, [targetTime, getTargetTime]);

  return { timeLeft, mounted };
}

function FlipDigit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div
        className="relative bg-destructive text-destructive-foreground rounded-lg px-3 py-1.5 min-w-[42px] text-center font-bold text-2xl tabular-nums overflow-hidden [perspective:200px] shadow-lg shadow-red-500/20 animate-glow-pulse-green"
      >
        <AnimatePresence mode="popLayout">
          <motion.span
            key={value}
            initial={{ rotateX: -90, opacity: 0 }}
            animate={{ rotateX: 0, opacity: 1 }}
            exit={{ rotateX: 90, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="inline-block [backface-visibility:hidden]"
          >
            {String(value).padStart(2, '0')}
          </motion.span>
        </AnimatePresence>
      </div>
      <span className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider font-medium">
        {label}
      </span>
    </div>
  );
}

export function DealsSection() {
  const [products, setProducts] = useState<ProductCardProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const { timeLeft, mounted } = useCountdown(8);

  // Deterministic "people viewing" count
  const viewingCount = useMemo(() => {
    const hash = products.reduce((acc, p) => acc + p.id.charCodeAt(0), 0);
    return (hash % 51) + 12; // 12-62 range
  }, [products]);

  useEffect(() => {
    async function fetchDeals() {
      try {
        const res = await fetch('/api/products?bestseller=true&limit=4&sort=bestseller');
        if (res.ok) {
          const data = await res.json();
          const mapped = (data.products || []).map(mapToProductCard);
          setProducts(mapped);
        }
      } catch {
        // Silently fail
      } finally {
        setLoading(false);
      }
    }
    fetchDeals();
  }, []);

  return (
    <section className="section-padding relative overflow-hidden" suppressHydrationWarning>
      {/* Subtle gradient background accent */}
      <div className="absolute inset-0 bg-gradient-to-b from-red-50/50 via-transparent to-transparent dark:from-red-950/10 dark:via-transparent dark:to-transparent" />

      <div className="container-shop relative">
        {/* Section Header with Timer - gradient background */}
        <div className="relative rounded-xl p-4 md:p-5 mb-6 overflow-hidden bg-deals-header">
          <div className="absolute inset-0 dark:hidden" />
          <div className="absolute inset-0 hidden dark:block bg-deals-header" />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-orange-gradient">
                <Flame className="size-5 text-white" />
                <span className="font-bold text-base text-white">Deal of the Day</span>
              </div>
              {/* Pulsing LIVE indicator */}
              <span className="flex items-center gap-1.5 px-2 py-1 bg-red-600 text-white rounded-full text-[10px] font-bold uppercase tracking-wider animate-glow-pulse-1-5">
                <span className="size-2 rounded-full bg-white animate-pulse-soft" />
                LIVE
              </span>
            </div>

            {/* Countdown Timer with dramatic flip animation */}
            <div className="flex items-center gap-2">
              <Clock className="size-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground mr-1">Ends in</span>
              {mounted ? (
                <div className="flex items-center gap-1.5">
                  <FlipDigit value={timeLeft.hours} label="Hrs" />
                  <span className="text-destructive font-bold text-2xl">:</span>
                  <FlipDigit value={timeLeft.minutes} label="Min" />
                  <span className="text-destructive font-bold text-2xl">:</span>
                  <FlipDigit value={timeLeft.seconds} label="Sec" />
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <div className="flex flex-col items-center">
                    <div className="relative bg-destructive text-destructive-foreground rounded-lg px-3 py-1.5 min-w-[42px] text-center font-bold text-2xl tabular-nums shadow-lg shadow-red-500/20">
                      --
                    </div>
                    <span className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider font-medium">Hrs</span>
                  </div>
                  <span className="text-destructive font-bold text-2xl">:</span>
                  <div className="flex flex-col items-center">
                    <div className="relative bg-destructive text-destructive-foreground rounded-lg px-3 py-1.5 min-w-[42px] text-center font-bold text-2xl tabular-nums shadow-lg shadow-red-500/20">
                      --
                    </div>
                    <span className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider font-medium">Min</span>
                  </div>
                  <span className="text-destructive font-bold text-2xl">:</span>
                  <div className="flex flex-col items-center">
                    <div className="relative bg-destructive text-destructive-foreground rounded-lg px-3 py-1.5 min-w-[42px] text-center font-bold text-2xl tabular-nums shadow-lg shadow-red-500/20">
                      --
                    </div>
                    <span className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider font-medium">Sec</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Social proof: X people viewing + Filling fast badge */}
          <div className="flex items-center gap-3 mt-3 relative">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Eye className="size-3.5" />
              <span className="font-medium">{viewingCount} people viewing</span>
            </div>
            <div className="filling-fast-badge flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-white bg-red-orange-gradient-alt">
              <AlertTriangle className="size-2.5" />
              Filling Fast
            </div>
          </div>
        </div>

        {/* Urgency Banner with shimmer */}
        <div className="relative bg-gradient-to-r from-destructive/10 via-primary/10 to-amber-500/10 border border-destructive/20 rounded-lg p-3 mb-6 text-center overflow-hidden">
          {/* Shimmer effect for urgency */}
          <div
            className="absolute inset-0 animate-shimmer bg-shimmer-overlay-deals"
          />
          <p className="text-sm font-medium text-foreground relative">
            🔥 Limited Time Offer — Grab these deals before they&apos;re gone! Use code{' '}
            <span className="font-bold text-primary">WELCOME10</span> for extra 10% off
          </p>
        </div>

        {/* Products Grid with red/orange accent glow on cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))
            : products.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                  className="rounded-lg ring-1 ring-red-500/10 dark:ring-red-400/10 hover:ring-red-500/25 dark:hover:ring-red-400/25 transition-all duration-300 hover:shadow-lg hover:shadow-red-500/5 shadow-deal-card"
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
        </div>
      </div>
    </section>
  );
}
