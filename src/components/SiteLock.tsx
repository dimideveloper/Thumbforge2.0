import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, ArrowRight, ShieldCheck } from "lucide-react";

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
    <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md px-8 text-center"
      >
        <div className="mb-12 relative inline-block">
          <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full" />
          <div className="relative h-20 w-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto shadow-2xl">
            <Lock className="h-8 w-8 text-white/40" />
          </div>
        </div>

        <h1 className="text-3xl font-medium tracking-tight text-white mb-3">
          Restricted Access
        </h1>
        <p className="text-white/30 text-sm mb-10 font-light tracking-wide">
          Enter the security key to access ThumbForge Lab.
        </p>

        <form onSubmit={handleUnlock} className="relative group">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Security Key"
            autoFocus
            className={`w-full bg-white/5 border ${error ? 'border-red-500/50' : 'border-white/10'} rounded-2xl py-4 px-6 text-white placeholder:text-white/10 outline-none focus:border-white/20 transition-all text-center tracking-[0.3em] font-bold`}
          />
          <button 
            type="submit"
            className="absolute right-2 top-2 bottom-2 aspect-square rounded-xl bg-white text-black flex items-center justify-center hover:bg-white/90 transition-all"
          >
            <ArrowRight className="h-5 w-5" />
          </button>
        </form>

        {error && (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-red-500 text-[10px] uppercase tracking-widest font-bold mt-4"
          >
            Invalid Security Key
          </motion.p>
        )}

        <div className="mt-20 flex items-center justify-center gap-2 opacity-10">
          <ShieldCheck className="h-4 w-4 text-white" />
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white">Encrypted Environment</span>
        </div>
      </motion.div>
    </div>
  );
}
