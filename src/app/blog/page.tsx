'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  BookOpen,
  Search,
  Calendar,
  User,
  ArrowRight,
  Tag,
  Clock,
  Share2,
  CheckCircle2,
} from 'lucide-react';
import { motion } from 'framer-motion';

import { SITE_NAME } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  category: string | null;
  tags: string[];
  authorName: string | null;
  publishedAt: string | null;
  createdAt: string;
}

// ── Share Button ────────────────────────────────────────────────────────────

function ShareButton({ slug, title }: { slug: string; title: string }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = `${window.location.origin}/blog/${slug}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        handleShare();
      }}
      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
      aria-label={`Share ${title}`}
    >
      {copied ? (
        <>
          <CheckCircle2 className="size-3 text-emerald-500" />
          <span className="text-emerald-600">Copied!</span>
        </>
      ) : (
        <>
          <Share2 className="size-3" />
          Share
        </>
      )}
    </button>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  // Extract unique categories from posts
  const categories = useMemo(() => {
    const cats = new Set<string>();
    posts.forEach((p) => {
      if (p.category) cats.add(p.category);
    });
    return ['all', ...Array.from(cats)];
  }, [posts]);

  useEffect(() => {
    async function fetchPosts() {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: '9',
        });
        if (activeCategory !== 'all') {
          params.set('category', activeCategory);
        }
        const res = await fetch(`/api/blog?${params}`);
        const data = await res.json();
        setPosts(data.posts || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
      } catch (err) {
        console.error('Failed to fetch blog posts:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, [page, activeCategory]);

  // Client-side search filter
  const filteredPosts = useMemo(() => {
    if (!searchQuery.trim()) return posts;
    const q = searchQuery.toLowerCase();
    return posts.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.excerpt?.toLowerCase().includes(q) ||
        p.tags?.some((t) => t.toLowerCase().includes(q))
    );
  }, [posts, searchQuery]);

  const featuredPost = filteredPosts[0];
  const remainingPosts = filteredPosts.slice(1);

  function formatDate(dateStr: string | null) {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  function getReadingTime(excerpt: string | null) {
    if (!excerpt) return '2 min read';
    const words = excerpt.split(/\s+/).length;
    return `${Math.max(2, Math.ceil(words / 40))} min read`;
  }

  function getAuthorInitials(name: string | null) {
    if (!name) return 'A';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  }

  return (
    <div className="min-h-screen">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="gradient-hero relative overflow-hidden">
        <div className="container-shop px-4 md:px-6 lg:px-8 py-12 md:py-20">
          <div className="max-w-2xl mx-auto text-center">
            <BookOpen className="size-10 text-white/80 mx-auto mb-4" />
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-3">
              {SITE_NAME} Blog
            </h1>
            <p className="text-base md:text-lg text-white/90">
              Tips, guides, and stories to help you shop smarter and live
              better.
            </p>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
      </section>

      <div className="section-padding">
        <div className="container-shop px-4 md:px-6 lg:px-8">
          {/* ── Search & Category Filters ──────────────────────────────────── */}
          <div className="max-w-6xl mx-auto mb-8">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <Button
                    key={cat}
                    variant={activeCategory === cat ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setActiveCategory(cat);
                      setPage(1);
                    }}
                    className={cn(
                      'capitalize',
                      activeCategory === cat && 'text-white border-0 bg-saffron-gradient',
                      activeCategory === cat && 'shadow-sm hover:shadow-md'
                    )}
                  >
                    {cat}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <div className="max-w-6xl mx-auto">
            {loading ? (
              <div className="space-y-6">
                {/* Featured skeleton */}
                <div className="grid md:grid-cols-2 gap-6">
                  <Skeleton className="aspect-video rounded-lg" />
                  <div className="space-y-3">
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-20 w-full" />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i}>
                      <Skeleton className="aspect-video rounded-t-lg" />
                      <CardContent className="p-4">
                        <Skeleton className="h-5 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-full mb-1" />
                        <Skeleton className="h-4 w-2/3" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ) : filteredPosts.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <BookOpen className="size-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-bold text-lg mb-2">No articles found</h3>
                  <p className="text-muted-foreground text-sm">
                    {searchQuery
                      ? `No articles match "${searchQuery}". Try a different search.`
                      : 'No articles available in this category yet. Check back soon!'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* ── Featured Post (Large Card) ──────────────────────────────── */}
                {featuredPost && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="mb-8"
                  >
                    <Link
                      href={`/blog/${featuredPost.slug}`}
                      className="block"
                    >
                      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="grid md:grid-cols-2">
                          <div className="relative aspect-video md:aspect-auto md:min-h-[320px] bg-muted">
                            {featuredPost.coverImage ? (
                              <Image
                                src={featuredPost.coverImage}
                                alt={featuredPost.title}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, 50vw"
                              />
                            ) : (
                              <div className="flex items-center justify-center h-48 md:h-full bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-950/30 dark:to-amber-950/30">
                                <BookOpen className="size-12 text-primary/40" />
                              </div>
                            )}
                            {featuredPost.category && (
                              <Badge className="absolute top-3 left-3 text-white border-0 bg-saffron-gradient">
                                {featuredPost.category}
                              </Badge>
                            )}
                            {/* Featured badge */}
                            <Badge variant="secondary" className="absolute top-3 right-3 text-[10px]">
                              ★ Featured
                            </Badge>
                          </div>
                          <CardContent className="p-6 md:p-8 flex flex-col justify-center">
                            {/* Author + Date + Reading Time */}
                            <div className="flex items-center gap-3 mb-3">
                              <Avatar className="size-7">
                                <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                                  {getAuthorInitials(featuredPost.authorName)}
                                </AvatarFallback>
                              </Avatar>
                              {featuredPost.authorName && (
                                <span className="text-xs font-medium text-foreground">
                                  {featuredPost.authorName}
                                </span>
                              )}
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Calendar className="size-3" />
                                {formatDate(featuredPost.publishedAt)}
                              </span>
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="size-3" />
                                {getReadingTime(featuredPost.excerpt)}
                              </span>
                            </div>
                            <h2 className="text-xl md:text-2xl font-bold mb-3 line-clamp-2">
                              {featuredPost.title}
                            </h2>
                            {featuredPost.excerpt && (
                              <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3 mb-4">
                                {featuredPost.excerpt}
                              </p>
                            )}
                            {featuredPost.tags?.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mb-4">
                                {featuredPost.tags.slice(0, 3).map((tag) => (
                                  <Badge
                                    key={tag}
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    <Tag className="size-3 mr-1" />
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                            <div className="flex items-center justify-between">
                              <span className="text-primary text-sm font-medium flex items-center gap-1">
                                Read More <ArrowRight className="size-3" />
                              </span>
                              <ShareButton slug={featuredPost.slug} title={featuredPost.title} />
                            </div>
                          </CardContent>
                        </div>
                      </Card>
                    </Link>
                  </motion.div>
                )}

                {/* ── Posts Grid ────────────────────────────────────────────── */}
                {remainingPosts.length > 0 && (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {remainingPosts.map((post, index) => (
                      <motion.div
                        key={post.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.06 }}
                      >
                        <Link
                          href={`/blog/${post.slug}`}
                          className="block"
                        >
                          <Card className="overflow-hidden h-full hover:shadow-md transition-shadow">
                            <div className="relative aspect-video bg-muted">
                              {post.coverImage ? (
                                <Image
                                  src={post.coverImage}
                                  alt={post.title}
                                  fill
                                  className="object-cover"
                                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                />
                              ) : (
                                <div className="flex items-center justify-center h-full bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20">
                                  <BookOpen className="size-8 text-primary/30" />
                                </div>
                              )}
                              {post.category && (
                                <Badge className="absolute top-2 left-2 text-[10px] text-white border-0 bg-saffron-gradient">
                                  {post.category}
                                </Badge>
                              )}
                            </div>
                            <CardContent className="p-4">
                              {/* Author + Date + Reading Time */}
                              <div className="flex items-center gap-2 mb-2">
                                <Avatar className="size-5">
                                  <AvatarFallback className="text-[8px] bg-primary/10 text-primary">
                                    {getAuthorInitials(post.authorName)}
                                  </AvatarFallback>
                                </Avatar>
                                {post.authorName && (
                                  <span className="text-[11px] font-medium text-foreground truncate">
                                    {post.authorName}
                                  </span>
                                )}
                                <span className="text-[10px] text-muted-foreground flex items-center gap-0.5 shrink-0">
                                  <Clock className="size-2.5" />
                                  {getReadingTime(post.excerpt)}
                                </span>
                              </div>
                              <h3 className="font-semibold text-sm md:text-base line-clamp-2 mb-2">
                                {post.title}
                              </h3>
                              {post.excerpt && (
                                <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                                  {post.excerpt}
                                </p>
                              )}
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] text-muted-foreground">
                                  {formatDate(post.publishedAt)}
                                </span>
                                <ShareButton slug={post.slug} title={post.title} />
                              </div>
                              {post.tags?.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {post.tags.slice(0, 2).map((tag) => (
                                    <Badge
                                      key={tag}
                                      variant="secondary"
                                      className="text-[10px] px-1.5 py-0"
                                    >
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* ── Pagination ────────────────────────────────────────────── */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Page {page} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
