import { Construction } from "lucide-react";

interface PlaceholderPageProps {
  title: string;
  description: string;
}

const PlaceholderPage = ({ title, description }: PlaceholderPageProps) => (
  <div className="min-h-[80vh] flex flex-col items-center justify-center">
    <div className="text-center space-y-6 max-w-md px-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mx-auto h-20 w-20 rounded-3xl bg-white/[0.03] border border-white/10 flex items-center justify-center shadow-2xl">
        <Construction className="h-10 w-10 text-white/20" strokeWidth={1} />
      </div>
      <div className="space-y-2">
        <h2 className="text-3xl font-semibold text-white tracking-tight">{title}</h2>
        <p className="text-base text-white/40 font-light leading-relaxed">{description}</p>
      </div>
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-white/30 text-[10px] font-medium tracking-wider uppercase">
        Coming Soon
      </div>
    </div>
  </div>
);

export default PlaceholderPage;
