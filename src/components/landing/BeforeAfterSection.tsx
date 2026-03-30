import { useState, useRef, useEffect } from "react";
import { motion, useInView, animate } from "framer-motion";

const BeforeAfterSection = () => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.5 });

  useEffect(() => {
    if (isInView) {
      // High-performance Framer Motion animation
      const controls = animate(10, 90, {
        duration: 1.5,
        ease: "easeInOut",
        delay: 0.5,
        onUpdate: (latest) => setSliderPosition(latest),
        onComplete: () => {
          animate(90, 50, {
            duration: 1.2,
            ease: "circOut",
            delay: 0.3,
            onUpdate: (latest) => setSliderPosition(latest),
          });
        }
      });
      return () => controls.stop();
    }
  }, [isInView]);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = (x / rect.width) * 100;
    setSliderPosition(percent);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) handleMove(e.clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging) handleMove(e.touches[0].clientX);
  };

  useEffect(() => {
    const handleUp = () => setIsDragging(false);
    window.addEventListener("mouseup", handleUp);
    window.addEventListener("touchend", handleUp);
    return () => {
      window.removeEventListener("mouseup", handleUp);
      window.removeEventListener("touchend", handleUp);
    };
  }, []);

  return (
    <section className="py-24 bg-black overflow-hidden">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-medium tracking-tight mb-4"
          >
            From Draft to <span className="text-white/60">Masterpiece</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-white/40 text-lg max-w-2xl mx-auto font-light"
          >
            See for yourself how ThumbForge transforms your thumbnails with just one click. Drag the slider to see the difference.
          </motion.p>
        </div>

        <div className="max-w-4xl mx-auto relative group">
          <div 
            ref={containerRef}
            className="relative aspect-video rounded-2xl overflow-hidden glass-card cursor-ew-resize select-none shadow-[0_0_40px_rgba(37,99,235,0.15)] group-hover:shadow-[0_0_50px_rgba(37,99,235,0.25)] transition-shadow duration-500"
            onMouseMove={handleMouseMove}
            onTouchMove={handleTouchMove}
            onMouseDown={() => setIsDragging(true)}
            onTouchStart={() => setIsDragging(true)}
          >
            {/* After Image (Base) */}
            <img 
              src="/thumbnailpreview/profile-picture/vorhernacher/nachher.png" 
              alt="Nachher"
              className="absolute inset-0 w-full h-full object-cover"
              draggable={false}
            />

            {/* Before Image (Clipped) */}
            <div 
              className="absolute inset-0 w-full h-full overflow-hidden"
              style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
            >
              <img 
                src="/thumbnailpreview/profile-picture/vorhernacher/vorher.png" 
                alt="Vorher"
                className="absolute inset-0 w-full h-full object-cover"
                draggable={false}
              />
            </div>

            {/* Slider Handle */}
            <div 
              className="absolute inset-y-0 w-1 bg-primary shadow-[0_0_15px_rgba(37,99,235,0.5)] z-10"
              style={{ left: `${sliderPosition}%` }}
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.5)] border-4 border-white/10 group-active:scale-110 transition-transform">
                <div className="flex gap-1">
                  <div className="w-1 h-3 bg-white/60 rounded-full" />
                  <div className="w-1 h-3 bg-white/60 rounded-full" />
                </div>
              </div>
            </div>

            {/* Labels */}
            <div className="absolute top-6 left-6 px-4 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-xs font-medium tracking-wider text-white/70 pointer-events-none uppercase">
              Before
            </div>
            <div className="absolute top-6 right-6 px-4 py-1.5 rounded-full bg-primary text-primary-foreground border border-primary/50 shadow-[0_0_15px_rgba(37,99,235,0.4)] text-xs font-medium tracking-wider pointer-events-none uppercase">
              After
            </div>
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/[0.02] rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/[0.02] rounded-full blur-3xl pointer-events-none" />
        </div>
      </div>
    </section>
  );
};

export default BeforeAfterSection;
