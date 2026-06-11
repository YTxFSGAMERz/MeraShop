'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Clock, Package } from 'lucide-react';

import { formatINR, calcDiscountPercent } from '@/lib/constants';
import { useRecentlyViewedStore } from '@/lib/stores/recently-viewed-store';

// ── Types ──────────────────────────────────────────────────────────────────

interface RecentlyViewedProps {
  currentProductId?: string;
}

// ── Component ──────────────────────────────────────────────────────────────

export function RecentlyViewed({ currentProductId }: RecentlyViewedProps) {
  const items = useRecentlyViewedStore((s) => s.items);
  const displayItems = items
    .filter((item) => item.id !== currentProductId)
    .slice(0, 8);

  // Don't render if no items
  if (displayItems.length === 0) {
    return null;
  }

  return (
    <section className="w-full">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="size-5 text-primary" />
        <h2 className="text-lg md:text-xl font-bold text-foreground">
          Recently Viewed
        </h2>
      </div>

      <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 -mx-1 px-1">
        {displayItems.map((product) => (
          <Link
            key={product.id}
            href={`/product/${product.slug}`}
            className="shrink-0 w-[140px] sm:w-[160px] group"
          >
            <div className="space-y-2">
              {/* Product Image */}
              <div className="relative aspect-square rounded-lg overflow-hidden bg-muted border border-border/50">
                {product.image ? (
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="160px"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Package className="size-8 text-muted-foreground/30" />
                  </div>
                )}

                {/* Discount badge */}
                {product.salePrice !== null && product.salePrice < product.basePrice && (
                  <span className="absolute top-1.5 left-1.5 discount-badge text-[9px] px-1 py-0.5">
                    {calcDiscountPercent(product.basePrice, product.salePrice)}% off
                  </span>
                )}
              </div>

              {/* Brand */}
              {product.brand && (
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground truncate">
                  {product.brand}
                </p>
              )}

              {/* Name */}
              <p className="text-xs font-medium text-foreground line-clamp-2 leading-tight min-h-[2rem]">
                {product.name}
              </p>

              {/* Price */}
              <div className="flex items-baseline gap-1">
                <span className="text-sm font-bold text-price">
                  {formatINR(product.salePrice ?? product.basePrice)}
                </span>
                {product.salePrice !== null && product.salePrice < product.basePrice && (
                  <span className="text-[10px] price-strike">
                    {formatINR(product.basePrice)}
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
