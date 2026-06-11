'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  X,
  ShoppingCart,
  Star,
  ArrowLeft,
  Package,
  Truck,
  RotateCcw,
  Shield,
} from 'lucide-react';
import { toast } from 'sonner';

import { cn } from '@/lib/utils';
import { formatINR, calcDiscountPercent } from '@/lib/constants';
import { useComparisonStore } from '@/lib/stores/comparison-store';
import { useCartStore } from '@/lib/stores/cart-store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RatingStars } from '@/components/shop/RatingStars';

// ── Types ──────────────────────────────────────────────────────────────────

interface CompareProduct {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  basePrice: number;
  salePrice: number | null;
  effectivePrice: number;
  discountPercent: number;
  primaryImage: string | null;
  primaryImageAlt: string;
  category: { id: string; name: string; slug: string };
  brand: { id: string; name: string; slug: string; logo: string | null } | null;
  variantGroups: Record<string, Array<{ id: string; value: string; price: number | null; stock: number }>>;
  avgRating: number;
  reviewCount: number;
  totalSold: number;
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestseller: boolean;
  stock: number;
  shippingFree: boolean;
  returnPolicy: string | null;
  tags: string[];
  specifications: Record<string, string> | null;
  sku: string | null;
  weight: number | null;
  dimensions: string | null;
}

// ── Page Component ─────────────────────────────────────────────────────────

export default function ComparePage() {
  const { productIds, removeFromCompare, clearComparison } = useComparisonStore();
  const addItem = useCartStore((s) => s.addItem);

  const [products, setProducts] = useState<CompareProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      if (productIds.length === 0) {
        setProducts([]);
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const ids = productIds.join(',');
        const res = await fetch(`/api/products/compare?ids=${ids}`);
        if (res.ok) {
          const data = await res.json();
          setProducts(data.products);
        }
      } catch {
        toast.error('Failed to load comparison data');
      } finally {
        setIsLoading(false);
      }
    }
    fetchProducts();
  }, [productIds]);

  const handleAddToCart = (product: CompareProduct) => {
    addItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: product.basePrice,
      salePrice: product.salePrice ?? undefined,
      image: product.primaryImage ?? '',
    });
    toast.success('Added to cart', { description: product.name });
  };

  const handleRemove = (productId: string) => {
    removeFromCompare(productId);
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  // Collect all spec keys across compared products
  const allSpecKeys = Array.from(
    new Set(products.flatMap((p) => (p.specifications ? Object.keys(p.specifications) : [])))
  );

  // Collect all variant group names
  const allVariantNames = Array.from(
    new Set(products.flatMap((p) => Object.keys(p.variantGroups)))
  );

  // ── Loading State ──────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="container-shop px-4 md:px-6 lg:px-8 py-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-4">
              <div className="aspect-square bg-muted animate-pulse rounded-xl" />
              <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
              <div className="h-4 w-1/2 bg-muted animate-pulse rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Empty State ────────────────────────────────────────────────────────
  if (products.length < 2) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-4 px-4">
          <div className="size-20 mx-auto rounded-full bg-muted flex items-center justify-center">
            <Package className="size-10 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Compare Products</h1>
          <p className="text-muted-foreground max-w-md">
            Add at least 2 products to compare them side by side. Browse our shop and click the compare icon on products you&apos;d like to compare.
          </p>
          <Link href="/shop">
            <Button className="gap-2">
              <ArrowLeft className="size-4" />
              Browse Products
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // ── Comparison Table ───────────────────────────────────────────────────
  return (
    <div className="min-h-screen pb-20 md:pb-10">
      {/* Header */}
      <div className="border-b bg-muted/30">
        <div className="container-shop px-4 md:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/shop" className="text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="size-5" />
              </Link>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-foreground">Compare Products</h1>
                <p className="text-sm text-muted-foreground">
                  Comparing {products.length} products
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                clearComparison();
                setProducts([]);
              }}
              className="text-muted-foreground hover:text-destructive"
            >
              Clear All
            </Button>
          </div>
        </div>
      </div>

      {/* Comparison Content */}
      <div className="container-shop px-4 md:px-6 lg:px-8 py-6">
        <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
          <table className="w-full min-w-[600px] md:min-w-0 border-collapse">
            <thead>
              <tr>
                <th className="w-32 md:w-40 p-3 text-left text-sm font-medium text-muted-foreground align-top sticky left-0 bg-background z-10">
                  Feature
                </th>
                {products.map((product) => (
                  <th key={product.id} className="p-3 text-center align-top min-w-[180px]">
                    {/* Remove button */}
                    <div className="flex justify-end mb-2">
                      <button
                        onClick={() => handleRemove(product.id)}
                        className="size-6 flex items-center justify-center rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                        aria-label={`Remove ${product.name} from comparison`}
                      >
                        <X className="size-3.5" />
                      </button>
                    </div>

                    {/* Image */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="relative aspect-square rounded-xl overflow-hidden bg-muted mb-3"
                    >
                      {product.primaryImage ? (
                        <Image
                          src={product.primaryImage}
                          alt={product.primaryImageAlt}
                          fill
                          sizes="180px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Package className="size-10 text-muted-foreground/30" />
                        </div>
                      )}
                      {product.discountPercent > 0 && (
                        <span
                          className="absolute top-2 left-2 inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold text-white shadow-sm bg-discount-red"
                        >
                          {product.discountPercent}% off
                        </span>
                      )}
                    </motion.div>

                    {/* Name */}
                    <Link
                      href={`/product/${product.slug}`}
                      className="text-sm font-semibold text-foreground hover:text-primary transition-colors line-clamp-2 text-left"
                    >
                      {product.name}
                    </Link>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Price Row */}
              <ComparisonRow label="Price">
                {products.map((product) => (
                  <td key={product.id} className="p-3 text-center">
                    <div className="space-y-1">
                      <span className="text-lg font-bold text-foreground">
                        {formatINR(product.effectivePrice)}
                      </span>
                      {product.salePrice && product.salePrice < product.basePrice && (
                        <>
                          <br />
                          <span className="text-sm text-muted-foreground line-through">
                            {formatINR(product.basePrice)}
                          </span>
                          <span className="ml-1 text-xs font-semibold text-green-600 dark:text-green-400">
                            {product.discountPercent}% off
                          </span>
                        </>
                      )}
                    </div>
                  </td>
                ))}
              </ComparisonRow>

              {/* Rating Row */}
              <ComparisonRow label="Rating">
                {products.map((product) => (
                  <td key={product.id} className="p-3 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <RatingStars rating={product.avgRating} reviewCount={product.reviewCount} size="sm" />
                    </div>
                  </td>
                ))}
              </ComparisonRow>

              {/* Brand Row */}
              <ComparisonRow label="Brand">
                {products.map((product) => (
                  <td key={product.id} className="p-3 text-center">
                    <span className="text-sm text-foreground">
                      {product.brand?.name || '—'}
                    </span>
                  </td>
                ))}
              </ComparisonRow>

              {/* Category Row */}
              <ComparisonRow label="Category">
                {products.map((product) => (
                  <td key={product.id} className="p-3 text-center">
                    <span className="text-sm text-foreground">
                      {product.category.name}
                    </span>
                  </td>
                ))}
              </ComparisonRow>

              {/* Stock Row */}
              <ComparisonRow label="Availability">
                {products.map((product) => (
                  <td key={product.id} className="p-3 text-center">
                    {product.stock > 0 ? (
                      <Badge variant="outline" className="text-green-600 border-green-300 text-xs">
                        In Stock ({product.stock})
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="text-xs">
                        Out of Stock
                      </Badge>
                    )}
                  </td>
                ))}
              </ComparisonRow>

              {/* Free Delivery Row */}
              <ComparisonRow label="Free Delivery">
                {products.map((product) => (
                  <td key={product.id} className="p-3 text-center">
                    {product.shippingFree ? (
                      <span className="inline-flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
                        <Truck className="size-3.5" />
                        Free
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground">Standard</span>
                    )}
                  </td>
                ))}
              </ComparisonRow>

              {/* Return Policy Row */}
              <ComparisonRow label="Return Policy">
                {products.map((product) => (
                  <td key={product.id} className="p-3 text-center">
                    <span className="inline-flex items-center gap-1 text-sm text-foreground">
                      <RotateCcw className="size-3.5 text-primary" />
                      {product.returnPolicy || '7 Days'}
                    </span>
                  </td>
                ))}
              </ComparisonRow>

              {/* Total Sold Row */}
              <ComparisonRow label="Total Sold">
                {products.map((product) => (
                  <td key={product.id} className="p-3 text-center">
                    <span className="text-sm text-foreground">
                      {product.totalSold > 0 ? product.totalSold.toLocaleString('en-IN') : '—'}
                    </span>
                  </td>
                ))}
              </ComparisonRow>

              {/* Variant Groups */}
              {allVariantNames.map((variantName) => (
                <ComparisonRow key={variantName} label={variantName}>
                  {products.map((product) => {
                    const group = product.variantGroups[variantName];
                    return (
                      <td key={product.id} className="p-3 text-center">
                        {group ? (
                          <div className="flex flex-wrap justify-center gap-1">
                            {group.map((opt) => (
                              <Badge key={opt.id} variant="secondary" className="text-xs">
                                {opt.value}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </td>
                    );
                  })}
                </ComparisonRow>
              ))}

              {/* Specifications */}
              {allSpecKeys.map((specKey) => (
                <ComparisonRow key={specKey} label={specKey}>
                  {products.map((product) => (
                    <td key={product.id} className="p-3 text-center">
                      <span className="text-sm text-foreground">
                        {product.specifications?.[specKey] || '—'}
                      </span>
                    </td>
                  ))}
                </ComparisonRow>
              ))}

              {/* Tags Row */}
              <ComparisonRow label="Tags">
                {products.map((product) => (
                  <td key={product.id} className="p-3 text-center">
                    {product.tags.length > 0 ? (
                      <div className="flex flex-wrap justify-center gap-1">
                        {product.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </td>
                ))}
              </ComparisonRow>

              {/* Add to Cart Row */}
              <ComparisonRow label="" className="border-t-2">
                {products.map((product) => (
                  <td key={product.id} className="p-3 text-center">
                    <Button
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock <= 0}
                      size="sm"
                      className="gap-1.5 w-full text-white border-0 bg-saffron-gradient"
                    >
                      <ShoppingCart className="size-3.5" />
                      {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                    </Button>
                  </td>
                ))}
              </ComparisonRow>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Helper: Comparison Row ─────────────────────────────────────────────────

function ComparisonRow({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <tr className={cn('border-b', className)}>
      <td className="p-3 text-sm font-medium text-muted-foreground bg-muted/20 sticky left-0 z-10 whitespace-nowrap">
        {label}
      </td>
      {children}
    </tr>
  );
}
