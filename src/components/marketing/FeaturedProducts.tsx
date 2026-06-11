'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
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

// Animation for individual product cards entering viewport
const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.08,
      duration: 0.45,
      ease: 'easeOut',
    },
  }),
};

export function FeaturedProducts() {
  const [products, setProducts] = useState<ProductCardProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const titleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchFeatured() {
      try {
        const res = await fetch('/api/products?featured=true&limit=8');
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
    fetchFeatured();
  }, []);

  if (!loading && products.length === 0) return null;

  return (
    <section className="section-padding bg-muted/30">
      <div className="container-shop">
        {/* Section Header with animated underline */}
        <div className="flex items-center justify-between mb-6">
          <div ref={titleRef} className="relative">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              Featured Products
            </h2>
            {/* Animated decorative underline */}
            <motion.div
              className="absolute -bottom-1 left-0 h-1 rounded-full bg-primary"
              initial={{ width: 0 }}
              whileInView={{ width: '60%' }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
            />
          </div>
          <Link
            href="#shop"
            className="text-sm font-medium text-primary hover:text-primary/80 flex items-center gap-1 transition-colors group"
          >
            View All
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
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
              : products.map((product, i) => (
                  <motion.div
                    key={product.id}
                    className="w-[160px] shrink-0"
                    custom={i}
                    variants={cardVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.1 }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
          </div>
        </div>

        {/* Desktop: 4-col Grid with viewport animations */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))
            : products.map((product, i) => (
                <motion.div
                  key={product.id}
                  custom={i}
                  variants={cardVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.1 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
        </div>
      </div>
    </section>
  );
}
