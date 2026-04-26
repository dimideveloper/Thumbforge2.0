import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "/mo",
    credits: "10 credits/mo",
    estimate: "Up to 10 thumbnails",
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
    estimate: "Up to 50 thumbnails",
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
    estimate: "Up to 200 thumbnails",
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
    estimate: "Unlimited thumbnails",
    audience: "For heavy creators",
    features: ["Everything in Pro", "API access", "Custom branding", "Dedicated support", "Transcript Analyzer"],
    highlighted: true,
    checkoutUrl: "https://whop.com/checkout/plan_mYEWSJxkCa7vv",
  },
];

const PricingCards = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

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
            className={`relative glass-card rounded-2xl p-8 flex flex-col transition-all duration-300 hover:-translate-y-1 ${plan.highlighted
                ? "border-primary/50 bg-primary/10 shadow-[0_0_30px_rgba(37,99,235,0.15)] scale-[1.02]"
                : "hover:border-primary/30"
              }`}
          >
            <div className="mb-8">
              <h3 className="text-xl font-medium">{plan.name}</h3>
              <p className="text-sm mt-2 text-white/50">
                {plan.audience}
              </p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-5xl font-semibold tracking-tight">{plan.price}</span>
                <span className="text-sm text-white/50">
                  {plan.period}
                </span>
              </div>
              <p className="text-sm font-medium mt-3 text-white/80">
                {plan.credits}
              </p>
              <p className="text-xs mt-1 text-white/40">
                ({plan.estimate})
              </p>
            </div>
            <ul className="space-y-4 mb-10 flex-1">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm text-white/80">
                  <Check className={`h-4 w-4 shrink-0 ${plan.highlighted ? "text-primary drop-shadow-[0_0_8px_rgba(37,99,235,0.5)]" : "text-primary/70"}`} />
                  {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => {
                if (plan.checkoutUrl) {
                  window.open(plan.checkoutUrl, '_blank');
                } else if (isLoggedIn) {
                  navigate("/dashboard");
                } else {
                  navigate("/auth");
                }
              }}
              className={plan.highlighted ? "btn-shine w-full" : "h-12 w-full rounded-xl font-medium transition-all active:scale-95 bg-white/5 text-white hover:bg-white/10 border border-white/10"}
            >
              <span className="flex-1 text-center">
                {isLoggedIn && !plan.checkoutUrl ? "Go to Dashboard" : "Get Started"}
              </span>
              {plan.highlighted && (
                <svg className="btn-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm4.28 10.28a.75.75 0 000-1.06l-3-3a.75.75 0 10-1.06 1.06l1.72 1.72H8.25a.75.75 0 000 1.5h5.69l-1.72 1.72a.75.75 0 101.06 1.06l3-3z"
                    clipRule="evenodd"
                  ></path>
                </svg>
              )}
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
  );
};

export default PricingCards;
