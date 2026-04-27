import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface PremiumTooltipProps {
  children: React.ReactNode;
  content: string;
  delay?: number;
}

export function PremiumTooltip({ children, content, delay = 0.3 }: PremiumTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div 
      className="relative flex items-center justify-center shrink-0"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute bottom-full mb-3 px-3 py-1.5 bg-[#0a0a0a] border border-white/10 rounded-lg shadow-2xl pointer-events-none z-[999] whitespace-nowrap"
          >
            <span className="text-[10px] font-bold text-white/70 uppercase tracking-[0.2em]">
              {content}
            </span>
            {/* Minimal Arrow */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-[5px] border-transparent border-t-[#0a0a0a]" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
