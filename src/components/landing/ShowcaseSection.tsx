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

        {/* Carousel / Image Grid */}
        <div className="relative max-w-5xl mx-auto mt-12">
          {/* Main Image */}
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="aspect-video rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative bg-[#111]"
          >
             <img 
               src={showcaseImages[currentIndex].url} 
               alt={showcaseImages[currentIndex].title}
               className="w-full h-full object-cover"
               onError={(e) => {
                 // Fallback to a gradient if the image doesn't load
                 (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25'%3E%3Crect width='100%25' height='100%25' fill='%231a1a1a'/%3E%3Ctext x='50%25' y='50%25' font-family='sans-serif' font-size='24' fill='%234a4a4a' text-anchor='middle' dominant-baseline='middle'%3EThumbnail Preview%3C/text%3E%3C/svg%3E";
               }}
             />
             <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
          </motion.div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <button 
              onClick={prev}
              className="h-12 w-12 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="flex gap-2">
              {showcaseImages.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    currentIndex === i ? "bg-white w-8" : "bg-white/20 hover:bg-white/40"
                  }`}
                />
              ))}
            </div>
            <button 
              onClick={next}
              className="h-12 w-12 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ShowcaseSection;
