import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, ChevronLeft, UserCircle, Camera, Sparkles, Clapperboard, Rocket, Sun, Moon, Monitor, Palette, Film, Circle, User, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

type CreativityLevel = "polish" | "balanced" | "remix";

interface ToolsModalProps {
  open: boolean;
  onClose: () => void;
  onOpenAvatarStudio: () => void;
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
    subtitle: "Subtle enhancements",
    description: "Preserve pose & composition",
  },
  {
    id: "balanced",
    icon: Clapperboard,
    label: "Balanced",
    subtitle: "Fresh perspective",
    description: "New angle, boost energy",
  },
  {
    id: "remix",
    icon: Rocket,
    label: "Remix",
    subtitle: "Total reimagination",
    description: "Creative reimagination",
  },
];

const reshootPrompts: Record<CreativityLevel, string> = {
  polish:
    "Reshoot this thumbnail with improved lighting, color grading, and visual polish. Keep the exact same pose, angle, composition, and all elements. Only enhance the quality, sharpness, contrast, and lighting to make it look more professional and cinematic.",
  balanced:
    "Reshoot this thumbnail with a slightly different camera angle and improved composition. Keep the same subject and scene but give it a fresh, more dynamic look with better framing, enhanced lighting, and boosted energy. Make it feel like a new, better take of the same shot.",
  remix:
    "Creatively reimagine this thumbnail with a fresh perspective and professional touch. Think outside the box to improve the overall appeal, lighting, and composition while staying true to the original subject and core message. Make it look like a high-end, polished version with a unique creative twist.",
};

const lightingPresets = [
  { id: "golden", label: "Golden Hour", desc: "Warm, soft, vibrant cinematic", icon: Sun, prompt: "Apply Golden Hour lighting. Warm, orange-golden sunlight, long shadows, soft cinematic glow, vibrant summer atmosphere." },
  { id: "cyber", label: "Moon Cyber", desc: "Electric neon glow", icon: Moon, prompt: "Apply Moon Cyber lighting. Cool blue and neon pink accents, electric glow, futuristic nighttime atmosphere, high contrast." },
  { id: "softbox", label: "Softbox Studio", desc: "Professional even lighting", icon: Monitor, prompt: "Apply Softbox Studio lighting. Neutral, professional studio lighting, soft shadows, even illumination, clean look." },
  { id: "dark", label: "Dark Mode", desc: "Moody, high-contrast drama", icon: Circle, prompt: "Apply Dark Mode lighting. Low-key lighting, deep shadows, moody atmosphere, high contrast, dramatic focus on the subject." },
  { id: "pop", label: "Pop Color", desc: "Vibrant, stylized textures", icon: Palette, prompt: "Apply Pop Color lighting. Highly saturated colors, vibrant highlights, stylized textures, energetic and eye-catching look." },
  { id: "noir", label: "Film Noir", desc: "Classic black and white drama", icon: Film, prompt: "Apply Film Noir lighting. Dramatic black and white, hard shadows, high contrast, classic cinematic detective movie look." },
  { id: "ring", label: "Ring Light", desc: "Beauty focus, circular glow", icon: Circle, prompt: "Apply Ring Light lighting. Even frontal lighting, circular catchlights in eyes, soft skin tones, professional beauty look." },
  { id: "silhouette", label: "Silhouette", desc: "Dramatic backlight effect", icon: User, prompt: "Apply Silhouette lighting. Strong backlight, dark subject outline, dramatic sunset or bright background, minimalist and artistic." },
];

const ToolsModal = ({ open, onClose, onOpenAvatarStudio, hasImage, onReshoot }: ToolsModalProps) => {
  const [activeTool, setActiveTool] = useState<"list" | "reshoot" | "lighting">("list");
  const [creativity, setCreativity] = useState<CreativityLevel>("balanced");
  const [selectedLighting, setSelectedLighting] = useState("golden");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!open || !mounted) return null;

  const handleClose = () => {
    setActiveTool("list");
    onClose();
  };

  const handleOpenAvatarStudio = () => {
    handleClose();
    onOpenAvatarStudio();
  };

  const handleStartReshoot = () => {
    if (!hasImage) return;
    onReshoot(reshootPrompts[creativity]);
    handleClose();
  };

  const handleApplyLighting = () => {
    if (!hasImage) return;
    const preset = lightingPresets.find(p => p.id === selectedLighting);
    if (preset) {
      onReshoot(preset.prompt);
      handleClose();
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Premium Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-md animate-in fade-in duration-300"
        onClick={handleClose}
      />

      {/* Modal Container */}
      <div className="relative bg-[#0a0a0a]/90 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl w-[700px] max-w-full max-h-[85vh] flex flex-col sm:flex-row overflow-hidden animate-in zoom-in-[0.98] fade-in duration-300 transform-gpu ring-1 ring-white/5">
        
        {/* Sidebar */}
        <div
          className={`${
            activeTool === "list" ? "w-full sm:w-[280px]" : "hidden sm:flex sm:w-[280px]"
          } border-r border-white/5 flex-col shrink-0 bg-white/[0.02]`}
        >
          <div className="p-6 pb-4">
            <h2 className="text-xl font-medium text-white tracking-tight">Tools Library</h2>
            <p className="text-sm text-white/40 mt-1 font-light">Enhance your content</p>
          </div>

          <div className="px-3 pb-6 space-y-1.5 flex-1 overflow-y-auto">
            {/* Avatar Studio */}
            <button
              onClick={handleOpenAvatarStudio}
              className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl hover:bg-white/5 transition-all duration-200 text-left group"
            >
              <div className="h-10 w-10 border border-white/10 rounded-full flex items-center justify-center shrink-0 bg-gradient-to-b from-white/10 to-transparent group-hover:border-white/20 transition-colors">
                <UserCircle className="h-5 w-5 text-white/80" />
              </div>
              <div className="flex-1">
                <span className="text-sm font-medium text-white/90">Avatar Studio</span>
                <span className="block text-xs text-white/40 mt-0.5 font-light">AI Persona Integration</span>
              </div>
              <ChevronLeft className="h-4 w-4 text-white/30 rotate-180 opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1" />
            </button>

            {/* Reshoot */}
            <button
              onClick={() => setActiveTool("reshoot")}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-200 text-left group ${
                activeTool === "reshoot"
                  ? "bg-white/10 shadow-lg ring-1 ring-white/10"
                  : "hover:bg-white/5"
              }`}
            >
              <div className="h-10 w-10 border border-white/10 rounded-full flex items-center justify-center shrink-0 bg-gradient-to-b from-white/10 to-transparent group-hover:border-white/20 transition-colors">
                <Camera className="h-5 w-5 text-white/80" />
              </div>
              <div className="flex-1">
                <span className="text-sm font-medium text-white/90">Reshoot</span>
                <span className="block text-xs text-white/40 mt-0.5 font-light">AI generated variations</span>
              </div>
              <ChevronLeft className={`h-4 w-4 text-white/30 rotate-180 transition-all ${activeTool === "reshoot" ? "opacity-100 translate-x-1" : "opacity-0 group-hover:opacity-100 group-hover:translate-x-1"}`} />
            </button>

            {/* Lighting Studio */}
            <button
              onClick={() => setActiveTool("lighting")}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-200 text-left group ${
                activeTool === "lighting"
                  ? "bg-white/10 shadow-lg ring-1 ring-white/10"
                  : "hover:bg-white/5"
              }`}
            >
              <div className="h-10 w-10 border border-white/10 rounded-full flex items-center justify-center shrink-0 bg-gradient-to-b from-white/10 to-transparent group-hover:border-white/20 transition-colors">
                <Lightbulb className="h-5 w-5 text-white/80" />
              </div>
              <div className="flex-1">
                <span className="text-sm font-medium text-white/90">Lighting Studio</span>
                <span className="block text-xs text-white/40 mt-0.5 font-light">Pro lighting presets</span>
              </div>
              <ChevronLeft className={`h-4 w-4 text-white/30 rotate-180 transition-all ${activeTool === "lighting" ? "opacity-100 translate-x-1" : "opacity-0 group-hover:opacity-100 group-hover:translate-x-1"}`} />
            </button>
          </div>
        </div>

        {/* Right Panel */}
        <div className="flex-1 flex flex-col min-w-0 bg-black/20">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 h-8 w-8 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors z-10"
          >
            <X className="h-4 w-4" />
          </button>

          {activeTool === "list" ? (
            <div className="hidden sm:flex flex-1 items-center justify-center p-8">
              <div className="text-center">
                <div className="h-16 w-16 mx-auto border border-white/10 rounded-full flex items-center justify-center bg-gradient-to-b from-white/5 to-transparent mb-4">
                  <Sparkles className="h-6 w-6 text-white/30" />
                </div>
                <p className="text-base font-medium text-white/80">Select a tool</p>
                <p className="text-sm text-white/40 mt-1 font-light">Choose from the sidebar to begin</p>
              </div>
            </div>
          ) : activeTool === "reshoot" ? (
            <div className="flex-1 flex flex-col p-8 overflow-y-auto">
              <button
                onClick={() => setActiveTool("list")}
                className="sm:hidden flex items-center gap-2 text-sm text-white/50 hover:text-white mb-6 transition-colors font-medium"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </button>

              <div className="mb-8">
                <h3 className="text-2xl font-medium text-white tracking-tight">Reshoot Photo</h3>
                <p className="text-sm text-white/50 mt-2 font-light leading-relaxed max-w-sm">
                  Let AI reimagine your thumbnail with better lighting, fresh angles, and enhanced quality.
                </p>
              </div>

              <div className="mb-8 flex-1">
                <p className="text-sm font-medium text-white/80 mb-4">Creativity Level</p>
                <div className="grid grid-cols-1 gap-3">
                  {creativityLevels.map((level) => (
                    <button
                      key={level.id}
                      onClick={() => setCreativity(level.id)}
                      className={`flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 ${
                        creativity === level.id
                          ? "border-white/30 bg-white/10 shadow-md ring-1 ring-white/10"
                          : "border-white/5 bg-white/[0.02] hover:bg-white/5 hover:border-white/10"
                      }`}
                    >
                      <div className={`h-10 w-10 flex items-center justify-center rounded-full transition-colors ${
                        creativity === level.id ? "bg-white text-black" : "bg-white/5 text-white/50"
                      }`}>
                        <level.icon className="h-5 w-5" />
                      </div>
                      <div className="text-left flex-1">
                        <p className={`text-sm font-medium ${creativity === level.id ? "text-white" : "text-white/80"}`}>
                          {level.label}
                        </p>
                        <p className="text-xs text-white/40 mt-0.5 font-light">
                          {level.subtitle} &middot; {level.description}
                        </p>
                      </div>
                      {creativity === level.id && (
                        <div className="h-2 w-2 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-auto">
                {!hasImage && (
                  <p className="text-xs text-red-400 text-center mb-3 font-medium bg-red-400/10 py-2 rounded-lg border border-red-400/20">
                    Please upload an image to the canvas first.
                  </p>
                )}
                <button
                  onClick={handleStartReshoot}
                  disabled={!hasImage}
                  className="w-full h-12 bg-white hover:bg-white/90 text-black font-medium text-sm rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] shadow-lg flex items-center justify-center"
                >
                  Start Reshoot
                </button>
              </div>
            </div>
          ) : activeTool === "lighting" ? (
            <div className="flex-1 flex flex-col p-8 overflow-y-auto">
              <button
                onClick={() => setActiveTool("list")}
                className="sm:hidden flex items-center gap-2 text-sm text-white/50 hover:text-white mb-6 transition-colors font-medium"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </button>

              <div className="mb-8">
                <h3 className="text-2xl font-medium text-white tracking-tight">Lighting Studio</h3>
                <p className="text-sm text-white/50 mt-2 font-light leading-relaxed max-w-sm">
                  Fix bad lighting or apply professional presets to your thumbnail.
                </p>
              </div>

              <div className="mb-8 flex-1">
                <p className="text-[10px] uppercase tracking-wider font-semibold text-white/30 mb-4">Select Lighting Environment</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {lightingPresets.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => setSelectedLighting(preset.id)}
                      className={`flex items-center gap-3.5 p-3.5 rounded-2xl border transition-all duration-300 ${
                        selectedLighting === preset.id
                          ? "border-white/30 bg-white/10 shadow-md ring-1 ring-white/10"
                          : "border-white/5 bg-white/[0.02] hover:bg-white/5 hover:border-white/10"
                      }`}
                    >
                      <div className={`h-10 w-10 flex items-center justify-center rounded-xl shrink-0 transition-colors ${
                        selectedLighting === preset.id ? "bg-white text-black" : "bg-white/5 text-white/40"
                      }`}>
                        <preset.icon className="h-5 w-5" />
                      </div>
                      <div className="text-left flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${selectedLighting === preset.id ? "text-white" : "text-white/80"}`}>
                          {preset.label}
                        </p>
                        <p className="text-[10px] text-white/40 mt-0.5 font-light truncate">
                          {preset.desc}
                        </p>
                      </div>
                      {selectedLighting === preset.id && (
                        <div className="h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-auto">
                {!hasImage && (
                  <p className="text-xs text-red-400 text-center mb-3 font-medium bg-red-400/10 py-2 rounded-lg border border-red-400/20">
                    Please upload an image to the canvas first.
                  </p>
                )}
                <button
                  onClick={handleApplyLighting}
                  disabled={!hasImage}
                  className="w-full h-12 bg-white hover:bg-white/90 text-black font-medium text-sm rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] shadow-lg flex items-center justify-center"
                >
                  Relight Image
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default ToolsModal;
