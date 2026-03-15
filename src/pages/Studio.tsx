import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Paintbrush, Lightbulb, UserCircle } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import StudioSidebar from "@/components/studio/StudioSidebar";
import ThumbnailCanvas from "@/components/studio/ThumbnailCanvas";
import EditorPanel from "@/components/studio/EditorPanel";
import InspirationPanel from "@/components/studio/InspirationPanel";
import SkinReplacerPanel from "@/components/studio/SkinReplacerPanel";
import PlaceholderPage from "@/components/studio/PlaceholderPage";
import MyVideosPage from "@/components/studio/MyVideosPage";
import AccountSettingsPage from "@/components/studio/AccountSettingsPage";
import VersionHistoryBar from "@/components/studio/VersionHistoryBar";
import type { ThumbnailVersion } from "@/components/studio/VersionHistoryBar";
import { getOrCreateProfileCredits } from "@/lib/profile";
import { toast } from "sonner";

const placeholderPages: Record<string, { title: string; description: string }> = {
  videos: { title: "Meine Videos", description: "Hier findest du bald all deine gespeicherten Thumbnail-Projekte und Video-Analysen." },
  extension: { title: "Browser Extension", description: "Installiere unsere Extension, um Thumbnails direkt auf YouTube zu analysieren." },
  credits: { title: "Credits verdienen", description: "Lade Freunde ein und verdiene kostenlose Credits für AI-Bearbeitungen." },
  affiliates: { title: "Affiliate Programm", description: "Verdiene Geld, indem du ThumbForge weiterempfiehlst." },
  account: { title: "Account Einstellungen", description: "Verwalte dein Profil, Passwort und Benachrichtigungen." },
  community: { title: "Community", description: "Tritt unserer Discord-Community bei und tausche dich mit anderen Creatorn aus." },
};

type RightTab = "editor" | "inspiration" | "skin";

const tabConfig: { id: RightTab; icon: typeof Paintbrush; label: string }[] = [
  { id: "editor", icon: Paintbrush, label: "Editor" },
  { id: "inspiration", icon: Lightbulb, label: "Inspiration" },
  { id: "skin", icon: UserCircle, label: "Skin" },
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
  const [canvasImage, setCanvasImage] = useState<string | null>(null);
  const [isCanvasLoading, setIsCanvasLoading] = useState(false);
  const [projectTitle, setProjectTitle] = useState("Mein erstes Thumbnail");
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
    if (!user) return;
    let isMounted = true;
    const loadCredits = async () => {
      const nextCredits = await getOrCreateProfileCredits(user.id);
      if (isMounted) setCredits(nextCredits);
    };
    loadCredits();
    return () => { isMounted = false; };
  }, [user]);

  const handleSelectThumbnail = (url: string) => {
    setCanvasImage(url);
    addVersion(url, "Original");
    setActiveTab("editor");
    toast.success("Thumbnail in Canvas geladen");
  };

  const handleSelectVersion = (version: ThumbnailVersion) => {
    setCanvasImage(version.url);
    setActiveVersionId(version.id);
  };

  const handleApplyEdit = async (prompt: string, mode: string = "pro", referenceImage?: string) => {
    if (!canvasImage) {
      toast.error("Bitte zuerst ein Bild laden");
      return;
    }

    setIsCanvasLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("edit-thumbnail", {
        body: { imageUrl: canvasImage, prompt, mode, referenceImageUrl: referenceImage },
      });

      if (error) throw new Error(error.message || "Bearbeitung fehlgeschlagen");
      if (!data?.imageUrl) throw new Error(data?.error || "Kein Bild zurückgegeben");

      setCanvasImage(data.imageUrl);
      addVersion(data.imageUrl, prompt.slice(0, 30));
      toast.success("Bearbeitung angewendet!");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Bearbeitung fehlgeschlagen";
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
  };

  const handleSkinStart = () => setIsCanvasLoading(true);
  const handleSkinError = () => setIsCanvasLoading(false);

  const isStudio = activePage === "studio";

  return (
    <div className="h-screen flex overflow-hidden bg-background">
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
          <div className="flex-1 flex flex-col min-w-0">
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

          <div className="w-80 border-l border-border bg-card flex flex-col shrink-0">
            <div className="flex border-b border-border shrink-0">
              {tabConfig.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-medium transition-colors relative ${
                    activeTab === tab.id
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <tab.icon className="h-3.5 w-3.5" />
                  {tab.label}
                  {activeTab === tab.id && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                  )}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-hidden">
              {activeTab === "editor" ? (
                <EditorPanel hasImage={!!canvasImage} onApplyEdit={handleApplyEdit} onSwitchToSkin={() => setActiveTab("skin")} />
              ) : activeTab === "skin" ? (
                <SkinReplacerPanel canvasImage={canvasImage} onResult={handleSkinResult} onStart={handleSkinStart} onError={handleSkinError} />
              ) : (
                <InspirationPanel onSelectThumbnail={handleSelectThumbnail} />
              )}
            </div>
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
              toast.success("Projekt geladen");
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
