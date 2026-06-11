'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Heart,
  ShoppingCart,
  Trash2,
  ArrowRight,
  ShoppingBag,
  Share2,
  Copy,
  ArrowDownUp,
  TrendingDown,
  Package,
  AlertCircle,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useWishlistStore } from '@/lib/stores/wishlist-store';
import { useCartStore } from '@/lib/stores/cart-store';
import { formatINR, calcDiscountPercent } from '@/lib/constants';
import Image from 'next/image';

// ── Deterministic helpers ──────────────────────────────────────────────────

/** Deterministic mock: did price drop since added? Returns original price if so, null otherwise. */
function getPriceDrop(itemPrice: number, itemSalePrice: number | undefined, productId: string): { dropped: boolean; originalAddedPrice: number } {
  const hash = productId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  // ~30% chance of price drop indicator
  const dropped = (hash % 10) < 3;
  if (dropped) {
    const currentEffective = itemSalePrice ?? itemPrice;
    // Original added price was 5-20% higher
    const markup = 1 + ((hash % 16) + 5) / 100;
    return { dropped: true, originalAddedPrice: Math.round(currentEffective * markup) };
  }
  return { dropped: false, originalAddedPrice: 0 };
}

/** Deterministic mock stock status */
function getStockStatus(productId: string): 'in_stock' | 'low_stock' | 'out_of_stock' {
  const hash = productId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const mod = hash % 10;
  if (mod < 6) return 'in_stock';
  if (mod < 9) return 'low_stock';
  return 'out_of_stock';
}

type SortOption = 'recent' | 'price_low' | 'price_high';

// ── Component ──────────────────────────────────────────────────────────────

export default function WishlistPage() {
  const { items, removeItem } = useWishlistStore();
  const addToCart = useCartStore((s) => s.addItem);

  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [copied, setCopied] = useState(false);

  // Sort items
  const sortedItems = useMemo(() => {
    const sorted = [...items];
    switch (sortBy) {
      case 'price_low':
        sorted.sort((a, b) => (a.salePrice ?? a.price) - (b.salePrice ?? b.price));
        break;
      case 'price_high':
        sorted.sort((a, b) => (b.salePrice ?? b.price) - (a.salePrice ?? a.price));
        break;
      case 'recent':
      default:
        // items are already in add order (most recent last), reverse for most recent first
        sorted.reverse();
        break;
    }
    return sorted;
  }, [items, sortBy]);

  // Share wishlist
  const handleShareWishlist = async () => {
    const url = `${window.location.origin}/wishlist`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  // Add all to cart
  const handleAddAllToCart = () => {
    sortedItems.forEach((item) => {
      const stock = getStockStatus(item.productId);
      if (stock !== 'out_of_stock') {
        addToCart({
          productId: item.productId,
          name: item.name,
          price: item.price,
          salePrice: item.salePrice,
          image: item.image,
        });
      }
    });
  };

  // ── Empty state ────────────────────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <div className="container-shop section-padding">
        <div className="flex items-center gap-3 mb-6">
          <h1 className="text-xl font-bold text-foreground">My Wishlist</h1>
          <Badge variant="secondary">0</Badge>
        </div>

        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <motion.div
              animate={{
                scale: [1, 1.15, 1],
                rotate: [0, -5, 5, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: 'loop',
                ease: 'easeInOut',
              }}
              className="inline-block mb-4"
            >
              <Heart className="size-16 text-primary/60" />
            </motion.div>
            <h2 className="text-lg font-semibold text-foreground mb-1">Your Wishlist is Empty</h2>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
              Save items you love for later. Browse our collection and tap the heart icon to add them here!
            </p>
            <Link href="/">
              <Button
                className="gap-1.5 text-white border-0 shadow-sm hover:shadow-md bg-saffron-gradient"
              >
                <ShoppingBag className="size-4" />
                Browse Products
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Main wishlist view ─────────────────────────────────────────────────────
  return (
    <div className="container-shop section-padding">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-foreground">My Wishlist</h1>
          <Badge variant="secondary">{items.length}</Badge>
        </div>
      </div>

      {/* Action Bar: Sort + Share + Add All */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        {/* Sort */}
        <div className="flex items-center gap-2">
          <ArrowDownUp className="size-4 text-muted-foreground" />
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
            <SelectTrigger className="w-[180px] h-9 text-sm">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Recently Added</SelectItem>
              <SelectItem value="price_low">Price: Low to High</SelectItem>
              <SelectItem value="price_high">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1" />

        {/* Share Wishlist */}
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={handleShareWishlist}
        >
          {copied ? (
            <>
              <CheckCircle2 className="size-3.5 text-emerald-500" />
              <span className="text-emerald-600">Copied!</span>
            </>
          ) : (
            <>
              <Share2 className="size-3.5" />
              Share Wishlist
            </>
          )}
        </Button>

        {/* Add All to Cart */}
        <Button
          size="sm"
          className="gap-1.5 text-white border-0 shadow-sm hover:shadow-md bg-saffron-gradient"
          onClick={handleAddAllToCart}
        >
          <ShoppingCart className="size-3.5" />
          Add All to Cart
        </Button>
      </div>

      {/* Wishlist Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <AnimatePresence mode="popLayout">
          {sortedItems.map((item) => {
            const discount = calcDiscountPercent(item.price, item.salePrice);
            const effectivePrice = item.salePrice ?? item.price;
            const priceDrop = getPriceDrop(item.price, item.salePrice, item.productId);
            const stockStatus = getStockStatus(item.productId);

            return (
              <motion.div
                key={item.productId}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="group overflow-hidden h-full">
                  <CardContent className="p-0 flex flex-col h-full">
                    {/* Image */}
                    <Link href={`/product/${item.slug}`} className="block">
                      <div className="relative aspect-square bg-muted overflow-hidden">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <ShoppingBag className="size-8 text-muted-foreground/40" />
                          </div>
                        )}

                        {/* Discount Badge */}
                        {discount > 0 && (
                          <span className="absolute top-2 left-2 z-10 rounded-md px-1.5 py-0.5 text-xs font-bold text-white shadow-sm bg-discount-red"
                          >
                            {discount}% off
                          </span>
                        )}

                        {/* Stock Status Badge */}
                        <div className="absolute top-2 right-10 z-10">
                          {stockStatus === 'out_of_stock' ? (
                            <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                              <AlertCircle className="size-3 mr-0.5" />
                              Out of Stock
                            </Badge>
                          ) : stockStatus === 'low_stock' ? (
                            <Badge className="text-[10px] px-1.5 py-0 bg-amber-500 hover:bg-amber-600 text-white">
                              <Clock className="size-3 mr-0.5" />
                              Low Stock
                            </Badge>
                          ) : (
                            <Badge className="text-[10px] px-1.5 py-0 bg-emerald-500 hover:bg-emerald-600 text-white">
                              <Package className="size-3 mr-0.5" />
                              In Stock
                            </Badge>
                          )}
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            removeItem(item.productId);
                          }}
                          className="absolute top-2 right-2 z-10 flex size-7 items-center justify-center rounded-full glass text-destructive hover:bg-destructive/10 transition-colors"
                          aria-label="Remove from wishlist"
                        >
                          <Heart className="size-3.5 fill-destructive text-destructive" />
                        </button>

                        {/* Price Drop Indicator */}
                        {priceDrop.dropped && (
                          <div className="absolute bottom-2 left-2 z-10 flex items-center gap-1 rounded-md bg-emerald-500/90 backdrop-blur-sm px-2 py-1 text-[10px] font-medium text-white">
                            <TrendingDown className="size-3" />
                            Price dropped ₹{(priceDrop.originalAddedPrice - effectivePrice).toLocaleString('en-IN')}
                          </div>
                        )}
                      </div>
                    </Link>

                    {/* Content */}
                    <div className="p-3 space-y-2 flex-1 flex flex-col">
                      {/* Name */}
                      <Link href={`/product/${item.slug}`}>
                        <h3 className="line-clamp-2 text-sm font-medium text-foreground hover:text-primary transition-colors min-h-[2.5rem]">
                          {item.name}
                        </h3>
                      </Link>

                      {/* Price */}
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-foreground">
                          {formatINR(effectivePrice)}
                        </span>
                        {item.salePrice && item.salePrice < item.price && (
                          <span className="text-sm text-muted-foreground line-through">
                            {formatINR(item.price)}
                          </span>
                        )}
                      </div>

                      {/* Price Drop Detail */}
                      {priceDrop.dropped && (
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400">
                          Was {formatINR(priceDrop.originalAddedPrice)} when added — now {formatINR(effectivePrice)}
                        </p>
                      )}

                      <div className="flex-1" />
                      <Separator />

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1 gap-1.5 text-white border-0 shadow-sm bg-saffron-gradient"
                          disabled={stockStatus === 'out_of_stock'}
                          onClick={() => {
                            addToCart({
                              productId: item.productId,
                              name: item.name,
                              price: item.price,
                              salePrice: item.salePrice,
                              image: item.image,
                            });
                            removeItem(item.productId);
                          }}
                        >
                          <ShoppingCart className="size-3.5" />
                          {stockStatus === 'out_of_stock' ? 'Unavailable' : 'Move to Cart'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive hover:text-destructive"
                          onClick={() => removeItem(item.productId)}
                          aria-label="Remove from wishlist"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Browse More */}
      <div className="mt-8 text-center">
        <Link href="/">
          <Button variant="outline" className="gap-1.5">
            Continue Shopping
            <ArrowRight className="size-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
