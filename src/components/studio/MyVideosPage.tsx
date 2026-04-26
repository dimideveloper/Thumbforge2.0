import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Film, MoreVertical, Pencil, Copy, Trash2, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface Project {
  id: string;
  title: string;
  canvas_image_url: string | null;
  created_at: string;
  updated_at: string;
}

interface MyVideosPageProps {
  userId: string;
  onOpenProject: (project: Project) => void;
}

const MyVideosPage = ({ userId, onOpenProject }: MyVideosPageProps) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [renameTarget, setRenameTarget] = useState<Project | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const fetchProjects = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("thumbnail_projects")
      .select("id, title, canvas_image_url, created_at, updated_at")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Failed to fetch projects:", error);
      toast.error("Failed to load projects");
    } else {
      setProjects(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (userId) fetchProjects();
  }, [userId]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const { error } = await supabase
      .from("thumbnail_projects")
      .delete()
      .eq("id", deleteTarget.id);

    if (error) {
      toast.error("Delete failed");
    } else {
      toast.success("Project deleted");
      setProjects((prev) => prev.filter((p) => p.id !== deleteTarget.id));
    }
    setDeleteTarget(null);
  };

  const handleRename = async () => {
    if (!renameTarget || !renameValue.trim()) return;
    const { error } = await supabase
      .from("thumbnail_projects")
      .update({ title: renameValue.trim() })
      .eq("id", renameTarget.id);

    if (error) {
      toast.error("Rename failed");
    } else {
      toast.success("Project renamed");
      setProjects((prev) =>
        prev.map((p) =>
          p.id === renameTarget.id ? { ...p, title: renameValue.trim() } : p
        )
      );
    }
    setRenameTarget(null);
    setRenameValue("");
  };

  const handleDuplicate = async (project: Project) => {
    const { data, error } = await supabase
      .from("thumbnail_projects")
      .insert({
        user_id: userId,
        title: `${project.title} (Copy)`,
        canvas_image_url: project.canvas_image_url,
      })
      .select()
      .single();

    if (error) {
      toast.error("Duplicate failed");
    } else if (data) {
      toast.success("Project duplicated");
      setProjects((prev) => [data, ...prev]);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="h-[calc(100vh-60px)] w-full flex flex-col items-center justify-center bg-transparent">
        <div className="loader" />
        <p className="text-white/30 text-[10px] mt-6 tracking-widest uppercase animate-pulse">Loading Projects</p>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-transparent">
        <div className="text-center space-y-4 max-w-md px-8">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-white/5 flex items-center justify-center">
            <Film className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="font-display text-xl font-bold text-foreground">
            No thumbnails yet
          </h2>
          <p className="text-sm text-muted-foreground">
            You haven't saved any projects yet. Create your first thumbnail in the Studio and it will appear here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-transparent overflow-y-auto">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="font-display text-2xl font-bold text-foreground">
            My Thumbnails
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {projects.length} {projects.length === 1 ? "project" : "projects"}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((project) => (
            <div
              key={project.id}
              className="group rounded-xl border border-border bg-card overflow-hidden card-hover cursor-pointer"
              onClick={() => onOpenProject(project)}
            >
              {/* Thumbnail preview */}
              <div className="aspect-video bg-muted relative overflow-hidden">
                {project.canvas_image_url ? (
                  <img
                    src={project.canvas_image_url}
                    alt={project.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Film className="h-10 w-10 text-muted-foreground/40" />
                  </div>
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <FolderOpen className="h-4 w-4" />
                    Open
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="p-4 flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold text-foreground truncate">
                    {project.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Created {formatDate(project.created_at)} · Edited{" "}
                    {formatDate(project.updated_at)}
                  </p>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenProject(project);
                      }}
                    >
                      <FolderOpen className="h-4 w-4 mr-2" />
                      Open
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        setRenameTarget(project);
                        setRenameValue(project.title);
                      }}
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDuplicate(project);
                      }}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTarget(project);
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete project?</AlertDialogTitle>
            <AlertDialogDescription>
              "{deleteTarget?.title}" will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Rename dialog */}
      <AlertDialog open={!!renameTarget} onOpenChange={() => setRenameTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rename project</AlertDialogTitle>
          </AlertDialogHeader>
          <Input
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleRename()}
            placeholder="New title"
            autoFocus
          />
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRename}>Save</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MyVideosPage;
