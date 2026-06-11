'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { addDays, format } from 'date-fns';
import {
  Heart,
  ShoppingCart,
  Minus,
  Plus,
  Truck,
  RotateCcw,
  Shield,
  ChevronDown,
  ChevronUp,
  Star,
  Check,
  Package,
  Eye,
  Calendar,
  Lock,
  BadgeCheck,
  Store,
  Zap,
  PackageOpen,
  Users,
  Bell,
  Gift,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

import { cn } from '@/lib/utils';
import { formatINR, calcDiscountPercent } from '@/lib/constants';
import { useCartStore } from '@/lib/stores/cart-store';
import { useWishlistStore } from '@/lib/stores/wishlist-store';
import { useRecentlyViewedStore } from '@/lib/stores/recently-viewed-store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from '@/components/ui/carousel';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { BreadcrumbNav, type BreadcrumbItemData } from '@/components/layout/Breadcrumb';
import {
  RatingStars,
  PriceDisplay,
  ProductGrid,
  EmptyState,
  ProductGridSkeleton,
  ProductDetailSkeleton,
} from '@/components/shop';
import { ImageZoom } from '@/components/shop/ImageZoom';
import { PincodeChecker } from '@/components/shop/PincodeChecker';
import { RecentlyViewed } from '@/components/shop/RecentlyViewed';
import { ReviewForm } from '@/components/shop/ReviewForm';
import { ShareButton } from '@/components/shop/ShareButton';
import { AlsoBought } from '@/components/shop/AlsoBought';
import { StockAlert } from '@/components/shop/StockAlert';
import { ProductQA } from '@/components/shop/ProductQA';
import { SizeGuide } from '@/components/shop/SizeGuide';
import { ReviewsSummary } from '@/components/shop/ReviewsSummary';
import type { ProductCardProduct } from '@/components/shop/ProductCard';

// ── Types ────────────────────────────────────────────────────────────────────

interface ProductImage {
  id: string;
  url: string;
  altText: string | null;
  isPrimary: boolean;
  sortOrder: number;
}

interface ProductVariant {
  id: string;
  name: string;
  value: string;
  price: number | null;
  stock: number;
}

interface Review {
  id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  createdAt: string;
  user: { id: string; name: string | null; avatar: string | null };
}

interface ProductData {
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
  category: {
    id: string;
    name: string;
    slug: string;
    parentId: string | null;
    parent: { id: string; name: string; slug: string } | null;
  };
  brand: {
    id: string;
    name: string;
    slug: string;
    logo: string | null;
    description: string | null;
  } | null;
  images: ProductImage[];
  variants: ProductVariant[];
  variantGroups: Record<string, Array<{ id: string; value: string; price: number | null; stock: number }>>;
  reviews: Review[];
  reviewDistribution: Record<number, number>;
  avgRating: number;
  reviewCount: number;
  totalSold: number;
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestseller: boolean;
  stock: number;
  lowStockThreshold: number;
  shippingFree: boolean;
  returnPolicy: string | null;
  tags: string[];
  specifications: Record<string, string> | null;
  sku: string | null;
  weight: number | null;
  dimensions: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  createdAt: string;
  updatedAt: string;
}

// ── Indian cities for recently purchased notifications ────────────────────────
const INDIAN_CITIES = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai',
  'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow',
  'Chandigarh', 'Indore', 'Nagpur', 'Kochi', 'Surat',
  'Bhopal', 'Visakhapatnam', 'Guwahati', 'Thiruvananthapuram', 'Coimbatore',
];

// Categories that get installation/demo badge
const INSTALLATION_CATEGORIES = ['electronics', 'appliances', 'televisions', 'laptops', 'washing-machines', 'air-conditioners', 'refrigerators'];

// ── Deterministic fake data helpers ──────────────────────────────────────────

function getViewingCount(productId: string): number {
  const hash = productId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return (hash % 41) + 5; // Range 5-45
}

function getCityFromIndex(index: number): string {
  return INDIAN_CITIES[index % INDIAN_CITIES.length];
}

// ── Recently Purchased Notification Component ──────────────────────────────

function RecentlyPurchasedNotification({ productId }: { productId: string }) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Generate deterministic city sequence based on product ID
  const cities = useMemo(() => {
    const hash = productId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const result: string[] = [];
    for (let i = 0; i < 10; i++) {
      result.push(getCityFromIndex(hash + i * 3));
    }
    return result;
  }, [productId]);

  useEffect(() => {
    // Show first notification after 3 seconds
    const initialTimeout = setTimeout(() => {
      setIsVisible(true);
    }, 3000);

    return () => clearTimeout(initialTimeout);
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    // Hide after 4 seconds
    const hideTimeout = setTimeout(() => {
      setIsVisible(false);
    }, 4000);

    return () => clearTimeout(hideTimeout);
  }, [isVisible, currentIndex]);

  // Auto-rotate every 8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % cities.length);
      setIsVisible(true);
    }, 8000);

    return () => clearInterval(interval);
  }, [cities.length]);

  const city = cities[currentIndex];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20, x: 0 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-16 left-3 right-3 md:bottom-6 md:left-auto md:right-6 md:w-80 z-[60] pointer-events-none"
        >
          <div className="flex items-center gap-2.5 p-3 rounded-lg glass shadow-lg border border-border/50">
            <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <ShoppingCart className="size-4 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-foreground truncate">
                Someone in {city} just bought this
              </p>
              <p className="text-[10px] text-muted-foreground">Recently purchased</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Animated Tab Content Wrapper ──────────────────────────────────────────────
function AnimatedTabContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── Page Component ───────────────────────────────────────────────────────────

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [product, setProduct] = useState<ProductData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<ProductCardProduct[]>([]);

  // Selection state
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRefreshKey, setReviewRefreshKey] = useState(0);

  // Stores
  const addItem = useCartStore((s) => s.addItem);
  const isInWishlist = useWishlistStore((s) => s.isInWishlist);
  const addItemToWishlist = useWishlistStore((s) => s.addItem);
  const removeItemFromWishlist = useWishlistStore((s) => s.removeItem);
  const addViewedProduct = useRecentlyViewedStore((s) => s.addViewedProduct);

  // ── Fetch product data ───────────────────────────────────────────────────
  useEffect(() => {
    async function fetchProduct() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/products/${slug}`);
        if (!res.ok) {
          if (res.status === 404) {
            setError('Product not found');
          } else {
            setError('Failed to load product');
          }
          return;
        }
        const data = await res.json();
        setProduct(data.product);

        // Add to recently viewed
        addViewedProduct(data.product.id, {
          id: data.product.id,
          name: data.product.name,
          slug: data.product.slug,
          basePrice: data.product.basePrice,
          salePrice: data.product.salePrice,
          image: data.product.primaryImage ?? '',
          brand: data.product.brand?.name,
        });

        // Set default variant selections
        if (data.product.variantGroups) {
          const defaults: Record<string, string> = {};
          for (const [name, options] of Object.entries(data.product.variantGroups)) {
            if (options.length > 0) {
              defaults[name] = options[0].value;
            }
          }
          setSelectedVariants(defaults);
        }
      } catch {
        setError('Failed to load product');
      } finally {
        setIsLoading(false);
      }
    }
    fetchProduct();
  }, [slug]);

  // ── Fetch related products ───────────────────────────────────────────────
  useEffect(() => {
    if (!product) return;
    async function fetchRelated() {
      try {
        const res = await fetch(`/api/products?category=${product.category.slug}&limit=8`);
        if (res.ok) {
          const data = await res.json();
          const related = data.products
            .filter((p: { id: string }) => p.id !== product.id)
            .slice(0, 4)
            .map((p: {
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
            }) => ({
              id: p.id,
              name: p.name,
              slug: p.slug,
              basePrice: p.basePrice,
              salePrice: p.salePrice ?? undefined,
              images: p.primaryImage ? [{ url: p.primaryImage, isPrimary: true }] : [],
              avgRating: p.avgRating,
              reviewCount: p.reviewCount,
              brand: p.brand ? { name: p.brand.name } : undefined,
              stock: p.stock,
              isNewArrival: p.isNewArrival,
              isBestseller: p.isBestseller,
              totalSold: p.totalSold,
            }));
          setRelatedProducts(related);
        }
      } catch {
        // silently fail
      }
    }
    fetchRelated();
  }, [product]);

  // ── Derived state ────────────────────────────────────────────────────────
  const wishlisted = product ? isInWishlist(product.id) : false;
  const isOutOfStock = product ? product.stock <= 0 : false;
  const isLowStock = product ? product.stock > 0 && product.stock <= product.lowStockThreshold : false;

  // Deterministic viewing count
  const viewingCount = product ? getViewingCount(product.id) : 0;

  // Check if category qualifies for installation/demo
  const hasInstallation = product ? INSTALLATION_CATEGORIES.some(cat =>
    product.category.slug.includes(cat) || product.category.name.toLowerCase().includes(cat)
  ) : false;

  // Get current variant price override
  const getVariantPrice = useCallback((): number | null => {
    if (!product) return null;
    for (const [name, value] of Object.entries(selectedVariants)) {
      const group = product.variantGroups[name];
      if (group) {
        const variant = group.find((v) => v.value === value);
        if (variant?.price !== null && variant?.price !== undefined) {
          return variant.price;
        }
      }
    }
    return null;
  }, [product, selectedVariants]);

  const variantPrice = getVariantPrice();
  const displayPrice = variantPrice ?? product?.effectivePrice ?? 0;
  const displayBasePrice = variantPrice ? variantPrice : (product?.salePrice ? product.basePrice : product?.basePrice ?? 0);

  // Delivery estimate dates (range) - computed in useEffect to avoid hydration mismatch
  const [deliveryDateStartStr, setDeliveryDateStartStr] = useState('');
  const [deliveryDateEndStr, setDeliveryDateEndStr] = useState('');
  const [standardDeliveryStr, setStandardDeliveryStr] = useState('');

  useEffect(() => {
    setDeliveryDateStartStr(format(addDays(new Date(), 3), "EEE, d MMM"));
    setDeliveryDateEndStr(format(addDays(new Date(), 7), "d MMM"));
    setStandardDeliveryStr(format(addDays(new Date(), 5), "EEE, d MMM"));
  }, []);

  // Breadcrumb items
  const breadcrumbItems: BreadcrumbItemData[] = [
    { label: 'Home', href: '/' },
    { label: 'Shop', href: '/shop' },
  ];
  if (product) {
    if (product.category.parent) {
      breadcrumbItems.push({
        label: product.category.parent.name,
        href: `/category/${product.category.parent.slug}`,
      });
    }
    breadcrumbItems.push({
      label: product.category.name,
      href: `/category/${product.category.slug}`,
    });
    breadcrumbItems.push({ label: product.name });
  }

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleWishlistToggle = () => {
    if (!product) return;
    if (wishlisted) {
      removeItemFromWishlist(product.id);
      toast.success('Removed from wishlist');
    } else {
      addItemToWishlist({
        productId: product.id,
        name: product.name,
        price: product.basePrice,
        salePrice: product.salePrice ?? undefined,
        image: product.primaryImage ?? '',
        slug: product.slug,
      });
      toast.success('Added to wishlist');
    }
  };

  const handleAddToCart = () => {
    if (!product || isOutOfStock) return;
    const variantId = Object.entries(selectedVariants)
      .map(([name, value]) => {
        const group = product.variantGroups[name];
        return group?.find((v) => v.value === value)?.id;
      })
      .filter(Boolean)[0];

    const variantName = Object.entries(selectedVariants)
      .map(([name, value]) => `${name}: ${value}`)
      .join(', ');

    addItem(
      {
        productId: product.id,
        name: product.name,
        slug: product.slug,
        price: product.basePrice,
        salePrice: product.salePrice ?? undefined,
        image: product.primaryImage ?? '',
        variantId,
        variantName: variantName || undefined,
      },
      quantity
    );
    toast.success('Added to cart', {
      description: `${product.name} × ${quantity}`,
    });
  };

  const handleBuyNow = () => {
    handleAddToCart();
    // Navigate to cart page
    window.location.href = '/cart';
  };

  const handleVariantSelect = (name: string, value: string) => {
    setSelectedVariants((prev) => ({ ...prev, [name]: value }));
    setQuantity(1);
  };

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => Math.max(1, Math.min(prev + delta, product?.stock ?? 99)));
  };

  // ── Loading state ────────────────────────────────────────────────────────
  if (isLoading) {
    return <ProductDetailSkeleton />;
  }

  // ── Error state ──────────────────────────────────────────────────────────
  if (error || !product) {
    return (
      <div className="container-shop px-4 md:px-6 lg:px-8 py-12">
        <EmptyState
          icon={Package}
          title={error || 'Product not found'}
          description="The product you're looking for might have been removed or is temporarily unavailable."
          actionLabel="Browse Products"
          onAction={() => { window.location.href = '/shop'; }}
        />
      </div>
    );
  }

  // ── Main render ──────────────────────────────────────────────────────────
  return (
    <>
      {/* JSON-LD Product Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: product.name,
            description: product.shortDescription || product.description || '',
            image: product.images.map((img) => img.url),
            brand: product.brand
              ? { '@type': 'Brand', name: product.brand.name }
              : undefined,
            offers: {
              '@type': 'Offer',
              url: `https://merashop.in/product/${product.slug}`,
              priceCurrency: 'INR',
              price: displayPrice,
              availability: isOutOfStock
                ? 'https://schema.org/OutOfStock'
                : 'https://schema.org/InStock',
            },
            aggregateRating:
              product.reviewCount > 0
                ? {
                    '@type': 'AggregateRating',
                    ratingValue: product.avgRating,
                    reviewCount: product.reviewCount,
                  }
                : undefined,
          }),
        }}
      />

      {/* Recently Purchased Notification */}
      <RecentlyPurchasedNotification productId={product.id} />

      <div className="min-h-screen pb-20 md:pb-0">
        {/* Breadcrumb with microdata */}
        <div className="border-b bg-muted/30">
          <div className="container-shop px-4 md:px-6 lg:px-8 py-3">
            <BreadcrumbNav items={breadcrumbItems} />
            {/* BreadcrumbList microdata for SEO */}
            <ol className="sr-only" itemScope itemType="https://schema.org/BreadcrumbList">
              {breadcrumbItems.map((item, idx) => (
                <li key={idx} itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
                  {item.href ? (
                    <a itemProp="item" href={item.href}>
                      <span itemProp="name">{item.label}</span>
                    </a>
                  ) : (
                    <span itemProp="name">{item.label}</span>
                  )}
                  <meta itemProp="position" content={String(idx + 1)} />
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Main Product Section */}
        <div className="container-shop px-4 md:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
            {/* ── Left: Image Gallery ──────────────────────────────────────── */}
            <div className="space-y-4">
              {/* Main Image with Zoom */}
              {product.images.length > 0 ? (
                <div className="relative">
                  {/* Use carousel for multiple images, ImageZoom for the current one */}
                  <Carousel
                    opts={{ loop: true }}
                    setApi={(api) => {
                      if (api) {
                        api.on('select', () => {
                          setSelectedImageIndex(api.selectedScrollSnap());
                        });
                      }
                    }}
                  >
                    <CarouselContent className="transition-opacity duration-300">
                      {product.images.map((img) => (
                        <CarouselItem key={img.id}>
                          <ImageZoom
                            src={img.url}
                            alt={img.altText || product.name}
                          />
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    {product.images.length > 1 && (
                      <>
                        <CarouselPrevious className="left-2 z-20" />
                        <CarouselNext className="right-2 z-20" />
                      </>
                    )}
                  </Carousel>

                  {/* Discount Badge */}
                  {product.discountPercent > 0 && (
                    <span className="absolute top-3 left-3 discount-badge z-10">
                      {product.discountPercent}% off
                    </span>
                  )}

                  {/* Status Badges */}
                  <div className="absolute top-3 right-3 flex flex-col gap-1 z-10">
                    {product.isNewArrival && (
                      <Badge className="text-[10px] px-2">New</Badge>
                    )}
                    {product.isBestseller && (
                      <Badge variant="secondary" className="text-[10px] px-2">
                        Bestseller
                      </Badge>
                    )}
                  </div>
                </div>
              ) : (
                <div className="relative aspect-square rounded-xl overflow-hidden bg-muted border border-border/50 flex items-center justify-center">
                  <Package className="size-16 text-muted-foreground/30" />
                </div>
              )}

              {/* Thumbnail Strip */}
              {product.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                  {product.images.map((img, index) => (
                    <button
                      key={img.id}
                      onClick={() => setSelectedImageIndex(index)}
                      className={cn(
                        'relative size-16 md:size-20 rounded-lg overflow-hidden border-2 transition-all shrink-0',
                        selectedImageIndex === index
                          ? 'border-primary ring-1 ring-primary/30'
                          : 'border-border hover:border-primary/50'
                      )}
                    >
                      <Image
                        src={img.url}
                        alt={img.altText || `Thumbnail ${index + 1}`}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── Right: Product Details ───────────────────────────────────── */}
            <div className="space-y-4 lg:sticky lg:top-20 lg:self-start">
              {/* Brand */}
              {product.brand && (
                <Link
                  href={`/shop?brand=${product.brand.slug}`}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  {product.brand.name}
                </Link>
              )}

              {/* Title */}
              <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-foreground leading-tight">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-2 flex-wrap">
                <RatingStars rating={product.avgRating} reviewCount={product.reviewCount} size="md" />
                {product.totalSold > 0 && (
                  <span className="text-sm text-muted-foreground">
                    · {product.totalSold.toLocaleString('en-IN')} sold
                  </span>
                )}
              </div>

              {/* Price Section */}
              <div className="space-y-1">
                <PriceDisplay
                  price={displayBasePrice}
                  salePrice={variantPrice ?? (product.salePrice ?? undefined)}
                  size="lg"
                />
                <div className="flex items-center gap-2">
                  <p className="text-xs text-muted-foreground">Inclusive of all taxes</p>
                  {/* Animated You Saved badge */}
                  {product.discountPercent > 0 && product.salePrice && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.5 }}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-white shadow-sm bg-stock-green"
                    >
                      <Sparkles className="size-2.5" />
                      You saved {formatINR(product.basePrice - product.salePrice)}!
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Live Stock Indicator (urgency) */}
              {isLowStock && !isOutOfStock && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 font-medium"
                >
                  <span className="relative flex size-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex rounded-full size-2 bg-red-500" />
                  </span>
                  Only {product.stock} left in stock — order soon!
                </motion.div>
              )}

              {/* People Viewing Count */}
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Eye className="size-3.5" />
                <span>{viewingCount} people are viewing this</span>
              </div>

              {/* Free Delivery Badge */}
              {product.shippingFree && (
                <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                  <Truck className="size-4" />
                  <span className="font-medium">Free Delivery</span>
                </div>
              )}

              {/* Pincode Checker */}
              <PincodeChecker isFreeDelivery={product.shippingFree} />

              <Separator />

              {/* Variant Selectors */}
              {Object.entries(product.variantGroups).map(([name, options]) => (
                <div key={name} className="space-y-2">
                  <p className="text-sm font-semibold text-foreground">
                    {name}
                    {selectedVariants[name] && (
                      <span className="ml-2 font-normal text-muted-foreground">
                        : {selectedVariants[name]}
                      </span>
                    )}
                  </p>

                  {/* Size Guide button for size-related variants */}
                  {name.toLowerCase().includes('size') && (
                    <div className="flex items-center gap-2">
                      <SizeGuide />
                    </div>
                  )}

                  {/* Color swatches for "Color" variant */}
                  {name.toLowerCase() === 'color' ? (
                    <div className="flex flex-wrap gap-2">
                      {options.map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => handleVariantSelect(name, opt.value)}
                          className={cn(
                            'relative flex items-center gap-2 rounded-full border-2 px-4 py-1.5 text-sm transition-all',
                            selectedVariants[name] === opt.value
                              ? 'border-primary bg-primary/5 font-medium'
                              : 'border-border hover:border-primary/50',
                            opt.stock <= 0 && 'opacity-50 cursor-not-allowed'
                          )}
                          disabled={opt.stock <= 0}
                        >
                          <span
                            className="size-4 rounded-full border border-border"
                            style={{ backgroundColor: opt.value.toLowerCase() }}
                          />
                          {opt.value}
                          {selectedVariants[name] === opt.value && (
                            <Check className="size-3.5 text-primary" />
                          )}
                        </button>
                      ))}
                    </div>
                  ) : (
                    /* Size buttons for other variants */
                    <div className="flex flex-wrap gap-2">
                      {options.map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => handleVariantSelect(name, opt.value)}
                          className={cn(
                            'rounded-md border-2 px-4 py-2 text-sm font-medium transition-all min-w-[44px] min-h-[44px]',
                            selectedVariants[name] === opt.value
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

              {/* Stock Status / Stock Alert */}
              <div>
                {isOutOfStock ? (
                  <StockAlert productId={product.id} productName={product.name} />
                ) : isLowStock ? (
                  <Badge variant="outline" className="text-sm text-amber-600 border-amber-300">
                    Only {product.stock} left in stock!
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-sm text-green-600 border-green-300">
                    In Stock
                  </Badge>
                )}
              </div>

              {/* Quantity Selector */}
              {!isOutOfStock && (
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-foreground">Quantity:</span>
                  <div className="flex items-center border rounded-lg">
                    <button
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                      className="flex items-center justify-center size-10 text-foreground hover:bg-muted transition-colors disabled:opacity-40"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="size-4" />
                    </button>
                    <span className="flex items-center justify-center size-10 text-sm font-semibold border-x">
                      {quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(1)}
                      disabled={quantity >= product.stock}
                      className="flex items-center justify-center size-10 text-foreground hover:bg-muted transition-colors disabled:opacity-40"
                      aria-label="Increase quantity"
                    >
                      <Plus className="size-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Action Buttons - Desktop with gradient */}
              <div className="hidden md:flex gap-3">
                <Button
                  size="lg"
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className="flex-1 gap-2 h-12 text-white border-0 shadow-sm hover:shadow-md transition-all bg-saffron-gradient"
                >
                  <ShoppingCart className="size-5" />
                  Add to Cart
                </Button>
                <Button
                  size="lg"
                  onClick={handleBuyNow}
                  disabled={isOutOfStock}
                  className="flex-1 h-12 text-white border-0 shadow-sm hover:shadow-md transition-all bg-saffron-dark-gradient"
                >
                  Buy Now
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={handleWishlistToggle}
                  className="size-12 p-0 shrink-0"
                  aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  <Heart
                    className={cn(
                      'size-5',
                      wishlisted ? 'fill-destructive text-destructive' : ''
                    )}
                  />
                </Button>
                <ShareButton productName={product.name} slug={product.slug} />
              </div>

              <Separator />

              {/* ── Enhanced Delivery Information ────────────────────────────── */}
              <div className="space-y-3">
                {/* Express Delivery */}
                <div className="flex items-start gap-3">
                  <div className="size-5 mt-0.5 shrink-0 flex items-center justify-center">
                    <Zap className="size-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Express Delivery Available</p>
                    <p className="text-xs text-muted-foreground">
                      Get it by {deliveryDateStartStr} — {deliveryDateEndStr}
                    </p>
                  </div>
                </div>

                {/* Standard Delivery */}
                <div className="flex items-start gap-3">
                  <Truck className="size-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Standard Delivery by {standardDeliveryStr || '...'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {product.shippingFree ? 'Free delivery on this item' : 'Delivery charges may apply'}
                    </p>
                  </div>
                </div>

                {/* Installation/Demo for applicable categories */}
                {hasInstallation && (
                  <div className="flex items-start gap-3">
                    <PackageOpen className="size-5 text-blue-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Free Installation/Demo</p>
                      <p className="text-xs text-muted-foreground">
                        Free installation & demo available at delivery
                      </p>
                    </div>
                  </div>
                )}

                {/* Open Box Delivery */}
                <div className="flex items-start gap-3">
                  <Package className="size-5 text-emerald-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Open Box Delivery</p>
                    <p className="text-xs text-muted-foreground">
                      Check at doorstep — open & inspect before accepting
                    </p>
                  </div>
                </div>

                {/* Return Window */}
                <div className="flex items-start gap-3">
                  <Calendar className="size-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {product.returnPolicy || '7-Day'} Return Policy
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Easy returns available for this product
                    </p>
                  </div>
                </div>

                {/* Genuine Product */}
                <div className="flex items-start gap-3">
                  <Shield className="size-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Genuine Product</p>
                    <p className="text-xs text-muted-foreground">
                      100% authentic with brand warranty
                    </p>
                  </div>
                </div>
              </div>

              {/* ── Social Proof & Trust Section ────────────────────────────── */}
              <div className="space-y-4 pt-2">
                {/* Live purchase count */}
                {product.totalSold > 0 && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/10">
                    <Users className="size-4 text-primary shrink-0" />
                    <p className="text-sm font-medium text-foreground">
                      {product.totalSold.toLocaleString('en-IN')} people bought this in the last 30 days
                    </p>
                  </div>
                )}

                {/* Trust badges row */}
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="gap-1.5 text-xs py-1.5 px-2.5 border-emerald-300 text-emerald-700 dark:border-emerald-700 dark:text-emerald-400">
                    <Shield className="size-3" />
                    Genuine Product
                  </Badge>
                  <Badge variant="outline" className="gap-1.5 text-xs py-1.5 px-2.5 border-blue-300 text-blue-700 dark:border-blue-700 dark:text-blue-400">
                    <Lock className="size-3" />
                    Secure Payment
                  </Badge>
                  <Badge variant="outline" className="gap-1.5 text-xs py-1.5 px-2.5 border-amber-300 text-amber-700 dark:border-amber-700 dark:text-amber-400">
                    <RotateCcw className="size-3" />
                    Easy Returns
                  </Badge>
                </div>

                {/* Quality assurance */}
                <div className="flex items-center gap-2">
                  <div className="size-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                    <BadgeCheck className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                    100% Authentic Products
                  </span>
                </div>

                {/* Seller info */}
                <div className="flex items-center gap-2">
                  <Store className="size-4 text-muted-foreground shrink-0" />
                  <span className="text-xs text-muted-foreground">
                    Sold by: <span className="font-medium text-foreground">MeraShop Official</span>
                  </span>
                  <BadgeCheck className="size-3.5 text-primary shrink-0" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Sticky Bottom Bar (Mobile — Glass-morphism with price) ─────────────── */}
        <div className="fixed bottom-14 left-0 right-0 z-[var(--z-sticky)] md:hidden glass border-t border-white/20 dark:border-white/5 shadow-lg safe-bottom">
          {/* Live stock indicator on mobile */}
          {isLowStock && !isOutOfStock && (
            <div className="px-3 pt-2">
              <div className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400 font-medium">
                <span className="relative flex size-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full size-1.5 bg-red-500" />
                </span>
                Only {product.stock} left!
              </div>
            </div>
          )}

          {/* Price display on mobile sticky bar */}
          <div className="flex items-center justify-between px-3 pt-2">
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold text-price">{formatINR(displayPrice)}</span>
              {product.salePrice && product.salePrice < product.basePrice && (
                <span className="text-xs text-muted-foreground line-through">{formatINR(product.basePrice)}</span>
              )}
            </div>
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Eye className="size-3" />
              {viewingCount} viewing
            </div>
          </div>

          <div className="flex items-center gap-2 p-3">
            {isOutOfStock ? (
              <Button
                variant="outline"
                className="flex-1 gap-2 h-11 border-primary/30 text-primary"
                onClick={() => {
                  const el = document.querySelector('[data-stock-alert]');
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }
                }}
              >
                <Bell className="size-4" />
                Notify Me
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleWishlistToggle}
                  className="size-11 p-0 shrink-0"
                  aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  <Heart
                    className={cn(
                      'size-5',
                      wishlisted ? 'fill-destructive text-destructive' : ''
                    )}
                  />
                </Button>
                <motion.div
                  className="flex-1"
                  whileTap={{ scale: 0.97 }}
                >
                  <Button
                    size="lg"
                    onClick={handleAddToCart}
                    disabled={isOutOfStock}
                    className="w-full gap-1.5 h-11 text-white border-0 shadow-sm bg-saffron-gradient"
                  >
                    <ShoppingCart className="size-4" />
                    Add to Cart
                  </Button>
                </motion.div>
                <motion.div
                  className="flex-1"
                  whileTap={{ scale: 0.97 }}
                >
                  <Button
                    size="lg"
                    onClick={handleBuyNow}
                    disabled={isOutOfStock}
                    className="w-full h-11 text-white border-0 shadow-sm bg-saffron-dark-gradient"
                  >
                    Buy Now
                  </Button>
                </motion.div>
              </>
            )}
          </div>
        </div>

        {/* ── Product Description & Details Section ─────────────────────────── */}
        <div className="container-shop px-4 md:px-6 lg:px-8 py-6">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="w-full justify-start h-auto p-0 bg-transparent border-b rounded-none gap-0">
              <TabsTrigger
                value="description"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3"
              >
                Description
              </TabsTrigger>
              <TabsTrigger
                value="specifications"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3"
              >
                Specifications
              </TabsTrigger>
              <TabsTrigger
                value="reviews"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3"
              >
                Reviews ({product.reviewCount})
              </TabsTrigger>
            </TabsList>

            {/* Description Tab */}
            <TabsContent value="description" className="mt-6">
              <AnimatedTabContent>
              {product.description ? (
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <div
                    className={cn(
                      'relative',
                      !descriptionExpanded && 'max-h-48 overflow-hidden'
                    )}
                  >
                    <div
                      dangerouslySetInnerHTML={{
                        __html: product.description.replace(/\n/g, '<br />'),
                      }}
                    />
                    {!descriptionExpanded && product.description.length > 300 && (
                      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent" />
                    )}
                  </div>
                  {product.description.length > 300 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDescriptionExpanded(!descriptionExpanded)}
                      className="mt-2 gap-1"
                    >
                      {descriptionExpanded ? (
                        <>
                          Show Less <ChevronUp className="size-4" />
                        </>
                      ) : (
                        <>
                          Read More <ChevronDown className="size-4" />
                        </>
                      )}
                    </Button>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No description available for this product.</p>
              )}

              {/* Tags */}
              {product.tags.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-2">
                  {product.tags.map((tag) => (
                    <Link key={tag} href={`/shop?search=${encodeURIComponent(tag)}`}>
                      <Badge variant="secondary" className="text-xs hover:bg-primary/10 cursor-pointer">
                        {tag}
                      </Badge>
                    </Link>
                  ))}
                </div>
              )}
              </AnimatedTabContent>
            </TabsContent>

            {/* Specifications Tab */}
            <TabsContent value="specifications" className="mt-6">
              <AnimatedTabContent>
              {product.specifications && Object.keys(product.specifications).length > 0 ? (
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <tbody>
                      {Object.entries(product.specifications).map(([key, value], index) => (
                        <tr
                          key={key}
                          className={cn(
                            index % 2 === 0 ? 'bg-muted/30' : 'bg-background'
                          )}
                        >
                          <td className="px-4 py-3 font-medium text-foreground w-1/3 border-r">
                            {key}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {value}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No specifications available.</p>
              )}
              </AnimatedTabContent>
            </TabsContent>

            {/* Reviews Tab */}
            <TabsContent value="reviews" className="mt-6">
              <AnimatedTabContent>
              <div className="space-y-6">
                {/* Enhanced Rating Summary */}
                <ReviewsSummary
                  reviews={product.reviews}
                  avgRating={product.avgRating}
                  reviewCount={product.reviewCount}
                  reviewDistribution={product.reviewDistribution}
                />

                {/* Write a Review */}
                <div className="pt-4 border-t">
                  {!showReviewForm ? (
                    <Button
                      variant="outline"
                      className="w-full gap-2"
                      onClick={() => setShowReviewForm(true)}
                    >
                      <Star className="size-4" />
                      Write a Review
                    </Button>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-foreground">Write a Review</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowReviewForm(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                      <ReviewForm
                        key={reviewRefreshKey}
                        productId={product.id}
                        productName={product.name}
                        onReviewSubmitted={() => {
                          setReviewRefreshKey((k) => k + 1);
                          setShowReviewForm(false);
                          // Re-fetch product to update reviews
                          fetch(`/api/products/${slug}`)
                            .then((res) => res.json())
                            .then((data) => {
                              if (data.product) setProduct(data.product);
                            })
                            .catch(() => {});
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
              </AnimatedTabContent>
            </TabsContent>
          </Tabs>
        </div>

        {/* ── Product Q&A ──────────────────────────────────────────────────── */}
        <div className="container-shop px-4 md:px-6 lg:px-8">
          <ProductQA productId={product.id} productName={product.name} />
        </div>

        {/* ── Frequently Bought Together ──────────────────────────────────────── */}
        {relatedProducts.length > 1 && !isOutOfStock && (
          <div className="container-shop px-4 md:px-6 lg:px-8 py-6">
            <div className="rounded-xl border border-border/50 p-4 md:p-6">
              <div className="flex items-center gap-2 mb-4">
                <Gift className="size-5 text-primary" />
                <h2 className="text-lg md:text-xl font-bold text-foreground">
                  Frequently Bought Together
                </h2>
                <Badge className="text-[10px] bg-stock-green text-white border-none">
                  Save {Math.round(product.discountPercent > 0 ? 5 : 3)}%
                </Badge>
              </div>
              <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide pb-2">
                {/* Current product */}
                <div className="flex items-center gap-3 shrink-0 min-w-[160px] p-2 rounded-lg border border-primary/20 bg-primary/5">
                  {product.primaryImage && (
                    <div className="relative size-14 rounded-md overflow-hidden bg-muted shrink-0">
                      <Image src={product.primaryImage} alt={product.name} fill className="object-cover" sizes="56px" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-foreground line-clamp-1">{product.name}</p>
                    <p className="text-sm font-bold text-price">{formatINR(displayPrice)}</p>
                  </div>
                </div>
                {/* Plus sign */}
                <span className="text-lg font-bold text-muted-foreground shrink-0">+</span>
                {/* Related product */}
                {relatedProducts.slice(0, 1).map((rp) => {
                  const rpImage = rp.images[0]?.url;
                  const rpPrice = rp.salePrice ?? rp.basePrice;
                  return (
                    <div key={rp.id} className="flex items-center gap-3 shrink-0 min-w-[160px] p-2 rounded-lg border border-border">
                      {rpImage && (
                        <div className="relative size-14 rounded-md overflow-hidden bg-muted shrink-0">
                          <Image src={rpImage} alt={rp.name} fill className="object-cover" sizes="56px" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-foreground line-clamp-1">{rp.name}</p>
                        <p className="text-sm font-bold text-price">{formatINR(rpPrice)}</p>
                      </div>
                    </div>
                  );
                })}
                {/* Equals sign */}
                <span className="text-lg font-bold text-muted-foreground shrink-0">=</span>
                {/* Bundle price */}
                <div className="shrink-0 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800">
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Bundle Price</p>
                  <p className="text-lg font-bold text-emerald-700 dark:text-emerald-300">
                    {formatINR(Math.round((displayPrice + (relatedProducts[0]?.salePrice ?? relatedProducts[0]?.basePrice ?? 0)) * 0.95))}
                  </p>
                  <Button
                    size="sm"
                    className="mt-1.5 w-full text-white border-0 text-xs h-8 bg-stock-green"
                    onClick={() => {
                      handleAddToCart();
                      if (relatedProducts[0]) {
                        addItem({
                          productId: relatedProducts[0].id,
                          name: relatedProducts[0].name,
                          slug: relatedProducts[0].slug,
                          price: relatedProducts[0].basePrice,
                          salePrice: relatedProducts[0].salePrice,
                          image: relatedProducts[0].images[0]?.url ?? '',
                        });
                      }
                      toast.success('Bundle added to cart!');
                    }}
                  >
                    Add Both
                    <ArrowRight className="size-3" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Customers Also Bought ─────────────────────────────────────────── */}
        <div className="container-shop px-4 md:px-6 lg:px-8 py-6">
          <AlsoBought
            categorySlug={product.category.slug}
            currentProductId={product.id}
            limit={8}
          />
        </div>

        {/* ── Related Products ──────────────────────────────────────────────── */}
        {relatedProducts.length > 0 && (
          <div className="container-shop px-4 md:px-6 lg:px-8 py-6">
            <h2 className="text-lg md:text-xl font-bold text-foreground mb-4">
              You May Also Like
            </h2>
            <ProductGrid products={relatedProducts} columns={4} />
          </div>
        )}

        {/* ── Recently Viewed ──────────────────────────────────────────────── */}
        <div className="container-shop px-4 md:px-6 lg:px-8 py-6">
          <RecentlyViewed currentProductId={product.id} />
        </div>
      </div>
    </>
  );
}
