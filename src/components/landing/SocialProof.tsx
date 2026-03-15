import { useEffect, useRef, useState } from "react";
import { Users } from "lucide-react";
import { useInView, useMotionValue, useSpring } from "framer-motion";

const SocialProof = () => {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const [displayValue, setDisplayValue] = useState(0);
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    damping: 40,
    stiffness: 80,
  });

  useEffect(() => {
    if (isInView) {
      motionValue.set(2500);
    }
  }, [isInView, motionValue]);

  useEffect(() => {
    return springValue.on("change", (latest) => {
      setDisplayValue(Math.floor(latest));
    });
  }, [springValue]);

  return (
    <section className="py-12">
      <div className="container flex items-center justify-center gap-3 text-sm text-white/50 font-light">
        <Users className="h-4 w-4 text-white/40" />
        <span>
          Trusted by <strong className="text-white font-medium inline-block min-w-[3.5rem] tracking-tight text-center" ref={ref}>{displayValue.toLocaleString()}+</strong> gaming creators worldwide
        </span>
      </div>
    </section>
  );
};

export default SocialProof;
