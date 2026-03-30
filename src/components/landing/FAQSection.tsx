import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "Do I need any design experience?",
    answer: "Zero. ThumbForge is designed specifically for gamers and creators who don't want to learn Photoshop. If you can type a prompt, you can use our tool to create professional thumbnails."
  },
  {
    question: "How does the AI Face Insert work?",
    answer: "You upload a photo of your face, and our AI automatically extracts it, adjusts the lighting, and blends it perfectly into the thumbnail environment. It matches the art style automatically."
  },
  {
    question: "Can I use the thumbnails for commercial purposes?",
    answer: "Yes! Every thumbnail you generate is 100% yours. You can use them on your YouTube channel, social media, or anywhere else with full commercial rights."
  },
  {
    question: "What happens when I run out of credits?",
    answer: "Free plan users get 10 credits every month. If you run out, you can either wait for the next month, or upgrade to one of our paid plans for more credits and premium features."
  },
  {
    question: "Is there a watermark on the thumbnails?",
    answer: "The Free plan includes a small discrete watermark in the corner. Upgrading to the Starter plan or higher removes the watermark completely."
  }
];

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-24 border-t border-white/5 bg-[#050505]">
      <div className="container px-4 md:px-6 max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-5xl font-medium text-white tracking-tight">
              Frequently asked <span className="text-white/50">questions.</span>
            </h2>
            <p className="mt-6 text-white/40 font-light text-lg">
              Everything you need to know about ThumbForge.
            </p>
          </motion.div>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <motion.div
                key={faq.question}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className={`glass-card rounded-2xl overflow-hidden transition-all duration-300 ${
                  isOpen ? "bg-white/[0.05] border-primary/50 shadow-[0_0_20px_rgba(37,99,235,0.15)]" : "border-white/10 hover:border-primary/50 hover:-translate-y-1"
                }`}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full text-left px-6 py-5 flex items-center justify-between focus:outline-none"
                >
                  <span className="font-medium text-white text-lg pr-8">{faq.question}</span>
                  <ChevronDown
                    className={`h-5 w-5 transition-transform duration-300 ${
                      isOpen ? "rotate-180 text-primary drop-shadow-[0_0_8px_rgba(37,99,235,0.5)]" : "text-white/50 group-hover:text-white"
                    }`}
                  />
                </button>
                <div
                  className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${
                    isOpen ? "max-h-40 pb-5 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <p className="text-white/50 font-light leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
