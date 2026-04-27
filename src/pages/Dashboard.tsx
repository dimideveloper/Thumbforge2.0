import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { PromptInputBox } from "@/components/ui/ai-prompt-box";
import { Button } from "@/components/ui/button";
import { getOrCreateProfileCredits } from "@/lib/profile";
import {
  Zap, Plus, MessageSquare, LogOut, Coins, Trash2, Menu, X, Sparkles
} from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import type { User } from "@supabase/supabase-js";

import { NewsModal } from "@/components/dashboard/NewsModal";

type Message = { role: "user" | "assistant"; content: string };
type Chat = { id: string; title: string; created_at: string };

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [credits, setCredits] = useState(0);
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Handle window resize for mobile
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) setSidebarOpen(true);
      else setSidebarOpen(false);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Auth check
  useEffect(() => {
    document.title = "AI Assistant – ThumbForge";
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

  // Load profile & chats
  useEffect(() => {
    if (!user) return;
    const loadData = async () => {
      const loadedCredits = await getOrCreateProfileCredits(user.id);
      setCredits(loadedCredits);

      const { data: chatList } = await supabase
        .from("chats")
        .select("id, title, created_at")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });
      if (chatList) setChats(chatList);
    };
    loadData();
  }, [user]);

  // Load messages for active chat
  useEffect(() => {
    if (!activeChatId) {
      setMessages([]);
      return;
    }
    const loadMessages = async () => {
      const { data } = await supabase
        .from("messages")
        .select("role, content")
        .eq("chat_id", activeChatId)
        .order("created_at", { ascending: true });
      if (data) setMessages(data as Message[]);
    };
    loadMessages();
  }, [activeChatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const createNewChat = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("chats")
      .insert({ user_id: user.id, title: "New Chat" })
      .select()
      .single();
    if (error) { toast.error("Chat konnte nicht erstellt werden"); return; }
    setChats((prev) => [data, ...prev]);
    setActiveChatId(data.id);
    setMessages([]);
  };

  const deleteChat = async (chatId: string) => {
    await supabase.from("chats").delete().eq("id", chatId);
    setChats((prev) => prev.filter((c) => c.id !== chatId));
    if (activeChatId === chatId) {
      setActiveChatId(null);
      setMessages([]);
    }
  };

  const handleSend = async (message: string) => {
    if (!user || !message.trim()) return;

    let chatId = activeChatId;

    // Create chat if none active
    if (!chatId) {
      const { data, error } = await supabase
        .from("chats")
        .insert({ user_id: user.id, title: message.slice(0, 50) })
        .select()
        .single();
      if (error || !data) { toast.error("Error creating chat"); return; }
      chatId = data.id;
      setChats((prev) => [data, ...prev]);
      setActiveChatId(chatId);
    }

    const userMsg: Message = { role: "user", content: message };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    // Save user message
    await supabase.from("messages").insert({
      chat_id: chatId,
      user_id: user.id,
      role: "user",
      content: message,
    });

    // Stream AI response
    let assistantContent = "";
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

      const resp = await fetch(
        `${supabaseUrl}/functions/v1/chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken || anonKey}`,
            apikey: anonKey,
          },
          body: JSON.stringify({ messages: [...messages, userMsg] }),
        }
      );

      if (resp.status === 429) {
        toast.error("Rate limit reached, please try again later.");
        setIsLoading(false);
        return;
      }
      if (resp.status === 402) {
        toast.error("No credits left. Please top up your account.");
        setIsLoading(false);
        return;
      }
      if (!resp.ok || !resp.body) throw new Error("Stream failed");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") { streamDone = true; break; }
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant") {
                  return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantContent } : m));
                }
                return [...prev, { role: "assistant", content: assistantContent }];
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("AI response failed");
    }

    // Save assistant message
    if (assistantContent) {
      await supabase.from("messages").insert({
        chat_id: chatId,
        user_id: user.id,
        role: "assistant",
        content: assistantContent,
      });
    }

    // Update chat title if first message
    if (messages.length === 0) {
      await supabase.from("chats").update({ title: message.slice(0, 50) }).eq("id", chatId);
      setChats((prev) => prev.map((c) => (c.id === chatId ? { ...c, title: message.slice(0, 50) } : c)));
    }

    setIsLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <div className="h-screen flex bg-black overflow-hidden selection:bg-white/20 font-light text-foreground">
      <NewsModal />
      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? (isMobile ? "fixed inset-y-0 left-0 w-72" : "w-72") : "w-0"
        } transition-all duration-300 border-r border-white/5 bg-[#0a0a0a]/80 backdrop-blur-xl flex flex-col overflow-hidden shrink-0 z-40`}
      >
        <div className="h-16 px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full border border-white/10 bg-gradient-to-b from-white/10 to-transparent flex items-center justify-center">
              <Zap className="h-4 w-4 text-white/80" />
            </div>
            <span className="font-medium tracking-tight text-white/90">ThumbForge</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-white/40 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-4 pb-2 pt-2">
          <button onClick={createNewChat} className="w-full flex items-center gap-2 justify-center h-10 rounded-full bg-white text-black hover:bg-white/90 font-medium transition-all duration-200 text-sm active:scale-[0.98] shadow-lg">
            <Plus className="h-4 w-4" /> New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 space-y-0.5 mt-4">
          <div className="px-3 pb-2 text-[10px] uppercase tracking-wider font-semibold text-white/30">Deine Chats</div>
          {chats.map((chat) => (
            <div
              key={chat.id}
              className={`group flex items-center gap-3 rounded-2xl px-3 py-2.5 cursor-pointer transition-all duration-200 text-sm ${activeChatId === chat.id
                  ? "bg-white/10 text-white shadow-sm ring-1 ring-white/5"
                  : "text-white/50 hover:bg-white/5 hover:text-white/90"
                }`}
              onClick={() => {
                setActiveChatId(chat.id);
                if (isMobile) setSidebarOpen(false);
              }}
            >
              <MessageSquare className={`h-4 w-4 shrink-0 transition-colors ${activeChatId === chat.id ? "text-white/80" : "text-white/30 group-hover:text-white/50"}`} />
              <span className="truncate flex-1 font-medium">{chat.title}</span>
              <button
                onClick={(e) => { e.stopPropagation(); deleteChat(chat.id); }}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-md hover:bg-white/10 ml-1"
              >
                <Trash2 className="h-3.5 w-3.5 text-white/40 hover:text-red-400 transition-colors" />
              </button>
            </div>
          ))}
        </div>

        {/* Credits & User */}
        <div className="p-4 mt-auto">
          <div className="rounded-2xl bg-white/[0.02] border border-white/5 p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-white/10 flex items-center justify-center">
                  <Coins className="h-3 w-3 text-white/70" />
                </div>
                <span className="text-xs font-medium text-white/70">Credits</span>
              </div>
              <span className="text-sm font-semibold text-white">{credits}</span>
            </div>
            {credits < 10 && (
              <>
                <div className="h-px w-full bg-white/5" />
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-red-300/80 uppercase tracking-wider font-semibold">Low Credits</span>
                  <button
                    onClick={() => navigate("/")}
                    className="text-xs bg-white hover:bg-white/90 text-black px-2 py-1 rounded-md font-medium transition-colors"
                  >
                    Add Funds
                  </button>
                </div>
              </>
            )}
            <div className="h-px w-full bg-white/5" />
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/40 truncate flex-1 pr-2">{user?.email}</span>
              <button onClick={handleLogout} className="text-white/30 hover:text-white transition-colors p-1">
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-black relative">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-white/[0.02] blur-[120px] rounded-full pointer-events-none" />

        {/* Top bar */}
        <div className="h-16 border-b border-white/5 flex items-center px-4 sm:px-6 gap-4 shrink-0 bg-transparent backdrop-blur-md z-10">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)} 
            className={`${sidebarOpen && !isMobile ? "hidden" : "flex"} text-white/40 hover:text-white transition-colors p-2 -ml-2 rounded-xl hover:bg-white/5`}
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <h2 className="font-medium text-white/90 truncate flex-1">
            {activeChatId ? chats.find((c) => c.id === activeChatId)?.title || "Chat" : "ThumbForge Assistant"}
          </h2>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6 sm:py-8 relative z-10 scroll-smooth">
          {messages.length === 0 && !activeChatId ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto px-4">
              <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-[1.5rem] sm:rounded-[2rem] border border-white/10 bg-gradient-to-b from-white/5 to-transparent flex items-center justify-center mb-6 sm:mb-8 shadow-2xl">
                <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-white/60" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-white mb-3 sm:mb-4">How can I help?</h2>
              <p className="text-white/40 font-light text-sm sm:text-base leading-relaxed">
                I'm your AI assistant for thumbnails, YouTube SEO and content creation. Ask me anything.
              </p>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8 pb-4">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                  <div
                    className={`max-w-[90%] sm:max-w-[75%] px-4 py-3 sm:px-6 sm:py-4 ${msg.role === "user"
                        ? "bg-white text-black rounded-2xl sm:rounded-3xl rounded-tr-sm shadow-xl"
                        : "bg-transparent text-white/80"
                      }`}
                  >
                    {msg.role === "assistant" ? (
                      <div className="prose prose-sm prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-white/5 prose-pre:border prose-pre:border-white/10 prose-code:text-white/90 font-light">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-sm whitespace-pre-wrap font-medium">{msg.content}</p>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} className="h-4" />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-4 pb-8 max-w-3xl mx-auto w-full relative z-10">
          <PromptInputBox
            onSend={(msg) => handleSend(msg)}
            isLoading={isLoading}
            placeholder="Frag ThumbForge AI..."
          />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
