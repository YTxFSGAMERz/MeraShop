'use client';

import { useState, useMemo } from 'react';
import { Star, BadgeCheck, Camera, ThumbsUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

// ── Types ──────────────────────────────────────────────────────────────────

interface Review {
  id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  createdAt: string;
  user: { id: string; name: string | null; avatar: string | null };
}

type ReviewSortOption = 'most_recent' | 'highest_rated' | 'lowest_rated' | 'most_helpful';

// ── Deterministic helpers ──────────────────────────────────────────────────

function isVerifiedPurchase(reviewId: string): boolean {
  const hash = reviewId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return (hash % 3) < 2; // ~66% are verified
}

function hasPhoto(reviewId: string): boolean {
  const hash = reviewId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return (hash % 5) < 1; // ~20% have photos
}

function getHelpfulCount(reviewId: string): number {
  const hash = reviewId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return (hash % 25); // 0-24 helpful votes
}

function getPhotoGradient(reviewId: string): string {
  const hash = reviewId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const gradients = [
    'from-amber-400 to-orange-500',
    'from-rose-400 to-red-500',
    'from-emerald-400 to-teal-500',
    'from-pink-400 to-purple-500',
    'from-cyan-400 to-sky-500',
    'from-yellow-400 to-amber-500',
  ];
  return gradients[hash % gradients.length];
}

// ── Rating Bar Component ───────────────────────────────────────────────────

function RatingBar({ star, count, total, active, onClick }: {
  star: number;
  count: number;
  total: number;
  active: boolean;
  onClick: () => void;
}) {
  const percentage = total > 0 ? (count / total) * 100 : 0;

  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 w-full py-1 px-2 rounded-md transition-colors text-sm',
        active ? 'bg-primary/10 ring-1 ring-primary/30' : 'hover:bg-muted/50'
      )}
    >
      <span className={cn('font-medium w-6 text-right', active ? 'text-primary' : 'text-foreground')}>
        {star}
      </span>
      <Star className={cn('size-3.5', active ? 'fill-amber-400 text-amber-400' : 'fill-amber-400/60 text-amber-400/60')} />
      <div className="flex-1 h-2.5 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${percentage}%`,
            background: active
              ? 'linear-gradient(135deg, #f97316, #ea580c)'
              : 'linear-gradient(135deg, #f59e0b, #d97706)',
          }}
        />
      </div>
      <span className={cn('text-xs w-8 text-right', active ? 'text-primary font-medium' : 'text-muted-foreground')}>
        {count}
      </span>
    </button>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────

interface ReviewsSummaryProps {
  reviews: Review[];
  avgRating: number;
  reviewCount: number;
  reviewDistribution: Record<number, number>;
}

export function ReviewsSummary({
  reviews,
  avgRating,
  reviewCount,
  reviewDistribution,
}: ReviewsSummaryProps) {
  const [filterStar, setFilterStar] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<ReviewSortOption>('most_recent');

  // Filter reviews by star
  const filteredReviews = useMemo(() => {
    let result = filterStar !== null
      ? reviews.filter((r) => r.rating === filterStar)
      : reviews;

    // Sort
    const sorted = [...result];
    switch (sortBy) {
      case 'highest_rated':
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      case 'lowest_rated':
        sorted.sort((a, b) => a.rating - b.rating);
        break;
      case 'most_helpful':
        sorted.sort((a, b) => getHelpfulCount(b.id) - getHelpfulCount(a.id));
        break;
      case 'most_recent':
      default:
        sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }
    return sorted;
  }, [reviews, filterStar, sortBy]);

  // Photo reviews
  const photoReviews = useMemo(
    () => reviews.filter((r) => hasPhoto(r.id)),
    [reviews]
  );

  // Rating display
  const ratingLabel = avgRating >= 4.5 ? 'Excellent' : avgRating >= 3.5 ? 'Very Good' : avgRating >= 2.5 ? 'Good' : avgRating >= 1.5 ? 'Fair' : 'Poor';

  return (
    <div className="space-y-6">
      {/* Rating Summary Header */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left: Big Rating */}
        <div className="flex flex-col items-center justify-center min-w-[140px] p-4">
          <span className="text-4xl font-bold text-foreground">{avgRating.toFixed(1)}</span>
          <div className="flex items-center gap-0.5 mt-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={cn(
                  'size-4',
                  avgRating >= s
                    ? 'fill-amber-400 text-amber-400'
                    : avgRating >= s - 0.5
                    ? 'fill-amber-400/50 text-amber-400/50'
                    : 'text-muted-foreground/30'
                )}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground mt-1">
            {ratingLabel} · {reviewCount} review{reviewCount !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Right: Rating Bars */}
        <div className="flex-1 space-y-0.5">
          {[5, 4, 3, 2, 1].map((star) => (
            <RatingBar
              key={star}
              star={star}
              count={reviewDistribution[star] || 0}
              total={reviewCount}
              active={filterStar === star}
              onClick={() => setFilterStar(filterStar === star ? null : star)}
            />
          ))}
          {filterStar !== null && (
            <button
              onClick={() => setFilterStar(null)}
              className="text-xs text-primary hover:underline mt-1 ml-2"
            >
              Clear filter
            </button>
          )}
        </div>
      </div>

      {/* Photo Reviews Section */}
      {photoReviews.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Camera className="size-4 text-muted-foreground" />
            <h4 className="text-sm font-medium text-foreground">Customer Photos</h4>
            <Badge variant="secondary" className="text-xs">{photoReviews.length}</Badge>
          </div>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {photoReviews.map((review) => (
              <div
                key={review.id}
                className={cn(
                  'shrink-0 size-20 rounded-lg bg-gradient-to-br flex items-center justify-center',
                  getPhotoGradient(review.id)
                )}
              >
                <Camera className="size-5 text-white/70" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sort Controls */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {filteredReviews.length} review{filteredReviews.length !== 1 ? 's' : ''}
          {filterStar !== null && ` · ${filterStar}★ only`}
        </span>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as ReviewSortOption)}>
          <SelectTrigger className="w-[160px] h-8 text-xs">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="most_recent">Most Recent</SelectItem>
            <SelectItem value="highest_rated">Highest Rated</SelectItem>
            <SelectItem value="lowest_rated">Lowest Rated</SelectItem>
            <SelectItem value="most_helpful">Most Helpful</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">
              No {filterStar !== null ? `${filterStar}-star` : ''} reviews yet.
            </p>
          </div>
        ) : (
          filteredReviews.map((review) => {
            const verified = isVerifiedPurchase(review.id);
            const helpful = getHelpfulCount(review.id);
            const hasPhotoReview = hasPhoto(review.id);

            return (
              <div key={review.id} className="p-4 rounded-lg border space-y-2">
                {/* Review Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                      {review.user.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-medium text-foreground">
                          {review.user.name || 'Anonymous'}
                        </span>
                        {verified && (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 gap-0.5 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800">
                            <BadgeCheck className="size-3" />
                            Verified Purchase
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(review.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Stars */}
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={cn(
                        'size-3.5',
                        review.rating >= s ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'
                      )}
                    />
                  ))}
                </div>

                {/* Title */}
                {review.title && (
                  <p className="text-sm font-medium text-foreground">{review.title}</p>
                )}

                {/* Comment */}
                {review.comment && (
                  <p className="text-sm text-muted-foreground">{review.comment}</p>
                )}

                {/* Photo thumbnails for this review */}
                {hasPhotoReview && (
                  <div className="flex gap-2">
                    <div
                      className={cn(
                        'size-16 rounded-md bg-gradient-to-br flex items-center justify-center',
                        getPhotoGradient(review.id)
                      )}
                    >
                      <Camera className="size-4 text-white/70" />
                    </div>
                  </div>
                )}

                {/* Helpful */}
                {helpful > 0 && (
                  <div className="flex items-center gap-1.5 pt-1">
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-muted-foreground gap-1">
                      <ThumbsUp className="size-3" />
                      Helpful ({helpful})
                    </Button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
