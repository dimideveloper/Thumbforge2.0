import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Users, 
  Ticket, 
  Coins, 
  Search, 
  ChevronRight, 
  ExternalLink,
  ShieldCheck,
  RefreshCcw,
  MessageSquare
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Link } from "react-router-dom";

interface Stats {
  totalUsers: number;
  openTickets: number;
  totalCredits: number;
}

interface UserProfile {
  user_id: string;
  email?: string;
  display_name?: string;
  avatar_url?: string | null;
  credits: number;
  is_admin: boolean;
  created_at: string;
  projectCount?: number;
}

interface SupportTicket {
  id: string;
  user_id: string;
  subject: string;
  status: 'open' | 'answered' | 'resolved' | 'closed';
  category: string;
  priority: string;
  created_at: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ totalUsers: 0, openTickets: 0, totalCredits: 0 });
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"users" | "tickets">("users");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch stats
      const { count: userCount } = await supabase.from("profiles").select("*", { count: "exact", head: true });
      const { count: ticketCount } = await supabase.from("support_tickets").select("*", { count: "exact", head: true }).eq("status", "open");
      const { data: creditData } = await supabase.from("profiles").select("credits");
      
      const totalCredits = creditData?.reduce((acc, curr) => acc + (curr.credits || 0), 0) || 0;

      setStats({
        totalUsers: userCount || 0,
        openTickets: ticketCount || 0,
        totalCredits
      });

      // Fetch users with project counts
      const { data: userData, error: userError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (userError) throw userError;

      // Fetch project counts for all users
      const { data: projectData } = await supabase
        .from("thumbnail_projects")
        .select("user_id");

      const projectCounts = projectData?.reduce((acc: Record<string, number>, curr) => {
        acc[curr.user_id] = (acc[curr.user_id] || 0) + 1;
        return acc;
      }, {}) || {};

      const usersWithCounts = (userData as UserProfile[]).map(u => ({
        ...u,
        projectCount: projectCounts[u.user_id] || 0
      }));
      
      setUsers(usersWithCounts);

      // Fetch tickets
      const { data: ticketData } = await supabase
        .from("support_tickets")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      
      setTickets(ticketData as SupportTicket[] || []);

    } catch (error) {
      console.error("Error fetching admin data:", error);
      toast.error("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateCredits = async (userId: string, newCredits: number) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ credits: newCredits })
        .eq("user_id", userId);

      if (error) throw error;
      toast.success("Credits updated successfully");
      fetchData();
    } catch (error) {
      toast.error("Failed to update credits");
    }
  };

  const toggleAdmin = async (userId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ is_admin: !currentStatus })
        .eq("user_id", userId);

      if (error) throw error;
      toast.success(`Admin status ${!currentStatus ? 'granted' : 'revoked'}`);
      fetchData();
    } catch (error) {
      toast.error("Failed to update admin status");
    }
  };

  const filteredUsers = users.filter(u => 
    u.user_id.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTickets = tickets.filter(t => 
    t.subject.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white/20 flex flex-col font-sans">
      <Header />
      
      <main className="flex-1 pt-32 pb-24 px-4 md:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          
          {/* Hero Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 mb-2">
                <ShieldCheck className="h-3 w-3 text-blue-400" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400">Master Control Panel</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-medium tracking-tighter">
                Admin <span className="text-white/20">Intelligence.</span>
              </h1>
              <p className="text-white/40 font-light text-lg">Manage users, credits, and support tickets from one central hub.</p>
            </div>
            <Button 
              onClick={fetchData} 
              variant="outline" 
              className="rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 h-12 px-6 flex items-center gap-2"
            >
              <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh Data
            </Button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: "Total Users", value: stats.totalUsers, icon: Users, color: "text-blue-400" },
              { label: "Open Tickets", value: stats.openTickets, icon: Ticket, color: "text-amber-400" },
              { label: "Total Credits", value: stats.totalCredits, icon: Coins, color: "text-emerald-400" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-8 rounded-[32px] bg-white/[0.03] border border-white/10 backdrop-blur-xl group hover:bg-white/[0.05] transition-all duration-500"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform ${stat.color}`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-widest text-white/20 font-bold">{stat.label}</p>
                  <p className="text-4xl font-medium tracking-tight">{stat.value.toLocaleString()}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Main Content Area */}
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex p-1 rounded-2xl bg-white/5 border border-white/10 w-full md:w-auto">
                <button
                  onClick={() => setActiveTab("users")}
                  className={`flex-1 md:w-32 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === "users" ? 'bg-white text-black shadow-xl' : 'text-white/40 hover:text-white'}`}
                >
                  Users
                </button>
                <button
                  onClick={() => setActiveTab("tickets")}
                  className={`flex-1 md:w-32 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === "tickets" ? 'bg-white text-black shadow-xl' : 'text-white/40 hover:text-white'}`}
                >
                  Tickets
                </button>
              </div>

              <div className="relative w-full md:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                <Input
                  placeholder={`Search ${activeTab}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-11 h-12 bg-white/5 border-white/10 rounded-2xl focus:border-white/20 transition-all placeholder:text-white/10"
                />
              </div>
            </div>

            <div className="rounded-[32px] bg-white/[0.03] border border-white/10 backdrop-blur-xl overflow-hidden">
              {activeTab === "users" ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-white/5">
                        <th className="px-8 py-6 text-[10px] uppercase tracking-widest text-white/30 font-bold">User / Identity</th>
                        <th className="px-8 py-6 text-[10px] uppercase tracking-widest text-white/30 font-bold text-center">Projects</th>
                        <th className="px-8 py-6 text-[10px] uppercase tracking-widest text-white/30 font-bold text-center">Credits</th>
                        <th className="px-8 py-6 text-[10px] uppercase tracking-widest text-white/30 font-bold text-center">Role</th>
                        <th className="px-8 py-6 text-[10px] uppercase tracking-widest text-white/30 font-bold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredUsers.map((user) => (
                        <tr key={user.user_id} className="group hover:bg-white/[0.02] transition-all">
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-4">
                              <div className="h-10 w-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                                {user.avatar_url ? (
                                  <img src={user.avatar_url} alt="" className="h-full w-full object-cover" />
                                ) : (
                                  <Users className="h-5 w-5 text-white/20" />
                                )}
                              </div>
                              <div className="flex flex-col gap-0.5">
                                <span className="text-sm font-medium text-white/80">{user.display_name || user.email || "Anonymous Creator"}</span>
                                <span className="text-[10px] text-white/20 font-mono tracking-tight">{user.user_id}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6 text-center">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                              <span className="text-xs font-medium text-white/60">{user.projectCount || 0}</span>
                            </div>
                          </td>
                          <td className="px-8 py-6 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <span className="text-sm font-medium text-emerald-400">{user.credits}</span>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-6 w-6 p-0 rounded-lg hover:bg-emerald-500/10 hover:text-emerald-400 text-white/10"
                                onClick={() => {
                                  const val = prompt("Set credits for " + (user.display_name || user.user_id), user.credits.toString());
                                  if (val !== null) updateCredits(user.user_id, parseInt(val));
                                }}
                              >
                                <Coins className="h-3 w-3" />
                              </Button>
                            </div>
                          </td>
                          <td className="px-8 py-6 text-center">
                            <button
                              onClick={() => toggleAdmin(user.user_id, user.is_admin)}
                              className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all ${
                                user.is_admin 
                                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' 
                                : 'bg-white/5 text-white/20 border border-white/5 hover:border-white/10 hover:text-white/40'
                              }`}
                            >
                              {user.is_admin ? "Admin" : "User"}
                            </button>
                          </td>
                          <td className="px-8 py-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <span className="text-[10px] text-white/20 font-light hidden md:inline">
                                {new Date(user.created_at).toLocaleDateString()}
                              </span>
                              <Button variant="ghost" className="h-9 w-9 p-0 rounded-xl hover:bg-white/5 text-white/20 hover:text-white transition-all">
                                <ChevronRight className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-white/5">
                        <th className="px-8 py-6 text-[10px] uppercase tracking-widest text-white/30 font-bold">Ticket Details</th>
                        <th className="px-8 py-6 text-[10px] uppercase tracking-widest text-white/30 font-bold">Category</th>
                        <th className="px-8 py-6 text-[10px] uppercase tracking-widest text-white/30 font-bold">Status</th>
                        <th className="px-8 py-6 text-[10px] uppercase tracking-widest text-white/30 font-bold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredTickets.map((ticket) => (
                        <tr key={ticket.id} className="group hover:bg-white/[0.02] transition-all">
                          <td className="px-8 py-6">
                            <div className="flex flex-col gap-1">
                              <span className="text-sm font-medium text-white/80">{ticket.subject}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-white/20 font-mono">{ticket.id}</span>
                                <Badge className={`text-[8px] uppercase px-1.5 py-0 ${ticket.priority === 'high' ? 'bg-red-500/10 text-red-400' : 'bg-white/5 text-white/40'}`}>
                                  {ticket.priority}
                                </Badge>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6 text-sm text-white/40 font-light capitalize">
                            {ticket.category}
                          </td>
                          <td className="px-8 py-6">
                            <Badge className={`px-3 py-1 text-[10px] uppercase tracking-wider ${
                              ticket.status === 'open' ? 'bg-blue-500/10 text-blue-400' :
                              ticket.status === 'answered' ? 'bg-amber-500/10 text-amber-400' :
                              ticket.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-400' :
                              'bg-white/5 text-white/40'
                            }`}>
                              {ticket.status}
                            </Badge>
                          </td>
                          <td className="px-8 py-6 text-right">
                            <Link to={`/support/tickets/${ticket.id}`}>
                              <Button variant="ghost" className="h-10 w-10 p-0 rounded-xl hover:bg-white/5 text-white/20 hover:text-white transition-all">
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {((activeTab === "users" && filteredUsers.length === 0) || (activeTab === "tickets" && filteredTickets.length === 0)) && (
                <div className="py-24 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="h-16 w-16 rounded-3xl bg-white/5 flex items-center justify-center">
                    <Search className="h-8 w-8 text-white/10" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-lg font-medium">No results found</p>
                    <p className="text-sm text-white/20 font-light tracking-wide">Try adjusting your search query or filters.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
