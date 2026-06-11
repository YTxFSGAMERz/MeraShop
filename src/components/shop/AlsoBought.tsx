'use client';

import { useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { ShoppingBag, ChevronLeft, ChevronRight, Tag, Check } from 'lucide-react';

import { ProductCard, type ProductCardProduct } from './ProductCard';
import { Button } from '@/components/ui/button';
import { formatINR } from '@/lib/constants';
import { cn } from '@/lib/utils';

// ── Types ──────────────────────────────────────────────────────────────────

interface AlsoBoughtProps {
  categorySlug: string;
  currentProductId: string;
  currentProductPrice?: number;
  currentProductName?: string;
  limit?: number;
}

// ── Component ──────────────────────────────────────────────────────────────

export function AlsoBought({ categorySlug, currentProductId, currentProductPrice, currentProductName, limit = 8 }: AlsoBoughtProps) {
  const [products, setProducts] = useState<ProductCardProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [bundleProducts, setBundleProducts] = useState<Set<string>>(new Set());
  const sectionRef = useRef<HTMLElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  useEffect(() => {
    async function fetchAlsoBought() {
      try {
        const res = await fetch(`/api/products?category=${categorySlug}&limit=${limit}`);
        if (res.ok) {
          const data = await res.json();
          const mapped = data.products
            .filter((p: { id: string }) => p.id !== currentProductId)
            .slice(0, limit)
            .map((p: {
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
              totalSold: number;
            }) => ({
              id: p.id,
              name: p.name,
              slug: p.slug,
              basePrice: p.basePrice,
              salePrice: p.salePrice ?? undefined,
              images: p.primaryImage ? [{ url: p.primaryImage, isPrimary: true }] : [],
              avgRating: p.avgRating,
              reviewCount: p.reviewCount,
              brand: p.brand ? { name: p.brand.name } : undefined,
              stock: p.stock,
              isNewArrival: p.isNewArrival,
              isBestseller: p.isBestseller,
              totalSold: p.totalSold,
            }));
          setProducts(mapped);
        }
      } catch {
        // silently fail
      } finally {
        setIsLoading(false);
      }
    }
    fetchAlsoBought();
  }, [categorySlug, currentProductId, limit]);

  const toggleBundleProduct = (productId: string) => {
    setBundleProducts((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else if (next.size < 2) {
        // Max 2 additional products in bundle
        next.add(productId);
      }
      return next;
    });
  };

  // Bundle pricing calculations
  const bundleItems = products.filter((p) => bundleProducts.has(p.id));
  const bundleTotalMrp = bundleItems.reduce((sum, p) => sum + p.basePrice, 0) + (currentProductPrice || 0);
  const bundleTotalSale = bundleItems.reduce((sum, p) => sum + (p.salePrice || p.basePrice), 0) + (currentProductPrice || 0);
  const bundleSavings = bundleTotalMrp - bundleTotalSale;
  const hasBundle = bundleItems.length > 0;

  // Scroll handlers
  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (!isLoading && products.length === 0) {
    return null;
  }

  return (
    <section ref={sectionRef} className="w-full">
      {/* Animated Section Title */}
      <div className="flex items-center gap-2 mb-6">
        <ShoppingBag className="size-5 text-primary" />
        <h2 className="text-lg md:text-xl font-bold text-foreground">
          Customers Also Bought
        </h2>
        {/* Decorative animated underline */}
        <motion.div
          className="h-0.5 rounded-full mt-1 bg-accent-bar"
          initial={{ width: 0 }}
          animate={isInView ? { width: 60 } : { width: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>

      {/* Frequently Bought Together Bundle */}
      {hasBundle && currentProductName && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-xl border border-primary/20 bg-primary/5 dark:bg-primary/10"
        >
          <div className="flex items-center gap-2 mb-3">
            <Tag className="size-4 text-primary" />
            <h3 className="text-sm font-bold text-foreground">Frequently Bought Together</h3>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-medium bg-background px-2 py-1 rounded-md border border-border">
                  {currentProductName.length > 20 ? currentProductName.substring(0, 20) + '...' : currentProductName}
                </span>
                <span className="text-muted-foreground">+</span>
                {bundleItems.map((item, i) => (
                  <span key={item.id} className="flex items-center gap-1">
                    <span className="text-xs font-medium bg-background px-2 py-1 rounded-md border border-border">
                      {item.name.length > 20 ? item.name.substring(0, 20) + '...' : item.name}
                    </span>
                    {i < bundleItems.length - 1 && <span className="text-muted-foreground">+</span>}
                  </span>
                ))}
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-xs text-muted-foreground line-through">
                {formatINR(bundleTotalMrp)}
              </div>
              <div className="text-lg font-bold text-foreground">
                {formatINR(bundleTotalSale)}
              </div>
              {bundleSavings > 0 && (
                <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  Save {formatINR(bundleSavings)}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {isLoading ? (
        // Loading skeleton
        <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-1 px-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="shrink-0 w-[160px] sm:w-[180px]">
              <div className="aspect-square rounded-lg bg-muted animate-pulse" />
              <div className="mt-2 h-4 w-3/4 rounded bg-muted animate-pulse" />
              <div className="mt-1 h-4 w-1/2 rounded bg-muted animate-pulse" />
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Mobile: Horizontal scroll with peek effect + scroll buttons */}
          <div className="relative md:hidden">
            <div
              ref={scrollRef}
              className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-1 px-1 snap-x snap-mandatory"
              style={{ scrollPaddingLeft: '4px' }}
            >
              {products.map((product, index) => (
                <motion.div
                  key={product.id}
                  className="shrink-0 w-[160px] sm:w-[180px] snap-start relative"
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ duration: 0.4, delay: index * 0.08 }}
                >
                  {/* Bundle checkbox overlay */}
                  <button
                    onClick={() => toggleBundleProduct(product.id)}
                    className={cn(
                      'absolute top-2 right-2 z-10 size-6 rounded-full flex items-center justify-center transition-all border-2',
                      bundleProducts.has(product.id)
                        ? 'bg-primary border-primary text-primary-foreground'
                        : 'bg-background/80 border-border hover:border-primary/50'
                    )}
                    aria-label={bundleProducts.has(product.id) ? 'Remove from bundle' : 'Add to bundle'}
                  >
                    {bundleProducts.has(product.id) && <Check className="size-3" />}
                  </button>
                  <ProductCard product={product} showQuickView={false} />
                </motion.div>
              ))}
              {/* Peek effect: subtle gradient on the right edge */}
              {products.length > 2 && (
                <div className="shrink-0 w-8 h-full pointer-events-none" />
              )}
            </div>
            {/* Scroll buttons */}
            {products.length > 2 && (
              <div className="flex justify-center gap-2 mt-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="size-8 rounded-full"
                  onClick={() => scroll('left')}
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-8 rounded-full"
                  onClick={() => scroll('right')}
                  aria-label="Scroll right"
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Desktop: 4-column grid with bundle checkboxes */}
          <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-4">
            {products.slice(0, 4).map((product, index) => (
              <motion.div
                key={product.id}
                className="relative"
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
              >
                {/* Bundle checkbox overlay */}
                <button
                  onClick={() => toggleBundleProduct(product.id)}
                  className={cn(
                    'absolute top-3 right-3 z-10 size-7 rounded-full flex items-center justify-center transition-all border-2 shadow-sm',
                    bundleProducts.has(product.id)
                      ? 'bg-primary border-primary text-primary-foreground'
                      : 'bg-background border-border hover:border-primary/50'
                  )}
                  aria-label={bundleProducts.has(product.id) ? 'Remove from bundle' : 'Add to bundle'}
                >
                  {bundleProducts.has(product.id) && <Check className="size-3.5" />}
                </button>
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>

          {/* Bundle hint text */}
          {!hasBundle && (
            <p className="text-xs text-muted-foreground text-center mt-3">
              Select up to 2 products to see bundle pricing
            </p>
          )}
        </>
      )}
    </section>
  );
}
