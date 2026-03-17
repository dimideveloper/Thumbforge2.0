import { motion } from "framer-motion";

const stats = [
  { value: "2,500+", label: "Creators using ThumbForge" },
  { value: "47%", label: "Average CTR increase" },
  { value: "<5s", label: "Generation time per thumbnail" },
  { value: "10+", label: "Supported game titles" },
];

const StatsSection = () => (
  <section className="py-16 border-y border-white/5">
    <div className="container px-4 md:px-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className="text-center"
          >
            <div className="text-4xl md:text-5xl font-medium text-white tracking-tight mb-2">
              {stat.value}
            </div>
            <div className="text-sm text-white/40 font-light">{stat.label}</div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default StatsSection;
