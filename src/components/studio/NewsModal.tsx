import { useState, useEffect } from "react";
import { 
  MessageSquare, Sparkles, Zap, Bug, ChevronRight, 
  LifeBuoy, ShieldCheck, X as XIcon 
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

export function NewsModal() {
  const [isOpen, setIsOpen] = useState(false);
  const NEWS_KEY = "thumbforge_news_v1_seen";

  useEffect(() => {
    const hasSeen = localStorage.getItem(NEWS_KEY);
    if (!hasSeen) {
      // Small delay for better UX
      const timer = setTimeout(() => setIsOpen(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem(NEWS_KEY, "true");
    setIsOpen(false);
  };

  const newsItems = [
    {
      icon: LifeBuoy,
      title: "New Support System",
      description: "Direct chat with our team. Track your tickets and get help faster than ever.",
      color: "text-blue-400",
      bg: "bg-blue-500/10"
    },
    {
      icon: Bug,
      title: "Performance & Bug Fixes",
      description: "We've ironed out the 'Illegal constructor' issues and improved overall studio stability.",
      color: "text-amber-400",
      bg: "bg-amber-500/10"
    },
    {
      icon: Sparkles,
      title: "Enhanced AI Editing",
      description: "Better prompt understanding and faster thumbnail generation modes.",
      color: "text-purple-400",
      bg: "bg-purple-500/10"
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
      <DialogContent className="max-w-lg p-0 overflow-hidden border-white/10 bg-black/90 backdrop-blur-2xl shadow-2xl rounded-[32px]">
        <div className="relative p-8 pt-10">
          {/* Background Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-white/5 blur-[80px] rounded-full pointer-events-none" />
          
          <DialogHeader className="text-left mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Update Notification</span>
            </div>
            <DialogTitle className="text-3xl font-medium tracking-tight text-white mb-2">
              What's New in ThumbForge
            </DialogTitle>
            <DialogDescription className="text-white/40 font-light text-base">
              We've been working hard to make your experience even better. Here's what changed:
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mb-10">
            {newsItems.map((item, idx) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + idx * 0.1 }}
                className="group flex items-start gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/10 hover:bg-white/[0.05] transition-all"
              >
                <div className={`h-10 w-10 rounded-xl ${item.bg} flex items-center justify-center shrink-0`}>
                  <item.icon className={`h-5 w-5 ${item.color}`} />
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-medium mb-1 flex items-center justify-between">
                    {item.title}
                    <ChevronRight className="h-3 w-3 text-white/0 group-hover:text-white/40 transition-all -translate-x-2 group-hover:translate-x-0" />
                  </h4>
                  <p className="text-sm text-white/40 font-light leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <Button 
            onClick={handleClose}
            className="w-full h-14 bg-white text-black hover:bg-white/90 rounded-2xl font-medium text-lg shadow-xl active:scale-[0.98] transition-all"
          >
            Get Started
          </Button>

          <p className="text-center mt-6 text-[11px] text-white/20 font-light">
            Version 2.0.4 · <span className="hover:text-white/40 transition-colors cursor-help">View Changelog</span>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
