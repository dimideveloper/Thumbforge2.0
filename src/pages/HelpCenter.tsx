import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Book, Wand2, CreditCard, UserCircle, MessageCircle, LifeBuoy, History, SearchX } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SupportTicketForm } from "@/components/support/SupportTicketForm";
import { SupportTicketList } from "@/components/support/SupportTicketList";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

const categories = [
  {
    icon: Wand2,
    title: "Thumbnail Generation",
    description: "Learn how to write better prompts and use the AI tools.",
    articles: [
      { title: "How to write the perfect thumbnail prompt", slug: "how-to-write-the-perfect-thumbnail-prompt" },
      { title: "Using the Skin Replacer tool", slug: "using-the-skin-replacer-tool" },
      { title: "Understanding styles and lighting", slug: "understanding-styles-and-lighting" },
      { title: "Aspect ratios and export quality", slug: "aspect-ratios-and-export-quality" },
    ]
  },
  {
    icon: UserCircle,
    title: "Account & Profile",
    description: "Manage your account settings and preferences.",
    articles: [
      { title: "How to change your email address", slug: "how-to-change-your-email-address" },
      { title: "Resetting a forgotten password", slug: "resetting-a-forgotten-password" },
      { title: "Linking your Discord account", slug: "linking-your-discord-account" },
      { title: "Deleting your account", slug: "deleting-your-account" },
    ]
  },
  {
    icon: CreditCard,
    title: "Billing & Credits",
    description: "Information about subscriptions, payments, and usage.",
    articles: [
      { title: "How does the credit system work?", slug: "how-does-the-credit-system-work" },
      { title: "Upgrading to a Pro plan", slug: "upgrading-to-a-pro-plan" },
      { title: "How to cancel your subscription", slug: "how-to-cancel-your-subscription" },
      { title: "Refund policy", slug: "refund-policy" },
    ]
  }
];

const HelpCenter = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("articles");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
    });
  }, []);

  const filteredCategories = categories.map(cat => ({
    ...cat,
    articles: cat.articles.filter(art => 
      art.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(cat => cat.articles.length > 0);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white/20 flex flex-col">
      <Header />
      
      <main className="flex-1 pt-32 pb-24">
        {/* Hero Section */}
        <section className="px-4 md:px-6 mb-16">
          <div className="container max-w-4xl mx-auto text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl font-medium tracking-tight mb-6"
            >
              How can we help?
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-white/50 text-lg md:text-xl font-light mb-12 max-w-2xl mx-auto"
            >
              Search our knowledge base or reach out to our dedicated support team for personalized assistance.
            </motion.p>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="flex justify-center mb-12">
                <TabsList className="bg-white/5 border border-white/10 p-1 rounded-2xl h-14">
                  <TabsTrigger value="articles" className="rounded-xl px-8 h-full data-[state=active]:bg-white data-[state=active]:text-black transition-all">
                    <Book className="h-4 w-4 mr-2" />
                    Knowledge Base
                  </TabsTrigger>
                  <TabsTrigger value="support" className="rounded-xl px-8 h-full data-[state=active]:bg-white data-[state=active]:text-black transition-all">
                    <LifeBuoy className="h-4 w-4 mr-2" />
                    Support Tickets
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="articles" className="mt-0 focus-visible:outline-none">
                <div className="relative max-w-2xl mx-auto group mb-20">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40 group-focus-within:text-white/80 transition-colors" />
                  <input
                    type="text"
                    placeholder="Search for articles, features, or troubleshooting..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-14 pl-12 pr-4 bg-white/[0.03] border border-white/10 rounded-2xl text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-white/30 focus:border-white/30 focus:bg-white/[0.05] transition-all font-light text-[15px]"
                  />
                </div>

                <div className="container max-w-6xl mx-auto">
                  <AnimatePresence mode="wait">
                    {filteredCategories.length > 0 ? (
                      <motion.div 
                        key="results"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                      >
                        {filteredCategories.map((category) => (
                          <div 
                            key={category.title}
                            className="rounded-3xl border border-white/[0.07] bg-[#0a0a0a] p-8 hover:border-white/15 transition-all flex flex-col group"
                          >
                            <div className="h-12 w-12 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center mb-6 group-hover:bg-white group-hover:text-black transition-all">
                              <category.icon className="h-5 w-5 text-white/70 group-hover:text-inherit" strokeWidth={1.5} />
                            </div>
                            <h2 className="text-xl font-medium text-white mb-2">{category.title}</h2>
                            <p className="text-sm text-white/40 font-light mb-8 flex-1">
                              {category.description}
                            </p>
                            
                            <ul className="space-y-4">
                              {category.articles.map((article) => (
                                <li key={article.slug}>
                                  <Link to={`/help/${article.slug}`} className="flex items-center gap-3 text-sm text-white/60 hover:text-white transition-colors group/link">
                                    <Book className="h-4 w-4 text-white/30 group-hover/link:text-white/60 transition-colors" />
                                    {article.title}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </motion.div>
                    ) : (
                      <motion.div 
                        key="no-results"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-20"
                      >
                        <div className="h-16 w-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-white/20">
                          <SearchX className="h-8 w-8" strokeWidth={1.5} />
                        </div>
                        <h3 className="text-xl font-medium text-white mb-2">No articles found</h3>
                        <p className="text-white/40 font-light">Try searching for different keywords or check out the support section.</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </TabsContent>

              <TabsContent value="support" className="mt-0 focus-visible:outline-none">
                {isLoggedIn ? (
                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 text-left">
                    <div className="lg:col-span-3 space-y-12">
                      <SupportTicketForm />
                    </div>
                    <div className="lg:col-span-2">
                      <div className="sticky top-32">
                        <SupportTicketList />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="max-w-xl mx-auto text-center py-20 rounded-3xl border border-white/10 bg-white/[0.02]">
                    <UserCircle className="h-12 w-12 text-white/20 mx-auto mb-6" strokeWidth={1} />
                    <h2 className="text-2xl font-medium text-white mb-4">Please Sign In</h2>
                    <p className="text-white/50 font-light mb-8 px-8">
                      You need to be logged in to create and manage support tickets.
                    </p>
                    <Link to="/auth">
                      <button className="h-12 px-10 rounded-full bg-white text-black font-medium text-sm hover:bg-white/90 transition-all">
                        Sign In to Support
                      </button>
                    </Link>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* Global Footer Help */}
        {activeTab === "articles" && (
          <section className="px-4 md:px-6 mt-12">
            <div className="container max-w-4xl mx-auto text-center">
              <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-transparent p-12">
                <MessageCircle className="h-8 w-8 text-white/60 mx-auto mb-6" strokeWidth={1.5} />
                <h2 className="text-2xl font-medium text-white mb-4">Still need help?</h2>
                <p className="text-white/50 font-light mb-8 max-w-md mx-auto">
                  Can't find what you're looking for? Open a ticket or join our Discord community.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <button 
                    onClick={() => setActiveTab("support")}
                    className="h-12 px-8 rounded-full bg-white text-black font-medium text-sm hover:bg-white/90 transition-all w-full sm:w-auto"
                  >
                    Contact Support
                  </button>
                  <button className="h-12 px-8 rounded-full bg-white/5 border border-white/10 text-white font-medium text-sm hover:bg-white/10 transition-all w-full sm:w-auto">
                    Join our Discord
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default HelpCenter;
