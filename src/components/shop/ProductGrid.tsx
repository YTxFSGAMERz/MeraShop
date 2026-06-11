'use client';

import { ProductCard, type ProductCardProduct } from './ProductCard';
import { ProductGridSkeleton } from './LoadingSkeleton';
import { EmptyState } from './EmptyState';
import { SearchX } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductGridProps {
  products: ProductCardProduct[];
  isLoading?: boolean;
  columns?: 2 | 3 | 4;
  className?: string;
}

export function ProductGrid({
  products,
  isLoading = false,
  columns = 4,
  className,
}: ProductGridProps) {
  if (isLoading) {
    return <ProductGridSkeleton count={columns * 2} />;
  }

  if (products.length === 0) {
    return (
      <EmptyState
        icon={SearchX}
        title="No products found"
        description="We couldn't find any products matching your criteria. Try adjusting your filters or search."
      />
    );
  }

  return (
    <div
      className={cn(
        'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6',
        className
      )}
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
