import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogDescription } from "@/components/ui/dialog";
import { Check, Coins, Zap } from "lucide-react";

export interface TopUpModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const plans = [
  {
    name: "Starter",
    price: "$1.50",
    period: "/mo",
    credits: "50 credits",
    estimate: "Up to 50 thumbnails",
    features: ["All templates", "1080p export", "No watermark"],
    highlighted: false,
    priceId: "pri_01kqm62km3gyytw64f5m185xhm",
  },
  {
    name: "Pro",
    price: "$3",
    period: "/mo",
    credits: "200 credits",
    estimate: "Up to 200 thumbnails",
    features: ["Everything in Starter", "4K export", "Persona Studio AI"],
    highlighted: true,
    priceId: "pri_01kqm62kzj17cxbbs6359r5616",
  },
  {
    name: "Premium",
    price: "$9",
    period: "/mo",
    credits: "Unlimited",
    estimate: "Unlimited thumbnails",
    features: ["Everything in Pro", "API access", "Custom branding"],
    highlighted: false,
    priceId: "pri_01kqm62man7pe4rcf6z42ypr54",
  },
];


const TopUpModal = ({ open, onOpenChange }: TopUpModalProps) => {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setEmail(user?.email || null);
    });
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl bg-[#0a0a0a] border-white/10 text-white p-0 overflow-hidden">
        <DialogHeader className="p-8 pb-0 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <DialogTitle className="text-2xl font-medium tracking-tight">Upgrade Your Plan</DialogTitle>
          <DialogDescription className="text-white/50 text-base mt-2">
            Get more credits and unlock pro features.
          </DialogDescription>
        </DialogHeader>

        <div className="p-8">
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`flex flex-col rounded-2xl p-6 border transition-all ${
                  plan.highlighted
                    ? "bg-white text-black border-white"
                    : "bg-[#111] border-white/10 text-white hover:border-white/20"
                }`}
              >
                <h3 className="text-lg font-medium">{plan.name}</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-medium tracking-tight">{plan.price}</span>
                  <span className={`text-sm ${plan.highlighted ? "text-black/60" : "text-white/50"}`}>
                    {plan.period}
                  </span>
                </div>
                <div className={`mt-2 flex items-center gap-1.5 text-sm font-medium ${plan.highlighted ? "text-black/80" : "text-white/70"}`}>
                  <Coins className="h-4 w-4 shrink-0" />
                  {plan.credits}
                </div>
                <div className={`mt-1 text-xs ${plan.highlighted ? "text-black/50" : "text-white/40"}`}>
                  ({plan.estimate})
                </div>
                
                <ul className="mt-8 space-y-3 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className={`flex items-center gap-3 text-sm ${plan.highlighted ? "text-black/80" : "text-white/70"}`}>
                      <Check className={`h-4 w-4 shrink-0 ${plan.highlighted ? "text-black" : "text-white"}`} />
                      {f}
                    </li>
                  ))}
                </ul>
                
                <button
                  onClick={() => {
                    // @ts-ignore
                    if (window.Paddle) {
                      // @ts-ignore
                      window.Paddle.Checkout.open({
                        settings: {
                          displayMode: "overlay",
                          theme: "dark",
                          locale: "en",
                        },
                        items: [
                          {
                            priceId: plan.priceId,
                            quantity: 1,
                          },
                        ],
                        customer: email ? {
                          email: email,
                        } : undefined,
                      });
                    } else {
                      console.error("Paddle not loaded");
                    }
                  }}
                  className={`mt-8 h-12 w-full rounded-full font-medium transition-transform active:scale-95 ${
                    plan.highlighted
                      ? "bg-black text-white hover:bg-black/90"
                      : "bg-white text-black hover:bg-white/90"
                  }`}
                >
                  Choose {plan.name}
                </button>

              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TopUpModal;
