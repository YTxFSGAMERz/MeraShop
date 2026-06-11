import { Skeleton } from '@/components/ui/skeleton';

export function ProductCardSkeleton() {
  return (
    <div className="card-product">
      {/* Image skeleton */}
      <div className="relative aspect-square">
        <Skeleton className="absolute inset-0 rounded-none" />
      </div>
      {/* Content skeleton */}
      <div className="p-3 space-y-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-4 w-14" />
          <Skeleton className="h-4 w-12" />
        </div>
        <div className="flex items-center gap-1">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-8" />
        </div>
        <Skeleton className="h-9 w-full rounded-md" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function CategorySkeleton() {
  return (
    <div className="rounded-xl overflow-hidden">
      <Skeleton className="aspect-[4/3] rounded-none" />
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="w-full">
      <Skeleton className="h-48 md:h-64 lg:h-80 w-full rounded-none" />
    </div>
  );
}

// ── Product Detail Page Skeleton ────────────────────────────────────────────

export function ProductDetailSkeleton() {
  return (
    <div className="container-shop px-4 md:px-6 lg:px-8 py-6">
      {/* Breadcrumb skeleton */}
      <Skeleton className="h-4 w-64 mb-6" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
        {/* Left: Image gallery skeleton */}
        <div className="space-y-4">
          {/* Main image */}
          <Skeleton className="aspect-square w-full rounded-xl" />
          {/* Thumbnail strip - 4 thumbnails */}
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="size-16 md:size-20 rounded-lg shrink-0" />
            ))}
          </div>
        </div>

        {/* Right: Product details skeleton */}
        <div className="space-y-4">
          {/* Brand */}
          <Skeleton className="h-4 w-24" />
          {/* Title */}
          <Skeleton className="h-8 w-3/4" />
          {/* Rating */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-16" />
          </div>
          {/* Price with discount */}
          <div className="space-y-1">
            <div className="flex items-baseline gap-3">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-16" />
            </div>
            <Skeleton className="h-3 w-28" />
          </div>
          {/* Variant selector row 1 - pill shapes */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-9 w-20 rounded-full" />
              ))}
            </div>
          </div>
          {/* Variant selector row 2 - pill shapes */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-12" />
            <div className="flex gap-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-10 w-14 rounded-md" />
              ))}
            </div>
          </div>
          {/* Description lines */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          {/* Action buttons side by side */}
          <div className="flex gap-3">
            <Skeleton className="h-12 flex-1 rounded-md" />
            <Skeleton className="h-12 flex-1 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Checkout Page Skeleton ──────────────────────────────────────────────────

export function CheckoutSkeleton() {
  return (
    <div className="container-shop section-padding">
      {/* Step indicator skeleton */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center gap-2">
            <Skeleton className="size-8 rounded-full" />
            <Skeleton className="h-4 w-20 hidden sm:block" />
            {step < 3 && <Skeleton className="h-0.5 w-8 sm:w-16" />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Form fields skeleton */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section title */}
          <Skeleton className="h-6 w-40" />

          {/* Address form fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
          </div>

          {/* State dropdown */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>

          {/* Pincode */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-full sm:w-48 rounded-md" />
          </div>
        </div>

        {/* Right: Order summary sidebar skeleton */}
        <div className="lg:col-span-1">
          <div className="rounded-lg border p-4 space-y-4 sticky top-24">
            <Skeleton className="h-6 w-28" />

            {/* Cart items */}
            {[1, 2].map((i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="size-16 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            ))}

            {/* Price lines */}
            <div className="space-y-2 pt-2 border-t">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-12" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-4 w-14" />
                <Skeleton className="h-4 w-12" />
              </div>
            </div>

            {/* Total */}
            <div className="flex justify-between pt-2 border-t">
              <Skeleton className="h-5 w-12" />
              <Skeleton className="h-5 w-24" />
            </div>
          </div>
        </div>
      </div>

      {/* Payment options skeleton */}
      <div className="mt-8 space-y-4">
        <Skeleton className="h-6 w-36" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-16 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Profile Page Skeleton ───────────────────────────────────────────────────

export function ProfileSkeleton() {
  return (
    <div className="container-shop section-padding">
      {/* Avatar + name + email */}
      <div className="flex items-center gap-4 mb-8">
        <Skeleton className="size-20 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>

      {/* Stats cards - 4 cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-lg border p-4 space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>

      {/* Recent orders - 3 items */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-32" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-lg border p-4">
            <div className="flex items-center justify-between mb-3">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
            <div className="flex gap-3">
              <Skeleton className="size-14 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-2/3" />
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
