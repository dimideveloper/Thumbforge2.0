import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, Paintbrush, Trophy, Layout, 
  Smartphone, User, Check, ArrowRight, X 
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
  const [step, setStep] = useState(0); // 0: Welcome, 1: Inspiration, 2: Studio, 3: Reality Check, 4: Community, 5: Name
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
  const handleSkip = () => setStep(5); // Go straight to name setup

  const saveProfile = async () => {
    if (!displayName.trim()) {
      toast.error("Please enter a name!");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ full_name: displayName.trim() })
        .eq("user_id", user.id);

      if (error) throw error;

      localStorage.setItem("thumbforge_onboarding_done", "true");
      // Remove force flag after successful test run if it exists
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

  const steps = [
    {
      icon: Sparkles,
      title: "Welcome to ThumbForge 2.0",
      description: "Let's take a 30-second tour to show you how to create thumbnails that actually get clicks.",
      button: "Let's Go",
      color: "text-purple-400",
      bg: "bg-purple-500/10"
    },
    {
      icon: Paintbrush,
      title: "The AI Studio",
      description: "Our AI doesn't just generate images; it understands lighting, composition, and high-CTR patterns for YouTube.",
      button: "Next: Inspiration",
      color: "text-blue-400",
      bg: "bg-blue-500/10"
    },
    {
      icon: Layout,
      title: "YouTube Reality Check",
      description: "Check your designs with real YouTube UI overlays and mobile previews to ensure perfect readability.",
      button: "Almost done...",
      color: "text-amber-400",
      bg: "bg-amber-500/10"
    },
    {
      icon: Trophy,
      title: "Hall of Fame",
      description: "Share your best creations with the community, get likes, and inspire others with your prompts.",
      button: "One last thing",
      color: "text-emerald-400",
      bg: "bg-emerald-500/10"
    }
  ];

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-0">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />

      <AnimatePresence mode="wait">
        {step < 4 ? (
          <motion.div
            key="tutorial"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.1, y: -20 }}
            className="relative w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-[32px] p-8 shadow-2xl overflow-hidden"
          >
            {/* Background Glow */}
            <div className={`absolute -top-24 -left-24 w-48 h-48 blur-[80px] rounded-full opacity-20 ${steps[step].bg}`} />

            <div className="relative z-10">
              <div className="flex justify-between items-start mb-8">
                <div className={`h-14 w-14 rounded-2xl ${steps[step].bg} flex items-center justify-center border border-white/5`}>
                  {(() => {
                    const Icon = steps[step].icon;
                    return <Icon className={`h-7 w-7 ${steps[step].color}`} />;
                  })()}
                </div>
                <button 
                  onClick={handleSkip}
                  className="text-white/20 hover:text-white text-xs font-medium uppercase tracking-widest transition-colors"
                >
                  Skip Tour
                </button>
              </div>

              <h2 className="text-3xl font-medium tracking-tight text-white mb-4">
                {steps[step].title}
              </h2>
              <p className="text-white/40 font-light text-lg leading-relaxed mb-10">
                {steps[step].description}
              </p>

              <div className="flex items-center gap-4">
                <Button 
                  onClick={handleNext}
                  className="flex-1 h-14 bg-white text-black hover:bg-white/90 rounded-2xl font-medium text-lg active:scale-[0.98] transition-all"
                >
                  {steps[step].button}
                </Button>
                <div className="flex gap-1.5 px-2">
                  {steps.map((_, i) => (
                    <div 
                      key={i} 
                      className={`h-1.5 rounded-full transition-all duration-500 ${i === step ? 'w-6 bg-white' : 'w-1.5 bg-white/10'}`} 
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="name-setup"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-[32px] p-8 shadow-2xl"
          >
             <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/20 blur-[80px] rounded-full" />

             <div className="relative z-10 text-center">
                <div className="mx-auto h-20 w-20 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-8">
                  <User className="h-10 w-10 text-amber-400" />
                </div>

                <h2 className="text-3xl font-medium tracking-tight text-white mb-2">
                  One last thing...
                </h2>
                <p className="text-white/40 font-light mb-8">
                  How should we call you in the ThumbForge community?
                </p>

                <div className="space-y-4">
                  <div className="relative group">
                    <Input
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Your Display Name"
                      className="h-14 bg-white/5 border-white/10 rounded-2xl px-6 text-lg focus:border-amber-500/50 transition-all text-center placeholder:text-white/20"
                      autoFocus
                      onKeyDown={(e) => e.key === "Enter" && saveProfile()}
                    />
                    <div className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity" />
                  </div>

                  <Button 
                    onClick={saveProfile}
                    disabled={isSubmitting || !displayName.trim()}
                    className="w-full h-14 bg-white text-black hover:bg-white/90 rounded-2xl font-medium text-lg shadow-xl shadow-white/5 active:scale-[0.98] transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <div className="h-5 w-5 border-2 border-black/20 border-t-black animate-spin rounded-full" />
                    ) : (
                      "Finish Setup"
                    )}
                  </Button>
                </div>

                <p className="mt-6 text-[10px] text-white/20 uppercase tracking-[0.2em] font-medium">
                  You can change this later in settings
                </p>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
