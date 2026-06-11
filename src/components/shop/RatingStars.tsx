'use client';

import { Star, StarHalf } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RatingStarsProps {
  rating: number;
  reviewCount?: number;
  size?: 'sm' | 'md';
}

export function RatingStars({ rating, reviewCount, size = 'sm' }: RatingStarsProps) {
  const stars = [];
  const iconSize = size === 'sm' ? 'size-3' : 'size-4';
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm';

  for (let i = 1; i <= 5; i++) {
    if (rating >= i) {
      stars.push(
        <Star
          key={i}
          className={cn('fill-amber-400 text-amber-400', iconSize)}
        />
      );
    } else if (rating >= i - 0.5) {
      stars.push(
        <StarHalf
          key={i}
          className={cn('fill-amber-400 text-amber-400', iconSize)}
        />
      );
    } else {
      stars.push(
        <Star
          key={i}
          className={cn('text-muted-foreground/30', iconSize)}
        />
      );
    }
  }

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5">{stars}</div>
      {reviewCount !== undefined && (
        <span className={cn('text-muted-foreground', textSize)}>
          ({reviewCount})
        </span>
      )}
    </div>
  );
}
