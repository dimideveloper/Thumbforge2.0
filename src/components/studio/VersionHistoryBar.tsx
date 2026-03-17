import { useRef, useEffect } from "react";
import { History, X } from "lucide-react";

export interface ThumbnailVersion {
  id: string;
  url: string;
  label: string;
  timestamp: number;
}

interface VersionHistoryBarProps {
  versions: ThumbnailVersion[];
  activeVersionId: string | null;
  onSelectVersion: (version: ThumbnailVersion) => void;
  onDeleteVersion: (id: string) => void;
}

const VersionHistoryBar = ({ versions, activeVersionId, onSelectVersion, onDeleteVersion }: VersionHistoryBarProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to newest version
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, [versions.length]);

  if (versions.length === 0) return null;

  return (
    <div className="h-[72px] border-b border-white/5 bg-[#0a0a0a]/50 backdrop-blur-md flex items-center gap-3 px-4 shrink-0 relative z-20 shadow-sm">
      <div className="flex items-center gap-2 text-white/50 shrink-0">
        <div className="h-7 w-7 rounded-full bg-white/[0.03] border border-white/5 flex items-center justify-center">
          <History className="h-3.5 w-3.5 text-white/60" />
        </div>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-white/40">Versions</span>
      </div>

      <div className="w-px h-8 bg-white/10 shrink-0 mx-1" />

      <div
        ref={scrollRef}
        className="flex-1 flex items-center gap-3 overflow-x-auto overflow-y-hidden scrollbar-none py-2"
      >
        {versions.map((version, index) => {
          const isActive = version.id === activeVersionId;

          return (
             <div
              key={version.id}
              className="relative shrink-0 group"
            >
              <button
                onClick={() => onSelectVersion(version)}
                className={`block rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                  isActive
                    ? "border-white ring-2 ring-white/20 scale-105 shadow-[0_0_15px_rgba(255,255,255,0.15)] z-10"
                    : "border-white/10 hover:border-white/40 opacity-60 hover:opacity-100 hover:scale-[1.02]"
                }`}
                title={version.label}
              >
                <div className="w-[84px] h-[48px] bg-[#111] relative">
                  <img
                    src={version.url}
                    alt={version.label}
                    className="w-full h-full object-cover"
                    draggable={false}
                  />
                </div>
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent pt-4 pb-1 px-1.5 flex justify-center">
                  <span className="text-[9px] font-bold text-white/90 tracking-wide drop-shadow-md">
                     V{index + 1}
                  </span>
                </div>
                {isActive && (
                  <div className="absolute top-1 right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </div>
                )}
              </button>

              {/* Delete button (icon on hover) */}
              {versions.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteVersion(version.id);
                  }}
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-white text-black border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white z-20 shadow-lg scale-90 hover:scale-100"
                  title="Version löschen"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default VersionHistoryBar;
