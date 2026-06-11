'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { CATEGORY_COLORS } from '@/lib/constants';
import { cn } from '@/lib/utils';

export interface CategoryCardCategory {
  id: string;
  name: string;
  slug: string;
  image: string;
  productCount?: number;
}

interface CategoryCardProps {
  category: CategoryCardCategory;
  className?: string;
}

export function CategoryCard({ category, className }: CategoryCardProps) {
  const colorKey = Object.keys(CATEGORY_COLORS).find(
    (key) => category.slug.toLowerCase().includes(key)
  );
  const colors = colorKey
    ? CATEGORY_COLORS[colorKey]
    : { bg: 'bg-muted', text: 'text-foreground', border: 'border-border' };

  return (
    <Link
      href={`/shop?category=${category.slug}`}
      className={cn(
        'group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-xl',
        className
      )}
    >
      <div
        className={cn(
          'relative aspect-[4/3] md:aspect-square overflow-hidden rounded-xl border transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1.5 group-hover:shadow-orange-500/10 dark:group-hover:shadow-orange-400/10',
          colors.bg,
          colors.border
        )}
      >
        {category.image && (
          <Image
            src={category.image}
            alt={category.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
          />
        )}

        {/* Premium gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-black/5" />

        {/* Hover gradient accent overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-orange-600/40 via-orange-500/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Category name centered */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-2">
          <h3
            className={cn(
              'text-sm md:text-base lg:text-lg font-bold text-white text-center drop-shadow-md transition-transform duration-300 group-hover:-translate-y-1',
            )}
          >
            {category.name}
          </h3>
          {category.productCount !== undefined && (
            <Badge
              variant="secondary"
              className="mt-1.5 text-[10px] px-1.5 py-0 h-5 bg-white/20 text-white border-0 backdrop-blur-sm transition-all duration-300 group-hover:bg-white/30"
            >
              {category.productCount} items
            </Badge>
          )}
        </div>

        {/* Shop Now overlay - slides up on hover */}
        <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out">
          <div className="glass py-2 text-center text-sm font-semibold text-foreground flex items-center justify-center gap-1.5">
            <span>Shop Now</span>
            <ArrowRight className="size-3.5" />
          </div>
        </div>
      </div>
    </Link>
  );
}
