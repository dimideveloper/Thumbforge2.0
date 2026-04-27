import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Sparkles, Zap, Bug, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function NewsModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasSeenNews = localStorage.getItem("news_support_v1_seen");
    if (!hasSeenNews) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1500); // Small delay for better UX
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem("news_support_v1_seen", "true");
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[500px] bg-[#0a0a0a]/95 border-white/10 backdrop-blur-2xl p-0 overflow-hidden rounded-3xl">
        <div className="relative p-8">
          {/* Background Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-white/5 blur-[80px] rounded-full -z-10" />
          
          <DialogHeader className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Badge className="bg-white/10 text-white/70 border-white/10 px-2 py-0.5 font-light text-[10px] tracking-wider uppercase">
                Update v2.0
              </Badge>
              <div className="h-px flex-1 bg-white/5" />
            </div>
            <DialogTitle className="text-3xl font-semibold text-white tracking-tight leading-tight">
              What's New in <span className="text-white">ThumbForge</span>
            </DialogTitle>
            <DialogDescription className="text-white/40 font-light text-base pt-2">
              We've been working hard to make your experience even better. Check out the latest features!
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Feature 1 */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="flex gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/5 group hover:border-white/10 transition-all"
            >
              <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <MessageSquare className="h-5 w-5 text-white/80" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-white mb-1 flex items-center gap-2">
                  New Support System
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/20 text-[9px] px-1.5 py-0 h-4">NEW</Badge>
                </h4>
                <p className="text-xs text-white/40 leading-relaxed font-light">
                  Need help? Open a support ticket directly from your dashboard and chat with our team in real-time.
                </p>
              </div>
            </motion.div>

            {/* Feature 2 */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/5 group hover:border-white/10 transition-all"
            >
              <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Bug className="h-5 w-5 text-white/80" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-white mb-1">Bug Fixes & Polish</h4>
                <p className="text-xs text-white/40 leading-relaxed font-light">
                  We've smashed some pesky bugs and improved general performance to keep your workflow smooth.
                </p>
              </div>
            </motion.div>

            {/* Feature 3 */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="flex gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/5 group hover:border-white/10 transition-all"
            >
              <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Sparkles className="h-5 w-5 text-white/80" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-white mb-1">UI Optimizations</h4>
                <p className="text-xs text-white/40 leading-relaxed font-light">
                  Enjoy a cleaner, faster interface with updated navigation and improved loading states.
                </p>
              </div>
            </motion.div>
          </div>

          <div className="mt-10">
            <Button 
              onClick={handleClose}
              className="w-full h-12 bg-white text-black hover:bg-white/90 rounded-xl font-medium flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              Got it, thanks!
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
