'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { ProductCard, type ProductCardProduct } from '@/components/shop/ProductCard';
import { ProductCardSkeleton } from '@/components/shop/LoadingSkeleton';
import { Badge } from '@/components/ui/badge';

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

export function NewArrivals() {
  const [products, setProducts] = useState<ProductCardProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNewArrivals() {
      try {
        const res = await fetch('/api/products?newArrival=true&limit=8&sort=newest');
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
    fetchNewArrivals();
  }, []);

  if (!loading && products.length === 0) return null;

  return (
    <section className="section-padding bg-muted/30">
      <div className="container-shop">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Sparkles className="size-6 text-primary" />
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              New Arrivals
            </h2>
            <Badge variant="secondary" className="hidden sm:inline-flex text-xs">
              Just In
            </Badge>
          </div>
          <Link
            href="#shop"
            className="text-sm font-medium text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
          >
            View All
            <ArrowRight className="size-4" />
          </Link>
        </div>

        {/* Mobile: Horizontal Scroll */}
        <div className="md:hidden -mx-4 px-4 overflow-x-auto scrollbar-hide">
          <div className="flex gap-3 pb-2" style={{ minWidth: 'max-content' }}>
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="w-[160px] shrink-0">
                    <ProductCardSkeleton />
                  </div>
                ))
              : products.map((product) => (
                  <div key={product.id} className="w-[160px] shrink-0">
                    <ProductCard product={product} />
                  </div>
                ))}
          </div>
        </div>

        {/* Desktop: 4-col Grid */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))
            : products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
        </div>
      </div>
    </section>
  );
}
