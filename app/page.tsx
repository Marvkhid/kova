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
import { apiFetch } from '@/lib/api';

export default async function HomePage() {
  let featuredProducts: any[] = [];
  let allProducts: any[] = [];

  try {
    [featuredProducts, allProducts] = await Promise.all([
      apiFetch('/products/featured'),
      apiFetch('/products'),
    ]);
  } catch (err) {
    console.error('Homepage product fetch failed:', err);
  }

  return (
    <>
      <HeroSection />
      <MarqueeStrip />
      <AboutSection />
      <CategoriesSection />
      <FeaturedProductsSection products={featuredProducts} />
      <TrustStrip />
      <HowItWorksSection />
      <TrendingSection products={allProducts} />
      <TestimonialsSection />
      <StorySection />
      <SellerCTASection />
      <FinalCTASection />
    </>
  );
}