import { motion } from "framer-motion";
import { RefreshCw, UserCircle, Smile } from "lucide-react";

const features = [
  {
    icon: RefreshCw,
    title: "Instant Reshoot",
    description: "Swap backgrounds, poses, and angles instantly. Generate dozens of thumbnail variations in seconds.",
  },
  {
    icon: UserCircle,
    title: "Persona Integration",
    description: "Drop your persona into any gaming scene. Perfect lighting and blending — every single time.",
  },
  {
    icon: Smile,
    title: "Expression AI",
    description: "Generate hyper-realistic expressive reactions that drive clicks. Proven to boost CTR.",
  },
];

const FeaturesGrid = () => (
  <section id="features" className="py-24">
    <div className="container px-4 md:px-6">
      <div className="text-center mb-20">
        <h2 className="text-3xl md:text-5xl font-medium text-white tracking-tight">
          Tools built for <span className="text-white/60">creators.</span>
        </h2>
        <p className="mt-6 text-white/50 max-w-lg mx-auto font-light text-lg">
          No complex menus or steep learning curves. Just what you need to get the click.
        </p>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.6, ease: "easeOut" }}
            className="glass-card rounded-2xl p-10 hover:border-primary/50 transition-all duration-300 hover:-translate-y-1"
          >
            <div className="mb-8">
              <f.icon className="h-8 w-8 text-primary drop-shadow-[0_0_15px_rgba(37,99,235,0.5)]" strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-medium text-white mb-3">{f.title}</h3>
            <p className="text-white/50 leading-relaxed font-light">{f.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default FeaturesGrid;
