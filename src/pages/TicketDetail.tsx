import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { SupportTicketChat } from "@/components/support/SupportTicketChat";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Tag, ShieldCheck, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

const formatDate = (dateString: string) => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(dateString));
};

interface Ticket {
  id: string;
  subject: string;
  status: 'open' | 'answered' | 'resolved' | 'closed';
  category: string;
  priority: string;
  created_at: string;
}

export default function TicketDetail() {
  const { id } = useParams<{ id: string }>();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (id) fetchTicket();
  }, [id]);

  async function fetchTicket() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("support_tickets")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      setTicket(data);
    } catch (error) {
      console.error("Error fetching ticket:", error);
      toast.error("Ticket not found.");
      navigate("/help");
    } finally {
      setLoading(false);
    }
  }

  async function resolveTicket() {
    if (!id) return;
    try {
      const { error } = await supabase
        .from("support_tickets")
        .update({ status: 'resolved' })
        .eq("id", id);

      if (error) throw error;
      toast.success("Ticket marked as resolved.");
      fetchTicket();
    } catch (error) {
      console.error("Error resolving ticket:", error);
      toast.error("Failed to update ticket.");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="h-8 w-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!ticket) return null;

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white/20 flex flex-col">
      <Header />
      
      <main className="flex-1 pt-32 pb-24">
        <div className="container max-w-5xl px-4 md:px-6 mx-auto">
          
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12"
          >
            <div className="flex flex-col gap-4">
              <Link to="/help" className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors">
                <ArrowLeft className="h-4 w-4" />
                Back to Help Center
              </Link>
              <h1 className="text-2xl md:text-4xl font-medium tracking-tight text-white">
                {ticket.subject}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm font-light text-white/40">
                <span className="flex items-center gap-1.5"><Tag className="h-3.5 w-3.5" /> {ticket.category}</span>
                <span>•</span>
                <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> {formatDate(ticket.created_at)}</span>
                <span>•</span>
                <span className="flex items-center gap-1.5 capitalize"><ShieldCheck className="h-3.5 w-3.5" /> {ticket.priority} priority</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end gap-2">
                <span className="text-[10px] text-white/30 uppercase tracking-widest font-medium">Status</span>
                <Badge className={`px-4 py-1 text-sm ${
                  ticket.status === 'open' ? 'bg-blue-500/10 text-blue-400' :
                  ticket.status === 'answered' ? 'bg-amber-500/10 text-amber-400' :
                  ticket.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-400' :
                  'bg-white/5 text-white/40'
                }`}>
                  {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                </Badge>
              </div>
              
              {ticket.status !== 'resolved' && ticket.status !== 'closed' && (
                <Button 
                  onClick={resolveTicket}
                  variant="outline"
                  className="h-11 border-white/10 hover:border-emerald-500/30 hover:bg-emerald-500/5 hover:text-emerald-400 rounded-xl px-6 flex items-center gap-2 transition-all"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Mark as Resolved
                </Button>
              )}
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <SupportTicketChat ticketId={ticket.id} />
            </div>

            <div className="space-y-6">
              <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-sm">
                <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-white/40" />
                  Support Information
                </h3>
                <div className="space-y-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-white/30 font-light">Ticket ID</span>
                    <span className="text-xs text-white/60 font-mono break-all">{ticket.id}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-white/30 font-light">Response Time</span>
                    <span className="text-sm text-white/60">Average: 2-4 hours</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-white/30 font-light">Community Help</span>
                    <a href="https://discord.gg/yourserver" className="text-sm text-white hover:underline transition-all">Join Discord</a>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-transparent text-center">
                <p className="text-xs text-white/50 font-light mb-4">
                  Are you satisfied with our support?
                </p>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <div key={star} className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center text-white/20 hover:text-amber-400 hover:bg-amber-400/10 cursor-pointer transition-all">
                      ★
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
