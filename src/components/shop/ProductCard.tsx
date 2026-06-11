'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ImageWithFallback } from '@/components/ui/image-with-fallback';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingCart, Sparkles, TrendingUp, Check, Eye, Scale, Flame, Timer, Award, Percent } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatINR, calcDiscountPercent } from '@/lib/constants';
import { useCartStore } from '@/lib/stores/cart-store';
import { useWishlistStore } from '@/lib/stores/wishlist-store';
import { useComparisonStore } from '@/lib/stores/comparison-store';
import { cn } from '@/lib/utils';
import { notifyCartAdd, notifyWishlistAdd, notifyWishlistRemove } from '@/lib/notifications';
import { RatingStars } from './RatingStars';
import { PriceDisplay } from './PriceDisplay';
import { QuickViewModal } from './QuickViewModal';

export interface ProductCardProduct {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  salePrice?: number;
  images: { url: string; isPrimary: boolean }[];
  avgRating: number;
  reviewCount: number;
  brand?: { name: string };
  stock: number;
  isNewArrival?: boolean;
  isBestseller?: boolean;
  totalSold?: number;
  colorVariants?: string[];
  createdAt?: string;
}

// Common CSS color name to hex mapping for color dots
const COLOR_MAP: Record<string, string> = {
  red: '#ef4444', blue: '#3b82f6', green: '#22c55e', black: '#1f2937',
  white: '#f9fafb', pink: '#ec4899', purple: '#a855f7', yellow: '#eab308',
  orange: '#f97316', brown: '#92400e', grey: '#6b7280', gray: '#6b7280',
  navy: '#1e3a5f', beige: '#d2b48c', gold: '#d4a017', silver: '#c0c0c0',
  maroon: '#800000', teal: '#14b8a6', coral: '#ff7f50', olive: '#808000',
  cream: '#fffdd0', charcoal: '#36454f', copper: '#b87333', ivory: '#fffff0',
  tan: '#d2b48c', khaki: '#c3b091', lavender: '#e6e6fa', mint: '#98fb98',
};

function getColorDot(colorName: string): string {
  const lower = colorName.toLowerCase();
  if (COLOR_MAP[lower]) return COLOR_MAP[lower];
  // If it looks like a CSS color, use it directly
  if (lower.startsWith('#') || lower.startsWith('rgb')) return lower;
  return lower;
}

interface ProductCardProps {
  product: ProductCardProduct;
  className?: string;
  showQuickView?: boolean;
}

export function ProductCard({ product, className, showQuickView = true }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const isInWishlist = useWishlistStore((s) => s.isInWishlist);
  const addItemToWishlist = useWishlistStore((s) => s.addItem);
  const removeItemFromWishlist = useWishlistStore((s) => s.removeItem);
  const { addToCompare, removeFromCompare, isInComparison } = useComparisonStore();

  const wishlisted = isInWishlist(product.id);
  const isCompared = isInComparison(product.id);
  const discount = calcDiscountPercent(product.basePrice, product.salePrice);
  const primaryImage = product.images.find((img) => img.isPrimary)?.url ?? product.images[0]?.url;
  const isOutOfStock = product.stock <= 0;

  const [justAdded, setJustAdded] = useState(false);
  const [quickViewOpen, setQuickViewOpen] = useState(false);

  // Check if product was created within the last 7 days
  const isNewByDate = useMemo(() => {
    if (!product.createdAt) return false;
    const created = new Date(product.createdAt);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return created > sevenDaysAgo;
  }, [product.createdAt]);

  const showNewBadge = product.isNewArrival || isNewByDate;

  // Stock level for progress bar
  const stockLevel = useMemo(() => {
    if (product.stock <= 0) return { percent: 0, level: 'low' as const };
    if (product.stock <= 5) return { percent: Math.min(20, (product.stock / 25) * 100), level: 'low' as const };
    if (product.stock <= 15) return { percent: Math.min(55, (product.stock / 25) * 100), level: 'medium' as const };
    return { percent: Math.min(100, (product.stock / 25) * 100), level: 'high' as const };
  }, [product.stock]);

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (wishlisted) {
      removeItemFromWishlist(product.id);
      notifyWishlistRemove(product.name);
    } else {
      addItemToWishlist({
        productId: product.id,
        name: product.name,
        price: product.basePrice,
        salePrice: product.salePrice,
        image: primaryImage ?? '',
        slug: product.slug,
      });
      notifyWishlistAdd(product.name);
    }
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setQuickViewOpen(true);
  };

  const handleCompareToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isCompared) {
      removeFromCompare(product.id);
    } else {
      addToCompare(product.id);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    addItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: product.basePrice,
      salePrice: product.salePrice,
      image: primaryImage ?? '',
    });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
    notifyCartAdd(product.name);
  };

  // Deterministic fake "claimed" percentage based on product ID for deals
  const claimedPercent = product.isBestseller
    ? Math.min(95, ((parseInt(product.id.slice(-2), 16) % 40) + 55))
    : 0;

  const isOnSale = discount > 0;

  return (
    <>
    <Link
      href={`/product/${product.slug}`}
      className={cn('block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg', className)}
    >
      <article className="card-product gradient-border card-shine-hover h-full flex flex-col group">
        {/* Image Section */}
        <div className="relative aspect-square overflow-hidden bg-muted">
          {primaryImage ? (
            <ImageWithFallback
              src={primaryImage ?? ''}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-muted">
              <ShoppingCart className="size-8 text-muted-foreground/40" />
            </div>
          )}

          {/* Discount Badge - Top Left with gradient background and bounce animation */}
          {discount > 0 && (
            <motion.span
              className="absolute top-2 left-2 z-10 inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold text-white shadow-sm bg-discount-red"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15, delay: 0.1 }}
            >
              {discount}% off
            </motion.span>
          )}

          {/* Save X% Floating Badge on Desktop Hover */}
          {isOnSale && (
            <motion.div
              className="absolute top-11 left-2 z-10 hidden md:flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-md bg-stock-green"
              initial={false}
            >
              <Percent className="size-2.5" />
              Save {formatINR(product.basePrice - (product.salePrice ?? product.basePrice))}
            </motion.div>
          )}

          {/* Enhanced Badges - Top Right area, staggered below discount badge */}
          {(() => {
            const badges: { label: string; icon: React.ComponentType<{ className?: string }>; gradient: string; top: string }[] = [];

            if ((product.totalSold ?? 0) > 50) {
              badges.push({ label: 'Trending', icon: Flame, gradient: 'linear-gradient(135deg, #f97316, #ef4444)', top: 'top-2' });
            }

            if (discount > 30) {
              badges.push({ label: 'Limited Time', icon: Timer, gradient: 'linear-gradient(135deg, #f59e0b, #d97706)', top: 'top-11' });
            }

            if (product.avgRating >= 4.5 && product.reviewCount >= 10) {
              const topPos = badges.length === 0 ? 'top-2' : badges.length === 1 ? 'top-11' : 'top-20';
              badges.push({ label: 'Top Rated', icon: Award, gradient: 'linear-gradient(135deg, #22c55e, #16a34a)', top: topPos });
            }

            return badges.map((badge, idx) => {
              const BadgeIcon = badge.icon;
              return (
                <motion.span
                  key={badge.label}
                  className={cn('absolute right-2 z-10 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[9px] font-bold text-white shadow-sm', badge.top)}
                  style={{ background: badge.gradient }}
                  suppressHydrationWarning
                  initial={{ scale: 0, opacity: 0, x: 10 }}
                  animate={{ scale: 1, opacity: 1, x: 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 15, delay: 0.2 + idx * 0.1 }}
                >
                  <BadgeIcon className="size-2.5" />
                  {badge.label}
                </motion.span>
              );
            });
          })()}

          {/* Wishlist Button - Top Right with heart fill animation + pulse when on sale */}
          <button
            onClick={handleWishlistToggle}
            className={cn(
              'absolute top-2 right-2 z-10 flex size-8 items-center justify-center rounded-full glass transition-all duration-200 hover:bg-white/90 dark:hover:bg-white/20 hover:scale-110',
              wishlisted && 'text-destructive',
              isOnSale && !wishlisted && 'wishlist-pulse'
            )}
            aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <motion.div
              key={wishlisted ? 'filled' : 'empty'}
              initial={{ scale: wishlisted ? 0.5 : 1 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 15 }}
            >
              <Heart
                className={cn(
                  'size-4 transition-colors',
                  wishlisted ? 'fill-destructive text-destructive' : 'text-muted-foreground'
                )}
              />
            </motion.div>
          </button>

          {/* Compare Button - Desktop only, below wishlist */}
          <button
            onClick={handleCompareToggle}
            className={cn(
              'absolute top-2 right-2 z-10 hidden md:flex size-8 items-center justify-center rounded-full glass transition-all duration-200 hover:bg-white/90 dark:hover:bg-white/20 hover:scale-110 mt-10',
              isCompared && 'text-primary bg-primary/10 hover:bg-primary/20'
            )}
            aria-label={isCompared ? 'Remove from comparison' : 'Add to comparison'}
          >
            <Scale
              className={cn(
                'size-4 transition-colors',
                isCompared ? 'text-primary' : 'text-muted-foreground'
              )}
            />
          </button>

          {/* Quick View - Mobile: small eye icon top-left */}
          {showQuickView && (
            <button
              onClick={handleQuickView}
              className="absolute top-2 left-2 z-20 flex size-8 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm transition-all duration-200 hover:bg-background hover:scale-110 md:hidden"
              aria-label="Quick view"
            >
              <Eye className="size-4 text-muted-foreground" />
            </button>
          )}

          {/* Quick View - Desktop: overlay on hover */}
          {showQuickView && (
            <div className="absolute inset-x-0 bottom-0 z-20 hidden md:flex justify-center pb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button
                onClick={handleQuickView}
                className="flex items-center gap-1.5 rounded-full bg-background/90 backdrop-blur-sm border border-border/50 px-4 py-2 text-xs font-medium text-foreground shadow-lg transition-all duration-200 hover:bg-background hover:shadow-xl hover:scale-105 active:scale-95"
              >
                <Eye className="size-3.5" />
                Quick View
              </button>
            </div>
          )}

          {/* Status Badges */}
          <div className="absolute bottom-2 left-2 flex gap-1 z-10">
            {showNewBadge && (
              <Badge variant="default" className="gap-0.5 text-[10px] px-1.5 py-0 h-5">
                <Sparkles className="size-2.5" />
                New
              </Badge>
            )}
            {product.isBestseller && (
              <Badge variant="secondary" className="gap-0.5 text-[10px] px-1.5 py-0 h-5">
                <TrendingUp className="size-2.5" />
                Bestseller
              </Badge>
            )}
            {isOutOfStock && (
              <Badge variant="destructive" className="text-[10px] px-1.5 py-0 h-5">
                Out of Stock
              </Badge>
            )}
          </div>

          {/* Color Dots - bottom right */}
          {product.colorVariants && product.colorVariants.length > 0 && (
            <div className="absolute bottom-2 right-2 z-10 flex items-center gap-0.5">
              {product.colorVariants.slice(0, 5).map((color, idx) => (
                <span
                  key={idx}
                  className="size-3 rounded-full border border-white/60 shadow-sm"
                  style={{ backgroundColor: getColorDot(color) }}
                  title={color}
                />
              ))}
              {product.colorVariants.length > 5 && (
                <span className="text-[8px] text-white font-medium ml-0.5 drop-shadow">
                  +{product.colorVariants.length - 5}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="flex flex-1 flex-col gap-1.5 p-3">
          {/* Brand */}
          {product.brand?.name && (
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
              {product.brand.name}
            </span>
          )}

          {/* Product Name */}
          <h3 className="line-clamp-2 text-sm font-medium leading-snug text-foreground min-h-[2.5rem]">
            {product.name}
          </h3>

          {/* Rating */}
          <RatingStars rating={product.avgRating} reviewCount={product.reviewCount} size="sm" />

          {/* Price */}
          <PriceDisplay
            price={product.basePrice}
            salePrice={product.salePrice}
            size="sm"
          />

          {/* Stock progress bar - show when low stock */}
          {!isOutOfStock && product.stock > 0 && product.stock <= 15 && (
            <div className="mt-0.5">
              <div className="stock-progress-bar">
                <div
                  className={cn('stock-progress-fill', stockLevel.level)}
                  style={{ width: `${stockLevel.percent}%` }}
                />
              </div>
              <p className={cn(
                'text-[10px] mt-0.5 font-medium',
                product.stock <= 5 ? 'text-red-500' : 'text-amber-600 dark:text-amber-400'
              )}>
                Only {product.stock} left!
              </p>
            </div>
          )}

          {/* Claimed progress bar for bestseller/deals items */}
          {claimedPercent > 0 && (
            <div className="mt-0.5">
              <div className="claimed-bar">
                <div className="claimed-bar-fill" style={{ width: `${claimedPercent}%` }} />
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5 font-medium">
                {claimedPercent}% claimed
              </p>
            </div>
          )}

          {/* Add to Cart Button with gradient and success animation */}
          <Button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            size="sm"
            className={cn(
              'mt-1 w-full gap-1.5 transition-all duration-200 border-0 text-white',
              justAdded
                ? 'bg-green-600 hover:bg-green-600'
                : !isOutOfStock && 'shadow-sm hover:shadow-md'
            )}
            style={!justAdded && !isOutOfStock ? { background: 'linear-gradient(135deg, #f97316, #ea580c)' } : undefined}
            variant={isOutOfStock ? 'secondary' : 'default'}
          >
            <AnimatePresence mode="wait" initial={false}>
              {justAdded ? (
                <motion.span
                  key="check"
                  initial={{ scale: 0, rotate: -90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 90 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-1.5"
                >
                  <Check className="size-3.5" />
                  Added!
                </motion.span>
              ) : (
                <motion.span
                  key="cart"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center gap-1.5"
                >
                  <ShoppingCart className="size-3.5" />
                  {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                </motion.span>
              )}
            </AnimatePresence>
          </Button>
        </div>
      </article>
    </Link>

      {/* Quick View Modal */}
      {showQuickView && (
        <QuickViewModal
          product={product}
          open={quickViewOpen}
          onOpenChange={setQuickViewOpen}
        />
      )}
    </>
  );
}
