import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { PromptInputBox } from "@/components/ui/ai-prompt-box";
import { Button } from "@/components/ui/button";
import { getOrCreateProfileCredits } from "@/lib/profile";
import {
  Zap, Plus, MessageSquare, LogOut, Coins, Trash2, Menu, X,
} from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import type { User } from "@supabase/supabase-js";

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
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auth check
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
      .insert({ user_id: user.id, title: "Neuer Chat" })
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
      if (error || !data) { toast.error("Fehler beim Erstellen des Chats"); return; }
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
        toast.error("Rate limit erreicht, bitte versuche es später erneut.");
        setIsLoading(false);
        return;
      }
      if (resp.status === 402) {
        toast.error("Keine Credits mehr. Bitte lade dein Konto auf.");
        setIsLoading(false);
        return;
      }
      if (!resp.ok || !resp.body) throw new Error("Stream fehlgeschlagen");

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
      toast.error("AI-Antwort fehlgeschlagen");
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
    <div className="h-screen flex bg-black overflow-hidden selection:bg-white/20">
      {/* Sidebar */}
      <aside
        className={`${sidebarOpen ? "w-72" : "w-0"
          } transition-all duration-300 border-r border-white/10 bg-[#0a0a0a] flex flex-col overflow-hidden shrink-0`}
      >
        <div className="p-5 border-b border-white/10 flex items-center gap-2">
          <Zap className="h-5 w-5 text-white shrink-0" />
          <span className="font-semibold tracking-tight text-lg text-white whitespace-nowrap">ThumbForge</span>
        </div>

        <div className="p-4">
          <button onClick={createNewChat} className="w-full flex items-center gap-2 justify-center h-10 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-colors text-sm border border-white/10">
            <Plus className="h-4 w-4" /> Neuer Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 space-y-1">
          {chats.map((chat) => (
            <div
              key={chat.id}
              className={`group flex items-center gap-2 rounded-lg px-3 py-2 cursor-pointer transition-colors text-sm font-light ${activeChatId === chat.id
                  ? "bg-white/10 text-white"
                  : "text-white/50 hover:bg-white/5 hover:text-white"
                }`}
              onClick={() => setActiveChatId(chat.id)}
            >
              <MessageSquare className="h-4 w-4 shrink-0 opacity-70" />
              <span className="truncate flex-1">{chat.title}</span>
              <button
                onClick={(e) => { e.stopPropagation(); deleteChat(chat.id); }}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="h-3.5 w-3.5 text-white/40 hover:text-red-400" />
              </button>
            </div>
          ))}
        </div>

        {/* Credits & User */}
        <div className="p-4 border-t border-white/10 space-y-4">
          <div className="flex items-center gap-2 text-sm font-light">
            <Coins className="h-4 w-4 text-white/40" />
            <span className="text-white/50">Credits:</span>
            <span className="font-medium text-white">{credits}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/50 truncate font-light">{user?.email}</span>
            <button onClick={handleLogout} className="text-white/30 hover:text-white transition-colors p-1">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="h-14 border-b border-white/5 flex items-center px-4 gap-3 shrink-0">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-white/50 hover:text-white transition-colors">
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <h2 className="font-medium text-white truncate logging-tight">
            {activeChatId ? chats.find((c) => c.id === activeChatId)?.title || "Chat" : "ThumbForge AI"}
          </h2>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-8">
          {messages.length === 0 && !activeChatId ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="h-16 w-16 rounded-3xl bg-white/5 flex items-center justify-center mb-6">
                <Zap className="h-8 w-8 text-white/50" />
              </div>
              <h2 className="text-2xl font-medium tracking-tight text-white mb-3">Wie kann ich dir helfen?</h2>
              <p className="text-white/40 max-w-sm font-light text-sm">
                Stelle mir eine Frage über Thumbnails, YouTube-SEO, Gaming Content oder alles andere.
              </p>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-8">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-3xl px-6 py-4 ${msg.role === "user"
                        ? "bg-white/10 text-white border border-white/5"
                        : "bg-transparent text-white/80"
                      }`}
                  >
                    {msg.role === "assistant" ? (
                      <div className="prose prose-sm prose-invert max-w-none prose-p:leading-relaxed font-light">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-sm whitespace-pre-wrap font-light">{msg.content}</p>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-4 max-w-3xl mx-auto w-full">
          <PromptInputBox
            onSend={(msg) => handleSend(msg)}
            isLoading={isLoading}
            placeholder="Schreibe eine Nachricht..."
          />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
