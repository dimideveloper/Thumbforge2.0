import Header from "@/components/landing/Header";
import HeroSection from "@/components/landing/HeroSection";
import SocialProof from "@/components/landing/SocialProof";
import FeaturesGrid from "@/components/landing/FeaturesGrid";
import ComparisonTable from "@/components/landing/ComparisonTable";
import PricingCards from "@/components/landing/PricingCards";
import Footer from "@/components/landing/Footer";

const Index = () => (
  <div className="min-h-screen bg-black text-white selection:bg-white/20">
    <Header />
    <main className="flex flex-col gap-24 pb-24">
      <HeroSection />
      <SocialProof />
      <FeaturesGrid />
      <ComparisonTable />
      <PricingCards />
    </main>
    <Footer />
  </div>
);

export default Index;
