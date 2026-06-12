'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ImageWithFallback } from '@/components/ui/image-with-fallback';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useComparisonStore } from '@/lib/stores/comparison-store';

interface CompareProduct {
  id: string;
  name: string;
  slug: string;
  primaryImage: string | null;
  basePrice: number;
  salePrice: number | null;
}

export function CompareDrawer() {
  const { productIds, removeFromCompare, clearComparison } = useComparisonStore();
  const [products, setProducts] = useState<CompareProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch compared product details
  useEffect(() => {
    if (productIds.length === 0) {
      setProducts([]);
      return;
    }

    async function fetchProducts() {
      setIsLoading(true);
      try {
        const ids = productIds.join(',');
        const res = await fetch(`/api/products/compare?ids=${ids}`);
        if (res.ok) {
          const data = await res.json();
          setProducts(data.products);
        }
      } catch {
        // silently fail
      } finally {
        setIsLoading(false);
      }
    }

    fetchProducts();
  }, [productIds]);

  // Only show when 2+ products are in comparison, desktop only
  if (productIds.length < 2) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed bottom-0 left-0 right-0 z-50 hidden md:block"
      >
        <div className="bg-background/95 backdrop-blur-md border-t shadow-lg">
          <div className="container-shop px-4 md:px-6 lg:px-8 py-3">
            <div className="flex items-center gap-4">
              {/* Product Thumbnails */}
              <div className="flex items-center gap-3 flex-1 overflow-x-auto scrollbar-hide">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2 shrink-0"
                  >
                    <div className="relative size-10 rounded-md overflow-hidden bg-muted shrink-0">
                      {product.primaryImage ? (
                        <ImageWithFallback
                          src={product.primaryImage}
                          alt={product.name}
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground/40 text-xs">
                          N/A
                        </div>
                      )}
                    </div>
                    <span className="text-sm font-medium text-foreground line-clamp-1 max-w-[120px]">
                      {product.name}
                    </span>
                    <button
                      onClick={() => removeFromCompare(product.id)}
                      className="shrink-0 size-5 flex items-center justify-center rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                      aria-label={`Remove ${product.name} from comparison`}
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                ))}

                {/* Loading placeholders for unfetched IDs */}
                {isLoading && (
                  <div className="flex items-center gap-3">
                    {productIds.slice(products.length).map((id, i) => (
                      <div
                        key={id}
                        className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2 shrink-0 animate-pulse"
                      >
                        <div className="size-10 rounded-md bg-muted" />
                        <div className="h-4 w-20 rounded bg-muted" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearComparison}
                  className="gap-1.5 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="size-3.5" />
                  Clear All
                </Button>
                <Link href="/compare">
                  <Button size="sm" className="gap-1.5">
                    Compare Now
                    <ArrowRight className="size-3.5" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Product count indicator */}
            <div className="mt-1.5 flex items-center gap-1">
              <span className="text-xs text-muted-foreground">
                {productIds.length} of {4} products selected
              </span>
              {productIds.length < 4 && (
                <span className="text-xs text-muted-foreground">
                  · Add {4 - productIds.length} more from the shop
                </span>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
