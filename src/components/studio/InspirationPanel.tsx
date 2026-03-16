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
      toast.error("Failed to load inspiration");
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
      toast.error("This thumbnail is unavailable");
      return;
    }

    onSelectThumbnail(video.thumbnail);
  };

  return (
    <div className="flex flex-col h-full bg-[#050505]/40 backdrop-blur-sm">
      <div className="p-4 border-b border-white/5">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Search topics…"
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-white/[0.03] border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-white/30 focus:bg-white/[0.05] transition-all font-light"
          />
        </div>
      </div>

      <div className="px-4 py-3 flex flex-wrap gap-2 border-b border-white/5 bg-[#0a0a0a]/50">
        {TAGS.map((tag) => (
          <button
            key={tag}
            onClick={() => handleSearch(tag)}
            className={`px-3 py-1.5 rounded-full text-[11px] font-medium transition-all duration-200 border ${
              query === tag && hasSearched
                ? "bg-white text-black border-white shadow-[0_0_10px_rgba(255,255,255,0.2)]"
                : "bg-white/[0.03] text-white/50 hover:bg-white/10 hover:text-white/90 border-white/10"
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {isSearching && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 className="h-6 w-6 text-white/60 animate-spin" />
            <p className="text-xs text-white/40 font-light">Searching…</p>
          </div>
        )}

        {!isSearching && hasSearched && videos.length === 0 && (
          <p className="text-xs text-white/40 text-center py-12 font-light">
            No results. Try a different term.
          </p>
        )}

        {!isSearching && videos.map((video) => {
          const unavailable = !video.thumbnail || !video.isThumbnailAvailable || failedImages.has(video.id);

          return (
            <button
              key={video.id}
              onClick={() => handleSelectVideo(video)}
              className={`w-full group rounded-2xl overflow-hidden border bg-[#0a0a0a]/80 backdrop-blur-md transition-all duration-300 text-left ${
                unavailable ? "border-white/5 opacity-50 cursor-not-allowed" : "border-white/10 hover:border-white/30 hover:bg-white/[0.05] shadow-sm hover:shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
              }`}
              disabled={unavailable}
            >
              <div className="aspect-video w-full overflow-hidden relative bg-[#111]">
                {unavailable ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageOff className="h-8 w-8 text-white/20" />
                  </div>
                ) : (
                  <img
                    src={video.thumbnail || "/placeholder.svg"}
                    alt={video.title}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500 ease-out"
                    data-fallback-step={qualityIndexFromUrl(video.thumbnail)}
                    onError={(e) => handleImgError(video, e)}
                    loading="lazy"
                  />
                )}

                {!unavailable && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                     <div className="bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                        <ExternalLink className="h-3.5 w-3.5 text-white" />
                        <span className="text-[11px] font-medium text-white">Load into canvas</span>
                     </div>
                  </div>
                )}
              </div>

              <div className="p-3">
                <p className="text-xs font-medium text-white/90 line-clamp-2 leading-snug">
                  {video.title}
                </p>
                <p className="text-[10px] text-white/40 mt-1.5 flex items-center gap-1.5 font-light">
                  <span className="truncate">{video.channel}</span> 
                  <span className="w-1 h-1 rounded-full bg-white/20 shrink-0" />
                  <span className="shrink-0">{video.views}</span>
                </p>
              </div>
            </button>
          );
        })}

        {!isSearching && !hasSearched && (
          <div className="text-center py-16 space-y-4">
            <div className="h-14 w-14 rounded-full border border-white/10 bg-gradient-to-b from-white/5 to-transparent flex items-center justify-center mx-auto">
              <Search className="h-6 w-6 text-white/30" />
            </div>
            <p className="text-xs text-white/40 font-light max-w-[200px] mx-auto leading-relaxed">
              Search for a topic or click a tag to find inspiration.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InspirationPanel;
