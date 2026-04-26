import { motion } from "framer-motion";

const InteractiveDesignSection = () => {
  return (
    <section className="py-24 relative overflow-hidden bg-[#0a0a0a]">
      <div className="container px-4 md:px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-semibold text-white tracking-tight mb-6">
              AI-Powered Design <br />
              <span className="text-primary">Without the Effort.</span>
            </h2>
            <p className="text-white/50 text-lg font-light leading-relaxed mb-8 max-w-lg">
              Our AI understands the secrets behind high-CTR thumbnails. It doesn't just generate images; it crafts visual narratives that demand clicks.
            </p>
            
            <ul className="space-y-4">
              {[
                "Advanced Character Consistency",
                "Cinematic Lighting Presets",
                "Viral Composition Rules",
                "One-Click Style Transfers"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-white/70 font-light">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(33,150,243,0.8)]" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative flex items-center justify-center">
            {/* The Animated SVG from User */}
            <div className="w-full max-w-[600px] aspect-[614/390] relative group">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 614 390"
                className="w-full h-auto drop-shadow-2xl"
              >
                <g id="Frame">
                  <g id="text-group" className="select-none">
                    <text x="50" y="100" fill="white" className="text-5xl md:text-6xl font-bold tracking-tighter opacity-90">Viral Ideas.</text>
                    <text x="50" y="180" fill="white" className="text-5xl md:text-6xl font-bold tracking-tighter opacity-90">AI Design.</text>
                    <text x="50" y="260" fill="white" className="text-5xl md:text-6xl font-bold tracking-tighter opacity-90">Max CTR.</text>
                  </g>
                  
                  <g id="box" className="animate-design-box">
                    <path
                      strokeWidth="2"
                      stroke="#0071e2"
                      fillOpacity="0.05"
                      fill="#0071e2"
                      d="M587 20H28V306H587V20Z"
                    ></path>
                    <path strokeWidth="2" stroke="#0071e2" fill="white" d="M33 15H23V25H33V15Z" />
                    <path strokeWidth="2" stroke="#0071e2" fill="white" d="M33 301H23V311H33V301Z" />
                    <path strokeWidth="2" stroke="#0071e2" fill="white" d="M592 301H582V311H592V301Z" />
                    <path strokeWidth="2" stroke="#0071e2" fill="white" d="M592 15H582V25H592V15Z" />
                  </g>

                  <g id="cursor" className="animate-design-cursor">
                    <path
                      strokeWidth="2"
                      stroke="white"
                      fill="#0071e2"
                      d="M453.383 343L448 317L471 331L459.745 333.5L453.383 343Z"
                    ></path>
                    <path fill="#0071e2" d="M587 343H469.932V376H587V343Z" />
                    <g id="user-label">
                       <text x="480" y="365" fill="white" className="text-[14px] font-medium tracking-tight">AI Designer</text>
                    </g>
                  </g>
                </g>
              </svg>
              
              {/* Background Glow */}
              <div className="absolute inset-0 bg-primary/10 blur-[120px] rounded-full -z-10 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InteractiveDesignSection;
