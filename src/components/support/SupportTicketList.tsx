import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Calendar, ChevronRight, MessageSquare, Clock, Filter } from "lucide-react";
import { format } from "date-fns";

interface Ticket {
  id: string;
  subject: string;
  status: 'open' | 'answered' | 'resolved' | 'closed';
  category: string;
  created_at: string;
  updated_at: string;
}

export function SupportTicketList() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdmin();
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [filter, isAdmin]);

  async function checkAdmin() {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("user_id", userData.user.id)
      .single();

    if (profile?.is_admin) {
      setIsAdmin(true);
    }
  }

  async function fetchTickets() {
    setLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      let query = supabase
        .from("support_tickets")
        .select("*")
        .order("updated_at", { ascending: false });

      // If not admin, only show own tickets
      if (!isAdmin) {
        query = query.eq("user_id", userData.user.id);
      } else if (filter === "own") {
        // Admin can still choose to see only their own
        query = query.eq("user_id", userData.user.id);
      }

      if (filter !== "all" && filter !== "own") {
        query = query.eq("status", filter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setTickets(data || []);
    } catch (error) {
      console.error("Error fetching tickets:", error);
    } finally {
      setLoading(false);
    }
  }

  const getStatusBadge = (status: Ticket['status']) => {
    switch (status) {
      case 'open':
        return <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20">Open</Badge>;
      case 'answered':
        return <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20">Answered</Badge>;
      case 'resolved':
        return <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20">Resolved</Badge>;
      case 'closed':
        return <Badge className="bg-white/5 text-white/40 border-white/10 hover:bg-white/10">Closed</Badge>;
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-white flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-white/40" />
          Recent Support Tickets
        </h3>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-white/30" />
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-transparent text-sm text-white/60 focus:outline-none cursor-pointer hover:text-white transition-colors"
          >
            {isAdmin ? (
              <>
                <option value="all" className="bg-[#0f0f0f]">All System Tickets (Admin)</option>
                <option value="own" className="bg-[#0f0f0f]">My Tickets</option>
              </>
            ) : (
              <option value="all" className="bg-[#0f0f0f]">All My Tickets</option>
            )}
            <option value="open" className="bg-[#0f0f0f]">Open</option>
            <option value="answered" className="bg-[#0f0f0f]">Answered</option>
            <option value="resolved" className="bg-[#0f0f0f]">Resolved</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="h-24 w-full bg-white/[0.03] border border-white/5 rounded-2xl animate-pulse" />
          ))
        ) : tickets.length === 0 ? (
          <div className="text-center py-12 rounded-3xl border border-dashed border-white/10 bg-white/[0.02]">
            <Clock className="h-8 w-8 text-white/20 mx-auto mb-4" strokeWidth={1.5} />
            <p className="text-white/40 font-light">No support tickets found.</p>
          </div>
        ) : (
          tickets.map((ticket, index) => (
            <motion.div
              key={ticket.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                to={`/support/tickets/${ticket.id}`}
                className="group flex flex-col md:flex-row md:items-center justify-between p-5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/20 hover:bg-white/[0.05] transition-all"
              >
                <div className="flex items-start gap-4 mb-4 md:mb-0">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                    ticket.status === 'open' ? 'bg-blue-500/10 text-blue-400' :
                    ticket.status === 'answered' ? 'bg-amber-500/10 text-amber-400' :
                    'bg-white/5 text-white/40'
                  }`}>
                    <MessageSquare className="h-5 w-5" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h4 className="text-white font-medium group-hover:text-white transition-colors mb-1 line-clamp-1">
                      {ticket.subject}
                    </h4>
                    <div className="flex items-center gap-3 text-xs text-white/40 font-light">
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {format(new Date(ticket.created_at), 'MMM d, yyyy')}</span>
                      <span>•</span>
                      <span className="capitalize">{ticket.category}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between md:justify-end gap-6">
                  {getStatusBadge(ticket.status)}
                  <ChevronRight className="h-4 w-4 text-white/20 group-hover:text-white/60 transition-all group-hover:translate-x-0.5" />
                </div>
              </Link>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
