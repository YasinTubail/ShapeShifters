import Link from 'next/link'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { CartDrawer } from '@/components/cart-drawer'
import { Button } from '@/components/ui/button'
import { RotateCcw, CheckCircle, XCircle } from 'lucide-react'

export const metadata = {
  title: 'Returns & Exchanges | SHAPESHIFTERS',
  description: 'Learn about our 30-day return policy and how to exchange items.',
}

export default function ReturnsPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        {/* Hero */}
        <section className="bg-primary text-primary-foreground py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <p className="text-accent text-sm font-bold tracking-[0.2em] uppercase mb-2">
              Easy Returns
            </p>
            <h1 className="text-4xl font-bold tracking-tight">Returns & Exchanges</h1>
          </div>
        </section>

        <section className="py-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            {/* Overview */}
            <div className="bg-secondary p-8 mb-12 flex items-start gap-6">
              <RotateCcw className="h-12 w-12 text-accent flex-shrink-0" />
              <div>
                <h2 className="text-xl font-bold mb-2">30-Day Hassle-Free Returns</h2>
                <p className="text-muted-foreground">
                  Not completely satisfied? No problem. We accept returns and exchanges 
                  within 30 days of delivery. Items must be unworn, unwashed, and in 
                  original condition with tags attached.
                </p>
              </div>
            </div>

            {/* Eligible vs Not Eligible */}
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div className="border border-accent p-6">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="h-5 w-5 text-accent" />
                  <h3 className="font-bold">Eligible for Return</h3>
                </div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>Unworn items with tags attached</li>
                  <li>Items in original packaging</li>
                  <li>Items returned within 30 days</li>
                  <li>Full-price items</li>
                  <li>Items with manufacturing defects</li>
                </ul>
              </div>
              <div className="border border-destructive/50 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <XCircle className="h-5 w-5 text-destructive" />
                  <h3 className="font-bold">Not Eligible</h3>
                </div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>Worn, washed, or altered items</li>
                  <li>Items without tags</li>
                  <li>Items returned after 30 days</li>
                  <li>Final sale items</li>
                  <li>Gift cards</li>
                </ul>
              </div>
            </div>

            {/* Steps */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6">How to Return</h2>
              <div className="space-y-6">
                {[
                  {
                    step: '01',
                    title: 'Start Your Return',
                    desc: 'Contact our support team at support@shapeshifters.com with your order number and reason for return.',
                  },
                  {
                    step: '02',
                    title: 'Get Your Label',
                    desc: 'We will email you a prepaid shipping label within 24 hours. Print it and attach it to your package.',
                  },
                  {
                    step: '03',
                    title: 'Ship It Back',
                    desc: 'Drop off your package at any USPS location. Keep your tracking number for reference.',
                  },
                  {
                    step: '04',
                    title: 'Get Refunded',
                    desc: 'Once we receive and inspect your return, we will process your refund within 5-7 business days.',
                  },
                ].map((item) => (
                  <div key={item.step} className="flex gap-6">
                    <div className="w-12 h-12 bg-accent text-accent-foreground flex items-center justify-center font-bold flex-shrink-0">
                      {item.step}
                    </div>
                    <div>
                      <h3 className="font-bold mb-1">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="bg-primary text-primary-foreground p-8 text-center">
              <h3 className="text-xl font-bold mb-2">Need Help?</h3>
              <p className="text-primary-foreground/70 mb-6">
                Our team is here to make returns easy.
              </p>
              <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
                <Link href="/contact">Contact Support</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <CartDrawer />
    </>
  )
}
