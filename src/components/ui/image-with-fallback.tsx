'use client';

import { useEffect, useState } from 'react';
import Image, { ImageProps } from 'next/image';

export const FALLBACK_SVG = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300' viewBox='0 0 300 300'><rect width='300' height='300' fill='%23f3f4f6'/><g transform='translate(138, 138)' fill='none' stroke='%239ca3af' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><rect x='1' y='1' width='22' height='22' rx='2' ry='2'/><circle cx='8' cy='8' r='1.5'/><polyline points='23 15 16 10 3 23'/></g></svg>";

interface ImageWithFallbackProps extends Omit<ImageProps, 'onError'> {
  fallbackSrc?: string;
}

export function ImageWithFallback({ src, alt, fallbackSrc = FALLBACK_SVG, ...props }: ImageWithFallbackProps) {
  const [error, setError] = useState(false);

  useEffect(() => {
    setError(false);
  }, [src]);

  return (
    <Image
      src={error || !src ? fallbackSrc : src}
      alt={alt}
      onError={() => setError(true)}
      {...props}
    />
  );
}
