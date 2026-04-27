import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, User, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const formatTime = (dateString: string) => {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  }).format(new Date(dateString));
};

interface Message {
  id: string;
  ticket_id: string;
  sender_id: string;
  content: string;
  is_admin: boolean;
  created_at: string;
}

interface SupportTicketChatProps {
  ticketId: string;
}

export function SupportTicketChat({ ticketId }: SupportTicketChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages();
    getCurrentUser();

    // Subscribe to real-time updates
    const channel = supabase
      .channel(`ticket-${ticketId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'support_messages',
          filter: `ticket_id=eq.${ticketId}`,
        },
        (payload) => {
          setMessages((current) => [...current, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [ticketId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  async function getCurrentUser() {
    const { data } = await supabase.auth.getUser();
    if (data.user) setCurrentUserId(data.user.id);
  }

  async function fetchMessages() {
    try {
      const { data, error } = await supabase
        .from("support_messages")
        .select("*")
        .eq("ticket_id", ticketId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  }

  async function sendMessage() {
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("support_messages")
        .insert({
          ticket_id: ticketId,
          sender_id: userData.user.id,
          content: newMessage.trim(),
          is_admin: false,
        });

      if (error) throw error;
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message.");
    } finally {
      setIsSending(false);
    }
  }

  function scrollToBottom() {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }

  return (
    <div className="flex flex-col h-[600px] bg-white/[0.02] border border-white/10 rounded-3xl overflow-hidden backdrop-blur-sm">
      {/* Messages Area */}
      <ScrollArea className="flex-1 p-6">
        <div className="space-y-6">
          <AnimatePresence initial={false}>
            {messages.map((message) => {
              const isMe = message.sender_id === currentUserId;
              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-3 max-w-[80%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                    <Avatar className="h-8 w-8 border border-white/10 shrink-0">
                      <AvatarFallback className="bg-transparent">
                        {message.is_admin ? (
                          <div className="bg-white text-black h-full w-full flex items-center justify-center">
                            <ShieldCheck className="h-4 w-4" />
                          </div>
                        ) : (
                          <div className="bg-white/5 text-white/40 h-full w-full flex items-center justify-center text-xs">
                            <User className="h-4 w-4" />
                          </div>
                        )}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex flex-col gap-1.5">
                      <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        isMe 
                          ? 'bg-white text-black rounded-tr-none' 
                          : 'bg-white/5 text-white border border-white/10 rounded-tl-none'
                      }`}>
                        {message.content}
                      </div>
                      <span className={`text-[10px] text-white/30 font-light ${isMe ? 'text-right' : 'text-left'}`}>
                        {message.is_admin ? 'Support Team • ' : ''}
                        {formatTime(message.created_at)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 bg-white/[0.03] border-t border-white/10">
        <div className="relative group">
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Type your message..."
            className="min-h-[80px] bg-black/40 border-white/10 focus:border-white/20 rounded-2xl pr-14 resize-none placeholder:text-white/20"
          />
          <Button
            onClick={sendMessage}
            disabled={!newMessage.trim() || isSending}
            className="absolute bottom-3 right-3 h-10 w-10 rounded-xl bg-white text-black hover:bg-white/90 p-0 shadow-xl transition-all active:scale-90 disabled:opacity-50 disabled:bg-white/20"
          >
            {isSending ? (
              <div className="h-4 w-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="text-[10px] text-white/20 mt-3 text-center font-light uppercase tracking-widest">
          Press Enter to send, Shift + Enter for new line
        </p>
      </div>
    </div>
  );
}
