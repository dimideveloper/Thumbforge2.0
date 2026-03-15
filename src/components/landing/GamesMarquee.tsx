import { Gamepad2 } from "lucide-react";

const games = ["Minecraft", "Roblox", "Fortnite", "GTA V", "Valorant", "Apex Legends", "Call of Duty", "League of Legends"];

const GamesMarquee = () => (
  <section className="py-16 border-y border-border bg-surface/30 overflow-hidden">
    <div className="container text-center mb-8">
      <h2 className="font-display text-2xl font-bold text-foreground">Supports Your Favorite Games</h2>
    </div>
    <div className="relative">
      <div className="flex animate-marquee gap-8 w-max">
        {[...games, ...games].map((game, i) => (
          <div
            key={`${game}-${i}`}
            className="flex items-center gap-3 rounded-full border border-border bg-card px-6 py-3 text-sm font-medium text-muted-foreground whitespace-nowrap"
          >
            <Gamepad2 className="h-4 w-4 text-secondary" />
            {game}
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default GamesMarquee;
