'use client';

import { formatINR, calcDiscountPercent } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface PriceDisplayProps {
  price: number;
  salePrice?: number;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: {
    sale: 'text-sm',
    mrp: 'text-xs',
    badge: 'text-[10px] px-1.5 py-0.5',
  },
  md: {
    sale: 'text-base',
    mrp: 'text-sm',
    badge: 'text-xs px-2 py-0.5',
  },
  lg: {
    sale: 'text-xl',
    mrp: 'text-base',
    badge: 'text-sm px-2.5 py-0.5',
  },
};

export function PriceDisplay({ price, salePrice, size = 'md' }: PriceDisplayProps) {
  const discount = calcDiscountPercent(price, salePrice);
  const sizes = sizeMap[size];
  const effectivePrice = salePrice ?? price;
  const hasSale = salePrice !== undefined && salePrice < price;

  return (
    <div className="flex items-baseline flex-wrap gap-1.5">
      <span className={cn('font-bold text-price', sizes.sale)}>
        {formatINR(effectivePrice)}
      </span>
      {hasSale && (
        <>
          <span className={cn('price-strike', sizes.mrp)}>
            {formatINR(price)}
          </span>
          <span className={cn('discount-badge', sizes.badge)}>
            {discount}% off
          </span>
        </>
      )}
    </div>
  );
}
