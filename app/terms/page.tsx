import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { CartDrawer } from '@/components/cart-drawer'

export const metadata = {
  title: 'Terms of Service | SHAPESHIFTERS',
  description: 'Read the terms and conditions for using the SHAPESHIFTERS website and services.',
}

export default function TermsPage() {
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
            <h1 className="text-4xl font-bold tracking-tight">Terms of Service</h1>
            <p className="text-primary-foreground/70 mt-4">Last updated: March 2026</p>
          </div>
        </section>

        <section className="py-16">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
              <div>
                <h2 className="text-lg font-bold text-foreground mb-4">1. Agreement to Terms</h2>
                <p>
                  By accessing or using the SHAPESHIFTERS website and services, you agree to be 
                  bound by these Terms of Service. If you do not agree to these terms, please 
                  do not use our services.
                </p>
              </div>

              <div>
                <h2 className="text-lg font-bold text-foreground mb-4">2. Use of Our Services</h2>
                <p className="mb-4">
                  You agree to use our website only for lawful purposes. You must not:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Use our services in any way that violates applicable laws</li>
                  <li>Attempt to gain unauthorized access to our systems</li>
                  <li>Use automated systems to access our website without permission</li>
                  <li>Interfere with the proper working of our services</li>
                </ul>
              </div>

              <div>
                <h2 className="text-lg font-bold text-foreground mb-4">3. Products and Pricing</h2>
                <p>
                  We strive to provide accurate product descriptions and pricing. However, we 
                  reserve the right to correct any errors and to change or update information 
                  at any time. Prices are subject to change without notice. We reserve the right 
                  to refuse or cancel any orders that contain pricing errors.
                </p>
              </div>

              <div>
                <h2 className="text-lg font-bold text-foreground mb-4">4. Orders and Payment</h2>
                <p>
                  When you place an order, you are making an offer to purchase. We may accept 
                  or decline your order at our discretion. Payment must be received before we 
                  ship any products. All payments are processed securely through Stripe.
                </p>
              </div>

              <div>
                <h2 className="text-lg font-bold text-foreground mb-4">5. Shipping and Delivery</h2>
                <p>
                  Shipping times are estimates and not guaranteed. We are not responsible for 
                  delays caused by shipping carriers, customs, or other factors beyond our 
                  control. Risk of loss passes to you upon delivery to the carrier.
                </p>
              </div>

              <div>
                <h2 className="text-lg font-bold text-foreground mb-4">6. Returns and Refunds</h2>
                <p>
                  Please refer to our Returns & Exchanges page for our complete return policy. 
                  All returns must comply with the conditions specified in that policy.
                </p>
              </div>

              <div>
                <h2 className="text-lg font-bold text-foreground mb-4">7. Intellectual Property</h2>
                <p>
                  All content on this website, including text, graphics, logos, images, and 
                  software, is the property of SHAPESHIFTERS and is protected by copyright 
                  and trademark laws. You may not use, reproduce, or distribute our content 
                  without our express written permission.
                </p>
              </div>

              <div>
                <h2 className="text-lg font-bold text-foreground mb-4">8. Limitation of Liability</h2>
                <p>
                  SHAPESHIFTERS shall not be liable for any indirect, incidental, special, 
                  consequential, or punitive damages arising from your use of our services 
                  or products. Our total liability shall not exceed the amount you paid for 
                  the applicable product or service.
                </p>
              </div>

              <div>
                <h2 className="text-lg font-bold text-foreground mb-4">9. Changes to Terms</h2>
                <p>
                  We reserve the right to modify these terms at any time. Changes will be 
                  effective immediately upon posting. Your continued use of our services 
                  after any changes constitutes acceptance of the new terms.
                </p>
              </div>

              <div>
                <h2 className="text-lg font-bold text-foreground mb-4">10. Contact</h2>
                <p>
                  For questions about these Terms of Service, please contact us at 
                  legal@shapeshifters.com.
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
