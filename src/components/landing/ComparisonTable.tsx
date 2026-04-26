import { motion } from "framer-motion";
import { Check, X } from "lucide-react";

const rows = [
  { feature: "AI-Powered Thumbnails", us: true, them: false },
  { feature: "Game-Specific Templates", us: true, them: false },
  { feature: "Expression AI (Shocked faces)", us: true, them: false },
  { feature: "Psychology-Based Titles", us: true, them: false },
  { feature: "No Photoshop Required", us: true, them: false },
  { feature: "Optimized for Gaming CTR", us: true, them: false },
];

const ComparisonTable = () => (
  <section id="compare" className="py-24 relative overflow-hidden">
    <div className="container max-w-4xl px-4 md:px-6 relative z-10">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-semibold text-white tracking-tight mb-4">
          Built for <span className="text-primary">Performance.</span>
        </h2>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="rounded-3xl border border-white/10 bg-[#050505] shadow-xl"
      >
        {/* Header */}
        <div className="grid grid-cols-3 text-[10px] md:text-xs font-semibold tracking-wider uppercase border-b border-white/10">
          <div className="p-6 md:p-8 text-white/30">Capabilities</div>
          <div className="p-8 md:p-10 text-white text-center bg-white/[0.03] border-x border-white/10 relative">
            <div className="absolute top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-primary text-[7px] text-white">BEST</div>
            ThumbForge
          </div>
          <div className="p-6 md:p-8 text-white/20 text-center">Others</div>
        </div>

        {/* Rows */}
        {rows.map((row) => (
          <div key={row.feature} className="grid grid-cols-3 group border-b border-white/5 last:border-0">
            <div className="p-5 md:p-6 flex items-center">
              <span className="text-sm md:text-base text-white/60 font-light group-hover:text-white transition-colors">
                {row.feature}
              </span>
            </div>
            
            <div className="p-5 md:p-6 bg-white/[0.015] border-x border-white/5 flex justify-center items-center">
              <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Check className="h-4 w-4 text-primary" />
              </div>
            </div>

            <div className="p-5 md:p-6 flex justify-center items-center">
              <X className="h-4 w-4 text-white/10" />
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  </section>
);

export default ComparisonTable;
