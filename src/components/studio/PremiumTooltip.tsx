import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface PremiumTooltipProps {
  children: React.ReactNode;
  content: string;
  delay?: number;
}

export function PremiumTooltip({ children, content, delay = 0.3 }: PremiumTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    // Optional: Follow mouse, but for toolbars fixed position is usually cleaner
  };

  return (
    <div 
      className="relative flex items-center justify-center"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            transition={{ duration: 0.15, delay: isVisible ? delay : 0, ease: "easeOut" }}
            className="absolute bottom-full mb-3 px-3 py-1.5 bg-[#111111]/90 backdrop-blur-md border border-white/10 rounded-lg shadow-2xl pointer-events-none z-[100] whitespace-nowrap"
          >
            <span className="text-[11px] font-bold text-white/80 uppercase tracking-[0.15em]">
              {content}
            </span>
            {/* Arrow */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-8 border-transparent border-t-[#111111]/90" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
