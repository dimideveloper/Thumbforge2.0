import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  Heart, Copy, Share2, MessageCircle, 
  Sparkles, TrendingUp, Trophy, SearchX 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface ShowcaseItem {
  id: string;
  image_url: string;
  prompt: string;
  likes_count: number;
  created_at: string;
  user_id: string;
  is_liked?: boolean;
}

export function CommunityShowcase() {
  const [items, setItems] = useState<ShowcaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchItems();
    getCurrentUser();
  }, []);

  async function getCurrentUser() {
    const { data } = await supabase.auth.getUser();
    if (data.user) setCurrentUserId(data.user.id);
  }

  async function fetchItems() {
    try {
      // Get showcase items
      const { data: showcase, error } = await supabase
        .from("community_showcase")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Get user's likes if logged in
      const { data: userAuth } = await supabase.auth.getUser();
      let likedIds: string[] = [];
      
      if (userAuth.user) {
        const { data: likes } = await supabase
          .from("showcase_likes")
          .select("showcase_id")
          .eq("user_id", userAuth.user.id);
        
        if (likes) likedIds = likes.map(l => l.showcase_id);
      }

      const formattedItems = (showcase || []).map(item => ({
        ...item,
        is_liked: likedIds.includes(item.id)
      }));

      setItems(formattedItems);
    } catch (error) {
      console.error("Error fetching showcase:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleLike = async (itemId: string, isLiked: boolean) => {
    if (!currentUserId) {
      toast.error("Please log in to like thumbnails.");
      return;
    }

    try {
      if (isLiked) {
        await supabase
          .from("showcase_likes")
          .delete()
          .eq("showcase_id", itemId)
          .eq("user_id", currentUserId);
        
        setItems(prev => prev.map(item => 
          item.id === itemId 
            ? { ...item, is_liked: false, likes_count: item.likes_count - 1 } 
            : item
        ));
      } else {
        await supabase
          .from("showcase_likes")
          .insert({ showcase_id: itemId, user_id: currentUserId });
        
        setItems(prev => prev.map(item => 
          item.id === itemId 
            ? { ...item, is_liked: true, likes_count: item.likes_count + 1 } 
            : item
        ));
        toast.success("Thumbnail liked!");
      }
    } catch (error) {
      console.error("Error liking item:", error);
    }
  };

  const copyPrompt = (prompt: string) => {
    if (!prompt) return;
    navigator.clipboard.writeText(prompt);
    toast.success("Prompt copied to clipboard!");
  };

  return (
    <div className="flex flex-col h-full bg-black/20 backdrop-blur-3xl">
      <div className="p-8 pb-4">
        <div className="flex items-center gap-4 mb-2">
          <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
            <Trophy className="h-6 w-6 text-amber-400" />
          </div>
          <div>
            <h2 className="text-3xl font-medium tracking-tight text-white">Hall of Fame</h2>
            <p className="text-white/40 font-light">Community showcase of the best AI thumbnails.</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 pb-12">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="aspect-video rounded-3xl bg-white/[0.03] border border-white/5 animate-pulse" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="h-20 w-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
              <SearchX className="h-10 w-10 text-white/20" />
            </div>
            <h3 className="text-xl font-medium text-white mb-2">No thumbnails shared yet</h3>
            <p className="text-white/40 font-light max-w-xs">Be the first one to share your creation from your project history!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
            {items.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="group relative"
              >
                <div className="relative aspect-video rounded-[32px] overflow-hidden border border-white/10 bg-[#0a0a0a] shadow-2xl transition-all duration-500 group-hover:scale-[1.02] group-hover:border-white/20 group-hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                  <img 
                    src={item.image_url} 
                    alt="Community Thumbnail" 
                    className="absolute inset-0 w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                  />
                  
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-6">
                    <div className="flex items-center justify-between gap-4 translate-y-4 group-hover:translate-y-0 transition-all duration-500 delay-75">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleLike(item.id, !!item.is_liked)}
                          className={`h-11 px-4 rounded-2xl flex items-center gap-2 backdrop-blur-md transition-all ${
                            item.is_liked 
                              ? 'bg-red-500 text-white' 
                              : 'bg-white/10 text-white hover:bg-white/20 border border-white/10'
                          }`}
                        >
                          <Heart className={`h-4 w-4 ${item.is_liked ? 'fill-current' : ''}`} />
                          <span className="text-sm font-medium">{item.likes_count}</span>
                        </button>
                        
                        {item.prompt && (
                          <button 
                            onClick={() => copyPrompt(item.prompt)}
                            className="h-11 w-11 rounded-2xl bg-white/10 text-white hover:bg-white/20 border border-white/10 backdrop-blur-md flex items-center justify-center transition-all"
                            title="Copy Prompt"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                         <div className="h-10 w-10 rounded-full border border-white/20 bg-white/5 flex items-center justify-center">
                            <Sparkles className="h-4 w-4 text-white/60" />
                         </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Info below card (optional, but makes it cleaner) */}
                <div className="mt-4 px-2 flex items-center justify-between opacity-60 group-hover:opacity-100 transition-opacity">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-white/40">
                    Shared {new Date(item.created_at).toLocaleDateString()}
                  </span>
                  <TrendingUp className="h-3 w-3 text-white/20" />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
