import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { CartDrawer } from '@/components/cart-drawer'

export const metadata = {
  title: 'Privacy Policy | SHAPESHIFTERS',
  description: 'Learn how SHAPESHIFTERS collects, uses, and protects your personal information.',
}

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        {/* Hero */}
        <section className="bg-primary text-primary-foreground py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <p className="text-accent text-sm font-bold tracking-[0.2em] uppercase mb-2">
              Legal
            </p>
            <h1 className="text-4xl font-bold tracking-tight">Privacy Policy</h1>
            <p className="text-primary-foreground/70 mt-4">Last updated: March 2026</p>
          </div>
        </section>

        <section className="py-16">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 prose prose-neutral">
            <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
              <div>
                <h2 className="text-lg font-bold text-foreground mb-4">Information We Collect</h2>
                <p className="mb-4">
                  When you visit our site or make a purchase, we collect certain information about you, including:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Personal information (name, email, shipping address, phone number)</li>
                  <li>Payment information (processed securely through Stripe)</li>
                  <li>Device and browser information</li>
                  <li>Shopping preferences and order history</li>
                </ul>
              </div>

              <div>
                <h2 className="text-lg font-bold text-foreground mb-4">How We Use Your Information</h2>
                <p className="mb-4">We use the information we collect to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Process and fulfill your orders</li>
                  <li>Send order confirmations and shipping updates</li>
                  <li>Respond to your questions and requests</li>
                  <li>Improve our website and services</li>
                  <li>Send marketing communications (with your consent)</li>
                </ul>
              </div>

              <div>
                <h2 className="text-lg font-bold text-foreground mb-4">Information Sharing</h2>
                <p>
                  We do not sell, trade, or rent your personal information to third parties. 
                  We may share your information with service providers who assist us in operating 
                  our website, conducting our business, or servicing you (e.g., payment processors, 
                  shipping carriers). These parties are obligated to keep your information confidential.
                </p>
              </div>

              <div>
                <h2 className="text-lg font-bold text-foreground mb-4">Data Security</h2>
                <p>
                  We implement appropriate security measures to protect your personal information. 
                  All payment transactions are processed through Stripe and are encrypted using 
                  SSL technology. However, no method of transmission over the Internet is 100% 
                  secure, and we cannot guarantee absolute security.
                </p>
              </div>

              <div>
                <h2 className="text-lg font-bold text-foreground mb-4">Cookies</h2>
                <p>
                  We use cookies to enhance your browsing experience, analyze site traffic, 
                  and personalize content. You can control cookie preferences through your 
                  browser settings.
                </p>
              </div>

              <div>
                <h2 className="text-lg font-bold text-foreground mb-4">Your Rights</h2>
                <p className="mb-4">You have the right to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Access the personal information we hold about you</li>
                  <li>Request correction of inaccurate information</li>
                  <li>Request deletion of your information</li>
                  <li>Opt-out of marketing communications</li>
                </ul>
              </div>

              <div>
                <h2 className="text-lg font-bold text-foreground mb-4">Contact Us</h2>
                <p>
                  If you have questions about this Privacy Policy or your personal information, 
                  please contact us at privacy@shapeshifters.com.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <CartDrawer />
    </>
  )
}
