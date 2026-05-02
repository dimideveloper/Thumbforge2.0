import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { MoveLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white/20 flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center container max-w-4xl px-4 md:px-6 py-32">
        <div className="relative">
          <div className="absolute -inset-20 bg-primary/20 blur-[100px] rounded-full opacity-50" />
          <div className="relative text-center space-y-6">
            <h1 className="text-[120px] md:text-[180px] font-bold tracking-tighter leading-none bg-gradient-to-b from-white to-white/20 bg-clip-text text-transparent select-none">
              404
            </h1>
            <div className="space-y-2">
              <h2 className="text-2xl md:text-3xl font-medium tracking-tight">
                Lost in space.
              </h2>
              <p className="text-white/50 max-w-md mx-auto font-light leading-relaxed">
                The page you are looking for doesn't exist or has been moved. 
                Let's get you back on track.
              </p>
            </div>
            <div className="pt-8">
              <Link 
                to="/" 
                className="inline-flex items-center gap-2 h-12 px-8 rounded-full bg-white text-black font-medium hover:bg-white/90 transition-all active:scale-95"
              >
                <MoveLeft className="h-4 w-4" />
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NotFound;

