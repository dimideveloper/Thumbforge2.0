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
  <section id="compare" className="py-24">
    <div className="container max-w-3xl px-4 md:px-6">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-medium text-white tracking-tight">
          Why Creators <span className="text-white/60">Switch.</span>
        </h2>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="rounded-3xl border border-white/10 overflow-hidden bg-[#0a0a0a]"
      >
        <div className="grid grid-cols-3 text-sm font-medium border-b border-white/10">
          <div className="p-6 text-white/50">Feature</div>
          <div className="p-6 text-white text-center">ThumbForge</div>
          <div className="p-6 text-white/50 text-center">Other Tools</div>
        </div>
        {rows.map((row, i) => (
          <div key={row.feature} className={`grid grid-cols-3 text-sm border-b border-white/5 last:border-0 ${i % 2 === 0 ? 'bg-transparent' : 'bg-white/[0.02]'}`}>
            <div className="p-6 text-white/70 font-light">{row.feature}</div>
            <div className="p-6 flex justify-center items-center">
              <Check className="h-5 w-5 text-white" />
            </div>
            <div className="p-6 flex justify-center items-center">
              <X className="h-5 w-5 text-white/20" />
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  </section>
);

export default ComparisonTable;
