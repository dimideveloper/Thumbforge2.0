import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

const HeroSection = () => (
  <section className="relative pt-40 pb-32 overflow-hidden flex flex-col items-center justify-center text-center">
    <div className="container relative z-10 px-4 md:px-6">
      <motion.div
        initial={{ opacity: 0, filter: "blur(10px)", y: 20 }}
        animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-4xl mx-auto"
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-white/70 mb-12 backdrop-blur-md">
          <Sparkles className="h-3 w-3" />
          Powered by AI. No limits.
        </div>

        <h1 className="text-5xl md:text-7xl lg:text-8xl font-medium tracking-tight text-white leading-[1.1] mb-8">
          Viral Thumbnails.
          <br />
          <span className="text-white/60">In Seconds.</span>
        </h1>

        <p className="mx-auto max-w-2xl text-lg md:text-xl text-white/50 font-light mb-12 leading-relaxed">
          Create scroll-stopping YouTube thumbnails for any game — without touching complex design software.
          The AI does the heavy lifting.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button className="h-14 px-8 rounded-full bg-white text-black font-medium text-lg hover:scale-105 active:scale-95 transition-transform flex items-center gap-2">
            Get Started Free <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </motion.div>
    </div>
  </section>
);

export default HeroSection;
