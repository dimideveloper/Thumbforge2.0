import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-white/20 flex flex-col">
      <Header />
      <main className="flex-1 container max-w-4xl px-4 md:px-6 pt-32 pb-24">
        <h1 className="text-4xl md:text-5xl font-medium tracking-tight mb-8">Terms of Service</h1>
        <div className="prose prose-invert max-w-none text-white/70 font-light space-y-6">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          
          <h2 className="text-2xl font-medium text-white mt-12 mb-4">1. Acceptance of Terms</h2>
          <p>
            By accessing or using ThumbForge, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the service.
          </p>

          <h2 className="text-2xl font-medium text-white mt-12 mb-4">2. Description of Service</h2>
          <p>
            ThumbForge is an AI-powered thumbnail generation and editing platform. Users consume "credits" to perform specific generations or edits. Credits are provided either monthly as part of a subscription or as one-time purchases.
          </p>

          <h2 className="text-2xl font-medium text-white mt-12 mb-4">3. User Content and Intellectual Property</h2>
          <p>
            You retain all rights to the images you upload. By generating thumbnails through our service, you are granted full commercial rights to use, edit, and distribute those generated images. You represent and warrant that you own or have the necessary licenses, rights, consents, and permissions to upload and modify the content you submit.
          </p>

          <h2 className="text-2xl font-medium text-white mt-12 mb-4">4. Acceptable Use Policy</h2>
          <p>
            You agree not to use the AI generation tools to create illegal, highly explicit, strictly NSFW, or otherwise malicious content. We reserve the right to suspend or terminate accounts that repeatedly violate these guidelines or bypass our safety filters.
          </p>

          <h2 className="text-2xl font-medium text-white mt-12 mb-4">5. Subscriptions and Refunds</h2>
          <p>
            Subscriptions are billed on a recurring basis. You may cancel at any time, and your plan will remain active until the end of the billing cycle. Due to the high computational costs of AI generation, we generally do not offer refunds for consumed credits.
          </p>

          <h2 className="text-2xl font-medium text-white mt-12 mb-4">6. Limitation of Liability</h2>
          <p>
            ThumbForge provides the service "as is." In no event shall ThumbForge or its suppliers be liable for any damages arising out of the use or inability to use the materials on the platform.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TermsOfService;
