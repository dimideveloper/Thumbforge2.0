import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";

const navLinks = [
  { name: "Features", id: "features" },
  { name: "How it works", id: "how-it-works" },
  { name: "Testimonials", id: "testimonials" },
  { name: "Pricing", id: "pricing" },
  { name: "FAQ", id: "faq" },
];

const Header = () => (
  <header className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-2xl border-b border-white/5">
    <div className="container px-4 md:px-6 flex h-16 items-center justify-between">
      <div className="flex items-center gap-2">
        <Zap className="h-5 w-5 text-white" />
        <span className="font-semibold text-lg text-white tracking-tight">ThumbForge</span>
      </div>
      <nav className="hidden md:flex items-center gap-8">
        {navLinks.map((link) => (
          <a key={link.id} href={`#${link.id}`} className="text-sm font-medium text-white/50 hover:text-white transition-colors duration-200">
            {link.name}
          </a>
        ))}
      </nav>
      <button
        onClick={() => window.location.href = '/auth'}
        className="h-9 px-4 rounded-full bg-white text-black text-sm font-medium hover:bg-white/90 transition-colors"
      >
        Get Started
      </button>
    </div>
  </header>
);

export default Header;
