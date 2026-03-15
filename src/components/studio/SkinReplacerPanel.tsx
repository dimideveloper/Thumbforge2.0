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
}

const SkinReplacerPanel = ({ canvasImage, onResult, onStart, onError }: SkinReplacerPanelProps) => {
  const [skinImage, setSkinImage] = useState<string | null>(null);
  const [skinName, setSkinName] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSkinUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Bitte ein Bild auswählen");
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
      toast.error("Thumbnail und Skin werden benötigt");
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

      if (error) throw new Error(error.message || "Skin-Ersetzung fehlgeschlagen");
      if (!data?.imageUrl) throw new Error(data?.error || "Kein Bild zurückgegeben");

      onResult(data.imageUrl, `Skin: ${skinName || "Custom"}`);
      toast.success("Skin erfolgreich ersetzt!");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Skin-Ersetzung fehlgeschlagen";
      console.error("Skin replace error:", msg);
      toast.error(msg);
      onError?.();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-border">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
          Minecraft Skin Replacer
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Lade deinen Minecraft-Skin hoch und ersetze den Charakter im Thumbnail.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Step 1: Canvas image status */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-foreground flex items-center gap-1.5">
            <span className="h-5 w-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold">1</span>
            Thumbnail im Canvas
          </p>
          {canvasImage ? (
            <div className="rounded-lg border border-secondary/30 bg-secondary/5 p-2 flex items-center gap-2">
              <img src={canvasImage} alt="Canvas" className="h-10 w-16 rounded object-cover border border-border" />
              <span className="text-[10px] text-secondary font-medium">✓ Thumbnail geladen</span>
            </div>
          ) : (
            <div className="rounded-lg border border-border bg-muted/50 p-3 text-center">
              <ImageIcon className="h-6 w-6 text-muted-foreground/30 mx-auto mb-1" />
              <p className="text-[10px] text-muted-foreground">Lade zuerst ein Thumbnail in den Canvas</p>
            </div>
          )}
        </div>

        {/* Step 2: Skin upload */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-foreground flex items-center gap-1.5">
            <span className="h-5 w-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold">2</span>
            Deinen Skin hochladen
          </p>

          {skinImage ? (
            <div className="rounded-lg border border-border bg-muted/50 p-2">
              <div className="flex items-center gap-2">
                <img src={skinImage} alt="Skin" className="h-16 w-16 rounded-lg object-contain border border-border bg-[repeating-conic-gradient(hsl(var(--muted))_0%_25%,transparent_0%_50%)_0_0/16px_16px]" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">{skinName}</p>
                  <p className="text-[10px] text-muted-foreground">Skin bereit</p>
                </div>
                <button
                  onClick={() => { setSkinImage(null); setSkinName(null); }}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full rounded-lg border-2 border-dashed border-border hover:border-primary/40 bg-muted/30 hover:bg-primary/5 p-6 text-center transition-all group"
            >
              <UserCircle className="h-10 w-10 text-muted-foreground/30 group-hover:text-primary/50 mx-auto transition-colors" />
              <p className="text-xs text-muted-foreground group-hover:text-foreground mt-2 transition-colors">
                Klicke um deinen Skin hochzuladen
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">PNG, JPG oder Minecraft Skin-Datei</p>
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
        <div className="space-y-2">
          <p className="text-xs font-medium text-foreground flex items-center gap-1.5">
            <span className="h-5 w-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold">3</span>
            Zusätzliche Anweisungen
            <span className="text-[10px] text-muted-foreground font-normal">(optional)</span>
          </p>
          <input
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="z.B. 'gleiche Pose, epischer Glow'"
            className="w-full h-9 px-3 rounded-lg bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Action button */}
      <div className="p-3 border-t border-border">
        <Button
          onClick={handleReplace}
          disabled={!canvasImage || !skinImage || isProcessing}
          className="w-full h-10 bg-primary hover:bg-primary/80 text-primary-foreground font-medium"
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
        <p className="text-[9px] text-muted-foreground text-center mt-1.5">
          Die KI analysiert beide Bilder und ersetzt den Charakter
        </p>
      </div>
    </div>
  );
};

export default SkinReplacerPanel;
