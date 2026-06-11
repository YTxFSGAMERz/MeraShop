'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { ImageWithFallback } from '@/components/ui/image-with-fallback';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart,
  Minus,
  Plus,
  Eye,
  Truck,
  RotateCcw,
  Shield,
  Check,
  Package,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';

import { cn } from '@/lib/utils';
import { calcDiscountPercent } from '@/lib/constants';
import { useCartStore } from '@/lib/stores/cart-store';
import { notifyCartAdd, notifyWishlistAdd } from '@/lib/notifications';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
} from '@/components/ui/drawer';
import { RatingStars } from './RatingStars';
import { PriceDisplay } from './PriceDisplay';
import type { ProductCardProduct } from './ProductCard';

// ── Types ────────────────────────────────────────────────────────────────────

interface ProductVariant {
  id: string;
  name: string;
  value: string;
  price: number | null;
  stock: number;
}

interface FullProductData {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  shortDescription: string | null;
  basePrice: number;
  salePrice: number | null;
  effectivePrice: number;
  discountPercent: number;
  primaryImage: string | null;
  primaryImageAlt: string;
  brand: {
    id: string;
    name: string;
    slug: string;
    logo: string | null;
    description: string | null;
  } | null;
  images: { id: string; url: string; altText: string | null; isPrimary: boolean; sortOrder: number }[];
  variants: ProductVariant[];
  variantGroups: Record<string, Array<{ id: string; value: string; price: number | null; stock: number }>>;
  avgRating: number;
  reviewCount: number;
  totalSold: number;
  stock: number;
  lowStockThreshold: number;
  shippingFree: boolean;
  returnPolicy: string | null;
  specifications: Record<string, string> | null;
}

interface QuickViewModalProps {
  product: ProductCardProduct | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// ── Loading Skeleton ─────────────────────────────────────────────────────────

function QuickViewSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 p-1">
      {/* Image skeleton */}
      <div className="aspect-square rounded-xl bg-muted animate-pulse" />
      {/* Details skeleton */}
      <div className="space-y-3">
        <div className="h-3 w-20 rounded bg-muted animate-pulse" />
        <div className="h-6 w-3/4 rounded bg-muted animate-pulse" />
        <div className="h-4 w-28 rounded bg-muted animate-pulse" />
        <div className="h-8 w-32 rounded bg-muted animate-pulse" />
        <div className="h-4 w-48 rounded bg-muted animate-pulse" />
        <div className="h-10 w-full rounded bg-muted animate-pulse mt-2" />
        <div className="h-10 w-full rounded bg-muted animate-pulse" />
        <div className="h-8 w-full rounded bg-muted animate-pulse" />
      </div>
    </div>
  );
}

// ── Quick View Content ───────────────────────────────────────────────────────

function QuickViewContent({
  basicProduct,
  fullProduct,
  isLoading,
  onClose,
}: {
  basicProduct: ProductCardProduct;
  fullProduct: FullProductData | null;
  isLoading: boolean;
  onClose: () => void;
}) {
  const addItem = useCartStore((s) => s.addItem);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [justAdded, setJustAdded] = useState(false);

  // Use full product data when available, fall back to basic
  const product = fullProduct ?? basicProduct;
  const discount = calcDiscountPercent(basicProduct.basePrice, basicProduct.salePrice);
  const primaryImage =
    basicProduct.images.find((img) => img.isPrimary)?.url ?? basicProduct.images[0]?.url;
  const isOutOfStock = 'stock' in product ? (product as { stock: number }).stock <= 0 : false;
  const shortDesc = fullProduct?.shortDescription ?? null;
  const variantGroups = fullProduct?.variantGroups ?? {};
  const stock = 'stock' in product ? (product as { stock: number }).stock : 99;
  const shippingFree = fullProduct?.shippingFree ?? false;
  const returnPolicy = fullProduct?.returnPolicy ?? null;
  const brandName = basicProduct.brand?.name ?? fullProduct?.brand?.name;

  // Compute default variants from fullProduct
  const defaultVariants = useMemo(() => {
    if (!fullProduct?.variantGroups) return {};
    const defaults: Record<string, string> = {};
    for (const [name, options] of Object.entries(fullProduct.variantGroups)) {
      if (options.length > 0) {
        defaults[name] = options[0].value;
      }
    }
    return defaults;
  }, [fullProduct]);

  // Effective selected variants: user selection overrides defaults
  const effectiveVariants = useMemo(() => {
    return { ...defaultVariants, ...selectedVariants };
  }, [defaultVariants, selectedVariants]);

  // Get variant price override
  const getVariantPrice = useCallback((): number | null => {
    if (!fullProduct) return null;
    for (const [name, value] of Object.entries(effectiveVariants)) {
      const group = fullProduct.variantGroups[name];
      if (group) {
        const variant = group.find((v) => v.value === value);
        if (variant?.price !== null && variant?.price !== undefined) {
          return variant.price;
        }
      }
    }
    return null;
  }, [fullProduct, effectiveVariants]);

  const variantPrice = getVariantPrice();

  const handleVariantSelect = (name: string, value: string) => {
    setSelectedVariants((prev) => ({ ...prev, [name]: value }));
    setQuantity(1);
  };

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => Math.max(1, Math.min(prev + delta, stock)));
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    const variantId = fullProduct
      ? Object.entries(effectiveVariants)
          .map(([name, value]) => {
            const group = fullProduct.variantGroups[name];
            return group?.find((v) => v.value === value)?.id;
          })
          .filter(Boolean)[0]
      : undefined;

    const variantName = Object.entries(effectiveVariants)
      .map(([name, value]) => `${name}: ${value}`)
      .join(', ');

    addItem(
      {
        productId: basicProduct.id,
        name: basicProduct.name,
        slug: basicProduct.slug,
        price: basicProduct.basePrice,
        salePrice: basicProduct.salePrice,
        image: primaryImage ?? '',
        variantId,
        variantName: variantName || undefined,
      },
      quantity
    );

    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);

    notifyCartAdd(basicProduct.name);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    onClose();
    window.location.href = '/cart';
  };

  // Additional images (from full product data)
  const displayImages = fullProduct?.images ?? [];
  const additionalImages = displayImages.filter((img) => img.url !== primaryImage).slice(0, 3);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 p-1">
      {/* ── Image Section ─────────────────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="relative aspect-square rounded-xl overflow-hidden bg-muted shadow-sm">
          {primaryImage ? (
            <ImageWithFallback
              src={primaryImage}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 400px"
              className="object-contain p-4"
              priority
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Package className="size-12 text-muted-foreground/30" />
            </div>
          )}

          {/* Discount badge */}
          {discount > 0 && (
            <span className="absolute top-3 left-3 discount-badge z-10">
              {discount}% off
            </span>
          )}

          {/* Status badges */}
          <div className="absolute top-3 right-3 flex flex-col gap-1 z-10">
            {basicProduct.isNewArrival && (
              <Badge className="text-[10px] px-2">New</Badge>
            )}
            {basicProduct.isBestseller && (
              <Badge variant="secondary" className="text-[10px] px-2">
                Bestseller
              </Badge>
            )}
          </div>
        </div>

        {/* Thumbnail strip */}
        {additionalImages.length > 0 && (
          <div className="flex gap-2">
            <div className="relative size-14 rounded-lg overflow-hidden border-2 border-primary ring-1 ring-primary/30 shrink-0">
              <ImageWithFallback
                src={primaryImage!}
                alt={product.name}
                fill
                className="object-cover"
                sizes="56px"
              />
            </div>
            {additionalImages.map((img) => (
              <div
                key={img.id}
                className="relative size-14 rounded-lg overflow-hidden border border-border shrink-0"
              >
                <ImageWithFallback
                  src={img.url}
                  alt={img.altText || product.name}
                  fill
                  className="object-cover"
                  sizes="56px"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Details Section ───────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3">
        {/* Brand */}
        {brandName && (
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
            {brandName}
          </span>
        )}

        {/* Product Name */}
        <h2 className="text-lg md:text-xl font-bold text-foreground leading-snug line-clamp-2">
          {basicProduct.name}
        </h2>

        {/* Rating */}
        <div className="flex items-center gap-2">
          <RatingStars rating={basicProduct.avgRating} reviewCount={basicProduct.reviewCount} size="md" />
          {fullProduct?.totalSold != null && fullProduct.totalSold > 0 && (
            <span className="text-xs text-muted-foreground">
              · {fullProduct.totalSold.toLocaleString('en-IN')} sold
            </span>
          )}
        </div>

        {/* Price */}
        <div className="space-y-0.5">
          <PriceDisplay
            price={basicProduct.basePrice}
            salePrice={variantPrice ?? basicProduct.salePrice}
            size="lg"
          />
          <p className="text-[11px] text-muted-foreground">Inclusive of all taxes</p>
        </div>

        {/* Short Description */}
        {shortDesc && (
          <p className="text-sm text-muted-foreground line-clamp-2">{shortDesc}</p>
        )}

        {/* Loading indicator for additional details */}
        {isLoading && (
          <div className="space-y-2">
            <div className="h-3 w-24 rounded bg-muted animate-pulse" />
            <div className="flex gap-2">
              <div className="h-8 w-16 rounded bg-muted animate-pulse" />
              <div className="h-8 w-16 rounded bg-muted animate-pulse" />
              <div className="h-8 w-16 rounded bg-muted animate-pulse" />
            </div>
          </div>
        )}

        {/* Variant Selectors */}
        {!isLoading && Object.entries(variantGroups).length > 0 && (
          <div className="space-y-3">
            {Object.entries(variantGroups).map(([name, options]) => (
              <div key={name} className="space-y-1.5">
                <p className="text-sm font-semibold text-foreground">
                  {name}
                  {effectiveVariants[name] && (
                    <span className="ml-2 font-normal text-muted-foreground">
                      : {effectiveVariants[name]}
                    </span>
                  )}
                </p>

                {/* Color swatches */}
                {name.toLowerCase() === 'color' ? (
                  <div className="flex flex-wrap gap-1.5">
                    {options.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => handleVariantSelect(name, opt.value)}
                        className={cn(
                          'flex items-center gap-1.5 rounded-full border-2 px-3 py-1 text-xs transition-all',
                          effectiveVariants[name] === opt.value
                            ? 'border-primary bg-primary/5 font-medium'
                            : 'border-border hover:border-primary/50',
                          opt.stock <= 0 && 'opacity-50 cursor-not-allowed'
                        )}
                        disabled={opt.stock <= 0}
                      >
                        <span
                          className="size-3.5 rounded-full border border-border"
                          style={{ backgroundColor: opt.value.toLowerCase() }}
                        />
                        {opt.value}
                        {effectiveVariants[name] === opt.value && (
                          <Check className="size-3 text-primary" />
                        )}
                      </button>
                    ))}
                  </div>
                ) : (
                  /* Size buttons */
                  <div className="flex flex-wrap gap-1.5">
                    {options.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => handleVariantSelect(name, opt.value)}
                        className={cn(
                          'rounded-md border-2 px-3 py-1.5 text-xs font-medium transition-all min-w-[36px] min-h-[36px]',
                          effectiveVariants[name] === opt.value
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'border-border text-foreground hover:border-primary/50',
                          opt.stock <= 0 && 'opacity-50 cursor-not-allowed line-through'
                        )}
                        disabled={opt.stock <= 0}
                      >
                        {opt.value}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Stock Status */}
        <div>
          {isOutOfStock ? (
            <Badge variant="destructive" className="text-xs">Out of Stock</Badge>
          ) : stock <= (fullProduct?.lowStockThreshold ?? 5) ? (
            <Badge variant="outline" className="text-xs text-amber-600 border-amber-300">
              Only {stock} left!
            </Badge>
          ) : (
            <Badge variant="outline" className="text-xs text-green-600 border-green-300">
              In Stock
            </Badge>
          )}
        </div>

        {/* Quantity Selector */}
        {!isOutOfStock && (
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-foreground">Qty:</span>
            <div className="flex items-center border rounded-lg">
              <button
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= 1}
                className="flex items-center justify-center size-9 text-foreground hover:bg-muted transition-colors disabled:opacity-40"
                aria-label="Decrease quantity"
              >
                <Minus className="size-3.5" />
              </button>
              <span className="flex items-center justify-center size-9 text-sm font-semibold border-x">
                {quantity}
              </span>
              <button
                onClick={() => handleQuantityChange(1)}
                disabled={quantity >= stock}
                className="flex items-center justify-center size-9 text-foreground hover:bg-muted transition-colors disabled:opacity-40"
                aria-label="Increase quantity"
              >
                <Plus className="size-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 mt-1">
          <Button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={cn(
              'flex-1 gap-1.5 h-10 transition-all',
              justAdded && 'bg-green-600 hover:bg-green-600 text-white'
            )}
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
                  <Check className="size-4" />
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
                  <ShoppingCart className="size-4" />
                  Add to Cart
                </motion.span>
              )}
            </AnimatePresence>
          </Button>
          <Button
            onClick={handleBuyNow}
            disabled={isOutOfStock}
            variant="default"
            className="flex-1 h-10"
          >
            Buy Now
          </Button>
        </div>

        {/* Delivery & Return Info */}
        {!isLoading && (
          <div className="space-y-2 pt-1">
            {shippingFree && (
              <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
                <Truck className="size-3.5" />
                <span className="font-medium">Free Delivery</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <RotateCcw className="size-3.5" />
              <span>{returnPolicy || '7 Days'} Return</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Shield className="size-3.5" />
              <span>Genuine Product</span>
            </div>
          </div>
        )}

        {/* View Full Details Link */}
        <Link
          href={`/product/${basicProduct.slug}`}
          onClick={onClose}
          className="flex items-center justify-center gap-1.5 text-sm font-medium text-primary hover:underline pt-1"
        >
          <Eye className="size-4" />
          View Full Details
          <ExternalLink className="size-3" />
        </Link>
      </div>
    </div>
  );
}

// ── Main QuickViewModal Component ────────────────────────────────────────────

export function QuickViewModal({ product, open, onOpenChange }: QuickViewModalProps) {
  const isMobile = useIsMobile();
  const [fullProduct, setFullProduct] = useState<FullProductData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch full product details when modal opens
  useEffect(() => {
    if (!open || !product) {
      setFullProduct(null);
      return;
    }

    let cancelled = false;
    async function fetchFullProduct() {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/products/${product.slug}`);
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) {
          setFullProduct(data.product);
        }
      } catch {
        // silently fail - basic product info is still shown
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchFullProduct();
    return () => {
      cancelled = true;
    };
  }, [open, product?.slug]);

  // Shared content for both Dialog and Drawer
  const content = product ? (
    <QuickViewContent
      key={product.id}
      basicProduct={product}
      fullProduct={fullProduct}
      isLoading={isLoading}
      onClose={() => onOpenChange(false)}
    />
  ) : (
    <QuickViewSkeleton />
  );

  // ── Mobile: Bottom Drawer ───────────────────────────────────────────────
  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[90vh]">
          <div className="overflow-y-auto max-h-[85vh] p-4">
            <DrawerTitle className="sr-only">
              {product ? `Quick View: ${product.name}` : 'Quick View'}
            </DrawerTitle>
            {content}
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  // ── Desktop: Centered Dialog ────────────────────────────────────────────
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-3xl max-h-[90vh] overflow-y-auto backdrop-blur-xl bg-background/95 border-border/50 shadow-2xl"
        showCloseButton
      >
        <DialogTitle className="sr-only">
          {product ? `Quick View: ${product.name}` : 'Quick View'}
        </DialogTitle>
        {content}
      </DialogContent>
    </Dialog>
  );
}
