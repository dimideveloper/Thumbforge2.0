import { motion } from "framer-motion";
import { Brain, FileText, Hash, AlertTriangle, Eye, Heart } from "lucide-react";

const triggers = [
  { icon: AlertTriangle, label: "Fear", description: "Create urgency and FOMO" },
  { icon: Eye, label: "Curiosity", description: "Spark the need to click" },
  { icon: Heart, label: "Desire", description: "Promise transformation" },
];

const TextMetaSection = () => (
  <section className="py-24">
    <div className="container">
      <div className="grid md:grid-cols-2 gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
            AI Transcript <span className="text-secondary glow-text-secondary">Analyzer</span>
          </h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Paste your video transcript and our AI generates optimized titles, descriptions, and tags — all powered by psychological triggers that drive clicks.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="h-4 w-4 text-primary" /> Titles
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Brain className="h-4 w-4 text-primary" /> Descriptions
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Hash className="h-4 w-4 text-primary" /> Tags
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="space-y-4"
        >
          {triggers.map((t) => (
            <div key={t.label} className="flex items-start gap-4 rounded-lg border border-border bg-card p-5 card-hover">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-secondary/10">
                <t.icon className="h-4 w-4 text-secondary" />
              </div>
              <div>
                <h4 className="font-display font-semibold text-foreground">{t.label}</h4>
                <p className="text-sm text-muted-foreground">{t.description}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  </section>
);

export default TextMetaSection;
