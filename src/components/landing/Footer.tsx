import { Zap } from "lucide-react";

const Footer = () => (
  <footer className="py-12 pb-20">
    <div className="container px-4 md:px-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-white" />
          <span className="font-semibold text-sm text-white tracking-tight">ThumbForge</span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-white/50 font-medium">
          <a href="#" className="hover:text-white transition-colors duration-200">Discord</a>
          <a href="#" className="hover:text-white transition-colors duration-200">Help Center</a>
          <a href="#" className="hover:text-white transition-colors duration-200">Terms</a>
          <a href="#" className="hover:text-white transition-colors duration-200">Privacy</a>
        </div>
      </div>
      <p className="mt-12 text-center text-sm font-medium text-white/30">
        © {new Date().getFullYear()} ThumbForge. All rights reserved.
      </p>
    </div>
  </footer>
);

export default Footer;
