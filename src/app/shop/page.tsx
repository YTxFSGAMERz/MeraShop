'use client';

import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  X,
  LayoutGrid,
  List,
  IndianRupee,
  Star,
  Star as StarIcon,
  Truck,
  Sparkles,
  Package,
  Heart,
  ShoppingCart,
} from 'lucide-react';
import { useWishlistStore } from '@/lib/stores/wishlist-store';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  CategoryPills,
  ProductGrid,
  FilterDrawer,
  SortSheet,
  type FilterState,
  type SortOption,
  ProductGridSkeleton,
} from '@/components/shop';
import type { ProductCardProduct } from '@/components/shop/ProductCard';
import { formatINR } from '@/lib/constants';
import { cn } from '@/lib/utils';

// ── Types ────────────────────────────────────────────────────────────────────

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Brand {
  name: string;
  slug: string;
}

interface APIProduct {
  id: string;
  name: string;
  slug: string;
  shortDescription?: string;
  basePrice: number;
  salePrice?: number | null;
  effectivePrice: number;
  discountPercent: number;
  primaryImage: string | null;
  primaryImageAlt: string;
  category: { id: string; name: string; slug: string };
  brand: { id: string; name: string; slug: string; logo?: string } | null;
  variants: Array<{ id: string; name: string; value: string; price: number | null; stock: number }>;
  avgRating: number;
  reviewCount: number;
  totalSold: number;
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestseller: boolean;
  stock: number;
  shippingFree: boolean;
  tags: string | null;
}

// ── Sort option to API sort mapping ─────────────────────────────────────────

const SORT_MAP: Record<SortOption, string> = {
  popularity: 'bestseller',
  'price-asc': 'price_asc',
  'price-desc': 'price_desc',
  newest: 'newest',
  rating: 'rating',
  discount: 'discount',
};

// ── Quick filter chips ──────────────────────────────────────────────────────

interface QuickFilter {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
}

function getQuickFilters(filters: FilterState, activeCategory: string | null): QuickFilter[] {
  return [
    {
      id: 'under999',
      label: 'Under ₹999',
      icon: IndianRupee,
      active: filters.priceRange[1] <= 999,
    },
    {
      id: '4star',
      label: '4★ & above',
      icon: Star,
      active: filters.minRating >= 4,
    },
    {
      id: 'freedelivery',
      label: 'Free Delivery',
      icon: Truck,
      active: false,
    },
    {
      id: 'newarrivals',
      label: 'New Arrivals',
      icon: Sparkles,
      active: activeCategory === 'new-arrivals',
    },
    {
      id: 'instock',
      label: 'In Stock',
      icon: Package,
      active: filters.inStockOnly,
    },
  ];
}

// ── Page Component ───────────────────────────────────────────────────────────

type ViewMode = 'grid' | 'list';

function ShopPageContent() {
  const searchParams = useSearchParams();

  // State
  const [products, setProducts] = useState<APIProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Filters
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [activeCategory, setActiveCategory] = useState<string | null>(searchParams.get('category') || null);
  const [sortOption, setSortOption] = useState<SortOption>(
    (searchParams.get('sort') as SortOption) || 'popularity'
  );
  const [filters, setFilters] = useState<FilterState>({
    priceRange: [0, 200000],
    brands: [],
    minRating: 0,
    inStockOnly: false,
  });

  // UI
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);

  // ── Fetch categories on mount ────────────────────────────────────────────
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch('/api/categories');
        if (res.ok) {
          const data = await res.json();
          const flatCategories: Category[] = [];
          for (const cat of data.categories) {
            flatCategories.push({ id: cat.id, name: cat.name, slug: cat.slug });
            if (cat.children) {
              for (const child of cat.children) {
                flatCategories.push({ id: child.id, name: child.name, slug: child.slug });
              }
            }
          }
          setCategories(flatCategories);
        }
      } catch {
        // silently fail
      }
    }
    fetchCategories();
  }, []);

  // ── Fetch products ───────────────────────────────────────────────────────
  const fetchProducts = useCallback(
    async (page: number, append = false) => {
      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }

      try {
        const params = new URLSearchParams();
        params.set('page', String(page));
        params.set('limit', '12');

        if (activeCategory) params.set('category', activeCategory);
        if (searchQuery.trim()) params.set('search', searchQuery.trim());
        if (SORT_MAP[sortOption]) params.set('sort', SORT_MAP[sortOption]);
        if (filters.brands.length > 0) params.set('brand', filters.brands.join(','));
        if (filters.inStockOnly) params.set('inStock', 'true');

        const res = await fetch(`/api/products?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          let filteredProducts = data.products as APIProduct[];

          // Client-side price filter
          if (filters.priceRange[0] > 0 || filters.priceRange[1] < 200000) {
            filteredProducts = filteredProducts.filter(
              (p) => p.effectivePrice >= filters.priceRange[0] && p.effectivePrice <= filters.priceRange[1]
            );
          }

          // Client-side rating filter
          if (filters.minRating > 0) {
            filteredProducts = filteredProducts.filter((p) => p.avgRating >= filters.minRating);
          }

          // Extract brands from results for filter drawer
          if (!append) {
            const uniqueBrands = new Map<string, Brand>();
            for (const p of data.products) {
              if (p.brand) {
                uniqueBrands.set(p.brand.slug, { name: p.brand.name, slug: p.brand.slug });
              }
            }
            setBrands(Array.from(uniqueBrands.values()));
          }

          if (append) {
            setProducts((prev) => [...prev, ...filteredProducts]);
          } else {
            setProducts(filteredProducts);
          }
          setTotalProducts(data.total);
          setTotalPages(data.totalPages);
          setCurrentPage(page);
        }
      } catch {
        // silently fail
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [activeCategory, searchQuery, sortOption, filters]
  );

  // Initial fetch and refetch on filter/sort changes
  useEffect(() => {
    fetchProducts(1, false);
  }, [fetchProducts]);

  // Scroll to top on filter changes
  useEffect(() => {
    if (topRef.current) {
      topRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [activeCategory, sortOption, filters]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleCategorySelect = (slug: string | null) => {
    setActiveCategory(slug);
    setCurrentPage(1);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchProducts(1, false);
  };

  const handleSort = (sort: SortOption) => {
    setSortOption(sort);
    setCurrentPage(1);
  };

  const handleFilterApply = (newFilters: FilterState) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleLoadMore = () => {
    if (currentPage < totalPages) {
      fetchProducts(currentPage + 1, true);
    }
  };

  const handleRemoveFilter = (filterKey: string) => {
    switch (filterKey) {
      case 'category':
        setActiveCategory(null);
        break;
      case 'search':
        setSearchQuery('');
        break;
      case 'brands':
        setFilters((prev) => ({ ...prev, brands: [] }));
        break;
      case 'rating':
        setFilters((prev) => ({ ...prev, minRating: 0 }));
        break;
      case 'inStock':
        setFilters((prev) => ({ ...prev, inStockOnly: false }));
        break;
      case 'price':
        setFilters((prev) => ({ ...prev, priceRange: [0, 200000] }));
        break;
    }
  };

  const handleClearAllFilters = () => {
    setActiveCategory(null);
    setSearchQuery('');
    setFilters({ priceRange: [0, 200000], brands: [], minRating: 0, inStockOnly: false });
    setSortOption('popularity');
    setCurrentPage(1);
  };

  // ── Quick filter handler ─────────────────────────────────────────────────
  const handleQuickFilter = (filterId: string) => {
    switch (filterId) {
      case 'under999':
        setFilters((prev) => ({
          ...prev,
          priceRange: prev.priceRange[1] <= 999 ? [0, 200000] : [0, 999],
        }));
        break;
      case '4star':
        setFilters((prev) => ({
          ...prev,
          minRating: prev.minRating >= 4 ? 0 : 4,
        }));
        break;
      case 'freedelivery':
        // No direct API support — visual only
        break;
      case 'newarrivals':
        setActiveCategory((prev) => prev === 'new-arrivals' ? null : 'new-arrivals');
        break;
      case 'instock':
        setFilters((prev) => ({
          ...prev,
          inStockOnly: !prev.inStockOnly,
        }));
        break;
    }
  };

  // ── Active filter chips ──────────────────────────────────────────────────
  const activeFilterChips: Array<{ key: string; label: string }> = [];
  if (activeCategory) {
    const cat = categories.find((c) => c.slug === activeCategory);
    activeFilterChips.push({ key: 'category', label: cat?.name || activeCategory });
  }
  if (searchQuery.trim()) {
    activeFilterChips.push({ key: 'search', label: `"${searchQuery}"` });
  }
  if (filters.brands.length > 0) {
    activeFilterChips.push({ key: 'brands', label: `${filters.brands.length} brand${filters.brands.length > 1 ? 's' : ''}` });
  }
  if (filters.minRating > 0) {
    activeFilterChips.push({ key: 'rating', label: `${filters.minRating}+ stars` });
  }
  if (filters.inStockOnly) {
    activeFilterChips.push({ key: 'inStock', label: 'In Stock' });
  }
  if (filters.priceRange[0] > 0 || filters.priceRange[1] < 200000) {
    activeFilterChips.push({
      key: 'price',
      label: `${formatINR(filters.priceRange[0])} - ${formatINR(filters.priceRange[1])}`,
    });
  }

  // ── Map API products to ProductCard format ───────────────────────────────
  const mappedProducts: ProductCardProduct[] = products.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    basePrice: p.basePrice,
    salePrice: p.salePrice ?? undefined,
    images: p.primaryImage
      ? [{ url: p.primaryImage, isPrimary: true }]
      : [],
    avgRating: p.avgRating,
    reviewCount: p.reviewCount,
    brand: p.brand ? { name: p.brand.name } : undefined,
    stock: p.stock,
    isNewArrival: p.isNewArrival,
    isBestseller: p.isBestseller,
    totalSold: p.totalSold,
  }));

  const activeFilterCount = activeFilterChips.length;
  const quickFilters = getQuickFilters(filters, activeCategory);

  return (
    <div className="min-h-screen pb-20 md:pb-0" ref={topRef}>
      {/* ── Page Header with gradient text ─────────────────────────────── */}
      <div className="border-b bg-background">
        <div className="container-shop px-4 md:px-6 lg:px-8 py-4 md:py-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h1 className="text-xl md:text-3xl font-black">
                <span className="gradient-text">All Products</span>
              </h1>
              <Badge
                variant="secondary"
                className="h-7 px-3 text-xs font-semibold tabular-nums bg-primary-icon"
              >
                {isLoading ? '...' : totalProducts}
              </Badge>
            </div>

            {/* Grid / List view toggle */}
            <div className="flex items-center gap-1 bg-muted rounded-lg p-0.5">
              <button
                className={cn(
                  'flex items-center justify-center size-8 rounded-md transition-all',
                  viewMode === 'grid'
                    ? 'bg-background shadow-sm text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                )}
                onClick={() => setViewMode('grid')}
                aria-label="Grid view"
              >
                <LayoutGrid className="size-4" />
              </button>
              <button
                className={cn(
                  'flex items-center justify-center size-8 rounded-md transition-all',
                  viewMode === 'list'
                    ? 'bg-background shadow-sm text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                )}
                onClick={() => setViewMode('list')}
                aria-label="List view"
              >
                <List className="size-4" />
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 h-10 rounded-xl shadow-sm focus:shadow-md focus:shadow-primary/5 transition-shadow"
            />
          </form>

          {/* Category Pills */}
          <CategoryPills
            categories={categories}
            activeCategory={activeCategory ?? undefined}
            onSelect={handleCategorySelect}
            className="mb-4"
          />

          {/* Quick filter chips row */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1 mb-3">
            {quickFilters.map((filter) => {
              const IconComp = filter.icon;
              return (
                <button
                  key={filter.id}
                  onClick={() => handleQuickFilter(filter.id)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all border',
                    filter.active
                      ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                      : 'bg-background text-muted-foreground border-border hover:border-primary/30 hover:text-foreground'
                  )}
                >
                  <IconComp className="size-3" />
                  {filter.label}
                </button>
              );
            })}
          </div>

          {/* Filter + Sort Row */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFilterOpen(true)}
              className="gap-1.5 rounded-lg"
            >
              <SlidersHorizontal className="size-4" />
              Filters
              {activeFilterCount > 0 && (
                <Badge variant="default" className="ml-1 h-5 px-1.5 text-[10px]">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSortOpen(true)}
              className="gap-1.5 rounded-lg"
            >
              <ArrowUpDown className="size-4" />
              Sort
            </Button>

            {/* Result count */}
            {!isLoading && products.length > 0 && (
              <span className="ml-auto text-xs text-muted-foreground hidden sm:inline-block">
                Showing {products.length} of {totalProducts} products
              </span>
            )}

            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAllFilters}
                className="gap-1 text-muted-foreground sm:ml-0"
              >
                <X className="size-3.5" />
                Clear all
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Active Filter Chips */}
      {activeFilterChips.length > 0 && (
        <div className="border-b bg-muted/30">
          <div className="container-shop px-4 md:px-6 lg:px-8 py-2">
            <div className="flex flex-wrap gap-1.5">
              {activeFilterChips.map((chip) => (
                <Badge
                  key={chip.key}
                  variant="secondary"
                  className="gap-1 pr-1 font-normal"
                >
                  {chip.label}
                  <button
                    onClick={() => handleRemoveFilter(chip.key)}
                    className="ml-0.5 rounded-full p-0.5 hover:bg-muted-foreground/20 transition-colors"
                    aria-label={`Remove ${chip.label} filter`}
                  >
                    <X className="size-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Product Grid / List */}
      <div className="container-shop px-4 md:px-6 lg:px-8 py-6">
        {isLoading ? (
          <ProductGridSkeleton count={12} />
        ) : (
          <>
            {viewMode === 'grid' ? (
              <ProductGrid products={mappedProducts} />
            ) : (
              /* List View */
              <div className="space-y-3">
                {mappedProducts.map((product) => (
                  <ListProductCard key={product.id} product={product} />
                ))}
                {mappedProducts.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Package className="size-12 mx-auto mb-3 opacity-30" />
                    <p className="font-medium">No products found</p>
                    <p className="text-sm mt-1">Try adjusting your filters or search terms.</p>
                  </div>
                )}
              </div>
            )}

            {/* Load More / Pagination */}
            {products.length > 0 && currentPage < totalPages && (
              <div className="mt-8 flex justify-center">
                <Button
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  variant="outline"
                  size="lg"
                  className="min-w-[200px] rounded-xl"
                >
                  {isLoadingMore ? 'Loading...' : `Load More (${totalProducts - products.length} remaining)`}
                </Button>
              </div>
            )}

            {/* Page indicator - prominent on mobile */}
            {products.length > 0 && totalPages > 1 && (
              <div className="mt-4 flex items-center justify-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground tabular-nums">{products.length}</span>
                  <span>of</span>
                  <span className="font-semibold text-foreground tabular-nums">{totalProducts}</span>
                  <span>products</span>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Filter Drawer */}
      <FilterDrawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={{
          brands,
          priceMin: 0,
          priceMax: 200000,
        }}
        onApply={handleFilterApply}
        currentFilters={filters}
      />

      {/* Sort Sheet */}
      <SortSheet
        isOpen={isSortOpen}
        onClose={() => setIsSortOpen(false)}
        currentSort={sortOption}
        onSort={handleSort}
      />
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<ProductGridSkeleton count={12} />}>
      <ShopPageContent />
    </Suspense>
  );
}

// ── List View Product Card ────────────────────────────────────────────────────

function ListProductCard({ product }: { product: ProductCardProduct }) {
  const isInWishlist = useWishlistStore((s) => s.isInWishlist);
  const addItem = useWishlistStore((s) => s.addItem);
  const removeItem = useWishlistStore((s) => s.removeItem);
  const wishlisted = isInWishlist(product.id);
  const discount = product.salePrice
    ? Math.round(((product.basePrice - product.salePrice) / product.basePrice) * 100)
    : 0;
  const imageUrl = product.images?.[0]?.url;
  const effectivePrice = product.salePrice || product.basePrice;

  return (
    <div className="group flex gap-3 md:gap-4 p-3 md:p-4 rounded-xl border bg-card hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 gradient-border">
      {/* Image */}
      <Link href={`/product/${product.slug}`} className="shrink-0">
        <div className="relative w-20 h-20 md:w-28 md:h-28 rounded-lg overflow-hidden bg-muted">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <Package className="size-8" />
            </div>
          )}
          {/* Discount badge */}
          {discount > 0 && (
            <span
              className="absolute top-1 left-1 text-[9px] font-bold text-white px-1.5 py-0.5 rounded bg-discount-red"
            >
              {discount}% OFF
            </span>
          )}
        </div>
      </Link>

      {/* Details */}
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            {product.brand && (
              <p className="text-[10px] md:text-xs font-semibold text-primary uppercase tracking-wider">
                {product.brand.name}
              </p>
            )}
            <Link href={`/product/${product.slug}`}>
              <h3 className="text-sm md:text-base font-semibold text-foreground line-clamp-2 hover:text-primary transition-colors">
                {product.name}
              </h3>
            </Link>
          </div>
          <button
            onClick={(e) => {
              e.preventDefault();
              if (wishlisted) {
                removeItem(product.id);
              } else {
                addItem({
                  productId: product.id,
                  name: product.name,
                  price: product.basePrice,
                  salePrice: product.salePrice,
                  image: product.images?.[0]?.url ?? '',
                  slug: product.slug,
                });
              }
            }}
            className="shrink-0 size-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
            aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart className={cn('size-4', wishlisted ? 'fill-red-500 text-red-500' : 'text-muted-foreground')} />
          </button>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1 mt-1">
          <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold text-white bg-emerald-600">
            <StarIcon className="size-2.5 fill-white" />
            {product.avgRating.toFixed(1)}
          </div>
          <span className="text-[10px] text-muted-foreground">
            ({product.reviewCount})
          </span>
          {product.isBestseller && (
            <span className="text-[9px] font-bold text-primary uppercase ml-1">Bestseller</span>
          )}
          {product.isNewArrival && (
            <span className="text-[9px] font-bold text-emerald-600 uppercase ml-1">New</span>
          )}
        </div>

        {/* Price + Actions */}
        <div className="flex items-end justify-between mt-auto pt-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-base md:text-lg text-foreground tabular-nums">
              {formatINR(effectivePrice)}
            </span>
            {product.salePrice && (
              <>
                <span className="text-xs text-muted-foreground line-through tabular-nums">
                  {formatINR(product.basePrice)}
                </span>
                <span className="text-xs font-bold text-emerald-600">
                  {discount}% off
                </span>
              </>
            )}
          </div>
          <Button
            size="sm"
            className="shrink-0 gap-1.5 h-8 text-xs rounded-lg text-white border-0 bg-saffron-gradient"
            asChild
          >
            <Link href={`/product/${product.slug}`}>
              <ShoppingCart className="size-3.5" />
              View
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
