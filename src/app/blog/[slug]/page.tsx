'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import {
  Calendar,
  User,
  Clock,
  Tag,
  ArrowLeft,
  Share2,
  Facebook,
  Twitter,
  LinkIcon,
  CheckCircle2,
  BookOpen,
} from 'lucide-react';

import { SITE_NAME, SITE_URL } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverImage: string | null;
  category: string | null;
  tags: string[];
  authorName: string | null;
  publishedAt: string | null;
  createdAt: string;
}

interface RelatedPost {
  id: string;
  title: string;
  slug: string;
  coverImage: string | null;
  category: string | null;
  publishedAt: string | null;
}

export default function BlogPostPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<RelatedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchPost() {
      setLoading(true);
      try {
        const res = await fetch(`/api/blog?slug=${slug}`);
        const data = await res.json();
        if (data.post) {
          setPost(data.post);
          // Fetch related posts (same category)
          if (data.post.category) {
            const relRes = await fetch(
              `/api/blog?category=${data.post.category}&limit=3`
            );
            const relData = await relRes.json();
            setRelatedPosts(
              (relData.posts || []).filter(
                (p: RelatedPost) => p.slug !== slug
              )
            );
          }
        }
      } catch (err) {
        console.error('Failed to fetch blog post:', err);
      } finally {
        setLoading(false);
      }
    }
    if (slug) fetchPost();
  }, [slug]);

  function formatDate(dateStr: string | null) {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  function getReadingTime(content: string) {
    const words = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    return `${Math.max(2, Math.ceil(words / 200))} min read`;
  }

  function handleShare() {
    navigator.clipboard.writeText(`${SITE_URL}/blog/${slug}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) {
    return (
      <div className="min-h-screen section-padding">
        <div className="container-shop px-4 md:px-6 lg:px-8 max-w-3xl mx-auto">
          <Skeleton className="h-4 w-48 mb-6" />
          <Skeleton className="h-10 w-3/4 mb-4" />
          <div className="flex gap-3 mb-6">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="aspect-video rounded-lg mb-8" />
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen section-padding">
        <div className="container-shop px-4 md:px-6 lg:px-8 max-w-3xl mx-auto text-center py-20">
          <BookOpen className="size-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Post Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The blog post you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
          <Button asChild>
            <Link href="/blog">
              <ArrowLeft className="size-4 mr-2" />
              Back to Blog
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const shareUrl = `${SITE_URL}/blog/${slug}`;
  const shareText = post.title;

  return (
    <div className="min-h-screen">
      <article>
        {/* ── Breadcrumb ───────────────────────────────────────────────────── */}
        <div className="bg-muted/30 border-b">
          <div className="container-shop px-4 md:px-6 lg:px-8 py-3">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/">Home</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/blog">Blog</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="truncate max-w-[200px]">
                    {post.title}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </div>

        {/* ── Article Header ───────────────────────────────────────────────── */}
        <div className="section-padding">
          <div className="container-shop px-4 md:px-6 lg:px-8 max-w-3xl mx-auto">
            {/* Category */}
            {post.category && (
              <Badge className="mb-4">{post.category}</Badge>
            )}

            {/* Title */}
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold mb-4 leading-tight">
              {post.title}
            </h1>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-6">
              {post.authorName && (
                <span className="flex items-center gap-1.5">
                  <User className="size-4" />
                  {post.authorName}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Calendar className="size-4" />
                {formatDate(post.publishedAt)}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="size-4" />
                {getReadingTime(post.content)}
              </span>
            </div>

            {/* Cover Image */}
            {post.coverImage && (
              <div className="relative aspect-video rounded-lg overflow-hidden mb-8">
                <Image
                  src={post.coverImage}
                  alt={post.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 720px"
                  priority
                />
              </div>
            )}

            {/* Share Buttons */}
            <div className="flex items-center gap-2 mb-8">
              <span className="text-sm text-muted-foreground mr-1">
                Share:
              </span>
              <Button
                variant="outline"
                size="icon"
                className="size-8"
                asChild
              >
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Share on Facebook"
                >
                  <Facebook className="size-3.5" />
                </a>
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="size-8"
                asChild
              >
                <a
                  href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Share on Twitter"
                >
                  <Twitter className="size-3.5" />
                </a>
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="size-8"
                onClick={handleShare}
                aria-label="Copy link"
              >
                {copied ? (
                  <CheckCircle2 className="size-3.5 text-green-500" />
                ) : (
                  <LinkIcon className="size-3.5" />
                )}
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="size-8"
                asChild
              >
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Share on WhatsApp"
                >
                  <Share2 className="size-3.5" />
                </a>
              </Button>
            </div>

            {/* Article Content */}
            <div
              className="prose prose-sm md:prose-base max-w-none dark:prose-invert prose-headings:font-bold prose-a:text-primary prose-img:rounded-lg"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Tags */}
            {post.tags?.length > 0 && (
              <div className="mt-8 pt-6 border-t">
                <div className="flex items-center gap-2 flex-wrap">
                  <Tag className="size-4 text-muted-foreground" />
                  {post.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Author Bio */}
            {post.authorName && (
              <Card className="mt-8">
                <CardContent className="p-6 flex items-start gap-4">
                  <div className="size-14 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-lg font-bold text-primary">
                      {post.authorName
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold">{post.authorName}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Content writer at {SITE_NAME}. Passionate about helping
                      Indian shoppers make informed decisions with guides,
                      tips, and reviews.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            <Separator className="my-8" />

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
              <div>
                <h3 className="text-lg font-bold mb-4">Related Articles</h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {relatedPosts.map((relPost) => (
                    <Link
                      key={relPost.id}
                      href={`/blog/${relPost.slug}`}
                      className="block"
                    >
                      <Card className="overflow-hidden h-full hover:shadow-md transition-shadow">
                        <div className="relative aspect-video bg-muted">
                          {relPost.coverImage ? (
                            <Image
                              src={relPost.coverImage}
                              alt={relPost.title}
                              fill
                              className="object-cover"
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <BookOpen className="size-6 text-muted-foreground/50" />
                            </div>
                          )}
                        </div>
                        <CardContent className="p-3">
                          {relPost.category && (
                            <Badge
                              variant="secondary"
                              className="text-[10px] mb-1.5"
                            >
                              {relPost.category}
                            </Badge>
                          )}
                          <h4 className="font-semibold text-sm line-clamp-2">
                            {relPost.title}
                          </h4>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Back to Blog */}
            <div className="mt-8 text-center">
              <Button variant="outline" asChild>
                <Link href="/blog">
                  <ArrowLeft className="size-4 mr-2" />
                  Back to Blog
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
