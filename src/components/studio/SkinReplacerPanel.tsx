import { useState, useRef } from "react";
import { Upload, Loader2, UserCircle, Wand2, X, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SkinReplacerPanelProps {
  canvasImage: string | null;
  onResult: (url: string, label: string) => void;
  onStart?: () => void;
  onError?: () => void;
  onCreditSpent?: () => void;
}

const SkinReplacerPanel = ({ canvasImage, onResult, onStart, onError, onCreditSpent }: SkinReplacerPanelProps) => {
  const [skinImage, setSkinImage] = useState<string | null>(null);
  const [skinName, setSkinName] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSkinUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image");
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) {
        setSkinImage(ev.target.result as string);
        setSkinName(file.name);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleReplace = async () => {
    if (!canvasImage || !skinImage) {
      toast.error("Thumbnail and skin are required");
      return;
    }

    setIsProcessing(true);
    onStart?.();

    try {
      const { data, error } = await supabase.functions.invoke("skin-replace", {
        body: {
          thumbnailUrl: canvasImage,
          skinUrl: skinImage,
          prompt: customPrompt.trim(),
        },
      });

      if (error) {
        const ctxBody = (error as any)?.context?.body;
        if (typeof ctxBody === "string") {
          try {
            const parsed = JSON.parse(ctxBody);
            throw new Error(parsed?.error || error.message || "Skin replacement failed");
          } catch {
            throw new Error(error.message || "Skin replacement failed");
          }
        }
        if (ctxBody && typeof ctxBody === "object") {
          throw new Error((ctxBody as any)?.error || error.message || "Skin replacement failed");
        }
        throw new Error(error.message || "Skin replacement failed");
      }
      if (!data?.imageUrl) {
        throw new Error(data?.error || "The AI did not return an edited image. Please try again with a different image or prompt.");
      }

      onResult(data.imageUrl, `Skin: ${skinName || "Custom"}`);
      onCreditSpent?.();
      // If function returns remaining credits, prefer that (more accurate than optimistic UI).
      if (typeof (data as any)?.creditsRemaining === "number") {
        onCreditSpent?.();
      }
      toast.success("Skin successfully replaced!");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Skin replacement failed";
      console.error("Skin replace error:", msg);
      toast.error(msg);
      onError?.();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a]/50">
      <div className="p-4 border-b border-white/5 space-y-1">
        <p className="text-[10px] text-white/30 uppercase tracking-wider font-semibold flex items-center gap-1.5">
          <UserCircle className="h-3.5 w-3.5 text-white/40" />
          Minecraft Skin Replacer
        </p>
        <p className="text-xs text-white/50 font-light leading-snug">
          Upload your Minecraft skin and replace the character in the thumbnail.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Step 1: Canvas image status */}
        <div className="space-y-2.5">
          <p className="text-xs font-medium text-white/90 flex items-center gap-2">
            <span className="h-5 w-5 rounded-full border border-white/20 bg-white/5 text-white/80 flex items-center justify-center text-[10px] font-bold shadow-sm">1</span>
            Thumbnail in canvas
          </p>
          {canvasImage ? (
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-2.5 flex items-center gap-3 shadow-inner backdrop-blur-md">
              <img src={canvasImage} alt="Canvas" className="h-10 w-16 rounded-md object-cover border border-white/20 shadow-sm" />
              <span className="text-[11px] text-white/70 font-medium flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500/80 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
                Bereit
              </span>
            </div>
          ) : (
            <div className="rounded-xl border border-white/5 bg-black/40 p-4 text-center">
              <ImageIcon className="h-6 w-6 text-white/20 mx-auto mb-2" />
              <p className="text-[11px] text-white/40 font-light">Load a thumbnail into the canvas first</p>
            </div>
          )}
        </div>

        {/* Step 2: Skin upload */}
        <div className="space-y-2.5">
          <p className="text-xs font-medium text-white/90 flex items-center gap-2">
            <span className="h-5 w-5 rounded-full border border-white/20 bg-white/5 text-white/80 flex items-center justify-center text-[10px] font-bold shadow-sm">2</span>
            Upload your skin
          </p>

          {skinImage ? (
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-2.5 shadow-inner backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="relative h-12 w-12 rounded-lg border border-white/20 bg-[#111] overflow-hidden">
                   <div className="absolute inset-0 bg-[repeating-conic-gradient(rgba(255,255,255,0.05)_0%_25%,transparent_0%_50%)_0_0/12px_12px]" />
                   <img src={skinImage} alt="Skin" className="absolute inset-0 w-full h-full object-contain p-1 drop-shadow-md" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white/90 truncate">{skinName}</p>
                  <p className="text-[10px] text-white/50 font-light flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500/80 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
                    Skin bereit
                  </p>
                </div>
                <button
                  onClick={() => { setSkinImage(null); setSkinName(null); }}
                  className="h-7 w-7 flex items-center justify-center rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full rounded-xl border border-dashed border-white/10 hover:border-white/30 bg-white/[0.02] hover:bg-white/[0.05] p-6 text-center transition-all duration-300 group"
            >
              <div className="h-10 w-10 rounded-full border border-white/5 bg-white/[0.03] flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                <Upload className="h-4 w-4 text-white/40 group-hover:text-white/80 transition-colors" />
              </div>
              <p className="text-xs text-white/60 group-hover:text-white mt-2 transition-colors font-medium">
                Click to upload your skin
              </p>
              <p className="text-[10px] text-white/30 mt-1 font-light">PNG, JPG <br/> or Minecraft skin file</p>
            </button>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleSkinUpload}
          />
        </div>

        {/* Step 3: Optional prompt */}
        <div className="space-y-2.5">
           <p className="text-xs font-medium text-white/90 flex items-center gap-2">
             <span className="h-5 w-5 rounded-full border border-white/20 bg-white/5 text-white/80 flex items-center justify-center text-[10px] font-bold shadow-sm">3</span>
             Zusätzliche Anweisungen
             <span className="text-[10px] text-white/30 font-light ml-1">(Optional)</span>
           </p>
          <input
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="e.g. 'same pose, epic glow'"
            className="w-full h-10 px-3.5 rounded-xl bg-white/[0.03] border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-white/30 focus:bg-white/[0.05] transition-all font-light"
          />
        </div>
      </div>

      {/* Action button */}
      <div className="p-4 border-t border-white/5 bg-[#0a0a0a]/90 backdrop-blur-xl">
        <Button
          onClick={handleReplace}
          disabled={!canvasImage || !skinImage || isProcessing}
          className="w-full h-10 bg-white hover:bg-white/90 text-black font-medium disabled:opacity-50 transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)] rounded-xl"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Skin wird ersetzt…
            </>
          ) : (
            <>
              <Wand2 className="h-4 w-4 mr-2" />
              Skin ersetzen
            </>
          )}
        </Button>
        <p className="text-[10px] text-white/30 text-center mt-2.5 font-light">
          The AI analyzes both images and <br/> replaces the character in the thumbnail.
        </p>
      </div>
    </div>
  );
};

export default SkinReplacerPanel;
