'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, TrendingUp, Sparkles } from 'lucide-react';
import { CategoryCard, type CategoryCardCategory } from '@/components/shop/CategoryCard';
import { CategorySkeleton } from '@/components/shop/LoadingSkeleton';
import { cn } from '@/lib/utils';

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.07,
      duration: 0.4,
      ease: 'easeOut' as const,
    },
  }),
};

// Wave divider SVG component
function WaveDivider() {
  return (
    <div className="relative w-full h-6 md:h-8 overflow-hidden" aria-hidden="true">
      <svg
        className="absolute bottom-0 w-full h-full"
        viewBox="0 0 1440 60"
        preserveAspectRatio="none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0 30C240 0 480 60 720 30C960 0 1200 60 1440 30V60H0V30Z"
          className="fill-primary/5 dark:fill-primary/10"
        />
        <path
          d="M0 40C360 10 720 50 1080 25C1260 12 1350 35 1440 40V60H0V40Z"
          className="fill-primary/3 dark:fill-primary/5"
        />
      </svg>
    </div>
  );
}

// Ornamental line divider
function OrnamentalDivider() {
  return (
    <div className="flex items-center justify-center gap-3 py-2" aria-hidden="true">
      <div className="h-px flex-1 max-w-[80px] bg-gradient-to-r from-transparent to-primary/20" />
      <Sparkles className="size-4 text-primary/30" />
      <div className="h-px flex-1 max-w-[80px] bg-gradient-to-l from-transparent to-primary/20" />
    </div>
  );
}

// Animated counter for product count
function AnimatedCount({ count }: { count: number }) {
  const [displayCount, setDisplayCount] = useState(0);

  useEffect(() => {
    if (count === 0) return;
    const duration = 800;
    const steps = 20;
    const increment = count / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= count) {
        setDisplayCount(count);
        clearInterval(timer);
      } else {
        setDisplayCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [count]);

  return <span>{displayCount}</span>;
}

// 3D Tilt Card wrapper
function TiltCard({ children, className }: { children: React.ReactNode; className?: string }) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / centerY * -8; // max 8deg
    const rotateY = (x - centerX) / centerX * 8; // max 8deg

    card.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
  }, []);

  const handleMouseLeave = useCallback(() => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transform = 'perspective(600px) rotateX(0deg) rotateY(0deg) scale(1)';
  }, []);

  return (
    <div
      ref={cardRef}
      className={cn('transition-transform duration-200 ease-out', className)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  );
}

// Inner component that uses useScroll/useTransform
function CategoryShowcaseContent({ categories }: { categories: CategoryCardCategory[] }) {
  const sectionRef = useRef<HTMLElement>(null);

  // Parallax effect using page scroll (no target ref to avoid SSR hydration error)
  const { scrollYProgress } = useScroll({
    offset: ['start end', 'end start'],
  });
  const parallaxY = useTransform(scrollYProgress, [0, 1], [20, -20]);

  // Determine trending categories (those with the most products)
  const maxProductCount = Math.max(...categories.map(c => c.productCount || 0));
  const trendingThreshold = maxProductCount * 0.6;

  return (
    <>
      <WaveDivider />
      <section ref={sectionRef} className="section-padding relative overflow-hidden" suppressHydrationWarning>
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{ y: parallaxY }}
        >
          <div className="absolute top-0 right-0 w-72 h-72 rounded-full opacity-5 bg-radial-primary"
          />
          <div className="absolute bottom-0 left-0 w-56 h-56 rounded-full opacity-5 bg-radial-primary-light"
          />
        </motion.div>

        <div className="container-shop relative">
          {/* Section Header */}
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              Shop by Category
            </h2>
            <Link
              href="/shop"
              className="text-sm font-medium text-primary hover:text-primary/80 flex items-center gap-1 transition-colors group"
            >
              View All
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          <OrnamentalDivider />

          {/* Category Grid - larger cards on desktop */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-5 lg:gap-6 mt-4">
            {categories.slice(0, 10).map((category, i) => {
              const isTrending = (category.productCount || 0) >= trendingThreshold && trendingThreshold > 0;
              const isNew = (category.productCount || 0) > 0 && (category.productCount || 0) <= 2;

              return (
                <motion.div
                  key={category.id}
                  custom={i}
                  variants={cardVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.1 }}
                  className="relative"
                >
                  {/* Trending badge */}
                  {isTrending && (
                    <div className="absolute -top-1 -right-1 z-20 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider text-white shadow-md bg-saffron-gradient">
                      <TrendingUp className="size-2.5" />
                      Trending
                    </div>
                  )}
                  {/* New badge */}
                  {isNew && !isTrending && (
                    <div className="absolute -top-1 -right-1 z-20 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider text-white shadow-md bg-emerald-500">
                      <Sparkles className="size-2.5" />
                      New
                    </div>
                  )}
                  {/* Product count badge with animated counter */}
                  {category.productCount !== undefined && category.productCount > 0 && (
                    <div className="absolute -top-1 -left-1 z-20 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold text-white shadow-md bg-amber-dark-gradient">
                      <AnimatedCount count={category.productCount} /> items
                    </div>
                  )}
                  {/* 3D Tilt on hover (desktop only) */}
                  <div className="hidden md:block">
                    <TiltCard className="rounded-xl transition-shadow duration-300 hover:shadow-xl hover:shadow-primary/10">
                      <CategoryCard category={category} />
                    </TiltCard>
                  </div>
                  <div className="md:hidden">
                    <div className="rounded-xl transition-shadow duration-300 hover:shadow-xl hover:shadow-primary/10">
                      <CategoryCard category={category} />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* View All Link - Mobile */}
          <div className="mt-4 text-center md:hidden">
            <Link
              href="/shop"
              className="text-sm font-medium text-primary hover:text-primary/80 inline-flex items-center gap-1 transition-colors group"
            >
              View All Categories
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

export function CategoryShowcase() {
  const [categories, setCategories] = useState<CategoryCardCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch('/api/categories');
        if (res.ok) {
          const data = await res.json();
          const mapped: CategoryCardCategory[] = (data.categories || []).map(
            (c: Record<string, unknown>) => ({
              id: c.id as string,
              name: c.name as string,
              slug: c.slug as string,
              image: (c.image as string) || '',
              productCount: (c._count as Record<string, number>)?.products ?? 0,
            })
          );
          setCategories(mapped);
        }
      } catch {
        // Silently fail - empty categories state will show
      } finally {
        setLoading(false);
      }
    }
    fetchCategories();
  }, []);

  if (loading) {
    return (
      <section className="section-padding">
        <div className="container-shop">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              Shop by Category
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <CategorySkeleton key={i} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (categories.length === 0) return null;

  return <CategoryShowcaseContent categories={categories} />;
}
