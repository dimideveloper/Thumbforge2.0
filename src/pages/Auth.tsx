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
      toast.success("Bestätigungsmail gesendet! Bitte überprüfe dein Postfach.");
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
      toast.success("Link zum Zurücksetzen gesendet!");
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 selection:bg-white/20">
      <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <Zap className="h-6 w-6 text-white" />
          <span className="font-semibold tracking-tight text-xl text-white">ThumbForge</span>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-white/10 bg-[#0a0a0a] p-8 md:p-10 shadow-2xl">
          <h1 className="text-2xl font-medium text-white text-center mb-2 tracking-tight">
            {mode === "login" && "Willkommen zurück."}
            {mode === "signup" && "Account erstellen."}
            {mode === "forgot" && "Passwort zurücksetzen."}
          </h1>
          <p className="text-white/50 text-center text-sm font-light mb-8">
            {mode === "login" && "Melde dich an, um fortzufahren"}
            {mode === "signup" && "Kostenloser Zugang zu allen Basisfunktionen"}
            {mode === "forgot" && "Wir senden dir einen Reset-Link"}
          </p>

          <form onSubmit={mode === "login" ? handleLogin : mode === "signup" ? handleSignup : handleForgotPassword} className="space-y-4">
            {mode === "signup" && (
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                <Input
                  placeholder="Anzeigename"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="pl-11 h-12 bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl focus-visible:ring-1 focus-visible:ring-white/20 focus-visible:border-white/20 transition-all font-light"
                  required
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <Input
                type="email"
                placeholder="E-Mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-11 h-12 bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl focus-visible:ring-1 focus-visible:ring-white/20 focus-visible:border-white/20 transition-all font-light"
                required
              />
            </div>

            {mode !== "forgot" && (
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                <Input
                  type="password"
                  placeholder="Passwort"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-11 h-12 bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl focus-visible:ring-1 focus-visible:ring-white/20 focus-visible:border-white/20 transition-all font-light"
                  required
                  minLength={6}
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full h-12 mt-2 rounded-xl bg-white text-black font-medium hover:bg-white/90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
              disabled={loading}
            >
              {loading ? "Wird verarbeitet..." : mode === "login" ? "Anmelden" : mode === "signup" ? "Registrieren" : "Link senden"}
            </button>
          </form>

          <div className="mt-8 space-y-3 text-center text-sm font-light">
            {mode === "login" && (
              <>
                <button onClick={() => setMode("forgot")} className="text-white/50 hover:text-white transition-colors block w-full">
                  Passwort vergessen?
                </button>
                <div className="h-px bg-white/5 w-full my-4" />
                <p className="text-white/40">
                  Noch kein Account?{" "}
                  <button onClick={() => setMode("signup")} className="text-white hover:text-white/80 font-medium transition-colors">
                    Registrieren
                  </button>
                </p>
              </>
            )}
            {mode === "signup" && (
              <>
                <div className="h-px bg-white/5 w-full my-4" />
                <p className="text-white/40">
                  Bereits registriert?{" "}
                  <button onClick={() => setMode("login")} className="text-white hover:text-white/80 font-medium transition-colors">
                    Anmelden
                  </button>
                </p>
              </>
            )}
            {mode === "forgot" && (
              <>
                <div className="h-px bg-white/5 w-full my-4" />
                <button onClick={() => setMode("login")} className="text-white/50 hover:text-white transition-colors flex items-center justify-center gap-1 mx-auto">
                  <ArrowLeft className="h-3 w-3" /> Zurück zum Login
                </button>
              </>
            )}
          </div>
        </div>

        <button onClick={() => navigate("/")} className="mt-8 text-white/30 hover:text-white/70 text-xs font-light flex items-center gap-1.5 mx-auto transition-colors">
          <ArrowLeft className="h-3 w-3" /> Zurück zur Startseite
        </button>
      </div>
    </div>
  );
};

export default Auth;
