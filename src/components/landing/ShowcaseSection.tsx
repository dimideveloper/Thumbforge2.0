import { motion } from "framer-motion";
import { useCallback, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const showcaseImages = [
  {
    url: "/thumbnailpreview/My first thumbnail (1).png",
    title: "Minecraft Survival",
  },
  {
    url: "/thumbnailpreview/My first thumbnail (2).png",
    title: "Roblox Tycoon",
  },
  {
    url: "/thumbnailpreview/My first thumbnail (3).png",
    title: "GTA V Roleplay",
  },
  {
    url: "/thumbnailpreview/My first thumbnail (4).png",
    title: "Battle Royale Action",
  },
  {
    url: "/thumbnailpreview/My first thumbnail (5).png",
    title: "Epic Quest",
  }
];

const ShowcaseSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const next = useCallback(() => {
    setCurrentIndex((current) => (current === showcaseImages.length - 1 ? 0 : current + 1));
  }, []);

  const prev = useCallback(() => {
    setCurrentIndex((current) => (current === 0 ? showcaseImages.length - 1 : current - 1));
  }, []);

  return (
    <section className="py-24 bg-gradient-to-b from-black to-[#050505] overflow-hidden">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-white/60 mb-6 backdrop-blur-md">
              Made with ThumbForge
            </span>
            <h2 className="text-3xl md:text-5xl font-medium text-white tracking-tight">
              Don't just take <span className="text-white/50">our word for it.</span>
            </h2>
            <p className="mt-6 text-white/40 max-w-lg mx-auto font-light text-lg">
              Check out these high-converting thumbnails generated purely by AI.
            </p>
          </motion.div>
        </div>

        {/* Carousel with Preview */}
        <div className="relative max-w-[1400px] mx-auto mt-12 px-4">
          <div className="relative flex items-center justify-center gap-4 lg:gap-8 overflow-visible">
            {/* Previous Preview */}
            <div 
              className="hidden lg:block w-1/4 aspect-video rounded-2xl overflow-hidden border border-white/5 opacity-20 scale-90 blur-[2px] transition-all duration-500 cursor-pointer hover:opacity-30"
              onClick={prev}
            >
              <img 
                src={showcaseImages[currentIndex === 0 ? showcaseImages.length - 1 : currentIndex - 1].url} 
                className="w-full h-full object-cover"
                alt="Previous"
              />
            </div>

            {/* Main Image */}
            <div className="relative w-full lg:w-1/2 group">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="aspect-video rounded-2xl overflow-hidden glass-card shadow-[0_0_40px_rgba(37,99,235,0.15)] relative z-10"
              >
                 <img 
                   src={showcaseImages[currentIndex].url} 
                   alt={showcaseImages[currentIndex].title}
                   className="w-full h-full object-cover"
                   onError={(e) => {
                     (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25'%3E%3Crect width='100%25' height='100%25' fill='%231a1a1a'/%3E%3Ctext x='50%25' y='50%25' font-family='sans-serif' font-size='24' fill='%234a4a4a' text-anchor='middle' dominant-baseline='middle'%3EThumbnail Preview%3C/text%3E%3C/svg%3E";
                   }}
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
              </motion.div>

              {/* Quick Navigation Arrows on Hover */}
              <button 
                onClick={prev}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-primary/20 hover:bg-primary/40 backdrop-blur-md border border-primary/30 flex items-center justify-center text-primary opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button 
                onClick={next}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-primary/20 hover:bg-primary/40 backdrop-blur-md border border-primary/30 flex items-center justify-center text-primary opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            {/* Next Preview */}
            <div 
              className="hidden lg:block w-1/4 aspect-video rounded-2xl overflow-hidden border border-white/5 opacity-20 scale-90 blur-[2px] transition-all duration-500 cursor-pointer hover:opacity-30"
              onClick={next}
            >
              <img 
                src={showcaseImages[currentIndex === showcaseImages.length - 1 ? 0 : currentIndex + 1].url} 
                className="w-full h-full object-cover"
                alt="Next"
              />
            </div>
          </div>

          {/* Pagination Indicators */}
          <div className="flex items-center justify-center gap-2 mt-10">
            {showcaseImages.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  currentIndex === i ? "bg-primary w-8 shadow-[0_0_10px_rgba(37,99,235,0.5)]" : "bg-white/10 hover:bg-white/30 w-1.5"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ShowcaseSection;
