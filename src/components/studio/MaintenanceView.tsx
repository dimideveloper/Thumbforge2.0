import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, Zap, BrainCircuit, Timer, Cpu, Clock } from "lucide-react";

export function MaintenanceView() {
  const [timeLeft, setTimeLeft] = useState<{ hours: number, minutes: number, seconds: number }>({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const target = new Date("2026-04-28T22:00:00+02:00");

    const timer = setInterval(() => {
      const now = new Date();
      const diff = target.getTime() - now.getTime();

      if (diff <= 0) {
        clearInterval(timer);
        window.location.reload(); // Refresh to enter the studio
        return;
      }

      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ hours: h, minutes: m, seconds: s });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-[200] bg-black flex items-center justify-center overflow-hidden font-sans">
      <div className="relative z-10 w-full max-w-4xl px-8 flex flex-col items-center text-center">
        {/* Subtle Brand Tag */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/10 backdrop-blur-md shadow-2xl"
        >
          <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
          <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/40">Lab Status: Deploying 2.0</span>
        </motion.div>

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-6"
        >
          <h1 className="text-5xl md:text-8xl font-medium tracking-tighter text-white leading-none">
            We're almost <br />
            <span className="bg-gradient-to-b from-white to-white/20 bg-clip-text text-transparent">Ready.</span>
          </h1>
          
          <p className="text-base md:text-xl text-white/30 font-light max-w-xl mx-auto leading-relaxed">
            The major update is currently being deployed. The Studio will be available shortly.
          </p>
        </motion.div>

        {/* Countdown Timer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12 flex gap-4 md:gap-8"
        >
          {[
            { label: "Hours", value: timeLeft.hours },
            { label: "Minutes", value: timeLeft.minutes },
            { label: "Seconds", value: timeLeft.seconds }
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="h-16 w-16 md:h-24 md:w-24 rounded-2xl md:rounded-[32px] bg-white/[0.03] border border-white/10 flex items-center justify-center mb-3 backdrop-blur-xl">
                <span className="text-2xl md:text-4xl font-light text-white tracking-tighter">
                  {item.value.toString().padStart(2, '0')}
                </span>
              </div>
              <span className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] font-bold text-white/20">{item.label}</span>
            </div>
          ))}
        </motion.div>

        {/* Feature Cards / Tech Stack Status */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-3xl"
        >
          {[
            { icon: Cpu, label: "GPU Clusters", status: "Active", color: "text-blue-400" },
            { icon: BrainCircuit, label: "Models", status: "Synchronizing", color: "text-purple-400" },
            { icon: Clock, label: "Release", status: "22:00 Today", color: "text-amber-400" }
          ].map((item, i) => (
            <div key={i} className="group relative p-5 rounded-[24px] bg-white/[0.02] border border-white/5 backdrop-blur-xl transition-all duration-500 hover:bg-white/[0.04] hover:border-white/10">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform">
                  <item.icon className={`h-4 w-4 ${item.color}`} />
                </div>
                <div className="text-left">
                  <p className="text-[9px] uppercase tracking-widest text-white/20 font-bold mb-0.5">{item.label}</p>
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
          className="mt-16 flex items-center gap-4"
        >
          <div className="h-px w-12 bg-white" />
          <span className="text-[9px] uppercase tracking-[0.5em] font-bold text-white">ThumbForge Lab 2.0</span>
          <div className="h-px w-12 bg-white" />
        </motion.div>
      </div>

      {/* Decorative Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-white/[0.01] border border-white/[0.02] rounded-full pointer-events-none" />
    </div>
  );
}
