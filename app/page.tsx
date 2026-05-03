// ============================================================
// KOVA — Landing Page (app/page.tsx)
// Assembles all sections in order.
// Each section lives in its own file — add/remove freely.
// ============================================================

import { HeroSection, MarqueeStrip, AboutSection } from './Component/HeroSection';
import {
  CategoriesSection,
  FeaturedProductsSection,
  HowItWorksSection,
  TrustStrip,
  TrendingSection,
} from './Component/ProductSections';
import {
  TestimonialsSection,
  StorySection,
  SellerCTASection,
  FinalCTASection,
} from './Component/ContentSections';

export default function HomePage() {
  return (
    <>
      {/* 1. Hero */}
      <HeroSection />

      {/* 2. Marquee — always visible, no padding */}
      <MarqueeStrip />

      {/* 3. What KOVA does */}
      <AboutSection />

      {/* 4. Categories */}
      <CategoriesSection />

      {/* 5. Featured products */}
      <FeaturedProductsSection />

      {/* 6. Trust numbers */}
      <TrustStrip />

      {/* 7. How it works */}
      <HowItWorksSection />

      {/* 8. Trending products */}
      <TrendingSection />

      {/* 9. Testimonials */}
      <TestimonialsSection />

      {/* 10. Brand story */}
      <StorySection />

      {/* 11. Seller CTA */}
      <SellerCTASection />

      {/* 12. Final CTA */}
      <FinalCTASection />
    </>
  );
}