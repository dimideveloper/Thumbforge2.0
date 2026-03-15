import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Paintbrush, Film, Puzzle, Coins, Users, Settings, MessageSquare,
  LogOut, ChevronLeft, ChevronRight, Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface StudioSidebarProps {
  credits: number;
  userEmail?: string;
  collapsed: boolean;
  onToggle: () => void;
  activePage: string;
  onPageChange: (page: string) => void;
}

const platformItems = [
  { icon: Paintbrush, label: "Studio", id: "studio" },
  { icon: Film, label: "My Videos", id: "videos" },
  { icon: Puzzle, label: "Extension", id: "extension" },
  { icon: Coins, label: "Earn Credits", id: "credits", badge: "NEW" },
  { icon: Users, label: "Affiliates", id: "affiliates" },
];

const accountItems = [
  { icon: Settings, label: "Account", id: "account" },
  { icon: MessageSquare, label: "Community", id: "community" },
];

const StudioSidebar = ({ credits, userEmail, collapsed, onToggle, activePage, onPageChange }: StudioSidebarProps) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <aside
      className={`${
        collapsed ? "w-16" : "w-56"
      } transition-all duration-300 border-r border-border bg-card flex flex-col shrink-0 h-full relative`}
    >
      {/* Logo */}
      <div className="p-4 flex items-center gap-2 border-b border-border">
        <Zap className="h-5 w-5 text-primary shrink-0" />
        {!collapsed && (
          <span className="font-display text-base font-bold text-foreground whitespace-nowrap">
            ThumbForge
          </span>
        )}
      </div>

      {/* Toggle */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-20 z-10 h-6 w-6 rounded-full border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
      >
        {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </button>

      {/* Platform Nav */}
      <div className="flex-1 overflow-y-auto py-3">
        {!collapsed && (
          <span className="px-4 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Platform
          </span>
        )}
        <nav className="mt-2 space-y-0.5 px-2">
          {platformItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={`w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                activePage === item.id
                  ? "bg-primary/15 text-primary font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {!collapsed && (
                <span className="flex-1 text-left truncate">{item.label}</span>
              )}
              {!collapsed && item.badge && (
                <span className="text-[10px] font-bold bg-secondary text-secondary-foreground px-1.5 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="mt-6">
          {!collapsed && (
            <span className="px-4 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Account
            </span>
          )}
          <nav className="mt-2 space-y-0.5 px-2">
            {accountItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id)}
                className={`w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                  activePage === item.id
                    ? "bg-primary/15 text-primary font-medium"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Credits & User */}
      <div className="p-3 border-t border-border space-y-2">
        <div className={`rounded-xl bg-muted p-3 ${collapsed ? "flex justify-center" : ""}`}>
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-secondary shrink-0" />
            {!collapsed && (
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Credits</span>
                  <span className="text-sm font-bold text-foreground">{credits}</span>
                </div>
              </div>
            )}
          </div>
          {!collapsed && credits < 10 && (
            <>
              <p className="text-[10px] text-secondary mt-1">Wenig Credits übrig</p>
              <Button
                size="sm"
                onClick={() => onPageChange("credits")}
                className="w-full mt-2 text-xs h-7 bg-secondary hover:bg-secondary/80 text-secondary-foreground"
              >
                Upgrade now
              </Button>
            </>
          )}
        </div>

        <div className="flex items-center justify-between px-1">
          {!collapsed && (
            <span className="text-xs text-muted-foreground truncate max-w-[120px]">
              {userEmail}
            </span>
          )}
          <button
            onClick={handleLogout}
            className="text-muted-foreground hover:text-foreground transition-colors"
            title="Ausloggen"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default StudioSidebar;
