import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Zap, Mail, Lock, User, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

type AuthMode = "login" | "signup" | "forgot";

const Auth = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      navigate("/dashboard");
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName },
        emailRedirectTo: window.location.origin + "/dashboard",
      },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Confirmation email sent! Please check your inbox.");
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Reset link sent!");
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 selection:bg-white/20 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/3 left-1/4 w-[600px] h-[600px] bg-white/[0.02] rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-white/[0.015] rounded-full blur-[100px] pointer-events-none mix-blend-screen" />

      <div className="w-full max-w-[420px] animate-in fade-in zoom-in-95 duration-700 relative z-10">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <div className="h-10 w-10 rounded-full border border-white/10 bg-gradient-to-b from-white/10 to-transparent flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.05)]">
             <Zap className="h-5 w-5 text-white/90 drop-shadow-md" />
          </div>
          <span className="font-medium tracking-tight text-2xl text-white/90">ThumbForge</span>
        </div>

        {/* Card */}
        <div className="rounded-[2.5rem] border border-white/10 bg-[#0a0a0a]/80 backdrop-blur-3xl p-8 sm:p-10 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-50 pointer-events-none" />

          <h1 className="text-[28px] leading-tight font-medium text-white text-center mb-3 tracking-tight relative z-10">
            {mode === "login" && "Welcome back."}
            {mode === "signup" && "Create an account."}
            {mode === "forgot" && "Reset your password."}
          </h1>
          <p className="text-white/40 text-center text-[15px] font-light mb-10 relative z-10">
            {mode === "login" && "Sign in to continue"}
            {mode === "signup" && "Sign up to continue"}
            {mode === "signup" && "Access to all Pro features"}
            {mode === "forgot" && "We'll send you a reset link"}
          </p>

          <form onSubmit={mode === "login" ? handleLogin : mode === "signup" ? handleSignup : handleForgotPassword} className="space-y-4 relative z-10">
            {mode === "signup" && (
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-white/40 group-focus-within:text-white/80 transition-colors" />
                <Input
                  placeholder="Anzeigename"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="pl-12 h-14 bg-white/[0.03] border-white/10 text-white placeholder:text-white/30 rounded-2xl focus-visible:ring-1 focus-visible:ring-white/30 focus-visible:border-white/30 focus-visible:bg-white/[0.05] transition-all font-light text-[15px]"
                  required
                />
              </div>
            )}

            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-white/40 group-focus-within:text-white/80 transition-colors" />
              <Input
                type="email"
                placeholder="E-Mail Adresse"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-12 h-14 bg-white/[0.03] border-white/10 text-white placeholder:text-white/30 rounded-2xl focus-visible:ring-1 focus-visible:ring-white/30 focus-visible:border-white/30 focus-visible:bg-white/[0.05] transition-all font-light text-[15px]"
                required
              />
            </div>

            {mode !== "forgot" && (
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-white/40 group-focus-within:text-white/80 transition-colors" />
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-12 h-14 bg-white/[0.03] border-white/10 text-white placeholder:text-white/30 rounded-2xl focus-visible:ring-1 focus-visible:ring-white/30 focus-visible:border-white/30 focus-visible:bg-white/[0.05] transition-all font-light text-[15px]"
                  required
                  minLength={6}
                />
              </div>
            )}

            <div className="pt-2">
               <button
                 type="submit"
                 className="w-full h-14 rounded-2xl bg-white text-black font-medium text-[15px] hover:bg-white/90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                 disabled={loading}
               >
                 {loading ? "Processing..." : mode === "login" ? "Sign in" : mode === "signup" ? "Sign up" : "Send link"}
               </button>
            </div>
          </form>

          <div className="mt-8 space-y-4 text-center text-[15px] font-light relative z-10 w-full">
            {mode === "login" && (
              <>
                <button onClick={() => setMode("forgot")} className="text-white/40 hover:text-white transition-colors block w-full">
                  Forgot password?
                </button>
                <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent w-full my-6" />
                <p className="text-white/40">
                  Noch kein Account?{" "}
                  <button onClick={() => setMode("signup")} className="text-white hover:text-white/80 font-medium transition-colors ml-1">
                    Registrieren
                  </button>
                </p>
              </>
            )}
            {mode === "signup" && (
              <>
                <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent w-full my-6" />
                <p className="text-white/40">
                  Already have an account?{" "}
                  <button onClick={() => setMode("login")} className="text-white hover:text-white/80 font-medium transition-colors ml-1">
                    Sign in
                  </button>
                </p>
              </>
            )}
            {mode === "forgot" && (
              <>
                <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent w-full my-6" />
                <button onClick={() => setMode("login")} className="text-white/50 hover:text-white transition-colors flex items-center justify-center gap-1.5 mx-auto">
                  <ArrowLeft className="h-4 w-4" /> Back to login
                </button>
              </>
            )}
          </div>
        </div>

        <button onClick={() => navigate("/")} className="mt-10 text-white/30 hover:text-white/70 text-[13px] font-light flex items-center gap-1.5 mx-auto transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to home
        </button>
      </div>
    </div>
  );
};

export default Auth;
