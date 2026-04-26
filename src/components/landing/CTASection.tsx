import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Zap } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const CTASection = () => {
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
    <section className="py-24">
      <div className="container px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative glass-card rounded-2xl overflow-hidden p-12 md:p-20 text-center"
        >
          {/* Glow */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full bg-white/[0.03] blur-3xl" />
          </div>

          <div className="relative z-10">
            <div className="inline-flex h-16 w-16 rounded-xl border border-primary/20 bg-primary/10 items-center justify-center mb-8 mx-auto shadow-[0_0_20px_rgba(37,99,235,0.2)]">
              <Zap className="h-8 w-8 text-primary drop-shadow-[0_0_10px_rgba(37,99,235,0.5)]" strokeWidth={1.5} />
            </div>

            <h2 className="text-3xl md:text-6xl font-medium text-white tracking-tight mb-6 max-w-3xl mx-auto leading-tight">
              Your next thumbnail <br />
              <span className="text-white/50">could go viral today.</span>
            </h2>

            <p className="text-white/40 font-light text-lg mb-10 max-w-lg mx-auto">
              Join 2,500+ creators using ThumbForge to grow their channels. Start for free — no credit card needed.
            </p>

            <div className="flex flex-col items-center gap-6">
              <button
                onClick={() => navigate(isLoggedIn ? "/dashboard" : "/auth")}
                className="btn-shine"
              >
                {isLoggedIn ? "Open Studio" : "Start for free"}
                <svg className="btn-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm4.28 10.28a.75.75 0 000-1.06l-3-3a.75.75 0 10-1.06 1.06l1.72 1.72H8.25a.75.75 0 000 1.5h5.69l-1.72 1.72a.75.75 0 101.06 1.06l3-3z"
                    clipRule="evenodd"
                  ></path>
                </svg>
              </button>
              <p className="text-white/20 text-xs font-light tracking-wide">
                No credit card required · Free tier always available
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
