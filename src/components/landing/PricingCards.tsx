import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useNavigate } from "react-router-dom";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "/mo",
    credits: "10 credits/mo",
    audience: "For casual creators",
    features: ["Basic templates", "720p export", "Watermark"],
    highlighted: false,
    checkoutUrl: null, // Free tier doesn't need checkout
  },
  {
    name: "Starter",
    price: "$9",
    period: "/mo",
    credits: "50 credits/mo",
    audience: "For growing channels",
    features: ["All templates", "1080p export", "No watermark", "Expression AI"],
    highlighted: false,
    checkoutUrl: "https://whop.com/checkout/plan_fuejd6S6TntYV",
  },
  {
    name: "Pro",
    price: "$24",
    period: "/mo",
    credits: "200 credits/mo",
    audience: "For serious creators",
    features: ["Everything in Starter", "4K export", "Face Insert AI", "Priority rendering"],
    highlighted: false,
    checkoutUrl: "https://whop.com/checkout/plan_JE8rZQKDftpTz",
  },
  {
    name: "Premium",
    price: "$49",
    period: "/mo",
    credits: "Unlimited",
    audience: "For heavy creators",
    features: ["Everything in Pro", "API access", "Custom branding", "Dedicated support", "Transcript Analyzer"],
    highlighted: true,
    checkoutUrl: "https://whop.com/checkout/plan_mYEWSJxkCa7vv",
  },
];

const PricingCards = () => {
  const navigate = useNavigate();

  return (
    <section id="pricing" className="py-24">
      <div className="container px-4 md:px-6">
      <div className="text-center mb-20">
        <h2 className="text-3xl md:text-5xl font-medium text-white tracking-tight">
          Simple pricing.
        </h2>
        <p className="mt-6 text-white/50 max-w-lg mx-auto font-light text-lg">
          Start for free. Upgrade when you need more power.
        </p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan, i) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.6, ease: "easeOut" }}
            className={`relative rounded-3xl p-8 flex flex-col transition-all ${plan.highlighted
                ? "bg-white text-black scale-[1.02] shadow-2xl"
                : "bg-[#0a0a0a] border border-white/10 text-white hover:bg-[#111]"
              }`}
          >
            <div className="mb-8">
              <h3 className="text-xl font-medium">{plan.name}</h3>
              <p className={`text-sm mt-2 ${plan.highlighted ? "text-black/60" : "text-white/50"}`}>
                {plan.audience}
              </p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-5xl font-medium tracking-tight">{plan.price}</span>
                <span className={`text-sm ${plan.highlighted ? "text-black/60" : "text-white/50"}`}>
                  {plan.period}
                </span>
              </div>
              <p className={`text-sm font-medium mt-3 ${plan.highlighted ? "text-black/80" : "text-white/70"}`}>
                {plan.credits}
              </p>
            </div>
            <ul className="space-y-4 mb-10 flex-1">
              {plan.features.map((f) => (
                <li key={f} className={`flex items-center gap-3 text-sm ${plan.highlighted ? "text-black/80" : "text-white/70"}`}>
                  <Check className={`h-4 w-4 shrink-0 ${plan.highlighted ? "text-black" : "text-white"}`} />
                  {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => {
                if (plan.checkoutUrl) {
                  window.open(plan.checkoutUrl, '_blank');
                } else {
                  navigate("/auth");
                }
              }}
              className={`h-12 w-full rounded-full font-medium transition-transform active:scale-95 ${plan.highlighted
                  ? "bg-black text-white hover:bg-black/90"
                  : "bg-white text-black hover:bg-white/90"
                }`}
            >
              Get Started
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
  );
};

export default PricingCards;
