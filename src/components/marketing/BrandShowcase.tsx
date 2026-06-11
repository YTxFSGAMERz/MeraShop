'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface Brand {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
}

const FALLBACK_BRANDS: Brand[] = [
  { id: '1', name: 'Samsung', slug: 'samsung', logo: null },
  { id: '2', name: 'Apple', slug: 'apple', logo: null },
  { id: '3', name: 'OnePlus', slug: 'oneplus', logo: null },
  { id: '4', name: 'Nike', slug: 'nike', logo: null },
  { id: '5', name: 'Adidas', slug: 'adidas', logo: null },
  { id: '6', name: 'Puma', slug: 'puma', logo: null },
  { id: '7', name: 'Prestige', slug: 'prestige', logo: null },
  { id: '8', name: 'boAt', slug: 'boat', logo: null },
  { id: '9', name: 'H&M', slug: 'hm', logo: null },
  { id: '10', name: 'Mamaearth', slug: 'mamaearth', logo: null },
  { id: '11', name: 'Philips', slug: 'philips', logo: null },
  { id: '12', name: 'Xiaomi', slug: 'xiaomi', logo: null },
];

// Color mapping for brand initials
const BRAND_COLORS = [
  'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300',
  'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
  'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
  'bg-lime-100 text-lime-700 dark:bg-lime-900/30 dark:text-lime-300',
  'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
  'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
];

export function BrandShowcase() {
  const [brands, setBrands] = useState<Brand[]>(FALLBACK_BRANDS);

  useEffect(() => {
    async function fetchBrands() {
      try {
        // We don't have a brands API, so we'll extract from products
        const res = await fetch('/api/products?limit=50');
        if (res.ok) {
          const data = await res.json();
          const brandMap = new Map<string, Brand>();
          (data.products || []).forEach((p: Record<string, unknown>) => {
            const b = p.brand as Record<string, string> | null;
            if (b && b.id && !brandMap.has(b.id)) {
              brandMap.set(b.id, {
                id: b.id,
                name: b.name,
                slug: b.slug,
                logo: (b.logo as string) || null,
              });
            }
          });
          if (brandMap.size > 0) {
            setBrands(Array.from(brandMap.values()));
          }
        }
      } catch {
        // Keep fallback brands
      }
    }
    fetchBrands();
  }, []);

  if (brands.length === 0) return null;

  return (
    <section className="section-padding">
      <div className="container-shop">
        {/* Section Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Top Brands
          </h2>
          <p className="text-muted-foreground text-sm md:text-base">
            Shop from your favourite brands at the best prices
          </p>
        </div>

        {/* Horizontal Scroll */}
        <div className="-mx-4 px-4 overflow-x-auto scrollbar-hide">
          <div className="flex gap-3 md:gap-4 pb-2" style={{ minWidth: 'max-content' }}>
            {brands.map((brand, i) => (
              <button
                key={brand.id}
                className="group flex flex-col items-center gap-2 p-3 md:p-4 rounded-xl border border-border/50 hover:border-primary/30 hover:shadow-md transition-all min-w-[90px] md:min-w-[110px]"
              >
                <div
                  className={cn(
                    'size-12 md:size-14 rounded-full flex items-center justify-center font-bold text-sm md:text-base transition-transform group-hover:scale-110',
                    BRAND_COLORS[i % BRAND_COLORS.length]
                  )}
                >
                  {brand.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs md:text-sm font-medium text-foreground text-center whitespace-nowrap">
                  {brand.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
