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
          
          <h2 className="text-2xl font-medium text-white mt-12 mb-4">1. Data Controller</h2>
          <p>
            The data controller responsible for your personal information is ThumbForge. We are committed to protecting your privacy and ensuring that your personal data is handled in a safe and responsible manner in accordance with the General Data Protection Regulation (GDPR).
          </p>

          <h2 className="text-2xl font-medium text-white mt-12 mb-4">2. Information We Collect</h2>
          <p>
            When you use ThumbForge, we collect information that you provide directly to us:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Account Data:</strong> Name, email address, and authentication data (e.g., via Google or Discord).</li>
            <li><strong>Transaction Data:</strong> Information about payments you make through our Merchant of Record, Paddle. Note that we do not store your credit card details on our servers.</li>
            <li><strong>Content Data:</strong> Images you upload and prompts you enter for AI generation.</li>
            <li><strong>Usage Data:</strong> Information about how you interact with our service, including IP addresses and browser types.</li>
          </ul>

          <h2 className="text-2xl font-medium text-white mt-12 mb-4">3. How We Use Your Information</h2>
          <p>
            We use your data to:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Provide and maintain our AI generation services.</li>
            <li>Process your transactions via Paddle.</li>
            <li>Communicate with you about your account and support requests.</li>
            <li>Monitor and analyze usage to improve our platform's performance.</li>
            <li>Protect the security and integrity of our Service.</li>
          </ul>

          <h2 className="text-2xl font-medium text-white mt-12 mb-4">4. Third-Party Data Processors</h2>
          <p>
            We share your data with trusted third-party service providers who help us operate our platform:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Paddle.com:</strong> Our Merchant of Record for payment processing.</li>
            <li><strong>Supabase:</strong> For database and authentication infrastructure.</li>
            <li><strong>Adobe/Magnific AI:</strong> For processing AI generation requests (content is processed but not stored for training without your consent).</li>
          </ul>

          <h2 className="text-2xl font-medium text-white mt-12 mb-4">5. Your Data Rights (GDPR)</h2>
          <p>
            Under GDPR, you have the following rights:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>The right to access, update, or delete the information we have on you.</li>
            <li>The right of rectification if your information is inaccurate.</li>
            <li>The right to object to our processing of your personal data.</li>
            <li>The right to data portability.</li>
          </ul>
          <p>To exercise these rights, please contact us at support@thumbforge.com.</p>

          <h2 className="text-2xl font-medium text-white mt-12 mb-4">6. Cookies and Tracking</h2>
          <p>
            We use essential cookies to maintain your session and ensure the Service functions correctly. We may also use analytics cookies to understand how users interact with our site.
          </p>

          <h2 className="text-2xl font-medium text-white mt-12 mb-4">7. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at support@thumbforge.com or through our Discord community.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;

