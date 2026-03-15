import { useState, useRef } from "react";
import { Wand2, Loader2, Sparkles, Type, Palette, Layers, Zap, Crown, Image, User, Star, Paperclip, X, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import ToolsModal from "./ToolsModal";

type EditMode = "quick" | "pro" | "background" | "character" | "enhance";

interface EditItem {
  id: string;
  prompt: string;
  mode: EditMode;
  status: "queued" | "processing" | "done";
  attachedImage?: string;
}

interface EditorPanelProps {
  hasImage: boolean;
  onApplyEdit: (prompt: string, mode: EditMode, referenceImage?: string) => Promise<void>;
  onSwitchToSkin?: () => void;
}

const modes: { id: EditMode; icon: typeof Zap; label: string; desc: string }[] = [
  { id: "quick", icon: Zap, label: "Quick", desc: "Schnelle Verbesserung" },
  { id: "pro", icon: Crown, label: "Pro", desc: "Maximale Qualität" },
  { id: "enhance", icon: Star, label: "Optimize", desc: "YouTube-optimiert" },
  { id: "background", icon: Image, label: "Background", desc: "Hintergrund verbessern" },
  { id: "character", icon: User, label: "Character", desc: "Figuren aufwerten" },
];

const quickEdits = [
  { icon: Star, label: "Epischer machen", prompt: "Make this dramatically more epic with cinematic lighting, lens flares, and intense atmosphere" },
  { icon: Palette, label: "Farben verstärken", prompt: "Apply cinematic color grading with boosted saturation, teal-orange tones, and dramatic contrast" },
  { icon: Sparkles, label: "Mehr Glow", prompt: "Add dramatic glow effects, rim lighting, and volumetric light rays to key elements" },
  { icon: Layers, label: "Kontrast & Tiefe", prompt: "Maximize subject-background separation with depth of field, stronger contrast, and atmospheric fog" },
];

const createId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  // Fallback für Browser ohne crypto.randomUUID
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
};

const EditorPanel = ({ hasImage, onApplyEdit, onSwitchToSkin }: EditorPanelProps) => {
  const [editPrompt, setEditPrompt] = useState("");
  const [edits, setEdits] = useState<EditItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedMode, setSelectedMode] = useState<EditMode>("pro");
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [attachedImageName, setAttachedImageName] = useState<string | null>(null);
  const [toolsOpen, setToolsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAttachImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) {
        setAttachedImage(ev.target.result as string);
        setAttachedImageName(file.name);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const removeAttachment = () => {
    setAttachedImage(null);
    setAttachedImageName(null);
  };

  const addEdit = async (prompt: string, mode?: EditMode) => {
    if (!prompt.trim() || !hasImage) return;
    const useMode = mode ?? selectedMode;

    const newEdit: EditItem = {
      id: createId(),
      prompt,
      mode: useMode,
      status: "processing",
      attachedImage: attachedImage || undefined,
    };
    setEdits((prev) => [...prev, newEdit]);
    setEditPrompt("");
    const currentAttached = attachedImage || undefined;
    removeAttachment();
    setIsProcessing(true);

    try {
      await onApplyEdit(prompt, useMode, currentAttached);
      setEdits((prev) =>
        prev.map((e) => (e.id === newEdit.id ? { ...e, status: "done" } : e))
      );
    } catch {
      setEdits((prev) => prev.filter((e) => e.id !== newEdit.id));
    } finally {
      setIsProcessing(false);
    }
  };

  const modeObj = modes.find((m) => m.id === selectedMode)!;

  return (
    <div className="flex flex-col h-full">
      {/* Mode selector */}
      <div className="p-3 border-b border-border space-y-2">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
          AI Modus
        </p>
        <div className="grid grid-cols-5 gap-1">
          {modes.map((m) => (
            <button
              key={m.id}
              onClick={() => setSelectedMode(m.id)}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg text-[10px] transition-all border ${selectedMode === m.id
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
            >
              <m.icon className="h-3.5 w-3.5" />
              <span className="font-medium">{m.label}</span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <modeObj.icon className="h-3.5 w-3.5 text-primary shrink-0" />
          <span>{modeObj.desc}</span>
          {selectedMode === "pro" && (
            <span className="ml-auto text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded font-medium">
              HQ
            </span>
          )}
        </div>
      </div>

      {/* Edit history */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {edits.length === 0 && (
          <div className="text-center py-6 space-y-3">
            <Wand2 className="h-8 w-8 text-muted-foreground/30 mx-auto" />
            <p className="text-xs text-muted-foreground">
              {hasImage
                ? "Beschreibe, was du ändern möchtest. Du kannst auch ein Referenzbild anhängen!"
                : "Lade zuerst ein Thumbnail in den Canvas"}
            </p>
          </div>
        )}

        {edits.map((edit) => (
          <div
            key={edit.id}
            className={`rounded-lg p-2.5 text-xs border ${edit.status === "done"
                ? "border-secondary/30 bg-secondary/5"
                : edit.status === "processing"
                  ? "border-primary/30 bg-primary/5 animate-pulse"
                  : "border-border bg-muted/50"
              }`}
          >
            <div className="flex items-start gap-2">
              {edit.status === "processing" ? (
                <Loader2 className="h-3.5 w-3.5 text-primary animate-spin mt-0.5 shrink-0" />
              ) : (
                <Sparkles className="h-3.5 w-3.5 text-secondary mt-0.5 shrink-0" />
              )}
              <div className="min-w-0 flex-1">
                <span className="text-foreground/80 block">{edit.prompt}</span>
                <span className="text-[10px] text-muted-foreground capitalize">{edit.mode} mode</span>
                {edit.attachedImage && (
                  <div className="mt-1.5">
                    <img
                      src={edit.attachedImage}
                      alt="Referenz"
                      className="h-10 w-10 rounded object-cover border border-border"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick edits */}
      {hasImage && (
        <div className="px-3 pb-2">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2 font-medium">
            Quick Edits
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {quickEdits.map((qe) => (
              <button
                key={qe.label}
                onClick={() => addEdit(qe.prompt)}
                disabled={isProcessing}
                className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg bg-muted/50 border border-border text-xs text-muted-foreground hover:text-foreground hover:border-primary/30 hover:bg-primary/5 transition-all disabled:opacity-50"
              >
                <qe.icon className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{qe.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Attached image preview */}
      {attachedImage && (
        <div className="px-3 pb-1">
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-muted/50 border border-border">
            <img
              src={attachedImage}
              alt="Anhang"
              className="h-8 w-8 rounded object-cover border border-border"
            />
            <span className="text-[10px] text-muted-foreground truncate flex-1">
              {attachedImageName}
            </span>
            <button
              onClick={removeAttachment}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-3 border-t border-border space-y-2">
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAttachImage}
          />
          <input
            value={editPrompt}
            onChange={(e) => setEditPrompt(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addEdit(editPrompt)}
            placeholder={hasImage ? "z.B. 'mach es epischer'…" : "Lade ein Bild hoch…"}
            disabled={!hasImage || isProcessing}
            className="flex-1 h-9 px-3 rounded-lg bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50 min-w-0"
          />
        </div>
        <div className="flex items-center gap-2 justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={!hasImage || isProcessing}
              className="h-8 w-8 shrink-0 rounded-lg bg-muted border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors disabled:opacity-50"
              title="Referenzbild anhängen"
            >
              <Paperclip className="h-4 w-4" />
            </button>
            <button
              onClick={() => setToolsOpen(true)}
              disabled={isProcessing}
              className="h-8 w-8 shrink-0 rounded-lg bg-muted border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors disabled:opacity-50"
              title="Tools"
            >
              <Wrench className="h-4 w-4" />
            </button>
            <span className="text-[9px] text-muted-foreground ml-1">
              📎 Referenz · 🔧 Tools
            </span>
          </div>
          <Button
            size="sm"
            onClick={() => addEdit(editPrompt)}
            disabled={!editPrompt.trim() || !hasImage || isProcessing}
            className="h-8 px-4 bg-primary hover:bg-primary/80 text-primary-foreground flex-shrink-0"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                <span>Lädt...</span>
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4 mr-1.5" />
                <span>Editieren</span>
              </>
            )}
          </Button>
        </div>
      </div>

      <ToolsModal
        open={toolsOpen}
        onClose={() => setToolsOpen(false)}
        onInsertMe={() => onSwitchToSkin?.()}
        hasImage={hasImage}
        onReshoot={(prompt) => onApplyEdit(prompt, "pro")}
      />
    </div>
  );
};

export default EditorPanel;
