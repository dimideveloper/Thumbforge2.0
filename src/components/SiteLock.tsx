import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Lock, ArrowRight, ShieldCheck, Zap } from "lucide-react";

interface SiteLockProps {
  children: React.ReactNode;
}

const SITE_PASSWORD = "thumbforge-secret"; // Hier das gewünschte Passwort ändern

export function SiteLock({ children }: SiteLockProps) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    const savedLock = localStorage.getItem("site_unlocked");
    if (savedLock === "true") {
      setIsUnlocked(true);
    }
  }, []);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === SITE_PASSWORD) {
      setIsUnlocked(true);
      localStorage.setItem("site_unlocked", "true");
      setError(false);
    } else {
      setError(true);
      setPassword("");
      setTimeout(() => setError(false), 500);
    }
  };

  if (isUnlocked) {
    return <>{children}</>;
  }

  return (
    <div className="fixed inset-0 z-[9999] min-h-screen bg-[#050505] flex selection:bg-white/20 overflow-hidden font-light">
      {/* Subtle background glow */}
      <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-500/[0.03] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-white/[0.02] rounded-full blur-[120px] pointer-events-none" />

      {/* Left Side: Branding / Content (Hidden on Mobile) */}
      <div className="hidden lg:flex flex-1 flex-col justify-between p-16 relative z-10 border-r border-white/5">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full border border-white/10 bg-gradient-to-b from-white/10 to-transparent flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.05)]">
             <Zap className="h-5 w-5 text-white/90" />
          </div>
          <span className="font-medium tracking-tight text-2xl text-white">ThumbForge</span>
        </div>

        <div className="max-w-xl animate-in fade-in slide-in-from-left-8 duration-1000">
          <div className="mb-8 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20">
            <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400">
              System Maintenance
            </span>
          </div>

          <h2 className="text-6xl font-medium text-white leading-[1.1] tracking-tight mb-8">
            We are working on <br />
            <span className="text-white/40 italic">a big update.</span>
          </h2>

          <p className="text-white/50 text-lg font-light leading-relaxed max-w-md">
            ThumbForge is currently offline while we deploy our highly anticipated major update. We're introducing new AI models, improved performance, and a completely revamped studio experience.
          </p>

          <div className="mt-12 grid grid-cols-2 gap-8">
            <div className="space-y-1">
              <p className="text-xl font-medium text-white">Sat or Sun, 18:00 CEST</p>
              <p className="text-sm text-white/30 font-light">Estimated return time</p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-medium text-white">V4</p>
              <p className="text-sm text-white/30 font-light">Next-gen release</p>
            </div>
          </div>
        </div>

        <div className="text-white/20 text-xs font-light tracking-wide flex items-center gap-4">
          <span>© {new Date().getFullYear()} ThumbForge</span>
          <span className="h-1 w-1 rounded-full bg-white/10" />
          <span>Professional Image Studio</span>
        </div>
      </div>

      {/* Right Side: Auth Form */}
      <div className="flex-1 flex items-center justify-center p-6 relative z-10 w-full">
        <div className="w-full max-w-[480px] animate-in fade-in zoom-in-95 duration-700">
          
          {/* Mobile Logo & Info (Visible only on Mobile) */}
          <div className="lg:hidden flex flex-col items-center justify-center text-center mb-10">
             <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-full border border-white/10 bg-gradient-to-b from-white/10 to-transparent flex items-center justify-center">
                   <Zap className="h-5 w-5 text-white" />
                </div>
                <span className="font-medium text-2xl text-white">ThumbForge</span>
             </div>
             <div className="mb-6 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
              <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-blue-400">
                Major Update in Progress
              </span>
            </div>
            <h2 className="text-3xl font-medium text-white leading-[1.1] tracking-tight mb-3">
              We'll be back <span className="text-white/40 italic">soon.</span>
            </h2>
            <p className="text-white/40 text-sm font-light">
              Expected return: Sat or Sun, 18:00 (CEST)
            </p>
          </div>

          <div className="rounded-[3rem] border border-white/10 bg-[#0a0a0a]/60 backdrop-blur-3xl p-8 sm:p-14 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.05] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

            <div className="relative z-10">
              <div className="flex items-center justify-center mb-8">
                <div className="h-16 w-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-xl">
                  <Lock className="h-6 w-6 text-white/60" />
                </div>
              </div>
              
              <h1 className="text-3xl font-medium text-white mb-2 tracking-tight text-center">
                Restricted Area
              </h1>
              <p className="text-white/40 text-[15px] mb-8 font-light text-center">
                Admin access requires a security key.
              </p>

              <form onSubmit={handleUnlock} className="space-y-6">
                <div className="relative group">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Security Key"
                    autoFocus
                    className={`w-full pl-6 pr-14 h-16 bg-white/[0.03] border ${error ? 'border-red-500/50' : 'border-white/10'} text-white placeholder:text-white/20 rounded-2xl focus-visible:ring-1 focus-visible:ring-white/30 focus-visible:border-white/30 focus-visible:bg-white/[0.06] transition-all font-bold text-center tracking-[0.3em] outline-none`}
                  />
                  <button 
                    type="submit"
                    className="absolute right-2 top-2 bottom-2 aspect-square rounded-xl bg-white text-black flex items-center justify-center hover:bg-white/90 transition-all active:scale-95"
                  >
                    <ArrowRight className="h-5 w-5" />
                  </button>
                </div>

                {error && (
                  <motion.p 
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-[11px] uppercase tracking-widest font-bold text-center"
                  >
                    Invalid Security Key
                  </motion.p>
                )}
              </form>

              <div className="mt-12 flex items-center justify-center gap-2 opacity-20">
                <ShieldCheck className="h-4 w-4 text-white" />
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white">Encrypted Environment</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
