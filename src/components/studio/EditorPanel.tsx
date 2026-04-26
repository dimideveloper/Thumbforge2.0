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
  const [pendingPrompts, setPendingPrompts] = useState<string[]>([]);
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

  const addPromptToDraft = (prompt: string) => {
    if (!prompt.trim() || !hasImage) return;
    setPendingPrompts(prev => [...prev, prompt.trim()]);
    setEditPrompt("");
  };

  const removePromptFromDraft = (index: number) => {
    setPendingPrompts(prev => prev.filter((_, i) => i !== index));
  };

  const handleGenerate = async () => {
    if (pendingPrompts.length === 0 || !hasImage) return;
    
    const combinedPrompt = pendingPrompts.join(". ");
    const useMode = selectedMode;
    const cost = CREDIT_COSTS[useMode] ?? 1;

    if (credits < cost) {
      toast.error(`Not enough credits. You need ${cost}, but only have ${credits}.`);
      return;
    }

    const newEdit: EditItem = {
      id: createId(),
      prompt: combinedPrompt,
      mode: useMode,
      status: "processing",
      attachedImage: attachedImage || undefined,
    };

    setEdits((prev) => [...prev, newEdit]);
    const currentAttached = attachedImage || undefined;
    
    // Clear draft state
    setPendingPrompts([]);
    removeAttachment();
    setIsProcessing(true);

    try {
      await onApplyEdit(combinedPrompt, useMode, currentAttached);
      setEdits((prev) =>
        prev.map((e) => (e.id === newEdit.id ? { ...e, status: "done" } : e))
      );
    } catch {
      setEdits((prev) => prev.filter((e) => e.id !== newEdit.id));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a]/50 overflow-y-auto">

      {/* Edit history & Pending */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2 sm:space-y-3 relative min-h-[120px]">
        {edits.length === 0 && pendingPrompts.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 space-y-4">
            <div className="h-12 w-12 rounded-full border border-white/10 bg-gradient-to-b from-white/5 to-transparent flex items-center justify-center">
              <Wand2 className="h-5 w-5 text-white/30" />
            </div>
            <p className="text-sm text-white/40 font-light max-w-[200px] leading-relaxed">
              {hasImage
                ? "Describe what you want to change. You can queue multiple instructions."
                : "Load a thumbnail into the canvas first."}
            </p>
          </div>
        )}

        {/* Previous Edits */}
        {edits.map((edit) => (
          <div
            key={edit.id}
            className={`rounded-xl p-3 text-xs border backdrop-blur-md transition-all ${
              edit.status === "done"
                ? "border-white/10 bg-white/[0.03]"
                : "border-white/20 bg-white/[0.05] shadow-[0_0_15px_rgba(255,255,255,0.05)] animate-pulse"
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
                   Finished · {edit.mode} mode
                </span>
              </div>
            </div>
          </div>
        ))}

        {/* Pending Edits (Draft) */}
        {pendingPrompts.map((prompt, idx) => (
          <div
            key={`pending-${idx}`}
            className="rounded-xl p-3 text-xs border border-white/10 bg-white/[0.01] group animate-in slide-in-from-right-2 duration-300"
          >
            <div className="flex items-center gap-3">
              <div className="h-5 w-5 rounded-full bg-white/5 flex items-center justify-center text-[10px] text-white/40 font-bold">
                {idx + 1}
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-white/70 block leading-snug">{prompt}</span>
              </div>
              <button 
                onClick={() => removePromptFromDraft(idx)}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:text-red-400 text-white/30"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Quick edits */}
      {hasImage && (
        <div className="px-3 sm:px-4 pb-2 sm:pb-3 shrink-0">
          <p className="text-[9px] sm:text-[10px] text-white/30 uppercase tracking-wider mb-1.5 sm:mb-2 font-semibold">
            Quick Edits
          </p>
          <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
            {quickEdits.map((qe) => (
               <button
                 key={qe.label}
                 onClick={() => addPromptToDraft(qe.prompt)}
                 disabled={isProcessing}
                 className="flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg sm:rounded-xl bg-white/[0.02] border border-white/5 text-[10px] sm:text-xs text-white/60 hover:text-white/90 hover:border-white/20 hover:bg-white/[0.04] transition-all duration-200 disabled:opacity-50"
               >
                 <qe.icon className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
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
      <div className="p-3 sm:p-4 border-t border-white/5 space-y-2 sm:space-y-3 bg-[#0a0a0a]/90 backdrop-blur-xl shrink-0">
        <div className="flex items-center gap-2">
           <input
             ref={fileInputRef}
             type="file"
             accept="image/*"
             className="hidden"
             onChange={handleAttachImage}
           />
           <div className="flex-1 relative">
             <input
               value={editPrompt}
               onChange={(e) => setEditPrompt(e.target.value)}
               onKeyDown={(e) => e.key === "Enter" && addPromptToDraft(editPrompt)}
               placeholder={hasImage ? `Add instructions...` : "Upload an image first..."}
               disabled={!hasImage || isProcessing}
               className="w-full h-9 sm:h-10 px-3 sm:px-4 rounded-lg sm:rounded-xl bg-white/[0.03] border border-white/10 text-xs sm:text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-white/30 focus:bg-white/[0.05] transition-all disabled:opacity-50 min-w-0 font-light pr-12"
             />
             {editPrompt.trim() && (
               <button 
                 onClick={() => addPromptToDraft(editPrompt)}
                 className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-white/60 hover:text-white bg-white/10 px-2 py-1 rounded-md transition-all"
               >
                 Add
               </button>
             )}
           </div>
        </div>
        <div className="flex items-center gap-2 justify-between">
           <div className="flex items-center gap-1.5">
             <button
               onClick={() => fileInputRef.current?.click()}
               disabled={!hasImage || isProcessing}
               className="h-8 w-8 sm:h-9 sm:w-9 shrink-0 rounded-lg sm:rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-center text-white/50 hover:text-white hover:border-white/20 hover:bg-white/10 transition-all duration-200 disabled:opacity-50 shadow-sm"
               title="Referenzbild anhängen"
             >
               <Paperclip className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
             </button>
             <button
               onClick={() => setToolsOpen(true)}
               disabled={isProcessing}
               className="h-8 w-8 sm:h-9 sm:w-9 shrink-0 rounded-lg sm:rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-center text-white/50 hover:text-white hover:border-white/20 hover:bg-white/10 transition-all duration-200 disabled:opacity-50 shadow-sm"
               title="Tools"
             >
               <Wrench className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
             </button>
           </div>
           
           <Button
             size="sm"
             onClick={handleGenerate}
             disabled={pendingPrompts.length === 0 || !hasImage || isProcessing}
             className={`h-8 sm:h-9 px-3 sm:px-5 rounded-lg sm:rounded-xl font-semibold shadow-lg transition-all flex-shrink-0 text-xs gap-2 ${
               pendingPrompts.length > 0 
                ? "bg-white text-black hover:bg-white/90 animate-in zoom-in-95" 
                : "bg-white/5 text-white/20"
             }`}
           >
             {isProcessing ? (
               <>
                 <Loader2 className="h-3.5 w-3.5 animate-spin" />
                 <span>Generating...</span>
               </>
             ) : (
               <>
                 <Sparkles className="h-3.5 w-3.5" />
                 <span>Generate {pendingPrompts.length > 0 && `(${pendingPrompts.length})`}</span>
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
        onReshoot={async (prompt) => addPromptToDraft(prompt)}
      />
    </div>
  );
};

export default EditorPanel;
