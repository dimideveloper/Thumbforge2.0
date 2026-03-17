import Header from "@/components/landing/Header";
import HeroSection from "@/components/landing/HeroSection";
import StatsSection from "@/components/landing/StatsSection";
import FeaturesGrid from "@/components/landing/FeaturesGrid";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import ShowcaseSection from "@/components/landing/ShowcaseSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import ComparisonTable from "@/components/landing/ComparisonTable";
import CTASection from "@/components/landing/CTASection";
import PricingCards from "@/components/landing/PricingCards";
import FAQSection from "@/components/landing/FAQSection";
import Footer from "@/components/landing/Footer";

const Index = () => {
  document.title = "ThumbForge – AI Thumbnail Editor";

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white/20">
      <Header />
      <main className="flex flex-col gap-0 pb-24">
        <HeroSection />
        <StatsSection />
        <FeaturesGrid />
        <HowItWorksSection />
        <ShowcaseSection />
        <TestimonialsSection />
        <ComparisonTable />
        <CTASection />
        <PricingCards />
        <FAQSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
