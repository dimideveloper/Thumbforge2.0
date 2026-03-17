import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Book, Wand2, CreditCard, UserCircle, MessageCircle } from "lucide-react";

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

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white/20 flex flex-col">
      <Header />
      
      <main className="flex-1 pt-32 pb-24">
        {/* Search Hero */}
        <section className="px-4 md:px-6 mb-20">
          <div className="container max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-medium tracking-tight mb-6">
              How can we help?
            </h1>
            <p className="text-white/50 text-lg font-light mb-10">
              Browse our knowledge base or search for specific answers.
            </p>
            
            <div className="relative max-w-2xl mx-auto group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40 group-focus-within:text-white/80 transition-colors" />
              <input
                type="text"
                placeholder="Search for articles, features, or troubleshooting..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-14 pl-12 pr-4 bg-white/[0.03] border border-white/10 rounded-2xl text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-white/30 focus:border-white/30 focus:bg-white/[0.05] transition-all font-light text-[15px]"
              />
            </div>
          </div>
        </section>

        {/* Categories Grid */}
        <section className="px-4 md:px-6">
          <div className="container max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category) => (
                <div 
                  key={category.title}
                  className="rounded-3xl border border-white/[0.07] bg-[#0a0a0a] p-8 hover:border-white/15 transition-colors flex flex-col"
                >
                  <div className="h-12 w-12 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center mb-6">
                    <category.icon className="h-5 w-5 text-white/70" strokeWidth={1.5} />
                  </div>
                  <h2 className="text-xl font-medium text-white mb-2">{category.title}</h2>
                  <p className="text-sm text-white/40 font-light mb-8 flex-1">
                    {category.description}
                  </p>
                  
                  <ul className="space-y-4">
                    {category.articles.map((article) => (
                      <li key={article.slug}>
                        <Link to={`/help/${article.slug}`} className="flex items-center gap-3 text-sm text-white/60 hover:text-white transition-colors group">
                          <Book className="h-4 w-4 text-white/30 group-hover:text-white/60 transition-colors" />
                          {article.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                  
                  <a href="#" className="inline-flex mt-8 text-sm font-medium text-white/50 hover:text-white transition-colors">
                    View all {category.articles.length} articles →
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Support */}
        <section className="px-4 md:px-6 mt-24">
          <div className="container max-w-3xl mx-auto text-center">
            <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-transparent p-12">
              <MessageCircle className="h-8 w-8 text-white/60 mx-auto mb-6" strokeWidth={1.5} />
              <h2 className="text-2xl font-medium text-white mb-4">Still need help?</h2>
              <p className="text-white/50 font-light mb-8 max-w-md mx-auto">
                Can't find what you're looking for? Our support team and community are here to help.
              </p>
              <button className="h-12 px-8 rounded-full bg-white text-black font-medium text-sm hover:bg-white/90 transition-colors">
                Join our Discord
              </button>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
};

export default HelpCenter;
