import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Paintbrush, Film, Settings, Users, Trophy,
  LogOut, ChevronLeft, ChevronRight, Zap, Coins, History as HistoryIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import TopUpModal from "./TopUpModal";

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
  { icon: Film, label: "My Thumbnails", id: "videos" },
  { icon: Trophy, label: "Community", id: "community" },
];

const accountItems = [
  { icon: Settings, label: "Account", id: "account" },
  { icon: Users, label: "Affiliate", id: "affiliates" },
];

const StudioSidebar = ({ credits, userEmail, collapsed, onToggle, activePage, onPageChange }: StudioSidebarProps) => {
  const navigate = useNavigate();
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <aside
      className={`${
        collapsed ? "w-16" : "w-64"
      } transition-all duration-300 border-r border-white/5 bg-[#0a0a0a]/80 backdrop-blur-xl flex flex-col shrink-0 h-full relative z-20`}
    >
      {/* Logo */}
      <Link 
        to="/" 
        className="h-16 flex items-center gap-3 px-5 border-b border-white/5 shrink-0 hover:bg-white/5 transition-all group"
      >
        <div className="h-8 w-8 rounded-full border border-white/10 bg-gradient-to-b from-white/10 to-transparent flex items-center justify-center shrink-0 group-hover:border-white/20 transition-all">
          <Zap className="h-4 w-4 text-white/80" />
        </div>
        {!collapsed && (
          <span className="font-medium tracking-tight text-white/90 whitespace-nowrap group-hover:text-white transition-all">
            ThumbForge
          </span>
        )}
      </Link>

      {/* Toggle */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-20 z-10 h-6 w-6 rounded-full border border-white/10 bg-[#111] flex items-center justify-center text-white/40 hover:text-white transition-colors shadow-lg"
      >
        {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </button>

      {/* Platform Nav */}
      <div className="flex-1 overflow-y-auto py-4 px-3">
        {!collapsed && (
          <span className="px-3 text-[10px] font-semibold uppercase tracking-wider text-white/30 mb-2 block">
            Platform
          </span>
        )}
        <nav className="space-y-1">
          {platformItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200 ${
                activePage === item.id
                  ? "bg-white/10 text-white shadow-sm ring-1 ring-white/5"
                  : "text-white/50 hover:bg-white/5 hover:text-white/90"
              }`}
            >
              <item.icon className={`h-4 w-4 shrink-0 transition-colors ${activePage === item.id ? "text-white/90" : "text-white/40"}`} />
              {!collapsed && (
                <span className="flex-1 text-left truncate font-medium">{item.label}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="mt-8">
          {!collapsed && (
            <span className="px-3 text-[10px] font-semibold uppercase tracking-wider text-white/30 mb-2 block">
              Account
            </span>
          )}
          <nav className="space-y-1">
            {accountItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id)}
                className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200 ${
                  activePage === item.id
                    ? "bg-white/10 text-white shadow-sm ring-1 ring-white/5"
                    : "text-white/50 hover:bg-white/5 hover:text-white/90"
                }`}
              >
                <item.icon className={`h-4 w-4 shrink-0 transition-colors ${activePage === item.id ? "text-white/90" : "text-white/40"}`} />
                {!collapsed && <span className="truncate font-medium">{item.label}</span>}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-8">
          {!collapsed && (
            <span className="px-3 text-[10px] font-semibold uppercase tracking-wider text-white/30 mb-2 block">
              Support
            </span>
          )}
          <button
            onClick={() => navigate("/help")}
            className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/50 hover:bg-white/5 hover:text-white/90 transition-all duration-200"
          >
            <HistoryIcon className="h-4 w-4 shrink-0 text-white/40" />
            {!collapsed && <span className="truncate font-medium">Help & Support</span>}
          </button>
        </div>
      </div>

      {/* Credits & User */}
      <div className="p-4 border-t border-white/5 space-y-3">
        <div className={`rounded-2xl border border-white/5 bg-white/[0.02] p-4 flex flex-col gap-3 transition-all duration-300 ${collapsed ? "items-center" : ""}`}>
          <div className="flex items-center gap-2">
            <div className={`h-6 w-6 rounded-full bg-white/10 flex items-center justify-center shrink-0`}>
              <Coins className="h-3 w-3 text-white/70" />
            </div>
            {!collapsed && (
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-white/70">Credits</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white">{credits}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          {!collapsed && (
            <>
              <div className="h-px w-full bg-white/5" />
              <button
                onClick={() => setIsTopUpOpen(true)}
                className="w-full text-xs bg-white hover:bg-white/90 text-black px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-1.5"
              >
                Top up limits
              </button>
            </>
          )}
        </div>

        <div className={`flex items-center justify-between px-1 ${collapsed ? "flex-col gap-3" : ""}`}>
          {!collapsed && (
            <span className="text-xs text-white/40 font-light truncate max-w-[140px]">
              {userEmail}
            </span>
          )}
          <button
            onClick={handleLogout}
            className="text-white/30 hover:text-white transition-colors p-1"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Top Up Modal */}
      <TopUpModal open={isTopUpOpen} onOpenChange={setIsTopUpOpen} />
    </aside>
  );
};

export default StudioSidebar;
