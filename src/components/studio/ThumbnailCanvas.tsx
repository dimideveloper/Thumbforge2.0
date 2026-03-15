import { useState, useCallback, useRef, useEffect } from "react";
import { Zap, ZoomIn, ZoomOut, Maximize2, Download, Upload, RotateCcw, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface ThumbnailCanvasProps {
  imageUrl: string | null;
  title: string;
  onTitleChange: (title: string) => void;
  onImageLoad: (url: string) => void;
  isLoading?: boolean;
}

const MIN_ZOOM = 0.25;
const MAX_ZOOM = 3;

const ThumbnailCanvas = ({ imageUrl, title, onTitleChange, onImageLoad, isLoading = false }: ThumbnailCanvasProps) => {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasFrameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setImageError(false);
  }, [imageUrl]);

  const clampPan = useCallback((nextPan: { x: number; y: number }, nextZoom: number) => {
    const frame = canvasFrameRef.current;
    if (!frame || nextZoom <= 1) {
      return { x: 0, y: 0 };
    }

    const { width, height } = frame.getBoundingClientRect();
    const maxX = ((width * nextZoom) - width) / 2;
    const maxY = ((height * nextZoom) - height) / 2;

    return {
      x: Math.max(-maxX, Math.min(maxX, nextPan.x)),
      y: Math.max(-maxY, Math.min(maxY, nextPan.y)),
    };
  }, []);

  const handleZoomIn = () => {
    setZoom((prev) => {
      const next = Math.min(prev + 0.25, MAX_ZOOM);
      setPan((current) => clampPan(current, next));
      return next;
    });
  };

  const handleZoomOut = () => {
    setZoom((prev) => {
      const next = Math.max(prev - 0.25, MIN_ZOOM);
      setPan((current) => clampPan(current, next));
      return next;
    });
  };

  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  useEffect(() => {
    const frame = canvasFrameRef.current;
    if (!frame) return;

    const handleWheel = (event: WheelEvent) => {
      if (!imageUrl) return;
      event.preventDefault();

      setZoom((prev) => {
        const step = event.deltaY > 0 ? -0.1 : 0.1;
        const next = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, prev + step));
        setPan((current) => clampPan(current, next));
        return next;
      });
    };

    frame.addEventListener("wheel", handleWheel, { passive: false });
    return () => frame.removeEventListener("wheel", handleWheel);
  }, [clampPan, imageUrl]);

  const startPanning = useCallback((clientX: number, clientY: number) => {
    setIsPanning(true);
    setPanStart({ x: clientX - pan.x, y: clientY - pan.y });
  }, [pan]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (!imageUrl) return;

    const isAltDrag = e.button === 0 && e.altKey;
    const canPanWithLeftClick = e.button === 0 && zoom > 1;
    const canPanWithMiddleClick = e.button === 1;

    if (!isAltDrag && !canPanWithLeftClick && !canPanWithMiddleClick) return;

    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    startPanning(e.clientX, e.clientY);
  }, [imageUrl, startPanning, zoom]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isPanning) return;

    const nextPan = {
      x: e.clientX - panStart.x,
      y: e.clientY - panStart.y,
    };

    setPan(clampPan(nextPan, zoom));
  }, [clampPan, isPanning, panStart, zoom]);

  const stopPanning = useCallback((e?: React.PointerEvent) => {
    if (e) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // no-op
      }
    }
    setIsPanning(false);
  }, []);

  const handleDownload = async () => {
    if (!imageUrl) return;

    try {
      if (imageUrl.startsWith("data:")) {
        const a = document.createElement("a");
        a.href = imageUrl;
        a.download = `${title || "thumbnail"}.png`;
        a.click();
        toast.success("Download gestartet");
        return;
      }

      const resp = await fetch(imageUrl);
      if (!resp.ok) throw new Error("Failed to fetch image");

      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title || "thumbnail"}.jpg`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Download gestartet");
    } catch {
      toast.error("Download fehlgeschlagen");
    }
  };

  const handleFullscreen = () => {
    if (!imageUrl) return;
    window.open(imageUrl, "_blank", "noopener,noreferrer");
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const loadFileToCanvas = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) {
        onImageLoad(ev.target.result as string);
        toast.success("Bild geladen");
      }
    };
    reader.readAsDataURL(file);
  }, [onImageLoad]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find((file) => file.type.startsWith("image/"));
    if (imageFile) {
      loadFileToCanvas(imageFile);
    }
  }, [loadFileToCanvas]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    loadFileToCanvas(file);
    e.target.value = "";
  };

  const zoomPercentage = Math.round(zoom * 100);

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-background">
      <div className="h-12 border-b border-border flex items-center px-4 gap-3 shrink-0">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted text-xs text-secondary font-medium">
          <span className="h-2 w-2 rounded-full bg-secondary animate-pulse" />
          MAIN
        </div>

        <input
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          className="bg-transparent text-sm font-medium text-foreground focus:outline-none border-none flex-1 truncate"
          placeholder="Untitled Thumbnail"
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <Upload className="h-3.5 w-3.5" />
          Upload
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileUpload}
        />
      </div>

      <div
        className={`flex-1 flex items-center justify-center p-8 overflow-hidden ${isPanning ? "cursor-grabbing" : zoom > 1 ? "cursor-grab" : "cursor-default"
          }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={stopPanning}
        onPointerCancel={stopPanning}
        style={{ touchAction: "none" }}
      >
        <div
          ref={canvasFrameRef}
          className={`w-full max-w-4xl aspect-video rounded-xl border-2 border-dashed flex items-center justify-center overflow-hidden relative transition-colors ${isDragging ? "border-primary bg-primary/5" : "border-border bg-card/50"
            }`}
        >
          {imageUrl && !imageError ? (
            <>
              <img
                src={imageUrl}
                alt="Thumbnail preview"
                className={`w-full h-full object-contain transition-all duration-300 select-none ${isLoading ? "blur-sm brightness-50" : ""}`}
                style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}
                draggable={false}
                onError={() => setImageError(true)}
              />
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center z-10 transition-all duration-300">
                  <div className="bg-background/90 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl p-6 flex flex-col items-center gap-4 animate-in fade-in zoom-in-95 duration-300 min-w-[200px]">
                    <div className="relative flex items-center justify-center h-12 w-12">
                      <div className="absolute inset-0 rounded-full border-[3px] border-primary/20" />
                      <div className="absolute inset-0 rounded-full border-[3px] border-primary border-t-transparent animate-spin" />
                      <Sparkles className="h-4 w-4 text-primary absolute animate-pulse" />
                    </div>
                    <div className="text-center space-y-1">
                      <p className="text-sm font-semibold text-foreground tracking-tight">AI optimiert dein Bild</p>
                      <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Einen Moment bitte</p>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : imageUrl && imageError ? (
            <div className="text-center space-y-3">
              <div className="mx-auto h-16 w-16 rounded-2xl bg-destructive/10 flex items-center justify-center">
                <Zap className="h-8 w-8 text-destructive/40" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground/70">Bild konnte nicht geladen werden</p>
                <p className="text-xs text-muted-foreground mt-1">Bitte ein anderes Thumbnail auswählen</p>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-3">
              <div className="mx-auto h-16 w-16 rounded-2xl bg-muted flex items-center justify-center">
                <Zap className="h-8 w-8 text-primary/40" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground/70">
                  {isDragging ? "Bild hier ablegen" : "Wähle ein Thumbnail aus der Inspiration"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Oder ziehe ein Bild hierher · Klicke Upload oben rechts
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Scroll zum Zoomen · Ziehen zum Verschieben (bei Zoom)
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="h-10 border-t border-border flex items-center justify-center gap-2 px-4 shrink-0">
        <button
          onClick={handleZoomOut}
          disabled={zoom <= MIN_ZOOM}
          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-30"
        >
          <ZoomOut className="h-4 w-4" />
        </button>

        <button
          onClick={handleResetZoom}
          className="text-xs text-muted-foreground font-mono min-w-[44px] text-center hover:text-foreground transition-colors"
        >
          {zoomPercentage}%
        </button>

        <button
          onClick={handleZoomIn}
          disabled={zoom >= MAX_ZOOM}
          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-30"
        >
          <ZoomIn className="h-4 w-4" />
        </button>

        <div className="w-px h-4 bg-border mx-1" />

        <button
          onClick={handleResetZoom}
          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          title="Zoom zurücksetzen"
        >
          <RotateCcw className="h-4 w-4" />
        </button>

        <button
          onClick={handleFullscreen}
          disabled={!imageUrl}
          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-30"
          title="Vollbild"
        >
          <Maximize2 className="h-4 w-4" />
        </button>

        <button
          onClick={handleDownload}
          disabled={!imageUrl}
          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-30"
          title="Download"
        >
          <Download className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default ThumbnailCanvas;
