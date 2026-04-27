import { useState, useEffect, useRef } from "react";
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
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  const steps = [
    {
      icon: Sparkles,
      title: "Welcome to the Future",
      description: "You're about to create thumbnails that stop the scroll. Ready for a quick tour?",
      button: "Begin",
      color: "text-purple-400",
      bg: "bg-purple-600/20",
      glow: "from-purple-500/20 to-transparent",
      targetId: null
    },
    {
      icon: Paintbrush,
      title: "The AI Studio",
      description: "This is your canvas. Generate or upload thumbnails here to start editing with our specialized YouTube AI.",
      button: "Next",
      color: "text-blue-400",
      bg: "bg-blue-600/20",
      glow: "from-blue-500/20 to-transparent",
      targetId: "studio-canvas"
    },
    {
      icon: Layout,
      title: "Reality Check Tool",
      description: "Use these controls to test your thumbnail against the YouTube UI and mobile viewports.",
      button: "Show Community",
      color: "text-amber-400",
      bg: "bg-amber-600/20",
      glow: "from-amber-500/20 to-transparent",
      targetId: "studio-toolbar"
    },
    {
      icon: Trophy,
      title: "Hall of Fame",
      description: "Access the community showcase here. Share your best designs and see what's trending.",
      button: "Final Step",
      color: "text-emerald-400",
      bg: "bg-emerald-600/20",
      glow: "from-emerald-600/20 to-transparent",
      targetId: "sidebar-community"
    }
  ];

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    
    const isDone = localStorage.getItem("thumbforge_onboarding_done");
    const forceOnboarding = localStorage.getItem("force_onboarding") === "true";

    if (!isDone || forceOnboarding) {
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => {
        clearTimeout(timer);
        window.removeEventListener("resize", checkMobile);
      };
    }
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (isVisible && step < steps.length) {
      const targetId = steps[step].targetId;
      if (targetId) {
        const el = document.getElementById(targetId);
        if (el) {
          setTargetRect(el.getBoundingClientRect());
        } else {
          setTargetRect(null);
        }
      } else {
        setTargetRect(null);
      }
    }
  }, [step, isVisible]);

  const handleNext = () => setStep((s) => s + 1);
  const handleSkip = () => setStep(4);

  const saveProfile = async () => {
    if (!displayName.trim()) {
      toast.error("Please enter a name!");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ display_name: displayName.trim() })
        .eq("user_id", user.id);

      if (error) throw error;

      localStorage.setItem("thumbforge_onboarding_done", "true");
      localStorage.removeItem("force_onboarding");
      
      toast.success(`Welcome, ${displayName}!`);
      onComplete(displayName);
      setIsVisible(false);
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to save your name.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none p-4 md:p-0">
      <div className="absolute inset-0 pointer-events-auto overflow-hidden">
        <svg className="w-full h-full">
          <defs>
            <mask id="spotlight-mask">
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              {targetRect && (
                <motion.rect
                  initial={false}
                  animate={{
                    x: targetRect.left - 8,
                    y: targetRect.top - 8,
                    width: targetRect.width + 16,
                    height: targetRect.height + 16,
                    rx: isMobile ? 12 : 24
                  }}
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                  fill="black"
                />
              )}
            </mask>
          </defs>
          <rect 
            x="0" y="0" width="100%" height="100%" 
            fill="rgba(0,0,0,0.85)" 
            mask="url(#spotlight-mask)"
            className="backdrop-blur-[2px]"
          />
        </svg>
      </div>

      <AnimatePresence mode="wait">
        {step < 4 ? (
          <motion.div
            key={`step-${step}`}
            initial={isMobile ? { y: "100%" } : { opacity: 0, scale: 0.8, y: 20 }}
            animate={isMobile 
              ? { y: 0 } 
              : { 
                  opacity: 1, 
                  scale: 1, 
                  x: targetRect ? (targetRect.left > window.innerWidth / 2 ? -240 : 240) : 0,
                  y: targetRect ? (targetRect.top > window.innerHeight / 2 ? -150 : 150) : 0
                }
            }
            exit={isMobile ? { y: "100%" } : { opacity: 0, scale: 1.1 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={`
              relative w-full bg-[#0a0a0a] border border-white/10 rounded-[32px] md:rounded-[40px] p-6 md:p-8 shadow-2xl overflow-hidden pointer-events-auto
              ${isMobile ? 'fixed bottom-4 left-4 right-4 max-w-none' : 'max-w-md'}
            `}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${steps[step].glow} opacity-30 transition-all duration-1000`} />
            
            <div className="relative z-10">
              <div className="flex justify-between items-center mb-6 md:mb-8">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className={`h-12 w-12 md:h-14 md:w-14 rounded-[16px] md:rounded-[20px] ${steps[step].bg} flex items-center justify-center border border-white/10`}
                >
                  {(() => {
                    const Icon = steps[step].icon;
                    return <Icon className={`h-6 w-6 md:h-7 md:w-7 ${steps[step].color}`} />;
                  })()}
                </motion.div>
                <div className="flex items-center gap-4">
                  <button onClick={handleSkip} className="text-white/20 hover:text-white text-[10px] font-bold uppercase tracking-widest">Skip</button>
                  <div className="flex gap-1.5">
                    {steps.map((_, i) => (
                      <div key={i} className={`h-1 rounded-full transition-all duration-500 ${i === step ? 'w-6 bg-white' : 'w-1.5 bg-white/10'}`} />
                    ))}
                  </div>
                </div>
              </div>

              <h2 className="text-2xl md:text-3xl font-medium tracking-tight text-white mb-3 md:mb-4 leading-tight">
                {steps[step].title}
              </h2>
              <p className="text-white/40 font-light text-base md:text-lg leading-relaxed mb-8 md:mb-10">
                {steps[step].description}
              </p>

              <Button 
                onClick={handleNext}
                className="w-full h-12 md:h-14 bg-white text-black hover:bg-white/90 rounded-[16px] md:rounded-[20px] font-bold text-base md:text-lg active:scale-[0.95] transition-all"
              >
                {steps[step].button} <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="name-setup"
            initial={isMobile ? { y: "100%" } : { opacity: 0, scale: 0.9 }}
            animate={isMobile ? { y: 0 } : { opacity: 1, scale: 1 }}
            className={`
              relative w-full bg-[#0a0a0a] border border-white/10 rounded-[32px] md:rounded-[40px] p-8 md:p-10 shadow-2xl pointer-events-auto
              ${isMobile ? 'fixed bottom-4 left-4 right-4 max-w-none' : 'max-w-md'}
            `}
          >
             <div className="relative z-10 text-center">
                <div className="mx-auto h-16 w-16 md:h-20 md:w-20 rounded-[24px] md:rounded-[32px] bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-6 md:mb-8 text-amber-400">
                  <User className="h-8 w-8 md:h-10 md:w-10" />
                </div>
                <h2 className="text-2xl md:text-3xl font-medium tracking-tight text-white mb-2">Final Step</h2>
                <p className="text-white/40 font-light mb-6 md:mb-8 text-base md:text-lg">Choose a display name for the community.</p>
                <div className="space-y-4">
                  <Input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Display Name"
                    className="h-12 md:h-14 bg-white/5 border-white/10 rounded-[16px] md:rounded-[20px] px-6 text-base md:text-lg text-center"
                    autoFocus
                    onKeyDown={(e) => e.key === "Enter" && saveProfile()}
                  />
                  <Button 
                    onClick={saveProfile}
                    disabled={isSubmitting || !displayName.trim()}
                    className="w-full h-12 md:h-14 bg-amber-500 text-black hover:bg-amber-400 rounded-[16px] md:rounded-[20px] font-bold text-base md:text-lg"
                  >
                    {isSubmitting ? "Saving..." : "Start Creating"}
                  </Button>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
