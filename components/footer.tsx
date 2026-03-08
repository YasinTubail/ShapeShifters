import Link from 'next/link'
import Image from 'next/image'
import { Instagram, Twitter } from 'lucide-react'

const footerLinks = {
  shop: [
    { label: 'Shop All', href: '/shop' },
    { label: 'Hoodies', href: '/shop?category=Hoodies' },
    { label: 'Tees', href: '/shop?category=Tees' },
    { label: 'Bottoms', href: '/shop?category=Bottoms' },
    { label: 'Accessories', href: '/shop?category=Accessories' },
  ],
  support: [
    { label: 'Contact Us', href: '/contact' },
    { label: 'Shipping', href: '/shipping' },
    { label: 'Returns', href: '/returns' },
    { label: 'Size Guide', href: '/size-guide' },
    { label: 'FAQ', href: '/faq' },
  ],
  company: [
    { label: 'About Us', href: '/about' },
    { label: 'Sustainability', href: '/sustainability' },
    { label: 'Careers', href: '/careers' },
  ],
}

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <Image 
                src="/images/logo.png" 
                alt="SHAPESHIFTERS Logo" 
                width={44} 
                height={44} 
                className="h-11 w-11 object-contain"
              />
              <h2 className="text-xl font-bold tracking-[0.25em]" style={{ fontFamily: 'var(--font-display)' }}>SHAPESHIFTERS</h2>
            </div>
            <p className="text-primary-foreground/70 leading-relaxed max-w-sm mb-6">
              Bold streetwear for those who dare to stand out. Transform your style, shift your reality.
            </p>
            <div className="flex gap-4">
              <a href="#" className="p-2 bg-primary-foreground/10 hover:bg-accent hover:text-accent-foreground transition-colors" aria-label="Instagram">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="p-2 bg-primary-foreground/10 hover:bg-accent hover:text-accent-foreground transition-colors" aria-label="Twitter">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h3 className="text-sm font-bold tracking-[0.15em] uppercase mb-6 text-accent">Shop</h3>
            <ul className="space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href}
                    className="text-sm text-primary-foreground/70 hover:text-accent transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-bold tracking-[0.15em] uppercase mb-6 text-accent">Support</h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href}
                    className="text-sm text-primary-foreground/70 hover:text-accent transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-bold tracking-[0.15em] uppercase mb-6 text-accent">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href}
                    className="text-sm text-primary-foreground/70 hover:text-accent transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <div className="border-t border-primary-foreground/20 mt-16 pt-12">
          <div className="max-w-md">
            <h3 className="text-sm font-bold tracking-[0.15em] uppercase mb-4 text-accent">Join the Movement</h3>
            <p className="text-sm text-primary-foreground/70 mb-6">
              Get early access to drops, exclusive offers, and shifter updates.
            </p>
            <form className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 bg-primary-foreground/10 border border-primary-foreground/20 px-4 py-3 text-sm placeholder:text-primary-foreground/50 focus:outline-none focus:border-accent text-primary-foreground"
              />
              <button
                type="submit"
                className="bg-accent text-accent-foreground px-6 py-3 text-sm font-bold tracking-wide hover:bg-accent/90 transition-colors uppercase"
              >
                Join
              </button>
            </form>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-primary-foreground/20 mt-12 pt-8 flex flex-col sm:flex-row justify-between gap-4 text-sm text-primary-foreground/50">
          <p>2026 SHAPESHIFTERS. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-accent transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-accent transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
