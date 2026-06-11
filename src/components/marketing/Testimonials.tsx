'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Star, Quote } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Testimonial {
  id: number;
  name: string;
  location: string;
  text: string;
  rating: number;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: 'Rahul M.',
    location: 'Mumbai',
    text: 'Amazing deals! Got my phone at the best price. Delivery was super quick and the product was exactly as described.',
    rating: 5,
  },
  {
    id: 2,
    name: 'Priya S.',
    location: 'Jaipur',
    text: 'Super fast delivery, even to my village! Was pleasantly surprised by how quickly my order arrived.',
    rating: 5,
  },
  {
    id: 3,
    name: 'Amit K.',
    location: 'Delhi',
    text: 'Return process was so easy. Love shopping here. The customer service team was very helpful.',
    rating: 4,
  },
  {
    id: 4,
    name: 'Sunita R.',
    location: 'Pune',
    text: 'Best place for kitchen essentials. Found everything I needed at great prices. Highly recommend!',
    rating: 5,
  },
  {
    id: 5,
    name: 'Vikram P.',
    location: 'Bangalore',
    text: 'The UPI payment is so quick and smooth. No hassles at all. My go-to for online shopping now.',
    rating: 5,
  },
  {
    id: 6,
    name: 'Meera T.',
    location: 'Chennai',
    text: 'Great collection of ethnic wear. The sarees are beautiful and the quality is excellent for the price.',
    rating: 4,
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            'size-3.5',
            i < rating
              ? 'fill-amber-400 text-amber-400'
              : 'fill-muted text-muted'
          )}
        />
      ))}
    </div>
  );
}

export function Testimonials() {
  const [desktopApi, setDesktopApi] = useState<CarouselApi>();
  const [mobileApi, setMobileApi] = useState<CarouselApi>();
  const [currentDesktop, setCurrentDesktop] = useState(0);
  const [currentMobile, setCurrentMobile] = useState(0);

  const desktopInitialized = useRef(false);
  const mobileInitialized = useRef(false);

  const handleDesktopApi = useCallback((api: CarouselApi) => {
    setDesktopApi(api);
    if (api && !desktopInitialized.current) {
      desktopInitialized.current = true;
      setCurrentDesktop(api.selectedScrollSnap());
    }
  }, []);

  const handleMobileApi = useCallback((api: CarouselApi) => {
    setMobileApi(api);
    if (api && !mobileInitialized.current) {
      mobileInitialized.current = true;
      setCurrentMobile(api.selectedScrollSnap());
    }
  }, []);

  useEffect(() => {
    if (!desktopApi) return;
    const handler = () => setCurrentDesktop(desktopApi.selectedScrollSnap());
    desktopApi.on('select', handler);
    return () => { desktopApi.off('select', handler); };
  }, [desktopApi]);

  useEffect(() => {
    if (!mobileApi) return;
    const handler = () => setCurrentMobile(mobileApi.selectedScrollSnap());
    mobileApi.on('select', handler);
    return () => { mobileApi.off('select', handler); };
  }, [mobileApi]);

  return (
    <section className="section-padding">
      <div className="container-shop">
        {/* Section Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            What Our Customers Say
          </h2>
          <p className="text-muted-foreground text-sm md:text-base">
            Trusted by millions of happy shoppers across India
          </p>
        </div>

        {/* Desktop: Show 3 at a time */}
        <div className="hidden md:block">
          <Carousel
            setApi={handleDesktopApi}
            opts={{
              align: 'start',
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {testimonials.map((t) => (
                <CarouselItem key={t.id} className="pl-4 md:basis-1/3">
                  <TestimonialCard testimonial={t} />
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>

          {/* Dot Indicators */}
          <div className="flex justify-center gap-2 mt-6">
            {testimonials.map((_, i) => (
              <button
                key={i}
                className={cn(
                  'h-2 rounded-full transition-all duration-300',
                  i === currentDesktop
                    ? 'w-6 bg-primary'
                    : 'w-2 bg-primary/30 hover:bg-primary/50'
                )}
                onClick={() => desktopApi?.scrollTo(i)}
                aria-label={`Go to testimonial ${i + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Mobile: Swipeable Cards */}
        <div className="md:hidden">
          <Carousel
            setApi={handleMobileApi}
            opts={{
              align: 'start',
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {testimonials.map((t) => (
                <CarouselItem key={t.id} className="pl-4 basis-[85%]">
                  <TestimonialCard testimonial={t} />
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>

          {/* Dot Indicators */}
          <div className="flex justify-center gap-2 mt-4">
            {testimonials.map((_, i) => (
              <button
                key={i}
                className={cn(
                  'h-2 rounded-full transition-all duration-300',
                  i === currentMobile
                    ? 'w-6 bg-primary'
                    : 'w-2 bg-primary/30 hover:bg-primary/50'
                )}
                onClick={() => mobileApi?.scrollTo(i)}
                aria-label={`Go to testimonial ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <Card className="h-full border-border/50 hover:shadow-md transition-shadow">
      <CardContent className="p-5 md:p-6">
        <div className="flex items-start gap-3 mb-3">
          <Quote className="size-8 text-primary/20 shrink-0 -mt-1" />
          <div>
            <StarRating rating={testimonial.rating} />
          </div>
        </div>
        <p className="text-sm text-foreground/80 leading-relaxed mb-4">
          &ldquo;{testimonial.text}&rdquo;
        </p>
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
            {testimonial.name.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">
              {testimonial.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {testimonial.location}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
