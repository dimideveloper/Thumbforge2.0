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
    <section className="relative pt-32 lg:pt-48 pb-32 overflow-hidden">
      <div className="container relative z-10 px-4 md:px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center lg:text-left"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs text-primary mb-8 backdrop-blur-md">
              <Sparkles className="h-3 w-3" />
              Powered by AI. No limits.
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-semibold tracking-tight text-white leading-[1.05] mb-8">
              Viral <br className="hidden lg:block" /> Thumbnails.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">In Seconds.</span>
            </h1>

            <p className="mx-auto lg:mx-0 max-w-xl text-lg md:text-xl text-white/50 font-light mb-10 leading-relaxed">
              Create scroll-stopping YouTube thumbnails for any game — without touching complex design software.
              The AI does the heavy lifting.
            </p>

            <div className="flex flex-col sm:flex-row items-center lg:justify-start justify-center gap-4">
              <button
                onClick={() => navigate(isLoggedIn ? "/dashboard" : "/auth")}
                className="btn-shine"
              >
                {isLoggedIn ? "Open Studio" : "Get Started Free"}
                <svg className="btn-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm4.28 10.28a.75.75 0 000-1.06l-3-3a.75.75 0 10-1.06 1.06l1.72 1.72H8.25a.75.75 0 000 1.5h5.69l-1.72 1.72a.75.75 0 101.06 1.06l3-3z"
                    clipRule="evenodd"
                  ></path>
                </svg>
              </button>
            </div>
          </motion.div>

          {/* Right Video Preview */}
          <motion.div
            initial={{ opacity: 0, x: 30, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
            className="relative"
          >
            {/* Glow effect behind video */}
            <div className="absolute -inset-4 bg-primary/20 blur-[100px] rounded-full pointer-events-none opacity-50" />
            
            <div className="relative group rounded-3xl border border-white/10 bg-[#0a0a0a]/80 backdrop-blur-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] transform hover:scale-[1.02] transition-all duration-700">
              <div className="aspect-video w-full overflow-hidden relative">
                <video 
                  autoPlay 
                  loop 
                  muted 
                  playsInline
                  className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-700"
                >
                  <source src="/0426.mp4" type="video/mp4" />
                  {/* Fallback mockup image */}
                  <img 
                    src="https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=2070&auto=format&fit=crop" 
                    alt="Video Preview"
                    className="w-full h-full object-cover"
                  />
                </video>
                
                {/* Overlay details */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                
                {/* Floating Tags */}
                <div className="absolute top-6 left-6 flex gap-2">
                   <div className="px-3 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-[10px] font-medium text-white/80">
                     Live Preview
                   </div>
                </div>
              </div>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute -bottom-6 -right-6 h-24 w-24 border border-white/5 rounded-2xl bg-white/[0.02] backdrop-blur-md -z-10 animate-pulse" />
            <div className="absolute -top-6 -left-6 h-16 w-16 border border-white/5 rounded-full bg-white/[0.02] backdrop-blur-md -z-10" />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
