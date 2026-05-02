import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";

const RefundPolicy = () => {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-white/20 flex flex-col">
      <Header />
      <main className="flex-1 container max-w-4xl px-4 md:px-6 pt-32 pb-24">
        <h1 className="text-4xl md:text-5xl font-medium tracking-tight mb-8">Refund Policy</h1>
        <div className="prose prose-invert max-w-none text-white/70 font-light space-y-6">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          
          <h2 className="text-2xl font-medium text-white mt-12 mb-4">1. General Policy</h2>
          <p>
            At ThumbForge, we strive to provide the highest quality AI-powered thumbnail generation services. Due to the high computational costs associated with generating AI content, we have a specific refund policy for our subscriptions and one-time credit purchases.
          </p>

          <h2 className="text-2xl font-medium text-white mt-12 mb-4">2. Digital Goods and Performance</h2>
          <p>
            By purchasing a subscription or credits on ThumbForge, you acknowledge and agree that your access to the service and the generation of AI content constitutes a digital service. Under European Union consumer law, the right of withdrawal expires once the performance of the service has begun with your prior express consent and acknowledgment that you thereby lose your right of withdrawal.
          </p>

          <h2 className="text-2xl font-medium text-white mt-12 mb-4">3. Eligibility for Refunds</h2>
          <p>
            Refunds may be granted under the following circumstances:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Technical failures on our side that prevented you from using the credits you purchased.</li>
            <li>Duplicate charges due to a billing error.</li>
            <li>Requests made within 14 days of purchase, provided that **no credits have been consumed** and no AI generations have been performed.</li>
          </ul>

          <h2 className="text-2xl font-medium text-white mt-12 mb-4">4. Non-Refundable Items</h2>
          <p>
            We cannot offer refunds if:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Credits have already been consumed for AI generations or edits.</li>
            <li>You are dissatisfied with the artistic output of the AI (as AI outputs are non-deterministic and subjective).</li>
            <li>Your account has been terminated due to a violation of our Terms of Service.</li>
          </ul>

          <h2 className="text-2xl font-medium text-white mt-12 mb-4">5. Subscription Cancellations</h2>
          <p>
            You may cancel your subscription at any time through your account settings or our payment provider (Paddle). Upon cancellation, you will retain access to your plan's benefits until the end of your current billing period. No partial refunds are provided for the remaining days of a billing cycle.
          </p>

          <h2 className="text-2xl font-medium text-white mt-12 mb-4">6. How to Request a Refund</h2>
          <p>
            To request a refund, please contact our support team via Discord or email us at support@thumbforge.com. Please include your order ID and the reason for your request. All refund requests are reviewed on a case-by-case basis.
          </p>

          <h2 className="text-2xl font-medium text-white mt-12 mb-4">7. Merchant of Record</h2>
          <p>
            Our order process is conducted by our online reseller Paddle.com. Paddle.com is the Merchant of Record for all our orders. Paddle provides all customer service inquiries and handles returns.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RefundPolicy;
