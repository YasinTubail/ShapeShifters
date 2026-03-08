import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { CartDrawer } from '@/components/cart-drawer'
import { Button } from '@/components/ui/button'
import { Instagram, Mail, MapPin, Phone } from 'lucide-react'

export const metadata = {
  title: 'Contact | SHAPESHIFTERS',
  description: 'Get in touch with the SHAPESHIFTERS team. We are here to help.',
}

export default function ContactPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        {/* Hero */}
        <section className="bg-primary text-primary-foreground py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <p className="text-accent text-sm font-bold tracking-[0.2em] uppercase mb-2">
              Get In Touch
            </p>
            <h1 className="text-4xl font-bold tracking-tight">Contact Us</h1>
          </div>
        </section>

        <section className="py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16">
              {/* Contact Form */}
              <div>
                <h2 className="text-2xl font-bold mb-6">Send us a message</h2>
                <form className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">First Name</label>
                      <input
                        type="text"
                        className="w-full border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:border-accent"
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Last Name</label>
                      <input
                        type="text"
                        className="w-full border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:border-accent"
                        placeholder="Doe"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <input
                      type="email"
                      className="w-full border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:border-accent"
                      placeholder="john@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Subject</label>
                    <select className="w-full border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:border-accent">
                      <option>Order Inquiry</option>
                      <option>Returns & Exchanges</option>
                      <option>Product Question</option>
                      <option>Wholesale Inquiry</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Message</label>
                    <textarea
                      rows={5}
                      className="w-full border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:border-accent resize-none"
                      placeholder="How can we help you?"
                    />
                  </div>
                  <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90">
                    Send Message
                  </Button>
                </form>
              </div>

              {/* Contact Info */}
              <div>
                <h2 className="text-2xl font-bold mb-6">Get in touch</h2>
                <p className="text-muted-foreground mb-8">
                  Have a question about your order, a product, or just want to say hi? 
                  We&apos;d love to hear from you.
                </p>
                
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-secondary flex items-center justify-center flex-shrink-0">
                      <Mail className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-bold mb-1">Email</h3>
                      <p className="text-muted-foreground text-sm">support@shapeshifters.com</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-secondary flex items-center justify-center flex-shrink-0">
                      <Phone className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-bold mb-1">Phone / WhatsApp</h3>
                      <a href="tel:+905078059057" className="text-muted-foreground text-sm hover:text-accent transition-colors">+90 507 805 90 57</a>
                      <p className="text-muted-foreground text-xs mt-0.5">Mon–Sat, 9:00–20:00 (TR)</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-secondary flex items-center justify-center flex-shrink-0">
                      <Instagram className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-bold mb-1">Instagram</h3>
                      <a href="https://www.instagram.com/shapeshifter_tr/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground text-sm hover:text-accent transition-colors">@shapeshifter_tr</a>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-secondary flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-bold mb-1">Location</h3>
                      <p className="text-muted-foreground text-sm">Turkey</p>
                    </div>
                  </div>
                </div>

                <div className="mt-12 p-6 bg-secondary">
                  <h3 className="font-bold mb-2">Response Time</h3>
                  <p className="text-sm text-muted-foreground">
                    We typically respond within 24 hours. For the fastest reply,
                    reach us on Instagram or WhatsApp.
                  </p>
                </div>
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
