import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const navLinks = [
  { name: "Features", id: "features" },
  { name: "How it works", id: "how-it-works" },
  { name: "Testimonials", id: "testimonials" },
  { name: "Pricing", id: "pricing" },
  { name: "FAQ", id: "faq" },
];

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
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

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    // If not on the homepage, navigate to homepage first then scroll
    if (location.pathname !== "/") {
      navigate(`/#${id}`);
      return;
    }

    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
         top: offsetPosition,
         behavior: "smooth"
      });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-2xl border-b border-white/5">
      <div className="container px-4 md:px-6 flex h-16 items-center justify-between">
        <div 
          className="flex items-center gap-2 cursor-pointer" 
          onClick={() => navigate("/")}
        >
          <Zap className="h-5 w-5 text-white" />
          <span className="font-semibold text-lg text-white tracking-tight">ThumbForge</span>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a 
              key={link.id} 
              href={`#${link.id}`} 
              onClick={(e) => handleScroll(e, link.id)}
              className="text-sm font-medium text-white/50 hover:text-white transition-colors duration-200"
            >
              {link.name}
            </a>
          ))}
        </nav>
        <button
          onClick={() => navigate(isLoggedIn ? '/dashboard' : '/auth')}
          className="h-9 px-4 rounded-full bg-white text-black text-sm font-medium hover:bg-white/90 transition-colors"
        >
          {isLoggedIn ? 'Dashboard' : 'Get Started'}
        </button>
      </div>
    </header>
  );
};

export default Header;
