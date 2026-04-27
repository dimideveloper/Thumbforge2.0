import { motion } from "framer-motion";
import { Sparkles, Hammer, Clock, ArrowLeft, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MaintenanceView() {
  return (
    <div className="fixed inset-0 z-[200] bg-[#050505] flex items-center justify-center overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-blue-500/10 blur-[150px] rounded-full" />
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-purple-500/5 blur-[120px] rounded-full animate-pulse" />

      <div className="relative z-10 max-w-2xl w-full px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Status Badge */}
          <div className="flex justify-center mb-12">
            <div className="px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-500">System Maintenance</span>
            </div>
          </div>

          {/* Main Icon */}
          <div className="relative mx-auto w-24 h-24 mb-10">
            <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full animate-pulse" />
            <div className="relative h-full w-full rounded-[32px] bg-white/5 border border-white/10 flex items-center justify-center shadow-2xl">
              <Zap className="h-10 w-10 text-white" />
            </div>
          </div>

          <h1 className="text-5xl md:text-6xl font-medium tracking-tight text-white mb-6">
            AI Engine <span className="text-white/40">Optimization</span>
          </h1>
          
          <p className="text-xl text-white/40 font-light leading-relaxed mb-12 max-w-lg mx-auto">
            We're currently fine-tuning our generation models and improving Studio performance. 
            <span className="text-white/60 block mt-2">We'll be back online tomorrow morning.</span>
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <div className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-white/[0.03] border border-white/5">
              <Clock className="h-5 w-5 text-white/20" />
              <div className="text-left">
                <p className="text-[10px] uppercase tracking-widest text-white/20 font-bold">Estimated Return</p>
                <p className="text-sm text-white/60">Tomorrow, 08:00 AM</p>
              </div>
            </div>
          </div>

          <div className="mt-16 flex items-center justify-center gap-2 opacity-20">
            <Sparkles className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-[0.3em]">ThumbForge Core v2.4</span>
          </div>
        </motion.div>
      </div>

      {/* Particle Effects */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: [0, 0.2, 0],
            y: [0, -100],
            scale: [0, 1, 0]
          }}
          transition={{ 
            duration: 5 + Math.random() * 5, 
            repeat: Infinity,
            delay: Math.random() * 5
          }}
          className="absolute w-1 h-1 bg-white rounded-full"
          style={{ 
            left: `${Math.random() * 100}%`, 
            top: `${Math.random() * 100}%` 
          }}
        />
      ))}
    </div>
  );
}
