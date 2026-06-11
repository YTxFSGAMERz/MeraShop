'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { SlidersHorizontal, ArrowUpDown, X, ChevronRight, PackageOpen } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
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
import { BreadcrumbNav, type BreadcrumbItemData } from '@/components/layout/Breadcrumb';
import { formatINR } from '@/lib/constants';

// ── Types ────────────────────────────────────────────────────────────────────

interface CategoryChild {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  productCount: number;
}

interface CategoryDetail {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  parentId: string | null;
  parent: { id: string; name: string; slug: string } | null;
  children: CategoryChild[];
  directProductCount: number;
  totalProductCount: number;
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

// ── Page Component ───────────────────────────────────────────────────────────

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug as string;

  // Category state
  const [category, setCategory] = useState<CategoryDetail | null>(null);
  const [categoryLoading, setCategoryLoading] = useState(true);
  const [categoryError, setCategoryError] = useState(false);

  // Product state
  const [products, setProducts] = useState<APIProduct[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Subcategory filter
  const [activeSubcategory, setActiveSubcategory] = useState<string | null>(null);

  // Filters
  const [sortOption, setSortOption] = useState<SortOption>('popularity');
  const [filters, setFilters] = useState<FilterState>({
    priceRange: [0, 200000],
    brands: [],
    minRating: 0,
    inStockOnly: false,
  });

  // UI
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);

  // ── Fetch category details ─────────────────────────────────────────────
  useEffect(() => {
    async function fetchCategory() {
      setCategoryLoading(true);
      setCategoryError(false);
      try {
        const res = await fetch(`/api/categories/${slug}`);
        if (res.ok) {
          const data = await res.json();
          setCategory(data.category);
        } else {
          setCategoryError(true);
        }
      } catch {
        setCategoryError(true);
      } finally {
        setCategoryLoading(false);
      }
    }
    fetchCategory();
  }, [slug]);

  // ── Fetch products ─────────────────────────────────────────────────────
  const fetchProducts = useCallback(
    async (page: number, append = false) => {
      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }

      try {
        const params = new URLSearchParams();
        const categorySlug = activeSubcategory || slug;
        params.set('category', categorySlug);
        params.set('page', String(page));
        params.set('limit', '12');
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
    [slug, activeSubcategory, sortOption, filters]
  );

  // Initial fetch and refetch on filter/sort/subcategory changes
  useEffect(() => {
    fetchProducts(1, false);
  }, [fetchProducts]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleSubcategorySelect = (subSlug: string | null) => {
    setActiveSubcategory(subSlug);
    setCurrentPage(1);
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
      case 'subcategory':
        setActiveSubcategory(null);
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
    setActiveSubcategory(null);
    setFilters({ priceRange: [0, 200000], brands: [], minRating: 0, inStockOnly: false });
    setSortOption('popularity');
    setCurrentPage(1);
  };

  // ── Active filter chips ──────────────────────────────────────────────────
  const activeFilterChips: Array<{ key: string; label: string }> = [];
  if (activeSubcategory && category?.children) {
    const sub = category.children.find((c) => c.slug === activeSubcategory);
    activeFilterChips.push({ key: 'subcategory', label: sub?.name || activeSubcategory });
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

  // ── Build breadcrumb ────────────────────────────────────────────────────
  const breadcrumbItems: BreadcrumbItemData[] = [
    { label: 'Home', href: '/' },
    { label: 'Categories', href: '/shop' },
  ];

  if (category?.parent) {
    breadcrumbItems.push({
      label: category.parent.name,
      href: `/category/${category.parent.slug}`,
    });
  }

  if (category) {
    breadcrumbItems.push({ label: category.name });
  }

  const activeFilterCount = activeFilterChips.length;

  // ── Loading state for category header ───────────────────────────────────
  if (categoryLoading) {
    return (
      <div className="min-h-screen pb-20 md:pb-0">
        <div className="border-b bg-background">
          <div className="container-shop px-4 md:px-6 lg:px-8 py-4 md:py-6">
            <div className="flex items-center gap-2 mb-4">
              <Skeleton className="h-4 w-40" />
            </div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96 mb-4" />
            <Skeleton className="h-8 w-full max-w-md" />
          </div>
        </div>
        <div className="container-shop px-4 md:px-6 lg:px-8 py-6">
          <ProductGridSkeleton count={12} />
        </div>
      </div>
    );
  }

  // ── Error state ─────────────────────────────────────────────────────────
  if (categoryError || !category) {
    return (
      <div className="min-h-screen pb-20 md:pb-0">
        <div className="container-shop px-4 md:px-6 lg:px-8 py-12">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="mb-4 rounded-full bg-muted p-4">
              <PackageOpen className="size-10 text-muted-foreground" />
            </div>
            <h1 className="mb-1 text-xl font-semibold text-foreground">Category Not Found</h1>
            <p className="mb-6 max-w-sm text-sm text-muted-foreground">
              We couldn&apos;t find the category you&apos;re looking for. It may have been removed or the link is incorrect.
            </p>
            <Button asChild>
              <Link href="/shop">Browse All Products</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      {/* Category Header */}
      <div className="border-b bg-background">
        <div className="container-shop px-4 md:px-6 lg:px-8 py-4 md:py-6">
          {/* Breadcrumb */}
          <div className="mb-3">
            <BreadcrumbNav items={breadcrumbItems} />
          </div>

          {/* Category Info */}
          <div className="flex flex-col md:flex-row md:items-start gap-4 mb-4">
            {category.image && (
              <div className="relative size-16 md:size-20 rounded-xl overflow-hidden shrink-0 border border-border/50">
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h1 className="text-xl md:text-2xl font-bold text-foreground">
                {category.name}
              </h1>
              {category.description && (
                <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                  {category.description}
                </p>
              )}
              <p className="text-sm text-muted-foreground mt-1">
                {isLoading ? 'Loading...' : `${totalProducts} product${totalProducts !== 1 ? 's' : ''} found`}
              </p>
            </div>
          </div>

          {/* Subcategory Pills (if category has children) */}
          {category.children.length > 0 && (
            <CategoryPills
              categories={category.children.map((child) => ({
                id: child.id,
                name: `${child.name} (${child.productCount})`,
                slug: child.slug,
              }))}
              activeCategory={activeSubcategory}
              onSelect={handleSubcategorySelect}
              className="mb-4"
            />
          )}

          {/* Filter + Sort Row */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFilterOpen(true)}
              className="gap-1.5"
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
              className="gap-1.5"
            >
              <ArrowUpDown className="size-4" />
              Sort
            </Button>

            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAllFilters}
                className="gap-1 text-muted-foreground ml-auto"
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

      {/* Subcategory Cards (if category has children and no subcategory selected) */}
      {category.children.length > 0 && !activeSubcategory && (
        <div className="border-b bg-muted/20">
          <div className="container-shop px-4 md:px-6 lg:px-8 py-4">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Subcategories
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {category.children.map((child) => (
                <Link
                  key={child.id}
                  href={`/category/${child.slug}`}
                  className="group flex flex-col items-center gap-2 rounded-xl border border-border/50 bg-card p-3 transition-all hover:border-primary/30 hover:shadow-sm"
                >
                  <div className="relative size-12 rounded-lg overflow-hidden bg-muted shrink-0">
                    {child.image ? (
                      <Image
                        src={child.image}
                        alt={child.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="48px"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground text-xs font-medium">
                        {child.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="text-center">
                    <span className="text-xs font-medium text-foreground group-hover:text-primary transition-colors">
                      {child.name}
                    </span>
                    <span className="block text-[10px] text-muted-foreground">
                      {child.productCount} items
                    </span>
                  </div>
                  <ChevronRight className="size-3 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Product Grid */}
      <div className="container-shop px-4 md:px-6 lg:px-8 py-6">
        {isLoading ? (
          <ProductGridSkeleton count={12} />
        ) : (
          <>
            <ProductGrid products={mappedProducts} />

            {/* Load More / Pagination */}
            {products.length > 0 && currentPage < totalPages && (
              <div className="mt-8 flex justify-center">
                <Button
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  variant="outline"
                  size="lg"
                  className="min-w-[200px]"
                >
                  {isLoadingMore ? 'Loading...' : `Load More (${totalProducts - products.length} remaining)`}
                </Button>
              </div>
            )}

            {/* Page indicator */}
            {products.length > 0 && totalPages > 1 && (
              <p className="text-center text-sm text-muted-foreground mt-4">
                Showing {products.length} of {totalProducts} products
              </p>
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
