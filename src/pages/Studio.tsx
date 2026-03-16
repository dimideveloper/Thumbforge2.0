import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Paintbrush, Lightbulb } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import StudioSidebar from "@/components/studio/StudioSidebar";
import ThumbnailCanvas from "@/components/studio/ThumbnailCanvas";
import EditorPanel from "@/components/studio/EditorPanel";
import InspirationPanel from "@/components/studio/InspirationPanel";
import SkinReplacerPanel from "@/components/studio/SkinReplacerPanel";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import PlaceholderPage from "@/components/studio/PlaceholderPage";
import MyVideosPage from "@/components/studio/MyVideosPage";
import AccountSettingsPage from "@/components/studio/AccountSettingsPage";
import VersionHistoryBar from "@/components/studio/VersionHistoryBar";
import type { ThumbnailVersion } from "@/components/studio/VersionHistoryBar";
import { getOrCreateProfileCredits } from "@/lib/profile";
import { toast } from "sonner";

const placeholderPages: Record<string, { title: string; description: string }> = {
  videos: { title: "My Videos", description: "Soon you'll see all your saved thumbnail projects and video analyses here." },
  extension: { title: "Browser Extension", description: "Install our extension to analyze thumbnails directly on YouTube." },
  credits: { title: "Earn Credits", description: "Invite friends and earn free credits for AI edits." },
  affiliates: { title: "Affiliate Program", description: "Earn money by recommending ThumbForge." },
  account: { title: "Account Settings", description: "Manage your profile, password, and notifications." },
  community: { title: "Community", description: "Join our Discord community and connect with other creators." },
};

type RightTab = "editor" | "inspiration";

const tabConfig: { id: RightTab; icon: typeof Paintbrush; label: string }[] = [
  { id: "editor", icon: Paintbrush, label: "Editor" },
  { id: "inspiration", icon: Lightbulb, label: "Inspiration" },
];

const createId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  // Fallback für Browser ohne crypto.randomUUID
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
};

const Studio = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [credits, setCredits] = useState(0);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activePage, setActivePage] = useState("studio");
  const [activeTab, setActiveTab] = useState<RightTab>("inspiration");
  const [skinModalOpen, setSkinModalOpen] = useState(false);
  const [canvasImage, setCanvasImage] = useState<string | null>(null);
  const [isCanvasLoading, setIsCanvasLoading] = useState(false);
  const [projectTitle, setProjectTitle] = useState("My first thumbnail");
  const [versions, setVersions] = useState<ThumbnailVersion[]>([]);
  const [activeVersionId, setActiveVersionId] = useState<string | null>(null);

  const addVersion = useCallback((url: string, label: string) => {
    const newVersion: ThumbnailVersion = {
      id: createId(),
      url,
      label,
      timestamp: Date.now(),
    };
    setVersions((prev) => [...prev, newVersion]);
    setActiveVersionId(newVersion.id);
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) navigate("/auth");
      else setUser(session.user);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate("/auth");
      else setUser(session.user);
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const titles: Record<string, string> = {
      studio: "Studio – ThumbForge",
      videos: "My Thumbnails – ThumbForge",
      account: "Account – ThumbForge",
      community: "Community – ThumbForge",
    };
    document.title = titles[activePage] ?? "ThumbForge";
  }, [activePage]);

  useEffect(() => {
    if (!user) return;
    let isMounted = true;
    const loadCredits = async () => {
      const nextCredits = await getOrCreateProfileCredits(user.id);
      if (isMounted) setCredits(nextCredits);
    };
    loadCredits();
    return () => { isMounted = false; };
  }, [user]);

  const refreshCredits = useCallback(async () => {
    if (!user) return;
    try {
      const nextCredits = await getOrCreateProfileCredits(user.id);
      setCredits(nextCredits);
    } catch {
      // ignore; credits will refresh on next reload
    }
  }, [user]);

  const handleSelectThumbnail = (url: string) => {
    setCanvasImage(url);
    addVersion(url, "Original");
    setActiveTab("editor");
    toast.success("Thumbnail loaded into canvas");
  };

  const handleSelectVersion = (version: ThumbnailVersion) => {
    setCanvasImage(version.url);
    setActiveVersionId(version.id);
  };

  const handleApplyEdit = async (prompt: string, mode: string = "pro", referenceImage?: string) => {
    if (!canvasImage) {
      toast.error("Please load an image first");
      return;
    }
    if (!user) return;

    setIsCanvasLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("edit-thumbnail", {
        body: { imageUrl: canvasImage, prompt, mode, referenceImageUrl: referenceImage },
      });

      if (error) {
        const ctx = (error as any)?.context;
        const status = typeof ctx?.status === "number" ? ctx.status : undefined;
        const ctxBody = ctx?.body;

        console.error("edit-thumbnail invoke error:", {
          message: error.message,
          status,
          contextBodyType: typeof ctxBody,
          contextBody: ctxBody,
        });
        try {
          console.error("edit-thumbnail invoke error (json):", JSON.stringify({ message: error.message, status, ctxBody }, null, 2));
        } catch {
          // ignore
        }

        const tryParseErrorBody = async (): Promise<{ message?: string; raw?: string } | null> => {
          // supabase-js may expose the response body as a ReadableStream
          const looksLikeStream = ctxBody && typeof ctxBody === "object" && typeof (ctxBody as any).getReader === "function";
          if (looksLikeStream) {
            try {
              const raw = await new Response(ctxBody as any).text();
              try {
                const parsed = JSON.parse(raw);
                return { message: parsed?.error ?? raw, raw };
              } catch {
                return { message: raw, raw };
              }
            } catch (e) {
              return { message: e instanceof Error ? e.message : String(e) };
            }
          }

          if (typeof ctxBody === "string") {
            try {
              const parsed = JSON.parse(ctxBody);
              return { message: parsed?.error ?? ctxBody, raw: ctxBody };
            } catch {
              return { message: ctxBody, raw: ctxBody };
            }
          }

          if (ctxBody && typeof ctxBody === "object") {
            const msg = (ctxBody as any)?.error;
            if (typeof msg === "string") return { message: msg };
          }

          return null;
        };

        const parsed = await tryParseErrorBody();
        if (parsed?.raw) {
          console.error("edit-thumbnail error body (raw):", parsed.raw);
        }

        if (parsed?.message) {
          throw new Error(parsed.message);
        }

        if (typeof ctxBody === "string") {
          try {
            const parsed = JSON.parse(ctxBody);
            throw new Error(parsed?.error || `HTTP ${status ?? "?"}: ${error.message || "Edit failed"}`);
          } catch {
            throw new Error(`HTTP ${status ?? "?"}: ${error.message || "Edit failed"}`);
          }
        }
        if (ctxBody && typeof ctxBody === "object") {
          throw new Error((ctxBody as any)?.error || `HTTP ${status ?? "?"}: ${error.message || "Edit failed"}`);
        }
        throw new Error(`HTTP ${status ?? "?"}: ${error.message || "Edit failed"}`);
      }
      if (!data?.imageUrl) throw new Error(data?.error || "No image returned");

      const creditCosts: Record<string, number> = {
        quick: 1,
        pro: 3,
        enhance: 2,
        background: 2,
        character: 3,
      };
      const cost = creditCosts[mode] ?? 1;

      const { error: creditError } = await supabase
        .from("profiles")
        .update({ credits: Math.max(0, credits - cost) })
        .eq("user_id", user.id);
      if (creditError) {
        console.warn("Credit deduction failed:", creditError.message);
      } else {
        setCredits((prev) => Math.max(0, prev - cost));
      }

      setCanvasImage(data.imageUrl);
      addVersion(data.imageUrl, prompt.slice(0, 30));
      refreshCredits();
      toast.success("Edit applied!");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Edit failed";
      console.error("Edit error:", errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsCanvasLoading(false);
    }
  };

  const handleSkinResult = (url: string, label: string) => {
    setCanvasImage(url);
    addVersion(url, label);
    setIsCanvasLoading(false);
    refreshCredits();
    setSkinModalOpen(false);
  };

  const handleSkinStart = () => {
    setIsCanvasLoading(true);
    setSkinModalOpen(false);
  };
  const handleSkinError = () => setIsCanvasLoading(false);

  const isStudio = activePage === "studio";

  return (
    <div className="h-screen flex overflow-hidden bg-[#050505] font-light text-foreground selection:bg-white/20 relative">
      <StudioSidebar
        credits={credits}
        userEmail={user?.email}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        activePage={activePage}
        onPageChange={setActivePage}
      />

      {isStudio ? (
        <>
          <div className="flex-1 flex flex-col min-w-0 relative z-10">
            {/* Subtle background glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-white/[0.02] blur-[120px] rounded-full pointer-events-none" />
            
            <VersionHistoryBar
              versions={versions}
              activeVersionId={activeVersionId}
              onSelectVersion={handleSelectVersion}
            />
            <ThumbnailCanvas
              imageUrl={canvasImage}
              title={projectTitle}
              onTitleChange={setProjectTitle}
              isLoading={isCanvasLoading}
              onImageLoad={(url) => {
                setCanvasImage(url);
                addVersion(url, "Upload");
              }}
            />
          </div>

          <div className="w-80 border-l border-white/5 bg-[#0a0a0a]/80 backdrop-blur-xl flex flex-col shrink-0 relative z-20 shadow-[-10px_0_30px_-15px_rgba(0,0,0,0.5)]">
            <div className="flex border-b border-white/5 shrink-0 px-2 pt-2">
              {tabConfig.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-medium transition-all duration-200 relative rounded-t-lg ${
                    activeTab === tab.id
                      ? "text-white bg-white/5"
                      : "text-white/40 hover:text-white/90 hover:bg-white/[0.02]"
                  }`}
                >
                  <tab.icon className={`h-3.5 w-3.5 ${activeTab === tab.id ? "text-white" : "text-white/40"}`} />
                  {tab.label}
                  {activeTab === tab.id && (
                    <span className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-white rounded-t-full shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                  )}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-hidden">
              {activeTab === "editor" ? (
                <EditorPanel
                  hasImage={!!canvasImage}
                  credits={credits}
                  onApplyEdit={handleApplyEdit}
                  onSwitchToSkin={() => setSkinModalOpen(true)}
                />
              ) : (
                <InspirationPanel onSelectThumbnail={handleSelectThumbnail} />
              )}
            </div>

            <Dialog open={skinModalOpen} onOpenChange={setSkinModalOpen}>
              <DialogContent className="p-0 border-none bg-transparent shadow-none max-w-[520px]">
                <DialogTitle className="sr-only">Skin Replacer</DialogTitle>
                <div className="rounded-2xl overflow-hidden border border-white/10 bg-[#0a0a0a]/90 backdrop-blur-xl">
                  <SkinReplacerPanel
                    canvasImage={canvasImage}
                    onResult={handleSkinResult}
                    onStart={handleSkinStart}
                    onError={handleSkinError}
                    onCreditSpent={() => {
                      setCredits((prev) => Math.max(0, prev - 1));
                      refreshCredits();
                    }}
                  />
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </>
      ) : (
        activePage === "videos" && user ? (
          <MyVideosPage
            userId={user.id}
            onOpenProject={(project) => {
              setProjectTitle(project.title);
              if (project.canvas_image_url) {
                setCanvasImage(project.canvas_image_url);
                setVersions([]);
                addVersion(project.canvas_image_url, "Gespeichert");
              } else {
                setCanvasImage(null);
                setVersions([]);
                setActiveVersionId(null);
              }
              setActivePage("studio");
              toast.success("Project loaded");
            }}
          />
        ) : activePage === "account" && user ? (
          <AccountSettingsPage user={user} />
        ) : (
          <PlaceholderPage
            title={placeholderPages[activePage]?.title || "Seite"}
            description={placeholderPages[activePage]?.description || "Diese Seite ist noch in Arbeit."}
          />
        )
      )}
    </div>
  );
};

export default Studio;
