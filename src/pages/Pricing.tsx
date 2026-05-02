import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import PricingCards from "@/components/landing/PricingCards";
import FAQSection from "@/components/landing/FAQSection";

const Pricing = () => {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-white/20 flex flex-col">
      <Header />
      <main className="flex-1 pt-32 pb-24">
        <PricingCards />
        <FAQSection />
      </main>
      <Footer />
    </div>
  );
};

export default Pricing;
