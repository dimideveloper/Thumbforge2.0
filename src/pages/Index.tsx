import Header from "@/components/landing/Header";
import HeroSection from "@/components/landing/HeroSection";
import StatsSection from "@/components/landing/StatsSection";
import FeaturesGrid from "@/components/landing/FeaturesGrid";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import BeforeAfterSection from "@/components/landing/BeforeAfterSection";
import ShowcaseSection from "@/components/landing/ShowcaseSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import ComparisonTable from "@/components/landing/ComparisonTable";
import CTASection from "@/components/landing/CTASection";
import PricingCards from "@/components/landing/PricingCards";
import FAQSection from "@/components/landing/FAQSection";
import Footer from "@/components/landing/Footer";
import InteractiveDesignSection from "@/components/landing/InteractiveDesignSection";

const Index = () => {
  document.title = "ThumbForge – AI Thumbnail Editor";

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 relative">
      {/* Background Grid & Glows */}
      <div className="fixed inset-0 z-0 pointer-events-none">

        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/20 opacity-20 blur-[100px]" />
        <div className="absolute right-0 bottom-0 -z-10 h-[400px] w-[400px] rounded-full bg-secondary/10 opacity-20 blur-[120px]" />
      </div>
      
      <div className="relative z-10 w-full">
        <Header />
        <main className="flex flex-col gap-0 pb-24">
        <HeroSection />
        <InteractiveDesignSection />
        <StatsSection />
        <FeaturesGrid />
        <HowItWorksSection />
        <BeforeAfterSection />
        <ShowcaseSection />
        <TestimonialsSection />
        <ComparisonTable />
        <CTASection />
        <PricingCards />
        <FAQSection />
      </main>
      <Footer />
      </div>
    </div>
  );
};

export default Index;
