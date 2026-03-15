import { Construction } from "lucide-react";

interface PlaceholderPageProps {
  title: string;
  description: string;
}

const PlaceholderPage = ({ title, description }: PlaceholderPageProps) => (
  <div className="flex-1 flex items-center justify-center bg-background">
    <div className="text-center space-y-4 max-w-md px-8">
      <div className="mx-auto h-16 w-16 rounded-2xl bg-muted flex items-center justify-center">
        <Construction className="h-8 w-8 text-primary/40" />
      </div>
      <h2 className="font-display text-xl font-bold text-foreground">{title}</h2>
      <p className="text-sm text-muted-foreground">{description}</p>
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-medium">
        Kommt bald
      </div>
    </div>
  </div>
);

export default PlaceholderPage;
