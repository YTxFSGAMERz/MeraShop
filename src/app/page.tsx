'use client';

import {
  PromoStrip,
  PromoStripDesktop,
  HeroBanner,
  FlashSaleBanner,
  CategoryShowcase,
  FeaturedProducts,
  TrustBadges,
  DealsSection,
  NewArrivals,
  BrandShowcase,
  Testimonials,
  FAQSection,
  NewsletterSection,
} from '@/components/marketing';
import { RecentlyViewed } from '@/components/shop/RecentlyViewed';
import { AlsoBought } from '@/components/shop/AlsoBought';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Mobile Promo Strip (sticky below header) */}
      <PromoStrip />

      {/* Desktop Promo Strip */}
      <PromoStripDesktop />

      {/* 1. Hero Banner Carousel */}
      <HeroBanner />

      {/* 2. Flash Sale Banner */}
      <FlashSaleBanner />

      {/* 3. Category Showcase */}
      <CategoryShowcase />

      {/* 4. Featured Products */}
      <FeaturedProducts />

      {/* 5. Customers Also Bought (Homepage) */}
      <section className="section-padding">
        <div className="container-shop px-4 md:px-6 lg:px-8">
          <AlsoBought categorySlug="smartphones" currentProductId="homepage" limit={8} />
        </div>
      </section>

      {/* 6. Trust Badges */}
      <TrustBadges />

      {/* 7. Deals of the Day */}
      <DealsSection />

      {/* 8. New Arrivals */}
      <NewArrivals />

      {/* 9. Recently Viewed */}
      <section className="section-padding">
        <div className="container-shop px-4 md:px-6 lg:px-8">
          <RecentlyViewed />
        </div>
      </section>

      {/* 10. Brand Showcase */}
      <BrandShowcase />

      {/* 11. Testimonials */}
      <Testimonials />

      {/* 12. FAQ Section */}
      <FAQSection />

      {/* 13. Newsletter Signup */}
      <NewsletterSection />
    </div>
  );
}
