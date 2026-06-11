'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Search as SearchIcon,
  Package,
  Grid3X3,
  BookOpen,
  SearchX,
  ArrowRight,
  Loader2,
} from 'lucide-react';

import { formatINR, calcDiscountPercent } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';

interface ProductResult {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  basePrice: number;
  salePrice: number | null;
  effectivePrice: number;
  discountPercent: number;
  primaryImage: string | null;
  primaryImageAlt: string;
  category: { id: string; name: string; slug: string };
  brand: { id: string; name: string; slug: string } | null;
  avgRating: number;
  reviewCount: number;
  stock: number;
}

interface CategoryResult {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  productCount: number;
}

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';

  const [searchQuery, setSearchQuery] = useState(query);
  const [products, setProducts] = useState<ProductResult[]>([]);
  const [categories, setCategories] = useState<CategoryResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (query) {
      setSearchQuery(query);
      performSearch(query);
    }
  }, [query]);

  async function performSearch(q: string) {
    if (!q.trim() || q.trim().length < 2) return;

    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q.trim())}`);
      const data = await res.json();
      setProducts(data.products || []);
      setCategories(data.categories || []);
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    performSearch(searchQuery);
  }

  const totalResults = products.length + categories.length;

  return (
    <div className="min-h-screen">
      {/* ── Search Header ───────────────────────────────────────────────── */}
      <section className="bg-muted/40 border-b">
        <div className="container-shop px-4 md:px-6 lg:px-8 py-8 md:py-12">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl md:text-3xl font-extrabold mb-4">
              Search Results
            </h1>
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Search products, categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 text-base"
                />
              </div>
              <Button type="submit" size="lg" disabled={loading}>
                {loading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  'Search'
                )}
              </Button>
            </form>
          </div>
        </div>
      </section>

      <div className="section-padding">
        <div className="container-shop px-4 md:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            {loading ? (
              <div className="space-y-6">
                <Skeleton className="h-6 w-48" />
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i}>
                      <Skeleton className="aspect-square rounded-t-lg" />
                      <CardContent className="p-4">
                        <Skeleton className="h-4 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-1/2" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ) : !searched ? (
              <div className="text-center py-16">
                <SearchIcon className="size-16 text-muted-foreground/30 mx-auto mb-4" />
                <h2 className="text-xl font-bold mb-2">
                  What are you looking for?
                </h2>
                <p className="text-muted-foreground">
                  Type your search query above to find products, categories,
                  and more.
                </p>
              </div>
            ) : totalResults === 0 ? (
              <div className="text-center py-16">
                <SearchX className="size-16 text-muted-foreground/30 mx-auto mb-4" />
                <h2 className="text-xl font-bold mb-2">No results found</h2>
                <p className="text-muted-foreground mb-6">
                  We couldn&apos;t find anything matching &ldquo;{query}&rdquo;.
                  Try a different search term or browse our categories.
                </p>
                <div className="flex items-center justify-center gap-3">
                  <Button asChild>
                    <Link href="/shop">Browse Products</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/contact">Contact Support</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-sm text-muted-foreground mb-6">
                  {totalResults} result{totalResults !== 1 ? 's' : ''} for{' '}
                  <span className="font-semibold text-foreground">
                    &ldquo;{query}&rdquo;
                  </span>
                </p>

                <Tabs defaultValue="all">
                  <TabsList className="mb-6">
                    <TabsTrigger value="all">
                      All ({totalResults})
                    </TabsTrigger>
                    <TabsTrigger value="products">
                      <Package className="size-3.5 mr-1" />
                      Products ({products.length})
                    </TabsTrigger>
                    <TabsTrigger value="categories">
                      <Grid3X3 className="size-3.5 mr-1" />
                      Categories ({categories.length})
                    </TabsTrigger>
                  </TabsList>

                  {/* All Tab */}
                  <TabsContent value="all" className="space-y-8">
                    {categories.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                          <Grid3X3 className="size-5 text-primary" />
                          Categories
                        </h3>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {categories.map((cat) => (
                            <Link
                              key={cat.id}
                              href={`/category/${cat.slug}`}
                              className="block"
                            >
                              <Card className="hover:shadow-md transition-shadow h-full">
                                <CardContent className="p-5 flex items-center gap-4">
                                  <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                    <Grid3X3 className="size-6 text-primary" />
                                  </div>
                                  <div className="min-w-0">
                                    <h4 className="font-semibold text-sm truncate">
                                      {cat.name}
                                    </h4>
                                    <p className="text-xs text-muted-foreground">
                                      {cat.productCount} product
                                      {cat.productCount !== 1 ? 's' : ''}
                                    </p>
                                    {cat.description && (
                                      <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                                        {cat.description}
                                      </p>
                                    )}
                                  </div>
                                  <ArrowRight className="size-4 text-muted-foreground ml-auto shrink-0" />
                                </CardContent>
                              </Card>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {products.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                          <Package className="size-5 text-primary" />
                          Products
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                          {products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                          ))}
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  {/* Products Tab */}
                  <TabsContent value="products">
                    {products.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">
                        No products found.
                      </p>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {products.map((product) => (
                          <ProductCard key={product.id} product={product} />
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  {/* Categories Tab */}
                  <TabsContent value="categories">
                    {categories.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">
                        No categories found.
                      </p>
                    ) : (
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {categories.map((cat) => (
                          <Link
                            key={cat.id}
                            href={`/shop?category=${cat.slug}`}
                            className="block"
                          >
                            <Card className="hover:shadow-md transition-shadow h-full">
                              <CardContent className="p-5 flex items-center gap-4">
                                <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                  <Grid3X3 className="size-6 text-primary" />
                                </div>
                                <div className="min-w-0">
                                  <h4 className="font-semibold text-sm truncate">
                                    {cat.name}
                                  </h4>
                                  <p className="text-xs text-muted-foreground">
                                    {cat.productCount} product
                                    {cat.productCount !== 1 ? 's' : ''}
                                  </p>
                                </div>
                                <ArrowRight className="size-4 text-muted-foreground ml-auto shrink-0" />
                              </CardContent>
                            </Card>
                          </Link>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductCard({ product }: { product: ProductResult }) {
  return (
    <Link href={`/product/${product.slug}`} className="block">
      <Card className="overflow-hidden h-full hover:shadow-md transition-shadow card-product">
        <div className="relative aspect-square bg-muted">
          {product.primaryImage ? (
            <Image
              src={product.primaryImage}
              alt={product.primaryImageAlt}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <Package className="size-8 text-muted-foreground/30" />
            </div>
          )}
          {product.discountPercent > 0 && (
            <Badge className="absolute top-2 left-2 discount-badge">
              {product.discountPercent}% OFF
            </Badge>
          )}
        </div>
        <CardContent className="p-3">
          {product.brand && (
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">
              {product.brand.name}
            </p>
          )}
          <h4 className="font-semibold text-xs md:text-sm line-clamp-2 mb-1.5">
            {product.name}
          </h4>
          <div className="flex items-baseline gap-1.5">
            <span className="font-bold text-sm text-price">
              {formatINR(product.effectivePrice)}
            </span>
            {product.discountPercent > 0 && (
              <span className="text-[10px] text-muted-foreground line-through">
                {formatINR(product.basePrice)}
              </span>
            )}
          </div>
          {product.stock === 0 && (
            <Badge variant="secondary" className="mt-1.5 text-[10px]">
              Out of Stock
            </Badge>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
