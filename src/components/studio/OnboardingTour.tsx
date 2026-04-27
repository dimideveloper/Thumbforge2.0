import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, Paintbrush, Trophy, Layout, 
  Smartphone, User, Check, ArrowRight, X,
  Zap, Star, MousePointer2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface OnboardingTourProps {
  user: any;
  onComplete: (name: string) => void;
}

export function OnboardingTour({ user, onComplete }: OnboardingTourProps) {
  const [step, setStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const isDone = localStorage.getItem("thumbforge_onboarding_done");
    const forceOnboarding = localStorage.getItem("force_onboarding") === "true";

    if (!isDone || forceOnboarding) {
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleNext = () => setStep((s) => s + 1);
  const handleSkip = () => setStep(4);

  const saveProfile = async () => {
    if (!displayName.trim()) {
      toast.error("Please enter a name!");
      return;
    }

    setIsSubmitting(true);
    try {
      // FIX: Use display_name instead of full_name
      const { error } = await supabase
        .from("profiles")
        .update({ display_name: displayName.trim() })
        .eq("user_id", user.id);

      if (error) throw error;

      localStorage.setItem("thumbforge_onboarding_done", "true");
      localStorage.removeItem("force_onboarding");
      
      toast.success(`Welcome to the team, ${displayName}!`);
      onComplete(displayName);
      setIsVisible(false);
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to save your name. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    {
      icon: Sparkles,
      title: "Welcome to the Future",
      description: "You're about to create thumbnails that stop the scroll. Ready for a 30-second power tour?",
      button: "Begin the Journey",
      color: "text-purple-400",
      bg: "bg-purple-600/20",
      glow: "from-purple-500/20 to-transparent"
    },
    {
      icon: Paintbrush,
      title: "Pro-Level AI Editor",
      description: "Our AI isn't generic. It's trained on millions of high-CTR YouTube thumbnails to give you that 'MrBeast' pop.",
      button: "Check Inspiration",
      color: "text-blue-400",
      bg: "bg-blue-600/20",
      glow: "from-blue-500/20 to-transparent"
    },
    {
      icon: Layout,
      title: "YouTube Context Mode",
      description: "Never let the YouTube UI hide your best parts. Use our reality-check overlays to perfect your placement.",
      button: "Community Spirit",
      color: "text-amber-400",
      bg: "bg-amber-600/20",
      glow: "from-amber-500/20 to-transparent"
    },
    {
      icon: Trophy,
      title: "Join the Elite",
      description: "Share your results in the Hall of Fame. The best designs get featured and inspired thousands of creators.",
      button: "Final Step",
      color: "text-emerald-400",
      bg: "bg-emerald-600/20",
      glow: "from-emerald-500/20 to-transparent"
    }
  ];

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-0">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/90 backdrop-blur-md"
      />

      {/* Floating Particles Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: Math.random() * window.innerWidth, 
              y: Math.random() * window.innerHeight,
              opacity: 0 
            }}
            animate={{ 
              y: [null, Math.random() * -200],
              opacity: [0, 0.3, 0],
              scale: [0, 1, 0]
            }}
            transition={{ 
              duration: 5 + Math.random() * 10, 
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute w-1 h-1 bg-white rounded-full"
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step < 4 ? (
          <motion.div
            key={`step-${step}`}
            initial={{ opacity: 0, scale: 0.8, rotateX: 20 }}
            animate={{ opacity: 1, scale: 1, rotateX: 0 }}
            exit={{ opacity: 0, scale: 1.1, rotateX: -20 }}
            transition={{ type: "spring", damping: 20, stiffness: 100 }}
            className="relative w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-[40px] p-10 shadow-[0_0_100px_rgba(0,0,0,1)] overflow-hidden"
          >
            {/* Dynamic Glow Background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${steps[step].glow} opacity-30 transition-all duration-1000`} />
            
            <div className="relative z-10">
              <div className="flex justify-between items-center mb-10">
                <motion.div 
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className={`h-16 w-16 rounded-[24px] ${steps[step].bg} flex items-center justify-center border border-white/10 shadow-lg`}
                >
                  {(() => {
                    const Icon = steps[step].icon;
                    return <Icon className={`h-8 w-8 ${steps[step].color}`} />;
                  })()}
                </motion.div>
                <div className="flex items-center gap-6">
                  <button 
                    onClick={handleSkip}
                    className="text-white/30 hover:text-white text-[10px] font-bold uppercase tracking-[0.3em] transition-all"
                  >
                    Skip
                  </button>
                  <div className="flex gap-2">
                    {steps.map((_, i) => (
                      <div 
                        key={i} 
                        className={`h-1 rounded-full transition-all duration-700 ${i === step ? 'w-8 bg-white' : 'w-2 bg-white/10'}`} 
                      />
                    ))}
                  </div>
                </div>
              </div>

              <motion.h2 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="text-4xl font-medium tracking-tight text-white mb-6 leading-tight"
              >
                {steps[step].title}
              </motion.h2>
              
              <motion.p 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="text-white/40 font-light text-xl leading-relaxed mb-12 max-w-[90%]"
              >
                {steps[step].description}
              </motion.p>

              <div className="flex items-center gap-4">
                <Button 
                  onClick={handleNext}
                  className="group relative flex-1 h-16 bg-white text-black hover:bg-white/90 rounded-[22px] font-bold text-xl active:scale-[0.98] transition-all overflow-hidden shadow-2xl shadow-white/10"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {steps[step].button}
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-black/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" 
                  />
                </Button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="name-setup"
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="relative w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-[40px] p-10 shadow-[0_0_120px_rgba(0,0,0,0.8)]"
          >
             <div className="absolute -top-32 -right-32 w-64 h-64 bg-amber-500/10 blur-[100px] rounded-full" />

             <div className="relative z-10 text-center">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.2 }}
                  className="mx-auto h-24 w-24 rounded-[32px] bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-10 shadow-inner"
                >
                  <User className="h-12 w-12 text-amber-400" />
                </motion.div>

                <h2 className="text-4xl font-medium tracking-tight text-white mb-4">
                  Almost there!
                </h2>
                <p className="text-white/40 font-light text-lg mb-10">
                  Choose a display name that represents your brand.
                </p>

                <div className="space-y-6">
                  <div className="relative group">
                    <Input
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="e.g. MrBeast Design"
                      className="h-16 bg-white/5 border-white/10 rounded-[22px] px-8 text-xl focus:border-amber-500/50 transition-all text-center placeholder:text-white/10 font-medium"
                      autoFocus
                      onKeyDown={(e) => e.key === "Enter" && saveProfile()}
                    />
                    <motion.div 
                      animate={{ opacity: [0.2, 0.5, 0.2] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-x-0 -bottom-px h-[2px] bg-gradient-to-r from-transparent via-amber-500/50 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity" 
                    />
                  </div>

                  <Button 
                    onClick={saveProfile}
                    disabled={isSubmitting || !displayName.trim()}
                    className="w-full h-16 bg-amber-500 text-black hover:bg-amber-400 rounded-[22px] font-bold text-xl shadow-2xl shadow-amber-500/20 active:scale-[0.98] transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <div className="h-6 w-6 border-3 border-black/20 border-t-black animate-spin rounded-full" />
                    ) : (
                      <span className="flex items-center gap-2">
                        Get Started <Zap className="h-5 w-5 fill-current" />
                      </span>
                    )}
                  </Button>
                </div>

                <p className="mt-8 text-[11px] text-white/10 uppercase tracking-[0.4em] font-bold">
                  Secure Onboarding v2.1
                </p>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
