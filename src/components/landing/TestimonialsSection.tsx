import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "xHunter",
    handle: "@xhunter_yt",
    subs: "280K subs",
    avatar: "/thumbnailpreview/profile-picture/fortnite-profile-pictures-bqg4qwupkufdpo0p.jpg",
    text: "My CTR went from 4.2% to 7.1% after switching to ThumbForge. The AI just gets what makes people click. Insane tool.",
    stars: 5,
  },
  {
    name: "NovaMC",
    handle: "@nova_minecraft",
    subs: "92K subs",
    avatar: "/thumbnailpreview/profile-picture/a1715a199811891.672d8b108e519.png",
    text: "I used to spend 2 hours per thumbnail in Photoshop. Now it takes 3 minutes. ThumbForge is a game-changer for solo creators.",
    stars: 5,
  },
  {
    name: "BlastZone",
    handle: "@blastzone_yt",
    subs: "540K subs",
    avatar: "/thumbnailpreview/profile-picture/adb00d104108703.Y3JvcCw5OTksNzgyLDAsMjk.png",
    text: "The Skin Replacer alone is worth it. I can put my Minecraft skin into any thumbnail style without any editing skills.",
    stars: 5,
  },
  {
    name: "PixelRush",
    handle: "@pixelrush",
    subs: "61K subs",
    avatar: "/thumbnailpreview/profile-picture/f8da0787336023.5db5360d419ed.png",
    text: "Never thought AI could actually understand 'make it more epic'. ThumbForge nails it every time. My channel growth spiked.",
    stars: 5,
  },
  {
    name: "GrindKing",
    handle: "@grindking_yt",
    subs: "175K subs",
    avatar: "/thumbnailpreview/profile-picture/gaming-profile-pictures-pfp-screenshot.avif",
    text: "Best investment I made for my channel. The quick edits feature alone saves me hours every week.",
    stars: 5,
  },
  {
    name: "VortexClips",
    handle: "@vortexclips",
    subs: "38K subs",
    avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Vortex&backgroundColor=c0aede",
    text: "As a small creator without budget for a designer, this is EXACTLY what I needed. Pro thumbnails, zero skills required.",
    stars: 5,
  },
];

const TestimonialsSection = () => (
  <section id="testimonials" className="py-24 overflow-hidden">
    <div className="container px-4 md:px-6">
      <div className="text-center mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-white/60 mb-6 backdrop-blur-md">
            Creator love
          </span>
          <h2 className="text-3xl md:text-5xl font-medium text-white tracking-tight">
            Creators who switched{" "}
            <span className="text-white/50">never looked back.</span>
          </h2>
          <p className="mt-6 text-white/40 max-w-lg mx-auto font-light text-lg">
            Real results from real YouTubers across every game.
          </p>
        </motion.div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {testimonials.map((t, i) => (
          <motion.div
            key={t.handle}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, duration: 0.5 }}
            className="rounded-3xl border border-white/[0.07] bg-[#0a0a0a] p-7 flex flex-col gap-5 hover:border-white/15 transition-colors"
          >
            {/* Stars */}
            <div className="flex gap-0.5">
              {Array.from({ length: t.stars }).map((_, s) => (
                <Star key={s} className="h-3.5 w-3.5 fill-white/80 text-white/80" />
              ))}
            </div>

            {/* Quote */}
            <p className="text-white/70 text-sm leading-relaxed font-light flex-1">
              "{t.text}"
            </p>

            {/* Author */}
            <div className="flex items-center gap-3 pt-2 border-t border-white/5">
              <img 
                src={t.avatar} 
                alt={t.name}
                className="h-9 w-9 rounded-full bg-white/10 shrink-0 object-cover border border-white/5"
              />
              <div>
                <div className="text-sm font-medium text-white">{t.name}</div>
                <div className="text-xs text-white/40 font-light">
                  {t.handle} · {t.subs}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default TestimonialsSection;
