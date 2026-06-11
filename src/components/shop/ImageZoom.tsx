'use client';

import { useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

// ── Types ──────────────────────────────────────────────────────────────────

interface ImageZoomProps {
  src: string;
  alt: string;
  className?: string;
}

// ── Desktop Zoom Constants ─────────────────────────────────────────────────

const ZOOM_FACTOR = 2;
const LENS_SIZE = 160; // px

// ── Component ──────────────────────────────────────────────────────────────

export function ImageZoom({ src, alt, className }: ImageZoomProps) {
  const isMobile = useIsMobile();
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Desktop state
  const [isHovering, setIsHovering] = useState(false);
  const [lensPosition, setLensPosition] = useState({ x: 0, y: 0 });
  const [backgroundPosition, setBackgroundPosition] = useState({ x: 0, y: 0 });

  // Mobile pinch state
  const [mobileScale, setMobileScale] = useState(1);
  const [mobileTranslate, setMobileTranslate] = useState({ x: 0, y: 0 });
  const lastTouchDistance = useRef<number | null>(null);
  const lastTouchCenter = useRef<{ x: number; y: number } | null>(null);
  const doubleTapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTapTime = useRef<number>(0);

  // ── Desktop: Mouse handlers ────────────────────────────────────────────

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (isMobile || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Lens position (centered on cursor, clamped to container bounds)
      const lensHalf = LENS_SIZE / 2;
      const lensX = Math.max(0, Math.min(x - lensHalf, rect.width - LENS_SIZE));
      const lensY = Math.max(0, Math.min(y - lensHalf, rect.height - LENS_SIZE));

      setLensPosition({ x: lensX, y: lensY });

      // Background position for zoomed view
      const bgX = (x / rect.width) * 100;
      const bgY = (y / rect.height) * 100;
      setBackgroundPosition({ x: bgX, y: bgY });
    },
    [isMobile],
  );

  const handleMouseEnter = useCallback(() => {
    if (!isMobile) setIsHovering(true);
  }, [isMobile]);

  const handleMouseLeave = useCallback(() => {
    if (!isMobile) setIsHovering(false);
  }, [isMobile]);

  // ── Mobile: Touch/pinch handlers ──────────────────────────────────────

  const getTouchDistance = (touches: TouchList): number => {
    if (touches.length < 2) return 0;
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const getTouchCenter = (touches: TouchList): { x: number; y: number } => {
    if (touches.length < 2) return { x: 0, y: 0 };
    return {
      x: (touches[0].clientX + touches[1].clientX) / 2,
      y: (touches[0].clientY + touches[1].clientY) / 2,
    };
  };

  const handleTouchStart = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      if (!isMobile) return;

      // Double-tap detection
      const now = Date.now();
      if (now - lastTapTime.current < 300) {
        // Double tap: reset zoom
        setMobileScale(1);
        setMobileTranslate({ x: 0, y: 0 });
        lastTouchDistance.current = null;
        lastTouchCenter.current = null;
        lastTapTime.current = 0;
        return;
      }
      lastTapTime.current = now;

      if (e.touches.length === 2) {
        lastTouchDistance.current = getTouchDistance(e.touches);
        lastTouchCenter.current = getTouchCenter(e.touches);
      }
    },
    [isMobile],
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      if (!isMobile) return;

      if (e.touches.length === 2) {
        e.preventDefault();
        const currentDistance = getTouchDistance(e.touches);
        const currentCenter = getTouchCenter(e.touches);

        if (lastTouchDistance.current !== null && lastTouchDistance.current > 0) {
          const scaleDelta = currentDistance / lastTouchDistance.current;
          setMobileScale((prev) => Math.max(1, Math.min(prev * scaleDelta, 4)));

          // Pan with pinch center
          if (lastTouchCenter.current) {
            const dx = currentCenter.x - lastTouchCenter.current.x;
            const dy = currentCenter.y - lastTouchCenter.current.y;
            setMobileTranslate((prev) => ({
              x: prev.x + dx,
              y: prev.y + dy,
            }));
          }
        }

        lastTouchDistance.current = currentDistance;
        lastTouchCenter.current = currentCenter;
      }
    },
    [isMobile],
  );

  const handleTouchEnd = useCallback(() => {
    lastTouchDistance.current = null;
    lastTouchCenter.current = null;
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative aspect-square overflow-hidden rounded-xl bg-muted border border-border/50 select-none',
        !isMobile && 'cursor-zoom-in',
        className,
      )}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={
        isMobile
          ? {
              touchAction: mobileScale > 1 ? 'none' : 'pan-y',
            }
          : undefined
      }
    >
      {/* Main Image */}
      <Image
        ref={imageRef}
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 1024px) 100vw, 50vw"
        className="object-contain p-4 transition-transform duration-200 ease-out pointer-events-none"
        style={
          isMobile
            ? {
                transform: `scale(${mobileScale}) translate(${mobileTranslate.x / mobileScale}px, ${mobileTranslate.y / mobileScale}px)`,
              }
            : undefined
        }
        draggable={false}
      />

      {/* Desktop: Zoom Lens */}
      {!isMobile && isHovering && (
        <>
          {/* Lens overlay on the image */}
          <div
            className="absolute pointer-events-none border-2 border-primary/50 rounded-md shadow-lg"
            style={{
              width: LENS_SIZE,
              height: LENS_SIZE,
              left: lensPosition.x,
              top: lensPosition.y,
              backgroundColor: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(1px)',
            }}
          />

          {/* Zoomed result - floating panel to the right */}
          <div
            className="absolute top-0 right-0 w-1/2 h-full bg-white dark:bg-zinc-900 border-l border-border/50 shadow-2xl z-20 pointer-events-none overflow-hidden"
            style={{
              backgroundImage: `url(${src})`,
              backgroundRepeat: 'no-repeat',
              backgroundSize: `${ZOOM_FACTOR * 100}%`,
              backgroundPosition: `${backgroundPosition.x}% ${backgroundPosition.y}%`,
            }}
          />
        </>
      )}

      {/* Mobile: Zoom indicator */}
      {isMobile && mobileScale > 1 && (
        <div className="absolute top-2 right-2 z-10 bg-background/80 backdrop-blur-sm rounded-full px-2 py-1 text-xs font-medium text-foreground">
          {Math.round(mobileScale * 100)}%
        </div>
      )}

      {/* Mobile: Hint to pinch zoom */}
      {isMobile && mobileScale === 1 && (
        <div className="absolute bottom-2 right-2 z-10 bg-background/60 backdrop-blur-sm rounded-full px-2 py-1 text-[10px] text-muted-foreground">
          Pinch to zoom
        </div>
      )}
    </div>
  );
}
