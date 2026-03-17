import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-white/20 flex flex-col">
      <Header />
      <main className="flex-1 container max-w-4xl px-4 md:px-6 pt-32 pb-24">
        <h1 className="text-4xl md:text-5xl font-medium tracking-tight mb-8">Privacy Policy</h1>
        <div className="prose prose-invert max-w-none text-white/70 font-light space-y-6">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          
          <h2 className="text-2xl font-medium text-white mt-12 mb-4">1. Information We Collect</h2>
          <p>
            When you use ThumbForge, we collect information that you provide directly to us, such as when you create an account, subscribe to our service, or communicate with us. This may include your name, email address, profile picture from third-party logins (like Discord/Google), and any other information you choose to provide.
          </p>

          <h2 className="text-2xl font-medium text-white mt-12 mb-4">2. Uploaded Content and AI Generation</h2>
          <p>
            The images you upload and the prompts you enter are processed by our servers and third-party AI providers to generate your thumbnails. We do not use your private uploaded images to train our AI models without your explicit consent. Generated thumbnails are stored securely in your private gallery.
          </p>

          <h2 className="text-2xl font-medium text-white mt-12 mb-4">3. Data Usage and Analytics</h2>
          <p>
            We use the information we collect to provide, maintain, and improve our services, to process transactions, to send you related information, including confirmations and receipts, and to monitor and analyze trends and usage.
          </p>

          <h2 className="text-2xl font-medium text-white mt-12 mb-4">4. Third-Party Services</h2>
          <p>
            We may use third-party service providers to process payments (e.g., Whop/Stripe) or provide infrastructure (e.g., Supabase). These third parties have access to your Personal Information only to perform these tasks on our behalf and are obligated not to disclose or use it for any other purpose.
          </p>

          <h2 className="text-2xl font-medium text-white mt-12 mb-4">5. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us through our Discord community or via the support channels in your dashboard.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
