import { useRef, useEffect } from "react";
import { History } from "lucide-react";

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
}

const VersionHistoryBar = ({ versions, activeVersionId, onSelectVersion }: VersionHistoryBarProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to newest version
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, [versions.length]);

  if (versions.length === 0) return null;

  return (
    <div className="h-[72px] border-b border-border bg-card/50 flex items-center gap-2 px-3 shrink-0">
      <div className="flex items-center gap-1.5 text-muted-foreground shrink-0">
        <History className="h-3.5 w-3.5" />
        <span className="text-[10px] font-medium uppercase tracking-wider">Versionen</span>
      </div>

      <div className="w-px h-8 bg-border shrink-0" />

      <div
        ref={scrollRef}
        className="flex-1 flex items-center gap-2 overflow-x-auto overflow-y-hidden scrollbar-none"
      >
        {versions.map((version, index) => {
          const isActive = version.id === activeVersionId;

          return (
            <button
              key={version.id}
              onClick={() => onSelectVersion(version)}
              className={`relative shrink-0 rounded-lg overflow-hidden border-2 transition-all duration-200 group ${
                isActive
                  ? "border-primary ring-1 ring-primary/30 scale-105"
                  : "border-border hover:border-primary/40 opacity-70 hover:opacity-100"
              }`}
              title={version.label}
            >
              <div className="w-[80px] h-[45px] bg-muted">
                <img
                  src={version.url}
                  alt={version.label}
                  className="w-full h-full object-cover"
                  draggable={false}
                />
              </div>
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-background/90 to-transparent px-1 py-0.5">
                <span className="text-[8px] font-medium text-foreground/80 leading-none">
                  V{index + 1}
                </span>
              </div>
              {isActive && (
                <div className="absolute top-0.5 right-0.5 h-1.5 w-1.5 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default VersionHistoryBar;
