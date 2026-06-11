'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Sparkles, Star, Zap, ShoppingBag, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatINR } from '@/lib/constants';

// ── Deal highlights data ──────────────────────────────────────────────────────
interface DealHighlight {
  id: string;
  name: string;
  originalPrice: number;
  salePrice: number;
  discount: number;
  image: string;
}

const DEAL_HIGHLIGHTS: DealHighlight[] = [
  {
    id: '1',
    name: 'Wireless Earbuds Pro',
    originalPrice: 4999,
    salePrice: 1499,
    discount: 70,
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=120&q=80',
  },
  {
    id: '2',
    name: 'Smart Watch Ultra',
    originalPrice: 12999,
    salePrice: 3999,
    discount: 69,
    image: 'https://images.unsplash.com/photo-1546868871-af0de0ae72be?w=120&q=80',
  },
  {
    id: '3',
    name: 'Running Shoes Air',
    originalPrice: 5999,
    salePrice: 1799,
    discount: 70,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=120&q=80',
  },
];

// ── Countdown hook ────────────────────────────────────────────────────────────
function useFlashCountdown() {
  const getTargetTime = useCallback(() => {
    const now = new Date();
    const target = new Date(now);
    target.setHours(23, 59, 59, 999);
    return target;
  }, []);

  const [targetTime] = useState(getTargetTime);
  const [mounted, setMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Intentional: mark client-side mount for hydration guard
    setMounted(true);
    // Calculate initial time immediately
    const now = new Date();
    const diff = targetTime.getTime() - now.getTime();
    if (diff > 0) {
      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft({ hours: h, minutes: m, seconds: s });
    }

    const interval = setInterval(() => {
      const now = new Date();
      const diff = targetTime.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ hours: h, minutes: m, seconds: s });
    }, 1000);

    return () => clearInterval(interval);
  }, [targetTime]);

  return { timeLeft, mounted };
}

// ── Flip timer digit with glass-morphism ──────────────────────────────────────
function GlassDigit({ value }: { value: number }) {
  return (
    <div
      className="glass-digit relative min-w-[40px] md:min-w-[52px] text-center rounded-lg md:rounded-xl overflow-hidden"
    >
      <AnimatePresence mode="popLayout">
        <motion.span
          key={value}
          initial={{ rotateX: -90, opacity: 0 }}
          animate={{ rotateX: 0, opacity: 1 }}
          exit={{ rotateX: 90, opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="inline-block tabular-nums font-black text-xl md:text-3xl text-white py-1.5 md:py-2 [backface-visibility:hidden]"
          style={{ perspective: '200px' }}
        >
          {String(value).padStart(2, '0')}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

// ── Deal highlight card ───────────────────────────────────────────────────────
function DealCard({ deal }: { deal: DealHighlight }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="glass-white-12 flex items-center gap-3 rounded-xl px-3 py-2 md:px-4 md:py-3"
    >
      <div className="size-10 md:size-14 rounded-lg overflow-hidden shrink-0 bg-white/10">
        <img
          src={deal.image}
          alt={deal.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-white font-semibold text-xs md:text-sm truncate">{deal.name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-white font-bold text-sm md:text-base">{formatINR(deal.salePrice)}</span>
          <span className="text-white/50 text-[10px] md:text-xs line-through">{formatINR(deal.originalPrice)}</span>
          <span
            className="bg-amber-gradient text-[10px] md:text-xs font-bold px-1.5 py-0.5 rounded"
          >
            {deal.discount}% OFF
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// ── Main FlashSaleBanner Component ────────────────────────────────────────────
export function FlashSaleBanner() {
  const { timeLeft, mounted } = useFlashCountdown();
  const [currentDeal, setCurrentDeal] = useState(0);

  // Auto-rotate deals every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDeal((prev) => (prev + 1) % DEAL_HIGHLIGHTS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const deal = useMemo(() => DEAL_HIGHLIGHTS[currentDeal], [currentDeal]);

  return (
    <section className="relative overflow-hidden" aria-label="Flash Sale" suppressHydrationWarning>
      {/* ── Red/orange gradient background ──────────────────────────────── */}
      <div
        className="bg-flash-sale absolute inset-0"
      />

      {/* ── Indian pattern overlay ─────────────────────────────────────── */}
      <div className="absolute inset-0 indian-pattern-overlay opacity-30" />

      {/* ── Shimmer overlay ────────────────────────────────────────────── */}
      <div
        className="bg-shimmer-overlay absolute inset-0 opacity-15 animate-shimmer"
      />

      {/* ── Floating decorative elements ───────────────────────────────── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div
          className="bg-radial-gold animate-float-6 absolute -top-8 -right-8 w-40 h-40 rounded-full opacity-10"
        />
        <div
          className="bg-radial-gold animate-float-slow-8 absolute bottom-0 -left-12 w-48 h-48 rounded-full opacity-10"
        />
        <Star
          className="animate-float-5 absolute top-[15%] left-[8%] size-5 md:size-7 text-yellow-300/20"
        />
        <Sparkles
          className="animate-float-slow-6 absolute top-[25%] right-[12%] size-4 md:size-6 text-yellow-300/20"
        />
        <Zap
          className="animate-float-7 absolute bottom-[20%] left-[20%] size-4 md:size-5 text-yellow-300/15"
        />
        <Star
          className="animate-float-slow-4 absolute bottom-[15%] right-[18%] size-3 md:size-4 text-yellow-300/15"
        />
        {/* Extra sparkle dots */}
        <div className="animate-float-3 absolute top-[40%] right-[5%] w-1.5 h-1.5 rounded-full bg-yellow-300/25" />
        <div className="animate-float-slow-4 absolute top-[60%] left-[5%] w-1 h-1 rounded-full bg-yellow-300/20" />
      </div>

      {/* ── Content ────────────────────────────────────────────────────── */}
      <div className="container-shop px-4 md:px-6 lg:px-8 py-6 md:py-10 relative">
        <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-10">
          {/* Left: Text + Timer */}
          <div className="flex-1 text-center lg:text-left">
            {/* Badge */}
            <motion.div
              className="glass-white-15 inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-3"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
            >
              <Flame className="size-4 text-yellow-300" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">Limited Time</span>
            </motion.div>

            {/* MEGA SALE text with shimmer */}
            <motion.h2
              className="text-3xl md:text-5xl lg:text-6xl font-black leading-none mb-2"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5, ease: 'easeOut' }}
            >
              <span className="shimmer-text-white">
                MEGA SALE
              </span>
            </motion.h2>

            {/* Up to 70% OFF with animated text */}
            <motion.div
              className="mb-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.4 }}
            >
              <span className="text-white/80 text-base md:text-lg font-medium">Up to </span>
              <span
                className="text-gold-gradient text-2xl md:text-4xl font-black"
              >
                70% OFF
              </span>
            </motion.div>

            {/* Countdown Timer with glass-morphism digits */}
            <motion.div
              className="flex items-center justify-center lg:justify-start gap-2 mb-5"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.4 }}
            >
              <span className="text-white/70 text-xs md:text-sm font-medium mr-1">Ends in</span>
              {mounted ? (
                <>
                  <GlassDigit value={timeLeft.hours} />
                  <span className="text-white font-bold text-xl md:text-3xl animate-pulse-soft">:</span>
                  <GlassDigit value={timeLeft.minutes} />
                  <span className="text-white font-bold text-xl md:text-3xl animate-pulse-soft">:</span>
                  <GlassDigit value={timeLeft.seconds} />
                </>
              ) : (
                <>
                  <div className="glass-digit-placeholder relative min-w-[40px] md:min-w-[52px] text-center rounded-lg md:rounded-xl py-1.5 md:py-2 font-black text-xl md:text-3xl text-white tabular-nums"
                  >--</div>
                  <span className="text-white font-bold text-xl md:text-3xl">:</span>
                  <div className="glass-digit-placeholder relative min-w-[40px] md:min-w-[52px] text-center rounded-lg md:rounded-xl py-1.5 md:py-2 font-black text-xl md:text-3xl text-white tabular-nums"
                  >--</div>
                  <span className="text-white font-bold text-xl md:text-3xl">:</span>
                  <div className="glass-digit-placeholder relative min-w-[40px] md:min-w-[52px] text-center rounded-lg md:rounded-xl py-1.5 md:py-2 font-black text-xl md:text-3xl text-white tabular-nums"
                  >--</div>
                </>
              )}
            </motion.div>

            {/* CTA Button with glow */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.4 }}
            >
              <Button
                asChild
                size="lg"
                className="btn-glow-amber font-bold text-base md:text-lg px-8 md:px-10 h-12 md:h-14 rounded-full text-white border-0 transition-all hover:scale-105 active:scale-95"
              >
                <Link href="/shop" className="gap-2">
                  <ShoppingBag className="size-5" />
                  Shop Now
                  <ChevronRight className="size-4" />
                </Link>
              </Button>
            </motion.div>
          </div>

          {/* Right: Auto-rotating deal highlights */}
          <div className="w-full lg:w-auto lg:min-w-[340px] xl:min-w-[400px]">
            <div className="flex flex-col gap-3">
              <p className="text-white/60 text-xs font-semibold uppercase tracking-wider text-center lg:text-left">
                🔥 Top Deals
              </p>
              <div className="relative min-h-[68px] md:min-h-[80px]">
                <AnimatePresence mode="wait">
                  <DealCard key={deal.id} deal={deal} />
                </AnimatePresence>
              </div>

              {/* Deal indicator dots */}
              <div className="flex items-center justify-center lg:justify-start gap-2 mt-1">
                {DEAL_HIGHLIGHTS.map((_, i) => (
                  <button
                    key={i}
                    className={cn(
                      'h-1.5 rounded-full transition-all duration-300',
                      i === currentDeal
                        ? 'w-6 bg-yellow-400'
                        : 'w-1.5 bg-white/30 hover:bg-white/50'
                    )}
                    onClick={() => setCurrentDeal(i)}
                    aria-label={`View deal ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
