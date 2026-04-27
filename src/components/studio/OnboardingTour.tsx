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

  const steps = [
    {
      icon: Sparkles,
      title: "Welcome to the Future",
      description: "You're about to create thumbnails that stop the scroll. Ready for a 30-second power tour?",
      button: "Begin the Journey",
      color: "text-purple-400",
      bg: "bg-purple-600/20",
      glow: "from-purple-500/20 to-transparent",
      targetId: null
    },
    {
      icon: Paintbrush,
      title: "The AI Studio",
      description: "This is your canvas. Generate or upload thumbnails here to start editing with our specialized YouTube AI.",
      button: "Next: Reality Check",
      color: "text-blue-400",
      bg: "bg-blue-600/20",
      glow: "from-blue-500/20 to-transparent",
      targetId: "studio-canvas"
    },
    {
      icon: Layout,
      title: "Reality Check Tool",
      description: "Use these controls to test your thumbnail against the YouTube UI and mobile viewports. Don't let your best parts be hidden!",
      button: "Show me Community",
      color: "text-amber-400",
      bg: "bg-amber-600/20",
      glow: "from-amber-500/20 to-transparent",
      targetId: "studio-toolbar"
    },
    {
      icon: Trophy,
      title: "Community Hall of Fame",
      description: "Access the community showcase here. Share your best designs and see what's trending among other creators.",
      button: "Final Step",
      color: "text-emerald-400",
      bg: "bg-emerald-600/20",
      glow: "from-emerald-600/20 to-transparent",
      targetId: "sidebar-community"
    }
  ];

  useEffect(() => {
    const isDone = localStorage.getItem("thumbforge_onboarding_done");
    const forceOnboarding = localStorage.getItem("force_onboarding") === "true";

    if (!isDone || forceOnboarding) {
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
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
    } else {
      setTargetRect(null);
    }
  }, [step, isVisible]);

  // Handle window resize to update targetRect
  useEffect(() => {
    const handleResize = () => {
      if (isVisible && step < steps.length) {
        const targetId = steps[step].targetId;
        if (targetId) {
          const el = document.getElementById(targetId);
          if (el) setTargetRect(el.getBoundingClientRect());
        }
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isVisible, step]);

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
      
      toast.success(`Welcome to the team, ${displayName}!`);
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
      {/* Background Overlay with Spotlight Hole */}
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
                    rx: 16
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

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ 
              y: [0, -100, 0],
              opacity: [0, 0.4, 0],
              x: [0, Math.random() * 50 - 25, 0]
            }}
            transition={{ duration: 10 + Math.random() * 5, repeat: Infinity }}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{ 
              left: `${Math.random() * 100}%`, 
              top: `${Math.random() * 100}%` 
            }}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step < 4 ? (
          <motion.div
            key={`step-${step}`}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: targetRect ? 0 : 0,
              // If targetRect exists, try to position near it, otherwise center
              ...(targetRect ? {
                 x: targetRect.left > window.innerWidth / 2 ? -200 : 200,
                 y: targetRect.top > window.innerHeight / 2 ? -200 : 200
              } : {})
            }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="relative w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-[40px] p-8 shadow-[0_0_100px_rgba(0,0,0,1)] overflow-hidden pointer-events-auto"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${steps[step].glow} opacity-30 transition-all duration-1000`} />
            
            <div className="relative z-10">
              <div className="flex justify-between items-center mb-8">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className={`h-14 w-14 rounded-[20px] ${steps[step].bg} flex items-center justify-center border border-white/10`}
                >
                  {(() => {
                    const Icon = steps[step].icon;
                    return <Icon className={`h-7 w-7 ${steps[step].color}`} />;
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

              <h2 className="text-3xl font-medium tracking-tight text-white mb-4 leading-tight">
                {steps[step].title}
              </h2>
              <p className="text-white/40 font-light text-lg leading-relaxed mb-10">
                {steps[step].description}
              </p>

              <Button 
                onClick={handleNext}
                className="w-full h-14 bg-white text-black hover:bg-white/90 rounded-[20px] font-bold text-lg active:scale-[0.95] transition-all shadow-xl"
              >
                {steps[step].button} <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="name-setup"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-[40px] p-10 shadow-2xl pointer-events-auto"
          >
             <div className="relative z-10 text-center">
                <div className="mx-auto h-20 w-20 rounded-[32px] bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-8">
                  <User className="h-10 w-10 text-amber-400" />
                </div>
                <h2 className="text-3xl font-medium tracking-tight text-white mb-2">Final Step</h2>
                <p className="text-white/40 font-light mb-8 text-lg">Choose a display name for the community.</p>
                <div className="space-y-4">
                  <Input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Display Name"
                    className="h-14 bg-white/5 border-white/10 rounded-[20px] px-6 text-lg text-center"
                    autoFocus
                    onKeyDown={(e) => e.key === "Enter" && saveProfile()}
                  />
                  <Button 
                    onClick={saveProfile}
                    disabled={isSubmitting || !displayName.trim()}
                    className="w-full h-14 bg-amber-500 text-black hover:bg-amber-400 rounded-[20px] font-bold text-lg"
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
