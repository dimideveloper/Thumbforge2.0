import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const HeroSection = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <section className="relative pt-40 pb-32 overflow-hidden flex flex-col items-center justify-center text-center">
    <div className="container relative z-10 px-4 md:px-6">
      <motion.div
        initial={{ opacity: 0, filter: "blur(10px)", y: 20 }}
        animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-4xl mx-auto"
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs text-primary mb-12 backdrop-blur-md">
          <Sparkles className="h-3 w-3" />
          Powered by AI. No limits.
        </div>

        <h1 className="text-5xl md:text-7xl lg:text-8xl font-semibold tracking-tight text-white leading-[1.1] mb-8">
          Viral Thumbnails.
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">In Seconds.</span>
        </h1>

        <p className="mx-auto max-w-2xl text-lg md:text-xl text-white/50 font-light mb-12 leading-relaxed">
          Create scroll-stopping YouTube thumbnails for any game — without touching complex design software.
          The AI does the heavy lifting.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => navigate(isLoggedIn ? "/dashboard" : "/auth")}
            className="h-14 px-8 rounded-full bg-primary text-primary-foreground font-medium text-lg hover:bg-primary/90 active:scale-95 transition-all flex items-center gap-2 shadow-[0_0_30px_hsl(221_83%_53%_/_0.3)] hover:shadow-[0_0_40px_hsl(221_83%_53%_/_0.5)]"
          >
            {isLoggedIn ? "Open Studio" : "Get Started Free"} <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </motion.div>
    </div>
  </section>
  );
};

export default HeroSection;
