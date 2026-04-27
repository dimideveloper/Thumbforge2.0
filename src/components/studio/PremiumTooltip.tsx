import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";

interface PremiumTooltipProps {
  children: React.ReactNode;
  content: string;
  delay?: number;
}

export function PremiumTooltip({ children, content, delay = 0.3 }: PremiumTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.top,
        left: rect.left + rect.width / 2
      });
    }
  }, [isVisible]);

  return (
    <div 
      ref={triggerRef}
      className="relative flex items-center justify-center shrink-0"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && createPortal(
        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0, y: 10, x: "-50%", scale: 0.95 }}
            animate={{ opacity: 1, y: 0, x: "-50%", scale: 1 }}
            exit={{ opacity: 0, y: 10, x: "-50%", scale: 0.95 }}
            transition={{ duration: 0.1, ease: "easeOut" }}
            style={{ 
              position: 'fixed',
              top: position.top - 12, // Offset above the icon
              left: position.left,
              transform: 'translateX(-50%)',
              zIndex: 9999
            }}
            className="px-3 py-1.5 bg-[#0a0a0a] border border-white/10 rounded-lg shadow-2xl pointer-events-none whitespace-nowrap flex flex-col items-center"
          >
            <span className="text-[10px] font-bold text-white/80 uppercase tracking-[0.2em]">
              {content}
            </span>
            {/* Minimal Arrow */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-[5px] border-transparent border-t-[#0a0a0a]" />
          </motion.div>
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
