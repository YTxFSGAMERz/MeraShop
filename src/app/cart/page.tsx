'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ShoppingCart,
  Trash2,
  Heart,
  Minus,
  Plus,
  Tag,
  X,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Loader2,
  Check,
  Bell,
  Calendar,
  PartyPopper,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '@/lib/stores/cart-store';
import { useWishlistStore } from '@/lib/stores/wishlist-store';
import { formatINR, calcDiscountPercent } from '@/lib/constants';
import { notifyCartRemove, notifyCouponApply, notifyCouponInvalid } from '@/lib/notifications';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';

// ── Coupon interface ────────────────────────────────────────────────────────
interface AppliedCoupon {
  code: string;
  discount: number;
  discountType: string;
  discountValue: number;
}

// ── Featured product for empty cart suggestions ─────────────────────────────
interface SuggestedProduct {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  salePrice: number | null;
  primaryImage: string | null;
  brand: { name: string } | null;
  avgRating: number;
}

// ── Constants ───────────────────────────────────────────────────────────────
const FREE_DELIVERY_THRESHOLD = 499;
const DELIVERY_CHARGE = 49;

// ── Confetti Component ──────────────────────────────────────────────────────
function ConfettiBurst({ active }: { active: boolean }) {
  // Generate particles deterministically based on a counter, not in an effect
  const particles = useMemo(() => {
    if (!active) return [];
    return Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: ((i * 37 + 13) % 200) - 100, // deterministic pseudo-random
      color: ['#f97316', '#f59e0b', '#22c55e', '#ef4444', '#ec4899'][i % 5],
      delay: (i * 0.03),
    }));
  }, [active]);

  if (particles.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="confetti-particle"
          style={{
            left: `calc(50% + ${p.x}px)`,
            top: '50%',
            backgroundColor: p.color,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

// ── Animated Price Value Component ──────────────────────────────────────────
function AnimatedPrice({ value }: { value: number }) {
  return (
    <motion.span
      key={value}
      initial={{ scale: 1 }}
      animate={{ scale: [1, 1.06, 1] }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="inline-block"
      style={{ fontVariantNumeric: 'tabular-nums' }}
    >
      {formatINR(value)}
    </motion.span>
  );
}

// ── Coupon Status for input border animation ───────────────────────────────
type CouponStatus = 'idle' | 'loading' | 'success' | 'error';

// ── Estimated delivery date based on product ────────────────────────────────
function getEstimatedDelivery(productId: string): string {
  // Deterministic delivery based on product ID hash (avoids hydration mismatch)
  let hash = 0;
  for (let i = 0; i < productId.length; i++) {
    hash = ((hash << 5) - hash) + productId.charCodeAt(i);
    hash |= 0;
  }
  const days = 3 + (Math.abs(hash) % 5); // 3-7 days, deterministic
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });
}

export default function CartPage() {
  const router = useRouter();
  const { items, removeItem, updateQuantity, getSubtotal, getDiscount, clearCart } =
    useCartStore();
  const { addItem: addToWishlist, items: wishlistItems } = useWishlistStore();

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [couponStatus, setCouponStatus] = useState<CouponStatus>('idle');
  const [suggestedProducts, setSuggestedProducts] = useState<SuggestedProduct[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [priceDropAlerts, setPriceDropAlerts] = useState<Record<string, boolean>>({});

  // Track items for removal animation
  const [removingItemKey, setRemovingItemKey] = useState<string | null>(null);

  // Estimated delivery dates per item
  const [deliveryDates, setDeliveryDates] = useState<Record<string, string>>({});

  useEffect(() => {
    const dates: Record<string, string> = {};
    items.forEach((item) => {
      const key = `${item.productId}-${item.variantId ?? 'no-variant'}`;
      if (!dates[key]) {
        dates[key] = getEstimatedDelivery(item.productId);
      }
    });
    setDeliveryDates(dates);
  }, [items]);

  // Fetch suggested products for empty cart
  useEffect(() => {
    if (items.length > 0) return;
    fetch('/api/products?featured=true&limit=4')
      .then((res) => res.json())
      .then((data) => {
        if (data.products) {
          setSuggestedProducts(
            data.products.map((p: SuggestedProduct) => ({
              id: p.id,
              name: p.name,
              slug: p.slug,
              basePrice: p.basePrice,
              salePrice: p.salePrice,
              primaryImage: p.primaryImage,
              brand: p.brand,
              avgRating: p.avgRating,
            }))
          );
        }
      })
      .catch(() => {});
  }, [items.length]);

  // ── Computed values ─────────────────────────────────────────────────────
  const subtotal = getSubtotal();
  const productDiscount = getDiscount();
  const deliveryCharge = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_CHARGE;
  const couponDiscount = appliedCoupon?.discount ?? 0;
  const totalDiscount = productDiscount + couponDiscount;
  const total = subtotal + deliveryCharge - couponDiscount;
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  // Free delivery progress
  const deliveryProgress = Math.min(100, (subtotal / FREE_DELIVERY_THRESHOLD) * 100);
  const amountForFreeDelivery = Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal);

  // ── Coupon handlers ────────────────────────────────────────────────────
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError('');
    setCouponStatus('loading');

    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode.trim(), cartTotal: subtotal }),
      });
      const data = await res.json();

      if (data.valid) {
        setAppliedCoupon({
          code: couponCode.trim().toUpperCase(),
          discount: data.discount,
          discountType: data.coupon.discountType,
          discountValue: data.coupon.discountValue,
        });
        setCouponCode('');
        setCouponStatus('success');
        notifyCouponApply(couponCode.trim().toUpperCase(), data.discount);
        // Show confetti
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 1500);
        // Reset success status after animation
        setTimeout(() => setCouponStatus('idle'), 1500);
      } else {
        setCouponError(data.message || 'Invalid coupon code');
        setCouponStatus('error');
        notifyCouponInvalid(couponCode.trim().toUpperCase());
        setTimeout(() => setCouponStatus('idle'), 2000);
      }
    } catch {
      setCouponError('Failed to validate coupon. Please try again.');
      setCouponStatus('error');
      setTimeout(() => setCouponStatus('idle'), 2000);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError('');
    setCouponStatus('idle');
  };

  // ── Remove item with animation ─────────────────────────────────────────
  const handleRemoveItem = (productId: string, variantId: string | undefined, name: string) => {
    const key = `${productId}-${variantId ?? 'no-variant'}`;
    setRemovingItemKey(key);
    setTimeout(() => {
      removeItem(productId, variantId);
      notifyCartRemove(name);
      setRemovingItemKey(null);
    }, 300);
  };

  // ── Move to wishlist ───────────────────────────────────────────────────
  const handleMoveToWishlist = (item: (typeof items)[0]) => {
    const alreadyInWishlist = wishlistItems.some((w) => w.productId === item.productId);
    if (!alreadyInWishlist) {
      addToWishlist({
        productId: item.productId,
        name: item.name,
        price: item.price,
        salePrice: item.salePrice,
        image: item.image,
        slug: item.slug,
      });
    }
    const key = `${item.productId}-${item.variantId ?? 'no-variant'}`;
    setRemovingItemKey(key);
    setTimeout(() => {
      removeItem(item.productId, item.variantId);
      notifyCartRemove(item.name);
      setRemovingItemKey(null);
    }, 300);
  };

  // ── Coupon input border class based on status ──────────────────────────
  const getCouponInputClass = () => {
    const base = 'pl-8 uppercase transition-all duration-300';
    switch (couponStatus) {
      case 'loading':
        return `${base} border-amber-400 ring-2 ring-amber-400/20`;
      case 'success':
        return `${base} border-emerald-500 ring-2 ring-emerald-500/20`;
      case 'error':
        return `${base} border-destructive ring-2 ring-destructive/20`;
      default:
        return base;
    }
  };

  // ── Toggle price drop alert ────────────────────────────────────────────
  const togglePriceDropAlert = (itemKey: string) => {
    setPriceDropAlerts((prev) => ({ ...prev, [itemKey]: !prev[itemKey] }));
  };

  // ── Empty cart state ───────────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <div className="container-shop section-padding">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          {/* Animated cart icon with floating animation */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="mb-6"
          >
            <div className="relative">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                className="size-28 md:size-36 rounded-full bg-primary/10 flex items-center justify-center mx-auto"
              >
                <motion.svg
                  width="56"
                  height="56"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-primary md:size-20"
                  animate={{ y: [0, -2, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <circle cx="8" cy="21" r="1" />
                  <circle cx="19" cy="21" r="1" />
                  <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                </motion.svg>
              </motion.div>
              {/* Decorative dots with staggered float */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1, y: [0, -4, 0] }}
                transition={{ delay: 0.3, type: 'spring', y: { duration: 2, repeat: Infinity, ease: 'easeInOut' } }}
                className="absolute -top-1 -right-1 size-5 rounded-full bg-amber-400"
              />
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1, y: [0, -6, 0] }}
                transition={{ delay: 0.5, type: 'spring', y: { duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 } }}
                className="absolute -bottom-2 -left-2 size-3 rounded-full bg-primary/40"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="mb-2 text-2xl md:text-3xl font-bold text-foreground">
              Your cart is empty
            </h1>
            <p className="mb-8 max-w-md text-muted-foreground">
              Looks like you haven&apos;t added anything yet. Explore our amazing deals
              and find something you love!
            </p>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Button size="lg" asChild className="gap-2">
              <Link href="/">
                <ShoppingBag className="size-5" />
                Continue Shopping
              </Link>
            </Button>
          </motion.div>

          {/* Suggested Products */}
          {suggestedProducts.length > 0 && (
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-12 w-full"
            >
              <h2 className="text-lg font-semibold text-foreground mb-4">
                You might like these
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {suggestedProducts.map((product) => {
                  const discount = product.salePrice
                    ? calcDiscountPercent(product.basePrice, product.salePrice)
                    : 0;
                  const effectivePrice = product.salePrice ?? product.basePrice;

                  return (
                    <Link
                      key={product.id}
                      href={`/product/${product.slug}`}
                      className="group rounded-lg border bg-background p-3 text-left transition-all hover:shadow-md hover:border-primary/30"
                    >
                      <div className="relative aspect-square rounded-md overflow-hidden bg-muted mb-2">
                        {product.primaryImage ? (
                          <Image
                            src={product.primaryImage}
                            alt={product.name}
                            fill
                            className="object-cover transition-transform group-hover:scale-105"
                            sizes="(max-width: 768px) 50vw, 25vw"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <ShoppingBag className="size-8 text-muted-foreground/30" />
                          </div>
                        )}
                        {discount > 0 && (
                          <Badge className="absolute left-1.5 top-1.5 bg-emerald-600 px-1 py-0 text-[10px]">
                            {discount}% off
                          </Badge>
                        )}
                      </div>
                      {product.brand && (
                        <p className="text-[10px] text-primary font-medium truncate">
                          {product.brand.name}
                        </p>
                      )}
                      <p className="text-xs font-medium text-foreground line-clamp-2 mt-0.5">
                        {product.name}
                      </p>
                      <div className="flex items-baseline gap-1.5 mt-1">
                        <span className="text-sm font-bold text-price">
                          {formatINR(effectivePrice)}
                        </span>
                        {product.salePrice && product.salePrice < product.basePrice && (
                          <span className="text-[10px] text-muted-foreground line-through">
                            {formatINR(product.basePrice)}
                          </span>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    );
  }

  // ── Cart page ──────────────────────────────────────────────────────────
  return (
    <div className="container-shop section-padding">
      {/* Page header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-foreground">Shopping Cart</h1>
          <Badge variant="secondary" className="text-sm">
            {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground"
          onClick={() => clearCart()}
        >
          <Trash2 className="mr-1.5 size-4" />
          Clear Cart
        </Button>
      </div>

      {/* Free Delivery Progress Bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 rounded-lg border bg-card p-4"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Truck className="size-4 text-primary shrink-0" />
            {amountForFreeDelivery > 0 ? (
              <span className="text-sm font-medium text-foreground">
                You&apos;re <span className="text-primary font-bold">{formatINR(amountForFreeDelivery)}</span> away from free delivery!
              </span>
            ) : (
              <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <PartyPopper className="size-4" />
                You&apos;ve unlocked FREE delivery! 🎉
              </span>
            )}
          </div>
          {amountForFreeDelivery > 0 && (
            <span className="text-xs text-muted-foreground">{formatINR(subtotal)} / {formatINR(FREE_DELIVERY_THRESHOLD)}</span>
          )}
        </div>
        <div className="free-delivery-progress">
          <motion.div
            className="free-delivery-progress-fill"
            initial={{ width: 0 }}
            animate={{ width: `${deliveryProgress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </motion.div>

      {/* Savings banner */}
      {totalDiscount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300"
        >
          <Tag className="size-4" />
          You save {formatINR(totalDiscount)} on this order!
        </motion.div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* ── Cart Items ───────────────────────────────────────────────── */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-0">
              {/* Desktop header */}
              <div className="hidden border-b bg-muted/50 px-6 py-3 text-sm font-medium text-muted-foreground md:grid md:grid-cols-[1fr_120px_100px_80px] md:gap-4">
                <span>Product</span>
                <span className="text-center">Quantity</span>
                <span className="text-right">Price</span>
                <span className="text-right">Action</span>
              </div>

              <div className="divide-y">
                <AnimatePresence mode="popLayout">
                  {items.map((item) => {
                    const effectivePrice = item.salePrice ?? item.price;
                    const itemTotal = effectivePrice * item.quantity;
                    const discount = calcDiscountPercent(item.price, item.salePrice);
                    const itemKey = `${item.productId}-${item.variantId ?? 'no-variant'}`;
                    const isRemoving = removingItemKey === itemKey;
                    const hasPriceDropAlert = priceDropAlerts[itemKey] ?? false;
                    const estimatedDelivery = deliveryDates[itemKey];

                    return (
                      <motion.div
                        key={itemKey}
                        layout
                        initial={{ opacity: 0, x: 0 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -100, height: 0, marginBottom: 0, paddingTop: 0, paddingBottom: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <div
                          className={isRemoving ? 'opacity-50' : ''}
                        >
                          <div className="flex gap-4 p-4 md:grid md:grid-cols-[1fr_120px_100px_80px] md:items-center md:gap-4 md:px-6">
                            {/* Product info */}
                            <div className="flex gap-4">
                              <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                                <Image
                                  src={item.image}
                                  alt={item.name}
                                  fill
                                  className="object-cover"
                                  sizes="80px"
                                />
                                {discount > 0 && (
                                  <Badge className="absolute left-1 top-1 bg-emerald-600 px-1 py-0 text-[10px]">
                                    {discount}%
                                  </Badge>
                                )}
                              </div>
                              <div className="flex min-w-0 flex-col justify-center">
                                <Link
                                  href={`/product/${item.slug}`}
                                  className="line-clamp-2 text-sm font-medium text-foreground transition-colors hover:text-primary"
                                >
                                  {item.name}
                                </Link>
                                {item.variantName && (
                                  <p className="mt-0.5 text-xs text-muted-foreground">
                                    {item.variantName}
                                  </p>
                                )}
                                <div className="mt-1 flex items-baseline gap-2 md:hidden">
                                  <span className="text-sm font-bold text-price">
                                    {formatINR(effectivePrice)}
                                  </span>
                                  {item.salePrice && item.salePrice < item.price && (
                                    <span className="text-xs text-muted-foreground line-through">
                                      {formatINR(item.price)}
                                    </span>
                                  )}
                                </div>
                                {/* Price drop alert toggle */}
                                <div className="flex items-center gap-2 mt-1">
                                  <div className="flex items-center gap-1.5">
                                    <Switch
                                      checked={hasPriceDropAlert}
                                      onCheckedChange={() => togglePriceDropAlert(itemKey)}
                                      className="scale-75"
                                      aria-label="Price drop alert"
                                    />
                                    <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                                      <Bell className="size-2.5" />
                                      Price alert
                                    </span>
                                  </div>
                                </div>
                                {/* Estimated delivery date */}
                                <div className="flex items-center gap-1 mt-1">
                                  <Calendar className="size-2.5 text-muted-foreground" />
                                  <span className="text-[10px] text-muted-foreground">
                                    Delivery by {estimatedDelivery}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Quantity selector */}
                            <div className="flex items-center justify-start md:justify-center">
                              <div className="flex items-center rounded-lg border">
                                <button
                                  className="flex h-8 w-8 items-center justify-center text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40"
                                  onClick={() =>
                                    updateQuantity(item.productId, item.quantity - 1, item.variantId)
                                  }
                                  disabled={item.quantity <= 1}
                                  aria-label="Decrease quantity"
                                >
                                  <Minus className="size-3.5" />
                                </button>
                                <span className="flex h-8 w-8 items-center justify-center text-sm font-semibold">
                                  {item.quantity}
                                </span>
                                <button
                                  className="flex h-8 w-8 items-center justify-center text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40"
                                  onClick={() =>
                                    updateQuantity(item.productId, item.quantity + 1, item.variantId)
                                  }
                                  disabled={item.quantity >= 10}
                                  aria-label="Increase quantity"
                                >
                                  <Plus className="size-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Price (desktop) */}
                            <div className="hidden flex-col items-end md:flex">
                              <span className="font-bold text-price">{formatINR(itemTotal)}</span>
                              {item.salePrice && item.salePrice < item.price && (
                                <span className="text-xs text-muted-foreground line-through">
                                  {formatINR(item.price * item.quantity)}
                                </span>
                              )}
                            </div>

                            {/* Actions (desktop) */}
                            <div className="hidden items-center justify-end gap-1 md:flex">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-rose-500"
                                onClick={() => handleRemoveItem(item.productId, item.variantId, item.name)}
                                aria-label="Remove from cart"
                              >
                                <Trash2 className="size-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-rose-500"
                                onClick={() => handleMoveToWishlist(item)}
                                aria-label="Move to wishlist"
                              >
                                <Heart className="size-4" />
                              </Button>
                            </div>

                            {/* Mobile actions row */}
                            <div className="flex w-full items-center justify-between md:hidden">
                              <span className="text-sm font-bold text-price">
                                {formatINR(itemTotal)}
                              </span>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 gap-1 text-xs text-muted-foreground hover:text-rose-500"
                                  onClick={() => handleMoveToWishlist(item)}
                                >
                                  <Heart className="size-3.5" />
                                  Wishlist
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 gap-1 text-xs text-muted-foreground hover:text-rose-500"
                                  onClick={() => handleRemoveItem(item.productId, item.variantId, item.name)}
                                >
                                  <Trash2 className="size-3.5" />
                                  Remove
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>

          {/* Protected items info */}
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-amber-50 px-4 py-2.5 text-xs text-amber-700 dark:bg-amber-950/30 dark:text-amber-300">
            <ShieldCheck className="size-4 flex-shrink-0" />
            <span>
              All items in your cart are protected by MeraShop&apos;s buyer assurance. Easy returns
              within 7-15 days.
            </span>
          </div>
        </div>

        {/* ── Price Summary ──────────────────────────────────────────────── */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Price Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Price ({itemCount} {itemCount === 1 ? 'item' : 'items'})
                </span>
                <AnimatedPrice value={subtotal + productDiscount} />
              </div>

              {productDiscount > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex justify-between text-sm"
                >
                  <span className="text-emerald-600 dark:text-emerald-400">Discount</span>
                  <span className="text-emerald-600 dark:text-emerald-400">
                    −<AnimatedPrice value={productDiscount} />
                  </span>
                </motion.div>
              )}

              {couponDiscount > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex justify-between text-sm"
                >
                  <span className="text-emerald-600 dark:text-emerald-400">
                    Coupon ({appliedCoupon?.code})
                  </span>
                  <span className="text-emerald-600 dark:text-emerald-400">
                    −<AnimatedPrice value={couponDiscount} />
                  </span>
                </motion.div>
              )}

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Delivery</span>
                {deliveryCharge === 0 ? (
                  <span className="font-medium text-emerald-600 dark:text-emerald-400">FREE</span>
                ) : (
                  <AnimatedPrice value={deliveryCharge} />
                )}
              </div>

              <Separator />

              <div className="flex justify-between font-bold text-base">
                <span>Total</span>
                <span className="text-price">
                  <AnimatedPrice value={total} />
                </span>
              </div>

              {totalDiscount > 0 && (
                <motion.p
                  key={totalDiscount}
                  initial={{ scale: 1 }}
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 0.3 }}
                  className="text-xs font-medium text-emerald-600 dark:text-emerald-400"
                >
                  You will save {formatINR(totalDiscount)} on this order
                </motion.p>
              )}
            </CardContent>

            <Separator />

            {/* Coupon section */}
            <CardContent className="pt-4">
              {appliedCoupon ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 dark:border-emerald-800 dark:bg-emerald-950/30 relative overflow-hidden"
                >
                  <ConfettiBurst active={showConfetti} />
                  <div className="flex items-center gap-2">
                    <Tag className="size-4 text-emerald-600 dark:text-emerald-400" />
                    <div>
                      <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                        {appliedCoupon.code}
                      </p>
                      <p className="text-xs text-emerald-600 dark:text-emerald-400">
                        You save {formatINR(appliedCoupon.discount)}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-emerald-600 hover:text-rose-500 dark:text-emerald-400"
                    onClick={handleRemoveCoupon}
                    aria-label="Remove coupon"
                  >
                    <X className="size-4" />
                  </Button>
                </motion.div>
              ) : (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Enter coupon code"
                        value={couponCode}
                        onChange={(e) => {
                          setCouponCode(e.target.value.toUpperCase());
                          if (couponStatus !== 'loading') {
                            setCouponError('');
                            setCouponStatus('idle');
                          }
                        }}
                        className={getCouponInputClass()}
                        onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                      />
                      {/* Success checkmark overlay */}
                      <AnimatePresence>
                        {couponStatus === 'success' && (
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 size-5 rounded-full bg-emerald-500 flex items-center justify-center"
                          >
                            <Check className="size-3 text-white" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleApplyCoupon}
                      disabled={couponLoading || !couponCode.trim()}
                      className="h-9 min-w-[68px]"
                    >
                      {couponLoading ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        'Apply'
                      )}
                    </Button>
                  </div>
                  <AnimatePresence>
                    {couponError && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-xs text-destructive overflow-hidden"
                      >
                        {couponError}
                      </motion.p>
                    )}
                  </AnimatePresence>
                  <p className="text-xs text-muted-foreground">
                    Try: WELCOME10, SUMMER20, FLAT500
                  </p>
                </div>
              )}
            </CardContent>

            <CardFooter className="flex flex-col gap-3 pt-0">
              <Button
                className="w-full gap-2 text-base"
                size="lg"
                onClick={() => router.push('/checkout')}
              >
                Proceed to Checkout
                <ArrowRight className="size-4" />
              </Button>
              <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Truck className="size-3.5" />
                  Free Delivery
                </span>
                <span className="flex items-center gap-1">
                  <RotateCcw className="size-3.5" />
                  Easy Returns
                </span>
                <span className="flex items-center gap-1">
                  <ShieldCheck className="size-3.5" />
                  Secure
                </span>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
