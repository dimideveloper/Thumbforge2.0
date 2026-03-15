import { useState } from "react";
import { X, ChevronLeft, UserCircle, Camera, Sparkles, Clapperboard, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

type CreativityLevel = "polish" | "balanced" | "remix";

interface ToolsModalProps {
  open: boolean;
  onClose: () => void;
  onInsertMe: () => void;
  hasImage: boolean;
  onReshoot: (prompt: string) => Promise<void>;
}

const creativityLevels: {
  id: CreativityLevel;
  icon: typeof Sparkles;
  label: string;
  subtitle: string;
  description: string;
}[] = [
  {
    id: "polish",
    icon: Sparkles,
    label: "Polish",
    subtitle: "Just fix lighting",
    description: "Preserve pose & composition",
  },
  {
    id: "balanced",
    icon: Clapperboard,
    label: "Balanced",
    subtitle: "Fresh take",
    description: "New angle, boost energy",
  },
  {
    id: "remix",
    icon: Rocket,
    label: "Remix",
    subtitle: "Surprise me!",
    description: "Dramatic transformation",
  },
];

const reshootPrompts: Record<CreativityLevel, string> = {
  polish:
    "Reshoot this thumbnail with improved lighting, color grading, and visual polish. Keep the exact same pose, angle, composition, and all elements. Only enhance the quality, sharpness, contrast, and lighting to make it look more professional and cinematic.",
  balanced:
    "Reshoot this thumbnail with a slightly different camera angle and improved composition. Keep the same subject and scene but give it a fresh, more dynamic look with better framing, enhanced lighting, and boosted energy. Make it feel like a new, better take of the same shot.",
  remix:
    "Dramatically reimagine this thumbnail with a completely new camera angle, bold composition changes, and intense cinematic effects. Transform it into something visually striking with dramatic lighting, strong depth of field, and maximum visual impact while keeping the same subject and theme.",
};

const ToolsModal = ({ open, onClose, onInsertMe, hasImage, onReshoot }: ToolsModalProps) => {
  const [activeTool, setActiveTool] = useState<"list" | "reshoot">("list");
  const [creativity, setCreativity] = useState<CreativityLevel>("balanced");
  const [isProcessing, setIsProcessing] = useState(false);

  if (!open) return null;

  const handleClose = () => {
    setActiveTool("list");
    setIsProcessing(false);
    onClose();
  };

  const handleInsertMe = () => {
    handleClose();
    onInsertMe();
  };

  const handleStartReshoot = async () => {
    if (!hasImage) return;
    setIsProcessing(true);
    try {
      await onReshoot(reshootPrompts[creativity]);
      handleClose();
    } catch {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-card border border-border rounded-2xl shadow-2xl w-[680px] max-w-[90vw] max-h-[80vh] flex overflow-hidden animate-in zoom-in-95 fade-in duration-200">
        {/* Sidebar - tool list */}
        <div
          className={`${
            activeTool === "list" ? "w-full sm:w-[260px]" : "hidden sm:block sm:w-[260px]"
          } border-r border-border flex flex-col shrink-0`}
        >
          <div className="p-4 flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <h2 className="text-sm font-semibold text-foreground">Tools Library</h2>
          </div>

          <div className="px-3 pb-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium px-1 mb-2">
              Available
            </p>
            <div className="space-y-1">
              {/* Insert Me */}
              <button
                onClick={handleInsertMe}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-muted/50 transition-colors text-left group"
              >
                <div className="h-9 w-9 rounded-xl bg-purple-500/20 flex items-center justify-center shrink-0">
                  <UserCircle className="h-5 w-5 text-purple-400" />
                </div>
                <span className="text-sm font-medium text-foreground flex-1">Insert Me</span>
                <ChevronLeft className="h-4 w-4 text-muted-foreground rotate-180 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>

              {/* Reshoot */}
              <button
                onClick={() => setActiveTool("reshoot")}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-colors text-left group ${
                  activeTool === "reshoot"
                    ? "bg-muted/70 border border-primary/20"
                    : "hover:bg-muted/50"
                }`}
              >
                <div className="h-9 w-9 rounded-xl bg-orange-500/20 flex items-center justify-center shrink-0">
                  <Camera className="h-5 w-5 text-orange-400" />
                </div>
                <span className="text-sm font-medium text-foreground flex-1">Reshoot</span>
                <ChevronLeft className="h-4 w-4 text-muted-foreground rotate-180 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </div>
          </div>
        </div>

        {/* Right panel - tool details */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors z-10"
          >
            <X className="h-4 w-4" />
          </button>

          {activeTool === "list" ? (
            <div className="hidden sm:flex flex-1 items-center justify-center p-8">
              <div className="text-center space-y-2">
                <Sparkles className="h-10 w-10 text-muted-foreground/20 mx-auto" />
                <p className="text-sm text-muted-foreground">Select a tool to begin</p>
              </div>
            </div>
          ) : activeTool === "reshoot" ? (
            <div className="flex-1 flex flex-col p-6 overflow-y-auto">
              {/* Back button on mobile */}
              <button
                onClick={() => setActiveTool("list")}
                className="sm:hidden flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-4 transition-colors"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Back
              </button>

              {/* Header */}
              <div className="flex items-start gap-3 mb-5">
                <div className="h-12 w-12 rounded-2xl bg-orange-500/20 flex items-center justify-center shrink-0">
                  <Camera className="h-6 w-6 text-orange-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[9px] uppercase tracking-wider font-bold text-orange-400 bg-orange-500/10 px-1.5 py-0.5 rounded">
                      Featured Tool
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-foreground">Reshoot</h3>
                  <p className="text-xs text-muted-foreground">Reshoot your photo with AI</p>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-muted-foreground leading-relaxed mb-5">
                Reimagine with fresh angles and enhanced quality. Each level controls how creative
                the AI can be with composition changes.
              </p>

              {/* Creativity Level */}
              <div className="mb-6">
                <p className="text-xs font-medium text-foreground mb-3">Creativity Level</p>
                <div className="grid grid-cols-3 gap-2">
                  {creativityLevels.map((level) => (
                    <button
                      key={level.id}
                      onClick={() => setCreativity(level.id)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                        creativity === level.id
                          ? "border-orange-500 bg-orange-500/10"
                          : "border-border hover:border-muted-foreground/30 bg-muted/30"
                      }`}
                    >
                      <level.icon
                        className={`h-6 w-6 ${
                          creativity === level.id ? "text-orange-400" : "text-muted-foreground"
                        }`}
                      />
                      <div className="text-center">
                        <p
                          className={`text-xs font-semibold ${
                            creativity === level.id ? "text-foreground" : "text-muted-foreground"
                          }`}
                        >
                          {level.label}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{level.subtitle}</p>
                      </div>
                      <p className="text-[9px] text-muted-foreground/70 italic">
                        {level.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Action button */}
              <Button
                onClick={handleStartReshoot}
                disabled={!hasImage || isProcessing}
                className="w-full h-12 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold text-sm rounded-xl shadow-lg shadow-orange-500/20"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Reshooting…
                  </>
                ) : (
                  <>Start Reshoot 🖼️</>
                )}
              </Button>

              {!hasImage && (
                <p className="text-[10px] text-muted-foreground text-center mt-2">
                  Lade zuerst ein Thumbnail in den Canvas
                </p>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default ToolsModal;
