import { useState, useCallback, useRef, useEffect } from "react";
import { Zap, ZoomIn, ZoomOut, Maximize2, Download, Upload, RotateCcw, Loader2, Sparkles, Trophy, Eye, Smartphone, Layout } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { PremiumTooltip } from "@/components/studio/PremiumTooltip";

interface ThumbnailCanvasProps {
  imageUrl: string | null;
  title: string;
  onTitleChange: (title: string) => void;
  onImageLoad: (url: string) => void;
  isLoading?: boolean;
  onShare?: () => void;
}

const MIN_ZOOM = 0.25;
const MAX_ZOOM = 3;

const ThumbnailCanvas = ({ imageUrl, title, onTitleChange, onImageLoad, isLoading = false, onShare }: ThumbnailCanvasProps) => {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [showOverlays, setShowOverlays] = useState(false);
  const [showMobilePreview, setShowMobilePreview] = useState(false);
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
      toast.success("Download started");
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
      toast.success("Download started");
    } catch {
      toast.error("Download failed");
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
        toast.success("Image loaded");
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
    <div className="flex-1 flex flex-col min-w-0 bg-transparent relative z-10">
      <div className="h-14 border-b border-white/5 flex items-center px-4 sm:px-5 gap-2 sm:gap-4 shrink-0 bg-[#0a0a0a]/50 backdrop-blur-md relative z-20">
        <div className="flex items-center gap-2 px-2 sm:px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/5 text-[10px] sm:text-[11px] text-white/70 font-medium tracking-wide shadow-sm shrink-0">
          <span className="h-1.5 w-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse" />
          MAIN
        </div>

        <input
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          className="bg-transparent text-xs sm:text-sm font-semibold text-white/90 focus:outline-none border-none flex-1 truncate placeholder:text-white/30 transition-colors focus:text-white min-w-0"
          placeholder="Untitled Thumbnail"
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-[10px] sm:text-xs text-black bg-white hover:bg-white/90 font-medium transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)] shrink-0"
        >
           <Upload className="h-3 w-3 sm:h-3.5 sm:w-3.5 object-contain" />
           <span>Upload</span>
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
        className={`flex-1 flex items-center justify-center p-4 sm:p-8 overflow-hidden relative z-10 ${
          isPanning ? "cursor-grabbing" : zoom > 1 ? "cursor-grab" : "cursor-default"
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
          id="studio-canvas"
          className={`w-full max-w-5xl aspect-video rounded-2xl flex items-center justify-center overflow-hidden relative transition-all duration-300 shadow-2xl ${
            isDragging 
              ? "border-2 border-white/40 bg-white/10 scale-[1.02]" 
              : "border border-white/10 bg-[#0a0a0a]/80 backdrop-blur-xl"
            }`}
        >
          {imageUrl && !imageError ? (
            <>
               <div className="absolute inset-0 bg-[repeating-conic-gradient(rgba(255,255,255,0.02)_0%_25%,transparent_0%_50%)_0_0/24px_24px] pointer-events-none" />
               <img
                src={imageUrl}
                alt="Thumbnail preview"
                className={`w-full h-full object-contain transition-all duration-300 select-none drop-shadow-2xl ${isLoading ? "blur-xl brightness-50 opacity-50 scale-105" : ""}`}
                style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}
                draggable={false}
                onError={() => setImageError(true)}
              />

              {/* YouTube UI Overlay - Synced with Zoom/Pan */}
              <AnimatePresence>
                {showOverlays && imageUrl && !isLoading && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 pointer-events-none z-20"
                    style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: 'center' }}
                  >
                    {/* Timestamp Box (Bottom Right) */}
                    <div className="absolute bottom-[8%] right-[4%] bg-black/90 text-white text-[2.5vw] font-bold px-[1.5vw] py-[0.5vw] rounded-[0.5vw] flex items-center justify-center shadow-2xl border border-white/10">
                      10:04
                    </div>
                    
                    {/* Safe Zone Borders */}
                    <div className="absolute inset-0 border-[2px] border-dashed border-red-500/20 m-[5%]" />
                  </motion.div>
                )}
              </AnimatePresence>

              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center z-50 transition-all duration-500 bg-black/60 backdrop-blur-sm">
                  <div className="flex flex-col items-center gap-6 animate-in fade-in zoom-in-95 duration-500">
                    <div className="loader" />
                    <div className="text-center space-y-1.5">
                      <p className="text-sm font-semibold text-white tracking-wide">AI is optimizing your image</p>
                      <p className="text-[10px] text-white/50 font-medium uppercase tracking-[0.2em]">Please wait a moment</p>
                    </div>
                  </div>
                </div>
              )}

                {/* Label Overlay for safe zone (stays fixed at top) */}
                <AnimatePresence>
                  {showOverlays && imageUrl && !isLoading && (
                    <motion.div 
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="absolute top-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-red-500 text-white text-[10px] font-bold uppercase tracking-wider shadow-lg z-30"
                    >
                      YouTube UI Safe Zone Active
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
          ) : imageUrl && imageError ? (
            <div className="text-center space-y-4 animate-in fade-in duration-500">
              <div className="mx-auto h-20 w-20 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shadow-inner">
                <Zap className="h-8 w-8 text-red-400" />
              </div>
               <div>
                  <p className="text-sm font-semibold text-white/90">Image failed to load</p>
                  <p className="text-xs text-white/40 mt-1.5 font-light">Please try a different thumbnail</p>
               </div>
            </div>
          ) : (
            <div className="text-center space-y-4 animate-in fade-in duration-500">
              <div className="mx-auto h-20 w-20 rounded-3xl bg-white/[0.03] border border-white/5 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                <Zap className="h-8 w-8 text-white/50" />
              </div>
              <div className="space-y-1">
                  <p className="text-sm font-semibold text-white/90">
                    {isDragging ? "Drop image here" : "Pick a thumbnail from Inspiration"}
                  </p>
                  <p className="text-xs text-white/40 font-light">
                    Or drag an image here · Click <span className="text-white/70 font-medium">Upload</span> in the top right
                  </p>
                  <p className="text-[11px] text-white/30 font-light pt-2">
                    Scroll to zoom · Drag to pan
                  </p>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Preview Popup */}
        <AnimatePresence>
          {showMobilePreview && imageUrl && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={`absolute z-50 pointer-events-none select-none flex flex-col items-center gap-3 sm:gap-4
                ${isMobile ? 'inset-0 justify-center bg-black/40 backdrop-blur-sm p-6' : 'bottom-24 right-8'}
              `}
            >
              <div className="flex flex-col items-center gap-3 sm:gap-4 w-full max-w-[320px]">
                {/* YouTube Video Card Simulation */}
                <div className="w-full bg-[#0f0f0f] rounded-2xl sm:rounded-3xl overflow-hidden shadow-[0_40px_80px_-15px_rgba(0,0,0,0.8)] border border-white/5 animate-in zoom-in-95 duration-500">
                  {/* Thumbnail Part */}
                  <div className="relative aspect-video w-full overflow-hidden">
                    <img src={imageUrl} alt="Mobile Preview" className="w-full h-full object-cover" />
                    {/* Timestamp */}
                    <div className="absolute bottom-1.5 right-1.5 sm:bottom-2 sm:right-2 bg-black/90 text-white text-[9px] sm:text-[10px] font-bold px-1 sm:px-1.5 py-0.5 rounded-md flex items-center justify-center">
                      10:04
                    </div>
                  </div>
                  
                  {/* Video Info Part */}
                  <div className="p-2 sm:p-3 flex gap-2 sm:gap-3">
                    {/* Channel Avatar */}
                    <div className="h-7 w-7 sm:h-9 sm:w-9 rounded-full bg-white/10 shrink-0 border border-white/5 flex items-center justify-center">
                      <Zap className="h-3 w-3 sm:h-4 sm:w-4 text-white/40" />
                    </div>
                    
                    {/* Text Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xs sm:text-sm font-semibold text-white leading-tight line-clamp-2 mb-1">
                        {title || "My awesome video title"}
                      </h3>
                      <div className="flex flex-col text-[10px] sm:text-[12px] text-[#aaaaaa] font-medium leading-tight">
                        <span>Your Channel</span>
                        <div className="flex items-center gap-1">
                          <span>1.2M views</span>
                          <span className="h-0.5 w-0.5 rounded-full bg-[#aaaaaa]" />
                          <span>2 hours ago</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Menu dots */}
                    <div className="flex flex-col gap-0.5 pt-1">
                      {[1,2,3].map(i => <div key={i} className="h-0.5 w-0.5 rounded-full bg-white/40" />)}
                    </div>
                  </div>
                </div>

                {/* Label */}
                <div className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white/10 backdrop-blur-xl border border-white/10 flex items-center gap-2 shadow-2xl">
                  <Smartphone className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-white/80" />
                  <span className="text-[9px] sm:text-[10px] text-white/80 font-bold uppercase tracking-widest">Mobile UI Preview</span>
                </div>

                {isMobile && (
                  <p className="text-[10px] text-white/20 font-medium uppercase tracking-[0.2em] mt-2">Tap toggle to close</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div 
        id="studio-toolbar"
        className="absolute bottom-6 left-1/2 -translate-x-1/2 h-10 sm:h-12 border border-white/10 bg-[#111]/80 backdrop-blur-xl rounded-full flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-3 z-30 shadow-[0_8px_30px_rgba(0,0,0,0.5)] max-w-[95vw] overflow-x-auto no-scrollbar"
      >
        <PremiumTooltip content="Zoom Out">
          <button
            onClick={handleZoomOut}
            disabled={zoom <= MIN_ZOOM}
            className="p-1.5 sm:p-2 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-30 disabled:hover:bg-transparent h-7 w-7 sm:h-8 sm:w-8 flex items-center justify-center shrink-0"
          >
             <ZoomOut className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </button>
        </PremiumTooltip>

        <PremiumTooltip content="Reset Zoom">
          <button
            onClick={handleResetZoom}
            className="text-[10px] sm:text-[11px] text-white/70 font-medium min-w-[40px] sm:min-w-[48px] text-center hover:text-white transition-colors shrink-0"
          >
            {zoomPercentage}%
          </button>
        </PremiumTooltip>

        <PremiumTooltip content="Zoom In">
          <button
            onClick={handleZoomIn}
            disabled={zoom >= MAX_ZOOM}
            className="p-1.5 sm:p-2 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-30 disabled:hover:bg-transparent h-7 w-7 sm:h-8 sm:w-8 flex items-center justify-center shrink-0"
          >
             <ZoomIn className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </button>
        </PremiumTooltip>

        <div className="w-[1px] h-4 sm:h-5 bg-white/10 mx-0.5 sm:mx-1 shrink-0" />

        <PremiumTooltip content="Reset View">
          <button
             onClick={handleResetZoom}
             className="p-1.5 sm:p-2 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors h-7 w-7 sm:h-8 sm:w-8 flex items-center justify-center shrink-0"
          >
             <RotateCcw className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          </button>
        </PremiumTooltip>

        <PremiumTooltip content="Fullscreen">
          <button
             onClick={handleFullscreen}
             disabled={!imageUrl}
             className="p-1.5 sm:p-2 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-30 disabled:hover:bg-transparent h-7 w-7 sm:h-8 sm:w-8 flex items-center justify-center shrink-0"
          >
             <Maximize2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          </button>
        </PremiumTooltip>

        <div className="w-[1px] h-4 sm:h-5 bg-white/10 mx-0.5 sm:mx-1 shrink-0" />

        <PremiumTooltip content="Download PNG">
          <button
             onClick={handleDownload}
             disabled={!imageUrl}
             className="p-1.5 sm:p-2 rounded-full text-white hover:scale-105 bg-white/10 hover:bg-white/20 transition-all disabled:opacity-30 disabled:hover:scale-100 disabled:hover:bg-white/10 h-7 w-7 sm:h-8 sm:w-8 flex items-center justify-center shrink-0"
          >
             <Download className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          </button>
        </PremiumTooltip>

        <div className="w-[1px] h-4 sm:h-5 bg-white/10 mx-0.5 sm:mx-1 shrink-0" />

        <PremiumTooltip content="Reality Check">
          <button
             onClick={() => {
               if (!imageUrl) {
                 toast.info("Please load an image first to use the Reality Check.");
                 return;
               }
               setShowOverlays(!showOverlays);
             }}
             className={`p-1.5 sm:p-2 rounded-full transition-all h-7 w-7 sm:h-8 sm:w-8 flex items-center justify-center shrink-0 ${
               showOverlays ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.5)]' : 'text-white/50 hover:text-white hover:bg-white/10'
             }`}
          >
             <Layout className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          </button>
        </PremiumTooltip>

        <PremiumTooltip content="Mobile Preview">
          <button
             onClick={() => {
               if (!imageUrl) {
                 toast.info("Please load an image first to see the mobile preview.");
                 return;
               }
               setShowMobilePreview(!showMobilePreview);
             }}
             className={`p-1.5 sm:p-2 rounded-full transition-all h-7 w-7 sm:h-8 sm:w-8 flex items-center justify-center shrink-0 ${
               showMobilePreview ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.5)]' : 'text-white/50 hover:text-white hover:bg-white/10'
             }`}
          >
             <Smartphone className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          </button>
        </PremiumTooltip>

        <PremiumTooltip content="Share to Hall of Fame">
          <button
             onClick={() => {
               if (!imageUrl) {
                 toast.info("Load an image first to share it with the community!");
                 return;
               }
               onShare?.();
             }}
             className="p-1.5 sm:p-2 rounded-full text-amber-400 hover:scale-110 bg-amber-500/10 hover:bg-amber-500/20 transition-all h-7 w-7 sm:h-8 sm:w-8 flex items-center justify-center shrink-0 border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]"
          >
             <Trophy className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          </button>
        </PremiumTooltip>
      </div>
    </div>
  );
};

export default ThumbnailCanvas;
