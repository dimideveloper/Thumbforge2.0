import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AdminGuardProps {
  children: React.ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function checkAdmin() {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Unauthorized access");
        navigate("/auth");
        return;
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (error || !profile?.is_admin) {
        toast.error("Access denied. Admin privileges required.");
        navigate("/");
        return;
      }

      setIsAdmin(true);
    }

    checkAdmin();
  }, [navigate]);

  if (isAdmin === null) {
    return (
      <div className="h-screen w-full bg-black flex flex-col items-center justify-center gap-6">
        <div className="loader" />
        <p className="text-white/40 text-xs font-light tracking-[0.2em] uppercase animate-pulse">Verifying Admin Status</p>
      </div>
    );
  }

  return <>{children}</>;
}
