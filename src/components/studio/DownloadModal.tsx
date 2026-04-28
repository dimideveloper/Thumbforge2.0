import React, { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, FileImage, Layers, Monitor, Sliders, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string | null;
  projectTitle: string;
  userPlan?: string;
}

type Format = "png" | "jpeg" | "webp";
type Resolution = "720p" | "1080p" | "1440p";

export function DownloadModal({ isOpen, onClose, imageUrl, projectTitle, userPlan = "free" }: DownloadModalProps) {
  const [format, setFormat] = useState<Format>("png");
  const [resolution, setResolution] = useState<Resolution>("720p");
  const [quality, setQuality] = useState(90);
  const [isExporting, setIsExporting] = useState(false);

  const isResolutionLocked = (resId: string) => {
    if (resId === "1440p") {
      return userPlan.toLowerCase() === "free";
    }
    return false;
  };

  const handleExport = async () => {
    if (!imageUrl) return;
    setIsExporting(true);

    try {
      // Create a canvas to process the image
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = imageUrl;

      await new Promise((resolve) => (img.onload = resolve));

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) throw new Error("Canvas context failed");

      // Set resolution
      let width = 1280;
      let height = 720;
      if (resolution === "1080p") { width = 1920; height = 1080; }
      if (resolution === "1440p") { width = 2560; height = 1440; }

      canvas.width = width;
      canvas.height = height;

      // Draw and scale image
      ctx.drawImage(img, 0, 0, width, height);

      // Export based on format
      const mimeType = `image/${format}`;
      const exportQuality = format === "png" ? undefined : quality / 100;
      
      const dataUrl = canvas.toDataURL(mimeType, exportQuality);
      
      // Trigger download
      const link = document.createElement("a");
      const fileName = projectTitle.replace(/\s+/g, "-").toLowerCase() || "thumbnail";
      link.download = `${fileName}-${resolution}.${format}`;
      link.href = dataUrl;
      link.click();

      toast.success("Thumbnail exported successfully!");
      onClose();
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Failed to export image. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px] bg-[#0a0a0a] border-white/10 text-white p-0 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        <div className="p-6">
          <DialogTitle className="text-xl font-semibold mb-6 flex items-center gap-3">
            <Download className="h-5 w-5 text-blue-500" />
            Export Settings
          </DialogTitle>

          <div className="space-y-8">
            {/* Format Selection */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-widest text-white/40 flex items-center gap-2">
                <FileImage className="h-3.5 w-3.5" /> File Format
              </label>
              <div className="grid grid-cols-3 gap-2 bg-white/5 p-1 rounded-xl border border-white/5">
                {(["png", "jpeg", "webp"] as Format[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFormat(f)}
                    className={`py-2 rounded-lg text-xs font-medium transition-all ${
                      format === f ? "bg-white text-black shadow-lg" : "text-white/40 hover:text-white"
                    }`}
                  >
                    {f.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Resolution Selection */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-widest text-white/40 flex items-center gap-2">
                <Monitor className="h-3.5 w-3.5" /> Resolution
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "720p", label: "720p", desc: "Standard" },
                  { id: "1080p", label: "1080p", desc: "Full HD" },
                  { id: "1440p", label: "1440p", desc: "Ultra" },
                ].map((res) => {
                  const locked = isResolutionLocked(res.id);
                  return (
                    <button
                      key={res.id}
                      onClick={() => {
                        if (locked) {
                          toast.error(`${res.label} is only available in paid plans. Upgrade to unlock!`);
                        } else {
                          setResolution(res.id as Resolution);
                        }
                      }}
                      className={`p-3 rounded-xl border flex flex-col items-center transition-all relative overflow-hidden ${
                        resolution === res.id 
                          ? "bg-blue-500/10 border-blue-500/50 text-white" 
                          : locked
                            ? "bg-white/[0.02] border-white/5 text-white/20 hover:border-white/10"
                            : "bg-white/5 border-white/5 text-white/40 hover:border-white/10"
                      }`}
                    >
                      <span className="text-sm font-bold">{res.label}</span>
                      <span className="text-[10px] opacity-60 font-light">{res.desc}</span>
                      {locked && (
                        <div className="absolute top-1 right-1">
                          <Zap className="h-2.5 w-2.5 text-amber-500 fill-amber-500" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quality Slider (for JPEG/WEBP) */}
            {format !== "png" && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="space-y-3"
              >
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold uppercase tracking-widest text-white/40 flex items-center gap-2">
                    <Sliders className="h-3.5 w-3.5" /> Image Quality
                  </label>
                  <span className="text-xs font-bold text-blue-500">{quality}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={quality}
                  onChange={(e) => setQuality(parseInt(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </motion.div>
            )}
          </div>
        </div>

        {/* Footer Action */}
        <div className="p-6 bg-white/[0.02] border-t border-white/5 flex flex-col gap-3">
          <Button
            onClick={handleExport}
            disabled={isExporting}
            className="w-full py-6 rounded-2xl bg-white text-black hover:bg-white/90 font-bold transition-all disabled:opacity-50"
          >
            {isExporting ? "Processing..." : "Export Image"}
          </Button>
          <p className="text-[10px] text-center text-white/20">
            {format === "png" ? "Lossless format for best quality." : "Compressed format for faster loading."}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
