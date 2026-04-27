import { motion } from "framer-motion";
import { Sparkles, Zap, BrainCircuit, Timer, Cpu } from "lucide-react";

export function MaintenanceView() {
  return (
    <div className="fixed inset-0 z-[200] bg-black flex items-center justify-center overflow-hidden font-sans">
      <div className="relative z-10 w-full max-w-4xl px-8 flex flex-col items-center">
        {/* Subtle Brand Tag */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16 flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/10 backdrop-blur-md shadow-2xl"
        >
          <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
          <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/40">Lab Status: Evolving</span>
        </motion.div>

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="text-center space-y-8"
        >
          <h1 className="text-6xl md:text-8xl font-medium tracking-tighter text-white leading-none">
            Refining the <br />
            <span className="bg-gradient-to-b from-white to-white/20 bg-clip-text text-transparent">Intelligence.</span>
          </h1>
          
          <p className="text-lg md:text-2xl text-white/30 font-light max-w-xl mx-auto leading-relaxed">
            Our engineers are currently deploying next-generation AI models to ThumbForge. We'll be back online within a few hours.
          </p>
        </motion.div>

        {/* Feature Cards / Tech Stack Status */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 w-full"
        >
          {[
            { icon: Cpu, label: "GPU Clusters", status: "Scaling", color: "text-blue-400" },
            { icon: BrainCircuit, label: "Models", status: "Fine-tuning", color: "text-purple-400" },
            { icon: Zap, label: "API Gateways", status: "Optimizing", color: "text-amber-400" }
          ].map((item, i) => (
            <div key={i} className="group relative p-6 rounded-[32px] bg-white/[0.02] border border-white/5 backdrop-blur-xl transition-all duration-500 hover:bg-white/[0.04] hover:border-white/10">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform">
                  <item.icon className={`h-5 w-5 ${item.color}`} />
                </div>
                <div className="text-left">
                  <p className="text-[10px] uppercase tracking-widest text-white/20 font-bold mb-0.5">{item.label}</p>
                  <p className="text-sm text-white/60 font-medium">{item.status}</p>
                </div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Bottom Lockup */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.2 }}
          transition={{ delay: 1 }}
          className="mt-24 flex items-center gap-4"
        >
          <div className="h-px w-12 bg-white" />
          <span className="text-[10px] uppercase tracking-[0.5em] font-bold text-white">ThumbForge Core 2.0</span>
          <div className="h-px w-12 bg-white" />
        </motion.div>
      </div>

      {/* Modern Cursor/Pointer Glow Follow (Static for simplicity but nice effect) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-white/[0.01] border border-white/[0.02] rounded-full pointer-events-none" />
    </div>
  );
}
