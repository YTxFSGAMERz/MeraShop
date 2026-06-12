'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ImageWithFallback } from '@/components/ui/image-with-fallback';
import Autoplay from 'embla-carousel-autoplay';
import { motion } from 'framer-motion';
import { ShoppingBag, ChevronLeft, ChevronRight, Sparkles, Zap, Percent, Clock, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  type CarouselApi,
} from '@/components/ui/carousel';
import { cn } from '@/lib/utils';
import { HeroSkeleton } from '@/components/shop/LoadingSkeleton';

interface BannerSlide {
  id: string;
  headline: string;
  subtitle: string;
  cta: string;
  image: string;
  gradient: string;
  isImageUrl: boolean;
}

const FALLBACK_SLIDES: BannerSlide[] = [
  {
    id: '1',
    headline: 'Grand Indian Sale! Up to 70% Off',
    subtitle: 'Shop the biggest sale of the season on electronics, fashion & more',
    cta: 'Shop Now',
    image: 'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=800&q=80',
    gradient: 'from-orange-500/20 via-amber-500/10 to-transparent',
    isImageUrl: true,
  },
  {
    id: '2',
    headline: 'New Arrivals in Fashion',
    subtitle: 'Explore the latest trends in ethnic wear, western & accessories',
    cta: 'Explore Fashion',
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&q=80',
    gradient: 'from-pink-500/20 via-rose-500/10 to-transparent',
    isImageUrl: true,
  },
  {
    id: '3',
    headline: 'Electronics Festival - Best Deals',
    subtitle: 'Smartphones, laptops & gadgets at unbeatable prices',
    cta: 'View Electronics',
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&q=80',
    gradient: 'from-blue-500/20 via-cyan-500/10 to-transparent',
    isImageUrl: true,
  },
];

function isValidUrl(str: string): boolean {
  try {
    const url = new URL(str);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

const GRADIENT_STYLES = [
  'linear-gradient(135deg, #f97316 0%, #f59e0b 50%, #ef4444 100%)',
  'linear-gradient(135deg, #ec4899 0%, #8b5cf6 50%, #6366f1 100%)',
  'linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #8b5cf6 100%)',
  'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
  'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
];

const DECORATIVE_ICONS = [Sparkles, Zap, Percent];

// Urgency countdown: sale ends in ~2 days 14 hours from now (static on mount)
function useSaleCountdown() {
  const [timeLeft, setTimeLeft] = useState({ days: 2, hours: 14, minutes: 0, seconds: 0 });
  const targetRef = useRef<Date | null>(null);

  useEffect(() => {
    if (!targetRef.current) {
      const target = new Date();
      target.setDate(target.getDate() + 2);
      target.setHours(target.getHours() + 14);
      targetRef.current = target;
    }
    const interval = setInterval(() => {
      const now = new Date();
      const diff = targetRef.current!.getTime() - now.getTime();
      if (diff <= 0) {
        clearInterval(interval);
        return;
      }
      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft({ days: d, hours: h, minutes: m, seconds: s });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return timeLeft;
}

// Animation variants for staggered entrance
const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const headlineVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

const subtitleVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

const ctaVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
};

const imageVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

export function HeroBanner() {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const [slides, setSlides] = useState<BannerSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [scrollY, setScrollY] = useState(0);
  const initialized = useRef(false);
  const saleCountdown = useSaleCountdown();

  // Parallax scroll tracking
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    async function fetchBanners() {
      try {
        const res = await fetch('/api/banners?position=hero');
        if (res.ok) {
          const data = await res.json();
          if (data.banners && data.banners.length > 0) {
            const mapped: BannerSlide[] = data.banners.map((b: Record<string, unknown>, idx: number) => {
              const imageUrl = (b.image as string) || '';
              const isImg = isValidUrl(imageUrl);
              return {
                id: b.id as string,
                headline: (b.title as string) || 'Special Offer!',
                subtitle: (b.subtitle as string) || 'Discover amazing deals on MeraShop',
                cta: (b.linkText as string) || 'Shop Now',
                image: isImg ? imageUrl : '',
                gradient: FALLBACK_SLIDES[idx % FALLBACK_SLIDES.length].gradient,
                isImageUrl: isImg,
              };
            });
            setSlides(mapped);
          } else {
            setSlides(FALLBACK_SLIDES);
          }
        } else {
          setSlides(FALLBACK_SLIDES);
        }
      } catch {
        setSlides(FALLBACK_SLIDES);
      } finally {
        setLoading(false);
      }
    }
    fetchBanners();
  }, []);

  const handleApiInit = useCallback((carouselApi: CarouselApi) => {
    setApi(carouselApi);
    if (carouselApi && !initialized.current) {
      initialized.current = true;
      setCurrent(carouselApi.selectedScrollSnap());
      setCount(carouselApi.scrollSnapList().length);
    }
  }, []);

  useEffect(() => {
    if (!api) return;
    const handler = () => {
      setCurrent(api.selectedScrollSnap());
      setCount(api.scrollSnapList().length);
    };
    api.on('select', handler);
    api.on('reInit', handler);
    return () => {
      api.off('select', handler);
      api.off('reInit', handler);
    };
  }, [api]);

  if (loading) {
    return <HeroSkeleton />;
  }

  const displaySlides = slides.length > 0 ? slides : FALLBACK_SLIDES;

  return (
    <section className="relative overflow-hidden" suppressHydrationWarning>
      {/* Rich saffron/amber gradient background */}
      <div className="absolute inset-0 bg-hero-light" />
      <div className="absolute inset-0 dark:hidden bg-hero-fade" />
      {/* Dark mode handled by .dark .bg-hero-light in CSS */}

      {/* Indian pattern overlay */}
      <div className="absolute inset-0 indian-pattern-overlay opacity-60" />

      {/* Animated gradient shimmer overlay */}
      <div className="absolute inset-0 opacity-20 animate-shimmer bg-shimmer-overlay-hero" />

      {/* Floating decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {/* Large floating circle */}
        <div
          className="absolute -top-16 -right-16 w-64 h-64 rounded-full opacity-10 bg-radial-orange animate-float-6"
        />
        {/* Small floating circle */}
        <div
          className="absolute top-1/4 -left-8 w-32 h-32 rounded-full opacity-8 bg-radial-amber animate-float-slow-8"
        />
        {/* Sparkle dot 1 */}
        <div
          className="absolute top-1/3 right-1/4 w-2 h-2 rounded-full bg-amber-400/30 animate-float-4"
        />
        {/* Sparkle dot 2 */}
        <div
          className="absolute bottom-1/3 left-1/3 w-1.5 h-1.5 rounded-full bg-orange-400/25 animate-float-slow-5"
        />
        {/* Large subtle star */}
        <Star className="absolute top-[15%] right-[10%] size-6 text-amber-500/15 animate-float-7" />
        <Sparkles className="absolute bottom-[20%] left-[15%] size-5 text-orange-500/15 animate-float-slow-6" />
      </div>

      <Carousel
        setApi={handleApiInit}
        opts={{
          align: 'start',
          loop: true,
        }}
        plugins={[
          Autoplay({
            delay: 5000,
            stopOnInteraction: true,
            stopOnMouseEnter: true,
          }),
        ]}
        className="w-full relative"
      >
        <CarouselContent>
          {displaySlides.map((slide, index) => {
            const DecorativeIcon = DECORATIVE_ICONS[index % DECORATIVE_ICONS.length];
            return (
              <CarouselItem key={slide.id}>
                <div className="container-shop px-4 md:px-6 lg:px-8 py-8 md:py-16 lg:py-24">
                  <div className="flex flex-col md:flex-row items-center gap-6 md:gap-12">
                    {/* Text Content with staggered animations */}
                    <motion.div
                      className="flex-1 text-center md:text-left order-2 md:order-1"
                      variants={containerVariants}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true, amount: 0.3 }}
                      key={`text-${slide.id}`}
                    >
                      {/* Urgency countdown badge */}
                      <motion.div
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass mb-4 text-sm font-semibold"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.4 }}
                      >
                        <Clock className="size-3.5 text-red-500 dark:text-red-400" />
                        <span className="text-red-600 dark:text-red-400">Sale Ends in</span>
                        <span className="tabular-nums font-bold text-foreground">
                          {saleCountdown.days}d {saleCountdown.hours}h {saleCountdown.minutes}m
                        </span>
                      </motion.div>

                      <motion.h1
                        className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-extrabold leading-tight mb-3 md:mb-4"
                        variants={headlineVariants}
                      >
                        <span className="gradient-text">{slide.headline}</span>
                      </motion.h1>
                      <motion.p
                        className="text-sm md:text-base lg:text-lg text-muted-foreground mb-5 md:mb-6 max-w-lg mx-auto md:mx-0"
                        variants={subtitleVariants}
                      >
                        {slide.subtitle}
                      </motion.p>
                      <motion.div
                        className="flex flex-wrap gap-3 justify-center md:justify-start"
                        variants={ctaVariants}
                      >
                        <Button
                          size="lg"
                          className="font-semibold text-base px-8 transition-transform active:scale-95 shadow-lg hover:shadow-xl text-white border-0 bg-saffron-gradient"
                        >
                          <ShoppingBag className="size-4 mr-2" />
                          {slide.cta}
                        </Button>
                        <Button
                          size="lg"
                          variant="outline"
                          className="font-semibold transition-transform active:scale-95 glass hover:bg-white/80 dark:hover:bg-white/10"
                        >
                          View All Deals
                        </Button>
                      </motion.div>
                    </motion.div>

                    {/* Decorative Image with glass frame + parallax effect */}
                    <motion.div
                      className="flex-1 order-1 md:order-2 w-full max-w-xs md:max-w-md lg:max-w-lg"
                      variants={imageVariants}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true, amount: 0.3 }}
                    >
                      <div
                        className="relative aspect-[4/3] md:aspect-square rounded-2xl overflow-hidden will-change-transform"
                        style={{
                          transform: `translateY(${Math.min(scrollY * 0.04, 20)}px)`,
                          boxShadow: '0 25px 50px -12px oklch(0.7 0.18 65 / 25%), 0 12px 24px -8px oklch(0 0 0 / 15%)',
                          border: '1px solid rgba(255, 255, 255, 0.4)',
                        }}
                      >
                        {/* Glass frame effect */}
                        <div className="absolute inset-0 z-20 pointer-events-none" style={{ boxShadow: 'inset 0 0 30px rgba(255, 255, 255, 0.1)' }} />

                        {slide.isImageUrl && slide.image ? (
                          <ImageWithFallback
                            src={slide.image}
                            alt={slide.headline}
                            fill
                            sizes="(max-width: 768px) 80vw, 40vw"
                            className="object-cover"
                            priority={index === 0}
                          />
                        ) : (
                          /* Decorative gradient background with icon when no valid image URL */
                          <div
                            className="absolute inset-0 flex items-center justify-center"
                            style={{ background: GRADIENT_STYLES[index % GRADIENT_STYLES.length] }}
                            suppressHydrationWarning
                          >
                            <div className="text-white/90 text-center">
                              <DecorativeIcon className="size-16 md:size-20 mx-auto mb-3 opacity-80" />
                              <p className="text-lg md:text-xl font-bold opacity-90">{slide.headline}</p>
                            </div>
                          </div>
                        )}
                        <div className={cn(
                          'absolute inset-0 bg-gradient-to-t transition-opacity duration-700',
                          slide.gradient
                        )} />
                      </div>
                    </motion.div>
                  </div>
                </div>
              </CarouselItem>
            );
          })}
        </CarouselContent>

        {/* Desktop side arrows */}
        <CarouselPrevious className="hidden md:flex -left-4 lg:left-0 size-10 glass border-white/20 hover:bg-white/80 dark:hover:bg-white/10 transition-all" />
        <CarouselNext className="hidden md:flex -right-4 lg:right-0 size-10 glass border-white/20 hover:bg-white/80 dark:hover:bg-white/10 transition-all" />

        {/* Mobile arrows */}
        <div className="md:hidden absolute bottom-4 right-4 flex gap-2">
          <Button
            variant="outline"
            size="icon"
            className="size-8 rounded-full glass border-white/20"
            onClick={() => api?.scrollPrev()}
          >
            <ChevronLeft className="size-4" />
            <span className="sr-only">Previous</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-8 rounded-full glass border-white/20"
            onClick={() => api?.scrollNext()}
          >
            <ChevronRight className="size-4" />
            <span className="sr-only">Next</span>
          </Button>
        </div>
      </Carousel>

      {/* Dot Indicators */}
      <div className="flex justify-center gap-2 pb-4 md:pb-6 relative">
        {Array.from({ length: count || displaySlides.length }).map((_, i) => (
          <button
            key={i}
            className={cn(
              'h-2 rounded-full transition-all duration-300',
              i === current
                ? 'w-6 bg-orange-500 dark:bg-orange-400'
                : 'w-2 bg-orange-500/30 dark:bg-orange-400/30 hover:bg-orange-500/50 dark:hover:bg-orange-400/50'
            )}
            onClick={() => api?.scrollTo(i)}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
