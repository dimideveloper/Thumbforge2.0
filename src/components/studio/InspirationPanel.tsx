import { useState } from "react";
import { Search, Loader2, ExternalLink, ImageOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Video {
  id: string;
  videoId: string | null;
  title: string;
  thumbnail: string | null;
  channel: string;
  views: string;
  isThumbnailAvailable: boolean;
}

interface InspirationPanelProps {
  onSelectThumbnail: (url: string) => void;
}

const TAGS = ["Minecraft", "Fortnite", "GTA", "Valorant", "Roblox"];
const THUMB_QUALITIES = ["maxresdefault", "hqdefault", "mqdefault", "default"] as const;

const buildYoutubeThumbUrl = (videoId: string, qualityIndex: number) =>
  `https://i.ytimg.com/vi/${videoId}/${THUMB_QUALITIES[qualityIndex]}.jpg`;

const qualityIndexFromUrl = (url: string | null): number => {
  if (!url) return 1;
  const foundIndex = THUMB_QUALITIES.findIndex((quality) => url.includes(`/${quality}.jpg`));
  return foundIndex >= 0 ? foundIndex : 1;
};

const InspirationPanel = ({ onSelectThumbnail }: InspirationPanelProps) => {
  const [query, setQuery] = useState("");
  const [videos, setVideos] = useState<Video[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  const handleSearch = async (searchQuery?: string) => {
    const q = (searchQuery || query).trim();
    if (!q) return;

    setQuery(q);
    setIsSearching(true);
    setHasSearched(true);
    setFailedImages(new Set());

    try {
      const { data, error } = await supabase.functions.invoke("youtube-search", {
        body: { query: q },
      });

      if (error) throw error;

      const nextVideos = Array.isArray(data?.videos) ? data.videos : [];
      setVideos(nextVideos);
    } catch (err) {
      console.error("Search error:", err);
      setVideos([]);
      toast.error("Inspiration konnte nicht geladen werden");
    } finally {
      setIsSearching(false);
    }
  };

  const handleImgError = (video: Video, e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;

    if (!video.videoId) {
      setFailedImages((prev) => new Set(prev).add(video.id));
      return;
    }

    const currentStep = Number(img.dataset.fallbackStep ?? qualityIndexFromUrl(video.thumbnail).toString());
    const nextStep = currentStep + 1;

    if (nextStep < THUMB_QUALITIES.length) {
      img.dataset.fallbackStep = String(nextStep);
      img.src = buildYoutubeThumbUrl(video.videoId, nextStep);
      return;
    }

    setFailedImages((prev) => new Set(prev).add(video.id));
  };

  const handleSelectVideo = (video: Video) => {
    const unavailable = !video.thumbnail || !video.isThumbnailAvailable || failedImages.has(video.id);

    if (unavailable) {
      toast.error("Dieses Thumbnail ist nicht verfügbar");
      return;
    }

    onSelectThumbnail(video.thumbnail);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Suche nach Themen…"
            className="w-full h-9 pl-9 pr-3 rounded-lg bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      <div className="px-3 pb-2 flex flex-wrap gap-1.5">
        {TAGS.map((tag) => (
          <button
            key={tag}
            onClick={() => handleSearch(tag)}
            className={`px-2.5 py-1 rounded-full text-xs transition-colors border ${
              query === tag && hasSearched
                ? "bg-primary/15 text-primary border-primary/30"
                : "bg-muted text-muted-foreground hover:bg-primary/15 hover:text-primary border-border"
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-2">
        {isSearching && (
          <div className="flex flex-col items-center justify-center py-12 gap-2">
            <Loader2 className="h-5 w-5 text-primary animate-spin" />
            <p className="text-xs text-muted-foreground">Suche läuft…</p>
          </div>
        )}

        {!isSearching && hasSearched && videos.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-8">
            Keine Ergebnisse gefunden. Versuche einen anderen Suchbegriff.
          </p>
        )}

        {!isSearching && videos.map((video) => {
          const unavailable = !video.thumbnail || !video.isThumbnailAvailable || failedImages.has(video.id);

          return (
            <button
              key={video.id}
              onClick={() => handleSelectVideo(video)}
              className={`w-full group rounded-xl overflow-hidden border border-border bg-muted/50 transition-all text-left ${
                unavailable ? "opacity-60 cursor-not-allowed" : "hover:border-primary/50"
              }`}
              disabled={unavailable}
            >
              <div className="aspect-video w-full overflow-hidden relative">
                {unavailable ? (
                  <div className="w-full h-full flex items-center justify-center bg-muted">
                    <ImageOff className="h-8 w-8 text-muted-foreground/30" />
                  </div>
                ) : (
                  <img
                    src={video.thumbnail || "/placeholder.svg"}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    data-fallback-step={qualityIndexFromUrl(video.thumbnail)}
                    onError={(e) => handleImgError(video, e)}
                    loading="lazy"
                  />
                )}

                {!unavailable && (
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                    <span className="text-[10px] font-medium text-primary flex items-center gap-1">
                      <ExternalLink className="h-3 w-3" /> In Canvas laden
                    </span>
                  </div>
                )}
              </div>

              <div className="p-2">
                <p className="text-xs font-medium text-foreground line-clamp-2 leading-tight">
                  {video.title}
                </p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  {video.channel} · {video.views}
                </p>
              </div>
            </button>
          );
        })}

        {!isSearching && !hasSearched && (
          <div className="text-center py-8 space-y-2">
            <Search className="h-8 w-8 text-muted-foreground/30 mx-auto" />
            <p className="text-xs text-muted-foreground">
              Suche nach einem Thema oder klicke auf einen Tag oben
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InspirationPanel;
