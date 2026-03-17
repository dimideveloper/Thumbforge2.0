import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Zap } from "lucide-react";

const CTASection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-24">
      <div className="container px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative rounded-3xl border border-white/10 bg-[#0a0a0a] overflow-hidden p-12 md:p-20 text-center"
        >
          {/* Glow */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full bg-white/[0.03] blur-3xl" />
          </div>

          <div className="relative z-10">
            <div className="inline-flex h-14 w-14 rounded-2xl border border-white/10 bg-white/5 items-center justify-center mb-8 mx-auto">
              <Zap className="h-6 w-6 text-white/70" strokeWidth={1.5} />
            </div>

            <h2 className="text-3xl md:text-6xl font-medium text-white tracking-tight mb-6 max-w-3xl mx-auto leading-tight">
              Your next thumbnail <br />
              <span className="text-white/50">could go viral today.</span>
            </h2>

            <p className="text-white/40 font-light text-lg mb-10 max-w-lg mx-auto">
              Join 2,500+ creators using ThumbForge to grow their channels. Start for free — no credit card needed.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => navigate("/auth")}
                className="h-14 px-10 rounded-full bg-white text-black font-semibold text-base hover:scale-105 active:scale-95 transition-transform flex items-center gap-2 shadow-[0_0_40px_rgba(255,255,255,0.15)]"
              >
                Start for free <ArrowRight className="h-5 w-5" />
              </button>
              <p className="text-white/30 text-sm font-light">No credit card · Free tier always available</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
