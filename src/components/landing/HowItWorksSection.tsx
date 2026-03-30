import { motion } from "framer-motion";
import { Upload, Wand2, Download } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Upload,
    title: "Upload your thumbnail",
    description:
      "Drag & drop any image or grab one directly from YouTube via the Inspiration tab. No preparation needed.",
  },
  {
    number: "02",
    icon: Wand2,
    title: "Tell the AI what to do",
    description:
      "Type a prompt like \"make it more epic\" or click a Quick Edit button. The AI understands your vision instantly.",
  },
  {
    number: "03",
    icon: Download,
    title: "Download & post",
    description:
      "Your upgraded thumbnail is ready in seconds. Download in full HD and post — watch your CTR climb.",
  },
];

const HowItWorksSection = () => (
  <section id="how-it-works" className="py-24">
    <div className="container px-4 md:px-6">
      <div className="text-center mb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-white/60 mb-6 backdrop-blur-md">
            How it works
          </span>
          <h2 className="text-3xl md:text-5xl font-medium text-white tracking-tight">
            From idea to viral thumbnail{" "}
            <span className="text-white/50">in 3 steps.</span>
          </h2>
          <p className="mt-6 text-white/40 max-w-lg mx-auto font-light text-lg">
            No prior design experience required. If you can type, you can use
            ThumbForge.
          </p>
        </motion.div>
      </div>

      <div className="grid md:grid-cols-3 gap-8 relative">
        {/* Connector line on desktop */}
        <div className="hidden md:block absolute top-16 left-[calc(16.67%+2rem)] right-[calc(16.67%+2rem)] h-px bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" />

        {steps.map((step, i) => (
          <motion.div
            key={step.number}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15, duration: 0.6, ease: "easeOut" }}
            className="flex flex-col items-center text-center p-8 glass-card rounded-2xl hover:border-primary/50 transition-all duration-300 relative group hover:-translate-y-1"
          >
            <div className="h-14 w-14 rounded-xl border border-primary/20 bg-primary/10 flex items-center justify-center mb-6 relative z-10 group-hover:scale-110 transition-transform duration-300">
              <step.icon className="h-6 w-6 text-primary drop-shadow-[0_0_10px_rgba(37,99,235,0.5)]" strokeWidth={1.5} />
            </div>
            <span className="text-[10px] font-bold text-white/20 tracking-[0.2em] uppercase mb-3">
              Step {step.number}
            </span>
            <h3 className="text-lg font-medium text-white mb-3">{step.title}</h3>
            <p className="text-white/40 leading-relaxed font-light text-sm">
              {step.description}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default HowItWorksSection;
