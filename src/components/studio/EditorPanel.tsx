import { useState, useRef } from "react";
import { Wand2, Loader2, Sparkles, Type, Palette, Layers, Zap, Crown, Image, User, Star, Paperclip, X, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import ToolsModal from "./ToolsModal";
import { toast } from "sonner";

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
  credits: number;
  onApplyEdit: (prompt: string, mode: EditMode, referenceImage?: string) => Promise<void>;
  onSwitchToSkin?: () => void;
}

const CREDIT_COSTS: Record<EditMode, number> = {
  quick: 1,
  pro: 3,
  enhance: 2,
  background: 2,
  character: 3,
};

const modes: { id: EditMode; icon: typeof Zap; label: string; desc: string }[] = [
  { id: "quick", icon: Zap, label: "Quick", desc: "Schnelle Verbesserung" },
  { id: "pro", icon: Crown, label: "Pro", desc: "Maximale Qualität" },
  { id: "enhance", icon: Star, label: "Optimize", desc: "YouTube-optimiert" },
  { id: "background", icon: Image, label: "Background", desc: "Hintergrund verbessern" },
  { id: "character", icon: User, label: "Character", desc: "Figuren aufwerten" },
];

const quickEdits = [
  { icon: Star, label: "Make Epic", prompt: "Make this dramatically more epic with cinematic lighting, lens flares, and intense atmosphere" },
  { icon: Palette, label: "Boost Colors", prompt: "Apply cinematic color grading with boosted saturation, teal-orange tones, and dramatic contrast" },
  { icon: Sparkles, label: "More Glow", prompt: "Add dramatic glow effects, rim lighting, and volumetric light rays to key elements" },
  { icon: Layers, label: "Contrast & Depth", prompt: "Maximize subject-background separation with depth of field, stronger contrast, and atmospheric fog" },
];

const createId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  // Fallback für Browser ohne crypto.randomUUID
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
};

const EditorPanel = ({ hasImage, credits, onApplyEdit, onSwitchToSkin }: EditorPanelProps) => {
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
    const cost = CREDIT_COSTS[useMode] ?? 1;

    if (credits < cost) {
      toast.error(`Not enough credits. You need ${cost}, but only have ${credits}.`);
      return;
    }

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
    <div className="flex flex-col h-full bg-[#0a0a0a]/50">
      {/* Mode selector */}
      <div className="p-4 border-b border-white/5 space-y-3">
        <p className="text-[10px] text-white/30 uppercase tracking-wider font-semibold">
          AI Modus
        </p>
        <div className="grid grid-cols-5 gap-1.5">
          {modes.map((m) => (
            <button
              key={m.id}
              onClick={() => setSelectedMode(m.id)}
              className={`flex flex-col items-center gap-1.5 p-2 rounded-xl text-[10px] transition-all duration-200 border ${
                selectedMode === m.id
                  ? "border-white/30 bg-white/10 text-white shadow-sm ring-1 ring-white/10"
                  : "border-transparent text-white/40 hover:text-white/90 hover:bg-white/5"
              }`}
            >
              <m.icon className={`h-4 w-4 ${selectedMode === m.id ? "text-white" : "text-white/40"}`} />
              <span className="font-medium">{m.label}</span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 text-xs text-white/50 pt-1">
          <modeObj.icon className="h-4 w-4 text-white/70 shrink-0" />
          <span className="font-light">{modeObj.desc}</span>
          <span className="ml-auto text-[10px] bg-white text-black px-1.5 py-0.5 rounded shadow-lg font-bold tracking-wide">
            {CREDIT_COSTS[selectedMode] ?? 1} Credits
          </span>
        </div>
      </div>

      {/* Edit history */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 relative">
        {edits.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 space-y-4">
            <div className="h-12 w-12 rounded-full border border-white/10 bg-gradient-to-b from-white/5 to-transparent flex items-center justify-center">
              <Wand2 className="h-5 w-5 text-white/30" />
            </div>
            <p className="text-sm text-white/40 font-light max-w-[200px] leading-relaxed">
              {hasImage
                ? "Describe what you want to change. You can also attach a reference image."
                : "Load a thumbnail into the canvas first."}
            </p>
          </div>
        )}

        {edits.map((edit) => (
          <div
            key={edit.id}
            className={`rounded-xl p-3 text-xs border backdrop-blur-md transition-all ${
              edit.status === "done"
                ? "border-white/10 bg-white/[0.03]"
                : edit.status === "processing"
                  ? "border-white/20 bg-white/[0.05] shadow-[0_0_15px_rgba(255,255,255,0.05)] animate-pulse"
                  : "border-white/5 bg-black/40"
              }`}
          >
            <div className="flex items-start gap-3">
              {edit.status === "processing" ? (
                <Loader2 className="h-4 w-4 text-white/70 animate-spin shrink-0" />
              ) : (
                <Sparkles className="h-4 w-4 text-white/50 shrink-0" />
              )}
              <div className="min-w-0 flex-1">
                <span className="text-white/90 block font-medium mb-1 leading-snug">{edit.prompt}</span>
                <span className="text-[10px] text-white/40 capitalize font-light">
                  {edit.mode} mode · {CREDIT_COSTS[edit.mode] ?? 1} Credits
                </span>
                {edit.attachedImage && (
                  <div className="mt-2">
                     <img
                      src={edit.attachedImage}
                      alt="Referenz"
                      className="h-12 w-12 rounded-md object-cover border border-white/10 shadow-sm"
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
        <div className="px-4 pb-3">
          <p className="text-[10px] text-white/30 uppercase tracking-wider mb-2 font-semibold">
            Quick Edits
          </p>
          <div className="grid grid-cols-2 gap-2">
            {quickEdits.map((qe) => (
               <button
                 key={qe.label}
                 onClick={() => addEdit(qe.prompt)}
                 disabled={isProcessing}
                 className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-white/60 hover:text-white/90 hover:border-white/20 hover:bg-white/[0.04] transition-all duration-200 disabled:opacity-50"
               >
                 <qe.icon className="h-3.5 w-3.5 shrink-0" />
                 <span className="truncate font-light">{qe.label}</span>
               </button>
            ))}
          </div>
        </div>
      )}

      {/* Attached image preview */}
      {attachedImage && (
        <div className="px-4 pb-2">
           <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
             <img
               src={attachedImage}
               alt="Anhang"
               className="h-9 w-9 rounded object-cover border border-white/20"
             />
             <span className="text-[10px] text-white/60 truncate flex-1 font-light">
               {attachedImageName}
             </span>
             <button
               onClick={removeAttachment}
               className="text-white/40 hover:text-white transition-colors h-6 w-6 flex items-center justify-center rounded-full hover:bg-white/10"
             >
               <X className="h-3.5 w-3.5" />
             </button>
           </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-white/5 space-y-3 bg-[#0a0a0a]/90 backdrop-blur-xl">
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
             placeholder={hasImage ? `e.g. "make it more epic"...` : "Upload an image first..."}
             disabled={!hasImage || isProcessing}
             className="flex-1 h-10 px-4 rounded-xl bg-white/[0.03] border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-white/30 focus:bg-white/[0.05] transition-all disabled:opacity-50 min-w-0 font-light"
           />
        </div>
        <div className="flex items-center gap-2 justify-between">
           <div className="flex items-center gap-1.5">
             <button
               onClick={() => fileInputRef.current?.click()}
               disabled={!hasImage || isProcessing}
               className="h-9 w-9 shrink-0 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-center text-white/50 hover:text-white hover:border-white/20 hover:bg-white/10 transition-all duration-200 disabled:opacity-50 shadow-sm"
               title="Referenzbild anhängen"
             >
               <Paperclip className="h-4 w-4" />
             </button>
             <button
               onClick={() => setToolsOpen(true)}
               disabled={isProcessing}
               className="h-9 w-9 shrink-0 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-center text-white/50 hover:text-white hover:border-white/20 hover:bg-white/10 transition-all duration-200 disabled:opacity-50 shadow-sm"
               title="Tools"
             >
               <Wrench className="h-4 w-4" />
             </button>
             <span className="text-[10px] text-white/30 ml-2 font-light">
               📎 Ref · 🔧 Tools
             </span>
           </div>
           <Button
             size="sm"
             onClick={() => addEdit(editPrompt)}
             disabled={!editPrompt.trim() || !hasImage || isProcessing}
             className="h-9 px-5 bg-white hover:bg-white/90 text-black rounded-xl font-medium shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-all flex-shrink-0"
           >
             {isProcessing ? (
               <>
                 <Loader2 className="h-4 w-4 animate-spin mr-2" />
                 <span>Lädt...</span>
               </>
             ) : (
               <>
                 <Wand2 className="h-4 w-4 mr-2" />
                 <span>Edit</span>
               </>
             )}
           </Button>
        </div>
      </div>

      <ToolsModal
        open={toolsOpen}
        onClose={() => setToolsOpen(false)}
        hasImage={hasImage}
        onInsertMe={() => onSwitchToSkin?.()}
        onReshoot={() => addEdit("Reshoot this idea", "pro")}
      />
    </div>
  );
};

export default EditorPanel;
