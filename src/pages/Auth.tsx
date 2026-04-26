import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Zap, Mail, Lock, User, ArrowLeft, Star } from "lucide-react";
import { toast } from "sonner";

type AuthMode = "login" | "signup" | "forgot" | "verify";

const Auth = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const titles: Record<string, string> = {
      login: "Sign In – ThumbForge",
      signup: "Create Account – ThumbForge",
      forgot: "Reset Password – ThumbForge",
      verify: "Verify Code – ThumbForge",
    };
    document.title = titles[mode] ?? "ThumbForge";
  }, [mode]);

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
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName },
      },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      if (data.session) {
        toast.success("Account created successfully!");
        navigate("/dashboard");
      } else {
        setMode("verify");
        toast.success("Check your email for the 6-digit verification code!");
      }
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otpCode,
      type: 'signup',
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Email verified successfully!");
      navigate("/dashboard");
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
    <div className="min-h-screen bg-[#050505] flex selection:bg-white/20 relative overflow-hidden font-light">
      {/* Subtle background glow */}
      <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-white/[0.03] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-white/[0.02] rounded-full blur-[120px] pointer-events-none" />

      {/* Left Side: Branding / Content (Hidden on Mobile) */}
      <div className="hidden lg:flex flex-1 flex-col justify-between p-16 relative z-10">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
          <div className="h-10 w-10 rounded-full border border-white/10 bg-gradient-to-b from-white/10 to-transparent flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.05)]">
             <Zap className="h-5 w-5 text-white/90" />
          </div>
          <span className="font-medium tracking-tight text-2xl text-white">ThumbForge</span>
        </div>

        <div className="max-w-xl animate-in fade-in slide-in-from-left-8 duration-1000">
          <div className="flex items-center gap-2 mb-6">
            <div className="flex -space-x-2">
              {[1,2,3,4].map(i => (
                <div key={i} className="h-8 w-8 rounded-full border-2 border-black bg-white/10 flex items-center justify-center overflow-hidden">
                  <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" className="h-full w-full object-cover opacity-80" />
                </div>
              ))}
            </div>
            <div className="ml-2">
              <div className="flex gap-0.5 mb-0.5">
                {[1,2,3,4,5].map(i => <Star key={i} className="h-3 w-3 fill-white text-white" />)}
              </div>
              <p className="text-[10px] text-white/40 font-medium tracking-wide">Trusted by 2,500+ creators</p>
            </div>
          </div>

          <h2 className="text-6xl font-medium text-white leading-[1.1] tracking-tight mb-10">
            Design for <br />
            <span className="text-white/40 italic">high performance.</span>
          </h2>

          <div className="grid grid-cols-2 gap-12">
            <div className="space-y-2">
              <p className="text-3xl font-medium text-white">99.9%</p>
              <p className="text-sm text-white/30 font-light">Success rate in CTR boost</p>
            </div>
            <div className="space-y-2">
              <p className="text-3xl font-medium text-white">Instant</p>
              <p className="text-sm text-white/30 font-light">AI-powered optimizations</p>
            </div>
          </div>
        </div>

        <div className="text-white/20 text-xs font-light tracking-wide flex items-center gap-4">
          <span>© {new Date().getFullYear()} ThumbForge</span>
          <span className="h-1 w-1 rounded-full bg-white/10" />
          <span>Professional Image Studio</span>
        </div>
      </div>

      {/* Right Side: Auth Form */}
      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-[480px] animate-in fade-in zoom-in-95 duration-700">
          {/* Mobile Logo Only */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-12">
            <Zap className="h-8 w-8 text-white" />
            <span className="font-medium text-2xl text-white">ThumbForge</span>
          </div>

          <div className="rounded-[3rem] border border-white/10 bg-[#0a0a0a]/60 backdrop-blur-3xl p-10 sm:p-14 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.05] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

            <div className="relative z-10">
              <h1 className="text-4xl font-medium text-white mb-3 tracking-tight">
                {mode === "login" && "Welcome back."}
                {mode === "signup" && "Join us."}
                {mode === "forgot" && "Reset Password."}
                {mode === "verify" && "Enter Code."}
              </h1>
              <p className="text-white/40 text-lg mb-12 font-light">
                {mode === "login" && "Sign in to your account."}
                {mode === "signup" && "Create your pro account today."}
                {mode === "forgot" && "We'll send you a recovery link."}
                {mode === "verify" && `Verification sent to ${email}`}
              </p>

              <form onSubmit={
                mode === "login" ? handleLogin : 
                mode === "signup" ? handleSignup : 
                mode === "verify" ? handleVerifyOtp :
                handleForgotPassword
              } className="space-y-5">
                {mode === "signup" && (
                  <div className="space-y-2">
                    <Label className="text-white/60 ml-2 text-xs uppercase tracking-widest font-semibold">Display Name</Label>
                    <div className="relative group">
                      <User className="absolute left-5 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-white/20 group-focus-within:text-white/80 transition-colors" />
                      <Input
                        placeholder="Your Name"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="pl-14 h-16 bg-white/[0.03] border-white/10 text-white placeholder:text-white/20 rounded-2xl focus-visible:ring-1 focus-visible:ring-white/30 focus-visible:border-white/30 focus-visible:bg-white/[0.06] transition-all font-light text-base"
                        required
                      />
                    </div>
                  </div>
                )}

                {mode !== "verify" && (
                  <div className="space-y-2">
                    <Label className="text-white/60 ml-2 text-xs uppercase tracking-widest font-semibold">Email Address</Label>
                    <div className="relative group">
                      <Mail className="absolute left-5 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-white/20 group-focus-within:text-white/80 transition-colors" />
                      <Input
                        type="email"
                        placeholder="email@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-14 h-16 bg-white/[0.03] border-white/10 text-white placeholder:text-white/20 rounded-2xl focus-visible:ring-1 focus-visible:ring-white/30 focus-visible:border-white/30 focus-visible:bg-white/[0.06] transition-all font-light text-base"
                        required
                      />
                    </div>
                  </div>
                )}

                {mode === "verify" && (
                  <div className="space-y-2">
                    <Label className="text-white/60 ml-2 text-xs uppercase tracking-widest font-semibold">Verification Code</Label>
                    <div className="relative group">
                      <Lock className="absolute left-5 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-white/20 group-focus-within:text-white/80 transition-colors" />
                      <Input
                        type="text"
                        placeholder="000000"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        className="pl-14 h-16 bg-white/[0.03] border-white/10 text-white placeholder:text-white/20 rounded-2xl focus-visible:ring-1 focus-visible:ring-white/30 focus-visible:border-white/30 focus-visible:bg-white/[0.06] transition-all font-light text-xl tracking-[0.6em] text-center"
                        required
                        maxLength={6}
                      />
                    </div>
                  </div>
                )}

                {mode !== "forgot" && mode !== "verify" && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between ml-2">
                      <Label className="text-white/60 text-xs uppercase tracking-widest font-semibold">Password</Label>
                      {mode === "login" && (
                        <button type="button" onClick={() => setMode("forgot")} className="text-xs text-white/30 hover:text-white transition-colors">
                          Forgot?
                        </button>
                      )}
                    </div>
                    <div className="relative group">
                      <Lock className="absolute left-5 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-white/20 group-focus-within:text-white/80 transition-colors" />
                      <Input
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-14 h-16 bg-white/[0.03] border-white/10 text-white placeholder:text-white/20 rounded-2xl focus-visible:ring-1 focus-visible:ring-white/30 focus-visible:border-white/30 focus-visible:bg-white/[0.06] transition-all font-light text-base"
                        required
                        minLength={6}
                      />
                    </div>
                  </div>
                )}

                <div className="pt-4">
                   <button
                     type="submit"
                     className="w-full h-16 rounded-2xl bg-white text-black font-semibold text-base hover:bg-white/90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none shadow-[0_12px_24px_-8px_rgba(255,255,255,0.3)]"
                     disabled={loading}
                   >
                     {loading ? "Processing..." : mode === "login" ? "Sign in" : mode === "signup" ? "Create Account" : mode === "verify" ? "Verify Code" : "Send link"}
                   </button>
                </div>
              </form>

              <div className="mt-12 text-center text-[15px] font-light">
                {mode === "verify" && (
                  <button 
                    type="button"
                    onClick={() => setMode("signup")} 
                    className="text-white/40 hover:text-white transition-colors flex items-center justify-center gap-1.5 mx-auto"
                  >
                    <ArrowLeft className="h-4 w-4" /> Back to signup
                  </button>
                )}

                {mode === "login" && (
                  <p className="text-white/40">
                    New to ThumbForge?{" "}
                    <button onClick={() => setMode("signup")} className="text-white hover:underline font-medium transition-colors ml-1">
                      Sign up for free
                    </button>
                  </p>
                )}
                {mode === "signup" && (
                  <p className="text-white/40">
                    Already have an account?{" "}
                    <button onClick={() => setMode("login")} className="text-white hover:underline font-medium transition-colors ml-1">
                      Sign in
                    </button>
                  </p>
                )}
                {mode === "forgot" && (
                  <button onClick={() => setMode("login")} className="text-white/40 hover:text-white transition-colors flex items-center justify-center gap-1.5 mx-auto">
                    <ArrowLeft className="h-4 w-4" /> Back to sign in
                  </button>
                )}
              </div>
            </div>
          </div>

          <button onClick={() => navigate("/")} className="mt-12 text-white/20 hover:text-white/50 text-[13px] font-light flex items-center gap-1.5 mx-auto transition-colors group">
            <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-1 transition-transform" /> Back to Homepage
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
